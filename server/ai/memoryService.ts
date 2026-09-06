import fs from 'fs';
import path from 'path';
import { FarmerAIMemory, AIMemoryType, FactVerificationLevel } from './types';

const MEMORY_FILE_PATH = path.join(process.cwd(), 'data', 'farmer_ai_memory.json');

// Ensure data folder exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  try {
    fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
  } catch (e) {
    console.error('Failed to create data directory:', e);
  }
}

// In-memory memory store indexed strictly by farmerId
let memoryStore: Map<string, FarmerAIMemory[]> = new Map();

function loadMemoryFromFile() {
  try {
    if (fs.existsSync(MEMORY_FILE_PATH)) {
      const raw = fs.readFileSync(MEMORY_FILE_PATH, 'utf-8');
      const list: any[] = JSON.parse(raw);
      memoryStore.clear();
      for (const item of list) {
        const memory: FarmerAIMemory = {
          id: item.id,
          farmerId: item.farmerId,
          agentId: item.agentId,
          memoryType: item.memoryType,
          memoryKey: item.memoryKey,
          memoryValue: item.memoryValue,
          source: item.source || 'AUTOMATED_INTERACTION',
          confidence: typeof item.confidence === 'number' ? item.confidence : 0.95,
          verificationLevel: item.verificationLevel || 'AI_INFERRED',
          decayHalfLifeDays: item.decayHalfLifeDays,
          isActive: item.isActive !== undefined ? item.isActive : true,
          supersededBy: item.supersededBy,
          auditTrail: Array.isArray(item.auditTrail) ? item.auditTrail : [],
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString()
        };
        const existing = memoryStore.get(memory.farmerId) || [];
        existing.push(memory);
        memoryStore.set(memory.farmerId, existing);
      }
    }
  } catch (err) {
    console.error('Error loading farmer AI memory file:', err);
  }
}

function saveMemoryToFile() {
  try {
    const all: FarmerAIMemory[] = [];
    for (const list of memoryStore.values()) {
      all.push(...list);
    }
    fs.writeFileSync(MEMORY_FILE_PATH, JSON.stringify(all, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving farmer AI memory file:', err);
  }
}

// Initialize on boot
loadMemoryFromFile();

export class MemoryService {
  /**
   * Calculates time-decayed confidence based on memory category half-life.
   */
  static calculateDecayedConfidence(memory: FarmerAIMemory): number {
    const now = Date.now();
    const created = new Date(memory.updatedAt || memory.createdAt).getTime();
    const ageInDays = Math.max(0, (now - created) / (1000 * 3600 * 24));

    // Determine half-life based on agronomic decay rates
    let halfLifeDays = memory.decayHalfLifeDays || 180;
    const type = memory.memoryType as string;

    if (type.includes('environmental') || type.includes('weather')) {
      halfLifeDays = 2; // Weather changes in 48 hours
    } else if (type.includes('soil')) {
      halfLifeDays = 180; // Soil chemistry stable for ~6 months
    } else if (type.includes('crop')) {
      halfLifeDays = 120; // Seasonal crop cycle ~4 months
    } else if (type.includes('profile') || type.includes('farm')) {
      halfLifeDays = 365; // Farm size, land profile stable for years
    } else if (type.includes('observation')) {
      halfLifeDays = 14; // Pest/field observation valid ~2 weeks
    }

    // Exponential decay: C(t) = C0 * (0.5)^(t / t_half)
    const decayed = memory.confidence * Math.pow(0.5, ageInDays / halfLifeDays);
    return Math.min(1.0, Math.max(0.1, Number(decayed.toFixed(2))));
  }

  /**
   * Retrieves all memories for a specific farmer. Strictly isolated at query level.
   */
  static getMemoriesByFarmer(
    farmerId: string,
    options?: { onlyActive?: boolean; applyDecay?: boolean }
  ): FarmerAIMemory[] {
    if (!farmerId) return [];
    // Strict farmer_id index query
    const list = memoryStore.get(farmerId) || [];
    const onlyActive = options?.onlyActive ?? false;
    const applyDecay = options?.applyDecay ?? true;

    let filtered = onlyActive ? list.filter((m) => m.isActive) : [...list];

    if (applyDecay) {
      filtered = filtered.map((m) => ({
        ...m,
        confidence: this.calculateDecayedConfidence(m)
      }));
    }

    return filtered;
  }

  /**
   * Cross-tenant memory leak test method.
   * Verifies that Farmer A never retrieves any record with a different farmerId.
   */
  static verifyNoCrossTenantLeakage(farmerIdA: string, farmerIdB: string): {
    isIsolated: boolean;
    leakedCount: number;
    auditStatus: string;
  } {
    if (!farmerIdA || !farmerIdB) {
      return { isIsolated: true, leakedCount: 0, auditStatus: 'SKIPPED_EMPTY_IDS' };
    }

    const memoriesA = this.getMemoriesByFarmer(farmerIdA, { onlyActive: false, applyDecay: false });
    const crossLeakA = memoriesA.filter((m) => m.farmerId !== farmerIdA);

    const memoriesB = this.getMemoriesByFarmer(farmerIdB, { onlyActive: false, applyDecay: false });
    const crossLeakB = memoriesB.filter((m) => m.farmerId !== farmerIdB);

    const totalLeaks = crossLeakA.length + crossLeakB.length;
    return {
      isIsolated: totalLeaks === 0,
      leakedCount: totalLeaks,
      auditStatus: totalLeaks === 0 ? 'PASSED_STRICT_TENANT_ISOLATION' : 'FAILED_CROSS_TENANT_LEAK'
    };
  }

  /**
   * Retrieves filtered memories by category.
   */
  static getMemoriesByType(farmerId: string, memoryType: AIMemoryType, onlyActive: boolean = true): FarmerAIMemory[] {
    const list = this.getMemoriesByFarmer(farmerId, { onlyActive });
    return list.filter((m) => m.memoryType === memoryType);
  }

  /**
   * Returns a structured categorized memory summary for high-performance context injection.
   */
  static getStructuredMemoryMap(farmerId: string): {
    farmerProfile: Record<string, any>;
    soilMemory: Record<string, any>;
    cropMemory: Record<string, any>;
    advisoryMemory: any[];
    environmentalMemory: Record<string, any>;
    conversationMemory: any[];
  } {
    const activeMemories = this.getMemoriesByFarmer(farmerId, { onlyActive: true, applyDecay: true });
    const result = {
      farmerProfile: {} as Record<string, any>,
      soilMemory: {} as Record<string, any>,
      cropMemory: {} as Record<string, any>,
      advisoryMemory: [] as any[],
      environmentalMemory: {} as Record<string, any>,
      conversationMemory: [] as any[]
    };

    for (const m of activeMemories) {
      if (m.memoryType === 'farmer_profile' || m.memoryType === 'identity' || m.memoryType === 'farm') {
        result.farmerProfile[m.memoryKey] = m.memoryValue;
      } else if (m.memoryType === 'soil_memory' || m.memoryKey.startsWith('soil_')) {
        result.soilMemory[m.memoryKey] = m.memoryValue;
      } else if (m.memoryType === 'crop_memory' || m.memoryType === 'crops' || m.memoryKey.startsWith('crop_')) {
        result.cropMemory[m.memoryKey] = m.memoryValue;
      } else if (m.memoryType === 'advisory_memory' || m.memoryType === 'actions') {
        result.advisoryMemory.push({ key: m.memoryKey, value: m.memoryValue, confidence: m.confidence, date: m.updatedAt });
      } else if (m.memoryType === 'environmental_memory' || m.memoryKey.startsWith('weather_') || m.memoryKey.startsWith('irrigation_')) {
        result.environmentalMemory[m.memoryKey] = m.memoryValue;
      } else if (m.memoryType === 'conversation_memory' || m.memoryType === 'conversation') {
        result.conversationMemory.push(m.memoryValue);
      }
    }

    return result;
  }

  /**
   * Upsert a memory key-value fact for a farmer.
   * If an active memory of the same type and key exists, supersedes it cleanly with audit trail.
   */
  static upsertMemory(
    farmerId: string,
    agentId: string,
    memoryType: AIMemoryType,
    memoryKey: string,
    memoryValue: any,
    source: string = 'AUTOMATED_INTERACTION',
    confidence: number = 0.95,
    verificationLevel: FactVerificationLevel = 'AI_INFERRED'
  ): FarmerAIMemory {
    if (!farmerId) throw new Error('farmerId is required for memory storage');

    // Strip sensitive fields if any were passed
    if (typeof memoryValue === 'object' && memoryValue !== null) {
      delete memoryValue.password;
      delete memoryValue.token;
      delete memoryValue.secret;
    }

    const currentList = memoryStore.get(farmerId) || [];
    const now = new Date().toISOString();
    const newId = `MEM-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Find any existing active memory with matching key and type
    const existingActiveIndex = currentList.findIndex(
      (m) => m.isActive && m.memoryType === memoryType && m.memoryKey.toLowerCase() === memoryKey.toLowerCase()
    );

    if (existingActiveIndex >= 0) {
      // Supersede the existing memory with audit trail
      const oldMemory = currentList[existingActiveIndex];
      oldMemory.isActive = false;
      oldMemory.supersededBy = newId;
      oldMemory.updatedAt = now;
      oldMemory.auditTrail = oldMemory.auditTrail || [];
      oldMemory.auditTrail.push(`Superseded by ${newId} on ${now}`);
      currentList[existingActiveIndex] = oldMemory;
    }

    const record: FarmerAIMemory = {
      id: newId,
      farmerId,
      agentId,
      memoryType,
      memoryKey,
      memoryValue,
      source,
      confidence: Math.min(Math.max(confidence, 0.1), 1.0),
      verificationLevel,
      isActive: true,
      auditTrail: [`Created by ${agentId} (${verificationLevel}) on ${now}`],
      createdAt: now,
      updatedAt: now
    };

    currentList.push(record);
    memoryStore.set(farmerId, currentList);
    saveMemoryToFile();
    return record;
  }

  /**
   * Bulk add or update memories from interaction analysis.
   */
  static recordExtractedFacts(
    farmerId: string,
    agentId: string,
    facts: Array<{
      type: AIMemoryType;
      key: string;
      value: any;
      confidence?: number;
      source?: string;
      verificationLevel?: FactVerificationLevel;
    }>
  ) {
    if (!farmerId || !Array.isArray(facts)) return;
    for (const f of facts) {
      this.upsertMemory(
        farmerId,
        agentId,
        f.type,
        f.key,
        f.value,
        f.source || 'AI_EXTRACTION',
        f.confidence || 0.9,
        f.verificationLevel || 'AI_INFERRED'
      );
    }
  }

  /**
   * Delete a specific memory item with audit trail.
   */
  static deleteMemory(farmerId: string, memoryId: string, reason?: string): boolean {
    const list = memoryStore.get(farmerId);
    if (!list) return false;
    const targetIndex = list.findIndex((m) => m.id === memoryId);
    if (targetIndex >= 0) {
      // Soft-delete with audit marking
      const target = list[targetIndex];
      target.isActive = false;
      target.auditTrail = target.auditTrail || [];
      target.auditTrail.push(`Deactivated on ${new Date().toISOString()}: ${reason || 'User/Admin requested removal'}`);
      target.updatedAt = new Date().toISOString();
      list[targetIndex] = target;
      memoryStore.set(farmerId, list);
      saveMemoryToFile();
      return true;
    }
    return false;
  }
}


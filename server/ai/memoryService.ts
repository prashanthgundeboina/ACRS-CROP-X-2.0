import fs from 'fs';
import path from 'path';
import { FarmerAIMemory, AIMemoryType } from './types';

const MEMORY_FILE_PATH = path.join(process.cwd(), 'data', 'farmer_ai_memory.json');

// Ensure data folder exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  try {
    fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
  } catch (e) {
    console.error('Failed to create data directory:', e);
  }
}

// In-memory memory store indexed by farmerId
let memoryStore: Map<string, FarmerAIMemory[]> = new Map();

function loadMemoryFromFile() {
  try {
    if (fs.existsSync(MEMORY_FILE_PATH)) {
      const raw = fs.readFileSync(MEMORY_FILE_PATH, 'utf-8');
      const list: FarmerAIMemory[] = JSON.parse(raw);
      memoryStore.clear();
      for (const item of list) {
        const existing = memoryStore.get(item.farmerId) || [];
        existing.push(item);
        memoryStore.set(item.farmerId, existing);
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
   * Retrieves all memories for a specific farmer. Strictly isolated.
   */
  static getMemoriesByFarmer(farmerId: string): FarmerAIMemory[] {
    if (!farmerId) return [];
    return memoryStore.get(farmerId) || [];
  }

  /**
   * Retrieves filtered memories by category.
   */
  static getMemoriesByType(farmerId: string, memoryType: AIMemoryType): FarmerAIMemory[] {
    const list = this.getMemoriesByFarmer(farmerId);
    return list.filter((m) => m.memoryType === memoryType);
  }

  /**
   * Upsert a memory key-value fact for a farmer.
   */
  static upsertMemory(
    farmerId: string,
    agentId: string,
    memoryType: AIMemoryType,
    memoryKey: string,
    memoryValue: any,
    source: string = 'AUTOMATED_INTERACTION',
    confidence: number = 0.95
  ): FarmerAIMemory {
    if (!farmerId) throw new Error('farmerId is required for memory storage');

    // Strip sensitive fields if any were passed
    if (typeof memoryValue === 'object' && memoryValue !== null) {
      delete memoryValue.password;
      delete memoryValue.token;
      delete memoryValue.secret;
    }

    const currentList = memoryStore.get(farmerId) || [];
    const existingIndex = currentList.findIndex(
      (m) => m.memoryType === memoryType && m.memoryKey.toLowerCase() === memoryKey.toLowerCase()
    );

    const now = new Date().toISOString();
    let record: FarmerAIMemory;

    if (existingIndex >= 0) {
      record = {
        ...currentList[existingIndex],
        agentId,
        memoryValue,
        source,
        confidence,
        updatedAt: now
      };
      currentList[existingIndex] = record;
    } else {
      record = {
        id: `MEM-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        farmerId,
        agentId,
        memoryType,
        memoryKey,
        memoryValue,
        source,
        confidence,
        createdAt: now,
        updatedAt: now
      };
      currentList.push(record);
    }

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
    facts: Array<{ type: AIMemoryType; key: string; value: any; confidence?: number; source?: string }>
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
        f.confidence || 0.9
      );
    }
  }

  /**
   * Delete a specific memory item.
   */
  static deleteMemory(farmerId: string, memoryId: string): boolean {
    const list = memoryStore.get(farmerId);
    if (!list) return false;
    const initialLen = list.length;
    const updated = list.filter((m) => m.id !== memoryId);
    if (updated.length !== initialLen) {
      memoryStore.set(farmerId, updated);
      saveMemoryToFile();
      return true;
    }
    return false;
  }
}

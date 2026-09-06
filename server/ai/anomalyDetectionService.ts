import fs from 'fs';
import path from 'path';
import { AIAnomaly, AIAnomalyType } from './types';
import { FarmerAgentService } from './farmerAgentService';

const ANOMALIES_FILE_PATH = path.join(process.cwd(), 'data', 'ai_anomalies.json');

// Ensure data folder exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  try {
    fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
  } catch (e) {
    console.error('Failed to create data directory:', e);
  }
}

let anomaliesStore: AIAnomaly[] = [];

function loadAnomaliesFromFile() {
  try {
    if (fs.existsSync(ANOMALIES_FILE_PATH)) {
      const raw = fs.readFileSync(ANOMALIES_FILE_PATH, 'utf-8');
      anomaliesStore = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading AI anomalies file:', err);
  }
}

function saveAnomaliesToFile() {
  try {
    fs.writeFileSync(ANOMALIES_FILE_PATH, JSON.stringify(anomaliesStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving AI anomalies file:', err);
  }
}

loadAnomaliesFromFile();

export class AnomalyDetectionService {
  /**
   * Record a newly detected AI anomaly.
   */
  static recordAnomaly(
    anomalyType: AIAnomalyType,
    severity: 'WARNING' | 'CRITICAL',
    details: string,
    agentId?: string,
    farmerId?: string
  ): AIAnomaly {
    const anomaly: AIAnomaly = {
      id: `ANOM-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      anomalyType,
      severity,
      details,
      agentId,
      farmerId,
      detectedAt: new Date().toISOString(),
      resolved: false
    };

    anomaliesStore.unshift(anomaly);
    if (anomaliesStore.length > 200) anomaliesStore = anomaliesStore.slice(0, 200);
    saveAnomaliesToFile();

    FarmerAgentService.logAuditEvent('ANOMALY_DETECTED', 'ANOMALY_ENGINE', 'system', agentId, {
      anomalyType,
      severity,
      details,
      farmerId
    });

    return anomaly;
  }

  /**
   * Get all anomalies.
   */
  static getAnomalies(onlyUnresolved: boolean = false): AIAnomaly[] {
    if (onlyUnresolved) {
      return anomaliesStore.filter((a) => !a.resolved);
    }
    return anomaliesStore;
  }

  /**
   * Resolve an anomaly.
   */
  static resolveAnomaly(anomalyId: string): boolean {
    const found = anomaliesStore.find((a) => a.id === anomalyId);
    if (found) {
      found.resolved = true;
      found.resolvedAt = new Date().toISOString();
      saveAnomaliesToFile();
      return true;
    }
    return false;
  }

  /**
   * Perform automated diagnostic health scan.
   */
  static runDiagnosticScan(): {
    anomaliesDetected: number;
    healthStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
    metrics: Record<string, any>;
  } {
    const unresolved = anomaliesStore.filter((a) => !a.resolved);
    const criticalCount = unresolved.filter((a) => a.severity === 'CRITICAL').length;

    let healthStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' = 'HEALTHY';
    if (criticalCount > 0) {
      healthStatus = 'CRITICAL';
    } else if (unresolved.length > 0) {
      healthStatus = 'DEGRADED';
    }

    return {
      anomaliesDetected: unresolved.length,
      healthStatus,
      metrics: {
        totalUnresolved: unresolved.length,
        criticalCount,
        warningCount: unresolved.length - criticalCount,
        lastScanTime: new Date().toISOString()
      }
    };
  }
}

import { FarmAuditLogRecord, FarmAgentId } from '../../types/autonomous/farmAutonomousTypes';

const AUDIT_LOG_KEY = 'croperx_farm_audit_log';

class FarmAuditLogService {
  private logs: FarmAuditLogRecord[] = [];

  constructor() {
    this.loadLogs();
    if (this.logs.length === 0) {
      this.initDefaultLogs();
    }
  }

  private loadLogs() {
    try {
      const saved = localStorage.getItem(AUDIT_LOG_KEY);
      if (saved) {
        this.logs = JSON.parse(saved);
      }
    } catch {
      this.logs = [];
    }
  }

  private saveLogs() {
    try {
      localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(this.logs));
    } catch (e) {
      console.warn('Error saving farm audit logs:', e);
    }
  }

  private initDefaultLogs() {
    this.logs = [
      {
        id: 'audit-001',
        timestamp: 'Today, 08:30 AM',
        triggeredEvent: 'soil_moisture_changed (24% in North Block)',
        agentsActivated: ['irrigation', 'weather', 'crop_health', 'iot_health'],
        telemetrySnapshot: { soilMoisture: 24, tempC: 28, rainProb: 15 },
        supervisorRecommendation: 'Run 40-min drip irrigation to replenish root zone.',
        riskLevel: 'MEDIUM',
        permissionRequested: 'Supervised Farmer Authorization',
        farmerDecision: 'Approved',
        actionPerformed: 'Started 3HP Borewell Pump for Zone A',
        verificationResult: 'Telemetry verified +19% soil moisture response within 45 mins'
      },
      {
        id: 'audit-002',
        timestamp: 'Yesterday, 04:15 PM',
        triggeredEvent: 'heavy_rain_forecast (14mm expected)',
        agentsActivated: ['weather', 'irrigation', 'soil', 'pest_disease'],
        telemetrySnapshot: { rainForecastMm: 14, humidity: 78 },
        supervisorRecommendation: 'Postpone scheduled evening fertigation & irrigation cycle.',
        riskLevel: 'LOW',
        permissionRequested: 'Advisory Notification',
        farmerDecision: 'Approved',
        actionPerformed: 'Fertigation cycle paused',
        verificationResult: 'Nutrient runoff avoided; natural rainfall recorded at 12.8mm'
      }
    ];
    this.saveLogs();
  }

  public getLogs(): FarmAuditLogRecord[] {
    return [...this.logs];
  }

  public recordLog(log: Omit<FarmAuditLogRecord, 'id'>): FarmAuditLogRecord {
    const newLog: FarmAuditLogRecord = {
      ...log,
      id: `audit-${Date.now()}`
    };
    this.logs.unshift(newLog);
    if (this.logs.length > 50) {
      this.logs.pop();
    }
    this.saveLogs();
    return newLog;
  }
}

export const farmAuditLogService = new FarmAuditLogService();

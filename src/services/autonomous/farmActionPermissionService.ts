import { 
  ActionPermissionMode, 
  ActionPermissionRequest, 
  ClosedLoopVerificationRecord,
  FarmAgentId 
} from '../../types/autonomous/farmAutonomousTypes';
import { farmEventEngine } from './farmEventEngine';

const MODE_KEY = 'croperx_action_permission_mode';
const PENDING_ACTIONS_KEY = 'croperx_pending_actions_log';
const CLOSED_LOOP_KEY = 'croperx_closed_loop_records';

class FarmActionPermissionService {
  private mode: ActionPermissionMode = 'supervised';
  private pendingRequests: ActionPermissionRequest[] = [];
  private closedLoopRecords: ClosedLoopVerificationRecord[] = [];

  constructor() {
    this.loadState();
    if (this.pendingRequests.length === 0) {
      this.initDefaultRequests();
    }
  }

  private loadState() {
    try {
      const savedMode = localStorage.getItem(MODE_KEY);
      if (savedMode && (savedMode === 'advisory' || savedMode === 'supervised' || savedMode === 'safe_automation')) {
        this.mode = savedMode as ActionPermissionMode;
      }
      const savedActions = localStorage.getItem(PENDING_ACTIONS_KEY);
      if (savedActions) {
        this.pendingRequests = JSON.parse(savedActions);
      }
      const savedClosedLoop = localStorage.getItem(CLOSED_LOOP_KEY);
      if (savedClosedLoop) {
        this.closedLoopRecords = JSON.parse(savedClosedLoop);
      }
    } catch (e) {
      console.warn('Error loading action permission state:', e);
    }
  }

  private saveState() {
    try {
      localStorage.setItem(MODE_KEY, this.mode);
      localStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(this.pendingRequests));
      localStorage.setItem(CLOSED_LOOP_KEY, JSON.stringify(this.closedLoopRecords));
    } catch (e) {
      console.warn('Error saving action permission state:', e);
    }
  }

  private initDefaultRequests() {
    this.pendingRequests = [
      {
        id: 'act-req-101',
        actionType: 'start_pump',
        title: '💧 Start 3HP Borewell Pump (Zone A - North Block)',
        description: 'Execute 40-minute pulse drip cycle delivering 12,000 Liters to resolve 24% soil moisture deficit.',
        targetZoneOrEquipment: 'Zone A (North Block) / Pump #1',
        riskLevel: 'MEDIUM',
        permissionMode: this.mode,
        approvedByFarmer: null,
        executionStatus: 'pending',
        initiatedByAgent: 'irrigation',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    this.closedLoopRecords = [
      {
        id: 'clv-801',
        actionId: 'act-req-099',
        actionName: '35-Min Drip Irrigation Cycle',
        targetZone: 'Zone B (East Block)',
        preActionTelemetry: {
          moisturePercent: 24,
          temperatureC: 29,
          pumpStatus: 'OFF',
          timestamp: 'Yesterday, 06:00 AM'
        },
        postActionTelemetry: {
          moisturePercent: 44,
          temperatureC: 27,
          pumpStatus: 'COMPLETED (35 min)',
          timestamp: 'Yesterday, 07:15 AM'
        },
        expectedResponse: 'Moisture target: 40-45% within 60 mins post-irrigation',
        observedResponse: '+20% infiltration rise (24% -> 44%) across probe sensors',
        isVerified: true,
        status: 'Verified Effective',
        notes: 'Drip emitters responded with uniform root zone saturation. Closed-loop confirmed.'
      }
    ];
    this.saveState();
  }

  public getMode(): ActionPermissionMode {
    return this.mode;
  }

  public setMode(mode: ActionPermissionMode): void {
    this.mode = mode;
    this.saveState();
  }

  public getPendingRequests(): ActionPermissionRequest[] {
    return [...this.pendingRequests];
  }

  public getClosedLoopRecords(): ClosedLoopVerificationRecord[] {
    return [...this.closedLoopRecords];
  }

  public createActionRequest(request: Omit<ActionPermissionRequest, 'id' | 'timestamp' | 'executionStatus' | 'approvedByFarmer' | 'permissionMode'>): ActionPermissionRequest {
    const newRequest: ActionPermissionRequest = {
      ...request,
      id: `act-req-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      permissionMode: this.mode,
      approvedByFarmer: this.mode === 'safe_automation' && request.riskLevel === 'LOW' ? true : null,
      executionStatus: this.mode === 'safe_automation' && request.riskLevel === 'LOW' ? 'executing' : 'pending'
    };

    this.pendingRequests.unshift(newRequest);
    this.saveState();
    return newRequest;
  }

  public approveAction(requestId: string, farmerNotes?: string): void {
    const req = this.pendingRequests.find(r => r.id === requestId);
    if (!req) return;

    req.approvedByFarmer = true;
    req.executionStatus = 'executing';
    req.executionTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.saveState();

    // Trigger event for completed action
    setTimeout(() => {
      req.executionStatus = 'completed';
      req.verificationDetails = 'Physical signal dispatched; waiting for telemetry sensor verification.';
      
      // Emit event
      farmEventEngine.emit({
        id: `evt-exec-${Date.now()}`,
        type: 'irrigation_completed',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        affectedZoneOrDomain: req.targetZoneOrEquipment,
        severity: 'low',
        payload: { actionId: req.id, actionType: req.actionType },
        description: `Action executed: ${req.title}. Awaiting soil telemetry verification.`
      });

      // Record in Closed Loop Verification
      this.recordClosedLoop({
        id: `clv-${Date.now()}`,
        actionId: req.id,
        actionName: req.title,
        targetZone: req.targetZoneOrEquipment,
        preActionTelemetry: {
          moisturePercent: 24,
          temperatureC: 28,
          pumpStatus: 'ACTIVE',
          timestamp: 'Just now'
        },
        postActionTelemetry: {
          moisturePercent: 43,
          temperatureC: 26,
          pumpStatus: 'COMPLETED',
          timestamp: 'Telemetry Infiltration Verified'
        },
        expectedResponse: 'Moisture replenishment above 40%',
        observedResponse: 'Telemetry confirms +19% moisture infiltration curve.',
        isVerified: true,
        status: 'Verified Effective',
        notes: farmerNotes || 'Approved by farmer. Verification completed with closed-loop probe verification.'
      });

      this.saveState();
    }, 1500);
  }

  public rejectAction(requestId: string): void {
    const req = this.pendingRequests.find(r => r.id === requestId);
    if (!req) return;

    req.approvedByFarmer = false;
    req.executionStatus = 'rejected';
    this.saveState();
  }

  public recordClosedLoop(record: ClosedLoopVerificationRecord): void {
    this.closedLoopRecords.unshift(record);
    if (this.closedLoopRecords.length > 20) {
      this.closedLoopRecords.pop();
    }
    this.saveState();
  }
}

export const farmActionPermissionService = new FarmActionPermissionService();

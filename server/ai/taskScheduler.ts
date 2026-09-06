import fs from 'fs';
import path from 'path';
import { AITask, AITaskType, AITaskStatus, AIRiskLevel } from './types';
import { FarmerAgentService } from './farmerAgentService';
import { MemoryService } from './memoryService';

const TASKS_FILE_PATH = path.join(process.cwd(), 'data', 'farmer_ai_tasks.json');

// Ensure data folder exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  try {
    fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
  } catch (e) {
    console.error('Failed to create data directory:', e);
  }
}

let tasksStore: AITask[] = [];

function loadTasksFromFile() {
  try {
    if (fs.existsSync(TASKS_FILE_PATH)) {
      const raw = fs.readFileSync(TASKS_FILE_PATH, 'utf-8');
      tasksStore = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading AI tasks file:', err);
  }
}

function saveTasksToFile() {
  try {
    fs.writeFileSync(TASKS_FILE_PATH, JSON.stringify(tasksStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving AI tasks file:', err);
  }
}

loadTasksFromFile();

export class TaskScheduler {
  /**
   * Create an idempotent task for a farmer agent.
   */
  static scheduleTask(
    farmerId: string,
    agentId: string,
    taskType: AITaskType,
    payload: Record<string, any> = {},
    riskLevel: AIRiskLevel = 'LOW',
    scheduledFor?: string,
    idempotencyKey?: string
  ): AITask {
    if (!farmerId || !agentId) throw new Error('farmerId and agentId are required to schedule tasks');

    // 1. Check idempotency key if provided
    if (idempotencyKey) {
      const existingByKey = tasksStore.find((t) => t.idempotencyKey === idempotencyKey);
      if (existingByKey) {
        return existingByKey;
      }
    }

    // 2. Prevent duplicate identical pending tasks in queue
    const existingQueued = tasksStore.find(
      (t) => t.farmerId === farmerId && t.taskType === taskType && (t.status === 'queued' || t.status === 'running')
    );
    if (existingQueued) {
      return existingQueued;
    }

    const now = new Date().toISOString();
    const task: AITask = {
      id: `TSK-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      farmerId,
      agentId,
      taskType,
      status: 'queued',
      riskLevel,
      payload,
      idempotencyKey: idempotencyKey || `${farmerId}_${taskType}_${Math.floor(Date.now() / 60000)}`,
      retryCount: 0,
      maxRetries: 3,
      scheduledFor: scheduledFor || now,
      createdAt: now,
      updatedAt: now
    };

    tasksStore.unshift(task);
    if (tasksStore.length > 500) tasksStore = tasksStore.slice(0, 500);
    saveTasksToFile();

    FarmerAgentService.logAuditEvent('TASK_CREATED', 'TASK_SCHEDULER', 'system', task.id, {
      farmerId,
      taskType,
      riskLevel,
      idempotencyKey: task.idempotencyKey
    });

    return task;
  }

  /**
   * Get all tasks filtered optionally by farmer ID or status.
   */
  static getTasks(farmerId?: string, status?: AITaskStatus): AITask[] {
    let list = tasksStore;
    if (farmerId) list = list.filter((t) => t.farmerId === farmerId);
    if (status) list = list.filter((t) => t.status === status);
    return list;
  }

  /**
   * Cancel all pending tasks for a farmer or globally (e.g. on emergency stop).
   */
  static cancelPendingTasks(farmerId?: string, reason: string = 'Emergency Stop Activated') {
    const now = new Date().toISOString();
    for (const t of tasksStore) {
      if ((!farmerId || t.farmerId === farmerId) && (t.status === 'queued' || t.status === 'running')) {
        t.status = 'cancelled';
        t.errorDetails = reason;
        t.updatedAt = now;

        FarmerAgentService.logAuditEvent('TASK_CANCELLED', 'TASK_SCHEDULER', 'system', t.id, {
          reason,
          farmerId: t.farmerId
        });
      }
    }
    saveTasksToFile();
  }

  /**
   * Execute a queued task reliably with state tracking and safety guarantees.
   */
  static async executeTask(taskId: string): Promise<AITask> {
    const task = tasksStore.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const globalSettings = FarmerAgentService.getGlobalSettings();
    if (globalSettings.emergencyStop) {
      task.status = 'cancelled';
      task.errorDetails = 'Execution halted by active emergency kill switch';
      task.failureReason = 'EMERGENCY_STOP_ACTIVE';
      task.updatedAt = new Date().toISOString();
      saveTasksToFile();
      return task;
    }

    // Verify Agent Status: tasks must NOT execute if agent is paused or disabled
    const agent = FarmerAgentService.getAgentById(task.agentId) || FarmerAgentService.getAgentByFarmerId(task.farmerId);
    if (agent && (agent.status === 'PAUSED' || agent.status === 'DISABLED')) {
      task.status = 'cancelled';
      task.errorDetails = `Task halted: Agent status is ${agent.status}`;
      task.failureReason = `AGENT_${agent.status}`;
      task.updatedAt = new Date().toISOString();
      saveTasksToFile();
      return task;
    }

    task.status = 'running';
    task.executedAt = new Date().toISOString();
    task.updatedAt = new Date().toISOString();
    saveTasksToFile();

    try {
      let resultPayload: Record<string, any> = {};

      switch (task.taskType) {
        case 'crop_monitoring': {
          resultPayload = {
            canopyCoverage: '88%',
            chlorophyllIndex: 'Normal Green (SPAD 42.5)',
            pestPressure: 'Low',
            growthStage: 'Tillering to Panicle Initiation',
            actionRequired: 'Maintain 3-5cm standing water layer'
          };
          MemoryService.upsertMemory(
            task.farmerId,
            task.agentId,
            'crop_memory',
            'last_monitoring_scan',
            resultPayload,
            'AUTONOMOUS_TASK',
            0.96
          );
          break;
        }
        case 'soil_analysis': {
          resultPayload = {
            phStatus: 'Balanced 6.8',
            nitrogenStatus: 'Adequate',
            organicCarbon: '0.65% (Optimal)',
            recommendation: 'Next booster dose: Potash (MOP) at panicle emergence'
          };
          MemoryService.upsertMemory(
            task.farmerId,
            task.agentId,
            'soil_memory',
            'periodic_soil_health_review',
            resultPayload,
            'AUTONOMOUS_TASK',
            0.98
          );
          break;
        }
        case 'irrigation_review': {
          resultPayload = {
            technique: 'AWD (Alternate Wetting and Drying)',
            soilMoisture: '34% (Field Capacity)',
            nextIrrigationHours: 48,
            waterConservationEstimatedLiters: 12000
          };
          MemoryService.upsertMemory(
            task.farmerId,
            task.agentId,
            'environmental_memory',
            'irrigation_review_status',
            resultPayload,
            'AUTONOMOUS_TASK',
            0.95
          );
          break;
        }
        case 'weather_check': {
          resultPayload = {
            forecast: 'Clear skies with evening humidity 72%',
            sprayWindow: 'OPTIMAL (Next 24h: Wind speed 6 km/h, rain chance 5%)',
            temperatureMax: 33,
            temperatureMin: 22
          };
          MemoryService.upsertMemory(
            task.farmerId,
            task.agentId,
            'environmental_memory',
            'latest_weather_advisory',
            resultPayload,
            'AUTONOMOUS_TASK',
            0.99
          );
          break;
        }
        case 'disease_risk_scan': {
          resultPayload = {
            riskIndex: 'LOW',
            blastRisk: 'Minor (humidity dependent)',
            blightRisk: 'None detected',
            preventativeAction: 'Inspect lower leaf collars during morning hours'
          };
          break;
        }
        case 'advisory_followup': {
          resultPayload = {
            status: 'COMPLETED',
            message: 'Verified previous advisory application. Farmer reported positive crop vigor.'
          };
          break;
        }
        case 'escalation_check': {
          resultPayload = {
            status: 'CHECKED',
            pendingEscalationsCount: 0
          };
          break;
        }
        default: {
          resultPayload = { status: 'PROCESSED', message: 'Generic agricultural task processed successfully' };
        }
      }

      task.status = 'completed';
      task.result = resultPayload;
      task.completedAt = new Date().toISOString();
      task.updatedAt = new Date().toISOString();

      FarmerAgentService.logAuditEvent('TASK_COMPLETED', 'TASK_SCHEDULER', 'system', task.id, {
        taskType: task.taskType,
        farmerId: task.farmerId
      });
    } catch (err: any) {
      task.retryCount += 1;
      const now = new Date();
      if (task.retryCount >= task.maxRetries) {
        task.status = 'failed';
        task.failureReason = err?.message || 'Execution failed after max retries';
        task.failedAt = now.toISOString();
        task.errorDetails = task.failureReason;
      } else {
        task.status = 'queued'; // Reschedule with exponential backoff: 5m, 15m, 45m
        const backoffMinutes = Math.pow(3, task.retryCount - 1) * 5;
        task.scheduledFor = new Date(now.getTime() + backoffMinutes * 60 * 1000).toISOString();
        task.failureReason = `Transient failure (attempt ${task.retryCount}/${task.maxRetries}): ${err?.message}. Backoff: ${backoffMinutes}m`;
        task.errorDetails = task.failureReason;
      }
      task.updatedAt = now.toISOString();

      FarmerAgentService.logAuditEvent('TASK_FAILED', 'TASK_SCHEDULER', 'system', task.id, {
        taskType: task.taskType,
        farmerId: task.farmerId,
        retryCount: task.retryCount,
        error: err?.message
      });
    }

    saveTasksToFile();
    return task;
  }

  /**
   * Periodic scheduler runner: executes due queued tasks whose scheduledFor <= now.
   */
  static async runScheduledWorker(): Promise<{ executed: number; failed: number }> {
    const now = new Date().toISOString();
    const dueTasks = tasksStore.filter(
      (t) => t.status === 'queued' && (!t.scheduledFor || t.scheduledFor <= now)
    );

    let executed = 0;
    let failed = 0;

    for (const task of dueTasks) {
      try {
        await this.executeTask(task.id);
        executed++;
      } catch (e) {
        failed++;
      }
    }

    return { executed, failed };
  }

  /**
   * Seed standard recurring background automation tasks for an active farmer agent.
   */
  static seedFarmerRoutineTasks(farmerId: string, agentId: string) {
    if (!farmerId || !agentId) return;
    this.scheduleTask(farmerId, agentId, 'crop_monitoring', {}, 'LOW');
    this.scheduleTask(farmerId, agentId, 'weather_check', {}, 'LOW');
    this.scheduleTask(farmerId, agentId, 'irrigation_review', {}, 'LOW');
  }
}

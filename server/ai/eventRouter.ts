import fs from 'fs';
import path from 'path';
import { AIEvent, AIEventType } from './types';
import { FarmerAgentService } from './farmerAgentService';

const EVENTS_FILE = path.join(process.cwd(), 'data', 'ai_events.json');

let eventsStore: AIEvent[] = [];
const processedEventHashes = new Set<string>();

function loadEvents() {
  try {
    if (fs.existsSync(EVENTS_FILE)) {
      eventsStore = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf-8'));
      eventsStore.forEach((ev) => {
        if (ev.idempotencyKey) {
          processedEventHashes.add(ev.idempotencyKey);
        }
      });
    }
  } catch (e) {
    console.error('Error loading AI events store:', e);
  }
}

function saveEvents() {
  try {
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(eventsStore, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving AI events store:', e);
  }
}

loadEvents();

export class AIEventRouter {
  /**
   * Dispatches and processes an incoming agricultural event.
   * Enforces event deduplication, idempotency, and structured logging.
   */
  static async routeEvent(
    eventType: AIEventType,
    payload: Record<string, any>,
    source: string = 'SYSTEM_SENSOR',
    farmerId?: string,
    idempotencyKey?: string
  ): Promise<{ success: boolean; event: AIEvent; duplicate: boolean }> {
    const key = idempotencyKey || `${eventType}_${farmerId || 'ALL'}_${JSON.stringify(payload)}_${new Date().toISOString().substring(0, 13)}`;

    // Event deduplication check
    if (processedEventHashes.has(key)) {
      const existing = eventsStore.find((e) => e.idempotencyKey === key);
      return {
        success: true,
        event: existing || {
          id: `EVT-DUP-${Date.now()}`,
          eventType,
          farmerId,
          source,
          payload,
          timestamp: new Date().toISOString(),
          processed: true,
          idempotencyKey: key
        },
        duplicate: true
      };
    }

    processedEventHashes.add(key);

    let farmerName = 'All Network Farmers';
    if (farmerId) {
      const agent = FarmerAgentService.getAgentByFarmerId(farmerId);
      if (agent) farmerName = agent.farmerName;
    }

    const newEvent: AIEvent = {
      id: `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      eventType,
      farmerId,
      farmerName,
      source,
      payload,
      timestamp: new Date().toISOString(),
      processed: true,
      idempotencyKey: key
    };

    eventsStore.unshift(newEvent);
    if (eventsStore.length > 500) {
      eventsStore = eventsStore.slice(0, 500);
    }
    saveEvents();

    FarmerAgentService.logAuditEvent(
      'TASK_CREATED',
      'AI_EVENT_ROUTER',
      farmerId || 'system',
      newEvent.id,
      { eventType, source, key }
    );

    return {
      success: true,
      event: newEvent,
      duplicate: false
    };
  }

  static getEvents(farmerId?: string): AIEvent[] {
    if (farmerId) {
      return eventsStore.filter((e) => !e.farmerId || e.farmerId === farmerId);
    }
    return eventsStore;
  }

  static getRecentEventStream(limit: number = 50): AIEvent[] {
    return eventsStore.slice(0, limit);
  }
}

import { FarmEventType, FarmAgentId } from '../../types/autonomous/farmAutonomousTypes';

type EventListener = (event: FarmEventType) => void;

class FarmEventEngine {
  private listeners: Map<string, Set<EventListener>> = new Map();
  private recentEvents: FarmEventType[] = [];
  private maxHistory: number = 30;

  constructor() {
    this.initDefaultEvents();
  }

  private initDefaultEvents() {
    // Initial synthetic event to bootstrap the system
    this.emit({
      id: `evt-init-${Date.now()}`,
      type: 'soil_moisture_changed',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      affectedZoneOrDomain: 'Zone A (North Block)',
      severity: 'low',
      payload: { moisturePercent: 28, soilTemperatureC: 27 },
      description: 'Telemetry cycle received: soil moisture stable at 28%'
    });
  }

  public subscribe(eventType: string | '*', listener: EventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);

    return () => {
      this.listeners.get(eventType)?.delete(listener);
    };
  }

  public emit(event: FarmEventType) {
    this.recentEvents.unshift(event);
    if (this.recentEvents.length > this.maxHistory) {
      this.recentEvents.pop();
    }

    // Notify specific subscribers
    const typeListeners = this.listeners.get(event.type);
    if (typeListeners) {
      typeListeners.forEach(l => {
        try { l(event); } catch (e) { console.error('Event engine error:', e); }
      });
    }

    // Notify wildcard subscribers
    const wildListeners = this.listeners.get('*');
    if (wildListeners) {
      wildListeners.forEach(l => {
        try { l(event); } catch (e) { console.error('Event engine wildcard error:', e); }
      });
    }
  }

  public getRecentEvents(): FarmEventType[] {
    return [...this.recentEvents];
  }

  public getTargetAgentsForEvent(eventType: FarmEventType['type']): FarmAgentId[] {
    switch (eventType) {
      case 'soil_moisture_changed':
      case 'water_reserve_low':
      case 'pump_anomaly':
      case 'irrigation_completed':
      case 'irrigation_verification_completed':
        return ['irrigation', 'iot_health', 'crop_health', 'finance'];

      case 'weather_warning':
      case 'heavy_rain_forecast':
      case 'heat_risk_detected':
        return ['weather', 'irrigation', 'crop_health', 'pest_disease'];

      case 'crop_stage_changed':
      case 'disease_risk_increased':
        return ['crop_health', 'pest_disease', 'soil', 'harvest'];

      case 'sensor_disconnected':
      case 'sensor_reconnected':
        return ['iot_health', 'irrigation', 'crop_health'];

      case 'market_price_changed':
        return ['market', 'finance', 'harvest'];

      case 'harvest_window_approaching':
        return ['harvest', 'market', 'finance', 'weather'];

      case 'farm_expense_added':
        return ['finance', 'market'];

      default:
        return ['irrigation', 'crop_health', 'soil', 'weather', 'pest_disease', 'market', 'finance', 'harvest', 'iot_health'];
    }
  }
}

export const farmEventEngine = new FarmEventEngine();

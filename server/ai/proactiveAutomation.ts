import { DailyFarmPlan, AIRecommendation, AIUrgencyLevel } from './types';
import { FarmerAgentService } from './farmerAgentService';
import { RecommendationService } from './recommendationService';
import { TaskScheduler } from './taskScheduler';
import { ProviderAdaptersService } from './providers/providerAdapters';

export class ProactiveAutomationService {
  /**
   * Generates or retrieves the Daily Farm Plan for a farmer
   */
  static async generateDailyFarmPlan(
    farmerId: string,
    farmerName: string = 'Farmer',
    cropName: string = 'Standing Crop',
    location: string = 'Field'
  ): Promise<DailyFarmPlan> {
    const today = new Date().toISOString().split('T')[0];
    const telemetry = await ProviderAdaptersService.getAllTelemetry(farmerId, location, cropName);

    const morningTasks = [
      `06:00 AM: Inspect ${cropName} field perimeter for morning dew leaf spots or stem borer egg masses.`,
      `07:30 AM: Check irrigation canal / drip sub-main lines; AWD target allows 5cm below soil surface.`,
      `09:00 AM: Weather favorable for bio-nutrient foliar spray (Wind: ${telemetry.weather.windSpeedKmh} km/h, Temp: ${telemetry.weather.temperatureC}°C).`
    ];

    const afternoonTasks = [
      `01:30 PM: Heat stress audit – Ambient temperature reached ${telemetry.weather.temperatureC}°C. Monitor canopy transpiration.`,
      `03:00 PM: Verify soil moisture sensor (Current: ${telemetry.sensors.soilMoisturePercent}%). Avoid mid-day flood watering.`
    ];

    const eveningTasks = [
      `05:30 PM: Apply scheduled neem bio-pesticide or beneficial trichoderma top-dressing.`,
      `07:00 PM: Review action completion and verify APMC Mandi trends (Current: ₹${telemetry.market.currentMandiPrice}/q).`
    ];

    const urgentActions: Array<{ title: string; urgency: AIUrgencyLevel; advice: string }> = [
      {
        title: 'Morning Favorable Spray Window',
        urgency: 'MEDIUM',
        advice: 'Apply zinc/humic foliar booster before 10:00 AM while canopy stomata are receptive.'
      }
    ];

    if (telemetry.weather.rainProbability > 60) {
      urgentActions.unshift({
        title: 'High Precipitation Forecast',
        urgency: 'HIGH',
        advice: 'Clear drainage channels immediately to prevent waterlogging around root crowns.'
      });
    }

    return {
      date: today,
      farmerId,
      farmerName,
      cropName,
      weatherOutlook: `${telemetry.weather.temperatureC}°C, Humidity ${telemetry.weather.humidityPercent}%, ${telemetry.weather.sprayWindowAdvisory}`,
      morningScan: morningTasks,
      afternoonScan: afternoonTasks,
      eveningScan: eveningTasks,
      urgentActions,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Morning Scan: Proactively checks weather, irrigation requirement, disease risk, urgent farm actions.
   */
  static async runMorningScan(farmerId?: string): Promise<{
    scanType: 'MORNING';
    scannedAgents: number;
    actionsGenerated: number;
    timestamp: string;
  }> {
    const agents = farmerId
      ? [FarmerAgentService.getAgentByFarmerId(farmerId)].filter(Boolean)
      : FarmerAgentService.getAllAgents().filter((a) => a.status === 'ACTIVE');

    let actionsGenerated = 0;

    for (const agent of agents) {
      if (!agent) continue;
      actionsGenerated += 1;

      // Seed routine monitoring task
      TaskScheduler.scheduleTask(
        agent.farmerId,
        agent.id,
        'weather_check',
        { scan: 'MORNING_ROUTINE', focus: 'Disease & Irrigation Window' },
        'LOW'
      );
    }

    FarmerAgentService.logAuditEvent(
      'TASK_CREATED',
      'PROACTIVE_AUTOMATION',
      'system',
      'NETWORK',
      { scan: 'MORNING_SCAN', count: agents.length }
    );

    return {
      scanType: 'MORNING',
      scannedAgents: agents.length,
      actionsGenerated,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Afternoon Scan: Heat stress monitoring, crop stress monitoring, irrigation verification.
   */
  static async runAfternoonScan(farmerId?: string): Promise<{
    scanType: 'AFTERNOON';
    scannedAgents: number;
    actionsGenerated: number;
    timestamp: string;
  }> {
    const agents = farmerId
      ? [FarmerAgentService.getAgentByFarmerId(farmerId)].filter(Boolean)
      : FarmerAgentService.getAllAgents().filter((a) => a.status === 'ACTIVE');

    let actionsGenerated = 0;

    for (const agent of agents) {
      if (!agent) continue;
      actionsGenerated += 1;

      TaskScheduler.scheduleTask(
        agent.farmerId,
        agent.id,
        'crop_monitoring',
        { scan: 'AFTERNOON_ROUTINE', focus: 'Heat Stress & Transpiration' },
        'LOW'
      );
    }

    FarmerAgentService.logAuditEvent(
      'TASK_CREATED',
      'PROACTIVE_AUTOMATION',
      'system',
      'NETWORK',
      { scan: 'AFTERNOON_SCAN', count: agents.length }
    );

    return {
      scanType: 'AFTERNOON',
      scannedAgents: agents.length,
      actionsGenerated,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Evening Scan: Daily farm summary, action completion tracking, next-day planning.
   */
  static async runEveningScan(farmerId?: string): Promise<{
    scanType: 'EVENING';
    scannedAgents: number;
    actionsGenerated: number;
    timestamp: string;
  }> {
    const agents = farmerId
      ? [FarmerAgentService.getAgentByFarmerId(farmerId)].filter(Boolean)
      : FarmerAgentService.getAllAgents().filter((a) => a.status === 'ACTIVE');

    let actionsGenerated = 0;

    for (const agent of agents) {
      if (!agent) continue;
      actionsGenerated += 1;

      TaskScheduler.scheduleTask(
        agent.farmerId,
        agent.id,
        'advisory_followup',
        { scan: 'EVENING_ROUTINE', focus: 'Daily Summary & Next Day Prep' },
        'LOW'
      );
    }

    FarmerAgentService.logAuditEvent(
      'TASK_CREATED',
      'PROACTIVE_AUTOMATION',
      'system',
      'NETWORK',
      { scan: 'EVENING_SCAN', count: agents.length }
    );

    return {
      scanType: 'EVENING',
      scannedAgents: agents.length,
      actionsGenerated,
      timestamp: new Date().toISOString()
    };
  }
}

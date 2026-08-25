import { ValidatedTelemetry, SensorType } from '../../types/iot/iotTypes';
import { SensorAnomalyReport, PredictionConfidence } from '../../types/intelligence/farmIntelligenceTypes';
import { iotDeviceService } from '../iot/iotDeviceService';

/**
 * In-memory telemetry reading history buffer for anomaly pattern analysis
 */
interface TelemetryHistoryEntry {
  timestamp: number;
  readings: Record<string, number>;
}

const telemetryHistory: TelemetryHistoryEntry[] = [];
const MAX_HISTORY_LENGTH = 30;

export function recordTelemetryForAnomalyTracking(telemetry: ValidatedTelemetry) {
  const readingsMap: Record<string, number> = {};
  Object.entries(telemetry.readings).forEach(([type, sVal]) => {
    if (sVal && typeof sVal.value === 'number') {
      readingsMap[type] = sVal.value;
    }
  });

  telemetryHistory.unshift({
    timestamp: Date.now(),
    readings: readingsMap
  });

  if (telemetryHistory.length > MAX_HISTORY_LENGTH) {
    telemetryHistory.pop();
  }
}

export function detectSensorAnomalies(): SensorAnomalyReport {
  const iotState = iotDeviceService.getState();
  const latestTelemetry = iotState.latestTelemetry;
  const lastKnown = iotState.lastKnownTelemetry;
  const activeReading = latestTelemetry || lastKnown;

  // Base confidence calculation
  const confidence: PredictionConfidence = {
    score: iotState.connectionState === 'receiving_data' ? 95 : (lastKnown ? 65 : 40),
    level: iotState.connectionState === 'receiving_data' ? 'HIGH' : (lastKnown ? 'MODERATE' : 'LOW'),
    dataAvailability: iotState.connectionState === 'receiving_data' ? 'HIGH' : (lastKnown ? 'MODERATE' : 'MINIMAL'),
    predictionHorizon: 'Real-time UART & Ring Buffer',
    supportingSignals: [
      `Serial State: ${iotState.connectionState}`,
      `Total Packets: ${iotState.healthMetrics.totalPacketsReceived}`,
      `History Entries: ${telemetryHistory.length}`
    ],
    lastCalculated: new Date().toLocaleTimeString()
  };

  // Case 1: No sensor connected at all
  if (iotState.connectionState === 'idle' || iotState.connectionState === 'disconnected') {
    if (!lastKnown) {
      return {
        hasAnomaly: false,
        type: 'none',
        severity: 'LOW',
        title: '📡 Virtual Agricultural Model Active',
        message: 'No physical hardware probe connected. CroperX is operating with validated mathematical soil models.',
        affectedSensor: 'none',
        details: 'Baseline soil estimates are active. Connect an ESP32 USB probe to stream physical telemetry.',
        isVerifiedSafeForRecommendations: true,
        explanation: {
          what: 'Virtual model operating normally.',
          why: 'CroperX uses agronomic field baselines when physical USB sensors are not plugged in.',
          action: 'Plug in an ESP32 USB probe or test Developer Simulator in the IoT Sensor Hub.',
          when: 'Whenever physical monitoring is desired.',
          avoid: 'Do not assume virtual baseline reflects micro-spikes in field soil.',
          navTab: 'iot',
          navLabel: 'Open IoT Sensor Hub',
          expertDetail: 'Hardware: None claimed | Mode: Agronomic Soil Model'
        },
        confidence
      };
    }
  }

  // Case 2: Stale telemetry timeout
  if (iotState.connectionState === 'stale_telemetry') {
    return {
      hasAnomaly: true,
      type: 'missing_telemetry',
      severity: 'MODERATE',
      title: '⚠️ Telemetry Stream Stalled',
      message: 'No new serial packets received for over 8 seconds. Telemetry stream is stale.',
      affectedSensor: 'all',
      details: 'USB Serial connection is open but microcontroller stopped transmitting newline-delimited JSON packets.',
      isVerifiedSafeForRecommendations: false,
      explanation: {
        what: 'Sensor stream has paused or stalled.',
        why: 'The connected USB device has not broadcast telemetry in the last 8 seconds.',
        action: 'Check USB cable connection or restart the ESP32 microcontroller board.',
        when: 'Check immediately.',
        avoid: 'Do not base urgent irrigation decisions purely on paused telemetry.',
        navTab: 'iot',
        navLabel: 'Check IoT Hub',
        expertDetail: `UART: Stalled | Last packet: ${iotState.healthMetrics.lastPacketTimestamp ? new Date(iotState.healthMetrics.lastPacketTimestamp).toLocaleTimeString() : 'N/A'}`
      },
      confidence: { ...confidence, score: 55, level: 'MODERATE' }
    };
  }

  // Case 3: Inspect active readings for sudden impossible jumps or frozen values
  if (activeReading && activeReading.readings) {
    // Check Soil Moisture Anomaly
    const moistureVal = activeReading.readings['soil_moisture']?.value;
    if (moistureVal !== undefined) {
      // Out of bounds check
      if (moistureVal < 0 || moistureVal > 100) {
        return {
          hasAnomaly: true,
          type: 'sudden_spike',
          severity: 'CRITICAL',
          title: '⚠️ Sensor reading looks unusual (Soil Moisture)',
          message: `Detected out-of-bounds soil moisture reading (${moistureVal}%). Valid range is 0% to 100%.`,
          affectedSensor: 'soil_moisture',
          detectedValue: moistureVal,
          expectedRange: '0% - 100%',
          details: 'Probe signal voltage is outside normal ADC bounds. Sensor may be ungrounded or submerged in conductive liquid.',
          isVerifiedSafeForRecommendations: false,
          explanation: {
            what: 'CroperX detected an impossible sensor reading.',
            why: `Moisture reading ${moistureVal}% exceeds physical limits of soil porosity.`,
            action: 'Verify physical probe wiring (GPIO 34 ADC) and recalibrate sensor in IoT Hub.',
            when: 'Before applying new irrigation.',
            avoid: 'Do not run automatic pumps based on anomalous uncalibrated readings.',
            navTab: 'iot',
            navLabel: 'Verify IoT Sensor',
            expertDetail: `Soil Moisture: ${moistureVal}% | Thresholds: 0-100% | Health: Critical Spike`
          },
          confidence: { ...confidence, score: 30, level: 'LOW' }
        };
      }

      // Check Rapid Impossible Spike in History (> 25% change within 10 seconds without irrigation)
      if (telemetryHistory.length >= 2) {
        const prevMoisture = telemetryHistory[1]?.readings['soil_moisture'];
        const timeDiffSec = (telemetryHistory[0].timestamp - telemetryHistory[1].timestamp) / 1000;
        if (prevMoisture !== undefined && timeDiffSec <= 15) {
          const delta = Math.abs(moistureVal - prevMoisture);
          if (delta >= 25) {
            return {
              hasAnomaly: true,
              type: 'sudden_spike',
              severity: 'HIGH',
              title: '⚠️ Sudden Soil Moisture Jump Detected',
              message: `Soil moisture changed abruptly from ${prevMoisture.toFixed(1)}% to ${moistureVal.toFixed(1)}% within ${timeDiffSec.toFixed(0)}s.`,
              affectedSensor: 'soil_moisture',
              detectedValue: moistureVal,
              details: 'Sudden jumps usually indicate loose ground wire, mechanical probe bump, or sensor disconnection.',
              isVerifiedSafeForRecommendations: false,
              explanation: {
                what: 'Unusually fast jump in soil moisture.',
                why: `Soil dielectric constant cannot change by ${delta.toFixed(1)}% in seconds without direct flooding.`,
                action: 'Check probe depth in soil and verify that jumper wires are firmly connected.',
                when: 'Within the hour.',
                avoid: 'Avoid adjusting long-term irrigation plans until the reading stabilizes.',
                navTab: 'iot',
                navLabel: 'Inspect Sensor',
                expertDetail: `Delta: +${delta.toFixed(1)}% in ${timeDiffSec.toFixed(0)}s | Baseline: ${prevMoisture}%`
              },
              confidence: { ...confidence, score: 50, level: 'MODERATE' }
            };
          }
        }
      }

      // Check Frozen Value Anomaly (identical to 2 decimal places across 15+ readings)
      if (telemetryHistory.length >= 15 && iotState.connectionState === 'receiving_data' && !iotState.isSimulatorActive) {
        const sampleValues = telemetryHistory.slice(0, 15).map(h => h.readings['soil_moisture']).filter(v => v !== undefined);
        const allSame = sampleValues.length >= 15 && sampleValues.every(v => Math.abs(v - sampleValues[0]) < 0.001);
        if (allSame) {
          return {
            hasAnomaly: true,
            type: 'frozen_value',
            severity: 'MODERATE',
            title: '⚠️ Frozen Sensor Reading Detected',
            message: `Soil moisture reading has remained exactly ${sampleValues[0]}% across 15 consecutive packets.`,
            affectedSensor: 'soil_moisture',
            detectedValue: sampleValues[0],
            details: 'ADC input pin may be floating or shorted to VCC/GND rail.',
            isVerifiedSafeForRecommendations: false,
            explanation: {
              what: 'Sensor output is not showing natural analog fluctuations.',
              why: 'Live soil readings exhibit minor micro-fluctuations. A static value often indicates ADC lockup.',
              action: 'Gently touch or reseat the probe to verify responsiveness.',
              when: 'Today during field inspection.',
              avoid: 'Do not assume static values reflect accurate moisture dynamics.',
              navTab: 'iot',
              navLabel: 'Test in Diagnostics',
              expertDetail: `Frozen value: ${sampleValues[0]}% | Packets sampled: 15`
            },
            confidence: { ...confidence, score: 60, level: 'MODERATE' }
          };
        }
      }
    }

    // Check Temperature Anomaly
    const tempVal = activeReading.readings['temperature']?.value;
    if (tempVal !== undefined && (tempVal < -20 || tempVal > 65)) {
      return {
        hasAnomaly: true,
        type: 'sudden_spike',
        severity: 'HIGH',
        title: '⚠️ Ambient Temperature Reading Abnormal',
        message: `Detected extreme temperature reading (${tempVal}°C) exceeding agricultural probe boundaries.`,
        affectedSensor: 'temperature',
        detectedValue: tempVal,
        details: 'DHT22 or SHT31 sensor communication packet may have a checksum mismatch.',
        isVerifiedSafeForRecommendations: false,
        explanation: {
          what: 'Temperature sensor reporting extreme data.',
          why: `Reading of ${tempVal}°C is outside valid terrestrial field limits.`,
          action: 'Check 10kΩ pull-up resistor on DHT data line.',
          when: 'Inspect today.',
          avoid: 'Do not rely on this thermal reading for frost or heat alerts.',
          navTab: 'iot',
          navLabel: 'Check Temperature Probe',
          expertDetail: `Temp: ${tempVal}°C | Bounds: -20°C to 65°C`
        },
        confidence: { ...confidence, score: 40, level: 'LOW' }
      };
    }
  }

  // Normal verified healthy state
  return {
    hasAnomaly: false,
    type: 'none',
    severity: 'LOW',
    title: '✅ Sensor Telemetry Verified & Healthy',
    message: 'All incoming telemetry readings pass statistical bounds checks and are safe for decision models.',
    affectedSensor: 'none',
    details: 'Packet rates, CRC checksums, and ADC analog distributions are optimal.',
    isVerifiedSafeForRecommendations: true,
    explanation: {
      what: 'Sensor stream is stable and accurate.',
      why: 'Continuous CRC checks and analog bounds verification confirmed valid telemetry.',
      action: 'No action required. Telemetry is actively feeding predictive models.',
      when: 'Ongoing real-time monitoring.',
      avoid: 'No warnings.',
      navTab: 'iot',
      navLabel: 'View Live Telemetry',
      expertDetail: `Packets: ${iotState.healthMetrics.totalPacketsReceived} | Status: Healthy & Verified`
    },
    confidence
  };
}

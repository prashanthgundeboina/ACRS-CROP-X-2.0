import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Terminal,
  Send,
  Trash2,
  Code2,
  Copy,
  Check,
  Cpu,
  Layers,
  AlertCircle,
  HelpCircle,
  Download
} from 'lucide-react';
import { IoTDeviceState } from '../../types/iot/iotTypes';
import { CROPERX_HELLO_CMD } from '../../services/iot/deviceHandshake';

interface IoTDiagnosticsProps {
  state: IoTDeviceState;
  onSendCommand: (cmd: string) => void;
}

export const IoTDiagnostics: React.FC<IoTDiagnosticsProps> = ({ state, onSendCommand }) => {
  const [commandInput, setCommandInput] = useState('');
  const [copiedFirmware, setCopiedFirmware] = useState(false);
  const [activeTab, setActiveTab] = useState<'terminal' | 'firmware_code' | 'wiring'>('terminal');

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commandInput.trim()) return;
    onSendCommand(commandInput.trim());
    setCommandInput('');
  };

  const sampleArduinoCode = `/*
  CroperX 2.0 - ESP32 Agricultural Sensor Node Firmware
  Protocol Version: 1.0.0
  Hardware: ESP32 + Capacitive Soil Moisture Sensor + DHT22 / SHT31
*/

#include <Arduino.h>
#include <ArduinoJson.h> // install "ArduinoJson" library by Benoit Blanchon

#define SOIL_PIN 34 // ADC pin connected to capacitive soil moisture sensor
#define DHT_PIN 4   // GPIO pin for DHT22

const char* DEVICE_ID = "ESP32-FARM-001";
const char* FIRMWARE_VER = "1.0.0";
unsigned long lastTelemetryMs = 0;
const unsigned long TELEMETRY_INTERVAL = 2000; // 2 seconds

void setup() {
  Serial.begin(115200);
  pinMode(SOIL_PIN, INPUT);
  // Warm up sensors
  delay(1000);
}

void loop() {
  // Check for incoming CroperX Handshake or Commands
  if (Serial.available() > 0) {
    String cmd = Serial.readStringUntil('\\n');
    cmd.trim();
    if (cmd == "CROPERX_HELLO") {
      // Send Handshake response
      StaticJsonDocument<256> doc;
      doc["device_type"] = "ESP32";
      doc["device_id"] = DEVICE_ID;
      doc["firmware"] = FIRMWARE_VER;
      doc["protocol_version"] = "1";
      JsonArray sensors = doc.createNestedArray("sensors");
      sensors.add("soil_moisture");
      sensors.add("temperature");
      sensors.add("humidity");
      
      serializeJson(doc, Serial);
      Serial.println();
    }
  }

  // Periodic Telemetry Transmission
  if (millis() - lastTelemetryMs >= TELEMETRY_INTERVAL) {
    lastTelemetryMs = millis();

    // 1. Read Capacitive Soil Moisture Sensor (Calibrate ADC values for your probe)
    int rawSoil = analogRead(SOIL_PIN);
    // Typical ESP32 ADC: Dry air ~3200, Water ~1400
    float moisturePct = map(rawSoil, 3200, 1400, 0, 100);
    moisturePct = constrain(moisturePct, 0.0, 100.0);

    // 2. Read Temperature & Humidity (e.g. from DHT22 or analog probe)
    float tempC = 28.5; // replace with dht.readTemperature()
    float humidityPct = 68.0; // replace with dht.readHumidity()

    // 3. Format CroperX JSON Telemetry Packet
    StaticJsonDocument<256> packet;
    packet["device_id"] = DEVICE_ID;
    JsonObject sensors = packet.createNestedObject("sensors");
    
    sensors["soil_moisture"]["value"] = moisturePct;
    sensors["soil_moisture"]["unit"] = "%";
    
    sensors["temperature"]["value"] = tempC;
    sensors["temperature"]["unit"] = "°C";
    
    sensors["humidity"]["value"] = humidityPct;
    sensors["humidity"]["unit"] = "%";

    // Send single line JSON
    serializeJson(packet, Serial);
    Serial.println();
  }
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sampleArduinoCode);
    setCopiedFirmware(true);
    setTimeout(() => setCopiedFirmware(false), 2500);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#c8e6c9] shadow-sm p-6 sm:p-8 space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#c8e6c9] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gray-700">
            <Terminal className="w-4 h-4 text-[#2e7d32]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2e7d32]">
              Developer & Diagnostics Console
            </span>
          </div>
          <h3 className="text-xl font-serif font-bold text-[#1b2e1b]">
            Expert Diagnostics & Firmware Studio
          </h3>
          <p className="text-xs text-gray-500">
            Monitor raw USB Serial traffic, run manual commands, or grab the ready-to-flash ESP32 Arduino code.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center p-1 bg-gray-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('terminal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'terminal' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Live Serial Terminal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('firmware_code')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'firmware_code' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ESP32 Firmware Code
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wiring')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'wiring' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sensor Wiring Guide
          </button>
        </div>
      </div>

      {/* TAB 1: Live Serial Terminal */}
      {activeTab === 'terminal' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold text-gray-700">UART 115200 8N1 Stream</span>
            </div>

            {/* Quick Command Pills */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onSendCommand('CROPERX_HELLO')}
                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-mono font-bold transition-colors"
                title="Send CROPERX_HELLO command"
              >
                CROPERX_HELLO
              </button>
              <button
                type="button"
                onClick={() => onSendCommand('PING')}
                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-mono font-bold transition-colors"
              >
                PING
              </button>
              <button
                type="button"
                onClick={() => onSendCommand('STATUS')}
                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-mono font-bold transition-colors"
              >
                STATUS
              </button>
            </div>
          </div>

          {/* Terminal Display Container */}
          <div className="bg-[#0f1710] text-[#a5d6a7] p-4 sm:p-5 rounded-2xl font-mono text-xs h-72 overflow-y-auto space-y-1.5 border border-[#2e7d32]/40 shadow-inner">
            {state.healthMetrics.errorLog.length === 0 ? (
              <div className="text-gray-500 py-10 text-center">
                [No serial traffic logged yet. Connect a USB device or activate Developer Simulator to view real-time packets.]
              </div>
            ) : (
              state.healthMetrics.errorLog.map((log, index) => (
                <div
                  key={index}
                  className={`leading-relaxed break-all ${
                    log.severity === 'error'
                      ? 'text-rose-400'
                      : log.severity === 'warn'
                      ? 'text-amber-300'
                      : 'text-emerald-300'
                  }`}
                >
                  <span className="text-gray-500 select-none mr-2">[{log.timestamp}]</span>
                  <span>{log.message}</span>
                </div>
              ))
            )}
          </div>

          {/* Terminal Input Bar */}
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Type serial command to transmit (e.g. CROPERX_HELLO, STATUS, CALIBRATE)..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-mono outline-none focus:border-[#2e7d32] focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!commandInput.trim()}
              className="px-5 py-2.5 rounded-2xl bg-[#2e7d32] hover:bg-[#1b5e20] disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: ESP32 Firmware Code */}
      {activeTab === 'firmware_code' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600">
              Flash this standard Arduino C++ sketch to your ESP32 or ESP8266 board via the Arduino IDE.
            </p>
            <button
              type="button"
              onClick={copyToClipboard}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#2e7d32] border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              {copiedFirmware ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-[#121c12] text-gray-200 p-4 sm:p-5 rounded-2xl font-mono text-xs overflow-x-auto border border-[#2e7d32]/50 max-h-96">
            <pre>{sampleArduinoCode}</pre>
          </div>
        </div>
      )}

      {/* TAB 3: Sensor Wiring Guide */}
      {activeTab === 'wiring' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Capacitive Soil Moisture Sensor */}
            <div className="p-4 rounded-2xl bg-[#f8fcf8] border border-[#c8e6c9] space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <span className="p-1.5 rounded-xl bg-blue-100 text-blue-700">💧</span>
                <span>Capacitive Soil Moisture Probe (v1.2)</span>
              </div>
              <p className="text-xs text-gray-600">
                Corrosion-resistant analog probe providing soil dielectric measurement without soil electrolysis.
              </p>
              <div className="pt-2 text-xs font-mono space-y-1 bg-white p-3 rounded-xl border border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-500">VCC Pin:</span>
                  <span className="font-bold text-rose-600">3.3V or 5V</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">GND Pin:</span>
                  <span className="font-bold text-gray-800">ESP32 GND</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">AOUT / Analog Signal:</span>
                  <span className="font-bold text-blue-600">GPIO 34 (ADC1_CH6)</span>
                </div>
              </div>
            </div>

            {/* Temperature & Humidity Sensor */}
            <div className="p-4 rounded-2xl bg-[#f8fcf8] border border-[#c8e6c9] space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <span className="p-1.5 rounded-xl bg-amber-100 text-amber-700">🌡️</span>
                <span>DHT22 / SHT31 Ambient Sensor</span>
              </div>
              <p className="text-xs text-gray-600">
                Calibrated digital sensor measuring relative air humidity and ambient field canopy temperature.
              </p>
              <div className="pt-2 text-xs font-mono space-y-1 bg-white p-3 rounded-xl border border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-500">VCC Pin:</span>
                  <span className="font-bold text-rose-600">3.3V</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">GND Pin:</span>
                  <span className="font-bold text-gray-800">ESP32 GND</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Data Pin (with 10k pull-up):</span>
                  <span className="font-bold text-emerald-600">GPIO 4</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

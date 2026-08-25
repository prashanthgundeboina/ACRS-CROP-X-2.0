import React from 'react';
import { motion } from 'motion/react';
import {
  Droplets,
  Bug,
  CloudRain,
  Sprout,
  Calculator,
  TrendingUp,
  Sparkles,
  ChevronRight,
  type LucideIcon,
  CheckCircle2,
} from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { ActionCard } from '../ui/ActionCard';
import { AppTabId } from '../HeaderIconMenuBar';
import { FarmZone, SoilData } from '../../types';

interface MyDayActionPlannerProps {
  soilData: SoilData;
  farmZones?: FarmZone[];
  weatherRainProb?: number;
  weatherTemp?: number;
  pestRiskLevel?: 'low' | 'medium' | 'high' | 'critical';
  onSelectTab: (tab: AppTabId) => void;
  onOpenCallModal: () => void;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  actionText: string;
  tabId: AppTabId;
  icon: LucideIcon;
  severity: 'low' | 'medium' | 'high' | 'critical';
  badgeLabel: string;
  badgeVariant: 'success' | 'warning' | 'danger' | 'info';
}

export const MyDayActionPlanner: React.FC<MyDayActionPlannerProps> = ({
  soilData,
  farmZones = [],
  weatherRainProb = 20,
  weatherTemp = 31,
  pestRiskLevel = 'medium',
  onSelectTab,
  onOpenCallModal,
}) => {
  // Dynamically compute the 3 most crucial actions for today
  const actions: ActionItem[] = [];

  // 1. Water Action Evaluation
  if (soilData.moisture < 35 || (farmZones.length > 0 && farmZones.some(z => z.moisture < 35))) {
    const dryZone = farmZones.find(z => z.moisture < 35)?.name || 'North Field';
    actions.push({
      id: 'water-action',
      title: `💧 Water ${dryZone}`,
      description: `Soil moisture has dropped to ${soilData.moisture}%. Irrigate root zone to prevent crop moisture stress.`,
      actionText: 'Open Farm Layout',
      tabId: 'farm',
      icon: Droplets,
      severity: 'high',
      badgeLabel: 'Moisture Low',
      badgeVariant: 'warning',
    });
  } else {
    actions.push({
      id: 'water-action',
      title: '💧 Maintain Moisture Level',
      description: `Soil moisture is healthy at ${soilData.moisture}%. Next irrigation scheduled in 2 days.`,
      actionText: 'View Soil Probes',
      tabId: 'sensors',
      icon: Droplets,
      severity: 'low',
      badgeLabel: 'Optimal Water',
      badgeVariant: 'success',
    });
  }

  // 2. Pest & Health Scan Action Evaluation
  if (pestRiskLevel === 'high' || pestRiskLevel === 'critical' || soilData.humidity > 70) {
    actions.push({
      id: 'pest-action',
      title: '🐛 Check Plants & Scan Leaves',
      description: `High humidity (${soilData.humidity}%) increases fungal spore outbreak risk. Inspect leaves for spots.`,
      actionText: 'Scan Plant Photo',
      tabId: 'diagnostics',
      icon: Bug,
      severity: 'high',
      badgeLabel: 'Pest Risk High',
      badgeVariant: 'danger',
    });
  } else {
    actions.push({
      id: 'pest-action',
      title: '🌿 Preventive Crop Scan',
      description: 'Perform a routine leaf pathology check using Gemini AI Vision to catch early symptoms.',
      actionText: 'Scan Plant',
      tabId: 'diagnostics',
      icon: Sprout,
      severity: 'low',
      badgeLabel: 'Routine Check',
      badgeVariant: 'info',
    });
  }

  // 3. Weather / Fertilizer / Harvest Action Evaluation
  if (weatherRainProb > 50) {
    actions.push({
      id: 'weather-action',
      title: '🌧️ Prepare for Incoming Rain',
      description: `High precipitation probability (${weatherRainProb}%). Clear field drainage channels and pause pesticide spraying.`,
      actionText: 'View Live Weather',
      tabId: 'weather',
      icon: CloudRain,
      severity: 'medium',
      badgeLabel: 'Rain Alert',
      badgeVariant: 'info',
    });
  } else if (soilData.nitrogen < 120) {
    actions.push({
      id: 'fertilizer-action',
      title: '🧪 Apply Nitrogen Boost (Urea)',
      description: `Soil Nitrogen is at ${soilData.nitrogen} kg/ha (Deficit of ${140 - soilData.nitrogen} kg/ha). Apply recommended bag count.`,
      actionText: 'Calculate Fertilizer',
      tabId: 'fertilizer',
      icon: Calculator,
      severity: 'medium',
      badgeLabel: 'Nutrient Deficit',
      badgeVariant: 'warning',
    });
  } else {
    actions.push({
      id: 'market-action',
      title: '📈 Check Today Mandi Price',
      description: 'Commodity prices for Rice and Maize are up +8% in regional Mandi markets today.',
      actionText: 'View Mandi ROI',
      tabId: 'market',
      icon: TrendingUp,
      severity: 'low',
      badgeLabel: 'Market Trend',
      badgeVariant: 'success',
    });
  }

  return (
    <section className="my-8">
      <SectionHeader
        title="What Should I Do Today?"
        subtitle="AI-prioritized farm tasks based on real-time weather, soil moisture, pest pressure & crop stage."
        icon={Sparkles}
        actionElement={
          <button
            onClick={onOpenCallModal}
            className="text-xs font-bold text-[#2e7d32] hover:underline flex items-center gap-1 cursor-pointer font-mono"
          >
            <span>Ask Voice AI to explain tasks</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action, idx) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.3 }}
          >
            <ActionCard
              title={action.title}
              description={action.description}
              actionText={action.actionText}
              onAction={() => onSelectTab(action.tabId)}
              icon={action.icon}
              severity={action.severity}
              badge={{
                label: action.badgeLabel,
                variant: action.badgeVariant,
              }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

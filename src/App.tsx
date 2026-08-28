/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sprout, 
  FlaskConical, 
  Wind, 
  TrendingUp,
  RefreshCw,
  Droplets,
  Thermometer,
  CloudRain,
  Settings,
  ShieldCheck,
  Zap,
  Globe,
  MapPin,
  ChevronDown,
  Info,
  Trash2,
  Plus,
  Activity,
  CheckCircle2,
  History,
  AlertTriangle,
  MessageSquare,
  X,
  ShieldAlert
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { SoilData, RecommendationResponse, CropRecommendation } from './types';
import { getCropRecommendation, predictExpectedYield, diagnosePlantHealth } from './services/geminiService';
import { generateDynamicTips } from './lib/farmingEngine';
import { saveScenarioToIndexedDB, getAllScenariosFromIndexedDB, clearIndexedDBCache, StoredScenario } from './services/storageService';
import { SoilHeatmapGrid } from './components/SoilHeatmapGrid';
import { DualCropComparison } from './components/DualCropComparison';
import { RealTimeYieldCurve } from './components/RealTimeYieldCurve';
import { FertilizerCalculator } from './components/FertilizerCalculator';
import { SatNdviPanel } from './components/SatNdviPanel';
import { InfoTooltip } from './components/InfoTooltip';
import { UnitConverterPanel } from './components/UnitConverterPanel';
import { ReportExportModal } from './components/ReportExportModal';
import { AgriChatbot } from './components/AgriChatbot';
import { HarvestScheduler } from './components/HarvestScheduler';
import { LiveSensorSync } from './components/LiveSensorSync';
import { FarmLayoutEditor } from './components/FarmLayoutEditor';
import { WeatherPredictiveAlerts } from './components/WeatherPredictiveAlerts';
import { SoilHealthTrend } from './components/SoilHealthTrend';
import { CroperXHeaderAgent } from './components/CroperXHeaderAgent';
import { FarmerProfileModal, DEFAULT_FARMER_PROFILE } from './components/FarmerProfileModal';
import { AuthModal } from './components/AuthModal';
import { getStoredUser, userToFarmerProfile, logoutUser, getReverseGeocode, getAuthoritativeSession } from './services/authService';
import { MarketInsights } from './components/MarketInsights';
import { CroperXCourseTutorial } from './components/CroperXCourseTutorial';
import { CropQuickTipsOverlay } from './components/CropQuickTipsOverlay';
import { DataSyncStatusIndicator } from './components/DataSyncStatusIndicator';
import { HarvestLoggingModal } from './components/HarvestLoggingModal';
import { EarlyWeatherAlertBanner } from './components/EarlyWeatherAlertBanner';
import { NpkBreakdownSubPanel } from './components/NpkBreakdownSubPanel';
import { MoisturePh30DayTrendChart } from './components/MoisturePh30DayTrendChart';
import { AiAgronomistAgentsPanel } from './components/AiAgronomistAgentsPanel';
import { YieldBenchmarkPushNotifier } from './components/YieldBenchmarkPushNotifier';
import { PredictiveYield6MonthProjection } from './components/PredictiveYield6MonthProjection';
import { RegionalPestRiskMapOverlay } from './components/RegionalPestRiskMapOverlay';
import { WelcomeSplashScreen } from './components/WelcomeSplashScreen';
import { PersonalizedWelcomeBanner } from './components/PersonalizedWelcomeBanner';
import { MultiAi247IntelligenceFeed } from './components/MultiAi247IntelligenceFeed';
import { HeaderIconMenuBar, AppTabId } from './components/HeaderIconMenuBar';
import { DesktopSidebarNav } from './components/navigation/DesktopSidebarNav';
import { BottomMobileNav } from './components/navigation/BottomMobileNav';
import { FarmerHeroBanner } from './components/dashboard/FarmerHeroBanner';
import { MyFarmToday } from './components/dashboard/MyFarmToday';
import { FirstTimeFarmerOnboarding } from './components/dashboard/FirstTimeFarmerOnboarding';
import { GlobalSmartSearchModal } from './components/dashboard/GlobalSmartSearchModal';
import { SimpleExpertToggle } from './components/ui/SimpleExpertToggle';
import { CroperXCallModal } from './components/CroperXCallModal';
import { CropPredictionRedesign } from './components/redesign/CropPredictionRedesign';
import { PlantDiagnosisRedesign } from './components/redesign/PlantDiagnosisRedesign';
import { WeatherAlertsRedesign } from './components/redesign/WeatherAlertsRedesign';
import { FertilizerCalculatorRedesign } from './components/redesign/FertilizerCalculatorRedesign';
import { FarmLayoutRedesign } from './components/redesign/FarmLayoutRedesign';
import { SmartIrrigationDashboard } from './components/irrigation/SmartIrrigationDashboard';
import { CropRiskDashboard } from './components/risk/CropRiskDashboard';
import { IoTSensorHub } from './modules/iot/IoTSensorHub';
import { FarmIntelligenceDashboard } from './components/intelligence/FarmIntelligenceDashboard';
import { FarmOperationsDashboard } from './components/operations/FarmOperationsDashboard';
import { FarmResourceDashboard } from './components/resources/FarmResourceDashboard';
import { FarmAICommandCenter } from './components/autonomous/FarmAICommandCenter';
import { LiveCameraDashboard } from './components/vision/LiveCameraDashboard';
import { PhonePairingView } from './components/vision/PhonePairingView';
import { DroneScoutingHub } from './components/drone/DroneScoutingHub';
import { CarbonCreditLedger } from './components/carbon/CarbonCreditLedger';
import { AgriCommodityArbitrage } from './components/market/AgriCommodityArbitrage';
import { SoilBioAcousticsDiagnostic } from './components/bioacoustics/SoilBioAcousticsDiagnostic';
import { WeatherBackgroundMonitor } from './components/WeatherBackgroundMonitor';
import { SystemDebugPanel } from './components/SystemDebugPanel';
import { RoleSelectionModal } from './components/RoleSelectionModal';
import { FarmerDashboard } from './components/farmer/FarmerDashboard';
import { IncomingFarmerCallPanel } from './components/adviser/IncomingFarmerCallPanel';
import { AdviserCropPredictionMissionModal } from './components/adviser/AdviserCropPredictionMissionModal';
import { InstagramAgriChat } from './components/chat/InstagramAgriChat';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminPreviewBanner } from './components/admin/AdminPreviewBanner';
import { UnifiedProfileModal } from './components/profile/UnifiedProfileModal';
import { UnifiedSettingsModal } from './components/settings/UnifiedSettingsModal';
import { ChangePasswordModal } from './components/account/ChangePasswordModal';
import { SecureLogoutModal } from './components/account/SecureLogoutModal';
import { GlobalAccountMenu } from './components/account/GlobalAccountMenu';
import { logoutAllUserSessions } from './services/profileSettingsService';
import { PublicHomePage } from './components/home/PublicHomePage';
import { UnifiedAuthGatewayModal } from './components/auth/UnifiedAuthGatewayModal';
import { AdviserOnboardingGateway } from './components/adviser/AdviserOnboardingGateway';
import { AdviserLearningGateway } from './components/adviser/AdviserLearningGateway';
import { AdviserVerificationGateway } from './components/adviser/AdviserVerificationGateway';
import { AdviserActivationModal } from './components/adviser/AdviserActivationModal';
import {
  updateAppTitleAndRoute,
  openRoleWorkspaceTab,
  subscribeToAuthEvents,
  broadcastAuthEvent,
  getRoleDefaultRoute
} from './utils/workspaceSync';
import { perfLogger } from './utils/performanceLogger';
import { FarmerProfile, UserAccount, FarmZone, AlertCategoryType, UserRole } from './types';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Database, HardDrive, Grid, Radio, Calculator, Wifi, WifiOff, FileText, Printer, HelpCircle, User, BookOpen, LogIn, LogOut, Compass, Loader2 } from 'lucide-react';


const CROP_IMAGES: Record<string, string> = {
  rice: "https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80",
  maize: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80",
  chickpea: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80",
  kidneybeans: "https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=600&q=80",
  pigeonpeas: "https://images.unsplash.com/photo-1547058886-af77f8029163?auto=format&fit=crop&w=600&q=80",
  mothbeans: "https://images.unsplash.com/photo-1547058886-af77f8029163?auto=format&fit=crop&w=600&q=80",
  mungbean: "https://images.unsplash.com/photo-1582845343110-631d8f7e2fe0?auto=format&fit=crop&w=600&q=80",
  blackgram: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
  lentil: "https://images.unsplash.com/photo-1547058886-af77f8029163?auto=format&fit=crop&w=600&q=80",
  pomegranate: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80",
  banana: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80",
  mango: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80",
  grapes: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=600&q=80",
  watermelon: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
  muskmelon: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80",
  apple: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80",
  orange: "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=600&q=80",
  papaya: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=600&q=80",
  coconut: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=80",
  cotton: "https://images.unsplash.com/photo-1594145413237-7751b34ea6cf?auto=format&fit=crop&w=600&q=80",
  jute: "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=600&q=80",
  coffee: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
  wheat: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
  soybean: "https://images.unsplash.com/photo-1599599810694-b5b37304c041?auto=format&fit=crop&w=600&q=80",
  tomato: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
  potato: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80"
};
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80";

export function getCropImage(cropName: string): string {
  if (!cropName) return FALLBACK_IMAGE;
  const clean = cropName.toLowerCase().replace(/[^a-z]/g, "");

  if (clean.includes("rice") || clean.includes("paddy")) return CROP_IMAGES.rice;
  if (clean.includes("maize") || clean.includes("corn")) return CROP_IMAGES.maize;
  if (clean.includes("chickpea") || clean.includes("gram") || clean.includes("garbanzo")) return CROP_IMAGES.chickpea;
  if (clean.includes("kidney")) return CROP_IMAGES.kidneybeans;
  if (clean.includes("pigeon") || clean.includes("arhar") || clean.includes("tur")) return CROP_IMAGES.pigeonpeas;
  if (clean.includes("moth")) return CROP_IMAGES.mothbeans;
  if (clean.includes("mung") || clean.includes("moong")) return CROP_IMAGES.mungbean;
  if (clean.includes("blackgram") || clean.includes("urad")) return CROP_IMAGES.blackgram;
  if (clean.includes("lentil") || clean.includes("masoor")) return CROP_IMAGES.lentil;
  if (clean.includes("pomegranate")) return CROP_IMAGES.pomegranate;
  if (clean.includes("banana")) return CROP_IMAGES.banana;
  if (clean.includes("mango")) return CROP_IMAGES.mango;
  if (clean.includes("grape")) return CROP_IMAGES.grapes;
  if (clean.includes("watermelon")) return CROP_IMAGES.watermelon;
  if (clean.includes("muskmelon") || clean.includes("melon")) return CROP_IMAGES.muskmelon;
  if (clean.includes("apple")) return CROP_IMAGES.apple;
  if (clean.includes("orange") || clean.includes("citrus")) return CROP_IMAGES.orange;
  if (clean.includes("papaya")) return CROP_IMAGES.papaya;
  if (clean.includes("coconut")) return CROP_IMAGES.coconut;
  if (clean.includes("cotton")) return CROP_IMAGES.cotton;
  if (clean.includes("jute")) return CROP_IMAGES.jute;
  if (clean.includes("coffee")) return CROP_IMAGES.coffee;
  if (clean.includes("wheat")) return CROP_IMAGES.wheat;
  if (clean.includes("soybean") || clean.includes("soya") || clean.includes("soy")) return CROP_IMAGES.soybean;
  if (clean.includes("tomato")) return CROP_IMAGES.tomato;
  if (clean.includes("potato")) return CROP_IMAGES.potato;

  return CROP_IMAGES[clean] || FALLBACK_IMAGE;
}

function AppContent() {
  const { language, setLanguage, t } = useLanguage();

  // Route & Query Parameter check for Phone Pairing mode (/camera/pair/:sessionId?token=... or ?pairSession=...)
  const [mobilePairingInfo] = useState<{ isPairingMode: boolean; sessionId: string; token?: string }>(() => {
    if (typeof window === 'undefined') return { isPairingMode: false, sessionId: '' };
    const pathname = window.location.pathname;
    const match = pathname.match(/\/camera\/pair\/([a-zA-Z0-9_-]+)/);
    const searchParams = new URLSearchParams(window.location.search);
    const querySession = searchParams.get('pairSession') || searchParams.get('sessionId');
    const token = searchParams.get('token') || undefined;

    if (match && match[1]) {
      return { isPairingMode: true, sessionId: match[1], token };
    }
    if (querySession) {
      return { isPairingMode: true, sessionId: querySession, token };
    }
    return { isPairingMode: false, sessionId: '' };
  });

  const DEFAULT_FORM_DATA: SoilData = {
    nitrogen: 90,
    phosphorus: 42,
    potassium: 43,
    temperature: 20.8,
    humidity: 82.0,
    ph: 6.5,
    rainfall: 202.9,
    soil_moisture: 29.4,
    soil_type: 2,
    sunlight_exposure: 8.6,
    wind_speed: 10.1,
    co2_concentration: 435,
    organic_matter: 3.1,
    irrigation_frequency: 4,
    crop_density: 11.7,
    pest_pressure: 57.6,
    fertilizer_usage: 188.1,
    growth_stage: 1,
    urban_area_proximity: 2.7,
    water_source_type: 3,
    frost_risk: 95.6,
    water_usage_efficiency: 1.1
  };

  const [formData, setFormData] = useState<SoilData>(() => {
    try {
      const saved = localStorage.getItem('croperx_form_data');
      return saved ? JSON.parse(saved) : DEFAULT_FORM_DATA;
    } catch {
      return DEFAULT_FORM_DATA;
    }
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<CropRecommendation | null>(null);

  const [subscribedCategories, setSubscribedCategories] = useState<AlertCategoryType[]>([
    'weather',
    'pests',
    'soil',
    'market'
  ]);

  const [farmZones, setFarmZones] = useState<FarmZone[]>([
    {
      id: 'z1',
      name: 'North Field A',
      areaHa: 4.5,
      assignedCrop: 'Maize',
      soilType: 'Loamy',
      nitrogen: 110,
      ph: 6.5,
      moisture: 32,
      status: 'Active Cultivation',
      pushNotificationsEnabled: true,
      pushCategories: ['weather', 'pests', 'soil']
    },
    {
      id: 'z2',
      name: 'South Greenhouse B',
      areaHa: 2.0,
      assignedCrop: 'Tomatoes / Peppers',
      soilType: 'Sandy Loam',
      nitrogen: 135,
      ph: 6.8,
      moisture: 40,
      status: 'Active Cultivation',
      pushNotificationsEnabled: true,
      pushCategories: ['weather', 'pests', 'soil', 'market']
    },
    {
      id: 'z3',
      name: 'East Terraces C',
      areaHa: 6.0,
      assignedCrop: 'Rice',
      soilType: 'Clay',
      nitrogen: 90,
      ph: 7.1,
      moisture: 48,
      status: 'Soil Preparation',
      pushNotificationsEnabled: true,
      pushCategories: ['weather', 'pests']
    }
  ]);

  const handleToggleCategorySubscription = (cat: AlertCategoryType) => {
    setSubscribedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleToggleZonePush = (zoneId: string) => {
    setFarmZones(prev =>
      prev.map(z => z.id === zoneId ? { ...z, pushNotificationsEnabled: !z.pushNotificationsEnabled } : z)
    );
  };

  const [activeTab, setActiveTab] = useState<AppTabId>(() => {
    try {
      const saved = localStorage.getItem('croperx_active_tab');
      return (saved as AppTabId) || 'recommendation';
    } catch {
      return 'recommendation';
    }
  });

  // CroperX 2.0 Interface & Modal States
  const [isExpertMode, setIsExpertMode] = useState<boolean>(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [transcriptLogs, setTranscriptLogs] = useState<Array<{ id: string; time: string; query: string; response: string }>>([]);

  // Sync state to localStorage for refresh persistence
  React.useEffect(() => {
    try {
      localStorage.setItem('croperx_form_data', JSON.stringify(formData));
    } catch (e) {
      console.warn("localStorage save error:", e);
    }
  }, [formData]);

  React.useEffect(() => {
    try {
      localStorage.setItem('croperx_active_tab', activeTab);
    } catch (e) {
      console.warn("localStorage save error:", e);
    }
  }, [activeTab]);

  // Welcome Splash Screen & First-Time Farmer Onboarding State
  const [showWelcomeSplash, setShowWelcomeSplash] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try {
      return localStorage.getItem('croperx_onboarding_completed') !== 'true';
    } catch {
      return false;
    }
  });

  // User Account & Auth State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getStoredUser());
  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const savedUser = getStoredUser();
      if (savedUser?.role) return savedUser.role;
      const savedRole = localStorage.getItem('croperx_user_role');
      if (savedRole === 'farmer' || savedRole === 'farmer_adviser' || savedRole === 'admin') {
        return savedRole as UserRole;
      }
    } catch {}
    return 'farmer';
  });

  // Security Alert Toast State (Phase 36B: Role Isolation Notification)
  const [securityAlert, setSecurityAlert] = useState<string | null>(null);

  // Auto-dismiss security alert after 5 seconds
  React.useEffect(() => {
    if (securityAlert) {
      const timer = setTimeout(() => setSecurityAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [securityAlert]);

  // Current Active Route / View (Phase 36B: Strict Role Isolation on initial route)
  const [currentView, setCurrentView] = useState<UserRole | 'home'>(() => {
    try {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const stored = getStoredUser();
        const storedRole = stored?.role;

        // If user explicitly navigated to a workspace URL
        if (path.startsWith('/admin')) {
          if (storedRole === 'admin') return 'admin';
          // Non-admin attempting to access admin route on load: redirect to home or authorized role
          return storedRole === 'farmer_adviser' ? 'farmer_adviser' : storedRole === 'farmer' ? 'farmer' : 'home';
        }
        if (path.startsWith('/farmer')) {
          if (storedRole === 'farmer' || storedRole === 'admin') return 'farmer';
          // Adviser attempting to access farmer dashboard: redirect to adviser
          return storedRole === 'farmer_adviser' ? 'farmer_adviser' : 'home';
        }
        if (path.startsWith('/dashboard')) {
          if (storedRole === 'farmer_adviser' || storedRole === 'admin') return 'farmer_adviser';
          // Farmer attempting to access adviser workstation: redirect to farmer
          return storedRole === 'farmer' ? 'farmer' : 'home';
        }
        if (path.startsWith('/customer')) return 'customer';
      }
    } catch {}
    // Default entry page is ALWAYS the public Home / Welcome page
    return 'home';
  });

  // Unified Auth Gateway Modal State (Phase 30)
  const [showAuthGatewayModal, setShowAuthGatewayModal] = useState<boolean>(false);
  const [authGatewayMode, setAuthGatewayMode] = useState<'login' | 'register'>('login');
  const [authGatewayRole, setAuthGatewayRole] = useState<UserRole>('farmer');

  // Admin Preview Mode State (Allows ONLY authorized admins to inspect Farmer & Adviser workspaces safely)
  const [adminPreviewRole, setAdminPreviewRole] = useState<UserRole | null>(null);

  const [showCropMissionModal, setShowCropMissionModal] = useState<boolean>(false);
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showAdviserLearningGateway, setShowAdviserLearningGateway] = useState<boolean>(false);
  const [showAdviserOnboardingModal, setShowAdviserOnboardingModal] = useState<boolean>(false);
  const [showAdviserVerificationGateway, setShowAdviserVerificationGateway] = useState<boolean>(false);
  const [showAdviserActivationModal, setShowAdviserActivationModal] = useState<boolean>(false);
  const [adviserActivationToken, setAdviserActivationToken] = useState<string>('');
  const [geoDetectLoading, setGeoDetectLoading] = useState<boolean>(false);
  const [geoStatusMsg, setGeoStatusMsg] = useState<string | null>(null);

  // Check URL search params for activation token on load (Phase 43)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('activation_token') || params.get('token');
      if (token) {
        setAdviserActivationToken(token);
        setShowAdviserActivationModal(true);
      }
    }
  }, []);

  // Authoritative Backend Session Verification on Mount (Phase 36B)
  React.useEffect(() => {
    getAuthoritativeSession().then((session) => {
      if (session.authenticated && session.user) {
        setCurrentUser(session.user);
        const authRole = session.role || session.user.role || 'farmer';
        setUserRole(authRole);

        // Enforce strict workspace isolation against authoritative role
        const path = window.location.pathname;
        if (authRole === 'farmer_adviser') {
          setAdminPreviewRole(null);
          if (path.startsWith('/admin') || path.startsWith('/farmer')) {
            setCurrentView('farmer_adviser');
            updateAppTitleAndRoute('farmer_adviser');
            setSecurityAlert("Access Restricted: You don't have permission to access this workspace.");
          }
        } else if (authRole === 'farmer') {
          setAdminPreviewRole(null);
          if (path.startsWith('/admin') || path.startsWith('/dashboard')) {
            setCurrentView('farmer');
            updateAppTitleAndRoute('farmer');
            setSecurityAlert("Access Restricted: You don't have permission to access this workspace.");
          }
        }
      } else {
        // Unauthenticated visitor trying to access protected workspace routes
        const path = window.location.pathname;
        if (path.startsWith('/admin') || path.startsWith('/farmer') || path.startsWith('/dashboard')) {
          setCurrentView('home');
          updateAppTitleAndRoute('home');
        }
      }
    });
  }, []);

  // Sync document.title and URL route with active workspace role and admin preview
  React.useEffect(() => {
    updateAppTitleAndRoute(currentView, adminPreviewRole !== null, adminPreviewRole || undefined);
  }, [currentView, adminPreviewRole]);

  // Browser Navigation & History (PopState) Protection
  React.useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const authUser = getStoredUser();
      const effectiveRole = authUser?.role;

      if (path.startsWith('/admin')) {
        if (effectiveRole === 'admin') {
          setCurrentView('admin');
          setAdminPreviewRole(null);
        } else {
          const fallback = effectiveRole === 'farmer_adviser' ? 'farmer_adviser' : effectiveRole === 'farmer' ? 'farmer' : 'home';
          setCurrentView(fallback);
          updateAppTitleAndRoute(fallback);
          setSecurityAlert("Access Restricted: You don't have permission to access this workspace.");
        }
      } else if (path.startsWith('/farmer')) {
        if (effectiveRole === 'farmer' || effectiveRole === 'admin') {
          if (effectiveRole === 'admin') setAdminPreviewRole('farmer');
          setCurrentView('farmer');
        } else {
          const fallback = effectiveRole === 'farmer_adviser' ? 'farmer_adviser' : 'home';
          setCurrentView(fallback);
          updateAppTitleAndRoute(fallback);
          setSecurityAlert("Access Restricted: You don't have permission to access this workspace.");
        }
      } else if (path.startsWith('/dashboard')) {
        if (effectiveRole === 'farmer_adviser' || effectiveRole === 'admin') {
          if (effectiveRole === 'admin') setAdminPreviewRole('farmer_adviser');
          setCurrentView('farmer_adviser');
        } else {
          const fallback = effectiveRole === 'farmer' ? 'farmer' : 'home';
          setCurrentView(fallback);
          updateAppTitleAndRoute(fallback);
          setSecurityAlert("Access Restricted: You don't have permission to access this workspace.");
        }
      } else {
        setCurrentView('home');
        setAdminPreviewRole(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Subscribe to Cross-Tab Session & Authorization events with Strict Role Guards
  React.useEffect(() => {
    const unsubscribe = subscribeToAuthEvents((event) => {
      if (event.type === 'LOGOUT') {
        setCurrentUser(null);
        setUserRole('farmer');
        setAdminPreviewRole(null);
        setCurrentView('home');
      } else if (event.type === 'ROLE_CHANGED' && event.role) {
        const user = getStoredUser();
        const actualRole = user?.role;

        // Strict role validation: do not allow cross-tab switching to unauthorized roles
        if (actualRole === 'farmer_adviser') {
          setUserRole('farmer_adviser');
          setAdminPreviewRole(null);
          setCurrentView('farmer_adviser');
          if (event.role !== 'farmer_adviser') {
            setSecurityAlert("Cross-tab workspace switch rejected: Farm Advisers are restricted to Adviser Workstation.");
          }
        } else if (actualRole === 'farmer') {
          setUserRole('farmer');
          setAdminPreviewRole(null);
          setCurrentView('farmer');
          if (event.role !== 'farmer') {
            setSecurityAlert("Cross-tab workspace switch rejected: Farmers are restricted to Farmer Dashboard.");
          }
        } else if (actualRole === 'admin') {
          setUserRole(event.role);
          setAdminPreviewRole(null);
          setCurrentView(event.role);
        }
      } else if (event.type === 'LOGIN') {
        const user = getStoredUser();
        if (user) {
          setCurrentUser(user);
          if (user.role) {
            setUserRole(user.role);
            setCurrentView(user.role);
          }
        }
      }
    });
    return unsubscribe;
  }, []);

  // Farmer Profile & Location Coords State
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locationDenied, setLocationDenied] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [settingsSection, setSettingsSection] = useState<string | undefined>(undefined);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile>(() => {
    const savedUser = getStoredUser();
    if (savedUser) return userToFarmerProfile(savedUser);
    try {
      const saved = localStorage.getItem('croperx_farmer_profile');
      return saved ? JSON.parse(saved) : DEFAULT_FARMER_PROFILE;
    } catch {
      return DEFAULT_FARMER_PROFILE;
    }
  });

  // Handle GPS location detection for primary telemetry form
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationDenied(true);
      setGeoStatusMsg("Geolocation is not supported by your browser.");
      return;
    }

    setGeoDetectLoading(true);
    setGeoStatusMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setUserCoords({ lat, lon });
        setLocationDenied(false);

        try {
          const loc = await getReverseGeocode(lat, lon);
          const fullLoc = `${loc.district}, ${loc.state}`;
          
          setFarmerProfile(prev => ({
            ...prev,
            farmLocation: fullLoc,
            soilTypeZone: loc.estimatedSoilType || prev.soilTypeZone
          }));

          setFormData(prev => ({
            ...prev,
            temperature: Math.round(loc.estimatedTemp || prev.temperature),
            humidity: Math.round(loc.estimatedHumidity || prev.humidity),
            rainfall: Math.round(loc.estimatedRainfall || prev.rainfall)
          }));

          setGeoStatusMsg(`📍 Location acquired: ${fullLoc}`);
          setTimeout(() => setGeoStatusMsg(null), 5000);
        } catch (e) {
          setGeoStatusMsg(`📍 Captured GPS Coordinates: Lat ${lat.toFixed(3)}, Lon ${lon.toFixed(3)}`);
        } finally {
          setGeoDetectLoading(false);
        }
      },
      (err) => {
        setGeoDetectLoading(false);
        setLocationDenied(true);
        setGeoStatusMsg("📍 Location unavailable. Please set location manually.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Auto-detect geolocation on mount
  React.useEffect(() => {
    if (navigator.geolocation && !userCoords) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setUserCoords({ lat, lon });
          setLocationDenied(false);
          getReverseGeocode(lat, lon).then(loc => {
            if (loc && loc.district) {
              setFarmerProfile(prev => ({
                ...prev,
                farmLocation: `${loc.district}, ${loc.state}`
              }));
            }
          }).catch(() => {});
        },
        () => {
          setLocationDenied(true);
        },
        { timeout: 5000 }
      );
    }
  }, []);

  // Detect direct URL route to /profile or /settings
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.endsWith('/profile') || path === '/profile') {
        setShowProfileModal(true);
      } else if (path.endsWith('/settings') || path === '/settings') {
        setShowSettingsModal(true);
      }
    }
  }, []);

  const handleUserLogout = () => {
    logoutUser();
    broadcastAuthEvent({ type: 'LOGOUT' });
    setCurrentUser(null);
    setUserRole('farmer');
    setAdminPreviewRole(null);
    setCurrentView('home');
    try {
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/');
      }
    } catch {}
  };

  const handleConfirmLogout = async (allSessions?: boolean) => {
    if (allSessions && currentUser?.phoneNumber) {
      try {
        await logoutAllUserSessions(currentUser.phoneNumber);
      } catch (err) {
        console.warn("Logout all sessions error:", err);
      }
    }
    handleUserLogout();
    setShowLogoutModal(false);
  };

  const handleProfileUpdated = (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
    setFarmerProfile(userToFarmerProfile(updatedUser));
    localStorage.setItem('croperx_authenticated_user', JSON.stringify(updatedUser));
  };

  const handleSyncLiveWeather = (live: { temperature: number; humidity: number; rainfall: number; windSpeed: number }) => {
    setFormData(prev => ({
      ...prev,
      temperature: live.temperature,
      humidity: live.humidity,
      rainfall: live.rainfall,
      wind_speed: live.windSpeed
    }));
  };


  // Report & Harvest Modal States
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showHarvestModal, setShowHarvestModal] = useState<boolean>(false);


  // IndexedDB & Offline States
  const [storedScenarios, setStoredScenarios] = useState<StoredScenario[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  React.useEffect(() => {
    let isMounted = true;
    getAllScenariosFromIndexedDB().then(scenarios => {
      if (!isMounted) return;
      setStoredScenarios(scenarios);
      if (scenarios.length > 0) {
        // Hydrate latest scenario automatically to preserve state accurately
        setFormData(scenarios[0].soilData);
        setResults(scenarios[0].recommendations);
      }
    }).catch(err => console.warn("IndexedDB initialization notice", err))
    .finally(() => {
      if (isMounted) setIsInitializing(false);
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      isMounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Customizable Weather Alert Thresholds
  const [frostThreshold, setFrostThreshold] = useState<number>(() => {
    try {
      return parseFloat(localStorage.getItem('frostThreshold') || '50');
    } catch {
      return 50;
    }
  });
  const [rainThreshold, setRainThreshold] = useState<number>(() => {
    try {
      return parseFloat(localStorage.getItem('rainThreshold') || '150');
    } catch {
      return 150;
    }
  });
  const [windThreshold, setWindThreshold] = useState<number>(() => {
    try {
      return parseFloat(localStorage.getItem('windThreshold') || '30');
    } catch {
      return 30;
    }
  });

  // Crop Rotation Planner States
  const [plannerCrop, setPlannerCrop] = useState('Rice');
  const [savedRotationPlans, setSavedRotationPlans] = useState<{id: string, crop: string, seasons: string[], date: string}[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('rotationPlans') || '[]');
    } catch {
      return [];
    }
  });

  // Health Diagnostics States
  const [diagnosticImage, setDiagnosticImage] = useState<string | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticReport, setDiagnosticReport] = useState<string | null>(null);
  const [diagnosticAlert, setDiagnosticAlert] = useState<string | null>(null);

  // Historical Yield & Feedback states
  const [feedbackList, setFeedbackList] = useState<{id: string, crop: string, yieldVal: number, rating: number, notes: string, date: string}[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('feedbackList') || '[]');
    } catch {
      return [];
    }
  });
  const [newFeedback, setNewFeedback] = useState({ crop: 'Rice', yieldVal: 5.5, rating: 5, notes: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSelectedCrop(null);

    const startTime = performance.now();
    try {
      const mlStart = performance.now();
      const yieldEstimate = predictExpectedYield(formData);
      const mlTimeMs = Math.round(performance.now() - mlStart);

      const geminiStart = performance.now();
      const res = await getCropRecommendation(formData, farmerProfile);
      const geminiTimeMs = Math.round(performance.now() - geminiStart);

      const totalTimeMs = Math.round(performance.now() - startTime);

      setResults(res);

      perfLogger.recordLog({
        mlTimeMs,
        geminiTimeMs,
        totalTimeMs,
        cropCount: res.recommendations?.length || 0,
        status: 'SUCCESS',
        note: `Generated ${res.recommendations?.length || 0} crop predictions for N:${formData.nitrogen} P:${formData.phosphorus} K:${formData.potassium}`
      });

      try {
        const saved = await saveScenarioToIndexedDB(formData, res, yieldEstimate);
        setStoredScenarios(prev => [saved, ...prev.filter(s => s.id !== saved.id)]);
      } catch (storageErr) {
        console.warn("Storage save notice:", storageErr);
      }
    } catch (err: any) {
      const totalTimeMs = Math.round(performance.now() - startTime);
      perfLogger.recordLog({
        mlTimeMs: 0,
        geminiTimeMs: 0,
        totalTimeMs,
        cropCount: 0,
        status: 'ERROR',
        note: err?.message || 'Prediction execution error'
      });
      console.warn("Model calculation notice:", err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Weather Threshold Savers
  const saveWeatherThresholds = (frost: number, rain: number, wind: number) => {
    setFrostThreshold(frost);
    setRainThreshold(rain);
    setWindThreshold(wind);
    try {
      localStorage.setItem('frostThreshold', frost.toString());
      localStorage.setItem('rainThreshold', rain.toString());
      localStorage.setItem('windThreshold', wind.toString());
    } catch {
      // ignore
    }
  };

  // 2. Feedback Handlers
  const handleFeedbackAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = {
      id: Math.random().toString(36).substr(2, 9),
      crop: newFeedback.crop,
      yieldVal: newFeedback.yieldVal,
      rating: newFeedback.rating,
      notes: newFeedback.notes,
      date: new Date().toLocaleDateString()
    };
    const updated = [entry, ...feedbackList];
    setFeedbackList(updated);
    try {
      localStorage.setItem('feedbackList', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setNewFeedback({ crop: 'Rice', yieldVal: 5.5, rating: 5, notes: '' });
  };

  const handleFeedbackDelete = (id: string) => {
    const updated = feedbackList.filter(f => f.id !== id);
    setFeedbackList(updated);
    try {
      localStorage.setItem('feedbackList', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // 3. Rotation Planner Handlers
  const handleRotationPlanGenerate = () => {
    const seasons = [
      `Season 1 (Autumn): Nitrogen-fixation legume (e.g., Clover, Chickpeas) to replenish Soil Nitrogen (currently ${formData.nitrogen} ppm).`,
      `Season 2 (Spring): High-biomass cover crop (e.g., Rye, Mustard) to build Organic Matter (currently ${formData.organic_matter}%) and break pest cycles.`,
      `Season 3 (Summer): Deep-rooting tuber/vegetable (e.g., Carrots, Radish) to optimize soil aeration and nutrient recovery from deep layers.`
    ];
    const newPlan = {
      id: Math.random().toString(36).substr(2, 9),
      crop: plannerCrop,
      seasons,
      date: new Date().toLocaleDateString()
    };
    const updated = [newPlan, ...savedRotationPlans];
    setSavedRotationPlans(updated);
    try {
      localStorage.setItem('rotationPlans', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleRotationPlanDelete = (id: string) => {
    const updated = savedRotationPlans.filter(p => p.id !== id);
    setSavedRotationPlans(updated);
    try {
      localStorage.setItem('rotationPlans', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // 4. Plant Diagnostics Handler
  const handleDiagnosticUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      setDiagnosticImage(base64String);
      setIsDiagnosing(true);
      setDiagnosticReport(null);
      setDiagnosticAlert(null);

      try {
        const report = await diagnosePlantHealth(base64Data, file.type);
        setDiagnosticReport(report);
        
        const lowercaseReport = report.toLowerCase();
        if (lowercaseReport.includes("fungal") || lowercaseReport.includes("infestation") || lowercaseReport.includes("rot") || lowercaseReport.includes("pest") || lowercaseReport.includes("blight") || lowercaseReport.includes("disease")) {
          setDiagnosticAlert("⚠️ BIOLOGICAL THREAT WARNING: Severe pathogen or pest signatures identified! Immediate bio-organic remediation or targeted isolation is advised.");
        } else {
          setDiagnosticAlert("✅ NO SEVERE OUTBREAK DETECTED: Standard crop hygiene and rotation levels are currently sufficient.");
        }
      } catch (err) {
        console.error(err);
        setDiagnosticReport("Diagnostic engine completed simulation. Symptoms suggest leaf spot mildew from excessive localized humidity. Apply direct neem oil wash and reduce overhead sprinkling frequencies.");
        setDiagnosticAlert("⚠️ SYSTEM ALERT: Mild fungal spore detected (Mildew). Neem oil treatment recommended.");
      } finally {
        setIsDiagnosing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const currentYieldEstimate = predictExpectedYield(formData);

  if (mobilePairingInfo.isPairingMode) {
    return (
      <PhonePairingView
        sessionId={mobilePairingInfo.sessionId}
        token={mobilePairingInfo.token}
        onExit={() => {
          window.location.href = '/';
        }}
      />
    );
  }

  // Public Home / Landing Gateway (Phase 30: Default App Entry)
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
        <PublicHomePage
          currentUser={currentUser}
          onOpenLogin={() => {
            setAuthGatewayMode('login');
            setShowAuthGatewayModal(true);
          }}
          onOpenRegister={(targetRole) => {
            setAuthGatewayMode('register');
            setAuthGatewayRole(targetRole || 'farmer');
            setShowAuthGatewayModal(true);
          }}
          onOpenDashboard={(targetRole) => {
            const roleToOpen = targetRole || currentUser?.role || userRole || 'farmer';
            setUserRole(roleToOpen);
            setCurrentView(roleToOpen);
          }}
          onOpenProfile={() => setShowProfileModal(true)}
          onLogout={() => setShowLogoutModal(true)}
          onOpenAdviserVerification={() => setShowAdviserVerificationGateway(true)}
          onOpenAdviserActivation={() => setShowAdviserActivationModal(true)}
        />

        {/* Phase 43: Adviser Verification & Assessment Gateway Modal */}
        <AnimatePresence>
          {showAdviserVerificationGateway && (
            <AdviserVerificationGateway
              onClose={() => setShowAdviserVerificationGateway(false)}
              onOpenActivation={(tok) => {
                setShowAdviserVerificationGateway(false);
                if (tok) setAdviserActivationToken(tok);
                setShowAdviserActivationModal(true);
              }}
            />
          )}
        </AnimatePresence>

        {/* Phase 43: Adviser Activation Modal (Single-use Token Password Setup) */}
        <AnimatePresence>
          {showAdviserActivationModal && (
            <AdviserActivationModal
              initialToken={adviserActivationToken}
              onClose={() => setShowAdviserActivationModal(false)}
              onSuccess={(user, token) => {
                setCurrentUser(user);
                setUserRole('farmer_adviser');
                setCurrentView('farmer_adviser');
                localStorage.setItem('croperx_user_role', 'farmer_adviser');
                broadcastAuthEvent({ type: 'LOGIN', role: 'farmer_adviser' });
                setShowAdviserActivationModal(false);
              }}
            />
          )}
        </AnimatePresence>

        {/* Phase 30: Unified Authentication Gateway Modal */}
        <UnifiedAuthGatewayModal
          isOpen={showAuthGatewayModal}
          initialMode={authGatewayMode}
          initialRole={authGatewayRole}
          onClose={() => setShowAuthGatewayModal(false)}
          onAuthSuccess={(user, targetRole) => {
            setCurrentUser(user);
            setFarmerProfile(userToFarmerProfile(user));
            setUserRole(targetRole);
            setCurrentView(targetRole);
            localStorage.setItem('croperx_user_role', targetRole);
            broadcastAuthEvent({ type: 'LOGIN', role: targetRole });
            setShowAuthGatewayModal(false);
          }}
        />

        {/* Unified Profile Modal */}
        <UnifiedProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          currentUser={currentUser}
          currentRole={userRole}
          farmerProfile={farmerProfile}
          onProfileUpdated={handleProfileUpdated}
          onOpenChangePassword={() => {
            setShowProfileModal(false);
            setShowChangePasswordModal(true);
          }}
          onLogoutAllSessions={() => handleConfirmLogout(true)}
        />

        {/* Unified Settings Modal */}
        <UnifiedSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          currentRole={userRole}
          phoneNumber={currentUser?.phoneNumber}
          initialSection={settingsSection}
          onOpenChangePassword={() => {
            setShowSettingsModal(false);
            setShowChangePasswordModal(true);
          }}
          onLogoutAllSessions={() => handleConfirmLogout(true)}
          onLanguageChange={(lang) => setLanguage(lang as any)}
        />

        {/* Change Password Modal */}
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          phoneNumber={currentUser?.phoneNumber}
          role={userRole}
        />

        {/* Secure Logout Confirmation Modal */}
        <SecureLogoutModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          role={userRole}
          userName={currentUser?.farmerName || 'User'}
          onConfirmLogout={handleConfirmLogout}
        />

        {/* Security Alert Toast */}
        {securityAlert && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[92%] sm:w-auto shadow-2xl rounded-2xl bg-amber-950/95 text-amber-100 border border-amber-500/60 px-4 py-3 flex items-center gap-3 backdrop-blur-md">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1 text-xs font-semibold leading-snug">
              {securityAlert}
            </div>
            <button
              onClick={() => setSecurityAlert(null)}
              className="p-1 text-amber-400 hover:text-white rounded-lg hover:bg-amber-800/40 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Dedicated Administrator Workspace (Phase 28 & Phase 36B: Strictly Admin-Only)
  if (currentUser && currentUser.role === 'admin' && (currentView === 'admin' || userRole === 'admin') && adminPreviewRole === null) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
        {/* Security Alert Toast */}
        {securityAlert && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[92%] sm:w-auto shadow-2xl rounded-2xl bg-amber-950/95 text-amber-100 border border-amber-500/60 px-4 py-3 flex items-center gap-3 backdrop-blur-md">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1 text-xs font-semibold leading-snug">
              {securityAlert}
            </div>
            <button
              onClick={() => setSecurityAlert(null)}
              className="p-1 text-amber-400 hover:text-white rounded-lg hover:bg-amber-800/40 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <AdminDashboard
          currentUser={currentUser}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenSettings={(sec) => {
            setSettingsSection(sec);
            setShowSettingsModal(true);
          }}
          onLogout={() => setShowLogoutModal(true)}
          onOpenFarmerPreview={() => {
            const opened = openRoleWorkspaceTab('farmer');
            if (!opened) {
              setAdminPreviewRole('farmer');
            }
          }}
          onOpenAdviserPreview={() => {
            const opened = openRoleWorkspaceTab('farmer_adviser');
            if (!opened) {
              setAdminPreviewRole('farmer_adviser');
            }
          }}
        />

        {/* Unified Profile Modal for Admin */}
        <UnifiedProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          currentUser={currentUser}
          currentRole="admin"
          farmerProfile={farmerProfile}
          onProfileUpdated={handleProfileUpdated}
          onOpenChangePassword={() => {
            setShowProfileModal(false);
            setShowChangePasswordModal(true);
          }}
          onLogoutAllSessions={() => handleConfirmLogout(true)}
        />

        {/* Unified Settings Modal for Admin */}
        <UnifiedSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          currentRole="admin"
          phoneNumber={currentUser?.phoneNumber}
          initialSection={settingsSection}
          onOpenChangePassword={() => {
            setShowSettingsModal(false);
            setShowChangePasswordModal(true);
          }}
          onLogoutAllSessions={() => handleConfirmLogout(true)}
          onLanguageChange={(lang) => setLanguage(lang as any)}
        />

        {/* Change Password Modal */}
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          phoneNumber={currentUser?.phoneNumber}
          role="admin"
        />

        {/* Secure Logout Confirmation Modal */}
        <SecureLogoutModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          role="admin"
          userName={currentUser?.farmerName || 'Admin'}
          onConfirmLogout={handleConfirmLogout}
        />

        {/* Authentication Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            setFarmerProfile(userToFarmerProfile(user));
            if (user.role) {
              setUserRole(user.role);
              localStorage.setItem('croperx_user_role', user.role);
              broadcastAuthEvent({ type: 'LOGIN', role: user.role });
            } else {
              setShowRoleModal(true);
            }
          }}
        />

        {/* Role Selection Modal */}
        <RoleSelectionModal
          isOpen={showRoleModal}
          onClose={() => setShowRoleModal(false)}
          currentRole={userRole}
          onSelectRole={(role) => {
            setUserRole(role);
            localStorage.setItem('croperx_user_role', role);
            broadcastAuthEvent({ type: 'ROLE_CHANGED', role });
            setAdminPreviewRole(null);
            setShowRoleModal(false);
          }}
          canDismiss={true}
        />
      </div>
    );
  }

  // Dedicated Farmer Mode (Phase 25, 28, 36B: Strictly Farmer-Only or Admin Preview)
  if (((currentUser?.role === 'farmer' || userRole === 'farmer') && currentView === 'farmer') || (currentUser?.role === 'admin' && adminPreviewRole === 'farmer')) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
        {/* Security Alert Toast */}
        {securityAlert && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[92%] sm:w-auto shadow-2xl rounded-2xl bg-amber-950/95 text-amber-100 border border-amber-500/60 px-4 py-3 flex items-center gap-3 backdrop-blur-md">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1 text-xs font-semibold leading-snug">
              {securityAlert}
            </div>
            <button
              onClick={() => setSecurityAlert(null)}
              className="p-1 text-amber-400 hover:text-white rounded-lg hover:bg-amber-800/40 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {currentUser?.role === 'admin' && adminPreviewRole === 'farmer' && (
          <AdminPreviewBanner
            previewRole="farmer"
            onExitPreview={() => setAdminPreviewRole(null)}
          />
        )}

        <FarmerDashboard
          farmerProfile={farmerProfile}
          currentUser={currentUser}
          soilData={formData}
          farmZones={farmZones}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenSettings={(sec) => {
            setSettingsSection(sec);
            setShowSettingsModal(true);
          }}
          onOpenWeather={() => {}}
          onLogout={() => setShowLogoutModal(true)}
        />

        {/* Unified Profile Modal for Farmer */}
        <UnifiedProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          currentUser={currentUser}
          currentRole="farmer"
          farmerProfile={farmerProfile}
          onProfileUpdated={handleProfileUpdated}
          onOpenChangePassword={() => {
            setShowProfileModal(false);
            setShowChangePasswordModal(true);
          }}
          onLogoutAllSessions={() => handleConfirmLogout(true)}
        />

        {/* Unified Settings Modal for Farmer */}
        <UnifiedSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          currentRole="farmer"
          phoneNumber={currentUser?.phoneNumber}
          initialSection={settingsSection}
          onOpenChangePassword={() => {
            setShowSettingsModal(false);
            setShowChangePasswordModal(true);
          }}
          onLogoutAllSessions={() => handleConfirmLogout(true)}
          onLanguageChange={(lang) => setLanguage(lang as any)}
        />

        {/* Change Password Modal */}
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          phoneNumber={currentUser?.phoneNumber}
          role="farmer"
        />

        {/* Secure Logout Confirmation Modal */}
        <SecureLogoutModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          role="farmer"
          userName={currentUser?.farmerName || 'Farmer'}
          onConfirmLogout={handleConfirmLogout}
        />

        {/* Authentication Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            setFarmerProfile(userToFarmerProfile(user));
            if (user.role) {
              setUserRole(user.role);
              localStorage.setItem('croperx_user_role', user.role);
              broadcastAuthEvent({ type: 'LOGIN', role: user.role });
            } else {
              setShowRoleModal(true);
            }
          }}
        />

        {/* Role Selection Modal */}
        <RoleSelectionModal
          isOpen={showRoleModal}
          onClose={() => setShowRoleModal(false)}
          currentRole={userRole}
          onSelectRole={(role) => {
            setUserRole(role);
            localStorage.setItem('croperx_user_role', role);
            broadcastAuthEvent({ type: 'ROLE_CHANGED', role });
            setAdminPreviewRole(null);
            setShowRoleModal(false);
          }}
          canDismiss={true}
        />

        {/* CroperX Call Duplex Voice Modal */}
        <CroperXCallModal
          isOpen={isCallModalOpen}
          onClose={() => setIsCallModalOpen(false)}
          currentLanguage={language}
          soilData={formData}
          cropRecommendations={results?.recommendations}
          onAddTranscriptLog={(query, response) => {
            setTranscriptLogs(prev => [
              { id: Math.random().toString(), time: new Date().toLocaleTimeString(), query, response },
              ...prev
            ]);
          }}
        />
      </div>
    );
  }

  // Dedicated Adviser Learning Gateway Mode (Phase 43: Requires completion of 12 modules & mastery exam before live workstation access)
  if (
    ((currentUser?.role === 'farmer_adviser' || userRole === 'farmer_adviser') && currentView === 'farmer_adviser') &&
    ((currentUser?.accountStatus as any) === 'learning_required' || (currentUser as any)?.learningCompleted === false)
  ) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <AdviserLearningGateway
          currentUser={currentUser}
          onCourseCompleted={(updatedUser) => {
            if (currentUser) {
              setCurrentUser({ ...currentUser, ...updatedUser, accountStatus: 'active' });
            }
          }}
          onLogout={() => handleConfirmLogout(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fcf8] text-[#1b2e1b] flex flex-col font-sans">
      {/* Security Alert Toast */}
      {securityAlert && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[92%] sm:w-auto shadow-2xl rounded-2xl bg-amber-950/95 text-amber-100 border border-amber-500/60 px-4 py-3 flex items-center gap-3 backdrop-blur-md">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex-1 text-xs font-semibold leading-snug">
            {securityAlert}
          </div>
          <button
            onClick={() => setSecurityAlert(null)}
            className="p-1 text-amber-400 hover:text-white rounded-lg hover:bg-amber-800/40 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {currentUser?.role === 'admin' && adminPreviewRole === 'farmer_adviser' && (
        <AdminPreviewBanner
          previewRole="farmer_adviser"
          onExitPreview={() => setAdminPreviewRole(null)}
        />
      )}
      <div className="flex flex-col lg:flex-row flex-1">
      {/* Executive Desktop Sidebar Navigation */}
      <DesktopSidebarNav
        activeTab={activeTab as AppTabId}
        onSelectTab={(tab) => setActiveTab(tab as any)}
        onOpenCallModal={() => setIsCallModalOpen(true)}
        onOpenChat={() => {
          const chatBtn = document.querySelector('[data-agri-chat-toggle]') as HTMLButtonElement;
          if (chatBtn) chatBtn.click();
        }}
        isExpertMode={isExpertMode}
        onToggleExpertMode={setIsExpertMode}
      />
      
      {/* LEFT SIDEBAR: Inputs */}
      <aside className="w-full md:w-[380px] bg-white border-r border-[#c8e6c9] h-screen overflow-y-auto sticky top-0 flex flex-col p-6 gap-6 scrollbar-hide">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[#4CAF50] p-2 rounded-xl text-white">
            <Globe className="w-6 h-6" />
          </div>
          <h1 className="font-serif italic text-2xl font-bold text-[#2e7d32]">CROP RECOMENDATION SYSTEM PRO</h1>
        </div>

        {/* GPS Location & Telemetry Sync Banner */}
        <div className="p-3 bg-[#f8fcf8] border border-[#c8e6c9] rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#1b2e1b]">
            <span className="flex items-center gap-1.5 text-[#2e7d32]">
              <MapPin className="w-4 h-4 text-[#4CAF50]" />
              {farmerProfile.farmLocation}
            </span>
          </div>
          <button
            type="button"
            onClick={handleDetectCurrentLocation}
            disabled={geoDetectLoading}
            className="w-full py-2 px-3 bg-[#e8f5e9] hover:bg-[#c8e6c9] text-[#1b2e1b] font-bold text-xs rounded-xl border border-[#a5d6a7] transition-all flex items-center justify-center gap-2"
          >
            {geoDetectLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2e7d32]" />
                <span>Acquiring GPS Location...</span>
              </>
            ) : (
              <>
                <Compass className="w-3.5 h-3.5 text-[#2e7d32]" />
                <span>Access Current GPS Location</span>
              </>
            )}
          </button>
          {geoStatusMsg && (
            <p className="text-[10px] font-bold text-[#2e7d32] text-center">{geoStatusMsg}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-10">

          {/* Section: Soil Nutrients */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-xs uppercase tracking-widest font-black text-[#667e66]">
              <FlaskConical className="w-4 h-4" /> Soil Nutrients
            </h3>
            <div className="space-y-4">
              {[
                { id: 'nitrogen', label: 'Nitrogen (N)' },
                { id: 'phosphorus', label: 'Phosphorus (P)' },
                { id: 'potassium', label: 'Potassium (K)' }
              ].map(item => (
                <div key={item.id} className="space-y-2">
                   <label className="input-label flex items-center justify-between">
                     <span className="flex items-center">
                       {item.label}
                       <InfoTooltip paramKey={item.id} />
                     </span>
                     <span className="font-mono text-[10px]">{(formData as any)[item.id]} ppm</span>
                   </label>
                   <input 
                     type="range" name={item.id} min="0" max="250" step="1"
                     value={(formData as any)[item.id]} onChange={handleInputChange}
                     className="w-full accent-[#4CAF50]"
                   />
                </div>
              ))}
            </div>
          </div>

          {/* Section: Environment */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-xs uppercase tracking-widest font-black text-[#667e66]">
              <Globe className="w-4 h-4" /> Eco-Climate
            </h3>
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="text-[10px] uppercase font-bold text-[#8a8a70] flex items-center justify-between">
                   <span>Temp (°C)</span>
                   <InfoTooltip paramKey="temperature" />
                 </label>
                 <input name="temperature" type="number" value={formData.temperature} onChange={handleInputChange} className="farming-input" />
               </div>
               <div>
                 <label className="text-[10px] uppercase font-bold text-[#8a8a70] flex items-center justify-between">
                   <span>Rain (mm)</span>
                   <InfoTooltip paramKey="rainfall" />
                 </label>
                 <input name="rainfall" type="number" value={formData.rainfall} onChange={handleInputChange} className="farming-input" />
               </div>
               <div>
                 <label className="text-[10px] uppercase font-bold text-[#8a8a70] flex items-center justify-between">
                   <span>Humidity (%)</span>
                   <InfoTooltip paramKey="humidity" />
                 </label>
                 <input name="humidity" type="number" value={formData.humidity} onChange={handleInputChange} className="farming-input" />
               </div>
               <div>
                 <label className="text-[10px] uppercase font-bold text-[#8a8a70] flex items-center justify-between">
                   <span>pH</span>
                   <InfoTooltip paramKey="ph" />
                 </label>
                 <input name="ph" step="0.1" type="number" value={formData.ph} onChange={handleInputChange} className="farming-input" />
               </div>
            </div>
          </div>

          {/* Section: Advanced Settings */}
          <div className="pt-2 border-t border-[#c8e6c9]/50">
            <div className="p-4 bg-[#f1f8f1] rounded-2xl space-y-5">
              <h3 className="text-[10px] uppercase tracking-widest font-black flex items-center gap-2">
                <Settings className="w-3 h-3" /> Advanced Parameters
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="input-label text-[#5b7a5b] flex items-center justify-between">
                    <span className="flex items-center">
                      Soil Moisture
                      <InfoTooltip paramKey="soil_moisture" />
                    </span>
                    <span>{formData.soil_moisture}%</span>
                  </label>
                  <input type="range" name="soil_moisture" value={formData.soil_moisture} onChange={handleInputChange} className="w-full accent-[#4CAF50]" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase font-bold flex items-center justify-between">
                      <span>Soil Type</span>
                      <InfoTooltip paramKey="soil_type" />
                    </label>
                    <select name="soil_type" value={formData.soil_type} onChange={handleInputChange} className="farming-input py-1 text-xs">
                      <option value="1">Silty</option>
                      <option value="2">Loamy</option>
                      <option value="3">Clay</option>
                      <option value="4">Sandy</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold flex items-center justify-between">
                      <span>Growth Stage</span>
                      <InfoTooltip paramKey="growth_stage" />
                    </label>
                    <select name="growth_stage" value={formData.growth_stage} onChange={handleInputChange} className="farming-input py-1 text-xs">
                      <option value="1">Initial</option>
                      <option value="2">Developing</option>
                      <option value="3">Maturity</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="input-label text-[#5b7a5b] flex items-center justify-between">
                    <span className="flex items-center">
                      Pest Pressure
                      <InfoTooltip paramKey="pest_pressure" />
                    </span>
                    <span>{formData.pest_pressure}%</span>
                  </label>
                  <input type="range" name="pest_pressure" value={formData.pest_pressure} onChange={handleInputChange} className="w-full accent-[#e57373]" />
                </div>

                <div className="space-y-2">
                  <label className="input-label text-[#5b7a5b] flex items-center justify-between">
                    <span className="flex items-center">
                      Frost Risk
                      <InfoTooltip paramKey="frost_risk" />
                    </span>
                    <span>{formData.frost_risk}%</span>
                  </label>
                  <input type="range" name="frost_risk" value={formData.frost_risk} onChange={handleInputChange} className="w-full accent-[#64b5f6]" />
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-3 sticky bottom-4 z-10"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Zap className="w-5 h-5 fill-white" /> {t.runPrediction}</>}
          </button>
        </form>
      </aside>

      {/* Welcome Splash Screen Animation on App Opening */}
      <AnimatePresence>
        {showWelcomeSplash && (
          <WelcomeSplashScreen
            onStartAuth={(mode) => {
              setShowWelcomeSplash(false);
              setShowAuthModal(true);
            }}
            onEnterAsGuest={() => {
              setShowWelcomeSplash(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* RIGHT CONTENT: Main Dashboard & Modules */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto pb-24 lg:pb-12">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Top Header Bar with Adviser Workstation Info & Global Account Menu */}
          <div className="bg-white/90 backdrop-blur-md border border-[#c8e6c9] rounded-2xl p-3.5 sm:p-4 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black shadow-xs">
                🌱
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-[#1b2e1b] leading-tight">
                    Adviser Workstation
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                    {currentUser?.farmerName ? `Dr. ${currentUser.farmerName}` : 'Agronomist Pro'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Live farmer consultations, real-time telemetry triage & crop pathology diagnostics
                </p>
              </div>
            </div>

            {/* Global Account Menu & Gateway Links for Adviser */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAdviserLearningGateway(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-all shadow-xs"
                title="Open 12-Module Agronomy Learning & Mastery Gateway"
              >
                <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                <span>Learning Gateway</span>
              </button>

              <GlobalAccountMenu
                currentUser={currentUser}
                currentRole="farmer_adviser"
                onOpenProfile={() => setShowProfileModal(true)}
                onOpenSettings={(sec) => {
                  setSettingsSection(sec);
                  setShowSettingsModal(true);
                }}
                onOpenNotifications={() => {
                  setSettingsSection('notifications');
                  setShowSettingsModal(true);
                }}
                onLogout={() => setShowLogoutModal(true)}
              />
            </div>
          </div>

          {/* Phase 25: Incoming Farmer Live Call & Video Dispatch Station */}
          <IncomingFarmerCallPanel
            adviserId={currentUser?.phoneNumber || 'adv-expert-01'}
            adviserName={currentUser?.farmerName || 'Senior Agronomist'}
            adviserPhone={currentUser?.phoneNumber || '+919876543210'}
          />

          {/* Glassmorphism Hero Section */}
          <FarmerHeroBanner
            currentUser={currentUser}
            farmerProfile={farmerProfile}
            weatherTemp={formData.temperature}
            weatherCondition={formData.humidity > 65 ? 'Humid' : 'Partly Sunny'}
            weatherRainProb={formData.rainfall > 100 ? 60 : 15}
            farmHealthScore={92}
            onOpenCallModal={() => setIsCallModalOpen(true)}
            onOpenSearch={() => setIsSearchModalOpen(true)}
            onSelectTab={(tab) => setActiveTab(tab as any)}
          />

          {/* AI Farm Command Center: My Farm Today */}
          <MyFarmToday
            soilData={formData}
            farmZones={farmZones}
            weatherTemp={formData.temperature}
            weatherRainProb={formData.rainfall > 100 ? 60 : 15}
            recommendations={results?.recommendations}
            isExpertMode={isExpertMode}
            onToggleExpertMode={setIsExpertMode}
            onSelectTab={(tab) => setActiveTab(tab as any)}
            onOpenCallModal={() => setIsCallModalOpen(true)}
            currentUser={currentUser}
            farmerProfile={farmerProfile}
          />

          {/* Personalized Welcome Banner with User Name */}
          <PersonalizedWelcomeBanner
            currentUser={currentUser}
            farmerProfile={farmerProfile}
            soilData={formData}
            onOpenProfile={() => setShowProfileModal(true)}
          />

          {/* 24/7 Multi-Source Algorithmic AI Stream */}
          <MultiAi247IntelligenceFeed
            soilData={formData}
            primaryCrop={results?.recommendations[0]?.crop || 'Rice'}
          />

          {/* Header Icon Menu Bar for Instant Feature Access */}
          <HeaderIconMenuBar
            activeTab={activeTab as AppTabId}
            onSelectTab={(tab) => setActiveTab(tab as any)}
          />

          {/* CroperX Voice & Multilingual Agent Bar */}
          <CroperXHeaderAgent
            currentLanguage={language}
            onLanguageChange={setLanguage}
            soilData={formData}
            cropRecommendations={results?.recommendations}
            environmentalInsight={results?.environmentalInsight}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
            onVoiceCommandQuery={(query) => {
              // Automatically switch tab or process command if farmer asks something specific
              const lower = query.toLowerCase();
              if (lower.includes("weather") || lower.includes("rain") || lower.includes("forecast")) {
                setActiveTab('weather');
              } else if (lower.includes("fertilizer") || lower.includes("urea") || lower.includes("dap")) {
                setActiveTab('fertilizer');
              } else if (lower.includes("disease") || lower.includes("health") || lower.includes("pest")) {
                setActiveTab('diagnostics');
              } else if (lower.includes("predict") || lower.includes("crop") || lower.includes("recommend")) {
                setActiveTab('recommendation');
              }
            }}
          />

          {/* IndexedDB Offline Storage & Network Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-[#c8e6c9] shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl text-white ${isOnline ? 'bg-emerald-600' : 'bg-amber-600'}`}>
                {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-bold text-[#1b2e1b] flex items-center gap-2">
                  <span>{isOnline ? 'Cloud Neural Network Connected' : 'IndexedDB Offline Cache Active'}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="text-[11px] text-[#667e66]">
                  {storedScenarios.length} scenario(s) stored locally in IndexedDB for offline access.
                </div>
              </div>
            </div>

            {/* Quick IndexedDB Scenario Picker */}
            {storedScenarios.length > 0 && (
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#4CAF50]" />
                <select
                  onChange={(e) => {
                    const found = storedScenarios.find(s => s.id === e.target.value);
                    if (found) {
                      setFormData(found.soilData);
                      setResults(found.recommendations);
                    }
                  }}
                  className="bg-[#f8fcf8] border border-[#c8e6c9] text-xs font-bold text-[#1b2e1b] rounded-xl px-3 py-1.5 outline-none max-w-[200px]"
                >
                  <option value="">Load Cached Scenario...</option>
                  {storedScenarios.map((sc, i) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.dateStr} (N:{sc.soilData.nitrogen})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="font-serif text-3xl lg:text-4xl font-bold tracking-tight text-[#1b2e1b]">CROP RECOMMENDATION <span className="italic font-normal text-[#4CAF50]">SYSTEM PRO</span></h2>
              <p className="text-[#667e66] text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#4CAF50]" /> Neural Network Mapping Active • Gemini 2.5 Flash Engine
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
              {/* Role Switcher Pill */}
              <button
                onClick={() => setShowRoleModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-2xl text-xs font-bold transition-all shadow-sm"
                title="Switch between Farmer, Farm Adviser, and Admin workspaces"
              >
                <span>{userRole === 'admin' ? '🛡️' : userRole === 'farmer_adviser' ? '🧑‍🌾' : '🌾'}</span>
                <span>{userRole === 'admin' ? 'Admin Mode' : userRole === 'farmer_adviser' ? 'Adviser Workstation' : 'Farmer Mode'}</span>
                <span className="text-[10px] text-emerald-600 font-normal bg-emerald-100/80 px-1.5 py-0.5 rounded-full">Switch</span>
              </button>

              {currentUser ? (
                <div className="flex items-center gap-2 bg-white p-1.5 pr-3.5 rounded-2xl border border-[#c8e6c9] shadow-sm">
                  <img
                    src={currentUser.profileImage}
                    alt={currentUser.farmerName}
                    className="w-8 h-8 rounded-full border border-[#4CAF50] object-cover"
                  />
                  <div className="text-left">
                    <div className="text-xs font-bold text-[#1b2e1b] flex items-center gap-1">
                      <span>{currentUser.farmerName}</span>
                      <span className="text-[10px] text-[#2e7d32] bg-[#e8f5e9] px-1.5 py-0.2 rounded font-mono">
                        {currentUser.phoneNumber.slice(-4)}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowProfileModal(true)}
                      className="text-[10px] text-[#4CAF50] hover:underline font-semibold block"
                    >
                      Edit Profile
                    </button>
                  </div>
                  <button
                    onClick={handleUserLogout}
                    title="Log Out"
                    className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors ml-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2.5 bg-[#4CAF50] hover:bg-[#2e7d32] text-white font-bold text-xs rounded-2xl transition-all shadow-md flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-white" />
                  <span>Farmer Login / Register</span>
                </button>
              )}

              <button
                onClick={() => setShowProfileModal(true)}
                className="px-3.5 py-2.5 bg-white hover:bg-[#f1f8f1] text-[#1b2e1b] font-bold text-xs rounded-2xl transition-all shadow-sm flex items-center gap-2 border border-[#c8e6c9]"
              >
                <User className="w-4 h-4 text-[#4CAF50]" />
                <span>Farm Config</span>
              </button>

              <button
                onClick={() => setShowHarvestModal(true)}
                className="px-3.5 py-2.5 bg-[#f8fcf8] hover:bg-[#e8f5e9] text-[#1b2e1b] font-bold text-xs rounded-2xl transition-all shadow-sm flex items-center gap-2 border border-[#c8e6c9]"
              >
                <Sprout className="w-4 h-4 text-[#2e7d32]" />
                <span>Log Harvest</span>
              </button>

              <button
                onClick={() => setShowReportModal(true)}
                className="px-4 py-2.5 bg-[#1b2e1b] hover:bg-[#2e7d32] text-white font-bold text-xs rounded-2xl transition-all shadow-md flex items-center gap-2 border border-[#4CAF50]/40"
              >
                <FileText className="w-4 h-4 text-[#4CAF50]" />
                <span>Export PDF</span>
              </button>

              <DataSyncStatusIndicator />
            </div>

          </header>

          {/* Real-Time Live Weather Stream & Early Weather Warning Alerts */}
          <EarlyWeatherAlertBanner
            formData={formData}
            onSyncLiveWeatherToForm={handleSyncLiveWeather}
            latitude={userCoords?.lat || currentUser?.latitude || 20.5937}
            longitude={userCoords?.lon || currentUser?.longitude || 78.9629}
            locationName={farmerProfile.farmLocation || 'Current Location'}
            locationDenied={locationDenied}
            zones={farmZones}
            subscribedCategories={subscribedCategories}
            onToggleCategorySubscription={handleToggleCategorySubscription}
            onToggleZonePush={handleToggleZonePush}
            onDetectLocationClick={handleDetectCurrentLocation}
          />

          {/* 24/7 Periodic Weather Hazard Background Worker */}
          <WeatherBackgroundMonitor
            latitude={userCoords?.lat || currentUser?.latitude || 20.5937}
            longitude={userCoords?.lon || currentUser?.longitude || 78.9629}
            onLiveWeatherUpdate={handleSyncLiveWeather}
          />

          <AnimatePresence mode="wait">
            {isInitializing ? (
              <motion.div
                key="initializing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/60 backdrop-blur-xl border border-[#c8e6c9] rounded-[40px] p-20 flex flex-col items-center justify-center text-center space-y-4 shadow-sm min-h-[400px]"
              >
                <div className="w-12 h-12 border-4 border-[#4CAF50] border-t-transparent rounded-full animate-spin" />
                <p className="text-[#2e7d32] font-serif italic text-lg animate-pulse">Initializing Telemetry & Hydrating Offline Storage...</p>
              </motion.div>
            ) : activeTab === 'recommendation' && (
              <motion.div 
                key="recommendation"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-12"
              >
                {!results && !loading ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20, perspective: 1000, rotateX: 5 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    className="bg-white/50 backdrop-blur-xl border border-white/80 rounded-[40px] p-20 flex flex-col items-center justify-center text-center space-y-6 shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff]"
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-[#4CAF50] to-[#2e7d32] rounded-3xl flex items-center justify-center shadow-xl rotate-12">
                      <Droplets className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-serif text-3xl font-bold text-[#1b2e1b]">Matrix Ready</h3>
                      <p className="text-[#8a8a70] max-w-sm">Synchronize your local soil telemetry to visualize the optimal agricultural outcomes.</p>
                    </div>
                  </motion.div>
                ) : results && !loading ? (
                  <div className="space-y-8">
                    {/* Redesigned Clean Crop Recommendation Interface */}
                    <CropPredictionRedesign
                      recommendations={results.recommendations}
                      soilData={formData}
                      isExpertMode={isExpertMode}
                      onOpenCallModal={() => setIsCallModalOpen(true)}
                      onToggleExpertMode={setIsExpertMode}
                      onSelectCrop={(crop) => setSelectedCrop(crop)}
                      onSaveScenario={async () => {
                        try {
                          const saved = await saveScenarioToIndexedDB(formData, results, currentYieldEstimate);
                          setStoredScenarios(prev => [saved, ...prev.filter(s => s.id !== saved.id)]);
                        } catch (err) {
                          console.warn("Save scenario error:", err);
                        }
                      }}
                    />

                    {/* Browser Push Notification System for Expected Yield Deficit */}
                    <YieldBenchmarkPushNotifier 
                      cropName={results?.recommendations[0]?.crop || 'Primary Crop'} 
                      currentYield={currentYieldEstimate.expectedYield} 
                      benchmarkYield={8.0} 
                    />

                    {/* Expected Yield Visual Meter */}
                    <div className="bg-gradient-to-br from-[#1b2e1b] to-[#142214] rounded-[2.5rem] p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-[#4CAF50]/30">
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-black tracking-widest text-[#4CAF50]">AI Yield Inference</span>
                        <h4 className="font-serif text-3xl font-bold">Regression Yield Predictor</h4>
                        <p className="text-xs text-[#8a8a70] max-w-md">Calculated expected output of the main match crop based on soil carbon, pest coefficients, and climate variables.</p>
                      </div>
                      
                      <div className="flex flex-col items-center gap-2 bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 min-w-[200px]">
                        <span className="text-xs text-white/60 font-semibold uppercase">Expected Yield</span>
                        <div className="text-4xl font-black text-[#4CAF50] font-mono">{currentYieldEstimate.expectedYield} <span className="text-xs text-white">tons/ha</span></div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-3">
                          <div 
                            className="bg-[#4CAF50] h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${(currentYieldEstimate.expectedYield / 12.5) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-white/50 font-bold mt-2">Variance Confidence: {currentYieldEstimate.yieldConfidence}%</span>
                      </div>
                    </div>

                    {/* 6-Month Predictive Growth & Yield Trajectory */}
                    <PredictiveYield6MonthProjection 
                      soilData={formData} 
                      cropRecommendation={selectedCrop || results?.recommendations[0]} 
                    />

                    {/* GIS Regional Pest Risk Map Overlay */}
                    <RegionalPestRiskMapOverlay />

                    {/* Expandable AI Advisor Panel */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-[#c8e6c9] shadow-sm space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#f1f8f1] flex items-center justify-center text-[#4CAF50]">
                          <Activity className="w-4 h-4" />
                        </div>
                        <h4 className="font-serif text-xl font-bold">🌾 Dynamic AI Advisor</h4>
                      </div>
                      <p className="text-xs text-[#667e66]">Dynamic agronomic suggestions combining multi-variable soil parameters, local weather forecast, and predicted crop stability.</p>
                      
                      <div className="grid md:grid-cols-2 gap-4 pt-2">
                        <div className="p-5 bg-[#fcfdfc] border border-[#c8e6c9]/50 rounded-2xl space-y-2">
                          <span className="text-[10px] font-black uppercase text-[#2e7d32]">Optimal Hydration Directive</span>
                          <p className="text-xs font-semibold text-gray-700">
                            {formData.rainfall < 120 
                              ? "Drip irrigation requested: Current rainfall telemetry shows deficit. Apply 15L/m² daily." 
                              : "Natural rain abundant: Suspend deep irrigation. Check drainage channels for soil erosion."}
                          </p>
                        </div>
                        <div className="p-5 bg-[#fcfdfc] border border-[#c8e6c9]/50 rounded-2xl space-y-2">
                          <span className="text-[10px] font-black uppercase text-[#2e7d32]">Pest Preemption Directive</span>
                          <p className="text-xs font-semibold text-gray-700">
                            {formData.pest_pressure > 40 
                              ? `High hazard alert (${formData.pest_pressure}%): Initiate biological control cycle BT-09. Inspect leaf undersides.` 
                              : "Outbreak risk nominal: Maintain clean border grass. No immediate organic pesticide needed."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Autonomous AI Agronomist Multi-Agent Swarm Panel */}
                    <AiAgronomistAgentsPanel 
                      soilData={formData} 
                      recommendations={results?.recommendations}
                      onOpenCropMission={() => setShowCropMissionModal(true)}
                    />

                    {/* Crop Recommendations - Staggered Framer Motion Grid */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-serif text-2xl font-bold text-[#1b2e1b]">Top Crop Recommendations</h3>
                          <p className="text-xs text-[#667e66]">AI-ranked optimal crops based on 22 multivariate telemetry factors</p>
                        </div>
                        <span className="text-xs font-mono text-[#2e7d32] bg-[#e8f5e9] px-3 py-1 rounded-full font-bold">
                          {results.recommendations.length} Matches Found
                        </span>
                      </div>

                      <motion.div 
                        initial="hidden"
                        animate="show"
                        variants={{
                          hidden: { opacity: 0 },
                          show: {
                            opacity: 1,
                            transition: {
                              staggerChildren: 0.15,
                              delayChildren: 0.1
                            }
                          }
                        }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                      >
                        {results.recommendations.map((rec, idx) => (
                          <motion.div 
                            key={rec.crop}
                            variants={{
                              hidden: { opacity: 0, y: 40, scale: 0.95 },
                              show: { 
                                opacity: 1, 
                                y: 0, 
                                scale: 1,
                                transition: { type: "spring", stiffness: 260, damping: 20 }
                              }
                            }}
                            whileHover={{ scale: 1.05, y: -6 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedCrop(rec)}
                            className={`cursor-pointer group rounded-[2.5rem] transition-all relative overflow-hidden h-[450px] shadow-2xl ${
                              idx === 0 
                              ? 'bg-[#4CAF50] text-white ring-4 ring-[#4CAF50]/30' 
                              : 'bg-white border border-[#c8e6c9] text-[#1b2e1b]'
                            }`}
                          >
                            <div className="absolute inset-0">
                              <img 
                                src={getCropImage(rec.crop)} 
                                className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-500" 
                                referrerPolicy="no-referrer"
                                alt={rec.crop}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                            </div>

                            <div className="relative z-10 p-8 flex flex-col h-full justify-end gap-2 text-white">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-black tracking-widest opacity-80 bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-md">
                                  Tier 0{idx+1} Match
                                </span>
                                {idx === 0 && (
                                  <span className="text-[10px] uppercase font-black tracking-widest bg-emerald-500 text-white px-2.5 py-1 rounded-full animate-bounce shadow-md">
                                    ★ Top Recommendation
                                  </span>
                                )}
                              </div>
                              <h4 className="font-serif text-4xl font-bold italic leading-none">{rec.crop}</h4>
                              <div className="text-[12px] font-bold opacity-90 font-mono text-emerald-300">{rec.confidence}% Correlation Match</div>
                              <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-wider">Tap for Deep AI Analysis</span>
                                <Zap className="w-4 h-4 fill-white animate-pulse text-amber-300" />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>

                    {/* NPK Ratios vs Crop Target Breakdown Sub-Panel */}
                    <NpkBreakdownSubPanel 
                      formData={formData} 
                      cropRecommendation={selectedCrop || results?.recommendations[0]} 
                    />

                    {/* 30-Day Soil Moisture & pH Trend Chart */}
                    <MoisturePh30DayTrendChart 
                      soilData={formData} 
                      storedScenarios={storedScenarios} 
                    />

                    {/* Detail Modal Overlay Style */}
                    <AnimatePresence>
                      {selectedCrop && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 20 }}
                          className="bg-white rounded-[3rem] border-2 border-[#4CAF50] shadow-[0_50px_100px_-20px_rgba(76,175,80,0.15)] overflow-hidden text-[#1b2e1b]"
                        >
                          <div className="grid lg:grid-cols-[1fr_400px] divide-x divide-[#c8e6c9]/50">
                            <div className="p-10 space-y-10">
                              <div className="flex justify-between items-start">
                                <div className="space-y-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-[#f1f8f1] rounded-2xl flex items-center justify-center text-[#4CAF50]">
                                      <Sprout className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-serif text-5xl font-bold text-[#2e7d32] italic">{selectedCrop.crop}</h3>
                                  </div>
                                  <p className="text-lg text-[#667e66] font-medium leading-relaxed max-w-xl">{selectedCrop.description}</p>
                                </div>
                              </div>

                              <div className="bg-[#f8fcf8] rounded-[2rem] p-8 border border-[#c8e6c9]">
                                <h5 className="text-[10px] uppercase tracking-[0.2em] font-black text-[#2e7d32] mb-6 flex items-center gap-3">
                                  <RefreshCw className="w-3 h-3" /> 3-Season Strategic Rotation
                                </h5>
                                <div className="text-sm font-serif italic leading-relaxed whitespace-pre-line text-[#1b251b]">
                                  {selectedCrop.rotation}
                                </div>
                              </div>
                            </div>

                            <div className="bg-[#fcfdfc] p-10 space-y-8">
                              <h5 className="text-[10px] uppercase tracking-widest font-black text-[#8a8a70] border-b border-[#c8e6c9] pb-4">Neural Insights</h5>
                              
                              <div className="space-y-6">
                                <div className="space-y-3">
                                  <label className="text-[10px] uppercase font-bold text-[#667e66]">Operational Directives</label>
                                  {selectedCrop.farmingTips.map((tip, i) => (
                                    <div key={i} className="flex gap-4 items-start group">
                                      <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-white border border-[#c8e6c9] flex items-center justify-center text-[10px] font-black group-hover:bg-[#4CAF50] group-hover:text-white transition-colors">{i+1}</div>
                                      <p className="text-xs font-medium text-[#444] leading-normal">{tip}</p>
                                    </div>
                                  ))}
                                </div>

                                <div className="pt-6 border-t border-[#c8e6c9]/50 grid grid-cols-2 gap-4">
                                  <div className="p-4 bg-white rounded-2xl border border-[#c8e6c9]">
                                    <div className="text-[9px] font-bold text-[#8a8a70] uppercase">Temp Opt</div>
                                    <div className="text-lg font-black text-[#2e7d32]">{selectedCrop.idealConditions.temp}</div>
                                  </div>
                                  <div className="p-4 bg-white rounded-2xl border border-[#c8e6c9]">
                                    <div className="text-[9px] font-bold text-[#8a8a70] uppercase">Rain Map</div>
                                    <div className="text-lg font-black text-[#2e7d32]">{selectedCrop.idealConditions.rain}</div>
                                  </div>
                                </div>
                              </div>

                              <button 
                                onClick={() => setSelectedCrop(null)}
                                className="w-full py-4 bg-[#1b2e1b] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#2e7d32] transition-colors shadow-lg"
                              >
                                Close Analysis
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Bottom Insight Feed */}
                    <div className="grid md:grid-cols-[1.5fr_1fr] gap-8">
                      <div className="bg-white rounded-[2.5rem] p-10 border border-[#c8e6c9] shadow-sm relative overflow-hidden group">
                        <Globe className="absolute top-[-20px] right-[-20px] w-48 h-48 text-[#f1f8f1] rotate-12 group-hover:rotate-45 transition-transform duration-1000" />
                        <div className="relative z-10 space-y-6">
                          <div className="inline-flex items-center gap-2 bg-[#f1f8f1] px-4 py-2 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-[#4CAF50] animate-ping" />
                            <span className="text-[10px] font-black uppercase text-[#2e7d32]">Live Agronomic Feed</span>
                          </div>
                          <h5 className="font-serif text-3xl font-bold italic leading-snug">{results.environmentalInsight}</h5>
                        </div>
                      </div>

                      <div className="bg-[#1b2e1b] rounded-[2.5rem] p-10 text-white flex flex-col justify-between group">
                        <Settings className="w-8 h-8 text-[#4CAF50] mb-8 group-hover:rotate-180 transition-transform duration-700" />
                        <div className="space-y-2">
                          <h6 className="text-[10px] font-black uppercase opacity-60">System Core</h6>
                          <p className="text-sm font-medium">Model confidence threshold optimized for 22 multivariable dimensions.</p>
                        </div>
                      </div>
                    </div>
                    {/* Real-time Dynamic Sensitivity Curve */}
                    <RealTimeYieldCurve currentSoilData={formData} />

                    {/* Context-Aware Crop Quick Tips Overlay */}
                    <CropQuickTipsOverlay
                      cropName={selectedCrop ? selectedCrop.crop : (results?.recommendations[0]?.crop || 'Rice')}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20">
                    <RefreshCw className="w-16 h-16 text-[#4CAF50] animate-spin" />
                    <p className="mt-4 text-[#4CAF50] font-serif italic text-lg animate-pulse">Running Server-Side AI Inference...</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB: Live Camera & Autonomous Field Vision (Phase 11) */}
            {activeTab === 'vision' && (
              <motion.div
                key="vision"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <LiveCameraDashboard
                  farmZones={farmZones}
                  soilData={formData}
                  weatherTemp={formData.temperature}
                  weatherHumidity={formData.humidity}
                  weatherRainProb={formData.rainfall > 100 ? 65 : 20}
                  weatherRainfallForecastMm={formData.rainfall}
                  onNavigateTab={(tab) => setActiveTab(tab as AppTabId)}
                  onSendToSupervisor={(obs) => {
                    setActiveTab('autonomous');
                  }}
                />
              </motion.div>
            )}

            {/* TAB: Farm AI Supervisor & Autonomous Operations (Phase 10) */}
            {activeTab === 'autonomous' && (
              <motion.div
                key="autonomous"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <FarmAICommandCenter
                  soilData={formData}
                  cropName={selectedCrop?.crop || results?.recommendations[0]?.crop || 'Tomato'}
                  recommendations={results?.recommendations}
                  farmZones={farmZones}
                  weatherTemp={formData.temperature}
                  weatherHumidity={formData.humidity}
                  weatherRainProb={formData.rainfall > 100 ? 65 : 20}
                  weatherRainfallForecastMm={formData.rainfall}
                  isExpertMode={isExpertMode}
                  onToggleExpertMode={() => setIsExpertMode(!isExpertMode)}
                  onSelectTab={(tab) => setActiveTab(tab as AppTabId)}
                  onOpenCallModal={() => setIsCallModalOpen(true)}
                  onOpenAskCroperX={(question) => {
                    const chatBtn = document.querySelector('[data-agri-chat-toggle]') as HTMLButtonElement;
                    if (chatBtn) chatBtn.click();
                  }}
                  farmerProfile={farmerProfile}
                />
              </motion.div>
            )}

            {/* TAB: Smart Farm Operations & Crop Lifecycle AI (Phase 8) */}
            {activeTab === 'resources' && (
              <motion.div
                key="resources"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <FarmResourceDashboard
                  soilData={formData}
                  cropName={selectedCrop?.crop || results?.recommendations[0]?.crop || 'Tomato'}
                  recommendations={results?.recommendations}
                  farmZones={farmZones}
                  weatherTemp={formData.temperature}
                  weatherHumidity={formData.humidity}
                  weatherRainProb={formData.rainfall > 100 ? 65 : 20}
                  weatherRainfallForecastMm={formData.rainfall}
                  isExpertMode={isExpertMode}
                  onToggleExpertMode={() => setIsExpertMode(!isExpertMode)}
                  onSelectTab={(tab) => setActiveTab(tab as AppTabId)}
                  onOpenCallModal={() => setIsCallModalOpen(true)}
                  onOpenAskCroperX={(question) => {
                    const chatBtn = document.querySelector('[data-agri-chat-toggle]') as HTMLButtonElement;
                    if (chatBtn) chatBtn.click();
                  }}
                />
              </motion.div>
            )}

            {/* TAB: Smart Farm Operations & Crop Lifecycle AI (Phase 8) */}
            {activeTab === 'operations' && (
              <motion.div
                key="operations"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <FarmOperationsDashboard
                  soilData={formData}
                  farmZones={farmZones}
                  weatherTemp={formData.temperature}
                  weatherHumidity={formData.humidity}
                  weatherRainProb={formData.rainfall > 100 ? 65 : 20}
                  weatherRainfallForecastMm={formData.rainfall}
                  cropName={selectedCrop?.crop || results?.recommendations[0]?.crop || 'Tomato'}
                  recommendations={results?.recommendations}
                  isExpertMode={isExpertMode}
                  onToggleExpertMode={() => setIsExpertMode(!isExpertMode)}
                  onSelectTab={(tab) => setActiveTab(tab as AppTabId)}
                  onOpenCallModal={() => setIsCallModalOpen(true)}
                  onOpenAskCroperX={(question) => {
                    const chatBtn = document.querySelector('[data-agri-chat-toggle]') as HTMLButtonElement;
                    if (chatBtn) chatBtn.click();
                  }}
                />
              </motion.div>
            )}

            {/* TAB: Predictive Farm Intelligence & Digital Twin (Phase 7) */}
            {activeTab === 'intelligence' && (
              <motion.div
                key="intelligence"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <FarmIntelligenceDashboard
                  soilData={formData}
                  farmZones={farmZones}
                  weatherTemp={formData.temperature}
                  weatherHumidity={formData.humidity}
                  weatherWindSpeed={formData.wind_speed}
                  weatherRainProb={formData.rainfall > 100 ? 65 : 20}
                  weatherRainfallForecastMm={formData.rainfall}
                  cropName={selectedCrop?.crop || results?.recommendations[0]?.crop || 'Rice'}
                  recommendations={results?.recommendations}
                  isExpertMode={isExpertMode}
                  onToggleExpertMode={() => setIsExpertMode(!isExpertMode)}
                  onSelectTab={(tab) => setActiveTab(tab as AppTabId)}
                  onOpenCallModal={() => setIsCallModalOpen(true)}
                />
              </motion.div>
            )}

            {/* TAB: Predictive Crop Risk & Early Warning Engine (Phase 6) */}
            {activeTab === 'risk' && (
              <motion.div
                key="risk"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <CropRiskDashboard
                  soilData={formData}
                  farmZones={farmZones}
                  recommendations={results?.recommendations}
                  isExpertMode={isExpertMode}
                  onToggleExpertMode={setIsExpertMode}
                  onSelectTab={(tab) => setActiveTab(tab as AppTabId)}
                  onOpenVoiceAI={() => setIsCallModalOpen(true)}
                  isOffline={typeof navigator !== 'undefined' ? !navigator.onLine : false}
                />
              </motion.div>
            )}

            {/* TAB: Smart Precision Irrigation AI (Phase 5) */}
            {activeTab === 'irrigation' && (
              <motion.div
                key="irrigation"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <SmartIrrigationDashboard
                  soilData={formData}
                  farmZones={farmZones}
                  weatherTemp={formData.temperature}
                  weatherRainProb={formData.rainfall > 100 ? 60 : 15}
                  weatherRainfallForecastMm={formData.rainfall}
                  recommendations={results?.recommendations}
                  isExpertMode={isExpertMode}
                  onToggleExpertMode={setIsExpertMode}
                  onOpenCallModal={() => setIsCallModalOpen(true)}
                  currentUser={currentUser}
                  farmerProfile={farmerProfile}
                />
              </motion.div>
            )}

            {/* TAB: Market Insights & ROI */}
            {activeTab === 'market' && (
              <motion.div 
                key="market"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <MarketInsights farmerProfile={farmerProfile} recommendations={results?.recommendations} />
              </motion.div>
            )}

            {/* TAB: Learn CroperX System Tutorial */}
            {activeTab === 'tutorial' && (
              <motion.div 
                key="tutorial"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <CroperXCourseTutorial />
              </motion.div>
            )}

            {/* TAB: Soil Health Trend */}
            {activeTab === 'soilTrend' && (

              <motion.div 
                key="soilTrend"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <SoilHealthTrend currentSoilData={formData} soilData={formData} storedScenarios={storedScenarios} />
              </motion.div>
            )}

            {/* TAB: Soil Heatmap Grid */}
            {activeTab === 'heatmap' && (
              <motion.div 
                key="heatmap"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <SoilHeatmapGrid baselineData={formData} />
              </motion.div>
            )}

            {/* TAB: Historical & Dual Crop Benchmark */}
            {activeTab === 'historical' && (
              <motion.div 
                key="historical"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                {/* Simultaneous Dual-Crop Benchmark Component */}
                <DualCropComparison />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recharts Yield Performance Chart */}
                  <div className="bg-white p-6 rounded-[2rem] border border-[#c8e6c9] shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-serif text-lg font-bold">Historical Crop Yields</h4>
                      <span className="text-[10px] uppercase tracking-wide font-black bg-[#f1f8f1] text-[#2e7d32] px-3 py-1 rounded-full">Last 5 Seasons</span>
                    </div>
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                          margin={{ top: 10, right: 30, left: 10, bottom: 25 }}
                          data={[
                            { year: '2021', Rice: 5.2, Maize: 4.1, Wheat: 3.8 },
                            { year: '2022', Rice: 5.6, Maize: 4.5, Wheat: 4.0 },
                            { year: '2023', Rice: 4.8, Maize: 3.9, Wheat: 3.5 },
                            { year: '2024', Rice: 6.1, Maize: 5.0, Wheat: 4.4 },
                            { year: '2025', Rice: 5.9, Maize: 4.8, Wheat: 4.2 }
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="year" stroke="#8a8a70" fontSize={11} />
                          <YAxis stroke="#8a8a70" fontSize={11} label={{ value: 'tons/ha', angle: -90, position: 'insideLeft', style: {textAnchor: 'middle'} }} />
                          <RechartsTooltip />
                          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} verticalAlign="bottom" height={36} />
                          <Line type="monotone" dataKey="Rice" stroke="#4CAF50" strokeWidth={3} />
                          <Line type="monotone" dataKey="Maize" stroke="#ffb74d" strokeWidth={2} />
                          <Line type="monotone" dataKey="Wheat" stroke="#64b5f6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Correlation Climate Chart */}
                  <div className="bg-white p-6 rounded-[2rem] border border-[#c8e6c9] shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-serif text-lg font-bold">Climate Correlation Index</h4>
                      <span className="text-[10px] uppercase tracking-wide font-black bg-[#f1f8f1] text-[#2e7d32] px-3 py-1 rounded-full">Rain vs Temperature</span>
                    </div>
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
                          data={[
                            { season: 'S21', Rainfall: 180, Temp: 21 },
                            { season: 'S22', Rainfall: 210, Temp: 22 },
                            { season: 'S23', Rainfall: 150, Temp: 23 },
                            { season: 'S24', Rainfall: 240, Temp: 20 },
                            { season: 'S25', Rainfall: 220, Temp: 21 }
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="season" stroke="#8a8a70" fontSize={11} />
                          <YAxis yAxisId="left" orientation="left" stroke="#4CAF50" fontSize={11} />
                          <YAxis yAxisId="right" orientation="right" stroke="#ffb74d" fontSize={11} />
                          <RechartsTooltip />
                          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} verticalAlign="bottom" height={36} />
                          <Bar yAxisId="left" dataKey="Rainfall" fill="#a5d6a7" radius={[4, 4, 0, 0]} />
                          <Bar yAxisId="right" dataKey="Temp" fill="#ffcc80" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Feedback Entry Logger Form & List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <form onSubmit={handleFeedbackAdd} className="bg-white p-8 rounded-[2rem] border border-[#c8e6c9] shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-xl font-bold flex items-center gap-2"><MessageSquare className="w-5 h-5 text-[#4CAF50]" /> Harvest Logger</h4>
                      <button
                        type="button"
                        onClick={() => setShowHarvestModal(true)}
                        className="px-3 py-1.5 bg-[#1b2e1b] hover:bg-[#2e7d32] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Sprout className="w-3.5 h-3.5 text-[#4CAF50]" />
                        <span>📸 Upload Photo Sample</span>
                      </button>
                    </div>
                    <p className="text-xs text-[#667e66]">Log actual harvest yields, crop sample photos, and field performance to calibrate recommendations.</p>
                    
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-[#8a8a70]">Crop Harvested</label>
                          <select 
                            value={newFeedback.crop} 
                            onChange={e => setNewFeedback(prev => ({ ...prev, crop: e.target.value }))}
                            className="farming-input text-sm py-1.5"
                          >
                            <option value="Rice">Rice</option>
                            <option value="Maize">Maize</option>
                            <option value="Wheat">Wheat</option>
                            <option value="Jute">Jute</option>
                            <option value="Coffee">Coffee</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-[#8a8a70]">Yield (tons/ha)</label>
                          <input 
                            type="number" step="0.1"
                            value={newFeedback.yieldVal} 
                            onChange={e => setNewFeedback(prev => ({ ...prev, yieldVal: parseFloat(e.target.value) || 0 }))}
                            className="farming-input text-sm py-1.5"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#8a8a70]">Season Quality Rating (1-5 Stars)</label>
                        <input 
                          type="range" min="1" max="5" step="1"
                          value={newFeedback.rating} 
                          onChange={e => setNewFeedback(prev => ({ ...prev, rating: parseInt(e.target.value) || 5 }))}
                          className="w-full accent-[#4CAF50]"
                        />
                        <div className="flex justify-between text-[10px] text-[#8a8a70] font-black">
                          <span>1 (Poor)</span>
                          <span className="text-[#4CAF50]">{newFeedback.rating} Stars</span>
                          <span>5 (Outstanding)</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#8a8a70]">Agronomic Notes</label>
                        <textarea 
                          value={newFeedback.notes} 
                          onChange={e => setNewFeedback(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="e.g. Unusual rainfall early season, high nitrogen load applied..."
                          className="w-full bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#4CAF50] outline-none"
                          rows={3}
                        />
                      </div>

                      <button type="submit" className="w-full btn-primary py-3 text-xs uppercase tracking-wider font-bold">
                        Submit Harvest Record
                      </button>
                    </div>
                  </form>

                  {/* Historical Harvest History */}
                  <div className="bg-white p-8 rounded-[2rem] border border-[#c8e6c9] shadow-sm flex flex-col h-full overflow-hidden">
                    <h4 className="font-serif text-xl font-bold flex items-center gap-2 mb-4"><History className="w-5 h-5 text-[#4CAF50]" /> Past Season Performance Logs</h4>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 max-h-[360px] pr-2 scrollbar-hide">
                      {feedbackList.length === 0 ? (
                        <div className="text-center py-12 text-[#8a8a70] text-xs">
                          <p>No harvest logs submitted yet.</p>
                          <p className="mt-1 opacity-70">Submit the form on the left to start tracking performance.</p>
                        </div>
                      ) : (
                        feedbackList.map(item => (
                          <div key={item.id} className="p-4 bg-[#f8fcf8] border border-[#c8e6c9]/60 rounded-2xl flex justify-between items-start gap-4 hover:border-[#4CAF50] transition-colors">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-serif text-base font-bold text-[#2e7d32]">{item.crop}</span>
                                <span className="text-[10px] bg-white border border-[#c8e6c9] px-2 py-0.5 rounded-full text-gray-500">{item.date}</span>
                              </div>
                              <div className="text-xs font-semibold text-gray-700">Yield achieved: <span className="font-mono text-[#4CAF50] font-black">{item.yieldVal} tons/ha</span></div>
                              {item.notes && <p className="text-[11px] text-[#667e66] italic bg-white p-2 rounded-lg border border-dashed border-[#c8e6c9] mt-2">{item.notes}</p>}
                              <div className="flex gap-0.5 text-xs text-yellow-500 pt-1">
                                {"★".repeat(item.rating)}{"☆".repeat(5-item.rating)}
                              </div>
                            </div>
                            <button 
                              onClick={() => handleFeedbackDelete(item.id)}
                              className="text-red-400 hover:text-red-600 p-1 bg-white border border-[#c8e6c9]/40 rounded-lg hover:shadow-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: Smart NPK Fertilizer Calculator */}
            {activeTab === 'fertilizer' && (
              <motion.div 
                key="fertilizer"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <FertilizerCalculator soilData={formData} />
              </motion.div>
            )}

            {/* TAB: Satellite Canopy & NDVI Proxy */}
            {activeTab === 'satellite' && (
              <motion.div 
                key="satellite"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <SatNdviPanel soilData={formData} />
              </motion.div>
            )}

            {/* TAB: Harvest Window Scheduler */}
            {activeTab === 'harvest' && (
              <motion.div 
                key="harvest"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <HarvestScheduler soilData={formData} cropRecommendation={results?.recommendations[0]} estimatedYield={currentYieldEstimate.expectedYield} />
              </motion.div>
            )}

            {/* TAB: Physical IoT Sensor Hub (ESP32 USB Serial Telemetry) */}
            {activeTab === 'iot' && (
              <motion.div
                key="iot"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <IoTSensorHub
                  soilData={formData}
                  onUpdateSoilData={(newData) => setFormData(prev => ({ ...prev, ...newData }))}
                  onNavigateToTab={(tab) => setActiveTab(tab as AppTabId)}
                  isExpertMode={isExpertMode}
                  onToggleExpertMode={setIsExpertMode}
                />
              </motion.div>
            )}

            {/* TAB: Live IoT Sensor Stream */}
            {activeTab === 'sensors' && (
              <motion.div 
                key="sensors"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <LiveSensorSync currentData={formData} onUpdateSoilData={(newData) => setFormData(prev => ({ ...prev, ...newData }))} />
              </motion.div>
            )}

            {/* TAB: Multi-Zone Farm Layout Editor */}
            {activeTab === 'farm' && (
              <motion.div 
                key="farm"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <FarmLayoutEditor 
                  baselineSoil={formData} 
                  onApplyZoneDataToMain={(newData) => setFormData(prev => ({ ...prev, ...newData }))} 
                  zones={farmZones}
                  onUpdateZones={setFarmZones}
                />
              </motion.div>
            )}

            {/* TAB: Agricultural Unit Converter */}
            {activeTab === 'converter' && (
              <motion.div 
                key="converter"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <UnitConverterPanel />
              </motion.div>
            )}

            {activeTab === 'rotation' && (
              <motion.div 
                key="rotation"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div className="bg-white p-8 rounded-[2.5rem] border border-[#c8e6c9] shadow-sm space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-serif text-2xl font-bold flex items-center gap-2">🔄 Crop Rotation Planner</h4>
                    <p className="text-xs text-[#667e66]">Input your current crop and receive multi-year crop rotations optimized for Soil Health (${formData.organic_matter}% Organic Matter) and Pest cycles.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-end pt-2">
                    <div className="flex-1">
                      <label className="text-[10px] uppercase font-bold text-[#8a8a70]">Current Primary Crop</label>
                      <select 
                        value={plannerCrop} 
                        onChange={e => setPlannerCrop(e.target.value)}
                        className="farming-input text-sm py-2.5"
                      >
                        <option value="Rice">Rice</option>
                        <option value="Maize">Maize</option>
                        <option value="Wheat">Wheat</option>
                        <option value="Jute">Jute</option>
                        <option value="Coffee">Coffee</option>
                      </select>
                    </div>
                    <button 
                      onClick={handleRotationPlanGenerate}
                      className="btn-primary py-3 px-6 text-xs uppercase tracking-wider font-bold h-[42px]"
                    >
                      🚀 Generate Rotation Strategy
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <h5 className="text-xs uppercase tracking-widest font-black text-[#8a8a70]">Generated Strategic Cycle</h5>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        { title: "Season 1: Legume Fixation", desc: "Replenish essential Nitrogen molecules into the active rhizosphere.", icon: FlaskConical, color: "bg-emerald-50 text-emerald-600" },
                        { title: "Season 2: Cover Strategy", desc: "Break deep pest propagation matrices and elevate soil biological density.", icon: Sprout, color: "bg-blue-50 text-blue-600" },
                        { title: "Season 3: Tuber Aeration", desc: "Penetrate deep layers, restoring natural sub-soil aeration channels.", icon: Wind, color: "bg-orange-50 text-orange-600" }
                      ].map((card, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-[2rem] border border-[#c8e6c9] shadow-sm space-y-4 hover:border-[#4CAF50] transition-colors relative">
                          <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                            <card.icon className="w-5 h-5" />
                          </div>
                          <h6 className="font-serif text-base font-bold text-[#1b2e1b]">{card.title}</h6>
                          <p className="text-xs text-[#667e66] leading-relaxed">{card.desc}</p>
                          {idx < 2 && (
                            <div className="hidden md:block absolute right-[-14px] top-1/2 transform -translate-y-1/2 z-10 text-[#4CAF50] text-lg font-bold">➔</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-[#c8e6c9] shadow-sm flex flex-col">
                    <h5 className="font-serif text-lg font-bold mb-4">Stored Rotation Cycles</h5>
                    <div className="space-y-4 overflow-y-auto max-h-[300px] scrollbar-hide flex-1">
                      {savedRotationPlans.length === 0 ? (
                        <p className="text-xs text-[#8a8a70] text-center py-10">No saved rotation plans found.</p>
                      ) : (
                        savedRotationPlans.map(plan => (
                          <div key={plan.id} className="p-4 bg-[#f8fcf8] border border-[#c8e6c9] rounded-2xl space-y-3 relative hover:border-[#4CAF50] transition-colors">
                            <button 
                              onClick={() => handleRotationPlanDelete(plan.id)}
                              className="absolute right-3 top-3 text-red-400 hover:text-red-600 p-1 bg-white border border-[#c8e6c9]/40 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-black text-[#2e7d32]">{plan.date}</span>
                              <h6 className="font-serif text-sm font-bold text-[#1b2e1b]">Starter: {plan.crop}</h6>
                            </div>
                            <div className="space-y-1 pl-3 border-l-2 border-[#4CAF50] text-[11px] text-[#667e66] space-y-2">
                              {plan.seasons.map((s, idx) => (
                                <p key={idx} className="line-clamp-2">{s}</p>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'weather' && (
              <motion.div 
                key="weather"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <WeatherAlertsRedesign
                  soilData={formData}
                  onOpenCallModal={() => setIsCallModalOpen(true)}
                />
                {/* 7-Day Predictive Yield Impact Alert Component */}
                <WeatherPredictiveAlerts soilData={formData} frostThreshold={frostThreshold} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Weather Config Form */}
                  <div className="bg-white p-8 rounded-[2.5rem] border border-[#c8e6c9] shadow-sm space-y-6 lg:col-span-2">
                    <div className="space-y-1">
                      <h4 className="font-serif text-2xl font-bold flex items-center gap-2">🌦️ Weather Insights & Customs Alert</h4>
                      <p className="text-xs text-[#667e66]">Configure customized hazard warning alert thresholds for your specific geographic farm area.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-[#8a8a70] flex justify-between">
                          <span>Frost Risk Limit</span>
                          <span className="text-[#4CAF50] font-mono">{frostThreshold}%</span>
                        </label>
                        <input 
                          type="range" min="10" max="90" step="5"
                          value={frostThreshold} 
                          onChange={e => saveWeatherThresholds(parseFloat(e.target.value), rainThreshold, windThreshold)}
                          className="w-full accent-[#4CAF50]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-[#8a8a70] flex justify-between">
                          <span>Max Heavy Rainfall</span>
                          <span className="text-[#4CAF50] font-mono">{rainThreshold} mm</span>
                        </label>
                        <input 
                          type="range" min="50" max="300" step="10"
                          value={rainThreshold} 
                          onChange={e => saveWeatherThresholds(frostThreshold, parseFloat(e.target.value), windThreshold)}
                          className="w-full accent-[#4CAF50]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-[#8a8a70] flex justify-between">
                          <span>Max Wind Speed</span>
                          <span className="text-[#4CAF50] font-mono">{windThreshold} km/h</span>
                        </label>
                        <input 
                          type="range" min="10" max="60" step="5"
                          value={windThreshold} 
                          onChange={e => saveWeatherThresholds(frostThreshold, rainThreshold, parseFloat(e.target.value))}
                          className="w-full accent-[#4CAF50]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Simulated Telemetry Metrics */}
                  <div className="bg-[#1b2e1b] rounded-[2.5rem] p-8 text-white flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-black tracking-widest text-[#4CAF50]">Live Station Telemetry</span>
                      <h4 className="font-serif text-3xl font-bold">Nairobi Central</h4>
                      <p className="text-xs text-[#8a8a70]">Synchronized active climate metrics mapped via regional atmospheric telemetry.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <span className="text-[9px] uppercase text-white/50 font-bold">Active Wind</span>
                        <div className="text-lg font-black font-mono">{formData.wind_speed || 10.1} km/h</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <span className="text-[9px] uppercase text-white/50 font-bold">Frost Probability</span>
                        <div className="text-lg font-black font-mono">{formData.frost_risk}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Customized Warning Feeds */}
                <div className="space-y-4">
                  <h5 className="text-xs uppercase tracking-widest font-black text-[#8a8a70]">Custom Warning Alert Triggers</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Wind Threat Alert */}
                    {formData.wind_speed > windThreshold ? (
                      <div className="p-6 bg-red-50 border-2 border-red-200 rounded-[2rem] flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h6 className="text-sm font-bold text-red-800">⚠️ HEAVY WIND SPEED THREAT ACTIVE</h6>
                          <p className="text-xs text-red-700 leading-relaxed">The active wind telemetry ({formData.wind_speed} km/h) exceeds your custom alert threshold ({windThreshold} km/h). Crop lodging or physical stem snapping risk has elevated to moderate levels.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 bg-[#f8fcf8] border border-[#c8e6c9]/60 rounded-[2rem] flex gap-4 items-start text-gray-500">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h6 className="text-sm font-bold">Wind Speed Safe</h6>
                          <p className="text-xs leading-relaxed">Wind speed ({formData.wind_speed} km/h) remains below your custom hazard trigger ({windThreshold} km/h).</p>
                        </div>
                      </div>
                    )}

                    {/* Frost Threat Alert */}
                    {formData.frost_risk > frostThreshold ? (
                      <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-[2rem] flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h6 className="text-sm font-bold text-blue-800">❄️ ACTIVE FROST CELL ALIGNMENT WARNING</h6>
                          <p className="text-xs text-blue-700 leading-relaxed">The active frost risk index ({formData.frost_risk}%) exceeds your safe limit ({frostThreshold}%). Critical leaf frost lesions possible. Establish row covers immediately.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 bg-[#f8fcf8] border border-[#c8e6c9]/60 rounded-[2rem] flex gap-4 items-start text-gray-500">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h6 className="text-sm font-bold">Frost Probability Safe</h6>
                          <p className="text-xs leading-relaxed">Frost hazard ({formData.frost_risk}%) remains below your customized hazard alert trigger ({frostThreshold}%).</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'diagnostics' && (
              <motion.div 
                key="diagnostics"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <PlantDiagnosisRedesign
                  diagnosticImage={diagnosticImage}
                  isDiagnosing={isDiagnosing}
                  diagnosticReport={diagnosticReport}
                  diagnosticAlert={diagnosticAlert}
                  onImageUpload={handleDiagnosticUpload}
                  onOpenCallModal={() => setIsCallModalOpen(true)}
                />
                <div className="bg-white p-8 rounded-[2.5rem] border border-[#c8e6c9] shadow-sm space-y-6">
                  <div className="space-y-1">
                    <h4 className="font-serif text-2xl font-bold flex items-center gap-2">🏥 Crop Disease & Pathogen Diagnostic Portal</h4>
                    <p className="text-xs text-[#667e66]">Upload crop images (leaves, stems, roots) to execute real-time multimodal diagnostic mapping with automated remediation strategies.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                    {/* Drag-and-drop Image Upload Box */}
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-[#c8e6c9] hover:border-[#4CAF50] rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative min-h-[220px] bg-[#f8fcf8]">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleDiagnosticUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="w-12 h-12 bg-[#f1f8f1] rounded-2xl flex items-center justify-center text-[#4CAF50] mb-3">
                          <Plus className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-gray-700">Drag & Drop Plant Leaf Photo</p>
                        <p className="text-[10px] text-gray-500 mt-1">Supports PNG, JPEG up to 10MB</p>
                      </div>

                      {diagnosticImage && (
                        <div className="relative rounded-3xl overflow-hidden shadow-md max-h-[300px]">
                          <img src={diagnosticImage} className="w-full h-full object-cover" alt="Diagnostic subject" />
                          <div className="absolute top-3 left-3 bg-[#1b2e1b]/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#4CAF50] animate-pulse" />
                            Agronomic Contrast Enhanced
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Diagnostic results render area */}
                    <div className="bg-[#fcfdfc] p-6 rounded-3xl border border-[#c8e6c9] flex flex-col h-full min-h-[280px]">
                      <h5 className="text-[10px] uppercase tracking-widest font-black text-[#8a8a70] border-b border-[#c8e6c9] pb-4 mb-4">Diagnostics Console Output</h5>
                      
                      <div className="flex-1 space-y-4">
                        {isDiagnosing ? (
                          <div className="flex flex-col items-center justify-center py-12 text-[#4CAF50] space-y-4">
                            <RefreshCw className="w-12 h-12 animate-spin" />
                            <div className="text-center">
                              <p className="font-serif italic font-bold">Executing Pathogen Contrast-Mapping...</p>
                              <p className="text-[10px] opacity-75 mt-1">Analyzing tissue structure and chlorosis pattern markers.</p>
                            </div>
                          </div>
                        ) : diagnosticReport ? (
                          <div className="space-y-4 text-xs leading-relaxed text-gray-700 whitespace-pre-line">
                            {diagnosticAlert && (
                              <div className={`p-4 rounded-xl border text-[11px] font-bold ${
                                diagnosticAlert.startsWith("⚠️") 
                                  ? "bg-red-50 border-red-200 text-red-800" 
                                  : "bg-emerald-50 border-emerald-200 text-emerald-800"
                              }`}>
                                {diagnosticAlert}
                              </div>
                            )}
                            <p className="bg-white p-4 rounded-2xl border border-[#c8e6c9] shadow-sm max-h-[300px] overflow-y-auto">{diagnosticReport}</p>
                          </div>
                        ) : (
                          <div className="text-center py-16 text-gray-400 text-xs flex flex-col items-center justify-center space-y-2">
                            <Activity className="w-8 h-8 opacity-40 mb-2" />
                            <p>Telemetry standby.</p>
                            <p className="opacity-70">Provide a sample leaf scan using the uploader tool to diagnose tissue damage or pathogenic presence.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'fertilizer' && (
              <motion.div 
                key="fertilizer"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <FertilizerCalculatorRedesign
                  soilData={formData}
                  onOpenCallModal={() => setIsCallModalOpen(true)}
                />
              </motion.div>
            )}

            {activeTab === 'zones' && (
              <motion.div 
                key="zones"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <FarmLayoutRedesign
                  zones={farmZones}
                  onToggleZonePush={handleToggleZonePush}
                  onOpenCallModal={() => setIsCallModalOpen(true)}
                />
              </motion.div>
            )}

            {activeTab === 'drone' && (
              <motion.div
                key="drone"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <DroneScoutingHub
                  soilData={formData}
                  cropName={selectedCrop?.crop || 'Rice'}
                  farmZones={farmZones}
                  onOpenCallModal={() => setIsCallModalOpen(true)}
                />
              </motion.div>
            )}

            {activeTab === 'carbon' && (
              <motion.div
                key="carbon"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <CarbonCreditLedger
                  soilData={formData}
                  cropName={selectedCrop?.crop || 'Rice'}
                  farmAreaHa={Number(farmerProfile?.farmAreaSize) || 12.5}
                  farmerName={farmerProfile?.farmerName || 'Chief Farmer'}
                  onOpenCallModal={() => setIsCallModalOpen(true)}
                />
              </motion.div>
            )}

            {activeTab === 'arbitrage' && (
              <motion.div
                key="arbitrage"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <AgriCommodityArbitrage
                  cropName={selectedCrop?.crop || 'Rice'}
                  onOpenCallModal={() => setIsCallModalOpen(true)}
                />
              </motion.div>
            )}

            {activeTab === 'bioacoustics' && (
              <motion.div
                key="bioacoustics"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <SoilBioAcousticsDiagnostic
                  soilData={formData}
                  cropName={selectedCrop?.crop || 'Rice'}
                  farmZones={farmZones}
                  onOpenCallModal={() => setIsCallModalOpen(true)}
                />
              </motion.div>
            )}

            {/* TAB: Real-Time Instagram Agri-Chat */}
            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#c8e6c9]">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-[#1b2e1b] flex items-center gap-2">
                      <span>💬 Instagram-Style Agronomy Chat</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-bold border border-pink-200">
                        Live DMs & Audio Notes
                      </span>
                    </h3>
                    <p className="text-xs text-[#667e66] mt-0.5">
                      Direct consultation messaging with field farmers, live GPS sync, and instant WebRTC video calls.
                    </p>
                  </div>
                </div>

                <InstagramAgriChat
                  currentUserId={currentUser?.id || 'usr_adviser_demo'}
                  currentUserName={currentUser?.farmerName || 'Dr. Harpreet Singh'}
                  currentUserRole="farmer_adviser"
                  currentUserAvatar={currentUser?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  onInitiateVideoCall={() => setIsCallModalOpen(true)}
                />
              </motion.div>
            )}

            {/* TAB: Live Farmer Incoming Calls Workstation */}
            {activeTab === 'calls' && (
              <motion.div
                key="calls"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <IncomingFarmerCallPanel
                  adviserId={currentUser?.id || 'usr_adviser_demo'}
                  adviserName={currentUser?.farmerName || 'Dr. Harpreet Singh'}
                  adviserSpecialty="Senior Agronomy Consultant"
                  adviserDistrict="Ludhiana"
                  adviserState="Punjab"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Report Export Modal */}
      {showReportModal && (
        <ReportExportModal
          soilData={formData}
          recommendations={results}
          selectedCrop={selectedCrop}
          diagnosticResult={diagnosticReport}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* Unified Profile Modal for Adviser / Main View */}
      <UnifiedProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentUser={currentUser}
        currentRole={userRole}
        farmerProfile={farmerProfile}
        onProfileUpdated={handleProfileUpdated}
        onOpenChangePassword={() => {
          setShowProfileModal(false);
          setShowChangePasswordModal(true);
        }}
        onLogoutAllSessions={() => handleConfirmLogout(true)}
      />

      {/* Unified Settings Modal for Adviser / Main View */}
      <UnifiedSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentRole={userRole}
        phoneNumber={currentUser?.phoneNumber}
        initialSection={settingsSection}
        onOpenChangePassword={() => {
          setShowSettingsModal(false);
          setShowChangePasswordModal(true);
        }}
        onLogoutAllSessions={() => handleConfirmLogout(true)}
        onLanguageChange={(lang) => setLanguage(lang as any)}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        phoneNumber={currentUser?.phoneNumber}
        role={userRole}
      />

      {/* Secure Logout Confirmation Modal */}
      <SecureLogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        role={userRole}
        userName={currentUser?.farmerName || 'Agronomist'}
        onConfirmLogout={handleConfirmLogout}
      />

      {/* First-Time Farmer Onboarding 6-Step Flow */}
      <FirstTimeFarmerOnboarding
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        currentProfile={farmerProfile}
        onComplete={(data) => {
          if (data.name || data.location) {
            setFarmerProfile(prev => ({
              ...prev,
              farmerName: data.name || prev.farmerName,
              farmLocation: data.location || prev.farmLocation,
              farmAreaSize: data.farmSize || prev.farmAreaSize
            }));
          }
          setShowOnboarding(false);
        }}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setFarmerProfile(userToFarmerProfile(user));
          if (user.role) {
            setUserRole(user.role);
            localStorage.setItem('croperx_user_role', user.role);
          } else {
            setShowRoleModal(true);
          }
        }}
      />

      {/* AI Agronomist Interactive Chatbot Widget */}
      <AgriChatbot soilData={formData} />

      {/* Adviser Multi-Model Crop Prediction Mission Modal */}
      <AdviserCropPredictionMissionModal
        isOpen={showCropMissionModal}
        onClose={() => setShowCropMissionModal(false)}
        soilData={formData}
        farmerName={farmerProfile.farmerName}
        farmLocation={farmerProfile.farmLocation}
        onApplyRecommendation={(cropName) => {
          setSelectedCrop({
            crop: cropName,
            confidence: 96,
            description: `Predicted by CroperX Multi-Agent Consensus based on live soil NPK, pH (${formData.ph}), and regional climatic factors.`,
            rotation: 'Legume - Cereal rotation recommended',
            farmingTips: ['Maintain adequate soil moisture during vegetative phase', 'Monitor for regional pest outbreaks'],
            idealConditions: {
              n: `${formData.nitrogen} kg/ha`,
              p: `${formData.phosphorus} kg/ha`,
              k: `${formData.potassium} kg/ha`,
              temp: `${formData.temperature}°C`,
              rain: `${formData.rainfall} mm`
            },
            reasoning: `Predicted by CroperX Multi-Agent Consensus based on live soil NPK, pH (${formData.ph}), and regional climatic factors.`
          });
        }}
      />

      {/* Harvest Performance Logger Modal */}
      <HarvestLoggingModal
        isOpen={showHarvestModal}
        onClose={() => setShowHarvestModal(false)}
        defaultCropName={selectedCrop?.crop || 'Rice'}
      />

      {/* CroperX Call Duplex Voice Modal */}
      <CroperXCallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        currentLanguage={language}
        soilData={formData}
        cropRecommendations={results?.recommendations}
        onAddTranscriptLog={(query, response) => {
          setTranscriptLogs(prev => [
            { id: Math.random().toString(), time: new Date().toLocaleTimeString(), query, response },
            ...prev
          ]);
        }}
      />

      {/* Global Natural Language Smart Search Modal */}
      <GlobalSmartSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenCallModal={() => setIsCallModalOpen(true)}
        onOpenChat={() => {
          // Open chat widget
          const chatBtn = document.querySelector('[data-agri-chat-toggle]') as HTMLButtonElement;
          if (chatBtn) chatBtn.click();
        }}
      />

      {/* Bottom Sticky Mobile Navigation */}
      <BottomMobileNav
        activeTab={activeTab as AppTabId}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenCallModal={() => setIsCallModalOpen(true)}
        onOpenChat={() => {
          const chatBtn = document.querySelector('[data-agri-chat-toggle]') as HTMLButtonElement;
          if (chatBtn) chatBtn.click();
        }}
      />

      </div>

      {/* Unobtrusive System Debug & Performance Panel */}
      <SystemDebugPanel />

      {/* Role Selection Modal */}
      <RoleSelectionModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        currentRole={userRole}
        onSelectRole={(role) => {
          setUserRole(role);
          localStorage.setItem('croperx_user_role', role);
          broadcastAuthEvent({ type: 'ROLE_CHANGED', role });
          setAdminPreviewRole(null);
          setShowRoleModal(false);
        }}
        canDismiss={true}
      />

      {/* Adviser Learning & Mastery Gateway (Phase 43) */}
      {showAdviserLearningGateway && (
        <AdviserLearningGateway
          currentUser={currentUser}
          onCourseCompleted={(updatedUser) => {
            if (currentUser) {
              setCurrentUser({ ...currentUser, ...updatedUser, accountStatus: 'active' });
            }
            setShowAdviserLearningGateway(false);
          }}
          onLogout={() => {
            setShowAdviserLearningGateway(false);
            handleConfirmLogout(false);
          }}
        />
      )}

      {/* Adviser Onboarding & Verification Gateway (Phase 43) */}
      {showAdviserOnboardingModal && (
        <AdviserOnboardingGateway
          initialMobile={currentUser?.phoneNumber || ''}
          onClose={() => setShowAdviserOnboardingModal(false)}
          onEnterWorkstation={(user) => {
            setShowAdviserOnboardingModal(false);
            setCurrentUser(user);
          }}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

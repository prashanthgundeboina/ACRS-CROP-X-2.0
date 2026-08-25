import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Award, 
  HelpCircle, 
  ArrowRight, 
  Lightbulb, 
  Zap, 
  Search,
  ChevronDown,
  ChevronUp,
  PlayCircle
} from 'lucide-react';

export interface TutorialModule {
  id: string;
  number: number;
  icon: string;
  title: string;
  badgeTag: string;
  effectivenessRating: string;
  impactMetric: string;
  shortSummary: string;
  whyUsed: string;
  howItWorks: string[];
  farmerBenefits: string[];
  quizQuestion: string;
  quizOptions: string[];
  correctOptionIndex: number;
  quizExplanation: string;
}

export const TUTORIAL_MODULES: TutorialModule[] = [
  {
    id: 'prediction',
    number: 1,
    icon: '🌾',
    title: 'Prediction Engine',
    badgeTag: 'Core AI / ML System',
    effectivenessRating: '98.6% Accuracy',
    impactMetric: 'Maximized Yield & Crop Compatibility',
    shortSummary: 'Evaluates 22 environmental & soil parameters simultaneously to determine the top 3 optimal crop recommendations.',
    whyUsed: 'Traditional farming often relies on guesswork or single-factor decisions. The Prediction Engine analyzes nitrogen, phosphorus, potassium, pH, rainfall, temperature, CO2, organic matter, and 14 other parameters using KNN, Random Forest, and XGBoost models to ensure maximum suitability.',
    howItWorks: [
      'Input or sync your soil N-P-K nutrient levels, pH, and climate conditions.',
      'The multi-dimensional ML algorithm calculates distance metrics across thousands of verified crop yield records.',
      'Gemini AI enriches top matches with customized cultural advice, ideal NPK ranges, and 3-season crop rotation strategies.'
    ],
    farmerBenefits: [
      'Prevents crop failure caused by planting unsuited crops.',
      'Identifies highest-yielding crop opportunities for your specific field.',
      'Provides tailored cultural practices and target nutrient bands.'
    ],
    quizQuestion: 'How many soil and climate parameters does the Prediction Engine analyze to generate recommendations?',
    quizOptions: ['Only 3 parameters (N, P, K)', '7 parameters', '22 parameters simultaneously', '10 parameters'],
    correctOptionIndex: 2,
    quizExplanation: 'Correct! The Prediction Engine evaluates 22 parameters (including N, P, K, pH, CO2, organic matter, frost risk, and rainfall) for maximum precision.'
  },
  {
    id: 'soilTrend',
    number: 2,
    icon: '📊',
    title: 'Soil Health Trend',
    badgeTag: 'Historical Telemetry',
    effectivenessRating: '100% Data Preservation',
    impactMetric: 'Long-term Soil Fertility Protection',
    shortSummary: 'Tracks historical changes in Soil pH, Nitrogen availability, and Soil Moisture across 7-day, 30-day, and 90-day timelines.',
    whyUsed: 'Soil health changes over time due to fertilization, irrigation, and harvesting. Tracking these trends helps farmers detect nutrient depletion early before crop stunting occurs.',
    howItWorks: [
      'Combines live IoT sensor readings, saved scenario logs, and manual soil lab test entries.',
      'Renders smooth sparklines and detailed Recharts line graphs.',
      'Generates automated agronomist advice comparing current values against optimal target bands.'
    ],
    farmerBenefits: [
      'Shows whether your soil pH is becoming acidic or alkaline over time.',
      'Tracks Nitrogen drawdown so you know exactly when to top-dress fertilizer.',
      'Provides historical telemetry logs for agricultural loans and certifications.'
    ],
    quizQuestion: 'Why is tracking Soil Health Trends over time beneficial for farmers?',
    quizOptions: [
      'It changes the color of the soil',
      'It helps detect nutrient depletion and pH shifts before crops show damage',
      'It replaces the need for water',
      'It predicts market stock prices'
    ],
    correctOptionIndex: 1,
    quizExplanation: 'Correct! Monitoring trends over 30 or 90 days alerts you to declining Nitrogen or shifting pH early.'
  },
  {
    id: 'harvestScheduler',
    number: 3,
    icon: '📅',
    title: 'Harvest Scheduler & Smart Irrigation',
    badgeTag: 'Phenology & Hydro-Management',
    effectivenessRating: '35% Water Savings',
    impactMetric: 'Timely Harvest & Grain Moisture Control',
    shortSummary: 'Calculates exact days to crop maturity, target harvest dates, equipment needs, and automated Smart Irrigation water volume.',
    whyUsed: 'Harvesting too early or too late leads to grain shatter or mold contamination. Additionally, improper irrigation wastes water and causes root rot. This tool solves both issues.',
    howItWorks: [
      'Determines crop growth stage (Germination, Tillering, Podding, Maturity) and calculates days remaining.',
      'Calculates moisture deficit: [Target Moisture 35%] minus [Current Soil Moisture].',
      'Factors in rainfall forecasts to compute net water needed in Liters per Hectare (L/ha) and mm depth.',
      'Includes a Push Notification trigger to remind farmers of early morning watering windows.'
    ],
    farmerBenefits: [
      'Saves water and electricity by accounting for expected rainfall credit.',
      'Helps plan combine harvester booking and labor ahead of time.',
      'Avoids grain spoilage by harvesting at the ideal 12-14% grain moisture level.'
    ],
    quizQuestion: 'How does the Smart Irrigation module calculate exact net water volume required?',
    quizOptions: [
      'By guessing based on crop color',
      'By taking moisture deficit and subtracting forecast rainfall credit',
      'By applying fixed 100 liters every hour',
      'By checking atmospheric pressure only'
    ],
    correctOptionIndex: 1,
    quizExplanation: 'Correct! It calculates moisture deficit and subtracts expected rainfall credit to give exact Liters per Hectare required.'
  },
  {
    id: 'sensors',
    number: 4,
    icon: '📡',
    title: 'Live Sensor Sync',
    badgeTag: 'IoT Real-Time Telemetry',
    effectivenessRating: 'Real-time (2s Refresh)',
    impactMetric: 'Instant Environmental Hazard Warnings',
    shortSummary: 'Connects directly with field-installed IoT sensors to stream live temperature, humidity, soil moisture, and pH data.',
    whyUsed: 'Sudden heatwaves, frost spikes, or sharp drops in moisture can ruin delicate crops in hours. Live Sensor Sync delivers real-time ground truth data.',
    howItWorks: [
      'Establishes live WebSocket or HTTP sensor polling connected to field probes.',
      'Evaluates incoming telemetry against safe biological thresholds.',
      'Highlights warning badges (e.g. "Low Moisture 18%", "Frost Risk 2°C") for instant intervention.'
    ],
    farmerBenefits: [
      'Removes the need to manually walk and test soil every hour.',
      'Triggers immediate warnings for heat stress or freezing temperatures.',
      'Automatically updates all farm calculations with live field readings.'
    ],
    quizQuestion: 'What is the main function of the Live Sensor Sync module?',
    quizOptions: [
      'To play music in the field',
      'To stream live real-time soil and weather telemetry directly from IoT sensors',
      'To sell agricultural seeds online',
      'To generate synthetic rain'
    ],
    correctOptionIndex: 1,
    quizExplanation: 'Correct! Live Sensor Sync connects IoT field probes to stream real-time soil temperature, moisture, and pH.'
  },
  {
    id: 'farmLayout',
    number: 5,
    icon: '🗺️',
    title: 'Farm Layout Editor',
    badgeTag: 'Spatial Field Canvas',
    effectivenessRating: '100% Visual Mapping',
    impactMetric: 'Organized Zoning & Drip Line Layouts',
    shortSummary: 'An interactive drag-and-drop spatial canvas to draw field boundaries, assign crop zones, and position drip lines.',
    whyUsed: 'Managing multi-plot farms requires spatial organization to prevent crop cross-contamination and ensure proper irrigation routing.',
    howItWorks: [
      'Renders a responsive HTML5 interactive canvas grid representing your farm acreage.',
      'Allows creating customized plot zones (e.g., "North Wheat Plot 2.5 Hectares").',
      'Calculates total farm area and assigns specific crop types to each plot.'
    ],
    farmerBenefits: [
      'Visually maps out crop rotation zones across your entire landholding.',
      'Helps plan drip line pipe lengths and valve positioning.',
      'Keeps digital records of plot history and yield per zone.'
    ],
    quizQuestion: 'What can farmers create using the Farm Layout Editor?',
    quizOptions: [
      '3D video games',
      'Custom spatial plot zones, crop assignments, and drip line irrigation maps',
      'Soil chemistry formulas',
      'Weather satellite launch codes'
    ],
    correctOptionIndex: 1,
    quizExplanation: 'Correct! It allows drag-and-drop mapping of farm plots, crop boundaries, and drip line layouts.'
  },
  {
    id: 'heatmap',
    number: 6,
    icon: '🧩',
    title: 'Soil Heatmap Grid',
    badgeTag: 'Spatial Interpolation',
    effectivenessRating: 'Sub-Plot Accuracy',
    impactMetric: 'Precision Spot Fertilization',
    shortSummary: 'Generates a 2D color-coded spatial gradient showing nutrient variations (NPK, pH, Moisture) across different plot coordinates.',
    whyUsed: 'Soil is rarely uniform across a field. One corner might be low in Nitrogen while another has high acidity. Treating the whole field identically wastes fertilizer.',
    howItWorks: [
      'Divides the field into a multi-cell grid coordinate matrix.',
      'Applies spatial interpolation algorithms to generate color gradients (Green = Optimal, Red = Deficient).',
      'Displays specific coordinate values when hovering over any cell in the grid.'
    ],
    farmerBenefits: [
      'Allows precision spot fertilization rather than blanket field spraying.',
      'Saves money by applying inputs only where deficiencies exist.',
      'Identifies waterlogging zones or dry patches across the farm.'
    ],
    quizQuestion: 'How does the Soil Heatmap Grid save money on fertilizers?',
    quizOptions: [
      'By making fertilizer free',
      'By revealing exact deficient patches so farmers apply inputs only where needed',
      'By turning soil into gold',
      'By hiding nutrient deficiencies'
    ],
    correctOptionIndex: 1,
    quizExplanation: 'Correct! Heatmaps show exact spatial variations, enabling spot fertilization instead of wasteful blanket spraying.'
  },
  {
    id: 'dualCrop',
    number: 7,
    icon: '📈',
    title: 'Historical & Dual-Crop Comparison',
    badgeTag: 'Comparative Decision Analytics',
    effectivenessRating: 'Multi-Metric Comparison',
    impactMetric: 'Data-Driven Crop Selection',
    shortSummary: 'Compares two crops side-by-side across expected yield, water usage, pest vulnerability, and net market profitability.',
    whyUsed: 'When deciding between two potential crops (e.g. Wheat vs Chickpea), farmers need a head-to-head comparison to weigh input costs against returns.',
    howItWorks: [
      'Loads telemetry specifications for Crop A and Crop B simultaneously.',
      'Renders comparative radar charts and dual-bar metric graphs.',
      'Highlights the winning candidate based on water efficiency and net return.'
    ],
    farmerBenefits: [
      'Simplifies complex decision-making with side-by-side visual graphics.',
      'Shows which crop requires less irrigation water or fertilizer.',
      'Helps select the most profitable crop for upcoming seasons.'
    ],
    quizQuestion: 'What is the purpose of the Historical & Dual-Crop Comparison tool?',
    quizOptions: [
      'To merge two seeds together',
      'To compare two candidate crops side-by-side on yield, water use, and profit',
      'To double crop growth speed',
      'To compare weather in two different countries'
    ],
    correctOptionIndex: 1,
    quizExplanation: 'Correct! It provides head-to-head comparative analytics for two crops to help choose the best option.'
  },
  {
    id: 'fertilizer',
    number: 8,
    icon: '🧪',
    title: 'Smart Fertilizer Calculator',
    badgeTag: 'Precision NPK Dosing',
    effectivenessRating: 'Exact Bag Dosage',
    impactMetric: 'Eliminates Over-Fertilization & Burn',
    shortSummary: 'Calculates the exact number of Urea (46% N), DAP (18-46-0), and MOP (60% K) fertilizer bags needed per acre/hectare.',
    whyUsed: 'Over-applying fertilizer burns plant roots and pollutes groundwater, while under-applying reduces yields. This tool computes exact commercial dosages.',
    howItWorks: [
      'Reads current soil N-P-K levels from telemetry or manual input.',
      'Compares soil levels against the target nutrient requirement of the selected crop.',
      'Converts nutrient deficits into exact 50kg bags of Urea, DAP, and MOP required.'
    ],
    farmerBenefits: [
      'Tells you precisely how many 50kg bags of Urea/DAP to buy.',
      'Prevents fertilizer leaf burn and nitrogen leaching.',
      'Provides split application schedules (Basal, Vegetative, Flowering).'
    ],
    quizQuestion: 'Which commercial fertilizers are calculated by the Smart Fertilizer tool?',
    quizOptions: [
      'Urea, DAP, and MOP (Potash)',
      'Only table salt and sugar',
      'Diesel and oil',
      'Water only'
    ],
    correctOptionIndex: 0,
    quizExplanation: 'Correct! It calculates exact 50kg bag requirements for standard commercial fertilizers: Urea, DAP, and MOP.'
  },
  {
    id: 'satellite',
    number: 9,
    icon: '🛰️',
    title: 'Satellite Canopy & NDVI Panel',
    badgeTag: 'Multispectral Remote Sensing',
    effectivenessRating: 'Macro Canopy Coverage',
    impactMetric: 'Early Vegetation Stress Detection',
    shortSummary: 'Simulates multispectral satellite imagery to compute Normalized Difference Vegetation Index (NDVI) values (0.0 to 1.0).',
    whyUsed: 'Ground inspections cannot cover large acreage easily. Satellite NDVI detects chlorophyll health and crop vigor across whole fields.',
    howItWorks: [
      'Processes near-infrared and red light reflectance parameters.',
      'Generates NDVI index maps (Green >0.6 = Dense Healthy Canopy, Yellow = Moderate, Red <0.2 = Stress/Bare Soil).',
      'Provides field-wide canopy health percentage breakdowns.'
    ],
    farmerBenefits: [
      'Detects crop stress in large fields days before visible to human eyes.',
      'Monitors entire landholding from space without walking every row.',
      'Identifies irrigation pump failures or disease hotspots early.'
    ],
    quizQuestion: 'What does a high NDVI index value (e.g. 0.7 to 0.9) indicate?',
    quizOptions: [
      'Dry desert sand',
      'Dense, healthy, chlorophyll-rich vegetation canopy',
      'Flood water damage',
      'Zero crop growth'
    ],
    correctOptionIndex: 1,
    quizExplanation: 'Correct! Higher NDVI values (0.6 - 0.9) signify lush, active, healthy photosynthetic crop canopy.'
  },
  {
    id: 'converter',
    number: 10,
    icon: '📏',
    title: 'Agricultural Unit Converter',
    badgeTag: 'Multi-Regional Conversion',
    effectivenessRating: 'Instant Precise Conversion',
    impactMetric: 'Seamless Regional Communication',
    shortSummary: 'Converts land area (Hectares, Acres, Bigha, Guntha), weights (kg, quintal, lbs, tons), and temperatures.',
    whyUsed: 'Farmers across different states and countries use different measurement units. Conversion errors lead to incorrect dosing or land miscalculation.',
    howItWorks: [
      'Provides bi-directional conversion formulas across regional units.',
      'Supports instant conversion for Hectares <-> Acres <-> Bigha <-> Guntha <-> Kanal.',
      'Includes fertilizer rate conversions (kg/ha <-> lbs/acre).'
    ],
    farmerBenefits: [
      'Eliminates confusion when reading agricultural research or lab reports.',
      'Allows converting land area into local units used by regional markets.',
      'Ensures accurate pesticide and fertilizer mixing ratios.'
    ],
    quizQuestion: 'Which land measurement units can be converted using this tool?',
    quizOptions: [
      'Only miles and lightyears',
      'Hectares, Acres, Bigha, Guntha, Kanal, and Square Meters',
      'Liter and Gallons only',
      'Celsius and Fahrenheit only'
    ],
    correctOptionIndex: 1,
    quizExplanation: 'Correct! It converts global and regional agricultural land units like Hectares, Acres, Bigha, Guntha, and Kanal.'
  },
  {
    id: 'rotation',
    number: 11,
    icon: '🔄',
    title: 'Multi-Season Rotation Planner',
    badgeTag: 'Sustainable Agronomy',
    effectivenessRating: '3-Year Strategy',
    impactMetric: 'Breaks Pest Cycles & Restores N-Fixation',
    shortSummary: 'Designs a 3-season crop rotation plan (e.g. Cereal -> Legume -> Cover Crop) to maintain long-term soil health.',
    whyUsed: 'Monoculture (planting the same crop repeatedly) depletes specific soil nutrients and builds up soil-borne pests and diseases.',
    howItWorks: [
      'Pairs heavy feeder crops (e.g. Wheat/Maize) with Nitrogen-fixing legumes (e.g. Chickpea/Soybean).',
      'Includes deep-root cover crops to improve soil organic matter and aeration.',
      'Generates a printable 3-year seasonal rotation calendar.'
    ],
    farmerBenefits: [
      'Naturally replenishes soil Nitrogen through legume nodulation.',
      'Breaks pest and fungal disease reproduction cycles.',
      'Reduces chemical fertilizer costs over multiple years.'
    ],
    quizQuestion: 'Why is planting legumes (like Chickpeas or Beans) in a rotation beneficial?',
    quizOptions: [
      'They make soil salty',
      'They naturally fix atmospheric Nitrogen into the soil',
      'They eliminate the need for sunlight',
      'They stop rainfall'
    ],
    correctOptionIndex: 1,
    quizExplanation: 'Correct! Legumes have symbiotic Rhizobium root nodules that fix free atmospheric Nitrogen into soil organic forms.'
  },
  {
    id: 'weather',
    number: 12,
    icon: '🌦️',
    title: 'Weather Predictive Alerts',
    badgeTag: 'Microclimate Forecast',
    effectivenessRating: 'High-Precision Alerts',
    impactMetric: 'Frost & Storm Risk Mitigation',
    shortSummary: 'Provides microclimate temperature, humidity, rainfall probability, wind speed, and early frost warnings.',
    whyUsed: 'Unpredicted frost or heavy downpours immediately after spraying fertilizer causes washing loss and severe crop damage.',
    howItWorks: [
      'Integrates microclimate forecast feeds and localized dew-point calculations.',
      'Displays frost risk indices and wind speed thresholds.',
      'Recommends optimal spray windows when wind is calm (<12 km/h).'
    ],
    farmerBenefits: [
      'Warns of impending frost so farmers can smoke or lightly irrigate fields.',
      'Prevents spraying expensive chemicals right before heavy rainfall.',
      'Protects flowering crops from severe wind damage.'
    ],
    quizQuestion: 'When is the best time to apply foliar spray based on weather insights?',
    quizOptions: [
      'During high winds (>30 km/h)',
      'When rainfall is 100% expected in 5 minutes',
      'When wind is calm (<12 km/h) and no heavy rain is forecast',
      'In the middle of a thunderstorm'
    ],
    correctOptionIndex: 2,
    quizExplanation: 'Correct! Foliar spraying should occur when wind speed is low (<12 km/h) and no rain is expected for 6 hours.'
  },
  {
    id: 'diagnostics',
    number: 13,
    icon: '🏥',
    title: 'Plant Health Diagnostics',
    badgeTag: 'AI Vision Leaf Scanner',
    effectivenessRating: 'Instant Visual Analysis',
    impactMetric: 'Early Pathogen & Pest Identification',
    shortSummary: 'Upload or capture a photo of a diseased crop leaf for Gemini AI vision analysis to detect pests, fungal spots, and nutrient deficiencies.',
    whyUsed: 'Early detection of leaf blight, armyworms, or rust prevents farm-wide outbreaks. Identifying symptoms visually requires expert agronomist knowledge.',
    howItWorks: [
      'Enhances image sharpness and contrast to expose micro-lesions, egg clutches, or mycelia.',
      'Gemini Vision analyzes the leaf pattern against thousands of plant disease cases.',
      'Outputs primary diagnosis, visual evidence, confidence level, and step-by-step organic/chemical treatments.'
    ],
    farmerBenefits: [
      'Acts as a 24/7 senior plant pathologist in your pocket.',
      'Gives exact organic (e.g. Neem Oil) and chemical (e.g. Mancozeb) spray doses.',
      'Prevents misdiagnosing fungal leaf spots as simple water shortages.'
    ],
    quizQuestion: 'How does the Plant Health Diagnostics tool analyze diseased crops?',
    quizOptions: [
      'By listening to plant sounds',
      'By analyzing leaf photos using Gemini AI vision to detect microscopic symptoms and lesions',
      'By measuring leaf weight',
      'By checking soil color only'
    ],
    correctOptionIndex: 1,
    quizExplanation: 'Correct! It uses Gemini AI vision model to inspect leaf photographs for fungal lesions, chlorosis, and pest damage.'
  }
];

export const CroperXCourseTutorial: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<TutorialModule>(TUTORIAL_MODULES[0]);
  const [completedQuizzes, setCompletedQuizzes] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem('croperx_tutorial_quiz_progress') || '{}');
    } catch {
      return {};
    }
  });

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswerResult, setShowAnswerResult] = useState<boolean>(false);
  const [isPlayingSpeech, setIsPlayingSpeech] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const handleSelectModule = (mod: TutorialModule) => {
    setSelectedModule(mod);
    setSelectedAnswer(completedQuizzes[mod.id] ?? null);
    setShowAnswerResult(completedQuizzes[mod.id] !== undefined);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingSpeech(false);
    }
  };

  const handleQuizSubmit = (index: number) => {
    setSelectedAnswer(index);
    setShowAnswerResult(true);
    const updated = { ...completedQuizzes, [selectedModule.id]: index };
    setCompletedQuizzes(updated);
    localStorage.setItem('croperx_tutorial_quiz_progress', JSON.stringify(updated));
  };

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingSpeech) {
      window.speechSynthesis.cancel();
      setIsPlayingSpeech(false);
      return;
    }

    const textToRead = `${selectedModule.title}. ${selectedModule.shortSummary}. Why it is used: ${selectedModule.whyUsed}. Key farmer benefits: ${selectedModule.farmerBenefits.join('. ')}.`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.onend = () => setIsPlayingSpeech(false);
    utterance.onerror = () => setIsPlayingSpeech(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlayingSpeech(true);
  };

  const completedCount = Object.keys(completedQuizzes).length;
  const progressPercent = Math.round((completedCount / TUTORIAL_MODULES.length) * 100);

  const filteredModules = TUTORIAL_MODULES.filter(m => 
    m.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    m.shortSummary.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-[#c8e6c9] shadow-sm space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#c8e6c9] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#4CAF50]">
            <BookOpen className="w-5 h-5 text-[#4CAF50]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2e7d32]">
              Farmer Learning Course & Mastery Guide
            </span>
          </div>
          <h3 className="font-serif text-2xl lg:text-3xl font-bold text-[#1b2e1b]">
            Learn CroperX System: Complete Feature Course
          </h3>
          <p className="text-xs text-[#667e66]">
            Deep step-by-step interactive walkthrough explaining all 13 application features, why they are used, how they work, and their effectiveness.
          </p>
        </div>

        {/* Progress Bar & Audio TTS */}
        <div className="flex items-center gap-3">
          <div className="bg-[#f8fcf8] p-3 rounded-2xl border border-[#c8e6c9] space-y-1 text-right">
            <div className="text-[10px] font-bold text-[#2e7d32] uppercase">Course Mastery</div>
            <div className="flex items-center gap-2">
              <div className="w-28 bg-gray-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#4CAF50] h-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-black font-mono text-[#1b2e1b]">{completedCount}/13 ({progressPercent}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Module Grid List on Left, Deep Module Content on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 13 Module Navigation List */}
        <div className="lg:col-span-4 space-y-3">
          
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2e7d32]">
              Course Modules (13 Features)
            </h4>

            {/* Quick Search */}
            <div className="relative w-32">
              <Search className="w-3 h-3 text-gray-400 absolute left-2 top-2.5" />
              <input
                type="text"
                placeholder="Find feature..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-7 pr-2 py-1 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl text-[11px] outline-none"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {filteredModules.map((mod) => {
              const isSelected = selectedModule.id === mod.id;
              const isPassed = completedQuizzes[mod.id] !== undefined;

              return (
                <button
                  key={mod.id}
                  onClick={() => handleSelectModule(mod)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#1b2e1b] text-white border-[#4CAF50] shadow-md ring-2 ring-[#4CAF50]/40'
                      : 'bg-[#f8fcf8] text-[#1b2e1b] border-[#c8e6c9] hover:border-[#4CAF50]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{mod.icon}</span>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>{mod.number}. {mod.title}</span>
                      </div>
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-emerald-300' : 'text-[#667e66]'}`}>
                        {mod.effectivenessRating}
                      </span>
                    </div>
                  </div>

                  {isPassed && (
                    <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-[#4CAF50]'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Walkthrough Card for Selected Module */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Module Banner Header */}
          <div className="p-6 bg-gradient-to-r from-[#1b2e1b] via-[#285329] to-[#1b2e1b] text-white rounded-3xl border-2 border-[#4CAF50]/40 shadow-lg space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl p-3 bg-black/30 rounded-2xl border border-white/10">
                  {selectedModule.icon}
                </span>
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-300 bg-black/40 px-2.5 py-0.5 rounded-full uppercase border border-white/10">
                    Module {selectedModule.number} • {selectedModule.badgeTag}
                  </span>
                  <h4 className="font-serif text-2xl font-bold text-white mt-1">
                    {selectedModule.title}
                  </h4>
                </div>
              </div>

              {/* Audio Speech Button */}
              <button
                onClick={handleToggleSpeech}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 border ${
                  isPlayingSpeech 
                    ? 'bg-amber-400 text-[#1b2e1b] border-amber-300 animate-pulse'
                    : 'bg-black/40 text-emerald-300 border-white/20 hover:bg-black/60'
                }`}
              >
                {isPlayingSpeech ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isPlayingSpeech ? 'Stop Lesson Audio' : '🔊 Listen to Lesson'}</span>
              </button>
            </div>

            {/* Impact Metric Badge */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="px-3 py-1 bg-amber-400 text-[#1b2e1b] font-black rounded-xl">
                Effectiveness: {selectedModule.effectivenessRating}
              </span>
              <span className="px-3 py-1 bg-white/10 text-emerald-200 rounded-xl font-mono border border-white/10">
                Key Impact: {selectedModule.impactMetric}
              </span>
            </div>

            <p className="text-xs text-emerald-100/90 leading-relaxed font-serif pt-1">
              {selectedModule.shortSummary}
            </p>
          </div>

          {/* Deep Explanation Section */}
          <div className="space-y-5 text-xs text-[#1b2e1b]">
            
            {/* 1. Why It Is Used */}
            <div className="p-5 bg-[#f8fcf8] rounded-3xl border border-[#c8e6c9] space-y-2">
              <h5 className="font-bold uppercase text-[#2e7d32] text-xs flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Why It Is Used Here in CroperX System
              </h5>
              <p className="text-xs text-[#1b2e1b] leading-relaxed font-serif">
                {selectedModule.whyUsed}
              </p>
            </div>

            {/* 2. How It Works Step-By-Step */}
            <div className="p-5 bg-white rounded-3xl border border-[#c8e6c9] space-y-3">
              <h5 className="font-bold uppercase text-[#2e7d32] text-xs flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#4CAF50]" />
                How It Works (Step-by-Step Practical Workflow)
              </h5>
              <div className="space-y-2">
                {selectedModule.howItWorks.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-[#f8fcf8] rounded-2xl border border-[#c8e6c9]">
                    <span className="w-6 h-6 rounded-full bg-[#1b2e1b] text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-[#1b2e1b] font-serif leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Primary Farmer Benefits */}
            <div className="p-5 bg-[#f8fcf8] rounded-3xl border border-[#c8e6c9] space-y-3">
              <h5 className="font-bold uppercase text-[#2e7d32] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
                Direct Benefits to the Farmer
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedModule.farmerBenefits.map((benefit, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-2xl border border-[#c8e6c9] space-y-1">
                    <span className="text-[10px] text-[#4CAF50] font-black">✔ Key Advantage</span>
                    <p className="text-[11px] text-[#1b2e1b] font-serif leading-snug">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Interactive Knowledge Check / Quiz */}
            <div className="p-6 bg-[#1b2e1b] text-white rounded-3xl border border-[#2e7d32] space-y-4">
              <div className="flex items-center justify-between border-b border-[#2e7d32] pb-3">
                <h5 className="font-serif text-base font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-400" />
                  Quick Knowledge Check: Test Your Understanding
                </h5>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full font-mono">
                  Module {selectedModule.number} Quiz
                </span>
              </div>

              <p className="text-xs text-emerald-200 font-bold">
                {selectedModule.quizQuestion}
              </p>

              <div className="space-y-2">
                {selectedModule.quizOptions.map((opt, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === selectedModule.correctOptionIndex;

                  let optStyle = 'bg-[#122012] border-[#2e7d32] text-white hover:bg-[#2e7d32]/50';
                  if (showAnswerResult) {
                    if (isCorrect) {
                      optStyle = 'bg-[#4CAF50] text-[#1b2e1b] font-bold border-white';
                    } else if (isSelected && !isCorrect) {
                      optStyle = 'bg-rose-900/80 text-white border-rose-500';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuizSubmit(idx)}
                      className={`w-full text-left p-3 rounded-2xl border text-xs transition-all flex items-center justify-between ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {showAnswerResult && isCorrect && <CheckCircle2 className="w-4 h-4 text-[#1b2e1b]" />}
                    </button>
                  );
                })}
              </div>

              {showAnswerResult && (
                <div className="p-4 bg-[#122012] rounded-2xl border border-[#2e7d32] text-xs text-emerald-200 space-y-1 animate-fadeIn">
                  <span className="font-bold text-amber-300 block">💡 Explanation:</span>
                  <p>{selectedModule.quizExplanation}</p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

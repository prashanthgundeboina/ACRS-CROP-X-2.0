import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getSupabase, supabaseRecordAuditLog } from './supabase.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'adviser_applications_db.json');
const ASSESSMENT_ATTEMPTS_FILE = path.join(DATA_DIR, 'adviser_assessment_attempts_db.json');
const ACTIVATION_TOKENS_FILE = path.join(DATA_DIR, 'adviser_activation_tokens_db.json');
const COURSE_PROGRESS_FILE = path.join(DATA_DIR, 'adviser_course_progress_db.json');
const MASTERY_ATTEMPTS_FILE = path.join(DATA_DIR, 'adviser_mastery_attempts_db.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    ensureDataDir();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`[Adviser Store] Error reading ${path.basename(filePath)}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filePath: string, data: T) {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[Adviser Store] Error writing ${path.basename(filePath)}:`, err);
  }
}

// -------------------------------------------------------------
// 50 AUTHORITATIVE ASSESSMENT QUESTIONS (SERVER SIDE ONLY)
// -------------------------------------------------------------
export interface AuthoritativeAssessmentQuestion {
  id: number;
  category: 'agriculture' | 'soil' | 'crop_health' | 'climate' | 'agronomy' | 'croperx';
  categoryLabel: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
}

export const ASSESSMENT_QUESTIONS: AuthoritativeAssessmentQuestion[] = [
  // 1. Agriculture: Crop Identification & Lifecycle (1-8)
  {
    id: 1,
    category: 'agriculture',
    categoryLabel: 'Crop Identification & Lifecycle',
    question: 'In rice (Oryza sativa) phenology, which stage has the highest sensitivity to moisture stress and critical water demand?',
    options: ['Panicle initiation to flowering', 'Initial nursery emergence', 'Post-ripening drying phase', 'Post-harvest stubble decomposition'],
    correctOptionIndex: 0,
  },
  {
    id: 2,
    category: 'agriculture',
    categoryLabel: 'Crop Identification & Lifecycle',
    question: 'Which visual leaf characteristic distinguishes Kharif Maize from Sorghum in early vegetative stages?',
    options: ['Maize has a distinct ligule and auricle with wavy leaf margins', 'Maize produces trifoliate serrated leaves', 'Maize exhibits purple square stems without nodes', 'Maize has taproots with woody tendrils'],
    correctOptionIndex: 0,
  },
  {
    id: 3,
    category: 'agriculture',
    categoryLabel: 'Crop Identification & Lifecycle',
    question: 'What is the primary physiological marker indicating physiological maturity in Wheat (Triticum aestivum)?',
    options: ['Loss of green color in glumes and peduncle (black layer/dull gold canopy)', 'Emergence of first flag leaf', 'Tillering node multiplication', 'Milky dough grain consistency'],
    correctOptionIndex: 0,
  },
  {
    id: 4,
    category: 'agriculture',
    categoryLabel: 'Crop Identification & Lifecycle',
    question: 'Chickpea (Cicer arietinum) belongs to which agronomic classification and root nodulation group?',
    options: ['Rabi pulse with symbiotic Rhizobium nitrogen fixation', 'Kharif oilseed with mycorrhizal spore clusters', 'Summer cereal with taproot silicon secretion', 'Perennial fodder with non-fixing adventitious roots'],
    correctOptionIndex: 0,
  },
  {
    id: 5,
    category: 'agriculture',
    categoryLabel: 'Crop Identification & Lifecycle',
    question: 'In Cotton cultivation, "squaring" refers to which physiological developmental milestone?',
    options: ['Formation of the early reproductive flower bud before anthesis', 'Square canopy trimming after rainfall', 'Boll bursting at harvest', 'Emergence of cotyledon leaves'],
    correctOptionIndex: 0,
  },
  {
    id: 6,
    category: 'agriculture',
    categoryLabel: 'Crop Identification & Lifecycle',
    question: 'Which crop rotation sequence provides optimal soil biological regeneration following deep-rooted Kharif Cotton?',
    options: ['Shallow-rooted pulse/legume (Chickpea or Lentil)', 'Repetitive continuous Cotton monoculture', 'Deep-rooted perennial Eucalyptus', 'High water-demand sugarcane without fallow'],
    correctOptionIndex: 0,
  },
  {
    id: 7,
    category: 'agriculture',
    categoryLabel: 'Crop Identification & Lifecycle',
    question: 'What is the standard base temperature (Tb) utilized in Growing Degree Days (GDD) computation for warm-season Maize?',
    options: ['10°C (50°F)', '0°C (32°F)', '22°C (72°F)', '4°C (39°F)'],
    correctOptionIndex: 0,
  },
  {
    id: 8,
    category: 'agriculture',
    categoryLabel: 'Crop Identification & Lifecycle',
    question: 'Which agronomic method maximizes pulse yield through non-destructive canopy solar interception?',
    options: ['Intercropping with optimal row geometry and canopy spatial stratification', 'Broadcast over-seeding with 3x seed density', 'Excessive nitrogen flooding during vegetative growth', 'Continuous shade netting at 90% opacity'],
    correctOptionIndex: 0,
  },

  // 2. Soil: Soil Health, pH & NPK Dynamics (9-16)
  {
    id: 9,
    category: 'soil',
    categoryLabel: 'Soil Health & Nutrients',
    question: 'At an alkaline soil pH above 8.2, which essential micronutrient suffers severe chemical immobilization and plant bioavailability deficit?',
    options: ['Phosphorus, Iron (Fe), and Zinc (Zn)', 'Molybdenum (Mo)', 'Sodium (Na)', 'Chloride (Cl)'],
    correctOptionIndex: 0,
  },
  {
    id: 10,
    category: 'soil',
    categoryLabel: 'Soil Health & Nutrients',
    question: 'What does an electrical conductivity (EC) reading exceeding 4.0 dS/m in saturated soil extract indicate?',
    options: ['Saline soil conditions that induce osmotic root stress and water uptake inhibition', 'Highly acidic soil requiring rapid limestone dressing', 'Pure organic humus with zero mineral salts', 'Excessive biological nitrogen fixation capacity'],
    correctOptionIndex: 0,
  },
  {
    id: 11,
    category: 'soil',
    categoryLabel: 'Soil Health & Nutrients',
    question: 'What is the physiological role of Potassium (K) in crop stress resilience?',
    options: ['Regulating stomatal aperture, osmotic potential, and enzyme activation against drought/cold', 'Forming chlorophyll porphyrin ring core', 'Serving as the primary constituent of DNA nucleotides', 'Directly synthesizing structural lignin in root caps'],
    correctOptionIndex: 0,
  },
  {
    id: 12,
    category: 'soil',
    categoryLabel: 'Soil Health & Nutrients',
    question: 'When soil organic carbon (SOC) increases from 0.4% to 1.0%, what primary agronomic benefit occurs?',
    options: ['Substantially enhanced cation exchange capacity (CEC) and soil water holding volume', 'Immediate acidification of soil pH below 4.0', 'Total elimination of all soil microbes', 'Rapid loss of soil aggregate stability'],
    correctOptionIndex: 0,
  },
  {
    id: 13,
    category: 'soil',
    categoryLabel: 'Soil Health & Nutrients',
    question: 'Interveinal chlorosis appearing exclusively on older, basal leaves is a textbook deficiency symptom of:',
    options: ['Magnesium (Mg) deficiency due to mobile nutrient translocation to young tissue', 'Iron (Fe) deficiency', 'Boron (B) toxicity', 'Calcium (Ca) immobility'],
    correctOptionIndex: 0,
  },
  {
    id: 14,
    category: 'soil',
    categoryLabel: 'Soil Health & Nutrients',
    question: 'What is the recommended soil amendment to remediate strongly sodic soils with Exchangeable Sodium Percentage (ESP) > 15%?',
    options: ['Agricultural Gypsum (Calcium Sulphate - CaSO4·2H2O) combined with deep leaching', 'Quicklime (CaO) without drainage', 'Elemental Sodium Nitrate', 'Concentrated Muriate of Potash (MOP)'],
    correctOptionIndex: 0,
  },
  {
    id: 15,
    category: 'soil',
    categoryLabel: 'Soil Health & Nutrients',
    question: 'Why should urea never be surface-broadcast on warm, dry, high-pH soil without immediate incorporation or irrigation?',
    options: ['Volatilization loss of nitrogen as gaseous ammonia (NH3) can exceed 30-50%', 'Urea immediately converts to solid rock phosphate', 'Urea causes instant ground frost crystallization', 'Urea destroys the physical texture of sand grains'],
    correctOptionIndex: 0,
  },
  {
    id: 16,
    category: 'soil',
    categoryLabel: 'Soil Health & Nutrients',
    question: 'What is the optimal soil moisture tension range for field capacity in deep alluvial loam soils?',
    options: ['-10 to -33 kPa (-0.1 to -0.33 bar)', '-1500 kPa (Permanent Wilting Point)', '0 kPa (Complete Waterlogged Saturation)', '-5000 kPa (Oven Dry Soil)'],
    correctOptionIndex: 0,
  },

  // 3. Crop Health: Pest Identification & Integrated Pest Management (17-25)
  {
    id: 17,
    category: 'crop_health',
    categoryLabel: 'Pest & Disease Diagnostics',
    question: 'What is the distinctive damage symptom of Yellow Stem Borer (Scirpophaga incertulas) in vegetative stage paddy?',
    options: ['"Dead heart" (central tiller drying) in vegetative and "white head" (empty panicles) in reproductive phase', 'Silvering on lower leaf underside', 'Circular brown shot-holes on leaf margin', 'Powdery white fungal bloom on culms'],
    correctOptionIndex: 0,
  },
  {
    id: 18,
    category: 'crop_health',
    categoryLabel: 'Pest & Disease Diagnostics',
    question: 'Which vector transmits the devastating Tomato Yellow Leaf Curl Virus (TYLCV) and Cotton Leaf Curl Virus (CLCuV)?',
    options: ['Whitefly (Bemisia tabaci)', 'Brown Planthopper (Nilaparvata lugens)', 'Red Spider Mite (Tetranychus urticae)', 'Root Knot Nematode (Meloidogyne incognita)'],
    correctOptionIndex: 0,
  },
  {
    id: 19,
    category: 'crop_health',
    categoryLabel: 'Pest & Disease Diagnostics',
    question: 'In Integrated Pest Management (IPM), what is the definition of the Economic Injury Level (EIL)?',
    options: ['The lowest pest population density that will cause economic damage exceeding control cost', 'The point where 100% of all insects are eradicated from the field', 'The baseline calendar spraying date recommended by manufacturers', 'The threshold where natural predators outnumber pests'],
    correctOptionIndex: 0,
  },
  {
    id: 20,
    category: 'crop_health',
    categoryLabel: 'Pest & Disease Diagnostics',
    question: 'Which biological biocontrol agent is highly effective for controlling soil-borne fungal pathogens like Fusarium and Rhizoctonia?',
    options: ['Trichoderma viride / Trichoderma harzianum bio-fungicide', 'Broad-spectrum organophosphate spray', 'Synthetic pyrethroid aerosol', 'Copper sulfate heavy drenching at 20% concentration'],
    correctOptionIndex: 0,
  },
  {
    id: 21,
    category: 'crop_health',
    categoryLabel: 'Pest & Disease Diagnostics',
    question: 'Spodoptera frugiperda (Fall Armyworm) in maize whorls is best managed at early instar stage using which targeted biocontrol?',
    options: ['Bacillus thuringiensis (Bt) kurstaki formulation or Metarhizium anisopliae bio-insecticide', 'Excessive flood irrigation with salt water', 'Sulfur dust applied to open tassels', 'Defoliation of all upper canopy leaves'],
    correctOptionIndex: 0,
  },
  {
    id: 22,
    category: 'crop_health',
    categoryLabel: 'Pest & Disease Diagnostics',
    question: 'What is the characteristic visual symptom of Late Blight (Phytophthora infestans) on potato foliage under cool, humid weather?',
    options: ['Water-soaked dark brown to purplish lesions with white mildew on leaf undersides and rapid blighting', 'Bright yellow mosaic marbling without tissue necrosis', 'Tiny white chlorotic pinpricks with no water-soaking', 'Uniform leaf curling without discoloration'],
    correctOptionIndex: 0,
  },
  {
    id: 23,
    category: 'crop_health',
    categoryLabel: 'Pest & Disease Diagnostics',
    question: 'Which practice is considered fundamental in insecticide resistance management (IRM)?',
    options: ['Rotating insecticide modes of action (MoA classes) rather than repeated identical chemistries', 'Doubling pesticide dosage every season', 'Tank-mixing five unverified chemicals at random', 'Spraying weekly regardless of pest presence'],
    correctOptionIndex: 0,
  },
  {
    id: 24,
    category: 'crop_health',
    categoryLabel: 'Pest & Disease Diagnostics',
    question: 'What is the diagnostic sign of Bacterial Leaf Blight (Xanthomonas oryzae pv. oryzae) on rice leaves?',
    options: ['Wavy translucent margins turning grayish-white with microscopic bacterial ooze droplets', 'Spindle-shaped spots with dark brown centers and yellow halos', 'Concentric dark rings resembling a target board', 'Sooty black mold growth along vascular veins'],
    correctOptionIndex: 0,
  },
  {
    id: 25,
    category: 'crop_health',
    categoryLabel: 'Pest & Disease Diagnostics',
    question: 'When handling and recommending chemical crop protection formulations, what is the mandatory safety directive for an Adviser?',
    options: ['Advise strict adherence to approved label dose, pre-harvest interval (PHI), and Personal Protective Equipment (PPE)', 'Advise mixing with household detergents without manufacturer validation', 'Recommend off-label applications for unapproved food crops', 'Ignore withholding periods if market prices are surging'],
    correctOptionIndex: 0,
  },

  // 4. Climate: Weather Effects, Heat Stress & Risk Mitigation (26-33)
  {
    id: 26,
    category: 'climate',
    categoryLabel: 'Climate & Weather Management',
    question: 'During wheat anthesis (flowering), exposure to temperatures above which critical threshold causes terminal heat floret sterility?',
    options: ['30°C - 32°C', '18°C - 20°C', '45°C - 48°C', '24°C - 26°C'],
    correctOptionIndex: 0,
  },
  {
    id: 27,
    category: 'climate',
    categoryLabel: 'Climate & Weather Management',
    question: 'What agronomic intervention effectively buffers sensitive horticultural crops against unseasonal radiation and heat waves?',
    options: ['Foliar anti-transpirant/kaolin spray, micro-sprinklers, and organic straw mulching', 'Heavy unshaded pruning of all green leaves', 'Applying concentrated Nitrogen top-dressing at noon', 'Complete drainage of root zones to dry the soil'],
    correctOptionIndex: 0,
  },
  {
    id: 28,
    category: 'climate',
    categoryLabel: 'Climate & Weather Management',
    question: 'How does atmospheric relative humidity (RH) exceeding 85% combined with 25°C temperature affect foliar fungal spore germination?',
    options: ['Provides the mandatory leaf wetness window for rapid fungal spore penetration and epidemic outbreaks', 'Completely desensitizes fungal spore germination', 'Cools plant leaves to stop pathogen reproduction', 'Sterilizes atmospheric fungal inoculum'],
    correctOptionIndex: 0,
  },
  {
    id: 29,
    category: 'climate',
    categoryLabel: 'Climate & Weather Management',
    question: 'Which weather condition presents the highest risk for sudden radiative ground frost in north-western plains during winter?',
    options: ['Clear cloudless night skies, calm wind (< 2 km/h), and low dew point temperatures', 'Overcast skies with strong convective wind and light drizzle', 'Warm humid southeasterly monsoon gusts', 'Heavy afternoon thunderstorm cloud cover'],
    correctOptionIndex: 0,
  },
  {
    id: 30,
    category: 'climate',
    categoryLabel: 'Climate & Weather Management',
    question: 'What is the principle of Vapor Pressure Deficit (VPD) in high-tech climate control and greenhouse management?',
    options: ['The difference between saturated vapor pressure inside leaf stomata and ambient air vapor pressure', 'Total barometric air pressure measured at sea level', 'Speed of vertical convective cloud development', 'The percentage of dissolved oxygen in soil water'],
    correctOptionIndex: 0,
  },
  {
    id: 31,
    category: 'climate',
    categoryLabel: 'Climate & Weather Management',
    question: 'In dryland rainfed agriculture, what is the key purpose of creating broadbed and furrow (BBF) or conservation furrows?',
    options: ['In-situ moisture conservation, surface runoff reduction, and safe drainage of excess torrential storm runoff', 'Permanent field flood basin creation', 'Accelerating high-speed wind erosion', 'Eliminating root aeration in the rhizosphere'],
    correctOptionIndex: 0,
  },
  {
    id: 32,
    category: 'climate',
    categoryLabel: 'Climate & Weather Management',
    question: 'What is the direct consequence of waterlogging in the root zone for more than 48 hours in Maize or Pulses?',
    options: ['Hypoxia/anoxia causing root ATP collapse, ethylene accumulation, and chlorotic wilting', 'Spontaneous increase in mycorrhizal colonization', 'Massive surge in root phosphorus absorption', 'Enhanced stomatal opening for transpiration'],
    correctOptionIndex: 0,
  },
  {
    id: 33,
    category: 'climate',
    categoryLabel: 'Climate & Weather Management',
    question: 'How should an Adviser interpret a 7-day forecast predicting 80mm rainfall when scheduling irrigation?',
    options: ['Postpone scheduled irrigation and account for expected rainfall credit to save water and energy', 'Irrigate at double capacity immediately before the storm', 'Advise cutting down drainage bunds', 'Ignore weather forecasting as irrelevant to irrigation'],
    correctOptionIndex: 0,
  },

  // 5. Agronomy: Crop Planning, Economics & Sustainable Practice (34-40)
  {
    id: 34,
    category: 'agronomy',
    categoryLabel: 'Agronomy & Farm Management',
    question: 'What is the formula used to calculate Crop Water Requirement (ETc) according to FAO-56 standards?',
    options: ['ETc = ETo × Kc (Reference Evapotranspiration × Crop Coefficient)', 'ETc = Total Rainfall ÷ Soil pH', 'ETc = NPK Ratio × Soil Depth', 'ETc = Seed Rate × Leaf Area Index'],
    correctOptionIndex: 0,
  },
  {
    id: 35,
    category: 'agronomy',
    categoryLabel: 'Agronomy & Farm Management',
    question: 'What is the definition of Land Equivalent Ratio (LER) in intercropping systems?',
    options: ['The relative land area required under sole cropping to produce the yields achieved in intercropping', 'The monetary cost of leasing agricultural land per acre', 'The depth of topsoil divided by total farm acreage', 'The ratio of irrigated land to fallow land'],
    correctOptionIndex: 0,
  },
  {
    id: 36,
    category: 'agronomy',
    categoryLabel: 'Agronomy & Farm Management',
    question: 'What are the three core principles of Conservation Agriculture (CA)?',
    options: ['Minimal mechanical soil disturbance (zero-till), permanent soil organic cover, and diversified crop rotations', 'Deep tractor inversion plowing, continuous monoculture, and clean bare soil fallow', 'Heavy chemical fumigation, burning crop stubble, and uniform flood irrigation', 'High-density synthetic fertilization, zero weeding, and no soil testing'],
    correctOptionIndex: 0,
  },
  {
    id: 37,
    category: 'agronomy',
    categoryLabel: 'Agronomy & Farm Management',
    question: 'When computing farm Gross Margin for a Kharif crop, what is the correct calculation?',
    options: ['Gross Margin = Gross Farm Revenue minus Total Variable Costs (seeds, fert, labor, fuel)', 'Gross Margin = Total Land Value minus Bank Loan Principal', 'Gross Margin = Subsidy Payment plus Machinery Depreciation', 'Gross Margin = Market Price multiplied by Total Rainfall'],
    correctOptionIndex: 0,
  },
  {
    id: 38,
    category: 'agronomy',
    categoryLabel: 'Agronomy & Farm Management',
    question: 'What is the agronomic benefit of applying biochar or green manuring (e.g. Sesbania aculeata / Dhaincha) before paddy transplanting?',
    options: ['Increases soil organic matter, improves nutrient retention, and adds biologically fixed nitrogen', 'Increases soil bulk density and causes soil compaction', 'Sterilizes earthworms from the soil matrix', 'Permanently acidifies the soil below pH 3.5'],
    correctOptionIndex: 0,
  },
  {
    id: 39,
    category: 'agronomy',
    categoryLabel: 'Agronomy & Farm Management',
    question: 'What constitutes a balanced 4R Nutrient Stewardship framework?',
    options: ['Right Source, Right Rate, Right Time, Right Place', 'Rapid Application, Random Dosage, Repeated Schedule, Rough Distribution', 'Rare Testing, Reduced Fertilizer, Rice-Only, River-Source', 'Root Inoculation, Residual Nitrogen, Rainfed Placement, Rate Reduction'],
    correctOptionIndex: 0,
  },
  {
    id: 40,
    category: 'agronomy',
    categoryLabel: 'Agronomy & Farm Management',
    question: 'Why is seed germination percentage testing critical prior to field sowing?',
    options: ['To accurately calibrate field seed rate per hectare and prevent poor plant stand density', 'To determine the exact color of mature grains', 'To identify if the seed contains heavy metals', 'To avoid using tractor fuel during planting'],
    correctOptionIndex: 0,
  },

  // 6. CroperX System: Architecture, AI Agronomy, Privacy & Ethics (41-50)
  {
    id: 41,
    category: 'croperx',
    categoryLabel: 'CroperX System Architecture',
    question: 'How does CroperX Multi-Model AI Orchestration maintain consensus across Gemini, Groq, and DeepSeek?',
    options: ['Groq delivers ultra-fast initial screening, Gemini validates multimodal imagery, and DeepSeek verifies scientific agronomy rules', 'A single model generates answers without secondary verification', 'AI models vote randomly on pre-written canned responses', 'The server forwards queries directly to an unverified public chat API'],
    correctOptionIndex: 0,
  },
  {
    id: 42,
    category: 'croperx',
    categoryLabel: 'CroperX System Architecture',
    question: 'In CroperX Crop Prediction Engine, how many environmental and soil parameters are evaluated simultaneously?',
    options: ['22 distinct agronomic, soil, climate, and management parameters', 'Only 3 basic N-P-K parameters', '8 simple weather variables only', '50 hypothetical simulated variables'],
    correctOptionIndex: 0,
  },
  {
    id: 43,
    category: 'croperx',
    categoryLabel: 'CroperX System Architecture',
    question: 'What is the primary role of an Adviser when reviewing an AI Plant Pathology diagnostic report?',
    options: ['Validate pathogen identification against visual evidence, evaluate field context, and provide verified advisory', 'Accept AI output unconditionally without inspection', 'Delete the diagnostic record from the database', 'Charge the farmer an unauthorized surcharge'],
    correctOptionIndex: 0,
  },
  {
    id: 44,
    category: 'croperx',
    categoryLabel: 'CroperX System Architecture',
    question: 'What protocol governs live 2-way audio/video consultations between Farmer and Adviser on CroperX?',
    options: ['Secure WebRTC peer connection with bidirectional ICE candidate exchange and low-latency audio/video tracks', 'Unencrypted RTMP public live streaming', 'Static JPEG screen refresh every 10 seconds', 'Third-party telemarketing conference call bridges'],
    correctOptionIndex: 0,
  },
  {
    id: 45,
    category: 'croperx',
    categoryLabel: 'CroperX System Architecture',
    question: 'How does CroperX Smartphone Field Scout QR pairing function during field inspections?',
    options: ['Pairing a smartphone camera via secure token to stream live handheld field video directly to the workstation', 'Scanning a supermarket barcode to purchase seeds', 'Downloading mobile games onto the phone', 'Exporting farmer contacts to marketing agencies'],
    correctOptionIndex: 0,
  },
  {
    id: 46,
    category: 'croperx',
    categoryLabel: 'CroperX System Architecture',
    question: 'When a Farmer triggers an Emergency SOS Alert on CroperX, what is the system and Adviser response protocol?',
    options: ['Instant high-priority banner broadcast, telemetry dispatch, and immediate dedicated agronomist triage', 'Automatic queue deprioritization until the next business day', 'Sending an automated advertisement for commercial machinery', 'Silently logging the alert with zero visual alerts'],
    correctOptionIndex: 0,
  },
  {
    id: 47,
    category: 'croperx',
    categoryLabel: 'CroperX System Architecture',
    question: 'What privacy standard governs Farmer telemetry, farm GPS coordinates, and historical memory on CroperX?',
    options: ['Strict tenant isolation, encrypted transmission, and role-based access control (RBAC)', 'Open public indexation for search engines', 'Unrestricted commercial data selling to advertisers', 'Storage in plaintext unauthenticated files'],
    correctOptionIndex: 0,
  },
  {
    id: 48,
    category: 'croperx',
    categoryLabel: 'CroperX System Architecture',
    question: 'Which regional languages are natively supported in CroperX multilingual voice & localized UI architecture?',
    options: ['English, Hindi, Punjabi, Telugu, Tamil, Marathi, Bengali, and Kannada', 'English and Latin only', 'English and French only', 'Spanish and Portuguese only'],
    correctOptionIndex: 0,
  },
  {
    id: 49,
    category: 'croperx',
    categoryLabel: 'CroperX System Architecture',
    question: 'What is the ethical mandate regarding "hallucinated" or unverified chemical prescriptions by an Adviser?',
    options: ['Advisers must NEVER fabricate advice or recommend unverified toxic chemicals, and must rely strictly on validated agronomical science', 'Advisers may invent pesticide names if confident', 'Advisers should guess dosages when uncertain', 'Advisers are encouraged to promote off-label unverified mixtures'],
    correctOptionIndex: 0,
  },
  {
    id: 50,
    category: 'croperx',
    categoryLabel: 'CroperX System Architecture',
    question: 'What are the strict prerequisites required before an Adviser receives full unlocked access to CroperX Adviser Dashboard?',
    options: ['OTP verification → 50-Q assessment (≥25/50) → Admin verification & approval → Password creation → 12-Module course completion → Mastery exam pass', 'Instant unverified self-registration with a single click', 'Paying a registration fee without any credential check', 'Only entering an email address without identity confirmation'],
    correctOptionIndex: 0,
  },
];

// -------------------------------------------------------------
// 12 LEARNING COURSE MODULES CONTENT
// -------------------------------------------------------------
export interface AuthoritativeCourseModule {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  badge: string;
  durationMinutes: number;
  icon: string;
  overview: string;
  coreConcepts: string[];
  operationalProtocols: string[];
  farmerImpactNotes: string[];
  quizQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export const COURSE_MODULES: AuthoritativeCourseModule[] = [
  {
    id: 1,
    title: 'Welcome to CroperX',
    subtitle: 'Platform Architecture & Farmer-First Philosophy',
    category: 'Orientation',
    badge: 'Foundation',
    durationMinutes: 12,
    icon: '🌱',
    overview: 'CroperX is India\'s premier intelligent agronomy workstation, bridging advanced multi-model AI, real-time IoT telemetry, and human agronomist expertise directly to smallholder and commercial farmers.',
    coreConcepts: [
      'The core mission: Eradicate crop failure, empower sustainable yields, and provide trustworthy agronomic intelligence.',
      'Three dedicated workspaces: Farmer Companion, Adviser Workstation, and Administrator Operations Control.',
      'Role-based security: Zero data leakage between tenants, end-to-end encrypted voice and video streaming.',
      'Farmer-first usability: Designed for high contrast, regional voice accessibility, and one-touch clarity.'
    ],
    operationalProtocols: [
      'Always greet farmers courteously in their preferred regional dialect.',
      'Respect the farmer\'s local contextual constraints (water availability, budget, labor capacity).',
      'Never recommend unsustainable high-cost inputs without exploring integrated bio-solutions first.'
    ],
    farmerImpactNotes: [
      'Farmers gain immediate confidence when paired with a certified, responsive human agronomist.',
      'Digital empowerment leads to documented 25-40% input cost reduction and higher net profit margins.'
    ],
    quizQuestion: {
      question: 'What is the primary guiding principle of the CroperX platform architecture?',
      options: ['Farmer-first accessibility with verified agronomic science and tenant privacy', 'Monetizing user data through advertising networks', 'Replacing human agronomists entirely with black-box algorithms', 'Serving only large corporate monoculture plantations'],
      correctIndex: 0,
      explanation: 'CroperX is built on a farmer-first foundation combining AI speed with verified human agronomist governance.'
    }
  },
  {
    id: 2,
    title: 'Farmer Dashboard & Telemetry',
    subtitle: 'Navigating Farm Profiles, Soil Zones & Historical Memory',
    category: 'Workstation Interface',
    badge: 'Operations',
    durationMinutes: 15,
    icon: '🌾',
    overview: 'Understanding the comprehensive data matrix available on every farmer\'s profile, including acreage, GPS coordinates, historical soil telemetry, water sources, and past crop cycles.',
    coreConcepts: [
      'Farmer Profile: Acreage size, unit preferences (metric/imperial), primary water source, and soil classification.',
      'Live Soil Telemetry: Real-time N-P-K nutrient readings, pH balance, moisture percentage, and ambient temperature.',
      'Historical Memory: Past seasonal yields, disease outbreaks, applied treatments, and feedback logs.',
      'Zone Management: Multi-zone farm segmentation for diversified acreage and rotation plots.'
    ],
    operationalProtocols: [
      'Review the farmer\'s historical memory before answering live inquiries to maintain continuity.',
      'Check current soil moisture and recent rain telemetry before recommending irrigation schedules.',
      'Update the farmer\'s profile notes whenever significant soil treatments are prescribed.'
    ],
    farmerImpactNotes: [
      'Farmers do not have to repeat their history every time they consult an adviser.',
      'Personalized memory tracking creates trust and deepens long-term agricultural resilience.'
    ],
    quizQuestion: {
      question: 'Why should an Adviser review the Farmer Memory log before a consultation?',
      options: ['To understand past treatments, soil trends, and maintain continuity of care', 'To see the farmer\'s banking PIN numbers', 'To reset the farmer\'s password automatically', 'To delete past harvest records'],
      correctIndex: 0,
      explanation: 'Farmer Memory stores historical treatments and soil trends to ensure informed, continuous advisory.'
    }
  },
  {
    id: 3,
    title: 'AI Agronomy Intelligence',
    subtitle: 'Multi-Model Consensus: Gemini, Groq & DeepSeek',
    category: 'AI Systems',
    badge: 'Advanced AI',
    durationMinutes: 18,
    icon: '🧠',
    overview: 'Explore how CroperX harnesses a tri-model AI architecture to eliminate hallucinations, validate scientific rules, and deliver instantaneous agronomic insights.',
    coreConcepts: [
      'Groq Llama-3.3: High-speed first pass inference with sub-100ms latency for rapid conversational voice response.',
      'Gemini 3.7 Flash: Advanced multimodal reasoning for high-resolution visual disease pathology and crop canopy inspection.',
      'DeepSeek-R1 Distill: Rigorous agronomic chain-of-thought verification against FAO-56 and ICAR scientific standards.',
      'Agronomic Rule Engine: Deterministic fallback engine operating 520+ verified crop profiles and nutrient thresholds.'
    ],
    operationalProtocols: [
      'Treat AI recommendations as intelligent clinical drafts; the human adviser holds final authoritative responsibility.',
      'Examine consensus scores; if AI agreement falls below 80%, conduct thorough manual verification.',
      'Report any identified discrepancy or edge case to system administrators for continual model fine-tuning.'
    ],
    farmerImpactNotes: [
      'Farmers receive lightning-fast initial responses while remaining protected by human expert verification.',
      'Triangulated AI reasoning prevents catastrophic crop loss from single-model mistakes.'
    ],
    quizQuestion: {
      question: 'What is the role of DeepSeek-R1 in the CroperX multi-model AI consensus pipeline?',
      options: ['Scientific agronomic reasoning and validation against ICAR/FAO standards', 'Sending marketing SMS messages', 'Rendering the HTML stylesheets', 'Generating random crop varieties'],
      correctIndex: 0,
      explanation: 'DeepSeek-R1 provides rigorous step-by-step scientific reasoning to confirm biological validity.'
    }
  },
  {
    id: 4,
    title: 'Crop Prediction Engine',
    subtitle: 'Multi-Factor Agronomic Parameter Evaluation (22 Factors)',
    category: 'Core Feature',
    badge: 'Crop Modeling',
    durationMinutes: 16,
    icon: '🎯',
    overview: 'Master the 22-parameter machine learning engine that calculates exact crop suitability, rotation viability, and economic ROI for any micro-climate in India.',
    coreConcepts: [
      '22 Evaluation Parameters: NPK, pH, Temperature, Humidity, Rainfall, Soil Moisture, Organic Matter, CO2, Sunlight, Frost Risk, etc.',
      'Suitability Index: Quantitative distance matching across verified national agricultural trial datasets.',
      'Alternative Crops: Secondary and tertiary suggestions for risk diversification and water savings.',
      'Nutrient Scheduling: Phased fertilizer application breakdown tailored to physiological growth stages.'
    ],
    operationalProtocols: [
      'Ensure soil parameters are within realistic physiological ranges before executing prediction simulations.',
      'Explain to the farmer why a top-ranked crop was selected based on soil bioavailability and market liquidity.',
      'Factor in local mandi price trajectories and storage infrastructure before finalizing recommendations.'
    ],
    farmerImpactNotes: [
      'Prevents disastrous planting of unsuited varieties that lead to premature crop failure.',
      'Empowers farmers to transition into high-value pulses and oilseeds with guaranteed agronomic compatibility.'
    ],
    quizQuestion: {
      question: 'How many parameters does the CroperX Prediction Engine analyze to evaluate crop suitability?',
      options: ['22 comprehensive environmental, soil, and management parameters', 'Only 3 parameters', '5 hypothetical metrics', '1 single weather factor'],
      correctIndex: 0,
      explanation: 'CroperX evaluates 22 simultaneous parameters for maximum precision.'
    }
  },
  {
    id: 5,
    title: 'Crop Disease Diagnostics',
    subtitle: 'Multimodal Vision, Pathogen Recognition & Verification',
    category: 'Plant Pathology',
    badge: 'Diagnostics',
    durationMinutes: 20,
    icon: '🔬',
    overview: 'Learn how to interpret AI vision diagnostics, distinguish abiotic physiological disorders from biotic fungal/bacterial/viral infections, and formulate safe treatment plans.',
    coreConcepts: [
      'Pathogen Classification: Fungal blights/rusts, bacterial wilts/oozes, viral mosaics, and insect-vectored infestations.',
      'Abiotic vs Biotic: Differentiating nutrient deficiencies (uniform pattern) from infectious pathogen lesions (irregular/water-soaked).',
      'Confidence Scoring: Evaluating AI detection certainty and identifying image quality bottlenecks (glare, blur, low light).',
      'Remediation Hierarchy: Bio-fungicides (Trichoderma/Pseudomonas) → cultural control → targeted safe chemical intervention.'
    ],
    operationalProtocols: [
      'Always request a clear macro photo of both upper and lower leaf surfaces if symptoms appear ambiguous.',
      'Verify whether neighboring fields are experiencing similar outbreak vectors (e.g. Whitefly or Planthopper swarms).',
      'Specify strict label dosages, pre-harvest safety intervals, and protective equipment in every advisory note.'
    ],
    farmerImpactNotes: [
      'Early detection prevents 80%+ of whole-field crop loss during sudden pathogen outbreaks.',
      'Judicious bio-first remedies save farmers thousands of rupees in unneeded expensive pesticide sprays.'
    ],
    quizQuestion: {
      question: 'What is the first step in the CroperX plant pathology remediation hierarchy?',
      options: ['Bio-fungicides, cultural controls, and preventative management before harsh chemicals', 'Spraying unverified maximum-strength chemical cocktails immediately', 'Burning the entire crop field down', 'Ignoring the symptoms until harvest time'],
      correctIndex: 0,
      explanation: 'CroperX mandates a safe, bio-first integrated approach to protect soil health and farmer safety.'
    }
  },
  {
    id: 6,
    title: 'Farmer Chat & Advisory',
    subtitle: 'Real-Time Messaging, Evidence Notes & Communication Etiquette',
    category: 'Communication',
    badge: 'Advisory Protocol',
    durationMinutes: 14,
    icon: '💬',
    overview: 'Master the real-time chat interface, message threading, multimedia attachments, and professional communication standards when supporting farming communities.',
    coreConcepts: [
      'Real-Time Sync: Sub-second message delivery via Server-Sent Events (SSE) and persistent storage.',
      'Voice & Image Notes: Seamless support for voice recordings and high-resolution plant photos.',
      'Actionable Structure: 4-part advisory format: Direct Answer → Scientific Reason → Concrete Action → Timing.',
      'Language Localization: Automatic translation assistance across 8 Indian regional languages.'
    ],
    operationalProtocols: [
      'Maintain an encouraging, respectful, and jargon-free tone at all times.',
      'Provide clear, measurable quantities (e.g., "Mix 2 grams per Liter of water" rather than "use a small amount").',
      'Acknowledge urgent queries within 5 minutes during active duty hours.'
    ],
    farmerImpactNotes: [
      'Farmers get quick, understandable answers without struggling through dense English text.',
      'Permanent chat logs allow farmers to reference treatment instructions days or weeks later.'
    ],
    quizQuestion: {
      question: 'What is the CroperX standard 4-part format for clear farmer communication?',
      options: ['Direct Answer → Scientific Reason → Concrete Action → Exact Timing', 'Marketing Slogan → Technical Latin Names → Price List → Legal Disclaimer', 'Greeting → Apology → Invoice → Unsubscribing', 'Abstract Theory → Statistical Math → Homework → Warning'],
      correctIndex: 0,
      explanation: 'The 4-part structure ensures the farmer understands exactly what to do and when to do it.'
    }
  },
  {
    id: 7,
    title: 'Live Video Consultation',
    subtitle: 'WebRTC Workstation, AR Canvas Annotations & Audio Controls',
    category: 'Live Video',
    badge: 'Field Telemedicine',
    durationMinutes: 18,
    icon: '📹',
    overview: 'Conduct high-definition 2-way live video consultations, draw real-time AR annotations on the farmer\'s live camera feed, and troubleshoot bandwidth constraints in rural environments.',
    coreConcepts: [
      'WebRTC Peer Mesh: Low-latency video/audio streaming designed to operate reliably over 3G/4G rural cellular networks.',
      'AR Telestrator: Live canvas annotation tool allowing advisers to draw circles and point arrows directly on the live plant stream.',
      'Bandwidth Adaptation: Automatic fallback from HD video to audio + high-res snapshot mode under poor signal conditions.',
      'Consultation Summary: Auto-generating post-call case records and sending digital prescriptions.'
    ],
    operationalProtocols: [
      'Guide the farmer calmly to hold the camera 15-20 cm from the affected plant organ and avoid direct sun glare.',
      'Use the AR annotation pen to highlight exact fungal pustules, pest egg clusters, or pruning nodes.',
      'Summarize key action items verbally before ending the video consultation call.'
    ],
    farmerImpactNotes: [
      'Eliminates the multi-day delay of having an agronomist travel physically to remote villages.',
      'Gives farmers the reassurance of showing live field ground truth directly to an expert.'
    ],
    quizQuestion: {
      question: 'What does the CroperX AR Telestrator allow the Adviser to do during a live video call?',
      options: ['Draw live annotations and circles directly on the farmer’s live video stream to pinpoint issues', 'Disconnect the farmer’s cellular connection', 'Change the farmer’s device wallpaper', 'Record personal phone calls without permission'],
      correctIndex: 0,
      explanation: 'The AR Telestrator allows advisers to highlight exact disease spots on the live screen in real time.'
    }
  },
  {
    id: 8,
    title: 'GPS & Live Presence',
    subtitle: 'Geo-Telemetry, Field Pinning & Location Privacy',
    category: 'Geospatial',
    badge: 'Spatial Agronomy',
    durationMinutes: 15,
    icon: '📍',
    overview: 'Understand how geospatial presence, reverse-geocoding, and micro-climate mapping power localized weather forecasting and soil classification while respecting user privacy.',
    coreConcepts: [
      'GPS Precision: Acquiring browser/device GPS coordinates with accuracy radius indicators.',
      'Reverse Geocoding: Automatically resolving coordinates to village, district, state, and agro-climatic zone.',
      'Presence Management: Active online/offline availability states for both Farmers and Advisers.',
      'Location Privacy: Strict opt-in permissions; coordinates are encrypted and used solely for agronomic calculations.'
    ],
    operationalProtocols: [
      'Verify that the farmer\'s pinned GPS coordinates match their reported district before checking localized weather data.',
      'Ensure your own Adviser status is set to "Available" when on duty and "Off Duty" during breaks.',
      'Never share or export raw GPS coordinates outside the authenticated platform boundaries.'
    ],
    farmerImpactNotes: [
      'Hyperlocal weather warnings (frost, rain, heatwave) are delivered with kilometer-level accuracy.',
      'Eliminates confusion caused by generic state-wide weather forecasts.'
    ],
    quizQuestion: {
      question: 'How is Farmer GPS data protected within the CroperX architecture?',
      options: ['Encrypted, strictly permission-based, and used solely for localized agronomic modeling', 'Publicly broadcasted to third-party ad networks', 'Sold to real estate brokers', 'Stored in unauthenticated public folders'],
      correctIndex: 0,
      explanation: 'GPS data is strictly opt-in, encrypted, and isolated to ensure complete farmer privacy.'
    }
  },
  {
    id: 9,
    title: 'Emergency SOS Workflows',
    subtitle: 'Priority Alerts, Rapid Triage & Disaster Response',
    category: 'Emergency Management',
    badge: 'Crisis Response',
    durationMinutes: 16,
    icon: '🚨',
    overview: 'Master the emergency alert pipeline triggered during severe biological threats, sudden locust/pest swarms, flash floods, or catastrophic crop collapse.',
    coreConcepts: [
      'SOS Trigger: Instant red-alert priority banner broadcast across all active on-duty Adviser workstations.',
      'Automatic Telemetry Capture: Immediate snapshot of current soil, weather, location, and camera diagnostics.',
      'Triage Protocol: Emergency queue prioritization jumping ahead of standard routine consultations.',
      'Escalation: Rapid coordination with regional agricultural extension officers and administrative hubs.'
    ],
    operationalProtocols: [
      'Acknowledge incoming SOS alerts within 60 seconds.',
      'Initiate immediate live video triage to assess threat severity and containment options.',
      'Document the incident and notify neighboring farm clusters if a contagious biosecurity outbreak is confirmed.'
    ],
    farmerImpactNotes: [
      'Farmers have a direct lifeline when faced with devastating sudden agricultural emergencies.',
      'Fast containment prevents localized pest/pathogen outbreaks from spreading across entire districts.'
    ],
    quizQuestion: {
      question: 'What happens on the Adviser Workstation when a farmer triggers an Emergency SOS?',
      options: ['An instant high-priority emergency banner appears with telemetry for immediate triage', 'The adviser workstation automatically shuts down', 'The alert is placed in a 3-day backlog queue', 'The farmer’s account is temporarily disabled'],
      correctIndex: 0,
      explanation: 'Emergency SOS alerts bypass standard queues to trigger instant visual alerts on active adviser screens.'
    }
  },
  {
    id: 10,
    title: 'Smartphone Field Scout',
    subtitle: 'QR Code Pairing & Handheld Camera Telemetry',
    category: 'Hardware Sync',
    badge: 'Field Scouting',
    durationMinutes: 14,
    icon: '📱',
    overview: 'Understand how farmers and advisers utilize QR code pairing to turn any standard smartphone into a wireless handheld field inspection camera without installing native apps.',
    coreConcepts: [
      'Instant Web-Pairing: Scanning a secure session QR code links the mobile browser instantly to the workstation.',
      'Zero App Install: Full WebRTC and camera capabilities execute seamlessly inside standard mobile web browsers.',
      'High-Res Macro Capture: Taking 4K inspection stills during video streaming for microscopic leaf analysis.',
      'Torch/Flash Toggle: Remote torch activation to inspect dark lower canopy leaves or evening pests.'
    ],
    operationalProtocols: [
      'Instruct farmers on how to point their phone camera at the workstation QR code for one-touch pairing.',
      'Advise the farmer to keep the smartphone lens clean and dry when inspecting wet morning fields.',
      'Use the remote snapshot trigger to capture crisp stills without camera shake.'
    ],
    farmerImpactNotes: [
      'Farmers don\'t need expensive dedicated agricultural hardware; any basic smartphone works.',
      'Allows effortless walk-around inspections of wide acreage.'
    ],
    quizQuestion: {
      question: 'What is the major technical benefit of the CroperX Smartphone Field Scout pairing?',
      options: ['It turns any smartphone into a field camera via web browser QR pairing without installing native apps', 'It requires downloading a 500MB software package', 'It only works with specialized $5,000 laser probes', 'It replaces the smartphone operating system'],
      correctIndex: 0,
      explanation: 'Field Scout operates purely in the mobile browser via QR pairing with zero app download needed.'
    }
  },
  {
    id: 11,
    title: 'Multilingual Farmer Assistance',
    subtitle: '8 Regional Indian Languages & Voice AI Companion',
    category: 'Accessibility',
    badge: 'Regional Voice',
    durationMinutes: 15,
    icon: '🎙️',
    overview: 'Learn how to support farmers across diverse linguistic backgrounds using native voice recognition, audio speech synthesis, and 8 localized regional language models.',
    coreConcepts: [
      'Supported Languages: English, Hindi, Punjabi, Telugu, Tamil, Marathi, Bengali, and Kannada.',
      'Voice-First UX: One-touch microphone input enabling non-literate farmers to speak naturally in their mother tongue.',
      'Synthesized Audio Output: Returning spoken audio advice alongside text for maximum comprehension.',
      'Cultural Dialect Nuances: Adapting regional agricultural terms (e.g. "Kharif", "Rabi", "Zaid", "Mandi", "Dhan", "Gehun").'
    ],
    operationalProtocols: [
      'Match the farmer\'s preferred regional language in written notes and voice messages.',
      'Speak clearly and avoid rapid speech or heavy technical acronyms during voice consultations.',
      'Utilize the built-in translation assistance tool if assisting a farmer in another regional language.'
    ],
    farmerImpactNotes: [
      'Removes the literacy and language barrier that historically excluded smallholder farmers from digital tools.',
      'Voice-first interaction feels natural, friendly, and trustworthy.'
    ],
    quizQuestion: {
      question: 'Which regional Indian languages are supported in the CroperX voice & UI localization matrix?',
      options: ['English, Hindi, Punjabi, Telugu, Tamil, Marathi, Bengali, and Kannada', 'English and Latin only', 'Hindi only', 'German and Japanese only'],
      correctIndex: 0,
      explanation: 'CroperX supports 8 major Indian languages covering the majority of agricultural heartlands.'
    }
  },
  {
    id: 12,
    title: 'Adviser Professional Responsibility',
    subtitle: 'Evidence-Based Advisory, Privacy & Responsible AI Ethics',
    category: 'Ethics & Governance',
    badge: 'Code of Ethics',
    durationMinutes: 15,
    icon: '⚖️',
    overview: 'The definitive ethical code, professional standards, biosecurity responsibilities, and legal liabilities required of every certified CroperX Farm Adviser.',
    coreConcepts: [
      'Zero Fabrication: Absolute prohibition on guessing chemical formulations, fabricating diagnoses, or misleading farmers.',
      'Evidence-Based Science: All recommendations must be grounded in verified agronomic publications (ICAR, SAU, FAO).',
      'Conflict of Interest: Prohibition on accepting unauthorized commercial kickbacks for promoting specific brand chemicals.',
      'Data Privacy & Confidentiality: Farmer financial, crop, and location data is strictly confidential and protected by law.'
    ],
    operationalProtocols: [
      'If uncertain about a rare pathogen or complex soil anomaly, escalate the case to senior agronomists immediately.',
      'Always document the reasoning and scientific basis behind any chemical or biological recommendation.',
      'Maintain an active CroperX Adviser License by completing periodic mastery reviews and refresher courses.'
    ],
    farmerImpactNotes: [
      'Farmers can trust that advice is 100% objective, scientifically validated, and in their best financial interest.',
      'Protects farming families from dangerous input debt and health risks associated with pesticide misuse.'
    ],
    quizQuestion: {
      question: 'What is the strict policy regarding an Adviser who is uncertain about a complex crop disease diagnosis?',
      options: ['Escalate immediately to senior agronomists or request laboratory verification rather than guessing', 'Invent a fictitious treatment to appear confident', 'Prescribe random heavy chemicals just in case', 'Disconnect the call and block the farmer'],
      correctIndex: 0,
      explanation: 'CroperX strictly mandates evidence-based escalation whenever uncertainty exists.'
    }
  }
];

// -------------------------------------------------------------
// 12 FINAL MASTERY ASSESSMENT QUESTIONS (SERVER-SIDE ONLY)
// -------------------------------------------------------------
export interface AuthoritativeMasteryQuestion {
  id: number;
  moduleNumber: number;
  moduleTitle: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
}

export const MASTERY_QUESTIONS: AuthoritativeMasteryQuestion[] = [
  {
    id: 1,
    moduleNumber: 1,
    moduleTitle: 'Welcome to CroperX',
    question: 'How does CroperX protect data separation across its three distinct user workspaces (Farmer, Adviser, Admin)?',
    options: ['Strict server-side role-based access control (RBAC), signed tokens, and tenant data isolation', 'By storing all records in a single public spreadsheet', 'By relying solely on client-side browser cookies', 'By allowing any user to switch to Admin at will'],
    correctOptionIndex: 0,
  },
  {
    id: 2,
    moduleNumber: 2,
    moduleTitle: 'Farmer Dashboard & Telemetry',
    question: 'If a farmer\'s live telemetry displays a soil pH of 5.2 and available Nitrogen at 60 ppm, what is the agronomically correct deduction?',
    options: ['Acidic soil with severe Nitrogen depletion requiring liming and phased organic/mineral nitrogen top-dressing', 'Highly alkaline soil with excessive toxic salts', 'Perfect optimal soil requiring zero intervention', 'Waterlogged soil with 100% anaerobic microbial dominance'],
    correctOptionIndex: 0,
  },
  {
    id: 3,
    moduleNumber: 3,
    moduleTitle: 'AI Agronomy Intelligence',
    question: 'What happens within the CroperX AI orchestrator if Gemini, Groq, and DeepSeek produce conflicting recommendations?',
    options: ['The consensus score flags the case for mandatory Human Adviser Clinical Review before presentation', 'The system flips a coin to pick one answer', 'The system crashes and shuts down', 'The system selects the fastest model regardless of accuracy'],
    correctOptionIndex: 0,
  },
  {
    id: 4,
    moduleNumber: 4,
    moduleTitle: 'Crop Prediction Engine',
    question: 'When evaluating crop suitability for a farmer with 5 acres in Ludhiana during Kharif, what secondary factors must the engine weigh?',
    options: ['Irrigation source reliability, frost/heat risk bands, regional mandi liquidity, and 3-season rotation fit', 'Only the color of the farmer’s tractor', 'The astrological horoscope of the sowing date', 'International cryptocurrency exchange rates'],
    correctOptionIndex: 0,
  },
  {
    id: 5,
    moduleNumber: 5,
    moduleTitle: 'Crop Disease Diagnostics',
    question: 'A farmer submits a photo of circular brown lesions with concentric rings and yellow chlorotic halos on lower tomato leaves. What is the diagnosis?',
    options: ['Early Blight (Alternaria solani) requiring bio-fungicide or safe copper hydroxide spray', 'Healthy leaf senescence from excess sunlight', 'Severe frost bite from winter storms', 'Root knot nematode galling'],
    correctOptionIndex: 0,
  },
  {
    id: 6,
    moduleNumber: 6,
    moduleTitle: 'Farmer Chat & Advisory',
    question: 'How should an Adviser structure a digital prescription for a farmer inquiring about aphid control?',
    options: ['Specify exact approved formulation (e.g. Neem Oil 10,000 ppm @ 3ml/L or Imidacloprid 17.8 SL @ 0.5ml/L), spray timing, and safety interval', 'Tell the farmer to visit any shop and buy whatever is cheapest', 'Provide only theoretical Latin insect anatomy', 'Advise dumping undiluted chemical into the irrigation canal'],
    correctOptionIndex: 0,
  },
  {
    id: 7,
    moduleNumber: 7,
    moduleTitle: 'Live Video Consultation',
    question: 'During a live video consultation over a rural 3G connection, the video becomes choppy. What is the recommended operational action?',
    options: ['Switch to audio priority mode, take high-resolution snapshots for analysis, and annotate on captured stills', 'Immediately terminate the call and penalize the farmer', 'Yell loudly into the microphone', 'Demand the farmer install a fiber optic cable'],
    correctOptionIndex: 0,
  },
  {
    id: 8,
    moduleNumber: 8,
    moduleTitle: 'GPS & Live Presence',
    question: 'Why does CroperX combine live GPS coordinates with spatial weather radar APIs?',
    options: ['To compute hyperlocal rainfall credits, evapotranspiration (ETo), and early frost warnings for the specific field', 'To track the farmer\'s personal vehicle movements', 'To display banner advertisements for nearby fast food restaurants', 'To calculate urban property taxes'],
    correctOptionIndex: 0,
  },
  {
    id: 9,
    moduleNumber: 9,
    moduleTitle: 'Emergency SOS Workflows',
    question: 'What constitutes an immediate biosecurity emergency requiring SOS escalation on CroperX?',
    options: ['Sudden invasive pest swarms (e.g. Locusts), rapid whole-field wilt epidemics, or flash flood inundation', 'A farmer asking for the current market price of wheat', 'A routine inquiry about seed purchasing dates', 'A request to change the profile photo'],
    correctOptionIndex: 0,
  },
  {
    id: 10,
    moduleNumber: 10,
    moduleTitle: 'Smartphone Field Scout',
    question: 'How does the Smartphone Field Scout facilitate remote agronomist field scouting without hardware dongles?',
    options: ['It utilizes secure one-time QR tokens and standard mobile web browsers to stream live camera and torch control', 'It requires plugging specialized USB probes into the laptop', 'It sends SMS text descriptions only', 'It relies on drone satellites flying overhead'],
    correctOptionIndex: 0,
  },
  {
    id: 11,
    moduleNumber: 11,
    moduleTitle: 'Multilingual Farmer Assistance',
    question: 'How does CroperX ensure non-literate farmers receive full benefit from advisory prescriptions?',
    options: ['By providing native spoken audio synthesis and localized voice responses in their mother tongue', 'By printing long English PDF documents only', 'By requiring farmers to take an English literacy exam', 'By sending Morse code beeps'],
    correctOptionIndex: 0,
  },
  {
    id: 12,
    moduleNumber: 12,
    moduleTitle: 'Adviser Professional Responsibility',
    question: 'Under the CroperX Code of Ethics, what is the consequence of prescribing banned or unapproved hazardous chemicals to a farmer?',
    options: ['Immediate revocation of Adviser certification, account suspension, and formal referral to agricultural regulatory authorities', 'A minor verbal reminder with no records kept', 'A promotion to senior administrator', 'A cash bonus for selling chemical stock'],
    correctOptionIndex: 0,
  },
];

// -------------------------------------------------------------
// DATABASE ACCESS & PERSISTENCE HELPERS
// -------------------------------------------------------------

export function getAdviserApplicationsDB(): Record<string, any> {
  return readJsonFile<Record<string, any>>(APPLICATIONS_FILE, {});
}

export function saveAdviserApplicationsDB(data: Record<string, any>) {
  writeJsonFile(APPLICATIONS_FILE, data);
}

export function getAssessmentAttemptsDB(): Record<string, any> {
  return readJsonFile<Record<string, any>>(ASSESSMENT_ATTEMPTS_FILE, {});
}

export function saveAssessmentAttemptsDB(data: Record<string, any>) {
  writeJsonFile(ASSESSMENT_ATTEMPTS_FILE, data);
}

export function getActivationTokensDB(): Record<string, any> {
  return readJsonFile<Record<string, any>>(ACTIVATION_TOKENS_FILE, {});
}

export function saveActivationTokensDB(data: Record<string, any>) {
  writeJsonFile(ACTIVATION_TOKENS_FILE, data);
}

export function getCourseProgressDB(): Record<string, any> {
  return readJsonFile<Record<string, any>>(COURSE_PROGRESS_FILE, {});
}

export function saveCourseProgressDB(data: Record<string, any>) {
  writeJsonFile(COURSE_PROGRESS_FILE, data);
}

export function getMasteryAttemptsDB(): Record<string, any> {
  return readJsonFile<Record<string, any>>(MASTERY_ATTEMPTS_FILE, {});
}

export function saveMasteryAttemptsDB(data: Record<string, any>) {
  writeJsonFile(MASTERY_ATTEMPTS_FILE, data);
}

// -------------------------------------------------------------
// CORE BUSINESS LOGIC & SCORING ENGINES
// -------------------------------------------------------------

/**
 * 1. Register Adviser Application
 */
export async function registerAdviserApplication(payload: {
  fullName: string;
  mobile: string;
  email?: string;
  specialization?: string;
  experienceYears?: number;
  yearsOfExperience?: number;
  qualification?: string;
  primaryCrops?: string[];
  secondaryCrops?: string[];
  languages?: string[];
  region?: string;
  district?: string;
  state?: string;
  institution?: string;
  certificationInfo?: string;
}) {
  const db = getAdviserApplicationsDB();
  const cleanMobile = payload.mobile.replace(/\D/g, '');

  const existingApp = Object.values(db).find((a: any) => a.mobile.replace(/\D/g, '') === cleanMobile);
  if (existingApp && (existingApp.status === 'APPROVED' || existingApp.status === 'ACTIVE')) {
    throw new Error('An active or approved Adviser account already exists with this mobile number. Please log in.');
  }

  const applicationId = existingApp?.id || `app_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const now = new Date().toISOString();

  const exp = payload.experienceYears ?? payload.yearsOfExperience ?? 1;
  const applicationRecord = {
    id: applicationId,
    mobile: payload.mobile,
    fullName: payload.fullName,
    email: payload.email || null,
    specialization: payload.specialization || 'General Agronomy',
    experienceYears: Number(exp) || 1,
    yearsOfExperience: Number(exp) || 1,
    qualification: payload.qualification || 'B.Sc. Agriculture',
    primaryCrops: payload.primaryCrops || ['Rice', 'Wheat'],
    secondaryCrops: payload.secondaryCrops || [],
    languages: payload.languages || ['English', 'Hindi'],
    region: payload.region || payload.state || payload.district || 'Punjab / Indo-Gangetic Plains',
    district: payload.district || null,
    state: payload.state || null,
    institution: payload.institution || null,
    certificationInfo: payload.certificationInfo || null,
    status: 'OTP_REQUIRED',
    assessmentScore: null,
    assessmentPercentage: null,
    assessmentVersion: 'v1.0',
    assessmentSubmittedAt: null,
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null,
    passwordSetupCompleted: false,
    courseCompleted: false,
    masteryTestPassed: false,
    createdAt: existingApp?.createdAt || now,
    updatedAt: now,
  };

  db[applicationId] = applicationRecord;
  saveAdviserApplicationsDB(db);

  // Sync to Supabase if configured
  try {
    const { client, isConfigured } = getSupabase();
    if (isConfigured && client) {
      await client.from('adviser_applications').upsert({
        id: applicationId,
        mobile: payload.mobile,
        full_name: payload.fullName,
        email: payload.email || null,
        specialization: payload.specialization,
        experience_years: payload.experienceYears,
        qualification: payload.qualification,
        primary_crops: payload.primaryCrops,
        languages: payload.languages,
        region: payload.region,
        institution: payload.institution || null,
        certification_info: payload.certificationInfo || null,
        status: 'OTP_REQUIRED',
        updated_at: now,
      });
    }
  } catch (err) {
    console.warn('[Supabase Sync] Adviser application upsert error:', err);
  }

  return applicationRecord;
}

/**
 * 2. Mark Application as OTP Verified
 */
export async function markAdviserOtpVerified(mobile: string) {
  const db = getAdviserApplicationsDB();
  const cleanMobile = mobile.replace(/\D/g, '');
  const app = Object.values(db).find((a: any) => a.mobile.replace(/\D/g, '') === cleanMobile);

  if (!app) {
    throw new Error('No pending adviser application found for this mobile number.');
  }

  app.status = 'ASSESSMENT_REQUIRED';
  app.updatedAt = new Date().toISOString();
  db[app.id] = app;
  saveAdviserApplicationsDB(db);

  try {
    const { client, isConfigured } = getSupabase();
    if (isConfigured && client) {
      await client.from('adviser_applications').update({
        status: 'ASSESSMENT_REQUIRED',
        updated_at: new Date().toISOString()
      }).eq('id', app.id);
    }
  } catch (e) {}

  return app;
}

/**
 * 3. Evaluate 50-Question Assessment Server-Side
 */
export async function evaluateAndSubmitAssessment(payload: {
  mobile: string;
  answers: Record<number, number>; // questionId -> selectedOptionIndex
}) {
  const db = getAdviserApplicationsDB();
  const cleanMobile = payload.mobile.replace(/\D/g, '');
  const app = Object.values(db).find((a: any) => a.mobile.replace(/\D/g, '') === cleanMobile);

  if (!app) {
    throw new Error('No adviser application found for this mobile number. Please register first.');
  }

  // Calculate authoritative score
  let correctCount = 0;
  const detailedBreakdown: Record<number, { selected: number; correct: boolean }> = {};

  for (const q of ASSESSMENT_QUESTIONS) {
    const userChoice = payload.answers[q.id];
    const isCorrect = userChoice !== undefined && userChoice === q.correctOptionIndex;
    if (isCorrect) {
      correctCount += 1;
    }
    detailedBreakdown[q.id] = {
      selected: userChoice !== undefined ? userChoice : -1,
      correct: isCorrect,
    };
  }

  const totalQuestions = ASSESSMENT_QUESTIONS.length; // 50
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const isPassed = correctCount >= 25; // 25 / 50 Passing Threshold
  const now = new Date().toISOString();

  // Save attempt record
  const attempts = getAssessmentAttemptsDB();
  const attemptId = `att_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  attempts[attemptId] = {
    id: attemptId,
    applicationId: app.id,
    mobile: payload.mobile,
    score: correctCount,
    maxScore: totalQuestions,
    percentage,
    passed: isPassed,
    breakdown: detailedBreakdown,
    submittedAt: now,
  };
  saveAssessmentAttemptsDB(attempts);

  // Update application status based on server-evaluated score
  app.assessmentScore = correctCount;
  app.assessmentPercentage = percentage;
  app.assessmentSubmittedAt = now;
  app.status = isPassed ? 'PENDING_ADMIN_REVIEW' : 'NOT_ELIGIBLE';
  app.updatedAt = now;

  db[app.id] = app;
  saveAdviserApplicationsDB(db);

  // Sync to Supabase
  try {
    const { client, isConfigured } = getSupabase();
    if (isConfigured && client) {
      await client.from('adviser_applications').update({
        assessment_score: correctCount,
        assessment_percentage: percentage,
        assessment_submitted_at: now,
        status: app.status,
        updated_at: now
      }).eq('id', app.id);

      await client.from('adviser_assessment_attempts').insert({
        id: attemptId,
        application_id: app.id,
        mobile: payload.mobile,
        score: correctCount,
        max_score: totalQuestions,
        percentage,
        passed: isPassed,
        created_at: now
      });
    }
  } catch (err) {
    console.warn('[Supabase Sync] Assessment attempt error:', err);
  }

  return {
    score: correctCount,
    maxScore: totalQuestions,
    percentage,
    passed: isPassed,
    isEligible: isPassed,
    status: app.status,
    submittedAt: now,
    message: isPassed
      ? 'Congratulations! You achieved the minimum assessment score of 25/50. Your application has been submitted for Admin verification.'
      : 'Thank you for completing the CroperX Adviser Assessment. Your score does not currently meet the minimum verification requirement of 25 out of 50.',
  };
}

/**
 * 4. Admin Approve Adviser Application & Generate Activation Token
 */
export async function adminApproveApplication(applicationId: string, adminUser: string) {
  const db = getAdviserApplicationsDB();
  const app = db[applicationId];

  if (!app) {
    throw new Error('Adviser application not found.');
  }

  // Generate cryptographically secure single-use activation token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48-hour expiration
  const now = new Date().toISOString();

  // Store hashed activation token
  const tokensDb = getActivationTokensDB();
  const tokenId = `act_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  tokensDb[tokenId] = {
    id: tokenId,
    applicationId: app.id,
    mobile: app.mobile,
    tokenHash,
    expiresAt,
    used: false,
    usedAt: null,
    createdAt: now,
  };
  saveActivationTokensDB(tokensDb);

  // Update application status
  app.status = 'APPROVED';
  app.reviewedBy = adminUser || 'Administrator';
  app.reviewedAt = now;
  app.updatedAt = now;
  db[app.id] = app;
  saveAdviserApplicationsDB(db);

  // Sync to Supabase
  try {
    const { client, isConfigured } = getSupabase();
    if (isConfigured && client) {
      await client.from('adviser_applications').update({
        status: 'APPROVED',
        reviewed_by: adminUser || 'Administrator',
        reviewed_at: now,
        updated_at: now
      }).eq('id', app.id);

      await client.from('adviser_activation_tokens').insert({
        id: tokenId,
        application_id: app.id,
        mobile: app.mobile,
        token_hash: tokenHash,
        expires_at: expiresAt,
        used: false,
        created_at: now
      });
    }
  } catch (e) {}

  return {
    success: true,
    application: app,
    activationToken: rawToken, // Provided once to admin/activation channel
    expiresAt,
  };
}

/**
 * 5. Admin Reject Adviser Application
 */
export async function adminRejectApplication(applicationId: string, adminUser: string, reason?: string) {
  const db = getAdviserApplicationsDB();
  const app = db[applicationId];

  if (!app) {
    throw new Error('Adviser application not found.');
  }

  const now = new Date().toISOString();
  app.status = 'REJECTED';
  app.reviewedBy = adminUser || 'Administrator';
  app.reviewedAt = now;
  app.rejectionReason = reason || 'Qualifications and verification prerequisites do not meet platform accreditation standards at this time.';
  app.updatedAt = now;

  db[app.id] = app;
  saveAdviserApplicationsDB(db);

  // Sync to Supabase
  try {
    const { client, isConfigured } = getSupabase();
    if (isConfigured && client) {
      await client.from('adviser_applications').update({
        status: 'REJECTED',
        reviewed_by: adminUser || 'Administrator',
        reviewed_at: now,
        rejection_reason: app.rejectionReason,
        updated_at: now
      }).eq('id', app.id);
    }
  } catch (e) {}

  return {
    success: true,
    application: app,
  };
}

/**
 * 6. Verify Activation Token
 */
export function verifyActivationToken(rawToken: string) {
  if (!rawToken || typeof rawToken !== 'string') {
    return { valid: false, error: 'Activation token is missing or invalid.' };
  }

  const tokenHash = crypto.createHash('sha256').update(rawToken.trim()).digest('hex');
  const tokensDb = getActivationTokensDB();
  const tokenRecord = Object.values(tokensDb).find((t: any) => t.tokenHash === tokenHash);

  if (!tokenRecord) {
    return { valid: false, error: 'Invalid activation token.' };
  }

  if (tokenRecord.used) {
    return { valid: false, error: 'This activation token has already been used. Please log in.' };
  }

  if (new Date() > new Date(tokenRecord.expiresAt)) {
    return { valid: false, error: 'This activation token has expired. Please contact administration for a new activation link.' };
  }

  const appsDb = getAdviserApplicationsDB();
  const app = appsDb[tokenRecord.applicationId];

  return {
    valid: true,
    tokenRecord,
    application: app || null,
    mobile: tokenRecord.mobile,
  };
}

/**
 * 7. Consume Activation Token & Complete Password Setup
 */
export function markTokenUsed(rawToken: string) {
  const tokenHash = crypto.createHash('sha256').update(rawToken.trim()).digest('hex');
  const tokensDb = getActivationTokensDB();
  const tokenRecord = Object.values(tokensDb).find((t: any) => t.tokenHash === tokenHash);

  if (tokenRecord) {
    tokenRecord.used = true;
    tokenRecord.usedAt = new Date().toISOString();
    saveActivationTokensDB(tokensDb);
  }
}

/**
 * 8. Course Progress Management
 */
export function getAdviserProgress(mobile: string) {
  const progressDb = getCourseProgressDB();
  const cleanMobile = mobile.replace(/\D/g, '');
  const record = progressDb[cleanMobile] || {
    mobile,
    completedModules: [],
    currentModule: 1,
    courseCompleted: false,
    masteryTestPassed: false,
    masteryScore: 0,
    updatedAt: new Date().toISOString(),
  };
  return record;
}

export function saveAdviserProgress(mobile: string, completedModules: number[], currentModule: number) {
  const progressDb = getCourseProgressDB();
  const cleanMobile = mobile.replace(/\D/g, '');
  const allCompleted = completedModules.length >= 12;

  const record = {
    mobile,
    completedModules: Array.from(new Set(completedModules)),
    currentModule: currentModule || (completedModules.length + 1),
    courseCompleted: allCompleted,
    masteryTestPassed: progressDb[cleanMobile]?.masteryTestPassed || false,
    masteryScore: progressDb[cleanMobile]?.masteryScore || 0,
    updatedAt: new Date().toISOString(),
  };

  progressDb[cleanMobile] = record;
  saveCourseProgressDB(progressDb);

  // Sync to Supabase
  try {
    const { client, isConfigured } = getSupabase();
    if (isConfigured && client) {
      client.from('adviser_course_progress').upsert({
        mobile,
        completed_modules: record.completedModules,
        current_module: record.currentModule,
        course_completed: record.courseCompleted,
        mastery_test_passed: record.masteryTestPassed,
        mastery_score: record.masteryScore,
        updated_at: record.updatedAt
      });
    }
  } catch (e) {}

  return record;
}

/**
 * 9. Evaluate Final Mastery Assessment Server-Side
 */
export async function evaluateMasteryAssessment(mobile: string, answers: Record<number, number>) {
  let correct = 0;
  const weakModules: number[] = [];

  for (const q of MASTERY_QUESTIONS) {
    const userChoice = answers[q.id];
    if (userChoice !== undefined && userChoice === q.correctOptionIndex) {
      correct += 1;
    } else {
      weakModules.push(q.moduleNumber);
    }
  }

  const total = MASTERY_QUESTIONS.length; // 12
  const percentage = Math.round((correct / total) * 100);
  const passed = correct >= 10; // 10 out of 12 (83%) to pass
  const now = new Date().toISOString();

  // Save mastery attempt
  const masteryDb = getMasteryAttemptsDB();
  const attemptId = `mst_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  masteryDb[attemptId] = {
    id: attemptId,
    mobile,
    score: correct,
    maxScore: total,
    percentage,
    passed,
    weakModules,
    createdAt: now,
  };
  saveMasteryAttemptsDB(masteryDb);

  // Update course progress and application status
  const progressDb = getCourseProgressDB();
  const cleanMobile = mobile.replace(/\D/g, '');
  const prog = progressDb[cleanMobile] || { mobile, completedModules: [1,2,3,4,5,6,7,8,9,10,11,12], currentModule: 12 };
  prog.courseCompleted = true;
  prog.masteryTestPassed = passed;
  prog.masteryScore = correct;
  prog.updatedAt = now;
  progressDb[cleanMobile] = prog;
  saveCourseProgressDB(progressDb);

  const appsDb = getAdviserApplicationsDB();
  const app = Object.values(appsDb).find((a: any) => a.mobile.replace(/\D/g, '') === cleanMobile);
  if (app) {
    app.courseCompleted = true;
    app.masteryTestPassed = passed;
    app.masteryScore = correct;
    if (passed) {
      app.status = 'ACTIVE';
    }
    app.updatedAt = now;
    appsDb[app.id] = app;
    saveAdviserApplicationsDB(appsDb);
  }

  return {
    score: correct,
    maxScore: total,
    percentage,
    passed,
    weakModules,
    unlockedDashboard: passed,
    feedback: passed
      ? 'Congratulations! You have demonstrated comprehensive mastery of the CroperX Agronomy Platform. Your Adviser Workstation is officially unlocked!'
      : 'You scored ' + correct + ' out of ' + total + '. A minimum of 10/12 is required to unlock full Adviser Workstation access. Please review the highlighted modules and re-attempt the assessment.',
  };
}

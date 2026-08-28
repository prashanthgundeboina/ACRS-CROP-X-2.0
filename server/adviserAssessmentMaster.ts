// Authoritative Server-Side Master Answer Key & Scoring Engine for CroperX Adviser Assessment
// This file is strictly kept on the backend. Correct answers are never sent to the client browser.

export const ADVISER_ASSESSMENT_MASTER_KEY: Record<number, number> = {
  1: 1,  // Panicle Initiation to Flowering (Anthesis)
  2: 1,  // To biologically fix atmospheric Nitrogen and break insect-pest host cycles
  3: 1,  // Broad white or bleached bands on either side of the midrib ("White Bud")
  4: 0,  // Crown Root Initiation (CRI) stage (20-25 DAS)
  5: 0,  // 90 x 60 cm at 2-2.5 kg/ha
  6: 1,  // Ethephon (Ethylene generator)
  7: 0,  // Peg penetration into the soil (Gynophore elongation)
  8: 1,  // Short-duration French Bean, Potato, or Green Gram
  9: 1,  // Aluminum (Al3+) and Manganese (Mn2+)
  10: 1, // Agricultural Gypsum (Calcium Sulfate Dihydrate) followed by leaching
  11: 2, // Potassium (K)
  12: 0, // Apply 25% higher Nitrogen through split doses, standard basal P, and reduce Potassium by 20%
  13: 0, // Between 15:1 and 25:1
  14: 1, // Phosphorus has very low mobility in soil and rapidly fixes with Calcium/Iron compounds
  15: 0, // Mg deficiency causes interveinal chlorosis on OLDER bottom leaves, whereas Fe deficiency causes interveinal chlorosis on YOUNGEST top leaves
  16: 1, // Biological Nitrogen fixation from atmosphere into plant-available ammonia
  17: 1, // Spindle-shaped (eye-shaped) lesions with gray/whitish centers and dark brown borders on leaves and neck
  18: 1, // Install yellow sticky traps, rogue out infected plants early, and use systemic seed treatment/neem oil spray
  19: 0, // Fall Armyworm (Spodoptera frugiperda)
  20: 0, // Trichoderma viride / Trichoderma harzianum
  21: 0, // Bollworm larvae feeding inside flower buds
  22: 0, // Wavy, water-soaked yellowish lesions advancing from leaf tips along leaf margins, producing bacterial ooze in morning
  23: 1, // The pest population density at which control measures must be initiated to prevent reaching the Economic Injury Level
  24: 0, // Loose Smut (Ustilago tritici)
  25: 1, // Provide light frequent irrigations (or micro-sprinklers) and consider foliar spray of 2% KNO3 to mitigate terminal heat shock
  26: 1, // Clear field drainage channels and ensure no waterlogging can occur in the root zone
  27: 0, // Ice crystal formation inside plant cells causing intracellular rupture and plant desiccation
  28: 0, // Broad Bed and Furrow (BBF) or Compartmental Bunding with organic mulching
  29: 1, // It creates the ideal microclimate for rapid spore germination and epidemic spread
  30: 0, // They reduce plant water loss through stomatal resistance or reflective coatings without totally halting photosynthesis
  31: 0, // Wind speed (< 10-15 km/h to avoid drift) and rain probability within next 4-6 hours (rainfastness)
  32: 0, // Creating light evening smoke smudges (smoke blanket) and running light micro-sprinkler irrigation at dawn
  33: 0, // Younger single seedlings (8-12 days), wider square spacing, mechanical weeding, and alternate wetting & drying saving 30-40% water
  34: 0, // Pressure Compensating (PC) Emitters
  35: 0, // Fungicide first → Insecticide second → Rhizobium Biofertilizer third
  36: 0, // Between 12% and 14%
  37: 0, // Dhaincha (Sesbania aculeata) / Sunnhemp (Crotalaria juncea)
  38: 0, // Direct sowing of wheat into rice residue without burning straw, saving diesel, soil organic carbon, and time
  39: 0, // To remove male inflorescences from female parent rows to prevent self-pollination and ensure cross-hybridization
  40: 0, // Purdue Improved Crop Storage (PICS) multi-layer hermetic bags
  41: 0, // Review the farmer’s live GPS location, crop telemetry, and immediate issue description, then initiate an urgent audio/video consultation or dispatch verified guidance
  42: 1, // It synthesizes multimodal visual diagnostic insights, rapid weather correlations, and scientific agronomic reasoning to provide verified decision support for the adviser
  43: 0, // To securely pair a farmer’s or scout’s smartphone camera to an adviser’s workstation for real-time high-resolution field inspection via WebRTC
  44: 0, // Coordinates are stored encrypted and only shared with authorized advisers during active consultations when the farmer has live sharing toggled ON
  45: 0, // Validate AI suggestions against local seed availability, market Mandi trends, farmer capital, and real-time field microclimate before final confirmation
  46: 0, // Speak respectfully in the farmer’s chosen regional language, using simple actionable terms rather than confusing chemical jargon
  47: 0, // Recommend approved chemical labels strictly within CIB&RC safety dosages, prioritizing eco-friendly IPM/biocontrols first and emphasizing Waiting Periods (PHI) before harvest
  48: 0, // Historical soil test records, previous disease outbreaks, past crop rotations, and specific advisory notes tailored to that unique farmer ID
  49: 0, // Switch to high-compression audio mode or request a still photo capture with the QR Field Scout tool to inspect close-up leaf symptoms reliably
  50: 0  // 25 out of 50 (50%)
};

export const PASSING_SCORE_THRESHOLD = 25;
export const TOTAL_QUESTIONS_COUNT = 50;

export interface AssessmentScoringResult {
  score: number;
  total: number;
  percentage: number;
  isEligible: boolean;
  status: 'NOT_ELIGIBLE' | 'PENDING_ADMIN_REVIEW';
  title: string;
  message: string;
  categoryBreakdown: Record<string, { correct: number; total: number }>;
}

export function scoreAdviserAssessment(submittedAnswers: Record<number | string, number>): AssessmentScoringResult {
  let score = 0;
  const categoryBreakdown: Record<string, { correct: number; total: number }> = {
    'Crop Knowledge & Lifecycle': { correct: 0, total: 8 },
    'Soil Health & Nutrition': { correct: 0, total: 8 },
    'Pest & Disease Diagnostics': { correct: 0, total: 8 },
    'Climate & Weather Risk': { correct: 0, total: 8 },
    'Agronomy & Farm Operations': { correct: 0, total: 8 },
    'CroperX Platform & Farmer Care': { correct: 0, total: 10 }
  };

  const getCategoryForId = (id: number): string => {
    if (id <= 8) return 'Crop Knowledge & Lifecycle';
    if (id <= 16) return 'Soil Health & Nutrition';
    if (id <= 24) return 'Pest & Disease Diagnostics';
    if (id <= 32) return 'Climate & Weather Risk';
    if (id <= 40) return 'Agronomy & Farm Operations';
    return 'CroperX Platform & Farmer Care';
  };

  for (let i = 1; i <= TOTAL_QUESTIONS_COUNT; i++) {
    const userAns = submittedAnswers[i] !== undefined ? Number(submittedAnswers[i]) : Number(submittedAnswers[String(i)]);
    const expected = ADVISER_ASSESSMENT_MASTER_KEY[i];
    const cat = getCategoryForId(i);

    if (userAns === expected) {
      score++;
      if (categoryBreakdown[cat]) {
        categoryBreakdown[cat].correct++;
      }
    }
  }

  const percentage = Math.round((score / TOTAL_QUESTIONS_COUNT) * 100);
  const isEligible = score >= PASSING_SCORE_THRESHOLD;

  const status = isEligible ? 'PENDING_ADMIN_REVIEW' : 'NOT_ELIGIBLE';
  const title = isEligible ? 'Application Under Review' : 'Assessment Completed';
  const message = isEligible
    ? `Congratulations. You achieved an authoritative score of ${score}/50 (${percentage}%). Your CroperX Adviser application has been submitted for Admin verification. Please wait while your profile is reviewed.`
    : `Thank you for completing the CroperX Adviser Assessment. Your score of ${score}/50 (${percentage}%) does not currently meet the minimum verification requirement of 25 out of 50.`;

  return {
    score,
    total: TOTAL_QUESTIONS_COUNT,
    percentage,
    isEligible,
    status,
    title,
    message,
    categoryBreakdown
  };
}

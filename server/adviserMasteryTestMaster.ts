// Server-Side Master Key & Authoritative Scoring Engine for CroperX Adviser Final Mastery Test

export interface MasteryQuestionPublic {
  id: number;
  moduleRef: string;
  question: string;
  options: string[];
}

export const ADVISER_MASTERY_QUESTIONS: MasteryQuestionPublic[] = [
  {
    id: 1,
    moduleRef: 'mod-01-welcome',
    question: 'What is the primary mission of the CroperX 2.0 platform ecosystem?',
    options: [
      'Selling commercial agricultural land at auction',
      'Connecting smallholder farmers with low-latency AI intelligence, multi-modal diagnostic tools, and verified human agronomist advisory',
      'Manufacturing heavy industrial tractors',
      'Automating all farm labor without human involvement'
    ]
  },
  {
    id: 2,
    moduleRef: 'mod-02-farmer-dashboard',
    question: 'How does "Farmer Memory" enhance longitudinal consultation quality?',
    options: [
      'It preserves multi-season soil test trends, prior disease outbreaks, and past advisory notes to maintain contextual continuity',
      'It records personal passwords',
      'It sends automated sales spam every morning',
      'It deletes all historical records after 24 hours'
    ]
  },
  {
    id: 3,
    moduleRef: 'mod-03-ai-intelligence',
    question: 'Which AI model in CroperX’s multi-model consensus provides ultra-fast sub-second conversational synthesis and low-latency voice translation?',
    options: ['Groq (Llama-3.3-70B)', 'Random Number Generator', 'Basic Calculator', 'Offline Spellchecker']
  },
  {
    id: 4,
    moduleRef: 'mod-03-ai-intelligence',
    question: 'What role does DeepSeek-R1 Distill play in the CroperX AI Agronomy Engine?',
    options: [
      'Scientific cross-verification, agronomic reasoning, and dosage safety consensus',
      'Generating cartoon avatar animations',
      'Playing background elevator music',
      'Replacing the human agronomist completely'
    ]
  },
  {
    id: 5,
    moduleRef: 'mod-04-crop-prediction',
    question: 'How many simultaneous environmental and soil telemetry dimensions are evaluated by CroperX’s Crop Prediction Engine?',
    options: ['3 dimensions', '7 dimensions', '22 parameters including NPK, pH, moisture, climate, and topography', '100 dimensions']
  },
  {
    id: 6,
    moduleRef: 'mod-05-crop-diagnostics',
    question: 'Under Integrated Pest Management (IPM) guidelines, when should chemical pesticides be prescribed?',
    options: [
      'Immediately at first sight of any insect regardless of population',
      'As a targeted, safety-compliant last resort after preventive cultural and biological controls have been evaluated',
      'Never under any circumstances even if the entire crop is lost',
      'At 10 times the recommended bottle dosage'
    ]
  },
  {
    id: 7,
    moduleRef: 'mod-06-farmer-chat',
    question: 'Why does the CroperX Farmer Chat provide bidirectional audio notes with real-time transcription?',
    options: [
      'To enable illiterate or regional-speaking farmers to articulate field challenges naturally without typing barriers',
      'To increase network data usage',
      'To restrict conversations to English only',
      'To disguise the adviser’s identity'
    ]
  },
  {
    id: 8,
    moduleRef: 'mod-07-video-consultation',
    question: 'What is the recommended troubleshooting step if high-definition WebRTC video freezes due to remote field cellular constraints?',
    options: [
      'Maintain the voice audio stream and instruct the farmer to capture still macro photo snapshots for inspection',
      'Hang up and cancel the farmer’s account',
      'Tell the farmer to dig up their fiber optic cable',
      'Wait in silence for two hours'
    ]
  },
  {
    id: 9,
    moduleRef: 'mod-08-gps-presence',
    question: 'When should an adviser toggle their live presence status to "Busy" or "Offline"?',
    options: [
      'Only when on annual vacation',
      'Whenever actively engaged in deep consultation, field trials, or off-duty to manage farmer queue expectations',
      'Never; advisers must appear available 24 hours a day',
      'Whenever opening a web browser'
    ]
  },
  {
    id: 10,
    moduleRef: 'mod-09-emergency-sos',
    question: 'What information does an Emergency SOS alert convey to the adviser workstation?',
    options: [
      'Exact GPS location, crop type, urgency level, distress voice note, and acute hazard description',
      'A generic notification with zero location data',
      'A coupon code for tractor parts',
      'A request to join a webinar'
    ]
  },
  {
    id: 11,
    moduleRef: 'mod-10-field-scout',
    question: 'How does a farmer pair their smartphone camera with an adviser’s workstation using QR Field Scout?',
    options: [
      'By scanning a secure single-use QR code with their mobile camera to open an instant browser WebRTC stream (no app install required)',
      'By mailing their physical phone to the agronomist office',
      'By installing three separate desktop emulators',
      'By entering their credit card number'
    ]
  },
  {
    id: 12,
    moduleRef: 'mod-11-multilingual-assistance',
    question: 'How many regional Indian languages are natively supported across the CroperX interface and voice assistant?',
    options: ['1 language (English only)', '8 languages (English, Hindi, Punjabi, Telugu, Tamil, Marathi, Bengali, Kannada)', '2 languages (English & Spanish)', '50 languages']
  },
  {
    id: 13,
    moduleRef: 'mod-12-professional-responsibility',
    question: 'What is CroperX’s policy regarding unverified guesswork or fabricated advisory prescriptions?',
    options: [
      'Zero tolerance: All advice must be evidence-based, safety-compliant with CIB&RC standards, and accountable via audit logs',
      'Guesswork is encouraged to maintain fast call closure',
      'Fabricating chemical mixtures is acceptable if the farmer is impatient',
      'Advisers are free from all accountability'
    ]
  },
  {
    id: 14,
    moduleRef: 'mod-12-professional-responsibility',
    question: 'What must an adviser do regarding the Pre-Harvest Interval (PHI) when recommending any chemical fungicide or insecticide?',
    options: [
      'Clearly explain the mandatory waiting period between spraying and safe harvest to protect human food safety and avoid chemical residues',
      'Tell the farmer to harvest immediately after spraying',
      'Ignore PHI warnings completely',
      'Only mention PHI if the farmer asks specifically'
    ]
  },
  {
    id: 15,
    moduleRef: 'mod-08-gps-presence',
    question: 'How is farmer GPS location privacy protected on CroperX?',
    options: [
      'Coordinates are stored securely and only accessible to verified advisers during active, farmer-consented sessions',
      'Coordinates are published to public search engines',
      'GPS data is sold to commercial seed dealers',
      'Coordinates are broadcast over radio frequencies'
    ]
  }
];

export const ADVISER_MASTERY_MASTER_KEY: Record<number, number> = {
  1: 1,  // Connecting smallholder farmers...
  2: 0,  // It preserves multi-season soil test trends...
  3: 0,  // Groq (Llama-3.3-70B)
  4: 0,  // Scientific cross-verification...
  5: 2,  // 22 parameters...
  6: 1,  // As a targeted, safety-compliant last resort...
  7: 0,  // To enable illiterate or regional-speaking farmers...
  8: 0,  // Maintain the voice audio stream and instruct...
  9: 1,  // Whenever actively engaged in deep consultation...
  10: 0, // Exact GPS location, crop type, urgency level...
  11: 0, // By scanning a secure single-use QR code...
  12: 1, // 8 languages...
  13: 0, // Zero tolerance: All advice must be evidence-based...
  14: 0, // Clearly explain the mandatory waiting period...
  15: 0  // Coordinates are stored securely...
};

export const MASTERY_PASSING_THRESHOLD = 12; // 12/15 = 80%
export const MASTERY_TOTAL_QUESTIONS = 15;

export interface MasteryScoringResult {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  message: string;
}

export function scoreAdviserMasteryTest(submittedAnswers: Record<number | string, number>): MasteryScoringResult {
  let score = 0;
  for (let i = 1; i <= MASTERY_TOTAL_QUESTIONS; i++) {
    const userAns = submittedAnswers[i] !== undefined ? Number(submittedAnswers[i]) : Number(submittedAnswers[String(i)]);
    const expected = ADVISER_MASTERY_MASTER_KEY[i];
    if (userAns === expected) {
      score++;
    }
  }

  const percentage = Math.round((score / MASTERY_TOTAL_QUESTIONS) * 100);
  const passed = score >= MASTERY_PASSING_THRESHOLD;
  const message = passed
    ? `Congratulations! You passed the CroperX Adviser Mastery Assessment with a score of ${score}/${MASTERY_TOTAL_QUESTIONS} (${percentage}%). Your certified Adviser Workstation has been unlocked!`
    : `You achieved a score of ${score}/${MASTERY_TOTAL_QUESTIONS} (${percentage}%). The passing threshold is ${MASTERY_PASSING_THRESHOLD}/${MASTERY_TOTAL_QUESTIONS} (80%). Please review the course modules and retake the test.`;

  return {
    score,
    total: MASTERY_TOTAL_QUESTIONS,
    percentage,
    passed,
    message
  };
}

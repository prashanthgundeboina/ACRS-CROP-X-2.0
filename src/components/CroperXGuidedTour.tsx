import React, { useState, useEffect, useRef } from 'react';
import { Compass, Volume2, VolumeX, ChevronRight, ChevronLeft, CheckCircle2, Sparkles, X, Play, RotateCcw } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: string;
  onNavigateTab?: (tab: string) => void;
}

interface TourStep {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  voicePrompt: Record<string, string>;
  targetTab?: string;
  highlightText: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'intro',
    title: {
      en: 'Welcome to CroperX Precision AI',
      hi: 'क्रोपरएक्स प्रिसिजन एआई में आपका स्वागत है',
      te: 'క్రోపర్ ఎక్స్ ప్రెసిషన్ AI కి స్వాగతం',
      ta: 'க்ரோபர்எக்ஸ் துல்லிய AI க்கு நல்வரவு',
      mr: 'क्रोपरएक्स प्रिसिजन एआय मध्ये आपले स्वागत आहे',
      bn: 'ক্রোপারএক্স প্রিসিশন এআই-তে স্বাগতম'
    },
    description: {
      en: 'CroperX is your 22-parameter machine learning crop recommender and precision farming assistant. Let us guide you through the process step by step!',
      hi: 'क्रोपरएक्स आपका 22-पैरामीटर मशीन लर्निंग फसल सिफारिशकर्ता और सटीक कृषि सहायक है। आइए हम आपको कदम दर कदम समझाते हैं!',
      te: 'క్రోపర్ ఎక్స్ మీ 22-పారామీటర్ మెషిన్ లెర్నింగ్ పంట సిఫార్సు సహాయకుడు. మీకు దశలవారీగా వివరిస్తాము!',
      ta: 'க்ரோபர்எக்ஸ் உங்கள் 22-அளவுரு மெஷின் லேர்னிங் பயிர் ஆலோசகர். படி படியாக வழிகாட்டுகிறோம்!',
      mr: 'क्रोपरएक्स हा आपला २२-पॅरामीटर मशीन लर्निंग पीक सल्लागार आहे. चला तुम्हाला टप्प्याटप्प्याने मार्गदर्शित करूया!',
      bn: 'ক্রোপারএক্স আপনার ২২-প্যারামিটার মেশিন লার্নিং ফসল সুপারিশকারী ও নির্ভুল কৃষি সহায়ক।'
    },
    voicePrompt: {
      en: 'Welcome to CroperX! I am your AI agronomist. I will walk you through setting up soil telemetry and predicting top crop suitability.',
      hi: 'क्रोपरएक्स में आपका स्वागत है! मैं आपका एआई कृषि वैज्ञानिक हूँ। मैं आपको मिट्टी के मापदंडों को सेट करने और फसल पूर्वानुमान की प्रक्रिया समझाऊंगा।',
      te: 'క్రోపర్ ఎక్స్‌కి స్వాగతం! నేను మీ AI వ్యవసాయ నిపుణుడిని. మట్టి పారామితులు మరియు పంట అంచనా ప్రాసెస్‌ను వివరిస్తాను.',
      ta: 'க்ரோபர்எக்ஸ் -க்கு நல்வரவு! நான் உங்கள் AI விவசாய ஆலோசகர். மண் அளவுருக்கள் மற்றும் பயிர் கணிப்பு முறைகளை விளக்குகிறேன்.',
      mr: 'क्रोपरएक्स मध्ये आपले स्वागत आहे! मी आपला एआय कृषी तज्ञ आहे. मातीचे घटक आणि पीक अंदाज प्रक्रिया समजून घेऊया.',
      bn: 'ক্রোপারএক্স-এ স্বাগতম! আমি আপনার এআই কৃষিবিদ। মাটি নির্ধারণ ও ফসল পূর্বাভাসের প্রতিটি ধাপ ব্যাখ্যা করছি।'
    },
    highlightText: 'Overview & Capabilities'
  },
  {
    id: 'telemetry_input',
    title: {
      en: 'Step 1: Soil Telemetry Input',
      hi: 'चरण 1: मिट्टी के पोषक तत्व और जलवायु मापदंड',
      te: 'దశ 1: నేల పోషకాలు మరియు వాతావరణ సమాచారం',
      ta: 'படி 1: மண் ஊட்டச்சத்துக்கள் மற்றும் காலநிலை',
      mr: 'टप्पा १: मातीतील घटक आणि हवामान नोंदी',
      bn: 'ধাপ ১: মাটির উপাদান ও জলবায়ু পরামিতি'
    },
    description: {
      en: 'Adjust the sliders for Nitrogen (N), Phosphorus (P), Potassium (K), Soil pH, Moisture, Rainfall, and Temperature in the left parameter panel.',
      hi: 'बाएं पैनल में नाइट्रोजन, फॉस्फोरस, पोटेशियम, मिट्टी का पीएच, नमी, वर्षा और तापमान के स्लाइडर को समायोजित करें।',
      te: 'ఎడమ వైపు ప్యానెల్‌లో నత్రజని, భాస్వరం, పొటాషియం, నేల pH, తేమ, వర్షపాతం స్లైడర్‌లను సర్దుబాటు చేయండి.',
      ta: 'இடது பேனலில் நைட்ரஜன், பாஸ்பரஸ், பொட்டாசியம், மண் pH, மழைப்பொழிவு மற்றும் வெப்பநிலையை மாற்றவும்.',
      mr: 'डाव्या पॅनेलमध्ये नायट्रोजन, फॉस्फरस, पोटॅशियम, मातीचा पीएच, ओलावा आणि पावसाचे प्रमाण सेट करा.',
      bn: 'বাম প্যানেলে নাইট্রোজেন, ফসফরাস, পটাশিয়াম, পিএইচ, আর্দ্রতা ও বৃষ্টিপাতের মান সামঞ্জস্য করুন।'
    },
    voicePrompt: {
      en: 'Step 1: On the left panel, input your soil N, P, K nutrient values, soil pH, and local weather details.',
      hi: 'चरण 1: बाएं पैनल पर अपनी मिट्टी के नाइट्रोजन, फास्फोरस, पोटेशियम, पीएच और मौसम का विवरण दर्ज करें।',
      te: 'దశ 1: ఎడమ ప్యానెల్‌లో నేల N, P, K విలువలు మరియు pH నమోదు చేయండి.',
      ta: 'படி 1: இடது பேனலில் மண் ஊட்டச்சத்து அளவுகள் மற்றும் pH -ஐ உள்ளிடவும்.',
      mr: 'टप्पा १: डाव्या बाजूला आपल्या मातीचे एन पी के प्रमाण आणि पीएच प्रविष्ट करा.',
      bn: 'ধাপ ১: বাম প্যানেলে আপনার মাটির এনপিকে মান ও পিএইচ তথ্য দিন।'
    },
    targetTab: 'recommendation',
    highlightText: 'Left Parameter Sidebar'
  },
  {
    id: 'run_prediction',
    title: {
      en: 'Step 2: Execute Machine Learning Prediction',
      hi: 'चरण 2: मशीन लर्निंग प्रेडिक्शन मॉडल चलाएं',
      te: 'దశ 2: మెషిన్ లెర్నింగ్ ప్రిడిక్షన్ మోడల్ రన్ చేయండి',
      ta: 'படி 2: மெஷின் லேர்னிங் கணிப்பு மாதிரியை இயக்கம்',
      mr: 'टप्पा २: मशीन लर्निंग प्रेडिक्शन मॉडेल चालवा',
      bn: 'ধাপ ২: মেশিন লার্নিং প্রেডিকশন চালান'
    },
    description: {
      en: 'Click the green "Run Prediction Model" button. The KNN & Random Forest ML pipeline will cross-reference 22 agronomic attributes.',
      hi: 'हरे रंग के "फसल पूर्वानुमान मॉडल चलाएं" बटन पर क्लिक करें। मॉडल 22 मापदंडों का विश्लेषण करके परिणाम देगा।',
      te: 'పచ్చటి "రన్ ప్రిడిక్షన్ మోడల్" బటన్‌పై క్లిక్ చేయండి.',
      ta: 'பச்சை நிற "ரான் பிரடிக்‌ஷன் மாடல்" பொத்தானைக் கிளிக் செய்யவும்.',
      mr: 'हिरव्या रंगाच्या "रन प्रेडिक्शन मॉडेल" बटणावर क्लिक करा.',
      bn: 'সবুজ "রান প্রেডিকশন মডেল" বোতামে ক্লিক করুন।'
    },
    voicePrompt: {
      en: 'Step 2: Press the green Run Prediction Model button to evaluate crop suitability scores.',
      hi: 'चरण 2: फसल उपयुक्तता स्कोर की गणना के लिए हरे रंग के रन प्रेडिक्शन मॉडल बटन को दबाएं।',
      te: 'దశ 2: పంట అనుకూలతను గణించడానికి రన్ ప్రిడిక్షన్ మోడల్ బటన్ నొక్కండి.',
      ta: 'படி 2: பயிர் பொருத்தத்தை கணக்கிட பிரடிக்‌ஷன் மாடல் பொத்தானை அழுத்தவும்.',
      mr: 'टप्पा २: पिकाची उपयुक्तता तपासण्यासाठी हिरवे बटण दाबा.',
      bn: 'ধাপ ২: ফসলের উপযোগীতা বিশ্লেষণ করতে সবুজ প্রেডিকশন বোতামে চাপ দিন।'
    },
    targetTab: 'recommendation',
    highlightText: 'Green Action Button'
  },
  {
    id: 'results_and_tools',
    title: {
      en: 'Step 3: Review Results & Smart Tools',
      hi: 'चरण 3: फसल परिणाम और कृषि उपकरण समीक्षा',
      te: 'దశ 3: ఫలితాలు మరియు వ్యవసాయ పరికరాలు',
      ta: 'படி 3: முடிவுகள் மற்றும் விவசாய கருவிகள்',
      mr: 'टप्पा ३: निकाल आणि स्मार्ट कृषी साधने',
      bn: 'ধাপ ৩: ফলাফল ও স্মার্ট কৃষি টুলস'
    },
    description: {
      en: 'Explore top crop cards, suitability percentages, N-P-K fertilizer recommendations, disease diagnostics, weather alerts, and the CroperX Live Call agent!',
      hi: 'शीर्ष फसल कार्ड, उपयुक्तता प्रतिशत, उर्वरक कैलकुलेटर, बीमारी निदान और क्रोपरएक्स लाइव कॉल का उपयोग करें!',
      te: 'ఉత్తమ పంట కార్డులు, ఎరువుల క్యాలిక్యులేటర్, తెగుళ్ళ గుర్తింపు మరియు క్రోపర్ ఎక్స్ కాల్ ఉపయోగించండి!',
      ta: 'சிறந்த பயிர் அட்டவணைகள், உரக் கணக்கீடு, நோய் கண்டறிதல் மற்றும் க்ரோபர்எக்ஸ் அழைப்பை பயன்படுத்தவும்!',
      mr: 'पिकांचे निकाल, खत कॅल्क्युलेटर, रोग निदान आणि क्रोपरएक्स कॉलचा वापर करा!',
      bn: 'সেরা ফসল কার্ড, সার ক্যালকুলেটর, রোগ শনাক্তকরণ এবং ক্রোপারএক্স কল সুবিধা এক্সপ্লোর করুন!'
    },
    voicePrompt: {
      en: 'Step 3: Excellent! Review top recommended crops, suitability confidence, and switch tabs for Fertilizer Calculator, Disease Diagnostics, and Live Call Mode.',
      hi: 'चरण 3: बहुत बढ़िया! शीर्ष अनुशंसित फसलों की समीक्षा करें और उर्वरक कैलकुलेटर व बीमारी निदान टैब का उपयोग करें।',
      te: 'దశ 3: అద్భుతం! సిఫార్సు చేయబడిన పంటలు, ఎరువుల క్యాలిక్యులేటర్ మరియు తెగుళ్ళ నిర్ధారణ తనిఖీ చేయండి.',
      ta: 'படி 3: அற்புதம்! பரிந்துரைக்கப்பட்ட பயிர்கள், உரக் கணக்கீடு மற்றும் நோய் கண்டறிதலைப் பயன்படுத்தவும்.',
      mr: 'टप्पा ३: उत्तम! शिफारस केलेली पिके, खत कॅल्क्युलेटर आणि रोग निदान तपासा.',
      bn: 'ধাপ ৩: দারুণ! সুপারিশকৃত ফসল, সার ক্যালকুলেটর ও রোগ নির্ণয় টুল ব্যবহার করে দেখুন।'
    },
    targetTab: 'recommendation',
    highlightText: 'Navigation Tabs & Live Call'
  }
];

export const CroperXGuidedTour: React.FC<Props> = ({
  isOpen,
  onClose,
  currentLanguage,
  onNavigateTab
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const activeLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  const step = TOUR_STEPS[currentStepIndex];

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    if (isOpen) {
      speakCurrentStep();
    } else {
      if (synthRef.current) synthRef.current.cancel();
      setIsSpeaking(false);
    }

    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, [isOpen, currentStepIndex, currentLanguage]);

  const speakCurrentStep = () => {
    if (!synthRef.current || !isOpen) return;
    synthRef.current.cancel();

    const textToSpeak = step.voicePrompt[currentLanguage] || step.voicePrompt.en;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = activeLangObj.speechLang;
    utterance.rate = 0.95;

    const voices = synthRef.current.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(activeLangObj.code) || v.lang.includes(activeLangObj.code));
    if (matchedVoice) utterance.voice = matchedVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);

    if (step.targetTab && onNavigateTab) {
      onNavigateTab(step.targetTab);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-[#122315] border-2 border-[#4CAF50] rounded-3xl shadow-2xl overflow-hidden p-6 text-white relative">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#4CAF50] p-0.5 flex items-center justify-center text-[#122315]">
              <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: '10s' }} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase bg-amber-400 text-[#122315] px-2 py-0.5 rounded-full">
                Guided Audio Tour
              </span>
              <h3 className="font-serif italic font-bold text-lg text-white">CroperX Walkthrough</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {TOUR_STEPS.map((s, idx) => (
            <div
              key={s.id}
              className={`h-2 rounded-full transition-all ${
                idx === currentStepIndex
                  ? 'w-8 bg-[#4CAF50]'
                  : idx < currentStepIndex
                  ? 'w-2 bg-emerald-400'
                  : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-4 text-center py-2">
          <span className="text-xs font-mono text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
            Step {currentStepIndex + 1} of {TOUR_STEPS.length}: {step.highlightText}
          </span>

          <h2 className="font-serif italic text-xl md:text-2xl text-emerald-200 font-bold">
            {step.title[currentLanguage] || step.title.en}
          </h2>

          <p className="text-sm text-emerald-100/90 leading-relaxed font-sans max-w-md mx-auto">
            {step.description[currentLanguage] || step.description.en}
          </p>

          {/* Voice Prompt Box */}
          <div className="bg-black/30 border border-[#4CAF50]/40 p-3 rounded-2xl flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2">
              <Sparkles className={`w-5 h-5 text-amber-300 ${isSpeaking ? 'animate-bounce' : ''}`} />
              <p className="text-xs text-amber-200 italic font-serif">
                "{step.voicePrompt[currentLanguage] || step.voicePrompt.en}"
              </p>
            </div>
            <button
              onClick={speakCurrentStep}
              className="p-2 bg-[#4CAF50]/20 hover:bg-[#4CAF50]/40 text-emerald-300 rounded-xl shrink-0"
              title="Replay Step Speech"
            >
              {isSpeaking ? <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-2xl font-bold text-xs flex items-center gap-1 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <button
            onClick={handleNext}
            className="px-5 py-2.5 bg-gradient-to-r from-[#4CAF50] to-[#2e7d32] text-white rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-900/50 hover:scale-105 transition-all"
          >
            {currentStepIndex === TOUR_STEPS.length - 1 ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-amber-300" /> Finish Tour
              </>
            ) : (
              <>
                Next Step <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

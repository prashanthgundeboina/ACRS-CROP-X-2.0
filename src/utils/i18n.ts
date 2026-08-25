export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  speechLang: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇮🇳', speechLang: 'en-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳', speechLang: 'hi-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', speechLang: 'te-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', speechLang: 'ta-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', speechLang: 'kn-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', speechLang: 'mr-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', speechLang: 'bn-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', speechLang: 'gu-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', speechLang: 'pa-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', speechLang: 'ml-IN' },
];

export interface TranslationDict {
  appName: string;
  agentName: string;
  agentSubtitle: string;
  runPrediction: string;
  explainRecommendation: string;
  speakToCroperX: string;
  stopSpeaking: string;
  listening: string;
  soilNutrients: string;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  temperature: string;
  rainfall: string;
  humidity: string;
  soilPh: string;
  soilMoisture: string;
  recommendedCrops: string;
  suitabilityScore: string;
  farmingTips: string;
  cropRotation: string;
  idealConditions: string;
  environmentalInsight: string;
  exportPdf: string;
  voiceActive: string;
  selectLanguage: string;
}

export const TRANSLATIONS: Record<string, TranslationDict> = {
  en: {
    appName: "CroperX Agriculture Assistant",
    agentName: "CroperX AI Agent",
    agentSubtitle: "Voice & Multilingual Agronomist",
    runPrediction: "Run Prediction Model",
    explainRecommendation: "Explain Recommendation",
    speakToCroperX: "Speak to CroperX",
    stopSpeaking: "Stop Speaking",
    listening: "Listening...",
    soilNutrients: "Soil Nutrients",
    nitrogen: "Nitrogen (N)",
    phosphorus: "Phosphorus (P)",
    potassium: "Potassium (K)",
    temperature: "Temperature (°C)",
    rainfall: "Rainfall (mm)",
    humidity: "Humidity (%)",
    soilPh: "Soil pH",
    soilMoisture: "Soil Moisture",
    recommendedCrops: "Top Crop Recommendations",
    suitabilityScore: "Suitability Score",
    farmingTips: "Actionable Farming Tips",
    cropRotation: "Futuristic Crop Rotation",
    idealConditions: "Ideal Growing Conditions",
    environmentalInsight: "Agronomic Environmental Telemetry Insight",
    exportPdf: "Export PDF Report",
    voiceActive: "CroperX Voice Active",
    selectLanguage: "Select Language"
  },
  hi: {
    appName: "क्रोपरएक्स कृषि सहायक",
    agentName: "क्रोपरएक्स एआई एजेंट",
    agentSubtitle: "वॉइस और बहुभाषी कृषि विशेषज्ञ",
    runPrediction: "फसल पूर्वानुमान मॉडल चलाएं",
    explainRecommendation: "फसल सिफारिश की व्याख्या सुनें",
    speakToCroperX: "क्रोपरएक्स से बोलकर बात करें",
    stopSpeaking: "बोलना बंद करें",
    listening: "आपकी आवाज सुन रहे हैं...",
    soilNutrients: "मिट्टी के पोषक तत्व",
    nitrogen: "नाइट्रोजन (N)",
    phosphorus: "फॉस्फोरस (P)",
    potassium: "पोटेशियम (K)",
    temperature: "तापमान (°C)",
    rainfall: "वर्षा (मिमी)",
    humidity: "आर्द्रता (%)",
    soilPh: "मिट्टी का पीएच",
    soilMoisture: "मिट्टी की नमी",
    recommendedCrops: "सर्वश्रेष्ठ अनुशंसित फसलें",
    suitabilityScore: "उपयुक्तता स्कोर",
    farmingTips: "कृषि सलाह और सुझाव",
    cropRotation: "फसल चक्र रणनीति",
    idealConditions: "आदर्श विकास स्थितियां",
    environmentalInsight: "पर्यावरण और मिट्टी स्वास्थ्य समीक्षा",
    exportPdf: "पीडीएफ रिपोर्ट डाउनलोड करें",
    voiceActive: "क्रोपरएक्स वॉइस सक्रिय",
    selectLanguage: "भाषा चुनें"
  },
  te: {
    appName: "క్రోపర్ ఎక్స్ వ్యవసాయ సహాయకుడు",
    agentName: "క్రోపర్ ఎక్స్ AI ఏజెంట్",
    agentSubtitle: "వాయిస్ & బహుభాషా వ్యవసాయ నిపుణుడు",
    runPrediction: "పంట అంచనా మోడల్‌ను ప్రారంభించండి",
    explainRecommendation: "పంట సిఫార్సు వివరణ వినండి",
    speakToCroperX: "క్రోపర్ ఎక్స్‌తో మాట్లాడండి",
    stopSpeaking: "మాట్లాడటం ఆపండి",
    listening: "వింటున్నాను...",
    soilNutrients: "నేల పోషకాలు",
    nitrogen: "నత్రజని (N)",
    phosphorus: "భాస్వరం (P)",
    potassium: "పొటాషియం (K)",
    temperature: "ఉష్ణోగ్రత (°C)",
    rainfall: "వర్షపాతం (mm)",
    humidity: "తమ్మదనం (%)",
    soilPh: "నేల pH",
    soilMoisture: "నేల తేమ",
    recommendedCrops: "ఉత్తమ పంట సిఫార్సులు",
    suitabilityScore: "అనుకూలత స్కోర్",
    farmingTips: "వ్యవసాయ సూచనలు",
    cropRotation: "పంట మార్పిడి ప్రణాళిక",
    idealConditions: "అనుకూల ఎదుగుదల పరిస్థితులు",
    environmentalInsight: "పర్యావరణ మరియు నేల విశ్లేషణ",
    exportPdf: "PDF రిపోర్ట్ డౌన్‌లోడ్",
    voiceActive: "క్రోపర్ ఎక్స్ వాయిస్ సక్రియం",
    selectLanguage: "భాషను ఎంచుకోండి"
  },
  ta: {
    appName: "க்ரோபர்எக்ஸ் விவசாய உதவியாளர்",
    agentName: "க்ரோபர்எக்ஸ் AI ஏஜென்ட்",
    agentSubtitle: "குரல் மற்றும் பன்மொழி வேளாண் நிபுணர்",
    runPrediction: "பயிர் கணிப்பு மாதிரியை இயக்கம்",
    explainRecommendation: "பயிர் பரிந்துரை விளக்கத்தைக் கேட்கவும்",
    speakToCroperX: "க்ரோபர்எக்ஸ் உடன் பேசவும்",
    stopSpeaking: "பேசுவதை நிறுத்து",
    listening: "கேட்கிறது...",
    soilNutrients: "மண் ஊட்டச்சத்துக்கள்",
    nitrogen: "நைட்ரஜன் (N)",
    phosphorus: "பாஸ்பரஸ் (P)",
    potassium: "பொட்டாசியம் (K)",
    temperature: "வெப்பநிலை (°C)",
    rainfall: "மழைப்பொழிவு (mm)",
    humidity: "ஈரப்பதம் (%)",
    soilPh: "மண் pH",
    soilMoisture: "மண் ஈரப்பதம்",
    recommendedCrops: "சிறந்த பயிர் பரிந்துரைகள்",
    suitabilityScore: "பொருத்தமான மதிப்பெண்",
    farmingTips: "விவசாய ஆலோசனைகள்",
    cropRotation: "பயிர் சுழற்சி திட்டம்",
    idealConditions: "சிறந்த வளர்ச்சி நிலைகள்",
    environmentalInsight: "சுற்றுச்சூழல் மற்றும் மண் ஆரோக்கியம்",
    exportPdf: "PDF அறிக்கை பதிவிறக்கம்",
    voiceActive: "க்ரோபர்எக்ஸ் குரல் செயல்படுகிறது",
    selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்"
  },
  kn: {
    appName: "ಕ್ರೋಪರ್ ಎಕ್ಸ್ ಕೃಷಿ ಸಹಾಯಕ",
    agentName: "ಕ್ರೋಪರ್ ಎಕ್ಸ್ AI ಏಜೆಂಟ್",
    agentSubtitle: "ಧ್ವನಿ ಮತ್ತು ಬಹುಭಾಷಾ ಕೃಷಿ ತಜ್ಞ",
    runPrediction: "ಬೆಳೆ ಮುನ್ಸೂಚನೆ ಮಾದರಿ ಚಾಲನೆ ಮಾಡಿ",
    explainRecommendation: "ಬೆಳೆ ಶಿಫಾರಸು ವಿವರಣೆ ಆಲಿಸಿ",
    speakToCroperX: "ಕ್ರೋಪರ್ ಎಕ್ಸ್ ಜೊತೆ ಮಾತನಾಡಿ",
    stopSpeaking: "ಮಾತನಾಡುವುದನ್ನು ನಿಲ್ಲಿಸಿ",
    listening: "ಆಲಿಸಲಾಗುತ್ತಿದೆ...",
    soilNutrients: "ಮಣ್ಣಿನ ಪೋಷಕಾಂಶಗಳು",
    nitrogen: "ನೈಟ್ರೋಜನ್ (N)",
    phosphorus: "ಫಾಸ್ಫರಸ್ (P)",
    potassium: "ಪೊಟ್ಯಾಸಿಯಮ್ (K)",
    temperature: "ತಾಪಮಾನ (°C)",
    rainfall: "ಮಳೆ ಪ್ರಮಾಣ (mm)",
    humidity: "ಆರ್ದ್ರತೆ (%)",
    soilPh: "ಮಣ್ಣಿನ pH",
    soilMoisture: "ಮಣ್ಣಿನ ತೇವಾಂಶ",
    recommendedCrops: "ಉತ್ತಮ ಬೆಳೆ ಶಿಫಾರಸುಗಳು",
    suitabilityScore: "ಸೂಕ್ತತೆ ಅಂಕ",
    farmingTips: "ಕೃಷಿ ಸಲಹೆಗಳು",
    cropRotation: "ಬೆಳೆ ಪರಿವರ್ತನೆ ಯೋಜನೆ",
    idealConditions: "ಉತ್ತಮ ಬೆಳೆವಣಿಗೆ ಪರಿಸ್ಥಿತಿಗಳು",
    environmentalInsight: "ಪರಿಸರ ಮತ್ತು ಮಣ್ಣಿನ ವಿಶ್ಲೇಷಣೆ",
    exportPdf: "PDF ವರದಿ ಡೌನ್‌ಲೋಡ್",
    voiceActive: "ಕ್ರೋಪರ್ ಎಕ್ಸ್ ಧ್ವನಿ ಸಕ್ರಿಯ",
    selectLanguage: "ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ"
  },
  mr: {
    appName: "क्रोपरएक्स कृषी सहाय्यक",
    agentName: "क्रोपरएक्स एआय एजंट",
    agentSubtitle: "व्हॉइस आणि बहुभाषिक कृषी तज्ञ",
    runPrediction: "पिक अंदाज मॉडेल चालवा",
    explainRecommendation: "पिक शिफारशीचे स्पष्टीकरण ऐका",
    speakToCroperX: "क्रोपरएक्स सोबत बोला",
    stopSpeaking: "बोलणे थांबवा",
    listening: "ऐकत आहे...",
    soilNutrients: "मातीतील पोषक तत्वे",
    nitrogen: "नायट्रोजन (N)",
    phosphorus: "फॉस्फरस (P)",
    potassium: "पोटॅशियम (K)",
    temperature: "तापमान (°C)",
    rainfall: "पाऊस (मिमी)",
    humidity: "आर्द्रता (%)",
    soilPh: "मातीचा पीएच",
    soilMoisture: "मातीतील ओलावा",
    recommendedCrops: "सर्वोत्तम पिक शिफारसी",
    suitabilityScore: "उपयुक्तता गुण",
    farmingTips: "शेतीविषयक महत्वाचा सल्ला",
    cropRotation: "पिक फेरपालट योजना",
    idealConditions: "आदर्श वाढीच्या परिस्थिती",
    environmentalInsight: "पर्यावरण आणि मृदा आरोग्य विश्लेषण",
    exportPdf: "पीडीएफ रिपोर्ट डाऊनलोड करा",
    voiceActive: "क्रोपरएक्स व्हॉइस सक्रिय",
    selectLanguage: "भाषा निवडा"
  },
  bn: {
    appName: "ক্রোপারএক্স কৃষি সহায়ক",
    agentName: "ক্রোপারএক্স এআই এজেন্ট",
    agentSubtitle: "ভয়েস ও বহুভাষিক কৃষি বিশেষজ্ঞ",
    runPrediction: "ফসলের পূর্বাভাস মডেল চালান",
    explainRecommendation: "ফসল সুপারিশের ব্যাখ্যা শুনুন",
    speakToCroperX: "ক্রোপারএক্স-এর সাথে কথা বলুন",
    stopSpeaking: "কথা বলা বন্ধ করুন",
    listening: "শুনছি...",
    soilNutrients: "মাটির পুষ্টি উপাদান",
    nitrogen: "নাইট্রোজেন (N)",
    phosphorus: "ফসফরাস (P)",
    potassium: "পটাশিয়াম (K)",
    temperature: "তাপমাত্রা (°C)",
    rainfall: "বৃষ্টিপাত (মিমি)",
    humidity: "আর্দ্রতা (%)",
    soilPh: "মাটির পিএইচ (pH)",
    soilMoisture: "মাটির আর্দ্রতা",
    recommendedCrops: "সেরা ফসল নম্বর ও সুপারিশ",
    suitabilityScore: "উপযোগিতা স্কোর",
    farmingTips: "কৃষি পরামর্শ ও টিপস",
    cropRotation: "ফসল পর্যায়ক্রম পরিকল্পনা",
    idealConditions: "আদর্শ বৃদ্ধির পরিবেশ",
    environmentalInsight: "পরিবেশ ও মৃত্তিকা পুষ্টি বিশ্লেষণ",
    exportPdf: "পিডিএফ রিপোর্ট ডাউনলোড করুন",
    voiceActive: "ক্রোপারএক্স ভয়েস সক্রিয়",
    selectLanguage: "ভাষা নির্বাচন করুন"
  },
  gu: {
    appName: "ક્રોપરએક્સ કૃષિ સહાયક",
    agentName: "ક્રોપરએક્સ એઆઈ એજન્ટ",
    agentSubtitle: "વોઇસ અને બહુભાષી કૃષિ નિષ્ણાત",
    runPrediction: "પાક આગાહી મોડેલ ચલાવો",
    explainRecommendation: "પાક ભલામણ સ્પષ્ટીકરણ સાંભળો",
    speakToCroperX: "ક્રોપરએક્સ સાથે બોલો",
    stopSpeaking: "બોલવાનું બંધ કરો",
    listening: "સાંભળી રહ્યા છીએ...",
    soilNutrients: "જમીનના પોષક તત્વો",
    nitrogen: "નાઇટ્રોજન (N)",
    phosphorus: "ફોસ્ફરસ (P)",
    potassium: "પોટેશિયમ (K)",
    temperature: "તાપમાન (°C)",
    rainfall: "વરસાદ (મીમી)",
    humidity: "ભેજ (%)",
    soilPh: "જમીન pH",
    soilMoisture: "જમીનનો ભેજ",
    recommendedCrops: "શ્રેષ્ઠ પાક ભલામણો",
    suitabilityScore: "અનુકૂળતા સ્કોર",
    farmingTips: "ખેતીવાડી સલાહ અને ટીપ્સ",
    cropRotation: "પાક ફેરબદલી યોજના",
    idealConditions: "આદર્શ વિકાસ પરિસ્થિતિઓ",
    environmentalInsight: "પર્યાવરણ અને જમીન આરોગ્ય સમીક્ષા",
    exportPdf: "પીડીએફ રિપોર્ટ ડાઉનલોડ કરો",
    voiceActive: "ક્રોપરએક્સ વોઇસ સક્રિય",
    selectLanguage: "ભાષા પસંદ કરો"
  },
  pa: {
    appName: "ਕਰੋਪਰਐਕਸ ਖੇਤੀਬਾੜੀ ਸਹਾਇਕ",
    agentName: "ਕਰੋਪਰਐਕਸ AI ਏਜੰਟ",
    agentSubtitle: "ਵਾਇਸ ਅਤੇ ਬਹੁ-ਭਾਸ਼ਾਈ ਖੇਤੀ ਮਾਹਰ",
    runPrediction: "ਫਸਲ ਭਵਿੱਖਬਾਣੀ ਮਾਡਲ ਚਲਾਓ",
    explainRecommendation: "ਫਸਲ ਦੀ ਸਿਫਾਰਸ਼ ਦੀ ਵਿਆਖਿਆ ਸੁਣੋ",
    speakToCroperX: "ਕਰੋਪਰਐਕਸ ਨਾਲ ਗੱਲ ਕਰੋ",
    stopSpeaking: "ਬੋਲਣਾ ਬੰਦ ਕਰੋ",
    listening: "ਸੁਣ ਰਿਹਾ ਹੈ...",
    soilNutrients: "ਜ਼ਮੀਨ ਦੇ ਪੋਸ਼ਕ ਤੱਤ",
    nitrogen: "ਨਾਇਟ੍ਰੋਜਨ (N)",
    phosphorus: "ਫਾਸਫੋਰਸ (P)",
    potassium: "ਪੋਟਾਸ਼ੀਅਮ (K)",
    temperature: "ਤਾਪਮਾਨ (°C)",
    rainfall: "ਮੀਂਹ (ਮਿ.ਮੀ.)",
    humidity: "ਨਮੀ (%)",
    soilPh: "ਮਿੱਟੀ ਦਾ pH",
    soilMoisture: "ਮਿੱਟੀ ਦੀ ਨਮੀ",
    recommendedCrops: "ਸਭ ਤੋਂ ਵਧੀਆ ਫਸਲਾਂ ਦੀਆਂ ਸਿਫਾਰਸ਼ਾਂ",
    suitabilityScore: "ਢੁਕਵਾਂ ਸਕੋਰ",
    farmingTips: "ਖੇਤੀਬਾੜੀ ਦੀਆਂ ਮਹੱਤਵਪੂਰਨ ਸਲਾਹਾਂ",
    cropRotation: "ਫਸਲੀ ਚੱਕਰ ਯੋਜਨਾ",
    idealConditions: "ਅਨੁਕੂਲ ਵਾਧੇ ਦੀਆਂ ਸਥਿਤੀਆਂ",
    environmentalInsight: "ਵਾਤਾਵਰਣ ਅਤੇ ਮਿੱਟੀ ਦੀ ਸਿਹਤ ਸਮੀਖਿਆ",
    exportPdf: "ਪੀਡੀਐਫ ਰਿਪੋਰਟ ਡਾਊਨਲੋਡ ਕਰੋ",
    voiceActive: "ਕਰੋਪਰਐਕਸ ਵਾਇਸ ਸਰਗਰਮ",
    selectLanguage: "ਭਾਸ਼ਾ ਚੁਣੋ"
  },
  ml: {
    appName: "ക്രോപ്പർഎക്സ് കാർഷിക സഹായി",
    agentName: "ക്രോപ്പർഎക്സ് എഐ ഏജന്റ്",
    agentSubtitle: "വോയ്സ് & ബഹുഭാഷാ കാർഷിക വിദഗ്ദ്ധൻ",
    runPrediction: "വിള പ്രവചന മോഡൽ പ്രവർത്തിപ്പിക്കുക",
    explainRecommendation: "വിള ശുപാർശ വിവരണം കേൾക്കുക",
    speakToCroperX: "ക്രോപ്പർഎക്സിനോട് സംസാരിക്കുക",
    stopSpeaking: "സംസാരം നിർത്തുക",
    listening: "ശ്രദ്ധിക്കുന്നു...",
    soilNutrients: "മണ്ണിലെ പോഷകങ്ങൾ",
    nitrogen: "നൈട്രജൻ (N)",
    phosphorus: "ഫോസ്ഫറസ് (P)",
    potassium: "പൊട്ടാസ്യം (K)",
    temperature: "താപനില (°C)",
    rainfall: "മഴയുടെ അളവ് (mm)",
    humidity: "ഈർപ്പം (%)",
    soilPh: "മണ്ണിന്റെ pH",
    soilMoisture: "മണ്ണിലെ ഈർപ്പം",
    recommendedCrops: "മികച്ച വിള ശുപാർശകൾ",
    suitabilityScore: "അനുയോജ്യതാ സ്കോർ",
    farmingTips: "കാർഷിക നിർദ്ദേശങ്ങൾ",
    cropRotation: "വിള പരിക്രമണ പദ്ധതി",
    idealConditions: "അനുയോജ്യമായ വളർച്ചാ സാഹചര്യങ്ങൾ",
    environmentalInsight: "പരിസ്ഥിതി, മൺ പരിശോധനാ വിശകലനം",
    exportPdf: "PDF റിപ്പോർട്ട് ഡൗൺലോഡ്",
    voiceActive: "ക്രോപ്പർഎക്സ് വോയ്സ് സജീവം",
    selectLanguage: "ഭാഷ തിരഞ്ഞെടുക്കുക"
  }
};

export function getTranslation(langCode: string): TranslationDict {
  return TRANSLATIONS[langCode] || TRANSLATIONS.en;
}

// Generate spoken explanation for CroperX based on language and crop recommendations
export function generateCroperXExplanationText(
  langCode: string,
  topCrop: string,
  score: number,
  nitrogen: number,
  ph: number,
  temp: number,
  rain: number,
  allCrops: string[]
): string {
  const cropListStr = allCrops.slice(0, 3).join(", ");
  
  switch (langCode) {
    case 'hi':
      return `नमस्ते किसान भाई! मैं आपका कृषि एआई एजेंट क्रोपरएक्स हूँ। आपकी मिट्टी के नाइट्रोजन ${nitrogen} पीपीएम, पीएच ${ph}, तापमान ${temp} डिग्री और वर्षा ${rain} मिलीमीटर के आधार पर, आपके खेत के लिए सबसे उपयुक्त फसल ${topCrop} है, जिसका उपयुक्तता स्कोर ${score.toFixed(1)} प्रतिशत है। अन्य उत्कृष्ट विकल्प हैं: ${cropListStr}। इष्टतम पैदावार के लिए संतुलित उर्वरक और सिंचाई अपनाएं।`;
    case 'te':
      return `నమస్కారం రైతు సోదరా! నేను మీ వ్యవసాయ ఎఐ ఏజెంట్ క్రోపర్ ఎక్స్. మీ నేల నత్రజని ${nitrogen} పిపిఎం, పిహెచ్ ${ph}, ఉష్ణోగ్రత ${temp} డిగ్రీలు మరియు వర్షపాతం ${rain} మిమీ ఆధారంగా, మీ పొలానికి అత్యంత అనుకూలమైన పంట ${topCrop}, అనుకూలత స్కోరు ${score.toFixed(1)} శాతం. ఇతర ఉత్తమ పంటలు: ${cropListStr}.`;
    case 'ta':
      return `வணக்கம் விவசாய தோழரே! நான் உங்கள் விவசாய AI ஏஜென்ட் க்ரோபர்எக்ஸ். உங்கள் மண்ணின் நைட்ரஜன் ${nitrogen} ppm, pH ${ph}, வெப்பநிலை ${temp} °C மற்றும் மழைப்பொழிவு ${rain} mm அடிப்படையில், உங்கள் நிலத்திற்கு மிகவும் ஏற்ற பயிர் ${topCrop} ஆகும். அதன் பொருத்தமான மதிப்பெண் ${score.toFixed(1)}%. பிற சிறந்த பயிர்கள்: ${cropListStr}.`;
    case 'kn':
      return `ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ! ನಾನು ನಿಮ್ಮ ಕೃಷಿ AI ಏಜೆಂಟ್ ಕ್ರೋಪರ್ ಎಕ್ಸ್. ನಿಮ್ಮ ಮಣ್ಣಿನ ನೈಟ್ರೋಜನ್ ${nitrogen} ppm, pH ${ph}, ತಾಪಮಾನ ${temp} °C ಮತ್ತು ಮಳೆ ಪ್ರಮಾಣ ${rain} mm ಆಧಾರದ ಮೇಲೆ, ನಿಮ್ಮ ಜಮೀನಿಗೆ ಅತ್ಯಂತ ಸೂಕ್ತವಾದ ಬೆಳೆ ${topCrop}. ಇದರ ಸೂಕ್ತತೆ ಅಂಕ ${score.toFixed(1)}%. ಇತರೆ ಉತ್ತಮ ಬೆಳೆಗಳು: ${cropListStr}.`;
    case 'mr':
      return `नमस्कार शेतकरी बंधूंनो! मी आपला कृषी एआय एजंट क्रोपरएक्स आहे. आपल्या मातीचे नायट्रोजन ${nitrogen} पीपीएम, पीएच ${ph}, तापमान ${temp} अंश आणि पाऊस ${rain} मिमी च्या आधारे, आपल्या शेतासाठी सर्वात योग्य पीक ${topCrop} आहे, ज्याचा उपयुक्तता स्कोर ${score.toFixed(1)} टक्के आहे. इतर उत्तम पिके: ${cropListStr}.`;
    case 'bn':
      return `নমস্কার কৃষক ভাই! আমি আপনার কৃষি এআই এজেন্ট ক্রোপারএক্স। আপনার মাটির নাইট্রোজেন ${nitrogen} পিপিএম, পিএইচ ${ph}, তাপমাত্রা ${temp} ডিগ্রি এবং বৃষ্টিপাত ${rain} মিমি এর ওপর ভিত্তি করে, আপনার জমির জন্য সেরা উপযুক্ত ফসল হল ${topCrop}, যার উপযোগিতা স্কোর ${score.toFixed(1)}%। অন্যান্য ভালো বিকল্প: ${cropListStr}।`;
    case 'gu':
      return `નમસ્તે ખેડૂત મિત્ર! હું તમારો કૃષિ એઆઈ એજન્ટ ક્રોપરએક્સ છું. તમારી જમીનનું નાઇટ્રોજન ${nitrogen} ppm, pH ${ph}, તાપમાન ${temp} °C અને વરસાદ ${rain} mm ના આધારે, તમારા ખેતર માટે સૌથી અનુકૂળ પાક ${topCrop} છે, જેનો અનુકૂળતા સ્કોર ${score.toFixed(1)}% છે. અન્ય શ્રેષ્ઠ પાકો: ${cropListStr}.`;
    case 'pa':
      return `ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! ਮੈਂ ਤੁਹਾਡਾ ਖੇਤੀਬਾੜੀ AI ਏਜੰਟ ਕਰੋਪਰਐਕਸ ਹਾਂ। ਤੁਹਾਡੀ ਜ਼ਮੀਨ ਦੇ ਨਾਇਟ੍ਰੋਜਨ ${nitrogen} ppm, pH ${ph}, ਤਾਪਮਾਨ ${temp} °C ਅਤੇ ਮੀਂਹ ${rain} mm ਦੇ ਆਧਾਰ 'ਤੇ, ਤੁਹਾਡੇ ਖੇਤ ਲਈ ਸਭ ਤੋਂ ਢੁਕਵੀਂ ਫਸਲ ${topCrop} ਹੈ, ਜਿਸਦਾ ਸਕੋਰ ${score.toFixed(1)}% ਹੈ। ਹੋਰ ਵਧੀਆ ਵਿਕਲਪ: ${cropListStr}।`;
    case 'ml':
      return `നമസ്കാരം കർഷക സുഹൃത്തേ! ഞാൻ നിങ്ങളുടെ കാർഷിക AI ഏജന്റ് ക്രോപ്പർഎക്സ് ആണ്. നിങ്ങളുടെ മണ്ണിലെ നൈട്രജൻ ${nitrogen} ppm, pH ${ph}, താപനില ${temp} °C, മഴയുടെ അളവ് ${rain} mm എന്നിവയുടെ അടിസ്ഥാനത്തിൽ നിങ്ങളുടെ കൃഷിയിടത്തിന് ഏറ്റവും അനുയോജ്യമായ വിള ${topCrop} ആണ്. അനുയോജ്യതാ സ്കോർ ${score.toFixed(1)}%. മറ്റു മികച്ച വിളകൾ: ${cropListStr}.`;
    default:
      return `Hello farmer! I am CroperX, your dedicated AI agriculture agent. Based on your soil parameters of Nitrogen ${nitrogen} ppm, pH ${ph}, Temperature ${temp}°C, and Rainfall ${rain}mm, the top recommended crop for your field is ${topCrop} with a suitability confidence of ${score.toFixed(1)}%. Other optimal crop choices include: ${cropListStr}. Apply balanced N-P-K nutrients and maintain soil moisture for maximum yield harvest.`;
  }
}

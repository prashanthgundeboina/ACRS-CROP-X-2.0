export interface AdviserCourseModule {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  icon: string;
  readingTimeMinutes: number;
  overview: string;
  keyTopics: string[];
  sections: {
    heading: string;
    body: string;
    bulletPoints?: string[];
    adviserTip?: string;
  }[];
  quickKnowledgeCheck: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export const ADVISER_LEARNING_MODULES: AdviserCourseModule[] = [
  {
    id: 'mod-01-welcome',
    order: 1,
    title: 'Welcome to CroperX',
    subtitle: 'Platform Architecture & Farmer-First Foundation',
    icon: '🌱',
    readingTimeMinutes: 4,
    overview: 'Understand the mission of CroperX 2.0: bridging rural agricultural field realities with real-time agronomic intelligence, multi-modal vision, and empathetic human advisory.',
    keyTopics: [
      'CroperX 2.0 System Overview',
      'The "Farmer-First" Ergonomic Principle',
      'Adviser Ecosystem Roles & Accountability',
      'Privacy & Ground Truth Verification'
    ],
    sections: [
      {
        heading: '1. The CroperX Mission',
        body: 'CroperX was engineered from the ground up to solve rural agricultural friction. Smallholder farmers face volatile climate events, delayed pest diagnosis, and commercial exploitation. CroperX unites IoT sensor arrays, satellite telemetry, cutting-edge AI models, and human agronomist workstations into a unified single-touch ecosystem.',
        bulletPoints: [
          'Direct farmer connection with zero commercial middleman bias.',
          'Low-latency voice and visual diagnostics optimized for low-bandwidth 2G/3G networks.',
          'Empowering local agronomists with AI decision support.'
        ]
      },
      {
        heading: '2. The Farmer-First Philosophy',
        body: 'Every tool on CroperX is designed around the farmer’s mental model. Advisers must never overwhelm farmers with academic jargon, unverified pesticide mixtures, or complex calculations. Recommendations must be clear, actionable, seasonal, and cost-effective.',
        adviserTip: 'Always verify if the farmer has access to local irrigation and input shops before prescribing specific commercial fertilizers or branded treatments.'
      }
    ],
    quickKnowledgeCheck: {
      question: 'What is the core guiding philosophy of CroperX when interacting with smallholder farmers?',
      options: [
        'Maximize chemical sales volume regardless of need',
        'Farmer-First simplicity, practical local feasibility, and evidence-based care',
        'Replacing all human agronomists with automated bots',
        'Sharing farmer field data publicly with advertisers'
      ],
      correctIndex: 1,
      explanation: 'CroperX is strictly farmer-first: prioritizing accessible language, practical field feasibility, and ethical agronomy.'
    }
  },
  {
    id: 'mod-02-farmer-dashboard',
    order: 2,
    title: 'Farmer Dashboard & Farm Telemetry',
    subtitle: 'Profiles, GPS Coordinates & Longitudinal Memory',
    icon: '🌾',
    readingTimeMinutes: 5,
    overview: 'Master the Farmer Dashboard components: telemetry gauges, NPK/pH soil mapping, farm acreage coordinates, and historical Farmer Memory.',
    keyTopics: [
      'Farm Acreage, Soil Type & Irrigation Mapping',
      'NPK Macro-Nutrient & pH Live Matrix',
      'Farmer Memory: Longitudinal Multi-Season History',
      'Interpreting Visual Gauges on the Workstation'
    ],
    sections: [
      {
        heading: '1. Farmer Profile & Field Coordinates',
        body: 'When a farmer connects with you, their telemetry card automatically surfaces their farm acreage, soil classification (e.g. Alluvial Loam, Black Clay, Sandy Loam), water source (Borewell Drip, Canal, Rainfed), and verified GPS coordinate bounding box.',
        bulletPoints: [
          'GPS Accuracy Indicator: Ensures you know whether the reading is live from the field or home.',
          'Soil baseline values: Live N, P, K in kg/ha alongside soil reaction pH.',
          'Current crop cycle & targeted harvest timeline.'
        ]
      },
      {
        heading: '2. Farmer Memory Integration',
        body: 'CroperX retains historical consultations, past soil test records, prior pest outbreaks, and yield logs. When advising a farmer, inspect their previous season history to detect recurring nematode issues, salinity buildup, or fertilizer over-application.',
        adviserTip: 'Check the "Farmer Memory" tab before prescribing nitrogen fertilizers — chronic high nitrogen is a leading trigger for repeated fungal blast outbreaks.'
      }
    ],
    quickKnowledgeCheck: {
      question: 'What crucial information does "Farmer Memory" provide during an active consultation?',
      options: [
        'Personal bank account pins',
        'Longitudinal history of past soil tests, prior crop rotations, and previous disease outbreaks',
        'Random internet forum comments',
        'Competitor price catalogs'
      ],
      correctIndex: 1,
      explanation: 'Farmer Memory tracks cross-seasonal soil test trends, prior treatments, and yield records to prevent repeating past mistakes.'
    }
  },
  {
    id: 'mod-03-ai-intelligence',
    order: 3,
    title: 'AI Agronomy Intelligence',
    subtitle: 'Multi-Model Consensus (Gemini + Groq + DeepSeek)',
    icon: '🧠',
    readingTimeMinutes: 6,
    overview: 'Learn how CroperX combines Gemini 3.7 Flash, Groq high-speed inference, and DeepSeek scientific verification with human-in-the-loop oversight.',
    keyTopics: [
      'Multi-Model Architecture & Specializations',
      'Gemini: Multimodal Visual Reasoning & Vision Analysis',
      'Groq: Sub-second Latency & Voice Processing',
      'DeepSeek: Agronomic Consensus & Chemical Safety Check',
      'Responsible AI & Hallucination Prevention'
    ],
    sections: [
      {
        heading: '1. The Multi-Model Consensus Architecture',
        body: 'CroperX does not rely on a single AI model. Instead, it orchestrates a three-tier consensus pipeline:',
        bulletPoints: [
          'Gemini 3.7 Flash: High-dimensional visual inspection, lesion segmentation, and multimodal context synthesis.',
          'Groq (Llama-3.3-70B): Instant sub-second conversational synthesis and low-latency voice translations.',
          'DeepSeek-R1 Distill: Scientific cross-verification, CIB&RC regulatory compliance, and dosage validation.'
        ]
      },
      {
        heading: '2. Human-in-the-Loop Imperative',
        body: 'AI provides suggestions and diagnostic confidence percentages (e.g. 96% Early Blight), but the human Adviser is the ultimate authoritative authority. You must verify that the visual symptoms match the field microclimate before confirming prescriptions.',
        adviserTip: 'Never treat an AI output as an unalterable truth. If visual symptoms contradict the AI prediction, override it with your professional field diagnostic.'
      }
    ],
    quickKnowledgeCheck: {
      question: 'Why does CroperX maintain human agronomist review over AI recommendations?',
      options: [
        'Because AI models can suffer hallucinations and human experts understand local micro-environmental nuances',
        'To slow down the advisory process intentionally',
        'Because AI cannot generate text',
        'Only for marketing purposes'
      ],
      correctIndex: 0,
      explanation: 'Human verification provides the essential safety barrier against AI hallucinations and ensures recommendations fit local soil conditions.'
    }
  },
  {
    id: 'mod-04-crop-prediction',
    order: 4,
    title: 'Crop Prediction Engine',
    subtitle: '22-Parameter Machine Learning & Rotation Strategies',
    icon: '🎯',
    readingTimeMinutes: 5,
    overview: 'Deep dive into the 22-dimensional soil, climate, and geographic prediction models, yield benchmark curves, and 3-season rotation algorithms.',
    keyTopics: [
      '22 Soil & Climate Environmental Parameters',
      'KNN, Random Forest & XGBoost Suitability Scoring',
      'Interpreting Correlation Match Percentages',
      '3-Season Sustainable Rotation Directives'
    ],
    sections: [
      {
        heading: '1. Beyond N-P-K: Multi-Factor Agronomy',
        body: 'The CroperX prediction model analyses Nitrogen, Phosphorus, Potassium, soil pH, moisture, rainfall, ambient temperature, relative humidity, organic carbon, drainage index, altitude, and historical regional yield indexes simultaneously.',
        bulletPoints: [
          'Tier 1 (Top Match): Highest agronomic compatibility and maximum expected return on investment.',
          'Tier 2 & 3 Matches: Robust secondary options for risk mitigation or market diversification.',
          'Yield Curve Sensitivity: Dynamic simulation of yield vs. water and nutrient availability.'
        ]
      },
      {
        heading: '2. 3-Season Rotation Planning',
        body: 'Recommending monoculture exhausts specific soil horizons. Advisers must guide farmers on sustainable sequences (e.g. Kharif Paddy → Rabi Chickpea/Wheat → Summer Moong Green Manure) to restore soil organic matter.',
        adviserTip: 'Always recommend a short-duration pulse crop during summer fallow to enrich biological soil nitrogen naturally.'
      }
    ],
    quickKnowledgeCheck: {
      question: 'How many simultaneous environmental and soil parameters does the CroperX Crop Prediction Engine evaluate?',
      options: [
        'Only 3 (N, P, K)',
        '22 comprehensive parameters including soil nutrients, pH, moisture, climate, and topography',
        '1 parameter (Rainfall only)',
        'None'
      ],
      correctIndex: 1,
      explanation: 'CroperX evaluates 22 parameters simultaneously to ensure highly resilient, location-calibrated recommendations.'
    }
  },
  {
    id: 'mod-05-crop-diagnostics',
    order: 5,
    title: 'Crop Disease Diagnostics',
    subtitle: 'Visual Image Diagnostics, Confidence & Verification',
    icon: '🔍',
    readingTimeMinutes: 5,
    overview: 'Understand the plant pathology vision pipeline: image resolution requirements, symptom segmentation, confidence scores, and IPM protocols.',
    keyTopics: [
      'Leaf, Stem, Fruit & Root Image Acquisition',
      'Pathogen Classification: Fungal vs. Bacterial vs. Viral vs. Nutritional',
      'Confidence Scoring & Thresholds',
      'Integrated Pest Management (IPM) Protocols'
    ],
    sections: [
      {
        heading: '1. Diagnostic Image Standards',
        body: 'Accurate diagnosis depends on clear lighting and proper framing. Guide the farmer to capture the boundary between healthy and symptomatic tissue, and avoid blurry or overexposed flash photos.',
        bulletPoints: [
          'Symptom margin inspection: Crucial for differentiating fungal concentric rings from bacterial water-soaking.',
          'Underside of leaves: Essential for detecting downy mildew sporulation or spider mite webbing.',
          'Stem cross-sections: Required for vascular wilt (Fusarium/Ralstonia) confirmation.'
        ]
      },
      {
        heading: '2. IPM Tiered Interventions',
        body: 'Advisers must prioritize cultural and biological controls (Trichoderma, Beauveria, Neem extracts, Pheromone traps) before prescribing synthetic chemical fungicides or insecticides with strict Pre-Harvest Intervals (PHI).',
        adviserTip: 'Always remind farmers to wear protective masks and gloves, and spray early in the morning or late evening to protect pollinator bees.'
      }
    ],
    quickKnowledgeCheck: {
      question: 'What is the required order of pest management interventions under Integrated Pest Management (IPM)?',
      options: [
        'Highest toxicity chemical sprays first, followed by burning the field',
        'Cultural & mechanical methods → Biological controls → Targeted, approved chemicals as a last resort',
        'Zero action whatsoever',
        'Random application of unlabelled powders'
      ],
      correctIndex: 1,
      explanation: 'IPM mandates preventive cultural practices and biological controls before resorting to chemical treatments.'
    }
  },
  {
    id: 'mod-06-farmer-chat',
    order: 6,
    title: 'Farmer Real-Time Chat & Telemetry Sync',
    subtitle: 'Direct Messaging, Audio Notes & Privacy Standards',
    icon: '💬',
    readingTimeMinutes: 4,
    overview: 'Master the Instagram-style Agronomy Chat workstation: bidirectional voice notes, instant photo sharing, live telemetry embedding, and chat ethics.',
    keyTopics: [
      'Chat Navigation & Real-time WebSockets / SSE',
      'Voice Note Transcription & Multilingual Playback',
      'Annotated Prescription Card Sharing',
      'Data Privacy & Chat Retention Rules'
    ],
    sections: [
      {
        heading: '1. Audio Note Capabilities',
        body: 'Many rural farmers prefer voice notes over typing. The CroperX chat automatically records high-clarity voice clips, runs server-side transcription, and enables real-time listening and localized replies.',
        bulletPoints: [
          'Fast 1-touch voice messaging for instant field queries.',
          'Attaching soil telemetry cards directly inside the conversation thread.',
          'Exporting formal prescription summaries into downloadable PDF cards.'
        ]
      },
      {
        heading: '2. Professional Chat Conduct',
        body: 'Advisers must respond within active consultation windows with courteous, clear, and encouraging communication. Never share a farmer’s private chat logs or contact details outside the CroperX platform.',
        adviserTip: 'Use bulleted action steps in chat: 1. Step to take today, 2. Water management tomorrow, 3. Review in 5 days.'
      }
    ],
    quickKnowledgeCheck: {
      question: 'Why are voice notes especially valuable in the CroperX Farmer Chat tool?',
      options: [
        'They take up more server storage',
        'They accommodate farmers with limited literacy, enabling effortless field audio communication',
        'They cannot be recorded',
        'They automatically delete themselves'
      ],
      correctIndex: 1,
      explanation: 'Voice notes eliminate literacy barriers, letting farmers describe field symptoms naturally in their native language.'
    }
  },
  {
    id: 'mod-07-video-consultation',
    order: 7,
    title: 'Live Video Consultation (WebRTC)',
    subtitle: 'Two-Way Audio/Video Streaming & Remote Inspection',
    icon: '📹',
    readingTimeMinutes: 6,
    overview: 'Learn how to manage two-way WebRTC peer connections, camera controls, live field freeze-frames, and connection troubleshooting in remote areas.',
    keyTopics: [
      'WebRTC Peer-to-Peer & Relay Negotiation',
      'Mute, Camera Flip (Front/Rear Macro Lens) & Freeze Frame',
      'Live Field AR Annotation Tools',
      'Low-Bandwidth Adaptive Bitrate Recovery'
    ],
    sections: [
      {
        heading: '1. Conducting a Live Video Session',
        body: 'When a farmer initiates a call, accept it via the Incoming Call Panel. Guide the farmer to switch to their rear camera and hold the phone steady 10-15 cm away from symptomatic leaves under natural sunlight.',
        bulletPoints: [
          'Mute/Unmute: Manage audio feedback in windy field environments.',
          'Camera Switch: Seamlessly switch between the farmer’s selfie camera and rear macro camera.',
          'Snapshot & Annotate: Freeze video frames to draw arrows pointing to pest entry holes.'
        ]
      },
      {
        heading: '2. Troubleshooting Low Bandwidth',
        body: 'If video freezes due to weak 3G signals in remote fields, immediately switch audio mode to preserve voice connectivity and instruct the farmer to snap a high-resolution still image instead.',
        adviserTip: 'Always encourage the farmer to stand where cellular reception is stable before starting deep live video inspections.'
      }
    ],
    quickKnowledgeCheck: {
      question: 'What is the best protocol if video quality drops significantly during a remote field call?',
      options: [
        'Disconnect the call and blame the farmer',
        'Maintain clear audio stream and request a high-resolution photo capture for inspection',
        'Yell louder into the microphone',
        'Restart the entire computer'
      ],
      correctIndex: 1,
      explanation: 'Preserving the voice channel and switching to high-resolution photo snapshots ensures uninterrupted diagnostic support.'
    }
  },
  {
    id: 'mod-08-gps-presence',
    order: 8,
    title: 'GPS & Live Presence Network',
    subtitle: 'Location Precision, Presence Indicators & Privacy',
    icon: '📍',
    readingTimeMinutes: 4,
    overview: 'Understand real-time online presence, nearby adviser discovery on the map, reverse-geocoding, and strict farmer location privacy.',
    keyTopics: [
      'Live Presence Indicators (Available, Busy, In Call, Offline)',
      'GPS Proximity Matching (Radius Calculation)',
      'Reverse Geocoding (Locality, District, State)',
      'Opt-In Location Privacy Controls'
    ],
    sections: [
      {
        heading: '1. Adviser Presence & Availability Switch',
        body: 'Farmers can only connect with advisers who have their status set to "Available". When you are in an active call or conducting field trials, toggle your availability switch to "Busy" or "Offline" to prevent call queuing congestion.',
        bulletPoints: [
          'Available: Ready to receive live farmer video & chat requests.',
          'Busy: Currently engaged in consultation or prescription generation.',
          'Offline: Off-duty; meeting requests can still be scheduled for later.'
        ]
      },
      {
        heading: '2. Location Privacy & Security',
        body: 'GPS coordinates are strictly opt-in. A farmer’s exact field location is only shared during active sessions. Advisers must never disclose farmer property boundaries to third parties.',
        adviserTip: 'Keep your primary district and state updated so nearby farmers in your agro-climatic zone can discover your expertise.'
      }
    ],
    quickKnowledgeCheck: {
      question: 'When is a farmer’s live GPS location visible to an adviser?',
      options: [
        'Publicly at all times on the internet',
        'Only when the farmer has location sharing enabled during an active consultation session',
        'Never under any circumstances',
        'Only after paying a subscription fee'
      ],
      correctIndex: 1,
      explanation: 'Farmer location is privacy-protected and only shared with verified advisers during active, farmer-permitted consultations.'
    }
  },
  {
    id: 'mod-09-emergency-sos',
    order: 9,
    title: 'Emergency SOS Rapid Response',
    subtitle: 'Locust Swarms, Flash Floods, Frost & Priority Alerts',
    icon: '🚨',
    readingTimeMinutes: 5,
    overview: 'Master the high-priority Emergency SOS system: instant push alerting, triage protocol for acute crop disasters, and coordinated response.',
    keyTopics: [
      'Emergency Hazard Triggers (Locusts, Hailstorms, Flash Disease, Chemical Burn)',
      'High-Priority Banner & Audible Alarms',
      'Rapid Triage & Actionable Mitigation Directives',
      'Escalation to District Extension Officers'
    ],
    sections: [
      {
        heading: '1. The SOS Alert Workflow',
        body: 'When a farmer triggers an Emergency SOS, a red priority banner flashes across all nearby active adviser workstations with audible notification. The alert carries the farm’s exact location, crop name, urgency level, and voice distress note.',
        bulletPoints: [
          'Immediate acknowledgment: Accept the emergency within 60 seconds if available.',
          'Immediate guidance: Provide emergency containment measures (e.g. digging drainage trenches during flash floods, emergency neem barrier during locust entry).',
          'Coordinate with district agro-meteorology and extension officials if widespread hazards are detected.'
        ]
      },
      {
        heading: '2. Preventing Panic',
        body: 'Advisers must remain calm, objective, and reassuring during emergency calls. Give step-by-step containment instructions to minimize crop loss.',
        adviserTip: 'Document all emergency actions in the audit log so disaster compensation authorities can review official agronomist verification.'
      }
    ],
    quickKnowledgeCheck: {
      question: 'What is the first responsibility of an adviser when receiving a critical Emergency SOS alert?',
      options: [
        'Ignore it and wait for normal office hours',
        'Acknowledge the alert promptly, assess the acute danger from telemetry, and provide rapid containment guidance',
        'Forward the alert to social media',
        'Tell the farmer to abandon the farm immediately'
      ],
      correctIndex: 1,
      explanation: 'Emergency SOS alerts require rapid triage and structured containment directives to prevent catastrophic crop damage.'
    }
  },
  {
    id: 'mod-10-field-scout',
    order: 10,
    title: 'Smartphone Field Scout (QR Pairing)',
    subtitle: 'Zero-Install Remote Field Inspection & Macro Video',
    icon: '📱',
    readingTimeMinutes: 4,
    overview: 'Learn how to generate and pair QR Field Scout sessions, streaming live camera video from any smartphone to your desktop workstation with zero app installation.',
    keyTopics: [
      'Instant QR Code Generation & Security Tokens',
      'Farmer Smartphone Lens Pairing (Zero App Required)',
      'High-Resolution Macro Freeze-Frames & Zoom',
      'Dual-Stream Synchronization on Adviser Workstation'
    ],
    sections: [
      {
        heading: '1. How QR Field Scout Operates',
        body: 'Advisers working on a laptop or desktop can click "Launch QR Scout" to generate a secure single-use QR code. The farmer simply scans the QR code with their mobile phone camera, instantly opening a high-bandwidth WebRTC streaming lens without installing any software.',
        bulletPoints: [
          'Seamless mobile browser pairing (WebRTC HTTPS secure tunnel).',
          'Adviser gains remote digital zoom and flashlight controls (where supported).',
          'Live snapshots automatically attach to the consultation record.'
        ]
      },
      {
        heading: '2. Field Inspection Best Practices',
        body: 'Guide the scout to inspect 5 random spots in the field (Z-pattern or W-pattern) to determine if pest infestation is localized at the field border or uniformly distributed across the canopy.',
        adviserTip: 'Always check both the top canopy and bottom shaded foliage — red spider mites and whitefly nymphs concentrate on lower leaf surfaces.'
      }
    ],
    quickKnowledgeCheck: {
      question: 'Does a farmer need to install complex software to connect their phone camera via QR Field Scout?',
      options: [
        'Yes, they must install three separate apps',
        'No, they simply scan the QR code to stream directly through their standard mobile browser',
        'They must connect a physical USB cable to the adviser’s laptop',
        'They need a satellite dish'
      ],
      correctIndex: 1,
      explanation: 'QR Field Scout is zero-install: scanning the QR code opens a direct, secure WebRTC streaming channel in any modern mobile browser.'
    }
  },
  {
    id: 'mod-11-multilingual-assistance',
    order: 11,
    title: 'Multilingual Farmer Assistance & Voice AI',
    subtitle: '8 Regional Languages, Voice Recognition & Cultural Empathy',
    icon: '🗣️',
    readingTimeMinutes: 5,
    overview: 'Explore CroperX’s 8-language localization architecture, voice assistant integration, phonetic translation, and inclusive farmer communication.',
    keyTopics: [
      '8 Supported Languages: English, Hindi, Punjabi, Telugu, Tamil, Marathi, Bengali, Kannada',
      'Voice Assistant Speech-to-Text & Speech Synthesis',
      'Phonetic Transliteration & Dialect Sensitivity',
      'Respectful Regional Terminology & Empathy'
    ],
    sections: [
      {
        heading: '1. Language Switching in CroperX',
        body: 'CroperX supports seamless real-time switching between 8 official languages. Advisers can view the dashboard in English while the farmer views guidance in Hindi, Telugu, or Punjabi.',
        bulletPoints: [
          'English, Hindi (हिन्दी), Punjabi (ਪੰਜਾਬੀ), Telugu (తెలుగు)',
          'Tamil (தமிழ்), Marathi (मराठी), Bengali (বাংলা), Kannada (ಕನ್ನಡ)',
          'Full voice playback for illiterate farmers.'
        ]
      },
      {
        heading: '2. Cultural Competence in Advisory',
        body: 'Regional farming communities have indigenous names for crop stages (e.g. "Gabhod" for booting stage in wheat, "Kallu" for tillers in paddy). Advisers should acknowledge and bridge traditional knowledge with modern science.',
        adviserTip: 'Always summarize your final advice in a single clear spoken sentence before ending a voice or video call.'
      }
    ],
    quickKnowledgeCheck: {
      question: 'How does CroperX enable seamless cross-language consultations between an English-speaking adviser and a regional-language farmer?',
      options: [
        'It requires all farmers to learn English first',
        'It provides bidirectional translation, localized voice synthesis, and regional UI support across 8 languages',
        'It converts all text into emojis only',
        'It refuses multi-language sessions'
      ],
      correctIndex: 1,
      explanation: 'CroperX provides real-time translation and voice synthesis across 8 major Indian languages to remove language barriers completely.'
    }
  },
  {
    id: 'mod-12-professional-responsibility',
    order: 12,
    title: 'Adviser Professional Responsibility & Ethics',
    subtitle: 'Zero Fabrication, Regulatory Compliance & Ethical Governance',
    icon: '⚖️',
    readingTimeMinutes: 5,
    overview: 'The definitive ethical code of CroperX Advisers: evidence-based recommendations, zero tolerance for fabricated advice, data protection, and legal compliance.',
    keyTopics: [
      'Evidence-Based Agronomy Standards',
      'Zero Tolerance for Fabricated or Guesswork Prescriptions',
      'Central Insecticide Board (CIB&RC) Compliance',
      'Audit Logging, Verification & Account Governance'
    ],
    sections: [
      {
        heading: '1. Ethical Directives for Certified Advisers',
        body: 'As a verified CroperX Adviser, your recommendations directly impact farmer livelihoods and food safety. You must adhere strictly to established agronomic guidelines:',
        bulletPoints: [
          'Never guess: If unsure about a rare viral disease symptom, request laboratory sample testing or consult senior agronomists before prescribing treatments.',
          'Never recommend banned, expired, or unapproved agrochemicals.',
          'Strictly follow label dosages, pre-harvest safety intervals (PHI), and safety precautions.',
          'Never sell or monetize farmer personal contact information or field coordinates.'
        ]
      },
      {
        heading: '2. Auditability and Platform Accountability',
        body: 'Every consultation, chat prescription, diagnostic confirmation, and admin action is cryptographically logged to the CroperX immutable audit log. Misconduct or reckless advisory results in immediate license revocation.',
        adviserTip: 'Your reputation on CroperX is built on farmer trust, soil health preservation, and sustainable yield improvements.'
      }
    ],
    quickKnowledgeCheck: {
      question: 'What is the strict policy regarding unverified or fabricated advice on the CroperX platform?',
      options: [
        'Guesswork is encouraged to sound confident',
        'Strict zero-tolerance: Advisers must only give evidence-based advice and escalate unknown issues to senior agronomists',
        'Advisers can make up chemical names',
        'Advice is never logged or reviewed'
      ],
      correctIndex: 1,
      explanation: 'CroperX maintains strict zero tolerance for unverified guesswork — all advice must be evidence-based and aligned with regulatory standards.'
    }
  }
];

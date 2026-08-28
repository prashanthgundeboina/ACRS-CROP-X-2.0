export interface AssessmentQuestionPublic {
  id: number;
  category: 'Crop Knowledge & Lifecycle' | 'Soil Health & Nutrition' | 'Pest & Disease Diagnostics' | 'Climate & Weather Risk' | 'Agronomy & Farm Operations' | 'CroperX Platform & Farmer Care';
  question: string;
  options: string[];
}

export const ADVISER_ASSESSMENT_PUBLIC_QUESTIONS: AssessmentQuestionPublic[] = [
  // 1. Crop Knowledge & Lifecycle (Q1 - Q8)
  {
    id: 1,
    category: 'Crop Knowledge & Lifecycle',
    question: 'During which growth stage is Kharif rice most sensitive to severe moisture stress resulting in floret sterility?',
    options: ['Active Tillering', 'Panicle Initiation to Flowering (Anthesis)', 'Seedling Germination', 'Late Dough Stage']
  },
  {
    id: 2,
    category: 'Crop Knowledge & Lifecycle',
    question: 'What is the primary agronomic purpose of crop rotation between legumes (such as Chickpea or Mungbean) and cereals (such as Wheat or Maize)?',
    options: ['To increase soil salinity', 'To biologically fix atmospheric Nitrogen and break insect-pest host cycles', 'To shorten the vegetative growth stage of cereals', 'To reduce the requirement for sunlight']
  },
  {
    id: 3,
    category: 'Crop Knowledge & Lifecycle',
    question: 'What physiological symptom in Maize crops indicates acute Zinc (Zn) deficiency during early vegetative development?',
    options: ['Purpling of lower leaf margins', 'Broad white or bleached bands on either side of the midrib ("White Bud")', 'Uniform chlorosis of oldest leaves only', 'Marginal leaf scorch on upper leaves']
  },
  {
    id: 4,
    category: 'Crop Knowledge & Lifecycle',
    question: 'In Wheat cultivation (Triticum aestivum), what is the most critical irrigation stage that must never be missed?',
    options: ['Crown Root Initiation (CRI) stage (20-25 DAS)', 'Late Dough Stage', 'Hard Dough Stage', 'Post-Harvest Ratooning']
  },
  {
    id: 5,
    category: 'Crop Knowledge & Lifecycle',
    question: 'What is the optimal spacing and seed rate recommendation for high-density planting of Bt Cotton in rainfed black soils?',
    options: ['90 x 60 cm at 2-2.5 kg/ha', '10 x 10 cm at 20 kg/ha', '150 x 150 cm at 0.5 kg/ha', '300 x 300 cm at 0.1 kg/ha']
  },
  {
    id: 6,
    category: 'Crop Knowledge & Lifecycle',
    question: 'Which hormone application is traditionally recommended to promote uniform ripening and early harvesting in Sugarcane or Cotton defoliation?',
    options: ['Gibberellic Acid (GA3)', 'Ethephon (Ethylene generator)', 'Cytokinin', 'Abscisic Acid (ABA) at toxic doses']
  },
  {
    id: 7,
    category: 'Crop Knowledge & Lifecycle',
    question: 'In groundnut (Arachis hypogaea), what physiological process is severely hindered if soil is excessively compacted during the 45-60 DAS stage?',
    options: ['Peg penetration into the soil (Gynophore elongation)', 'Floral bud initiation', 'Cotyledon emergence', 'Stomatal opening at noon']
  },
  {
    id: 8,
    category: 'Crop Knowledge & Lifecycle',
    question: 'Which of the following is considered an ideal intercrop for Sugarcane during the early 90 days after planting in North India?',
    options: ['Deep-rooted Cotton', 'Short-duration French Bean, Potato, or Green Gram', 'Perennial Napier Grass', 'Eucalyptus saplings']
  },

  // 2. Soil Health & Nutrition (Q9 - Q16)
  {
    id: 9,
    category: 'Soil Health & Nutrition',
    question: 'When soil pH drops below 5.5 (Acidic soils), which micronutrient becomes highly soluble to the point of plant toxicity while Phosphorus availability is locked?',
    options: ['Calcium and Magnesium', 'Aluminum (Al3+) and Manganese (Mn2+)', 'Molybdenum (Mo)', 'Potassium (K+)']
  },
  {
    id: 10,
    category: 'Soil Health & Nutrition',
    question: 'What is the standard soil amendment recommended to reclaim sodic (alkali) soils having an Exchangeable Sodium Percentage (ESP) > 15% and pH > 8.5?',
    options: ['Quicklime (Calcium Oxide)', 'Agricultural Gypsum (Calcium Sulfate Dihydrate) followed by leaching', 'Excessive Muriate of Potash application', 'Elemental Sodium chloride']
  },
  {
    id: 11,
    category: 'Soil Health & Nutrition',
    question: 'Which major plant nutrient is primarily responsible for stomatal regulation, enzyme activation, and disease resistance in crops?',
    options: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)', 'Boron (B)']
  },
  {
    id: 12,
    category: 'Soil Health & Nutrition',
    question: 'In a soil test report showing Nitrogen 180 kg/ha (Low), Phosphorus 22 kg/ha (Medium), Potassium 280 kg/ha (High), and pH 6.8, what is the best fertilizer advisory for Paddy?',
    options: ['Apply 25% higher Nitrogen through split doses, standard basal P, and reduce Potassium by 20%', 'Do not apply any Nitrogen at all', 'Apply triple dose of Potassium and zero Nitrogen', 'Flood the field with lime']
  },
  {
    id: 13,
    category: 'Soil Health & Nutrition',
    question: 'What is the optimal Carbon-to-Nitrogen (C:N) ratio of organic compost / Farm Yard Manure (FYM) for rapid microbial mineralization in farm soil?',
    options: ['Between 15:1 and 25:1', '100:1 to 200:1', '1:1 to 3:1', '500:1']
  },
  {
    id: 14,
    category: 'Soil Health & Nutrition',
    question: 'Why should phosphatic fertilizers (such as DAP or SSP) generally be placed near the root zone (basal placement) rather than broadcasted on the soil surface?',
    options: ['Phosphorus evaporates into the air as gas', 'Phosphorus has very low mobility in soil and rapidly fixes with Calcium/Iron compounds', 'Phosphorus attracts earthworms away from the field', 'Phosphorus dissolves too fast in rainwater']
  },
  {
    id: 15,
    category: 'Soil Health & Nutrition',
    question: 'What visual symptom differentiates Magnesium (Mg) deficiency from Iron (Fe) deficiency in dicot plants?',
    options: ['Mg deficiency causes interveinal chlorosis on OLDER bottom leaves, whereas Fe deficiency causes interveinal chlorosis on YOUNGEST top leaves', 'Mg deficiency causes purple spots, while Fe causes yellow roots', 'Mg deficiency only appears after harvest', 'There is no difference']
  },
  {
    id: 16,
    category: 'Soil Health & Nutrition',
    question: 'What is the primary role of biofertilizers like Rhizobium and Azotobacter in sustainable agriculture?',
    options: ['Sterilizing soil fungi', 'Biological Nitrogen fixation from atmosphere into plant-available ammonia', 'Increasing chemical fertilizer salt index', 'Repelling cattle']
  },

  // 3. Pest & Disease Diagnostics (Q17 - Q24)
  {
    id: 17,
    category: 'Pest & Disease Diagnostics',
    question: 'What is the characteristic field symptom of "Blast" disease in Paddy caused by the fungus Magnaporthe oryzae?',
    options: ['Water-soaked yellow circles on roots', 'Spindle-shaped (eye-shaped) lesions with gray/whitish centers and dark brown borders on leaves and neck', 'Complete blackening of internal stem without leaf spots', 'Thick powdery white coating on underside of pods']
  },
  {
    id: 18,
    category: 'Pest & Disease Diagnostics',
    question: 'A farmer shows yellow mosaic patches on soybean leaves transmitted by whiteflies (Bemisia tabaci). What is the sustainable IPM strategy?',
    options: ['Spray high-dose broad spectrum synthetic pyrethroids daily', 'Install yellow sticky traps, rogue out infected plants early, and use systemic seed treatment/neem oil spray', 'Flood the field with borewell water for 10 days', 'Apply heavy urea doses to green up the leaves']
  },
  {
    id: 19,
    category: 'Pest & Disease Diagnostics',
    question: 'Which invasive pest attacks Maize whorls causing "shot-hole" leaf damage and extensive moist frass accumulation?',
    options: ['Fall Armyworm (Spodoptera frugiperda)', 'Rice Stem Borer', 'Aphids', 'Termites']
  },
  {
    id: 20,
    category: 'Pest & Disease Diagnostics',
    question: 'What biological biocontrol agent is widely used as an eco-friendly bio-fungicide against soil-borne pathogens like Fusarium and Rhizoctonia?',
    options: ['Trichoderma viride / Trichoderma harzianum', 'Helicoverpa nuclear polyhedrosis virus (NPV)', 'Bacillus thuringiensis kurstaki', 'Pheromone lure']
  },
  {
    id: 21,
    category: 'Pest & Disease Diagnostics',
    question: 'In cotton crops, what causes the "square shedding" and inverted flared bracts ("flared squares")?',
    options: ['Bollworm larvae feeding inside flower buds', 'Excessive potassium fertilizer', 'Cold fog in morning', 'Over-pruning of lower branches']
  },
  {
    id: 22,
    category: 'Pest & Disease Diagnostics',
    question: 'What is the hallmark symptom of Bacterial Leaf Blight (BLB) in rice caused by Xanthomonas oryzae pv. oryzae?',
    options: ['Wavy, water-soaked yellowish lesions advancing from leaf tips along leaf margins, producing bacterial ooze in morning', 'Circular dark target rings on fruits', 'Powdery white flour on leaf surfaces', 'Purple stems with root knot galls']
  },
  {
    id: 23,
    category: 'Pest & Disease Diagnostics',
    question: 'What is the concept of "Economic Threshold Level" (ETL) in Integrated Pest Management (IPM)?',
    options: ['The total price of chemicals per acre', 'The pest population density at which control measures must be initiated to prevent reaching the Economic Injury Level', 'The maximum yield a farmer can legally sell in Mandi', 'The point where 100% of insects are eradicated']
  },
  {
    id: 24,
    category: 'Pest & Disease Diagnostics',
    question: 'Which fungal disease produces dark brown to black "sooty heads" replacing grain kernels with black fungal spore masses in Wheat / Barley?',
    options: ['Loose Smut (Ustilago tritici)', 'Downy Mildew', 'Bacterial Spot', 'Anthracnose']
  },

  // 4. Climate & Weather Risk (Q25 - Q32)
  {
    id: 25,
    category: 'Climate & Weather Risk',
    question: 'What agronomic advisory should be given to a wheat farmer when daytime temperatures spike above 35°C during the grain-filling (terminal heat) stage?',
    options: ['Stop all water and spray defoliant', 'Provide light frequent irrigations (or micro-sprinklers) and consider foliar spray of 2% KNO3 to mitigate terminal heat shock', 'Burn the field edges', 'Apply 100 kg urea immediately']
  },
  {
    id: 26,
    category: 'Climate & Weather Risk',
    question: 'If high-intensity rainfall (> 80 mm in 24 hours) is forecast within 48 hours for standing Cotton / Gram crops, what must the farmer do immediately?',
    options: ['Apply top-dress chemical fertilizers right away', 'Clear field drainage channels and ensure no waterlogging can occur in the root zone', 'Spray emulsified neem oil in the middle of rain', 'Cover entire 10-acre field with plastic sheets']
  },
  {
    id: 27,
    category: 'Climate & Weather Risk',
    question: 'What is the primary risk of frost (Pala) to Mustard and Potato crops in North-Western India during late December / January?',
    options: ['Ice crystal formation inside plant cells causing intracellular rupture and plant desiccation', 'Excessive transpiration leading to gigantism', 'Overproduction of root nodules', 'Attraction of locust swarms']
  },
  {
    id: 28,
    category: 'Climate & Weather Risk',
    question: 'In drought-prone rainfed areas, which in-situ moisture conservation practice is most effective in retaining soil moisture?',
    options: ['Broad Bed and Furrow (BBF) or Compartmental Bunding with organic mulching', 'Clean bare-tillage with zero cover', 'Burning crop residues', 'Compacting topsoil with heavy road rollers']
  },
  {
    id: 29,
    category: 'Climate & Weather Risk',
    question: 'How does high relative humidity (> 85%) combined with warm cloudy weather (24-28°C) influence fungal and bacterial disease outbreaks?',
    options: ['It completely sterilizes fungal spores', 'It creates the ideal microclimate for rapid spore germination and epidemic spread', 'It forces all bacteria into dormancy', 'It improves plant immunity by 50%']
  },
  {
    id: 30,
    category: 'Climate & Weather Risk',
    question: 'What is the role of anti-transpirants (like PMA, Kaolin clay spray, or Mobileaf) during severe dry spells?',
    options: ['They reduce plant water loss through stomatal resistance or reflective coatings without totally halting photosynthesis', 'They synthesize water molecules from nitrogen', 'They increase fruit sweetness directly', 'They color the leaves blue']
  },
  {
    id: 31,
    category: 'Climate & Weather Risk',
    question: 'Which weather forecast parameter is most critical when advising farmers on the exact timing of pesticide or foliar nutrient spraying?',
    options: ['Wind speed (< 10-15 km/h to avoid drift) and rain probability within next 4-6 hours (rainfastness)', 'Moon phase only', 'Atmospheric CO2 at 10,000 meters altitude', 'Radio frequency interference']
  },
  {
    id: 32,
    category: 'Climate & Weather Risk',
    question: 'What is an effective cultural practice to protect high-value horticulture nurseries from sudden radiation frost?',
    options: ['Creating light evening smoke smudges (smoke blanket) and running light micro-sprinkler irrigation at dawn', 'Harvesting the trees completely', 'Spraying ice water at midnight', 'Applying strong acid to the soil']
  },

  // 5. Agronomy & Farm Operations (Q33 - Q40)
  {
    id: 33,
    category: 'Agronomy & Farm Operations',
    question: 'What is the primary benefit of the System of Rice Intensification (SRI) over conventional flooded paddy transplantation?',
    options: ['Younger single seedlings (8-12 days), wider square spacing, mechanical weeding, and alternate wetting & drying saving 30-40% water', 'Requires 500% more seeds per acre', 'Requires permanent 1 foot standing water at all times', 'Eliminates all human labor completely']
  },
  {
    id: 34,
    category: 'Agronomy & Farm Operations',
    question: 'In drip irrigation design, what device ensures uniform water emission regardless of elevation changes or pressure drops along the lateral pipe?',
    options: ['Pressure Compensating (PC) Emitters', 'Open-ended cut tubes', 'Siphon gates', 'Heavy brass faucets']
  },
  {
    id: 35,
    category: 'Agronomy & Farm Operations',
    question: 'What is the recommended seed treatment sequence (FIR principle) for pulse crops before sowing?',
    options: ['Fungicide first → Insecticide second → Rhizobium Biofertilizer third', 'Biofertilizer first → Strong acid second → Fungicide last', 'Insecticide first → Fungicide second → Burning last', 'No order is needed']
  },
  {
    id: 36,
    category: 'Agronomy & Farm Operations',
    question: 'What is the optimal harvest moisture percentage for Wheat and Paddy grains to avoid fungal aflatoxin contamination and grain shattering during mechanical threshing?',
    options: ['Between 12% and 14%', 'Above 35%', 'Less than 2%', '80% moisture']
  },
  {
    id: 37,
    category: 'Agronomy & Farm Operations',
    question: 'Which green manuring crop is most popular for incorporating into paddy fields at 45-50 days of growth before rice transplantation in India?',
    options: ['Dhaincha (Sesbania aculeata) / Sunnhemp (Crotalaria juncea)', 'Sugarcane trash', 'Parthenium hysterophorus', 'Castor beans']
  },
  {
    id: 38,
    category: 'Agronomy & Farm Operations',
    question: 'What is the advantage of Zero Tillage / Happy Seeder technology in North Indian paddy-wheat cropping systems?',
    options: ['Direct sowing of wheat into rice residue without burning straw, saving diesel, soil organic carbon, and time', 'Requires complete manual burning of all stubble', 'Tills the soil 5 times deeper than moldboard plow', 'Replaces all fertilizer with river sand']
  },
  {
    id: 39,
    category: 'Agronomy & Farm Operations',
    question: 'What is the primary objective of "detasseling" in hybrid maize seed production plots?',
    options: ['To remove male inflorescences from female parent rows to prevent self-pollination and ensure cross-hybridization', 'To make the maize plants look shorter', 'To harvest baby corn for snacks', 'To stop pollen production entirely in the district']
  },
  {
    id: 40,
    category: 'Agronomy & Farm Operations',
    question: 'Which post-harvest storage technique utilizes hermetic sealing to naturally suffocate insects and molds through grain respiration?',
    options: ['Purdue Improved Crop Storage (PICS) multi-layer hermetic bags', 'Open jute bags on wet floor', 'Transparent glass containers under direct sunlight', 'Open wooden bins with no roof']
  },

  // 6. CroperX Platform & Farmer Care (Q41 - Q50)
  {
    id: 41,
    category: 'CroperX Platform & Farmer Care',
    question: 'When an agronomist receives an Emergency SOS alert from a farmer on CroperX, what is the required response protocol?',
    options: ['Review the farmer’s live GPS location, crop telemetry, and immediate issue description, then initiate an urgent audio/video consultation or dispatch verified guidance', 'Ignore it until weekly office hours', 'Forward the farmer’s phone number to commercial fertilizer sales spam', 'Delete the alert from the database']
  },
  {
    id: 42,
    category: 'CroperX Platform & Farmer Care',
    question: 'How does CroperX use multi-model AI consensus (Gemini 3.7 + Groq + DeepSeek) to assist Advisers during live consultations?',
    options: ['It automatically hallucinates chemical prescriptions without verification', 'It synthesizes multimodal visual diagnostic insights, rapid weather correlations, and scientific agronomic reasoning to provide verified decision support for the adviser', 'It replaces the human adviser entirely without human-in-the-loop oversight', 'It only checks stock market crypto prices']
  },
  {
    id: 43,
    category: 'CroperX Platform & Farmer Care',
    question: 'What is the purpose of the CroperX Smartphone "QR Field Scout" feature?',
    options: ['To securely pair a farmer’s or scout’s smartphone camera to an adviser’s workstation for real-time high-resolution field inspection via WebRTC', 'To play mobile video games', 'To scan supermarket grocery barcodes', 'To transfer cryptocurrency']
  },
  {
    id: 44,
    category: 'CroperX Platform & Farmer Care',
    question: 'How does CroperX protect farmer privacy regarding exact GPS coordinates and farm boundary data?',
    options: ['Coordinates are stored encrypted and only shared with authorized advisers during active consultations when the farmer has live sharing toggled ON', 'Coordinates are sold to third-party telemarketers', 'GPS data is posted publicly on social media', 'Any user on the internet can see every farmer’s live bedroom location']
  },
  {
    id: 45,
    category: 'CroperX Platform & Farmer Care',
    question: 'When interpreting CroperX’s 22-parameter Crop Recommendation Engine, what role should the human Adviser play?',
    options: ['Validate AI suggestions against local seed availability, market Mandi trends, farmer capital, and real-time field microclimate before final confirmation', 'Blindly accept whatever appears on screen without checking local feasibility', 'Tell the farmer that AI is always wrong', 'Only recommend the most expensive crop regardless of soil suitability']
  },
  {
    id: 46,
    category: 'CroperX Platform & Farmer Care',
    question: 'If a farmer with limited literacy speaks only Telugu or Tamil and uses the CroperX Voice Assistant, what should the Adviser ensure during consultations?',
    options: ['Speak respectfully in the farmer’s chosen regional language, using simple actionable terms rather than confusing chemical jargon', 'Demand that the farmer speak English or Latin botanical names only', 'Refuse the consultation', 'Use auto-generated robotic voices without listening to the farmer']
  },
  {
    id: 47,
    category: 'CroperX Platform & Farmer Care',
    question: 'What is the primary ethical responsibility of a CroperX Certified Farm Adviser regarding pesticide recommendations?',
    options: ['Recommend approved chemical labels strictly within CIB&RC safety dosages, prioritizing eco-friendly IPM/biocontrols first and emphasizing Waiting Periods (PHI) before harvest', 'Recommend banned unregistered chemicals to maximize commission', 'Suggest double the lethal dosage for fast results', 'Advise farmers to spray without protective gear']
  },
  {
    id: 48,
    category: 'CroperX Platform & Farmer Care',
    question: 'What does "Farmer Memory" in CroperX allow the AI and Adviser to track across multiple seasons?',
    options: ['Historical soil test records, previous disease outbreaks, past crop rotations, and specific advisory notes tailored to that unique farmer ID', 'The farmer’s personal bank account passwords', 'The farmer’s web browsing history', 'Nothing is saved']
  },
  {
    id: 49,
    category: 'CroperX Platform & Farmer Care',
    question: 'During a two-way WebRTC video consultation on CroperX, what should an adviser do if the farmer’s video shows poor connectivity in remote fields?',
    options: ['Switch to high-compression audio mode or request a still photo capture with the QR Field Scout tool to inspect close-up leaf symptoms reliably', 'Hang up immediately and block the farmer', 'Blame the farmer for bad network', 'Demand they buy fiber broadband']
  },
  {
    id: 50,
    category: 'CroperX Platform & Farmer Care',
    question: 'What is the minimum passing score required on this CroperX Adviser Competency Assessment to qualify for Admin profile verification?',
    options: ['25 out of 50 (50%)', '5 out of 50', '50 out of 50 (100% only)', '0 points']
  }
];

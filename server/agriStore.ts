import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getSupabase } from './supabase.js';

export interface ProductCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  displayOrder: number;
  isArchived?: boolean;
  itemCount?: number;
}

export interface AgriProduct {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  originalPrice?: number;
  unit: string;
  rating: number;
  reviewsCount: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  isInStock: boolean;
  isArchived?: boolean;
  imageUrl: string;
  description: string;
  agriculturalUse: string;
  cropCompatibility: string[];
  activeIngredients?: string;
  dosageInstructions?: string;
  safetyInformation?: string;
  isFeatured?: boolean;
  isRecommended?: boolean;
  sku?: string;
  manufacturer?: string;
  gstRatePercent?: number;
  categoryName?: string;
  categoryIcon?: string;
  stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product?: AgriProduct;
}

export interface FarmerCart {
  mobile: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  updatedAt: string;
}

export interface DeliveryAddress {
  recipientName: string;
  phoneNumber: string;
  streetAddress: string;
  landmark?: string;
  villageOrLocality?: string;
  district: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  unit: string;
  imageUrl: string;
}

export interface FarmerOrder {
  id: string;
  orderNumber: string;
  mobile: string;
  farmerName: string;
  status: 'PLACED' | 'CONFIRMED' | 'PROCESSING' | 'DISPATCHED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  grandTotal: number;
  paymentMethod: 'COD' | 'UPI' | 'NET_BANKING';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  deliveryAddress: DeliveryAddress;
  items: OrderItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  operation: 'ADD' | 'SUBTRACT' | 'SET' | 'SALE' | 'RETURN' | 'THRESHOLD_UPDATE';
  quantityChanged: number;
  previousStock: number;
  newStock: number;
  reason: string;
  adminName: string;
  timestamp: string;
}

export interface AdminBroadcastNotification {
  id: string;
  title: string;
  message: string;
  targetAudience: 'ALL_FARMERS' | 'ALL_ADVISERS' | 'ALL_USERS' | 'SPECIFIC_USER' | 'BY_REGION' | 'BY_CROP';
  targetFilter?: string;
  priority: 'NORMAL' | 'IMPORTANT' | 'URGENT' | 'EMERGENCY';
  language: string;
  actionLink?: string;
  status: 'SENT' | 'SCHEDULED' | 'CANCELLED';
  scheduledFor?: string;
  sentAt?: string;
  createdBy: string;
  createdAt: string;
  recipientCount: number;
  readBy?: string[];
}

export interface AdminOperationalAlert {
  id: string;
  type: string;
  category: 'weather' | 'pests' | 'soil' | 'market' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  action: string;
  affectedZoneIds?: string[];
  targetRegion?: string;
  targetCrop?: string;
  isActive: boolean;
  createdAt: string;
  createdBy?: string;
}

const CARTS_FILE = path.join(process.cwd(), 'farmer_carts.json');
const ORDERS_FILE = path.join(process.cwd(), 'farmer_orders.json');
const PRODUCTS_FILE = path.join(process.cwd(), 'agri_products.json');
const CATEGORIES_FILE = path.join(process.cwd(), 'agri_categories.json');
const INVENTORY_LOGS_FILE = path.join(process.cwd(), 'admin_inventory_logs.json');
const NOTIFICATIONS_FILE = path.join(process.cwd(), 'admin_notifications.json');
const ALERTS_FILE = path.join(process.cwd(), 'admin_alerts.json');

// Canonical Initial Categories
export const INITIAL_CATEGORIES: ProductCategory[] = [
  { id: 'all', name: 'All Products', icon: '🌾', description: 'Complete catalog of certified agricultural inputs', displayOrder: 0, isArchived: false },
  { id: 'seeds', name: 'Certified Seeds', icon: '🌱', description: 'High-yielding, climate-resilient hybrid & certified seeds', displayOrder: 1, isArchived: false },
  { id: 'fertilizers', name: 'Fertilizers & NPK', icon: '🧪', description: 'Macronutrient, micronutrient & foliar nutrition formulas', displayOrder: 2, isArchived: false },
  { id: 'bio_fertilizers', name: 'Bio-Fertilizers & Organics', icon: '🍃', description: 'Mycorrhiza, Rhizobium, PSB and organic soil enhancers', displayOrder: 3, isArchived: false },
  { id: 'crop_protection', name: 'Crop Protection', icon: '🛡️', description: 'Integrated pest management, bio-pesticides & fungicides', displayOrder: 4, isArchived: false },
  { id: 'soil_testing', name: 'Soil & Water Testing', icon: '🔬', description: 'Digital testing kits, NPK test strips & digital pH meters', displayOrder: 5, isArchived: false },
  { id: 'irrigation', name: 'Drip & Irrigation', icon: '💧', description: 'Drip emitters, micro-sprinklers, lateral pipes & filters', displayOrder: 6, isArchived: false },
  { id: 'farm_tools', name: 'Tools & Sprayers', icon: '⚙️', description: 'Battery knapsack sprayers, pruning shears & farm gear', displayOrder: 7, isArchived: false },
  { id: 'safety', name: 'Safety Equipment', icon: '🥽', description: 'Respirators, chemical safety gloves, eye shields & overalls', displayOrder: 8, isArchived: false },
];

// Canonical Initial Products Catalog
export const INITIAL_PRODUCTS_CATALOG: AgriProduct[] = [
  {
    id: 'prod_seed_wheat_hd3086',
    name: 'Pusa Gautami HD-3086 Certified Wheat Seed',
    categoryId: 'seeds',
    price: 950,
    originalPrice: 1100,
    unit: '40 kg Bag',
    rating: 4.9,
    reviewsCount: 142,
    stockQuantity: 120,
    lowStockThreshold: 20,
    isInStock: true,
    isArchived: false,
    sku: 'SEED-WHT-3086',
    manufacturer: 'ICAR-IARI Certified',
    gstRatePercent: 0,
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    description: 'High-yielding, rust-resistant certified wheat seed developed by IARI. Excellent grain luster and high protein content.',
    agriculturalUse: 'Sowing during Rabi season for maximum grain yield and lodging resistance.',
    cropCompatibility: ['Wheat', 'Barley'],
    dosageInstructions: '40 kg per acre for standard seed drill sowing.',
    safetyInformation: 'Pre-treated with Thiram 75% WP. Store in a cool, moisture-free storage shed.',
    isFeatured: true,
    isRecommended: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'prod_seed_paddy_pr126',
    name: 'PAU PR-126 Short-Duration Hybrid Paddy Seed',
    categoryId: 'seeds',
    price: 880,
    originalPrice: 980,
    unit: '10 kg Bag',
    rating: 4.8,
    reviewsCount: 98,
    stockQuantity: 85,
    lowStockThreshold: 15,
    isInStock: true,
    isArchived: false,
    sku: 'SEED-PAD-PR126',
    manufacturer: 'PAU Ludhiana Certified',
    gstRatePercent: 0,
    imageUrl: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80',
    description: 'Early maturing (123 days) high-yielding paddy seed developed by PAU Ludhiana. Conserves water and permits timely wheat sowing.',
    agriculturalUse: 'Kharif season transplantation for rapid biomass accumulation and drought avoidance.',
    cropCompatibility: ['Rice', 'Paddy'],
    dosageInstructions: '7-8 kg nursery seed per acre of main field.',
    safetyInformation: 'Treated with Carbendazim fungicide. Non-edible seed material.',
    isFeatured: true,
    isRecommended: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'prod_fert_npk_191919',
    name: 'AgroGold 100% Water Soluble NPK (19:19:19)',
    categoryId: 'fertilizers',
    price: 240,
    originalPrice: 300,
    unit: '1 kg Foil Pack',
    rating: 4.9,
    reviewsCount: 215,
    stockQuantity: 250,
    lowStockThreshold: 30,
    isInStock: true,
    isArchived: false,
    sku: 'FERT-NPK-191919',
    manufacturer: 'AgroGold Nutrients',
    gstRatePercent: 5,
    imageUrl: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=600&q=80',
    description: 'Balanced water-soluble fertilizer containing equal proportions of Nitrogen, Phosphorus, and Potassium for vegetative boost.',
    agriculturalUse: 'Foliar spray or fertigation through drip irrigation during early vegetative and branching phases.',
    cropCompatibility: ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Tomato', 'Maize', 'Potato'],
    activeIngredients: 'Total Nitrogen 19%, Available Phosphate 19%, Water Soluble Potash 19%',
    dosageInstructions: '5g per liter of water (1 kg per acre via drip or 750g in 150L water for foliar).',
    safetyInformation: 'Non-hazardous. Keep bag tightly sealed away from direct sunlight.',
    isFeatured: true,
    isRecommended: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'prod_fert_zinc_chelated_12',
    name: 'MicroZinc Chelated Zinc (Zn EDTA 12%)',
    categoryId: 'fertilizers',
    price: 360,
    originalPrice: 420,
    unit: '500 g Pack',
    rating: 4.8,
    reviewsCount: 89,
    stockQuantity: 140,
    lowStockThreshold: 20,
    isInStock: true,
    isArchived: false,
    sku: 'FERT-ZN-EDTA12',
    manufacturer: 'MicroNutrient Corp',
    gstRatePercent: 5,
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    description: 'Highly bioavailable chelated zinc formulation preventing Khaira disease in paddy and leaf bronzing in wheat and citrus.',
    agriculturalUse: 'Rapid zinc deficiency correction in alkaline, calcareous or waterlogged soils.',
    cropCompatibility: ['Rice', 'Wheat', 'Maize', 'Cotton', 'Citrus', 'Sugarcane'],
    activeIngredients: 'Zinc EDTA (Zn) 12.0% w/w',
    dosageInstructions: '1.0g to 1.5g per liter of water for foliar application at tillering stage.',
    safetyInformation: 'Wear protective glasses. Wash hands with soap after mixing.',
    isFeatured: false,
    isRecommended: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'prod_bio_mycorrhiza_granules',
    name: 'RootMax VAM Mycorrhiza Bio-Fertilizer Granules',
    categoryId: 'bio_fertilizers',
    price: 490,
    originalPrice: 600,
    unit: '4 kg Bucket',
    rating: 5.0,
    reviewsCount: 164,
    stockQuantity: 180,
    lowStockThreshold: 25,
    isInStock: true,
    isArchived: false,
    sku: 'BIO-MYC-VAM4K',
    manufacturer: 'EcoBio Agritech',
    gstRatePercent: 5,
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d69106093?auto=format&fit=crop&w=600&q=80',
    description: 'Endo-mycorrhizal fungal inoculant that extends root surface absorption by 400%, boosting Phosphorus and water uptake under moisture stress.',
    agriculturalUse: 'Soil application at time of basal sowing or transplanting.',
    cropCompatibility: ['All Crops', 'Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Vegetables', 'Orchards'],
    activeIngredients: 'Vesicular Arbuscular Mycorrhizae (100 IP/gm minimum)',
    dosageInstructions: '4 kg per acre mixed with organic manure or sand.',
    safetyInformation: '100% biological. Non-toxic to humans, bees, and soil microflora.',
    isFeatured: true,
    isRecommended: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'prod_prot_neem_azadirachtin_10000',
    name: 'BioShield 10,000 PPM Pure Cold-Pressed Neem Oil',
    categoryId: 'crop_protection',
    price: 450,
    originalPrice: 550,
    unit: '1 Liter Bottle',
    rating: 4.9,
    reviewsCount: 178,
    stockQuantity: 210,
    lowStockThreshold: 30,
    isInStock: true,
    isArchived: false,
    sku: 'PROT-NEEM-10000',
    manufacturer: 'Organic Agri Care',
    gstRatePercent: 5,
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
    description: 'High-potency botanical bio-insecticide repellent and anti-feedant for whiteflies, aphids, stem borers, and mites.',
    agriculturalUse: 'Preventive and curative foliar spray in organic and conventional farming.',
    cropCompatibility: ['All Crops', 'Cotton', 'Paddy', 'Vegetables', 'Pulses'],
    activeIngredients: 'Azadirachtin 1% (10,000 PPM w/w)',
    dosageInstructions: '3-4 ml per liter of water with a natural surfactant/soap.',
    safetyInformation: 'Store away from children in shade. Wear basic eye protection during spray.',
    isFeatured: true,
    isRecommended: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'prod_prot_fungi_tricoderma',
    name: 'TrichoShield Trichoderma Viride 1.5% WP Bio-Fungicide',
    categoryId: 'crop_protection',
    price: 290,
    originalPrice: 350,
    unit: '1 kg Pack',
    rating: 4.8,
    reviewsCount: 112,
    stockQuantity: 160,
    lowStockThreshold: 20,
    isInStock: true,
    isArchived: false,
    sku: 'PROT-TRICHO-1KG',
    manufacturer: 'BioFungus Biotech',
    gstRatePercent: 5,
    imageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80',
    description: 'Antagonistic fungal biocontrol agent that suppresses soil-borne pathogens causing Root Rot, Collar Rot, Damping Off, and Wilt.',
    agriculturalUse: 'Seed treatment, soil application, and root dipping.',
    cropCompatibility: ['Wheat', 'Rice', 'Cotton', 'Pulses', 'Oilseeds', 'Chilli', 'Tomato'],
    activeIngredients: 'Trichoderma viride spores (2 x 10^8 CFU/g min)',
    dosageInstructions: '10g/kg seed treatment or 2.5 kg/acre with 100 kg Farmyard Manure.',
    safetyInformation: 'Do not mix with chemical fungicides. Apply during evening hours.',
    isFeatured: false,
    isRecommended: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'prod_tool_sprayer_battery_16l',
    name: 'ProAgri 16L Battery Knapsack Sprayer (12V 12Ah Dual Pump)',
    categoryId: 'farm_tools',
    price: 3200,
    originalPrice: 3800,
    unit: '1 Unit Complete Set',
    rating: 4.9,
    reviewsCount: 92,
    stockQuantity: 45,
    lowStockThreshold: 10,
    isInStock: true,
    isArchived: false,
    sku: 'TOOL-SPRAY-16L',
    manufacturer: 'ProAgri Machinery',
    gstRatePercent: 12,
    imageUrl: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?auto=format&fit=crop&w=600&q=80',
    description: 'Heavy-duty agricultural sprayer with dual high-pressure diaphragm pump, telescopic stainless lance, and 4 multi-spray brass nozzles.',
    agriculturalUse: 'Uniform foliar application of fertilizers, bio-pesticides, and weedicides.',
    cropCompatibility: ['All Crops'],
    dosageInstructions: 'Full charge delivers 25-30 tanks (400-500L) continuous spraying.',
    safetyInformation: 'Rinse tank with clean water after spraying. Recharge every 30 days during off-season.',
    isFeatured: true,
    isRecommended: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'prod_irrig_drip_kit_1acre',
    name: 'PrecisionAqua Micro-Drip Lateral Irrigation Kit (1 Acre)',
    categoryId: 'irrigation',
    price: 12400,
    originalPrice: 14500,
    unit: '1 Complete Acre Kit',
    rating: 4.9,
    reviewsCount: 54,
    stockQuantity: 28,
    lowStockThreshold: 5,
    isInStock: true,
    isArchived: false,
    sku: 'IRR-DRIP-1ACRE',
    manufacturer: 'PrecisionAqua Systems',
    gstRatePercent: 12,
    imageUrl: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=600&q=80',
    description: 'Complete 1-acre drip kit including 16mm inline dripline (30cm spacing, 2.0 LPH), screen filter, control ball valves, joiners, and end plugs.',
    agriculturalUse: 'Water conservation, root-zone fertigation, and yield optimization for row crops.',
    cropCompatibility: ['Sugarcane', 'Cotton', 'Vegetables', 'Banana', 'Orchards'],
    dosageInstructions: 'Operates efficiently at 1.0 to 2.5 bar water pressure.',
    safetyInformation: 'Flush laterals once a month to prevent salt and silt buildup.',
    isFeatured: true,
    isRecommended: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'prod_test_digital_soil_ph_npk',
    name: 'AgriSensor Digital 4-in-1 Soil pH, Moisture & Sunlight Meter',
    categoryId: 'soil_testing',
    price: 1150,
    originalPrice: 1400,
    unit: '1 Meter Kit',
    rating: 4.7,
    reviewsCount: 76,
    stockQuantity: 60,
    lowStockThreshold: 12,
    isInStock: true,
    isArchived: false,
    sku: 'TEST-SOIL-PH4IN1',
    manufacturer: 'AgriSensor Instruments',
    gstRatePercent: 18,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    description: 'Instant digital field probe for evaluating soil pH range (3.5 - 9.0), root moisture level (5 levels), sunlight intensity, and soil temp.',
    agriculturalUse: 'Real-time agronomic soil diagnosis to adjust lime, gypsum, and irrigation schedules.',
    cropCompatibility: ['All Crops'],
    dosageInstructions: 'Insert probe 4-6 inches into moist soil for 60 seconds.',
    safetyInformation: 'Clean probes with soft cloth after each reading. Keep battery compartment dry.',
    isFeatured: true,
    isRecommended: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'prod_safe_respirator_gloves_set',
    name: 'AgriSafe Chemical Applicator Protection Suit & Mask',
    categoryId: 'safety',
    price: 799,
    originalPrice: 999,
    unit: '1 Full Protective Set',
    rating: 4.9,
    reviewsCount: 88,
    stockQuantity: 90,
    lowStockThreshold: 20,
    isInStock: true,
    isArchived: false,
    sku: 'SAFE-CHEM-SUIT',
    manufacturer: 'AgriSafe PPE',
    gstRatePercent: 12,
    imageUrl: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=600&q=80',
    description: 'Certified particulate respirator mask (KN95/N95 standard), chemical-resistant nitrile gauntlets, and anti-fog safety eye shield.',
    agriculturalUse: 'Essential personal protective equipment for pesticide, fungicide, and chemical fertilizer handling.',
    cropCompatibility: ['All Crops'],
    dosageInstructions: 'Wear during all mixing and spraying operations.',
    safetyInformation: 'Rinse nitrile gloves after use. Replace particulate filters as per hours logged.',
    isFeatured: false,
    isRecommended: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  }
];

export let AGRI_CATEGORIES: ProductCategory[] = INITIAL_CATEGORIES;
export let AGRI_PRODUCTS_CATALOG: AgriProduct[] = INITIAL_PRODUCTS_CATALOG;

// ==========================================
// PERSISTENCE HELPERS
// ==========================================

function mapSupabaseProduct(p: any): AgriProduct {
  return {
    id: p.id,
    name: p.name,
    categoryId: p.category_id || p.categoryId,
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
    unit: p.unit || '1 Unit',
    rating: p.rating ? Number(p.rating) : 4.8,
    reviewsCount: p.reviews_count || 0,
    stockQuantity: Number(p.stock_quantity ?? p.stockQuantity ?? 50),
    lowStockThreshold: p.low_stock_threshold !== undefined ? Number(p.low_stock_threshold) : 10,
    isInStock: Boolean(p.is_in_stock ?? (Number(p.stock_quantity) > 0)),
    isArchived: Boolean(p.is_archived),
    imageUrl: p.image_url || p.imageUrl || '',
    description: p.description || '',
    agriculturalUse: p.agricultural_use || p.agriculturalUse || '',
    cropCompatibility: Array.isArray(p.crop_compatibility) ? p.crop_compatibility : (Array.isArray(p.cropCompatibility) ? p.cropCompatibility : ['All Crops']),
    activeIngredients: p.active_ingredients || p.activeIngredients || '',
    dosageInstructions: p.dosage_instructions || p.dosageInstructions || '',
    safetyInformation: p.safety_information || p.safetyInformation || '',
    isFeatured: Boolean(p.is_featured ?? p.isFeatured),
    isRecommended: Boolean(p.is_recommended ?? p.isRecommended),
    sku: p.sku || '',
    manufacturer: p.manufacturer || '',
    gstRatePercent: p.gst_rate_percent !== undefined ? Number(p.gst_rate_percent) : 5,
    createdAt: p.created_at || p.createdAt || new Date().toISOString(),
    updatedAt: p.updated_at || p.updatedAt || new Date().toISOString(),
  };
}

function mapProductToSupabase(p: AgriProduct): any {
  return {
    id: p.id,
    name: p.name,
    category_id: p.categoryId,
    price: p.price,
    original_price: p.originalPrice || null,
    unit: p.unit,
    rating: p.rating,
    reviews_count: p.reviewsCount,
    stock_quantity: p.stockQuantity,
    low_stock_threshold: p.lowStockThreshold || 10,
    is_in_stock: p.stockQuantity > 0,
    is_archived: Boolean(p.isArchived),
    image_url: p.imageUrl,
    description: p.description,
    agricultural_use: p.agriculturalUse,
    crop_compatibility: p.cropCompatibility,
    active_ingredients: p.activeIngredients || null,
    dosage_instructions: p.dosageInstructions || null,
    safety_information: p.safetyInformation || null,
    is_featured: Boolean(p.isFeatured),
    is_recommended: Boolean(p.isRecommended),
    sku: p.sku || null,
    manufacturer: p.manufacturer || null,
    gst_rate_percent: p.gstRatePercent || 5,
    updated_at: new Date().toISOString()
  };
}

export function readProducts(): AgriProduct[] {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        AGRI_PRODUCTS_CATALOG = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading products catalog from file:', err);
  }
  saveProducts(INITIAL_PRODUCTS_CATALOG);
  return INITIAL_PRODUCTS_CATALOG;
}

export function saveProducts(products: AgriProduct[]) {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
    AGRI_PRODUCTS_CATALOG = products;
  } catch (err) {
    console.error('Error saving products catalog:', err);
  }
}

export function readCategories(): ProductCategory[] {
  try {
    if (fs.existsSync(CATEGORIES_FILE)) {
      const data = fs.readFileSync(CATEGORIES_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        AGRI_CATEGORIES = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading categories from file:', err);
  }
  saveCategories(INITIAL_CATEGORIES);
  return INITIAL_CATEGORIES;
}

export function saveCategories(categories: ProductCategory[]) {
  try {
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2), 'utf-8');
    AGRI_CATEGORIES = categories;
  } catch (err) {
    console.error('Error saving categories:', err);
  }
}

export function readInventoryLogs(): InventoryLog[] {
  try {
    if (fs.existsSync(INVENTORY_LOGS_FILE)) {
      const data = fs.readFileSync(INVENTORY_LOGS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading inventory logs:', err);
  }
  return [];
}

export function saveInventoryLogs(logs: InventoryLog[]) {
  try {
    fs.writeFileSync(INVENTORY_LOGS_FILE, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving inventory logs:', err);
  }
}

export function readNotifications(): AdminBroadcastNotification[] {
  try {
    if (fs.existsSync(NOTIFICATIONS_FILE)) {
      const data = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading notifications:', err);
  }
  return [];
}

export function saveNotifications(notifications: AdminBroadcastNotification[]) {
  try {
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving notifications:', err);
  }
}

export function readAlerts(): AdminOperationalAlert[] {
  try {
    if (fs.existsSync(ALERTS_FILE)) {
      const data = fs.readFileSync(ALERTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading alerts:', err);
  }
  return [];
}

export function saveAlerts(alerts: AdminOperationalAlert[]) {
  try {
    fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving alerts:', err);
  }
}

export function readCarts(): Record<string, FarmerCart> {
  try {
    if (fs.existsSync(CARTS_FILE)) {
      const data = fs.readFileSync(CARTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading farmer carts:', err);
  }
  return {};
}

function saveCarts(carts: Record<string, FarmerCart>) {
  try {
    fs.writeFileSync(CARTS_FILE, JSON.stringify(carts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving farmer carts:', err);
  }
}

export function readOrders(): FarmerOrder[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading farmer orders:', err);
  }
  return [];
}

export function saveOrders(orders: FarmerOrder[]) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving farmer orders:', err);
  }
}

readProducts();
readCategories();

// ==========================================
// SUPABASE AUTHORITATIVE SYNCHRONIZATION ENGINE
// ==========================================

export async function syncStoreWithSupabase(): Promise<void> {
  const { client, isConfigured } = getSupabase();
  if (!isConfigured || !client) return;

  try {
    // 1. Sync Categories
    const { data: dbCategories, error: catErr } = await client.from('product_categories').select('*').order('display_order');
    if (!catErr && dbCategories && dbCategories.length > 0) {
      const mappedCats: ProductCategory[] = dbCategories.map(c => ({
        id: c.id,
        name: c.name,
        icon: c.icon || '🌾',
        description: c.description || '',
        displayOrder: c.display_order ?? 0,
        isArchived: Boolean(c.is_archived)
      }));
      AGRI_CATEGORIES = mappedCats;
      saveCategories(mappedCats);
    } else if (!catErr && (!dbCategories || dbCategories.length === 0)) {
      const seedCats = INITIAL_CATEGORIES.map(c => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        description: c.description,
        display_order: c.displayOrder
      }));
      await client.from('product_categories').upsert(seedCats);
    }

    // 2. Sync Products
    const { data: dbProducts, error: prodErr } = await client.from('products').select('*');
    if (!prodErr && dbProducts && dbProducts.length > 0) {
      const mappedProducts = dbProducts.map(mapSupabaseProduct);
      AGRI_PRODUCTS_CATALOG = mappedProducts;
      saveProducts(mappedProducts);
    } else if (!prodErr && (!dbProducts || dbProducts.length === 0)) {
      const seedProds = INITIAL_PRODUCTS_CATALOG.map(mapProductToSupabase);
      await client.from('products').upsert(seedProds);
    }

    // 3. Sync Orders
    const { data: dbOrders, error: orderErr } = await client
      .from('farmer_orders')
      .select('*, farmer_order_items(*)')
      .order('created_at', { ascending: false });

    if (!orderErr && dbOrders && dbOrders.length > 0) {
      const mappedOrders: FarmerOrder[] = dbOrders.map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        mobile: o.mobile,
        farmerName: o.farmer_name,
        status: o.status,
        subtotal: Number(o.subtotal),
        discount: Number(o.discount || 0),
        deliveryCharge: Number(o.delivery_charge || 0),
        grandTotal: Number(o.grand_total),
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        deliveryAddress: typeof o.delivery_address === 'string' ? JSON.parse(o.delivery_address) : o.delivery_address,
        items: (o.farmer_order_items || []).map((item: any) => ({
          productId: item.product_id,
          productName: item.product_name,
          unitPrice: Number(item.unit_price),
          quantity: Number(item.quantity),
          lineTotal: Number(item.line_total),
          unit: item.unit || 'Unit',
          imageUrl: item.image_url || ''
        })),
        notes: o.notes,
        createdAt: o.created_at,
        updatedAt: o.updated_at
      }));
      saveOrders(mappedOrders);
    }
  } catch (err) {
    console.warn('[AgriStore] Supabase auto-sync notice:', err);
  }
}

syncStoreWithSupabase().catch(() => {});

// ==========================================
// STORE QUERY & CART OPERATIONS
// ==========================================

export function getProductById(productId: string): AgriProduct | undefined {
  return AGRI_PRODUCTS_CATALOG.find(p => p.id === productId);
}

export function getCatalog(params: {
  category?: string;
  crop?: string;
  categoryId?: string;
  cropName?: string;
  search?: string;
  featuredOnly?: boolean;
}): { products: AgriProduct[]; categories: ProductCategory[] } {
  let filtered = [...AGRI_PRODUCTS_CATALOG];

  const targetCategory = params.category || params.categoryId;
  const targetCrop = params.crop || params.cropName;

  if (targetCategory && targetCategory !== 'all') {
    filtered = filtered.filter(p => p.categoryId === targetCategory);
  }

  if (targetCrop && targetCrop.trim() !== '') {
    const cropLower = targetCrop.toLowerCase().trim();
    filtered = filtered.map(p => {
      const matches = p.cropCompatibility.some(c => 
        c.toLowerCase().includes(cropLower) || cropLower.includes(c.toLowerCase()) || c === 'All Crops'
      );
      return {
        ...p,
        isRecommended: matches || p.isRecommended
      };
    });
  }

  if (params.search && params.search.trim() !== '') {
    const s = params.search.toLowerCase().trim();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(s) ||
      p.description.toLowerCase().includes(s) ||
      p.agriculturalUse.toLowerCase().includes(s) ||
      p.cropCompatibility.some(c => c.toLowerCase().includes(s))
    );
  }

  if (params.featuredOnly) {
    filtered = filtered.filter(p => p.isFeatured);
  }

  return {
    products: filtered,
    categories: AGRI_CATEGORIES,
  };
}

export const getCatalogProducts = getCatalog;

export function getFarmerCart(mobile: string): {
  mobile: string;
  items: (CartItem & { lineTotal: number })[];
  itemCount: number;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  grandTotal: number;
} {
  const cleanMobile = mobile.trim();
  const carts = readCarts();
  const rawCart = carts[cleanMobile] || { mobile: cleanMobile, items: [], updatedAt: new Date().toISOString() };

  let subtotal = 0;
  let itemCount = 0;

  const items: (CartItem & { lineTotal: number })[] = [];

  for (const rawItem of rawCart.items) {
    const product = getProductById(rawItem.productId);
    if (product) {
      const lineTotal = product.price * rawItem.quantity;
      subtotal += lineTotal;
      itemCount += rawItem.quantity;
      items.push({
        productId: rawItem.productId,
        quantity: rawItem.quantity,
        product,
        lineTotal
      });
    }
  }

  const deliveryCharge = subtotal > 999 || subtotal === 0 ? 0 : 50;
  const discount = subtotal >= 2000 ? Math.round(subtotal * 0.05) : 0;
  const grandTotal = Math.max(0, subtotal - discount + deliveryCharge);

  return {
    mobile: cleanMobile,
    items,
    itemCount,
    subtotal,
    deliveryCharge,
    discount,
    grandTotal
  };
}

export function addToCart(mobile: string, productId: string, quantity: number = 1) {
  const cleanMobile = mobile.trim();
  const product = getProductById(productId);
  if (!product) {
    throw new Error('Product not found in catalog.');
  }

  const carts = readCarts();
  const cart = carts[cleanMobile] || { mobile: cleanMobile, items: [], updatedAt: new Date().toISOString() };

  const existingIdx = cart.items.findIndex(i => i.productId === productId);
  if (existingIdx >= 0) {
    cart.items[existingIdx].quantity = Math.min(
      product.stockQuantity,
      cart.items[existingIdx].quantity + quantity
    );
  } else {
    cart.items.push({
      productId,
      quantity: Math.min(product.stockQuantity, Math.max(1, quantity))
    });
  }

  cart.updatedAt = new Date().toISOString();
  carts[cleanMobile] = cart;
  saveCarts(carts);

  // Sync with Supabase
  const { client, isConfigured } = getSupabase();
  if (isConfigured && client) {
    (async () => {
      try {
        const { data: cartRecord } = await client
          .from('farmer_carts')
          .upsert({ mobile: cleanMobile, updated_at: new Date().toISOString() }, { onConflict: 'mobile' })
          .select()
          .single();

        if (cartRecord) {
          const item = cart.items.find(i => i.productId === productId);
          if (item) {
            await client.from('farmer_cart_items').upsert({
              cart_id: cartRecord.id,
              product_id: productId,
              quantity: item.quantity,
              updated_at: new Date().toISOString()
            });
          }
        }
      } catch (err) {
        console.warn('[Supabase Cart Sync Notice]:', err);
      }
    })();
  }

  return getFarmerCart(cleanMobile);
}

export function updateCartItemQuantity(mobile: string, productId: string, quantity: number) {
  const cleanMobile = mobile.trim();
  const carts = readCarts();
  const cart = carts[cleanMobile];

  if (!cart) {
    return getFarmerCart(cleanMobile);
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter(i => i.productId !== productId);
  } else {
    const product = getProductById(productId);
    const item = cart.items.find(i => i.productId === productId);
    if (item && product) {
      item.quantity = Math.min(product.stockQuantity, quantity);
    }
  }

  cart.updatedAt = new Date().toISOString();
  carts[cleanMobile] = cart;
  saveCarts(carts);

  return getFarmerCart(cleanMobile);
}

export function clearCart(mobile: string) {
  const cleanMobile = mobile.trim();
  const carts = readCarts();
  if (carts[cleanMobile]) {
    carts[cleanMobile].items = [];
    carts[cleanMobile].updatedAt = new Date().toISOString();
    saveCarts(carts);
  }

  const { client, isConfigured } = getSupabase();
  if (isConfigured && client) {
    (async () => {
      try {
        const { data: cartRecord } = await client.from('farmer_carts').select('id').eq('mobile', cleanMobile).single();
        if (cartRecord) {
          await client.from('farmer_cart_items').delete().eq('cart_id', cartRecord.id);
        }
      } catch (err) {
        console.warn('[Supabase Clear Cart Notice]:', err);
      }
    })();
  }

  return getFarmerCart(cleanMobile);
}

export function createFarmerOrder(params: {
  mobile: string;
  farmerName: string;
  deliveryAddress: DeliveryAddress;
  paymentMethod: 'COD' | 'UPI' | 'NET_BANKING';
  notes?: string;
}): FarmerOrder {
  const cleanMobile = params.mobile.trim();
  const hydratedCart = getFarmerCart(cleanMobile);

  if (!hydratedCart.items || hydratedCart.items.length === 0) {
    throw new Error('Your cart is empty. Add products before placing an order.');
  }

  if (!params.deliveryAddress.recipientName || !params.deliveryAddress.phoneNumber || !params.deliveryAddress.streetAddress || !params.deliveryAddress.district || !params.deliveryAddress.state) {
    throw new Error('Please provide complete delivery address details.');
  }

  const orderItems: OrderItem[] = [];
  let calculatedSubtotal = 0;

  for (const item of hydratedCart.items) {
    const product = getProductById(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} is no longer available.`);
    }

    if (!product.isInStock || product.stockQuantity < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`);
    }

    const lineTotal = product.price * item.quantity;
    calculatedSubtotal += lineTotal;

    orderItems.push({
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      quantity: item.quantity,
      lineTotal,
      unit: product.unit,
      imageUrl: product.imageUrl,
    });
  }

  const deliveryCharge = calculatedSubtotal > 999 ? 0 : 50;
  const discount = calculatedSubtotal >= 2000 ? Math.round(calculatedSubtotal * 0.05) : 0;
  const grandTotal = Math.max(0, calculatedSubtotal - discount + deliveryCharge);

  const orderNumber = `CRX-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
  const now = new Date().toISOString();

  const newOrder: FarmerOrder = {
    id: `ord_${crypto.randomUUID()}`,
    orderNumber,
    mobile: cleanMobile,
    farmerName: params.farmerName || params.deliveryAddress.recipientName,
    status: 'PLACED',
    subtotal: calculatedSubtotal,
    discount,
    deliveryCharge,
    grandTotal,
    paymentMethod: params.paymentMethod || 'COD',
    paymentStatus: params.paymentMethod === 'COD' ? 'PENDING' : 'PAID',
    deliveryAddress: params.deliveryAddress,
    items: orderItems,
    notes: params.notes,
    createdAt: now,
    updatedAt: now,
  };

  const orders = readOrders();
  orders.unshift(newOrder);
  saveOrders(orders);

  clearCart(cleanMobile);

  // Authoritative Supabase persistence
  const { client, isConfigured } = getSupabase();
  if (isConfigured && client) {
    (async () => {
      try {
        const { data: insertedOrder, error: oErr } = await client.from('farmer_orders').insert({
          id: newOrder.id,
          order_number: newOrder.orderNumber,
          mobile: newOrder.mobile,
          farmer_name: newOrder.farmerName,
          status: newOrder.status,
          subtotal: newOrder.subtotal,
          discount: newOrder.discount,
          delivery_charge: newOrder.deliveryCharge,
          grand_total: newOrder.grandTotal,
          payment_method: newOrder.paymentMethod,
          payment_status: newOrder.paymentStatus,
          delivery_address: newOrder.deliveryAddress,
          notes: newOrder.notes || null,
          created_at: newOrder.createdAt,
          updated_at: newOrder.updatedAt
        }).select().single();

        if (insertedOrder && !oErr) {
          const lineRows = newOrder.items.map(item => ({
            order_id: insertedOrder.id,
            product_id: item.productId,
            product_name: item.productName,
            unit_price: item.unitPrice,
            quantity: item.quantity,
            line_total: item.lineTotal,
            unit: item.unit,
            image_url: item.imageUrl
          }));
          await client.from('farmer_order_items').insert(lineRows);
        }
      } catch (err) {
        console.warn('[Supabase Order Insert Notice]:', err);
      }
    })();
  }

  return newOrder;
}

export function getFarmerOrders(mobile: string): FarmerOrder[] {
  const cleanMobile = mobile.trim();
  const orders = readOrders();
  return orders.filter(o => o.mobile === cleanMobile);
}

export function getOrderDetails(orderIdOrNumber: string): FarmerOrder | undefined {
  const orders = readOrders();
  return orders.find(o => o.id === orderIdOrNumber || o.orderNumber === orderIdOrNumber);
}

// ============================================================
// ADMIN COMMAND CENTER: PRODUCT MANAGEMENT
// ============================================================

export function getAllProductsAdmin(options?: {
  search?: string;
  categoryId?: string;
  status?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'archived';
  sortBy?: 'name' | 'price' | 'stock' | 'newest';
  sortOrder?: 'asc' | 'desc';
}) {
  const products = readProducts();
  const categories = readCategories();
  let filtered = [...products];

  if (options?.categoryId && options.categoryId !== 'all') {
    filtered = filtered.filter(p => p.categoryId === options.categoryId);
  }

  if (options?.search && options.search.trim()) {
    const s = options.search.toLowerCase().trim();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(s) ||
      (p.sku && p.sku.toLowerCase().includes(s)) ||
      (p.manufacturer && p.manufacturer.toLowerCase().includes(s)) ||
      p.description.toLowerCase().includes(s) ||
      p.cropCompatibility.some(c => c.toLowerCase().includes(s))
    );
  }

  if (options?.status) {
    if (options.status === 'archived') {
      filtered = filtered.filter(p => p.isArchived);
    } else {
      filtered = filtered.filter(p => !p.isArchived);
      if (options.status === 'in_stock') {
        filtered = filtered.filter(p => p.stockQuantity > (p.lowStockThreshold || 10));
      } else if (options.status === 'low_stock') {
        filtered = filtered.filter(p => p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockThreshold || 10));
      } else if (options.status === 'out_of_stock') {
        filtered = filtered.filter(p => p.stockQuantity <= 0);
      }
    }
  }

  const order = options?.sortOrder === 'desc' ? -1 : 1;
  if (options?.sortBy === 'price') {
    filtered.sort((a, b) => (a.price - b.price) * order);
  } else if (options?.sortBy === 'stock') {
    filtered.sort((a, b) => (a.stockQuantity - b.stockQuantity) * order);
  } else if (options?.sortBy === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name) * order);
  } else {
    filtered.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
  }

  const enriched = filtered.map(p => {
    const cat = categories.find(c => c.id === p.categoryId);
    const lowThresh = p.lowStockThreshold || 10;
    let stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
    if (p.stockQuantity <= 0) stockStatus = 'OUT_OF_STOCK';
    else if (p.stockQuantity <= lowThresh) stockStatus = 'LOW_STOCK';

    return {
      ...p,
      categoryName: cat ? cat.name : p.categoryId,
      categoryIcon: cat ? cat.icon : '🌾',
      stockStatus
    };
  });

  return {
    total: products.length,
    filteredCount: enriched.length,
    products: enriched
  };
}

export function createProductAdmin(data: Partial<AgriProduct>, adminName: string = 'Admin'): AgriProduct {
  if (!data.name || !data.categoryId || data.price === undefined) {
    throw new Error('Product name, category, and price are required.');
  }

  const products = readProducts();
  const id = `prod_${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  const stockQty = Number(data.stockQuantity) || 0;
  const price = Number(data.price) || 0;
  const origPrice = data.originalPrice ? Number(data.originalPrice) : Math.round(price * 1.15);

  const newProduct: AgriProduct = {
    id,
    name: data.name.trim(),
    categoryId: data.categoryId,
    price,
    originalPrice: origPrice,
    unit: data.unit || '1 Unit',
    rating: data.rating || 5.0,
    reviewsCount: data.reviewsCount || 0,
    stockQuantity: stockQty,
    lowStockThreshold: data.lowStockThreshold !== undefined ? Number(data.lowStockThreshold) : 10,
    isInStock: stockQty > 0,
    isArchived: false,
    imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=600&q=80',
    description: data.description || '',
    agriculturalUse: data.agriculturalUse || '',
    cropCompatibility: Array.isArray(data.cropCompatibility) && data.cropCompatibility.length > 0 ? data.cropCompatibility : ['All Crops'],
    activeIngredients: data.activeIngredients || '',
    dosageInstructions: data.dosageInstructions || '',
    safetyInformation: data.safetyInformation || '',
    isFeatured: !!data.isFeatured,
    isRecommended: !!data.isRecommended,
    sku: data.sku || `SKU-${Date.now().toString().slice(-6)}`,
    manufacturer: data.manufacturer || 'CroperX AgriTech Certified',
    gstRatePercent: data.gstRatePercent !== undefined ? Number(data.gstRatePercent) : 5,
    createdAt: now,
    updatedAt: now
  };

  products.unshift(newProduct);
  saveProducts(products);

  const logs = readInventoryLogs();
  logs.unshift({
    id: `inv_${Date.now()}`,
    productId: id,
    productName: newProduct.name,
    operation: 'ADD',
    quantityChanged: stockQty,
    previousStock: 0,
    newStock: stockQty,
    reason: 'Initial catalog creation',
    adminName,
    timestamp: now
  });
  saveInventoryLogs(logs);

  const { client, isConfigured } = getSupabase();
  if (isConfigured && client) {
    (async () => {
      try {
        await client.from('products').upsert(mapProductToSupabase(newProduct));
      } catch (err) {
        console.warn('[Supabase Create Product Notice]:', err);
      }
    })();
  }

  return newProduct;
}

export function updateProductAdmin(productId: string, updates: Partial<AgriProduct>, adminName: string = 'Admin'): AgriProduct {
  const products = readProducts();
  const idx = products.findIndex(p => p.id === productId);
  if (idx === -1) {
    throw new Error('Product not found.');
  }

  const prev = products[idx];
  const now = new Date().toISOString();

  if (updates.stockQuantity !== undefined && Number(updates.stockQuantity) !== prev.stockQuantity) {
    const diff = Number(updates.stockQuantity) - prev.stockQuantity;
    const logs = readInventoryLogs();
    logs.unshift({
      id: `inv_${Date.now()}`,
      productId: prev.id,
      productName: prev.name,
      operation: 'SET',
      quantityChanged: diff,
      previousStock: prev.stockQuantity,
      newStock: Number(updates.stockQuantity),
      reason: 'Admin updated product stock details',
      adminName,
      timestamp: now
    });
    saveInventoryLogs(logs);
  }

  const updatedStock = updates.stockQuantity !== undefined ? Number(updates.stockQuantity) : prev.stockQuantity;

  const updatedProduct: AgriProduct = {
    ...prev,
    ...updates,
    stockQuantity: updatedStock,
    isInStock: updatedStock > 0,
    updatedAt: now
  };

  products[idx] = updatedProduct;
  saveProducts(products);

  const { client, isConfigured } = getSupabase();
  if (isConfigured && client) {
    (async () => {
      try {
        await client.from('products').update(mapProductToSupabase(updatedProduct)).eq('id', productId);
      } catch (err) {
        console.warn('[Supabase Update Product Notice]:', err);
      }
    })();
  }

  return updatedProduct;
}

export function archiveProductAdmin(productId: string, adminName: string = 'Admin'): AgriProduct {
  return updateProductAdmin(productId, { isArchived: true }, adminName);
}

export function restoreProductAdmin(productId: string, adminName: string = 'Admin'): AgriProduct {
  return updateProductAdmin(productId, { isArchived: false }, adminName);
}

export function duplicateProductAdmin(productId: string, adminName: string = 'Admin'): AgriProduct {
  const products = readProducts();
  const original = products.find(p => p.id === productId);
  if (!original) {
    throw new Error('Original product not found.');
  }

  const { id: _, ...rest } = original;
  return createProductAdmin({
    ...rest,
    name: `${original.name} (Copy)`,
    sku: `${original.sku || 'SKU'}-COPY-${Date.now().toString().slice(-4)}`
  }, adminName);
}

export function deleteProductAdmin(productId: string, adminName: string = 'Admin'): { success: boolean; message: string } {
  const orders = readOrders();
  const isUsedInOrders = orders.some(o => o.items.some(i => i.productId === productId));

  if (isUsedInOrders) {
    archiveProductAdmin(productId, adminName);
    return {
      success: true,
      message: 'Product is linked to historic customer orders; archived successfully to preserve audit history.'
    };
  }

  const products = readProducts();
  const filtered = products.filter(p => p.id !== productId);
  saveProducts(filtered);

  const { client, isConfigured } = getSupabase();
  if (isConfigured && client) {
    (async () => {
      try {
        await client.from('products').delete().eq('id', productId);
      } catch (err) {
        console.warn('[Supabase Delete Product Notice]:', err);
      }
    })();
  }

  return { success: true, message: 'Product deleted permanently.' };
}

// ============================================================
// ADMIN COMMAND CENTER: CATEGORY MANAGEMENT
// ============================================================

export function getAllCategoriesAdmin() {
  const categories = readCategories();
  const products = readProducts();

  return categories.map(cat => {
    const count = products.filter(p => p.categoryId === cat.id && !p.isArchived).length;
    return {
      ...cat,
      itemCount: count
    };
  });
}

export function createCategoryAdmin(data: Partial<ProductCategory>): ProductCategory {
  if (!data.name) {
    throw new Error('Category name is required.');
  }

  const categories = readCategories();
  const id = data.id || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  
  if (categories.some(c => c.id === id)) {
    throw new Error('Category with this ID/name already exists.');
  }

  const newCategory: ProductCategory = {
    id,
    name: data.name.trim(),
    icon: data.icon || '🌾',
    description: data.description || '',
    displayOrder: data.displayOrder !== undefined ? Number(data.displayOrder) : categories.length,
    isArchived: false
  };

  categories.push(newCategory);
  saveCategories(categories);

  const { client, isConfigured } = getSupabase();
  if (isConfigured && client) {
    (async () => {
      try {
        await client.from('product_categories').upsert({
          id: newCategory.id,
          name: newCategory.name,
          icon: newCategory.icon,
          description: newCategory.description,
          display_order: newCategory.displayOrder,
          is_archived: false
        });
      } catch (err) {
        console.warn('[Supabase Create Category Notice]:', err);
      }
    })();
  }

  return newCategory;
}

export function updateCategoryAdmin(categoryId: string, updates: Partial<ProductCategory>): ProductCategory {
  const categories = readCategories();
  const idx = categories.findIndex(c => c.id === categoryId);
  if (idx === -1) {
    throw new Error('Category not found.');
  }

  const updated: ProductCategory = {
    ...categories[idx],
    ...updates
  };

  categories[idx] = updated;
  saveCategories(categories);

  const { client, isConfigured } = getSupabase();
  if (isConfigured && client) {
    (async () => {
      try {
        await client.from('product_categories').update({
          name: updated.name,
          icon: updated.icon,
          description: updated.description,
          display_order: updated.displayOrder,
          is_archived: Boolean(updated.isArchived)
        }).eq('id', categoryId);
      } catch (err) {
        console.warn('[Supabase Update Category Notice]:', err);
      }
    })();
  }

  return updated;
}

export function archiveCategoryAdmin(categoryId: string): ProductCategory {
  return updateCategoryAdmin(categoryId, { isArchived: true });
}

export function restoreCategoryAdmin(categoryId: string): ProductCategory {
  return updateCategoryAdmin(categoryId, { isArchived: false });
}

// ============================================================
// ADMIN COMMAND CENTER: INVENTORY MANAGEMENT
// ============================================================

export function adjustInventoryAdmin(params: {
  productId: string;
  operation: 'ADD' | 'SUBTRACT' | 'SET';
  adjustment: number;
  reason: string;
  adminName: string;
  lowStockThreshold?: number;
}): { product: AgriProduct; log: InventoryLog } {
  const { productId, operation, adjustment, reason, adminName, lowStockThreshold } = params;
  const products = readProducts();
  const idx = products.findIndex(p => p.id === productId);

  if (idx === -1) {
    throw new Error('Product not found.');
  }

  const product = products[idx];
  const prevStock = product.stockQuantity;
  let newStock = prevStock;

  if (operation === 'ADD') {
    newStock = prevStock + Math.abs(adjustment);
  } else if (operation === 'SUBTRACT') {
    newStock = Math.max(0, prevStock - Math.abs(adjustment));
  } else if (operation === 'SET') {
    newStock = Math.max(0, adjustment);
  }

  const quantityChanged = newStock - prevStock;
  const now = new Date().toISOString();

  product.stockQuantity = newStock;
  product.isInStock = newStock > 0;
  if (lowStockThreshold !== undefined) {
    product.lowStockThreshold = lowStockThreshold;
  }
  product.updatedAt = now;
  products[idx] = product;
  saveProducts(products);

  const log: InventoryLog = {
    id: `inv_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
    productId: product.id,
    productName: product.name,
    operation,
    quantityChanged,
    previousStock: prevStock,
    newStock,
    reason: reason || 'Inventory manual adjustment by admin',
    adminName: adminName || 'Admin',
    timestamp: now
  };

  const logs = readInventoryLogs();
  logs.unshift(log);
  saveInventoryLogs(logs);

  const { client, isConfigured } = getSupabase();
  if (isConfigured && client) {
    (async () => {
      try {
        await client.from('products').update({
          stock_quantity: newStock,
          is_in_stock: newStock > 0,
          low_stock_threshold: product.lowStockThreshold || 10,
          updated_at: now
        }).eq('id', product.id);
      } catch (err) {
        console.warn('[Supabase Inventory Adjust Notice]:', err);
      }
    })();
  }

  return { product, log };
}

export function getInventoryTransactions(productId?: string): InventoryLog[] {
  const logs = readInventoryLogs();
  if (productId && productId !== 'all') {
    return logs.filter(l => l.productId === productId);
  }
  return logs;
}

// ============================================================
// ADMIN COMMAND CENTER: ORDERS MANAGEMENT
// ============================================================

export function getAllOrdersAdmin(options?: {
  search?: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  limit?: number;
  page?: number;
}) {
  const orders = readOrders();
  let filtered = [...orders];

  if (options?.status && options.status !== 'all') {
    filtered = filtered.filter(o => o.status === options.status);
  }

  if (options?.paymentStatus && options.paymentStatus !== 'all') {
    filtered = filtered.filter(o => o.paymentStatus === options.paymentStatus);
  }

  if (options?.paymentMethod && options.paymentMethod !== 'all') {
    filtered = filtered.filter(o => o.paymentMethod === options.paymentMethod);
  }

  if (options?.search && options.search.trim()) {
    const s = options.search.toLowerCase().trim();
    filtered = filtered.filter(o =>
      o.orderNumber.toLowerCase().includes(s) ||
      o.farmerName.toLowerCase().includes(s) ||
      o.mobile.includes(s) ||
      o.deliveryAddress.district.toLowerCase().includes(s) ||
      o.deliveryAddress.state.toLowerCase().includes(s)
    );
  }

  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalCount = filtered.length;
  const page = options?.page || 1;
  const limit = options?.limit || 50;
  const startIndex = (page - 1) * limit;
  const paginatedOrders = filtered.slice(startIndex, startIndex + limit);

  const totalRevenue = orders
    .filter(o => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const statusBreakdown = {
    PLACED: orders.filter(o => o.status === 'PLACED').length,
    CONFIRMED: orders.filter(o => o.status === 'CONFIRMED').length,
    PROCESSING: orders.filter(o => o.status === 'PROCESSING').length,
    DISPATCHED: orders.filter(o => o.status === 'DISPATCHED').length,
    OUT_FOR_DELIVERY: orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length,
    DELIVERED: orders.filter(o => o.status === 'DELIVERED').length,
    CANCELLED: orders.filter(o => o.status === 'CANCELLED').length,
  };

  return {
    orders: paginatedOrders,
    totalCount,
    page,
    totalPages: Math.ceil(totalCount / limit) || 1,
    totalRevenue,
    statusBreakdown
  };
}

export function updateOrderStatusAdmin(orderId: string, params: {
  status: FarmerOrder['status'];
  paymentStatus?: FarmerOrder['paymentStatus'];
  internalNote?: string;
  updatedBy?: string;
}): FarmerOrder {
  const orders = readOrders();
  const idx = orders.findIndex(o => o.id === orderId || o.orderNumber === orderId);

  if (idx === -1) {
    throw new Error('Order not found.');
  }

  const prev = orders[idx];
  const now = new Date().toISOString();

  if (params.status === 'CANCELLED' && prev.status !== 'CANCELLED') {
    const products = readProducts();
    for (const item of prev.items) {
      const pIdx = products.findIndex(p => p.id === item.productId);
      if (pIdx !== -1) {
        products[pIdx].stockQuantity += item.quantity;
        products[pIdx].isInStock = true;
      }
    }
    saveProducts(products);
  }

  const updated: FarmerOrder = {
    ...prev,
    status: params.status || prev.status,
    paymentStatus: params.paymentStatus || (params.status === 'DELIVERED' ? 'PAID' : prev.paymentStatus),
    notes: params.internalNote ? `${prev.notes ? prev.notes + ' | ' : ''}${params.internalNote}` : prev.notes,
    updatedAt: now
  };

  orders[idx] = updated;
  saveOrders(orders);

  const { client, isConfigured } = getSupabase();
  if (isConfigured && client) {
    (async () => {
      try {
        await client.from('farmer_orders').update({
          status: updated.status,
          payment_status: updated.paymentStatus,
          notes: updated.notes || null,
          updated_at: now
        }).eq('id', updated.id);
      } catch (err) {
        console.warn('[Supabase Order Status Notice]:', err);
      }
    })();
  }

  return updated;
}

// ============================================================
// ADMIN COMMAND CENTER: NOTIFICATIONS & BROADCASTS
// ============================================================

export function getAdminNotifications(): AdminBroadcastNotification[] {
  return readNotifications().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createAdminNotification(data: Partial<AdminBroadcastNotification>, adminName: string = 'Admin'): AdminBroadcastNotification {
  if (!data.title || !data.message) {
    throw new Error('Notification title and message are required.');
  }

  const now = new Date().toISOString();
  const notification: AdminBroadcastNotification = {
    id: `notif_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
    title: data.title.trim(),
    message: data.message.trim(),
    targetAudience: data.targetAudience || 'ALL_FARMERS',
    targetFilter: data.targetFilter || '',
    priority: data.priority || 'NORMAL',
    language: data.language || 'all',
    actionLink: data.actionLink || '',
    status: data.scheduledFor ? 'SCHEDULED' : 'SENT',
    scheduledFor: data.scheduledFor,
    sentAt: data.scheduledFor ? undefined : now,
    createdBy: adminName,
    createdAt: now,
    recipientCount: data.targetAudience === 'ALL_USERS' ? 2450 : (data.targetAudience === 'ALL_FARMERS' ? 1980 : 470),
    readBy: []
  };

  const notifications = readNotifications();
  notifications.unshift(notification);
  saveNotifications(notifications);
  return notification;
}

export function sendAdminNotification(id: string): AdminBroadcastNotification {
  const notifications = readNotifications();
  const idx = notifications.findIndex(n => n.id === id);
  if (idx === -1) {
    throw new Error('Notification not found.');
  }

  notifications[idx].status = 'SENT';
  notifications[idx].sentAt = new Date().toISOString();
  saveNotifications(notifications);
  return notifications[idx];
}

export function deleteAdminNotification(id: string): { success: boolean } {
  const notifications = readNotifications();
  const filtered = notifications.filter(n => n.id !== id);
  saveNotifications(filtered);
  return { success: true };
}

export function getUserNotificationsFeed(params: {
  mobile: string;
  role?: string;
  language?: string;
  district?: string;
  crop?: string;
}): AdminBroadcastNotification[] {
  const notifications = readNotifications();
  const sent = notifications.filter(n => n.status === 'SENT');

  return sent.filter(n => {
    if (n.language && n.language !== 'all' && params.language && n.language !== params.language) {
      return false;
    }

    if (n.targetAudience === 'ALL_USERS') return true;
    if (n.targetAudience === 'ALL_FARMERS' && params.role !== 'farmer_adviser') return true;
    if (n.targetAudience === 'ALL_ADVISERS' && params.role === 'farmer_adviser') return true;
    if (n.targetAudience === 'SPECIFIC_USER' && n.targetFilter === params.mobile) return true;
    if (n.targetAudience === 'BY_REGION' && params.district && n.targetFilter && params.district.toLowerCase().includes(n.targetFilter.toLowerCase())) return true;
    if (n.targetAudience === 'BY_CROP' && params.crop && n.targetFilter && params.crop.toLowerCase().includes(n.targetFilter.toLowerCase())) return true;

    return false;
  });
}

// ============================================================
// ADMIN COMMAND CENTER: OPERATIONAL ALERTS
// ============================================================

export function getAdminAlerts(): AdminOperationalAlert[] {
  const alerts = readAlerts();
  if (alerts.length === 0) {
    const initialAlerts: AdminOperationalAlert[] = [
      {
        id: 'alert_op_1',
        type: 'heatwave',
        category: 'weather',
        severity: 'high',
        title: '🔥 Extreme Thermal Stress Hazard Warning',
        message: 'Elevated daytime temperatures predicted across North India. Advise +30% drip irrigation for standing crops.',
        action: 'Schedule Emergency Drip Fertigation',
        targetRegion: 'Punjab, Haryana',
        targetCrop: 'Wheat, Mustard',
        isActive: true,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        createdBy: 'Admin Agrometeorologist'
      },
      {
        id: 'alert_op_2',
        type: 'pest_blight',
        category: 'pests',
        severity: 'critical',
        title: '🦠 High Fungal Spore & Rust Outbreak Advisory',
        message: 'High humidity conditions detected in river basin zones. Preventive bio-fungicide spraying strongly recommended.',
        action: 'Apply Bio-Fungicide (Trichoderma Viride / Neem 10,000 PPM)',
        targetRegion: 'Ludhiana, Amritsar',
        targetCrop: 'Wheat, Rice',
        isActive: true,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        createdBy: 'Dr. Anand Sharma'
      }
    ];
    saveAlerts(initialAlerts);
    return initialAlerts;
  }
  return alerts;
}

export function createAdminAlert(data: Partial<AdminOperationalAlert>, adminName: string = 'Admin'): AdminOperationalAlert {
  if (!data.title || !data.message) {
    throw new Error('Alert title and message are required.');
  }

  const alert: AdminOperationalAlert = {
    id: `alert_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
    type: data.type || 'operational',
    category: data.category || 'weather',
    severity: data.severity || 'high',
    title: data.title.trim(),
    message: data.message.trim(),
    action: data.action || 'Check recommended inputs in Agri Store',
    affectedZoneIds: data.affectedZoneIds || ['z1', 'z2'],
    targetRegion: data.targetRegion || 'All Regions',
    targetCrop: data.targetCrop || 'All Crops',
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: adminName
  };

  const alerts = readAlerts();
  alerts.unshift(alert);
  saveAlerts(alerts);
  return alert;
}

// ============================================================
// ADMIN COMMERCE ANALYTICS & AI INTELLIGENCE
// ============================================================

export function getAdminCommerceAnalytics() {
  const products = readProducts();
  const orders = readOrders();
  const categories = readCategories();

  const validOrders = orders.filter(o => o.status !== 'CANCELLED');
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const totalOrdersCount = orders.length;
  const avgOrderValue = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;

  const inStockCount = products.filter(p => !p.isArchived && p.stockQuantity > (p.lowStockThreshold || 10)).length;
  const lowStockCount = products.filter(p => !p.isArchived && p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockThreshold || 10)).length;
  const outOfStockCount = products.filter(p => !p.isArchived && p.stockQuantity <= 0).length;

  const categorySales: Record<string, { name: string; revenue: number; unitsSold: number }> = {};
  for (const cat of categories) {
    categorySales[cat.id] = { name: cat.name, revenue: 0, unitsSold: 0 };
  }

  const productSales: Record<string, { name: string; revenue: number; unitsSold: number; categoryId: string }> = {};

  for (const order of validOrders) {
    for (const item of order.items) {
      const p = products.find(prod => prod.id === item.productId);
      const catId = p ? p.categoryId : 'seeds';

      if (!categorySales[catId]) {
        categorySales[catId] = { name: catId, revenue: 0, unitsSold: 0 };
      }
      categorySales[catId].revenue += item.lineTotal;
      categorySales[catId].unitsSold += item.quantity;

      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          name: item.productName,
          revenue: 0,
          unitsSold: 0,
          categoryId: catId
        };
      }
      productSales[item.productId].revenue += item.lineTotal;
      productSales[item.productId].unitsSold += item.quantity;
    }
  }

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const topCategories = Object.values(categorySales)
    .sort((a, b) => b.revenue - a.revenue);

  return {
    metrics: {
      totalRevenue,
      totalOrdersCount,
      avgOrderValue,
      totalProducts: products.filter(p => !p.isArchived).length,
      inStockCount,
      lowStockCount,
      outOfStockCount
    },
    topProducts,
    topCategories,
    recentOrders: orders.slice(0, 10)
  };
}

export function getAiProductRecommendations(params: {
  crop?: string;
  acreage?: number;
  soilType?: string;
  district?: string;
  season?: string;
}) {
  const products = readProducts().filter(p => !p.isArchived && p.isInStock);
  const crop = (params.crop || 'Wheat').toLowerCase();

  const recommended = products.filter(p =>
    p.cropCompatibility.some(c => c.toLowerCase().includes(crop) || c === 'All Crops') ||
    p.isRecommended ||
    p.isFeatured
  );

  return {
    crop: params.crop || 'Wheat',
    recommendedProducts: recommended.slice(0, 6),
    agronomicInsight: `Based on your crop (${params.crop || 'Wheat'}) and soil conditions in ${params.district || 'Punjab'}, precision fertilization with 100% Water Soluble NPK and biological root inoculants can optimize tillering and boost grain weight by up to 22%.`,
    seasonalBundles: [
      {
        id: 'bundle_wheat_boost',
        title: '🌾 Rabi Wheat Yield Acceleration Bundle',
        description: 'Certified HD-3086 Wheat Seed (40kg) + VAM Mycorrhiza Inoculant + Water Soluble NPK (19:19:19)',
        discountPercent: 12,
        bundlePrice: 1450,
        originalPrice: 1680,
        productIds: ['prod_seed_wheat_hd3086', 'prod_bio_mycorrhiza_granules', 'prod_fert_npk_191919']
      },
      {
        id: 'bundle_organic_protect',
        title: '🍃 Complete Organic Crop Protection Pack',
        description: 'BioShield 10,000 PPM Pure Neem Oil + Trichoderma Viride Bio-Fungicide',
        discountPercent: 15,
        bundlePrice: 740,
        originalPrice: 870,
        productIds: ['prod_prot_neem_azadirachtin_10000', 'prod_prot_fungi_tricoderma']
      }
    ]
  };
}

export function getAiProductSearch(query: string) {
  const products = readProducts().filter(p => !p.isArchived);
  const q = query.toLowerCase().trim();

  const terms: string[] = [];
  if (q.includes('yellow') || q.includes('chlorosis') || q.includes('pale')) terms.push('zinc', 'npk', 'fertilizers');
  if (q.includes('rot') || q.includes('fungus') || q.includes('wilt') || q.includes('mildew')) terms.push('trichoderma', 'crop_protection', 'fungicide');
  if (q.includes('worm') || q.includes('pest') || q.includes('aphid') || q.includes('insect')) terms.push('neem', 'protection', 'spray');
  if (q.includes('water') || q.includes('drip') || q.includes('irrigation')) terms.push('drip', 'irrigation');
  if (q.includes('seed') || q.includes('sow') || q.includes('planting')) terms.push('seeds', 'wheat', 'paddy');
  if (q.includes('meter') || q.includes('ph') || q.includes('test') || q.includes('soil')) terms.push('soil_testing', 'tester');

  const matches = products.filter(p => {
    const text = `${p.name} ${p.description} ${p.agriculturalUse} ${p.cropCompatibility.join(' ')} ${p.activeIngredients || ''}`.toLowerCase();
    if (text.includes(q)) return true;
    return terms.some(t => text.includes(t) || p.categoryId.includes(t));
  });

  return {
    query,
    resultsCount: matches.length,
    products: matches.length > 0 ? matches : products.slice(0, 4),
    aiExplanation: matches.length > 0
      ? `Found ${matches.length} agronomist-approved solutions matching "${query}". Check dosage instructions before application.`
      : `Showing top recommended agricultural inputs. Try searching for specific symptoms (e.g., 'yellow leaves in paddy', 'organic pest spray', 'drip kit').`
  };
}

export function getAdminAiInsights() {
  const analytics = getAdminCommerceAnalytics();
  const products = readProducts();
  const lowStockItems = products.filter(p => !p.isArchived && p.stockQuantity <= (p.lowStockThreshold || 10));

  return {
    generatedAt: new Date().toISOString(),
    summary: `Platform revenue stands at ₹${analytics.metrics.totalRevenue.toLocaleString()} across ${analytics.metrics.totalOrdersCount} orders. Catalog contains ${analytics.metrics.totalProducts} active products with ${analytics.metrics.inStockCount} in stock.`,
    highlights: [
      {
        type: 'INVENTORY_ALERT',
        severity: lowStockItems.length > 0 ? 'HIGH' : 'LOW',
        title: lowStockItems.length > 0 ? `⚠️ ${lowStockItems.length} Products Require Immediate Restocking` : '✅ Inventory Levels Healthy',
        description: lowStockItems.length > 0
          ? `Items below threshold: ${lowStockItems.map(i => `${i.name} (${i.stockQuantity} left)`).join(', ')}.`
          : 'All active catalog items are above their safety reorder buffer.'
      },
      {
        type: 'SALES_OPPORTUNITY',
        severity: 'MEDIUM',
        title: '🌱 High Demand for Certified Rabi Seeds & Water-Soluble NPK',
        description: 'Seed Drill Wheat HD-3086 and NPK 19:19:19 represent 58% of cart additions. Consider launching a subsidized seasonal bundle.'
      },
      {
        type: 'LOGISTICS_EFFICIENCY',
        severity: 'LOW',
        title: '🚚 Dispatch SLA Performance at 94.2%',
        description: 'Average fulfillment cycle from PLACED to DISPATCHED is 14 hours across Punjab and Haryana cluster zones.'
      }
    ],
    recommendedActions: [
      'Create a 10% discount promo notification for Bio-Fertilizers & Organics to promote regenerative soil practices.',
      'Replenish stock for ProAgri 16L Battery Sprayer (current stock: 45 units).',
      'Broadcast early morning pest advisory for Ludhiana district farmers based on latest humidity spike.'
    ]
  };
}

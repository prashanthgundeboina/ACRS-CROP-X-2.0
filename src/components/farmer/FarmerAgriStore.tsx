import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  CheckCircle2,
  X,
  Plus,
  Minus,
  Trash2,
  Package,
  Truck,
  ShieldCheck,
  Tag,
  Star,
  Info,
  Clock,
  MapPin,
  Phone,
  ArrowRight,
  Filter,
  Check,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

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
  isInStock: boolean;
  imageUrl: string;
  description: string;
  agriculturalUse: string;
  cropCompatibility: string[];
  activeIngredients?: string;
  dosageInstructions?: string;
  safetyInformation?: string;
  isFeatured?: boolean;
  isRecommended?: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  displayOrder: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product?: AgriProduct;
  lineTotal: number;
}

export interface FarmerCart {
  mobile: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  grandTotal: number;
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
  items: {
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    unit: string;
    imageUrl: string;
  }[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface FarmerAgriStoreProps {
  farmerMobile: string;
  farmerName?: string;
  farmerLocation?: string;
  primaryCrop?: string;
  onClose?: () => void;
}

export const FarmerAgriStore: React.FC<FarmerAgriStoreProps> = ({
  farmerMobile,
  farmerName = 'Farmer',
  farmerLocation = 'Ludhiana, Punjab',
  primaryCrop = 'Wheat',
  onClose
}) => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [activeTab, setActiveTab] = useState<'catalog' | 'orders'>('catalog');
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<AgriProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cropFilter, setCropFilter] = useState<string>(primaryCrop || '');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<AgriProduct | null>(null);

  // Cart State
  const [cart, setCart] = useState<FarmerCart | null>(null);
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);
  const [isUpdatingCart, setIsUpdatingCart] = useState<boolean>(false);

  // Checkout State
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI' | 'NET_BANKING'>('COD');
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    recipientName: farmerName,
    phoneNumber: farmerMobile,
    streetAddress: 'Field Zone 4, Main Farm Road',
    landmark: 'Near Canal Pump House',
    villageOrLocality: 'PAU Agricultural Zone',
    district: farmerLocation.includes('Ludhiana') ? 'Ludhiana' : farmerLocation.split(',')?.[0]?.trim() || 'Ludhiana',
    state: 'Punjab',
    pincode: '141004'
  });
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<FarmerOrder | null>(null);

  // Orders List
  const [orders, setOrders] = useState<FarmerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);

  // 1. Fetch Products and Categories
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (cropFilter && cropFilter !== 'all') {
        params.append('crop', cropFilter);
      }

      const res = await fetch(`/api/store/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
        setProducts(data.products || []);
      }
    } catch (e) {
      console.error('Failed to load agri store products:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Fetch Farmer's Cart
  const fetchCart = async () => {
    if (!farmerMobile) return;
    try {
      const res = await fetch(`/api/store/cart?mobileNumber=${encodeURIComponent(farmerMobile)}`);
      const data = await res.json();
      if (data.success && data.cart) {
        setCart(data.cart);
      }
    } catch (e) {
      console.error('Failed to load cart:', e);
    }
  };

  // 3. Fetch Orders
  const fetchOrders = async () => {
    if (!farmerMobile) return;
    try {
      setLoadingOrders(true);
      const res = await fetch(`/api/store/orders?mobileNumber=${encodeURIComponent(farmerMobile)}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, cropFilter]);

  useEffect(() => {
    fetchCart();
    fetchOrders();
  }, [farmerMobile]);

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Add Item to Cart
  const handleAddToCart = async (productId: string, quantity: number = 1) => {
    try {
      setIsUpdatingCart(true);
      const res = await fetch('/api/store/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileNumber: farmerMobile,
          productId,
          quantity
        })
      });
      const data = await res.json();
      if (data.success && data.cart) {
        setCart(data.cart);
      }
    } catch (e) {
      console.error('Add to cart failed:', e);
    } finally {
      setIsUpdatingCart(false);
    }
  };

  // Update Item Quantity
  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    try {
      setIsUpdatingCart(true);
      const res = await fetch('/api/store/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileNumber: farmerMobile,
          productId,
          quantity
        })
      });
      const data = await res.json();
      if (data.success && data.cart) {
        setCart(data.cart);
      }
    } catch (e) {
      console.error('Update quantity failed:', e);
    } finally {
      setIsUpdatingCart(false);
    }
  };

  // Clear Cart
  const handleClearCart = async () => {
    try {
      setIsUpdatingCart(true);
      const res = await fetch('/api/store/cart/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileNumber: farmerMobile
        })
      });
      const data = await res.json();
      if (data.success && data.cart) {
        setCart(data.cart);
      }
    } catch (e) {
      console.error('Clear cart failed:', e);
    } finally {
      setIsUpdatingCart(false);
    }
  };

  // Checkout and Place Order
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) return;

    try {
      setIsPlacingOrder(true);
      const res = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileNumber: farmerMobile,
          farmerName: farmerName || deliveryAddress.recipientName,
          deliveryAddress,
          paymentMethod,
          notes: orderNotes
        })
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrderSuccess(data.order);
        setShowCheckoutModal(false);
        setShowCartDrawer(false);
        fetchCart();
        fetchOrders();
      } else {
        alert(data.error || 'Failed to complete order. Please try again.');
      }
    } catch (e: any) {
      alert(e.message || 'Error processing checkout.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const totalCartCount = cart?.itemCount || 0;

  return (
    <div className="flex flex-col h-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 relative">
      {/* Header Bar */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-stone-900/90 backdrop-blur border-b border-stone-200 dark:border-stone-800 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl border border-emerald-500/20">
            🌾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-stone-900 dark:text-white">
                {isHi ? 'क्रॉपरएक्स कृषि दुकान' : 'CroperX Agri Store'}
              </h2>
              <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                {isHi ? '100% प्रमाणित इनपुट्स' : '100% Certified'}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {isHi ? 'प्रमाणित बीज, जैव-उर्वरक, मृदा किट एवं फसल सुरक्षा सीधे आपके खेत पर' : 'Certified seeds, bio-nutrients, soil kits & crop protection'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs: Catalog vs My Orders */}
          <div className="hidden sm:flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-lg border border-stone-200 dark:border-stone-700">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'catalog'
                  ? 'bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              {isHi ? 'उत्पाद सूची' : 'Store Catalog'}
            </button>
            <button
              onClick={() => {
                setActiveTab('orders');
                fetchOrders();
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              {isHi ? 'मेरे ऑर्डर' : 'My Orders'}
              {orders.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-3xs flex items-center justify-center font-bold">
                  {orders.length}
                </span>
              )}
            </button>
          </div>

          {/* Cart Icon with badge */}
          <button
            onClick={() => setShowCartDrawer(true)}
            className="relative flex items-center justify-center p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-95"
            title="Open Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-white text-2xs font-bold rounded-full flex items-center justify-center shadow-md animate-pulse">
                {totalCartCount}
              </span>
            )}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Body */}
      {activeTab === 'catalog' ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Promotional Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-900 text-white p-5 sm:p-6 shadow-md border border-emerald-600/30">
            <div className="relative z-10 max-w-xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold backdrop-blur">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {isHi ? 'कृषि विज्ञान केन्द्र द्वारा प्रमाणित' : 'ICAR & PAU Verified Quality'}
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                {isHi ? 'उच्च उत्पादकता वाले प्रमाणित कृषि इनपुट्स' : 'Certified Farm Inputs for Maximum Yield'}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                {isHi
                  ? 'मुफ्त डिलीवरी ₹999 से अधिक के ऑर्डर पर। ₹2000 से अधिक पर अतिरिक्त 5% डिजिटल छूट।'
                  : 'Free village delivery on orders above ₹999. Extra 5% digital checkout discount on orders above ₹2000.'}
              </p>
            </div>
            <div className="absolute right-4 bottom-2 text-7xl opacity-25 select-none pointer-events-none">
              🌾
            </div>
          </div>

          {/* Search & Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder={isHi ? 'उत्पाद, बीज, खाद या रोग का नाम खोजें...' : 'Search certified seeds, fertilizers, bio-nutrients...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-white placeholder-stone-400 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Crop Compatibility Quick Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-medium text-stone-500 whitespace-nowrap">
                {isHi ? 'फसल:' : 'Crop:'}
              </span>
              {['all', 'Wheat', 'Rice', 'Cotton', 'Mustard', 'Maize', 'Vegetables'].map((crop) => (
                <button
                  key={crop}
                  onClick={() => setCropFilter(crop === 'all' ? '' : crop)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all whitespace-nowrap ${
                    (cropFilter === crop || (crop === 'all' && !cropFilter))
                      ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                      : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:border-stone-300'
                  }`}
                >
                  {crop === 'all' ? (isHi ? 'सभी फसलें' : 'All Crops') : crop}
                </button>
              ))}
            </div>
          </div>

          {/* Category Chips Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-semibold'
                      : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 animate-pulse space-y-3">
                  <div className="h-44 bg-stone-200 dark:bg-stone-800 rounded-xl" />
                  <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded-md w-3/4" />
                  <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded-md w-1/2" />
                  <div className="h-8 bg-stone-200 dark:bg-stone-800 rounded-xl" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 space-y-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
              <div className="text-5xl">🌱</div>
              <h4 className="text-base font-bold text-stone-900 dark:text-white">
                {isHi ? 'कोई उत्पाद नहीं मिला' : 'No products match your criteria'}
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {isHi ? 'कृपया अन्य श्रेणी या फसल का चयन करके देखें।' : 'Try changing your search term or select "All Products" to view our complete catalog.'}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setCropFilter('');
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition"
              >
                {isHi ? 'सभी उत्पाद देखें' : 'Reset Filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {products.map((p) => {
                const inCartItem = cart?.items.find((i) => i.productId === p.id);
                const quantityInCart = inCartItem?.quantity || 0;

                return (
                  <div
                    key={p.id}
                    className="group bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    {/* Image & Badges */}
                    <div className="relative aspect-4/3 bg-stone-100 dark:bg-stone-800 overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(p)}>
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {p.isFeatured && (
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-amber-500 text-white text-3xs font-bold uppercase tracking-wider shadow-xs">
                          {isHi ? 'लोकप्रिय' : 'Featured'}
                        </span>
                      )}
                      {p.isRecommended && (
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-3xs font-bold uppercase tracking-wider shadow-xs flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          {isHi ? 'आपकी फसल के अनुकूल' : 'Recommended'}
                        </span>
                      )}
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur text-white text-3xs flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-bold">{p.rating}</span>
                        <span className="text-stone-300">({p.reviewsCount})</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1 cursor-pointer" onClick={() => setSelectedProduct(p)}>
                        <h4 className="text-sm font-bold text-stone-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 transition-colors">
                          {p.name}
                        </h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>
                      </div>

                      {/* Crop Compatibility Tags */}
                      <div className="flex flex-wrap gap-1">
                        {p.cropCompatibility.slice(0, 3).map((c, i) => (
                          <span
                            key={i}
                            className="text-3xs px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium"
                          >
                            {c}
                          </span>
                        ))}
                      </div>

                      {/* Price & Action Button */}
                      <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-black text-stone-900 dark:text-white">
                              ₹{p.price}
                            </span>
                            {p.originalPrice && p.originalPrice > p.price && (
                              <span className="text-2xs line-through text-stone-400">
                                ₹{p.originalPrice}
                              </span>
                            )}
                          </div>
                          <span className="text-3xs text-stone-500">per {p.unit}</span>
                        </div>

                        {/* Cart CTA */}
                        {quantityInCart > 0 ? (
                          <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl p-1">
                            <button
                              onClick={() => handleUpdateQuantity(p.id, quantityInCart - 1)}
                              disabled={isUpdatingCart}
                              className="w-7 h-7 rounded-lg bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition active:scale-95 disabled:opacity-50"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-emerald-800 dark:text-emerald-300">
                              {quantityInCart}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(p.id, quantityInCart + 1)}
                              disabled={isUpdatingCart || quantityInCart >= p.stockQuantity}
                              className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition active:scale-95 disabled:opacity-50"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(p.id, 1)}
                            disabled={isUpdatingCart || !p.isInStock}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition active:scale-95 disabled:opacity-50 disabled:bg-stone-400"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>{p.isInStock ? (isHi ? 'जोड़ें' : 'Add') : (isHi ? 'स्टॉक खत्म' : 'Out of Stock')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* My Orders View */
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                {isHi ? 'आपके हालिया कृषि ऑर्डर' : 'Your Farm Orders & Live Dispatch'}
              </h3>
              <p className="text-xs text-stone-500">
                {isHi ? 'प्रमाणित इनपुट्स की स्थिति एवं डिलीवरी ट्रैकिंग' : 'Track live dispatch status of your certified agricultural inputs'}
              </p>
            </div>
            <button
              onClick={fetchOrders}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 transition"
            >
              {isHi ? 'रीफ्रेश' : 'Refresh'}
            </button>
          </div>

          {loadingOrders ? (
            <div className="text-center py-12 text-stone-400 text-xs">
              {isHi ? 'ऑर्डर लोड हो रहे हैं...' : 'Loading your orders...'}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 space-y-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
              <div className="text-5xl">📦</div>
              <h4 className="text-base font-bold text-stone-900 dark:text-white">
                {isHi ? 'अभी तक कोई ऑर्डर नहीं' : 'No orders placed yet'}
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {isHi ? 'अपनी फसल के लिए प्रमाणित बीज और खाद ऑर्डर करें।' : 'Browse our certified seeds, bio-nutrients, and crop protection catalog to place your first order.'}
              </p>
              <button
                onClick={() => setActiveTab('catalog')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition"
              >
                {isHi ? 'दुकान ब्राउज करें' : 'Browse Agri Store'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-stone-900 dark:text-white">
                          #{o.orderNumber}
                        </span>
                        <span className={`text-3xs font-bold px-2 py-0.5 rounded-md ${
                          o.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}>
                          {o.status}
                        </span>
                      </div>
                      <p className="text-3xs text-stone-400">
                        {new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                        ₹{o.grandTotal}
                      </div>
                      <span className="text-3xs text-stone-500 uppercase">
                        {o.paymentMethod} • {o.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {o.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-stone-900 dark:text-white truncate">
                            {item.productName}
                          </p>
                          <p className="text-3xs text-stone-500">
                            Qty: {item.quantity} {item.unit} × ₹{item.unitPrice} = ₹{item.lineTotal}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Info */}
                  <div className="pt-2 text-xs text-stone-600 dark:text-stone-400 flex items-start gap-2 bg-stone-50/50 dark:bg-stone-800/30 p-2.5 rounded-xl">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-stone-800 dark:text-stone-200">
                        {o.deliveryAddress.recipientName} ({o.deliveryAddress.phoneNumber})
                      </span>
                      <p className="text-3xs text-stone-500">
                        {o.deliveryAddress.streetAddress}, {o.deliveryAddress.villageOrLocality}, {o.deliveryAddress.district}, {o.deliveryAddress.state} - {o.deliveryAddress.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sliding Cart Drawer */}
      <AnimatePresence>
        {showCartDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCartDrawer(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white dark:bg-stone-900 h-full shadow-2xl flex flex-col justify-between border-l border-stone-200 dark:border-stone-800 z-10"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-stone-900 dark:text-white">
                    {isHi ? 'कृषि इनपुट कार्ट' : 'Your Farm Cart'} ({totalCartCount})
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {cart && cart.items.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      disabled={isUpdatingCart}
                      className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {isHi ? 'साफ करें' : 'Clear'}
                    </button>
                  )}
                  <button
                    onClick={() => setShowCartDrawer(false)}
                    className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {!cart || cart.items.length === 0 ? (
                  <div className="text-center py-20 space-y-3">
                    <ShoppingCart className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto" />
                    <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
                      {isHi ? 'आपकी कार्ट खाली है' : 'Your cart is empty'}
                    </p>
                    <p className="text-xs text-stone-500">
                      {isHi ? 'उत्पाद सूची से बीज या खाद जोड़ें।' : 'Add certified inputs from our store catalog.'}
                    </p>
                  </div>
                ) : (
                  cart.items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800"
                    >
                      <img
                        src={item.product?.imageUrl}
                        alt={item.product?.name}
                        className="w-14 h-14 rounded-lg object-cover border border-stone-200 dark:border-stone-700"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-stone-900 dark:text-white truncate">
                          {item.product?.name}
                        </h5>
                        <p className="text-3xs text-stone-500">
                          ₹{item.product?.price} per {item.product?.unit}
                        </p>
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                          ₹{item.lineTotal}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-1">
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          disabled={isUpdatingCart}
                          className="w-6 h-6 rounded bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-600 hover:text-stone-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          disabled={isUpdatingCart}
                          className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer & Checkout Action */}
              {cart && cart.items.length > 0 && (
                <div className="p-4 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 space-y-3">
                  <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
                    <div className="flex justify-between">
                      <span>{isHi ? 'उप-कुल (Subtotal)' : 'Subtotal'}</span>
                      <span className="font-semibold text-stone-900 dark:text-white">₹{cart.subtotal}</span>
                    </div>
                    {cart.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                        <span>{isHi ? 'डिजिटल छूट (5%)' : 'Digital Discount (5%)'}</span>
                        <span>-₹{cart.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>{isHi ? 'डिलीवरी शुल्क' : 'Delivery Charge'}</span>
                      <span>{cart.deliveryCharge === 0 ? (
                        <span className="text-emerald-600 font-bold uppercase text-3xs">{isHi ? 'निःशुल्क (FREE)' : 'FREE'}</span>
                      ) : (
                        `₹${cart.deliveryCharge}`
                      )}</span>
                    </div>
                    <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex justify-between text-sm font-black text-stone-900 dark:text-white">
                      <span>{isHi ? 'कुल देय राशि' : 'Grand Total'}</span>
                      <span className="text-emerald-700 dark:text-emerald-400 text-base">₹{cart.grandTotal}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowCartDrawer(false);
                      setShowCheckoutModal(true);
                    }}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-2"
                  >
                    <span>{isHi ? 'ऑर्डर करें (Checkout)' : 'Proceed to Checkout'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckoutModal && cart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheckoutModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 z-10 max-h-[90vh] overflow-y-auto space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-stone-900 dark:text-white">
                      {isHi ? 'खेत पर डिलीवरी पता एवं भुगतान' : 'Farm Delivery & Payment'}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {cart.items.length} {isHi ? 'उत्पाद' : 'items'} • ₹{cart.grandTotal}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="p-1 rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCheckout} className="space-y-4">
                {/* Delivery Address Fields */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    {isHi ? 'डिलीवरी का पता' : 'Delivery Address'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-2xs font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                        {isHi ? 'प्राप्तकर्ता का नाम' : 'Recipient Name'}
                      </label>
                      <input
                        type="text"
                        required
                        value={deliveryAddress.recipientName}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, recipientName: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-2xs font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                        {isHi ? 'मोबाइल नंबर' : 'Phone Number'}
                      </label>
                      <input
                        type="tel"
                        required
                        value={deliveryAddress.phoneNumber}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, phoneNumber: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-2xs font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                      {isHi ? 'खेत का पता / गली' : 'Farm Address / Street'}
                    </label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress.streetAddress}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, streetAddress: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-2xs font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                        {isHi ? 'गाँव / क्षेत्र' : 'Village / Locality'}
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress.villageOrLocality || ''}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, villageOrLocality: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-2xs font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                        {isHi ? 'जिला' : 'District'}
                      </label>
                      <input
                        type="text"
                        required
                        value={deliveryAddress.district}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, district: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-2xs font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                        {isHi ? 'पिनकोड' : 'Pincode'}
                      </label>
                      <input
                        type="text"
                        required
                        value={deliveryAddress.pincode}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, pincode: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    {isHi ? 'भुगतान का तरीका' : 'Payment Method'}
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'COD', label: isHi ? 'डिलीवरी पर नकद (COD)' : 'Cash on Delivery', icon: '💵' },
                      { id: 'UPI', label: 'UPI / PhonePe / GPay', icon: '📱' },
                      { id: 'NET_BANKING', label: isHi ? 'नेट बैंकिंग' : 'Net Banking', icon: '🏦' }
                    ].map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          paymentMethod === m.id
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-600 text-emerald-900 dark:text-emerald-300 font-bold'
                            : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        <span className="text-lg">{m.icon}</span>
                        <span className="text-3xs mt-1 leading-tight">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order Summary & Submit CTA */}
                <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="text-3xs text-stone-400 uppercase font-semibold">Total Payable</span>
                    <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                      ₹{cart.grandTotal}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isPlacingOrder}
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition active:scale-98 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isPlacingOrder ? (
                      <span>{isHi ? 'ऑर्डर प्रोसेस हो रहा है...' : 'Processing...'}</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isHi ? 'ऑर्डर कन्फर्म करें' : 'Confirm Order'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Success Popup */}
      <AnimatePresence>
        {orderSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 dark:border-stone-800 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-stone-900 dark:text-white">
                {isHi ? 'ऑर्डर सफलतापूर्वक प्राप्त हुआ!' : 'Order Placed Successfully!'}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {isHi
                  ? `ऑर्डर संख्या #${orderSuccess.orderNumber} दर्ज कर ली गई है। 24-48 घंटों में आपके खेत पर डिलीवरी सुनिश्चित की जाएगी।`
                  : `Your order #${orderSuccess.orderNumber} for ₹${orderSuccess.grandTotal} is confirmed. Farm delivery dispatched within 24-48 hours.`}
              </p>

              <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-xl text-left text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-500">Order ID:</span>
                  <span className="font-mono font-bold">{orderSuccess.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Payment:</span>
                  <span className="font-semibold">{orderSuccess.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Delivery to:</span>
                  <span className="font-semibold truncate max-w-48">{orderSuccess.deliveryAddress.recipientName} ({orderSuccess.deliveryAddress.district})</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setOrderSuccess(null);
                  setActiveTab('orders');
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
              >
                {isHi ? 'ऑर्डर स्थिति देखें' : 'Track Order Status'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[90vh] overflow-y-auto space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  {selectedProduct.categoryId}
                </span>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-1 rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
                className="w-full h-56 rounded-2xl object-cover border border-stone-200 dark:border-stone-800"
              />

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                    {selectedProduct.name}
                  </h3>
                  <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                    ₹{selectedProduct.price} <span className="text-xs font-normal text-stone-400">/ {selectedProduct.unit}</span>
                  </span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  {selectedProduct.description}
                </p>
              </div>

              {selectedProduct.agriculturalUse && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <span className="text-2xs font-bold uppercase text-emerald-800 dark:text-emerald-300">
                    {isHi ? 'कृषि उपयोग एवं लाभ' : 'Agricultural Use & Agronomic Benefits'}
                  </span>
                  <p className="text-xs text-emerald-900 dark:text-emerald-200">
                    {selectedProduct.agriculturalUse}
                  </p>
                </div>
              )}

              {selectedProduct.dosageInstructions && (
                <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1">
                  <span className="text-2xs font-bold uppercase text-stone-500">
                    {isHi ? 'अनुशंसित खुराक एवं प्रयोग विधि' : 'Recommended Dosage'}
                  </span>
                  <p className="text-xs text-stone-700 dark:text-stone-300">
                    {selectedProduct.dosageInstructions}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  onClick={() => {
                    handleAddToCart(selectedProduct.id, 1);
                    setSelectedProduct(null);
                    setShowCartDrawer(true);
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition active:scale-98 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{isHi ? 'कार्ट में जोड़ें और आगे बढ़ें' : 'Add to Cart & View Checkout'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

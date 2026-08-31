-- =========================================================================
-- CroperX Production Supabase PostgreSQL Schema (Phase 43.1 Extension)
-- Non-Destructive Extension for Adviser Verification, Proctoring & Agri Store
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Adviser Assessment Security Events Audit Table
CREATE TABLE IF NOT EXISTS public.adviser_security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES public.adviser_applications(id) ON DELETE CASCADE,
  attempt_id UUID,
  mobile VARCHAR(20) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  severity VARCHAR(30) DEFAULT 'WARNING',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Product Categories Table
CREATE TABLE IF NOT EXISTS public.product_categories (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50),
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Products Catalog Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category_id VARCHAR(100) NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10, 2),
  unit VARCHAR(50) NOT NULL DEFAULT '1 Unit',
  rating NUMERIC(3, 2) DEFAULT 4.8,
  reviews_count INT DEFAULT 0,
  stock_quantity INT NOT NULL DEFAULT 50 CHECK (stock_quantity >= 0),
  is_in_stock BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  description TEXT,
  agricultural_use TEXT,
  crop_compatibility TEXT[] DEFAULT '{}',
  active_ingredients TEXT,
  dosage_instructions TEXT,
  safety_information TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_recommended BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Farmer Carts Table (Server-Authoritative Persistence)
CREATE TABLE IF NOT EXISTS public.farmer_carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  mobile VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_farmer_carts_mobile UNIQUE (mobile)
);

-- 5. Farmer Cart Line Items
CREATE TABLE IF NOT EXISTS public.farmer_cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES public.farmer_carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_cart_product UNIQUE (cart_id, product_id)
);

-- 6. Farmer Delivery Addresses Table
CREATE TABLE IF NOT EXISTS public.farmer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  mobile VARCHAR(20) NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  street_address TEXT NOT NULL,
  landmark VARCHAR(255),
  village_or_locality VARCHAR(255),
  district VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(20) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Farmer Orders Table (Authoritative Server Pricing)
CREATE TABLE IF NOT EXISTS public.farmer_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  mobile VARCHAR(20) NOT NULL,
  farmer_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PLACED' CHECK (
    status IN ('PLACED', 'CONFIRMED', 'PROCESSING', 'DISPATCHED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED')
  ),
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  delivery_charge NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (delivery_charge >= 0),
  grand_total NUMERIC(10, 2) NOT NULL CHECK (grand_total >= 0),
  payment_method VARCHAR(50) NOT NULL DEFAULT 'COD',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  delivery_address JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Farmer Order Line Items Table
CREATE TABLE IF NOT EXISTS public.farmer_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.farmer_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  line_total NUMERIC(10, 2) NOT NULL CHECK (line_total >= 0),
  unit VARCHAR(50),
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.adviser_security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_order_items ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_farmer_carts_mobile ON public.farmer_carts(mobile);
CREATE INDEX IF NOT EXISTS idx_farmer_orders_mobile ON public.farmer_orders(mobile);
CREATE INDEX IF NOT EXISTS idx_farmer_orders_status ON public.farmer_orders(status);
CREATE INDEX IF NOT EXISTS idx_adviser_security_events_mobile ON public.adviser_security_events(mobile);

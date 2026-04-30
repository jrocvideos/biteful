-- Biteful Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS (customers, drivers, restaurant owners)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer','driver','restaurant_admin','admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- RESTAURANTS
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    lat DECIMAL(10,8),
    lng DECIMAL(11,8),
    cuisine VARCHAR(50),
    phone VARCHAR(20),
    image_url TEXT,
    commission_rate DECIMAL(5,2) DEFAULT 20.00,
    is_active BOOLEAN DEFAULT true,
    is_open BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- MENU ITEMS
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    category VARCHAR(50),
    is_available BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false
);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES users(id),
    restaurant_id UUID REFERENCES restaurants(id),
    driver_id UUID REFERENCES users(id),
    
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    delivery_fee DECIMAL(10,2) DEFAULT 2.99,
    service_fee DECIMAL(10,2) DEFAULT 3.50,
    tip DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    
    driver_base_pay DECIMAL(10,2) DEFAULT 2.50,
    driver_distance_pay DECIMAL(10,2) DEFAULT 0,
    driver_time_pay DECIMAL(10,2) DEFAULT 0,
    driver_total DECIMAL(10,2) DEFAULT 0,
    
    commission_amount DECIMAL(10,2),
    biteful_net DECIMAL(10,2),
    
    status VARCHAR(50) DEFAULT 'pending_payment',
    
    driver_lat DECIMAL(10,8),
    driver_lng DECIMAL(11,8),
    
    customer_address TEXT,
    customer_lat DECIMAL(10,8),
    customer_lng DECIMAL(11,8),
    
    special_instructions TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    accepted_at TIMESTAMP,
    picked_up_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP
);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    special_instructions TEXT
);

-- DRIVER LOCATIONS (real-time)
CREATE TABLE IF NOT EXISTS driver_locations (
    driver_id UUID PRIMARY KEY REFERENCES users(id),
    lat DECIMAL(10,8) NOT NULL,
    lng DECIMAL(11,8) NOT NULL,
    is_online BOOLEAN DEFAULT false,
    is_on_delivery BOOLEAN DEFAULT false,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    stripe_payment_intent_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- PAYOUTS
CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(20) CHECK (type IN ('driver_delivery','restaurant_weekly')),
    amount DECIMAL(10,2) NOT NULL,
    stripe_transfer_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    reviewer_id UUID REFERENCES users(id),
    reviewee_id UUID REFERENCES users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver ON orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_driver_locations_online ON driver_locations(is_online, is_on_delivery);

-- ====================================================================
-- Barber Shop Management System - Supabase Database Schema & Setup
-- Designed for Supabase Free Tier (PostgreSQL)
-- ====================================================================

-- 1. Create CUSTOMERS Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create SERVICES Table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Haircuts',
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create BARBERS (STAFF) Table
CREATE TABLE IF NOT EXISTS public.barbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'Stylist',
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create APPOINTMENTS Table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    barber_id UUID REFERENCES public.barbers(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create PAYMENTS Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_method TEXT NOT NULL DEFAULT 'Cash', -- Cash, Card, EasyPaisa, JazzCash, Online
    payment_status TEXT NOT NULL DEFAULT 'Completed', -- Completed, Pending, Refunded
    invoice_number TEXT NOT NULL UNIQUE,
    payment_date TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- Enable Row Level Security (RLS) & Add Anonymous Access Policies
-- This allows our frontend application using the Supabase Anon Key to
-- perform CRUD operations securely on all tables.
-- ====================================================================

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Customers Policies
DROP POLICY IF EXISTS "Public Customers Access" ON public.customers;
CREATE POLICY "Public Customers Access" ON public.customers
    FOR ALL USING (true) WITH CHECK (true);

-- Services Policies
DROP POLICY IF EXISTS "Public Services Access" ON public.services;
CREATE POLICY "Public Services Access" ON public.services
    FOR ALL USING (true) WITH CHECK (true);

-- Barbers Policies
DROP POLICY IF EXISTS "Public Barbers Access" ON public.barbers;
CREATE POLICY "Public Barbers Access" ON public.barbers
    FOR ALL USING (true) WITH CHECK (true);

-- Appointments Policies
DROP POLICY IF EXISTS "Public Appointments Access" ON public.appointments;
CREATE POLICY "Public Appointments Access" ON public.appointments
    FOR ALL USING (true) WITH CHECK (true);

-- Payments Policies
DROP POLICY IF EXISTS "Public Payments Access" ON public.payments;
CREATE POLICY "Public Payments Access" ON public.payments
    FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- Indexes for performance
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_appointments_customer ON public.appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON public.payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date);

-- ====================================================================
-- Sample Seed Data (Initial Data for testing and quick setup)
-- ====================================================================

-- 1. Insert Initial Barbers
INSERT INTO public.barbers (id, name, phone, role, is_active)
VALUES
    ('b1111111-1111-1111-1111-111111111111', 'Hamza Khan', '+92 300 1234567', 'Master Barber', true),
    ('b2222222-2222-2222-2222-222222222222', 'Ali Raza', '+92 301 7654321', 'Senior Stylist', true),
    ('b3333333-3333-3333-3333-333333333333', 'Bilal Ahmed', '+92 302 9876543', 'Beard & Facial Specialist', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Initial Services
INSERT INTO public.services (id, name, category, duration_minutes, price, description, is_active)
VALUES
    ('s1111111-1111-1111-1111-111111111111', 'Classic Haircut', 'Haircuts', 30, 800.00, 'Standard haircut with razor neck clean up and styling.', true),
    ('s2222222-2222-2222-2222-222222222222', 'Beard Grooming & Shape', 'Beard & Shave', 25, 500.00, 'Beard trim, shape up, hot oil conditioning and razor edge.', true),
    ('s3333333-3333-3333-3333-333333333333', 'Royal Hot Towel Shave', 'Beard & Shave', 35, 700.00, 'Luxurious hot towel treatment, pre-shave cream, straight razor shave, and aftershave balm.', true),
    ('s4444444-4444-4444-4444-444444444444', 'Executive Combo (Haircut + Beard)', 'Combos', 55, 1200.00, 'Full precision haircut plus detailed beard shaping and head massage.', true),
    ('s5555555-5555-5555-5555-555555555555', 'Charcoal Deep Facial', 'Facial & Spa', 45, 1500.00, 'Deep pore cleansing, exfoliating scrub, blackhead extraction and soothing clay mask.', true),
    ('s6666666-6666-6666-6666-666666666666', 'Hair Color & Grey Blending', 'Hair Color', 40, 1800.00, 'Natural grey coverage and subtle beard/hair coloring using premium ammonia-free dye.', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Initial Customers
INSERT INTO public.customers (id, name, phone, email, notes)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Usman Tariq', '+92 321 4455667', 'usman.tariq@example.com', 'Prefers low fade and razor line.'),
    ('c2222222-2222-2222-2222-222222222222', 'Zubair Shah', '+92 333 1122334', 'zubair.shah@example.com', 'Regular customer, comes every alternate weekend.'),
    ('c3333333-3333-3333-3333-333333333333', 'Ahmed Hassan', '+92 345 5566778', 'ahmed.hassan@example.com', 'Sensitive skin, always use cold towel after shave.'),
    ('c4444444-4444-4444-4444-444444444444', 'Farhan Saeed', '+92 312 9988776', 'farhan.saeed@example.com', 'Likes scissor cut on top, 2 guard on sides.')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Initial Appointments (Using CURRENT_DATE for dynamic sample data)
INSERT INTO public.appointments (id, customer_id, service_id, barber_id, appointment_date, appointment_time, status, total_price, notes)
VALUES
    ('a1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 's4444444-4444-4444-4444-444444444444', 'b1111111-1111-1111-1111-111111111111', CURRENT_DATE, '11:00:00', 'completed', 1200.00, 'Executive combo booked'),
    ('a2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 's1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', CURRENT_DATE, '14:30:00', 'confirmed', 800.00, 'Standard haircut'),
    ('a3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 's3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', CURRENT_DATE, '16:00:00', 'pending', 700.00, 'Hot towel shave'),
    ('a4444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444444', 's5555555-5555-5555-5555-555555555555', 'b1111111-1111-1111-1111-111111111111', CURRENT_DATE + INTERVAL '1 day', '12:00:00', 'confirmed', 1500.00, 'Facial session')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Initial Payments
INSERT INTO public.payments (id, appointment_id, customer_id, amount, payment_method, payment_status, invoice_number, payment_date, notes)
VALUES
    ('p1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 1200.00, 'Cash', 'Completed', 'INV-2026-0001', timezone('utc'::text, now()), 'Paid in full at counter'),
    ('p2222222-2222-2222-2222-222222222222', NULL, 'c2222222-2222-2222-2222-222222222222', 800.00, 'Card', 'Completed', 'INV-2026-0002', timezone('utc'::text, now() - INTERVAL '1 day'), 'Credit card POS terminal payment')
ON CONFLICT (id) DO NOTHING;

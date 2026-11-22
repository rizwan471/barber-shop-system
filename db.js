/**
 * Barber Shop Management System - Unified Data Access Layer (DB)
 * Seamlessly interfaces with Supabase (Live) and LocalStorage (Demo/Fallback Mode)
 */

(function () {
    const LS_CUSTOMERS = 'bsms_customers';
    const LS_SERVICES = 'bsms_services';
    const LS_BARBERS = 'bsms_barbers';
    const LS_APPOINTMENTS = 'bsms_appointments';
    const LS_PAYMENTS = 'bsms_payments';

    // Helper: generate UUID or unique ID
    function generateId() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // Default Seed Data
    const SEED_BARBERS = [
        { id: 'b1111111-1111-1111-1111-111111111111', name: 'Hamza Khan', phone: '+92 300 1234567', role: 'Master Barber', is_active: true },
        { id: 'b2222222-2222-2222-2222-222222222222', name: 'Ali Raza', phone: '+92 301 7654321', role: 'Senior Stylist', is_active: true },
        { id: 'b3333333-3333-3333-3333-333333333333', name: 'Bilal Ahmed', phone: '+92 302 9876543', role: 'Beard & Facial Specialist', is_active: true }
    ];

    const SEED_SERVICES = [
        { id: 's1111111-1111-1111-1111-111111111111', name: 'Classic Haircut', category: 'Haircuts', duration_minutes: 30, price: 800, description: 'Standard precision haircut with razor neck clean up and styling.', is_active: true },
        { id: 's2222222-2222-2222-2222-222222222222', name: 'Beard Grooming & Shape', category: 'Beard & Shave', duration_minutes: 25, price: 500, description: 'Beard trim, shape up, hot oil conditioning and razor edge.', is_active: true },
        { id: 's3333333-3333-3333-3333-333333333333', name: 'Royal Hot Towel Shave', category: 'Beard & Shave', duration_minutes: 35, price: 700, description: 'Luxurious hot towel treatment, pre-shave cream, straight razor shave, and aftershave balm.', is_active: true },
        { id: 's4444444-4444-4444-4444-444444444444', 'name': 'Executive Combo (Haircut + Beard)', category: 'Combos', duration_minutes: 55, price: 1200, description: 'Full precision haircut plus detailed beard shaping and head massage.', is_active: true },
        { id: 's5555555-5555-5555-5555-555555555555', name: 'Charcoal Deep Facial', category: 'Facial & Spa', duration_minutes: 45, price: 1500, description: 'Deep pore cleansing, exfoliating scrub, blackhead extraction and soothing clay mask.', is_active: true },
        { id: 's6666666-6666-6666-6666-666666666666', name: 'Hair Color & Grey Blending', category: 'Hair Color', duration_minutes: 40, price: 1800, description: 'Natural grey coverage and subtle beard/hair coloring using premium ammonia-free dye.', is_active: true }
    ];

    const SEED_CUSTOMERS = [
        { id: 'c1111111-1111-1111-1111-111111111111', name: 'Usman Tariq', phone: '+92 321 4455667', email: 'usman.tariq@example.com', notes: 'Prefers low fade and razor line.', created_at: new Date(Date.now() - 30 * 86400000).toISOString() },
        { id: 'c2222222-2222-2222-2222-222222222222', name: 'Zubair Shah', phone: '+92 333 1122334', email: 'zubair.shah@example.com', notes: 'Regular customer, comes every alternate weekend.', created_at: new Date(Date.now() - 20 * 86400000).toISOString() },
        { id: 'c3333333-3333-3333-3333-333333333333', name: 'Ahmed Hassan', phone: '+92 345 5566778', email: 'ahmed.hassan@example.com', notes: 'Sensitive skin, always use cold towel after shave.', created_at: new Date(Date.now() - 15 * 86400000).toISOString() },
        { id: 'c4444444-4444-4444-4444-444444444444', name: 'Farhan Saeed', phone: '+92 312 9988776', email: 'farhan.saeed@example.com', notes: 'Likes scissor cut on top, 2 guard on sides.', created_at: new Date(Date.now() - 5 * 86400000).toISOString() }
    ];

    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const SEED_APPOINTMENTS = [
        {
            id: 'a1111111-1111-1111-1111-111111111111',
            customer_id: 'c1111111-1111-1111-1111-111111111111',
            service_id: 's4444444-4444-4444-4444-444444444444',
            barber_id: 'b1111111-1111-1111-1111-111111111111',
            appointment_date: todayStr,
            appointment_time: '11:00',
            status: 'completed',
            total_price: 1200,
            notes: 'Executive combo booked',
            created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 'a2222222-2222-2222-2222-222222222222',
            customer_id: 'c2222222-2222-2222-2222-222222222222',
            service_id: 's1111111-1111-1111-1111-111111111111',
            barber_id: 'b2222222-2222-2222-2222-222222222222',
            appointment_date: todayStr,
            appointment_time: '14:30',
            status: 'confirmed',
            total_price: 800,
            notes: 'Standard haircut',
            created_at: new Date(Date.now() - 50000000).toISOString()
        },
        {
            id: 'a3333333-3333-3333-3333-333333333333',
            customer_id: 'c3333333-3333-3333-3333-333333333333',
            service_id: 's3333333-3333-3333-3333-333333333333',
            barber_id: 'b3333333-3333-3333-3333-333333333333',
            appointment_date: todayStr,
            appointment_time: '16:00',
            status: 'pending',
            total_price: 700,
            notes: 'Hot towel shave',
            created_at: new Date().toISOString()
        },
        {
            id: 'a4444444-4444-4444-4444-444444444444',
            customer_id: 'c4444444-4444-4444-4444-444444444444',
            service_id: 's5555555-5555-5555-5555-555555555555',
            barber_id: 'b1111111-1111-1111-1111-111111111111',
            appointment_date: tomorrowStr,
            appointment_time: '12:00',
            status: 'confirmed',
            total_price: 1500,
            notes: 'Facial session',
            created_at: new Date().toISOString()
        }
    ];

    const SEED_PAYMENTS = [
        {
            id: 'p1111111-1111-1111-1111-111111111111',
            appointment_id: 'a1111111-1111-1111-1111-111111111111',
            customer_id: 'c1111111-1111-1111-1111-111111111111',
            amount: 1200,
            payment_method: 'Cash',
            payment_status: 'Completed',
            invoice_number: 'INV-2026-0001',
            payment_date: new Date().toISOString(),
            notes: 'Paid in full at counter',
            created_at: new Date().toISOString()
        },
        {
            id: 'p2222222-2222-2222-2222-222222222222',
            appointment_id: null,
            customer_id: 'c2222222-2222-2222-2222-222222222222',
            amount: 800,
            payment_method: 'Card',
            payment_status: 'Completed',
            invoice_number: 'INV-2026-0002',
            payment_date: new Date(Date.now() - 86400000).toISOString(),
            notes: 'Credit card POS terminal payment',
            created_at: new Date(Date.now() - 86400000).toISOString()
        }
    ];

    class DatabaseManager {
        constructor() {
            this.ensureLocalStorageSeed();
        }

        // Initialize LocalStorage with seed data if empty
        ensureLocalStorageSeed() {
            if (!localStorage.getItem(LS_CUSTOMERS)) {
                localStorage.setItem(LS_CUSTOMERS, JSON.stringify(SEED_CUSTOMERS));
            }
            if (!localStorage.getItem(LS_SERVICES)) {
                localStorage.setItem(LS_SERVICES, JSON.stringify(SEED_SERVICES));
            }
            if (!localStorage.getItem(LS_BARBERS)) {
                localStorage.setItem(LS_BARBERS, JSON.stringify(SEED_BARBERS));
            }
            if (!localStorage.getItem(LS_APPOINTMENTS)) {
                localStorage.setItem(LS_APPOINTMENTS, JSON.stringify(SEED_APPOINTMENTS));
            }
            if (!localStorage.getItem(LS_PAYMENTS)) {
                localStorage.setItem(LS_PAYMENTS, JSON.stringify(SEED_PAYMENTS));
            }
        }

        resetDemoData() {
            localStorage.setItem(LS_CUSTOMERS, JSON.stringify(SEED_CUSTOMERS));
            localStorage.setItem(LS_SERVICES, JSON.stringify(SEED_SERVICES));
            localStorage.setItem(LS_BARBERS, JSON.stringify(SEED_BARBERS));
            localStorage.setItem(LS_APPOINTMENTS, JSON.stringify(SEED_APPOINTMENTS));
            localStorage.setItem(LS_PAYMENTS, JSON.stringify(SEED_PAYMENTS));
            window.dispatchEvent(new CustomEvent('bsms:data-updated', { detail: { entity: 'all' } }));
        }

        get isSupabaseActive() {
            return window.supabaseManager && window.supabaseManager.isConfigured && window.supabaseManager.client;
        }

        get client() {
            return window.supabaseManager ? window.supabaseManager.client : null;
        }

        // =================================================================
        // CUSTOMERS CRUD
        // =================================================================
        async getCustomers(query = '') {
            const searchTerm = (query || '').toLowerCase().trim();

            if (this.isSupabaseActive) {
                try {
                    let req = this.client
                        .from('customers')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (searchTerm) {
                        req = req.or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
                    }

                    const { data, error } = await req;
                    if (!error && data) return data;
                    console.warn('Supabase getCustomers fallback to local:', error);
                } catch (err) {
                    console.warn('Supabase customers query failed:', err);
                }
            }

            // Local fallback
            let list = JSON.parse(localStorage.getItem(LS_CUSTOMERS) || '[]');
            if (searchTerm) {
                list = list.filter(c =>
                    (c.name && c.name.toLowerCase().includes(searchTerm)) ||
                    (c.phone && c.phone.toLowerCase().includes(searchTerm)) ||
                    (c.email && c.email.toLowerCase().includes(searchTerm))
                );
            }
            return list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        }

        async getCustomerById(id) {
            if (this.isSupabaseActive) {
                try {
                    const { data, error } = await this.client
                        .from('customers')
                        .select('*')
                        .eq('id', id)
                        .single();
                    if (!error && data) return data;
                } catch (err) {
                    console.warn(err);
                }
            }
            const list = JSON.parse(localStorage.getItem(LS_CUSTOMERS) || '[]');
            return list.find(c => c.id === id) || null;
        }

        async addCustomer(customer) {
            const item = {
                id: customer.id || generateId(),
                name: (customer.name || '').trim(),
                phone: (customer.phone || '').trim(),
                email: (customer.email || '').trim(),
                notes: (customer.notes || '').trim(),
                created_at: new Date().toISOString()
            };

            if (this.isSupabaseActive) {
                try {
                    const { data, error } = await this.client
                        .from('customers')
                        .insert([item])
                        .select()
                        .single();
                    if (error) throw error;
                    this.notifyChange('customers');
                    return data || item;
                } catch (err) {
                    console.error('Failed to add customer in Supabase:', err);
                    throw err;
                }
            }

            // LocalStorage
            const list = JSON.parse(localStorage.getItem(LS_CUSTOMERS) || '[]');
            list.unshift(item);
            localStorage.setItem(LS_CUSTOMERS, JSON.stringify(list));
            this.notifyChange('customers');
            return item;
        }

        async updateCustomer(id, customerData) {
            if (this.isSupabaseActive) {
                try {
                    const { data, error } = await this.client
                        .from('customers')
                        .update({
                            name: customerData.name,
                            phone: customerData.phone,
                            email: customerData.email,
                            notes: customerData.notes
                        })
                        .eq('id', id)
                        .select()
                        .single();
                    if (error) throw error;
                    this.notifyChange('customers');
                    return data;
                } catch (err) {
                    console.error('Failed to update customer in Supabase:', err);
                    throw err;
                }
            }

            // LocalStorage
            let list = JSON.parse(localStorage.getItem(LS_CUSTOMERS) || '[]');
            const index = list.findIndex(c => c.id === id);
            if (index !== -1) {
                list[index] = { ...list[index], ...customerData };
                localStorage.setItem(LS_CUSTOMERS, JSON.stringify(list));
                this.notifyChange('customers');
                return list[index];
            }
            throw new Error('Customer not found');
        }

        async deleteCustomer(id) {
            if (this.isSupabaseActive) {
                try {
                    const { error } = await this.client
                        .from('customers')
                        .delete()
                        .eq('id', id);
                    if (error) throw error;
                    this.notifyChange('customers');
                    return true;
                } catch (err) {
                    console.error('Failed to delete customer in Supabase:', err);
                    throw err;
                }
            }

            // LocalStorage
            let list = JSON.parse(localStorage.getItem(LS_CUSTOMERS) || '[]');
            list = list.filter(c => c.id !== id);
            localStorage.setItem(LS_CUSTOMERS, JSON.stringify(list));
            this.notifyChange('customers');
            return true;
        }

        // =================================================================
        // SERVICES CRUD
        // =================================================================
        async getServices(category = 'All', query = '') {
            const searchTerm = (query || '').toLowerCase().trim();

            if (this.isSupabaseActive) {
                try {
                    let req = this.client
                        .from('services')
                        .select('*')
                        .order('name', { ascending: true });

                    if (category && category !== 'All') {
                        req = req.eq('category', category);
                    }
                    if (searchTerm) {
                        req = req.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
                    }

                    const { data, error } = await req;
                    if (!error && data) return data;
                } catch (err) {
                    console.warn('Supabase services query failed:', err);
                }
            }

            // Local fallback
            let list = JSON.parse(localStorage.getItem(LS_SERVICES) || '[]');
            if (category && category !== 'All') {
                list = list.filter(s => s.category === category);
            }
            if (searchTerm) {
                list = list.filter(s =>
                    (s.name && s.name.toLowerCase().includes(searchTerm)) ||
                    (s.description && s.description.toLowerCase().includes(searchTerm))
                );
            }
            return list.sort((a, b) => a.name.localeCompare(b.name));
        }

        async getServiceById(id) {
            if (this.isSupabaseActive) {
                try {
                    const { data, error } = await this.client
                        .from('services')
                        .select('*')
                        .eq('id', id)
                        .single();
                    if (!error && data) return data;
                } catch (err) {
                    console.warn(err);
                }
            }
            const list = JSON.parse(localStorage.getItem(LS_SERVICES) || '[]');
            return list.find(s => s.id === id) || null;
        }

        async addService(service) {
            const item = {
                id: service.id || generateId(),
                name: (service.name || '').trim(),
                category: service.category || 'Haircuts',
                duration_minutes: parseInt(service.duration_minutes, 10) || 30,
                price: parseFloat(service.price) || 0,
                description: (service.description || '').trim(),
                is_active: service.is_active !== false,
                created_at: new Date().toISOString()
            };

            if (this.isSupabaseActive) {
                try {
                    const { data, error } = await this.client
                        .from('services')
                        .insert([item])
                        .select()
                        .single();
                    if (error) throw error;
                    this.notifyChange('services');
                    return data || item;
                } catch (err) {
                    console.error('Failed to add service in Supabase:', err);
                    throw err;
                }
            }

            // LocalStorage
            const list = JSON.parse(localStorage.getItem(LS_SERVICES) || '[]');
            list.push(item);
            localStorage.setItem(LS_SERVICES, JSON.stringify(list));
            this.notifyChange('services');
            return item;
        }

        async updateService(id, serviceData) {
            const updatePayload = {
                name: (serviceData.name || '').trim(),
                category: serviceData.category || 'Haircuts',
                duration_minutes: parseInt(serviceData.duration_minutes, 10) || 30,
                price: parseFloat(serviceData.price) || 0,
                description: (serviceData.description || '').trim(),
                is_active: serviceData.is_active !== false
            };

            if (this.isSupabaseActive) {
                try {
                    const { data, error } = await this.client
                        .from('services')
                        .update(updatePayload)
                        .eq('id', id)
                        .select()
                        .single();
                    if (error) throw error;
                    this.notifyChange('services');
                    return data;
                } catch (err) {
                    console.error('Failed to update service in Supabase:', err);
                    throw err;
                }
            }

            // LocalStorage
            let list = JSON.parse(localStorage.getItem(LS_SERVICES) || '[]');
            const index = list.findIndex(s => s.id === id);
            if (index !== -1) {
                list[index] = { ...list[index], ...updatePayload };
                localStorage.setItem(LS_SERVICES, JSON.stringify(list));
                this.notifyChange('services');
                return list[index];
            }
            throw new Error('Service not found');
        }

        async deleteService(id) {
            if (this.isSupabaseActive) {
                try {
                    const { error } = await this.client
                        .from('services')
                        .delete()
                        .eq('id', id);
                    if (error) throw error;
                    this.notifyChange('services');
                    return true;
                } catch (err) {
                    console.error('Failed to delete service in Supabase:', err);
                    throw err;
                }
            }

            // LocalStorage
            let list = JSON.parse(localStorage.getItem(LS_SERVICES) || '[]');
            list = list.filter(s => s.id !== id);
            localStorage.setItem(LS_SERVICES, JSON.stringify(list));
            this.notifyChange('services');
            return true;
        }

        // =================================================================
        // BARBERS (STAFF)
        // =================================================================
        async getBarbers() {
            if (this.isSupabaseActive) {
                try {
                    const { data, error } = await this.client
                        .from('barbers')
                        .select('*')
                        .order('name', { ascending: true });
                    if (!error && data && data.length > 0) return data;
                } catch (err) {
                    console.warn('Supabase barbers query failed:', err);
                }
            }
            return JSON.parse(localStorage.getItem(LS_BARBERS) || '[]');
        }

        // =================================================================
        // APPOINTMENTS CRUD
        // =================================================================
        async getAppointments(filters = {}) {
            const { date, status, customerId, barberId, query } = filters;
            const searchTerm = (query || '').toLowerCase().trim();

            let appointments = [];

            if (this.isSupabaseActive) {
                try {
                    let req = this.client
                        .from('appointments')
                        .select(`
                            *,
                            customers:customer_id (id, name, phone, email),
                            services:service_id (id, name, category, duration_minutes, price),
                            barbers:barber_id (id, name, role)
                        `)
                        .order('appointment_date', { ascending: false })
                        .order('appointment_time', { ascending: true });

                    if (date) {
                        req = req.eq('appointment_date', date);
                    }
                    if (status && status !== 'all') {
                        req = req.eq('status', status);
                    }
                    if (customerId) {
                        req = req.eq('customer_id', customerId);
                    }
                    if (barberId) {
                        req = req.eq('barber_id', barberId);
                    }

                    const { data, error } = await req;
                    if (!error && data) {
                        // Normalize joined relations
                        appointments = data.map(item => ({
                            ...item,
                            customer_name: item.customers ? item.customers.name : 'Unknown Customer',
                            customer_phone: item.customers ? item.customers.phone : '',
                            service_name: item.services ? item.services.name : 'Unknown Service',
                            service_price: item.services ? item.services.price : item.total_price,
                            service_duration: item.services ? item.services.duration_minutes : 30,
                            barber_name: item.barbers ? item.barbers.name : 'Any Barber'
                        }));
                    }
                } catch (err) {
                    console.warn('Supabase appointments query failed:', err);
                }
            }

            // Local fallback if Supabase gave nothing or is not active
            if (appointments.length === 0 && !this.isSupabaseActive) {
                let list = JSON.parse(localStorage.getItem(LS_APPOINTMENTS) || '[]');
                const customers = JSON.parse(localStorage.getItem(LS_CUSTOMERS) || '[]');
                const services = JSON.parse(localStorage.getItem(LS_SERVICES) || '[]');
                const barbers = JSON.parse(localStorage.getItem(LS_BARBERS) || '[]');

                appointments = list.map(app => {
                    const c = customers.find(x => x.id === app.customer_id);
                    const s = services.find(x => x.id === app.service_id);
                    const b = barbers.find(x => x.id === app.barber_id);
                    return {
                        ...app,
                        customer_name: c ? c.name : 'Unknown Customer',
                        customer_phone: c ? c.phone : '',
                        service_name: s ? s.name : 'Unknown Service',
                        service_price: s ? s.price : app.total_price,
                        service_duration: s ? s.duration_minutes : 30,
                        barber_name: b ? b.name : 'Any Barber'
                    };
                });

                if (date) {
                    appointments = appointments.filter(a => a.appointment_date === date);
                }
                if (status && status !== 'all') {
                    appointments = appointments.filter(a => a.status === status);
                }
                if (customerId) {
                    appointments = appointments.filter(a => a.customer_id === customerId);
                }
                if (barberId) {
                    appointments = appointments.filter(a => a.barber_id === barberId);
                }
            }

            // Apply search term filter on customer name or service name
            if (searchTerm) {
                appointments = appointments.filter(a =>
                    (a.customer_name && a.customer_name.toLowerCase().includes(searchTerm)) ||
                    (a.customer_phone && a.customer_phone.includes(searchTerm)) ||
                    (a.service_name && a.service_name.toLowerCase().includes(searchTerm)) ||
                    (a.notes && a.notes.toLowerCase().includes(searchTerm))
                );
            }

            return appointments;
        }

        async getAppointmentById(id) {
            const list = await this.getAppointments();
            return list.find(a => a.id === id) || null;
        }

        async addAppointment(appointment) {
            const item = {
                id: appointment.id || generateId(),
                customer_id: appointment.customer_id,
                service_id: appointment.service_id,
                barber_id: appointment.barber_id || null,
                appointment_date: appointment.appointment_date,
                appointment_time: appointment.appointment_time,
                status: appointment.status || 'pending',
                total_price: parseFloat(appointment.total_price) || 0,
                notes: (appointment.notes || '').trim(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            if (this.isSupabaseActive) {
                try {
                    const { data, error } = await this.client
                        .from('appointments')
                        .insert([item])
                        .select()
                        .single();
                    if (error) throw error;
                    this.notifyChange('appointments');
                    return data || item;
                } catch (err) {
                    console.error('Failed to add appointment in Supabase:', err);
                    throw err;
                }
            }

            // LocalStorage
            const list = JSON.parse(localStorage.getItem(LS_APPOINTMENTS) || '[]');
            list.unshift(item);
            localStorage.setItem(LS_APPOINTMENTS, JSON.stringify(list));
            this.notifyChange('appointments');
            return item;
        }

        async updateAppointment(id, appointmentData) {
            const updatePayload = {
                customer_id: appointmentData.customer_id,
                service_id: appointmentData.service_id,
                barber_id: appointmentData.barber_id || null,
                appointment_date: appointmentData.appointment_date,
                appointment_time: appointmentData.appointment_time,
                status: appointmentData.status || 'pending',
                total_price: parseFloat(appointmentData.total_price) || 0,
                notes: (appointmentData.notes || '').trim(),
                updated_at: new Date().toISOString()
            };

            if (this.isSupabaseActive) {
                try {
                    const { data, error } = await this.client
                        .from('appointments')
                        .update(updatePayload)
                        .eq('id', id)
                        .select()
                        .single();
                    if (error) throw error;
                    this.notifyChange('appointments');
                    return data;
                } catch (err) {
                    console.error('Failed to update appointment in Supabase:', err);
                    throw err;
                }
            }

            // LocalStorage
            let list = JSON.parse(localStorage.getItem(LS_APPOINTMENTS) || '[]');
            const index = list.findIndex(a => a.id === id);
            if (index !== -1) {
                list[index] = { ...list[index], ...updatePayload };
                localStorage.setItem(LS_APPOINTMENTS, JSON.stringify(list));
                this.notifyChange('appointments');
                return list[index];
            }
            throw new Error('Appointment not found');
        }

        async updateAppointmentStatus(id, newStatus) {
            if (this.isSupabaseActive) {
                try {
                    const { data, error } = await this.client
                        .from('appointments')
                        .update({ status: newStatus, updated_at: new Date().toISOString() })
                        .eq('id', id)
                        .select()
                        .single();
                    if (error) throw error;
                    this.notifyChange('appointments');
                    return data;
                } catch (err) {
                    console.error('Failed to update status in Supabase:', err);
                    throw err;
                }
            }

            // LocalStorage
            let list = JSON.parse(localStorage.getItem(LS_APPOINTMENTS) || '[]');
            const index = list.findIndex(a => a.id === id);
            if (index !== -1) {
                list[index].status = newStatus;
                list[index].updated_at = new Date().toISOString();
                localStorage.setItem(LS_APPOINTMENTS, JSON.stringify(list));
                this.notifyChange('appointments');
                return list[index];
            }
            throw new Error('Appointment not found');
        }

        async deleteAppointment(id) {
            if (this.isSupabaseActive) {
                try {
                    const { error } = await this.client
                        .from('appointments')
                        .delete()
                        .eq('id', id);
                    if (error) throw error;
                    this.notifyChange('appointments');
                    return true;
                } catch (err) {
                    console.error('Failed to delete appointment in Supabase:', err);
                    throw err;
                }
            }

            // LocalStorage
            let list = JSON.parse(localStorage.getItem(LS_APPOINTMENTS) || '[]');
            list = list.filter(a => a.id !== id);
            localStorage.setItem(LS_APPOINTMENTS, JSON.stringify(list));
            this.notifyChange('appointments');
            return true;
        }

        // =================================================================
        // PAYMENTS CRUD
        // =================================================================
        generateInvoiceNumber() {
            const year = new Date().getFullYear();
            const random = Math.floor(1000 + Math.random() * 9000);
            return `INV-${year}-${random}`;
        }

        async getPayments(filters = {}) {
            const { method, status, query } = filters;
            const searchTerm = (query || '').toLowerCase().trim();

            let payments = [];

            if (this.isSupabaseActive) {
                try {
                    let req = this.client
                        .from('payments')
                        .select(`
                            *,
                            customers:customer_id (id, name, phone),
                            appointments:appointment_id (id, appointment_date, service_id, services:service_id(name))
                        `)
                        .order('payment_date', { ascending: false });

                    if (method && method !== 'all') {
                        req = req.eq('payment_method', method);
                    }
                    if (status && status !== 'all') {
                        req = req.eq('payment_status', status);
                    }

                    const { data, error } = await req;
                    if (!error && data) {
                        payments = data.map(p => ({
                            ...p,
                            customer_name: p.customers ? p.customers.name : 'Walk-in Customer',
                            customer_phone: p.customers ? p.customers.phone : '',
                            service_name: (p.appointments && p.appointments.services) ? p.appointments.services.name : 'Direct Service / Product'
                        }));
                    }
                } catch (err) {
                    console.warn('Supabase payments query failed:', err);
                }
            }

            // Local fallback
            if (payments.length === 0 && !this.isSupabaseActive) {
                let list = JSON.parse(localStorage.getItem(LS_PAYMENTS) || '[]');
                const customers = JSON.parse(localStorage.getItem(LS_CUSTOMERS) || '[]');
                const appointments = JSON.parse(localStorage.getItem(LS_APPOINTMENTS) || '[]');
                const services = JSON.parse(localStorage.getItem(LS_SERVICES) || '[]');

                payments = list.map(p => {
                    const c = customers.find(x => x.id === p.customer_id);
                    const a = appointments.find(x => x.id === p.appointment_id);
                    const s = a ? services.find(x => x.id === a.service_id) : null;
                    return {
                        ...p,
                        customer_name: c ? c.name : 'Walk-in Customer',
                        customer_phone: c ? c.phone : '',
                        service_name: s ? s.name : 'Direct Service'
                    };
                });

                if (method && method !== 'all') {
                    payments = payments.filter(p => p.payment_method === method);
                }
                if (status && status !== 'all') {
                    payments = payments.filter(p => p.payment_status === status);
                }
            }

            if (searchTerm) {
                payments = payments.filter(p =>
                    (p.invoice_number && p.invoice_number.toLowerCase().includes(searchTerm)) ||
                    (p.customer_name && p.customer_name.toLowerCase().includes(searchTerm)) ||
                    (p.payment_method && p.payment_method.toLowerCase().includes(searchTerm))
                );
            }

            return payments;
        }

        async getPaymentById(id) {
            const list = await this.getPayments();
            return list.find(p => p.id === id) || null;
        }

        async addPayment(payment) {
            const item = {
                id: payment.id || generateId(),
                appointment_id: payment.appointment_id || null,
                customer_id: payment.customer_id || null,
                amount: parseFloat(payment.amount) || 0,
                payment_method: payment.payment_method || 'Cash',
                payment_status: payment.payment_status || 'Completed',
                invoice_number: payment.invoice_number || this.generateInvoiceNumber(),
                payment_date: payment.payment_date || new Date().toISOString(),
                notes: (payment.notes || '').trim(),
                created_at: new Date().toISOString()
            };

            if (this.isSupabaseActive) {
                try {
                    const { data, error } = await this.client
                        .from('payments')
                        .insert([item])
                        .select()
                        .single();
                    if (error) throw error;

                    // If linked to an appointment, mark appointment as completed
                    if (item.appointment_id) {
                        await this.updateAppointmentStatus(item.appointment_id, 'completed').catch(() => {});
                    }

                    this.notifyChange('payments');
                    return data || item;
                } catch (err) {
                    console.error('Failed to add payment in Supabase:', err);
                    throw err;
                }
            }

            // LocalStorage
            const list = JSON.parse(localStorage.getItem(LS_PAYMENTS) || '[]');
            list.unshift(item);
            localStorage.setItem(LS_PAYMENTS, JSON.stringify(list));

            if (item.appointment_id) {
                await this.updateAppointmentStatus(item.appointment_id, 'completed').catch(() => {});
            }

            this.notifyChange('payments');
            return item;
        }

        async deletePayment(id) {
            if (this.isSupabaseActive) {
                try {
                    const { error } = await this.client
                        .from('payments')
                        .delete()
                        .eq('id', id);
                    if (error) throw error;
                    this.notifyChange('payments');
                    return true;
                } catch (err) {
                    console.error('Failed to delete payment in Supabase:', err);
                    throw err;
                }
            }

            // LocalStorage
            let list = JSON.parse(localStorage.getItem(LS_PAYMENTS) || '[]');
            list = list.filter(p => p.id !== id);
            localStorage.setItem(LS_PAYMENTS, JSON.stringify(list));
            this.notifyChange('payments');
            return true;
        }

        // =================================================================
        // DASHBOARD & ANALYTICS STATS
        // =================================================================
        async getDashboardStats() {
            const today = new Date().toISOString().split('T')[0];

            const [customers, services, appointments, payments] = await Promise.all([
                this.getCustomers(),
                this.getServices(),
                this.getAppointments(),
                this.getPayments()
            ]);

            const todayAppointments = appointments.filter(a => a.appointment_date === today);
            const todayCompleted = todayAppointments.filter(a => a.status === 'completed');
            const todayPending = todayAppointments.filter(a => a.status === 'pending' || a.status === 'confirmed');

            // Today Revenue (from payments done today)
            const todayRevenue = payments
                .filter(p => p.payment_date && p.payment_date.startsWith(today) && p.payment_status === 'Completed')
                .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

            // Total Revenue
            const totalRevenue = payments
                .filter(p => p.payment_status === 'Completed')
                .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

            return {
                totalCustomers: customers.length,
                totalServices: services.length,
                todayAppointmentsCount: todayAppointments.length,
                todayCompletedCount: todayCompleted.length,
                todayPendingCount: todayPending.length,
                todayRevenue: todayRevenue,
                totalRevenue: totalRevenue,
                recentAppointments: appointments.slice(0, 6),
                recentPayments: payments.slice(0, 5)
            };
        }

        // =================================================================
        // SEED SUPABASE FROM CLIENT (Sync helper)
        // =================================================================
        async seedSupabaseWithInitialData() {
            if (!this.isSupabaseActive) {
                throw new Error('Supabase is not connected.');
            }

            const c = this.client;

            // Insert Barbers
            await c.from('barbers').upsert(SEED_BARBERS, { onConflict: 'id' });
            // Insert Services
            await c.from('services').upsert(SEED_SERVICES, { onConflict: 'id' });
            // Insert Customers
            await c.from('customers').upsert(SEED_CUSTOMERS, { onConflict: 'id' });
            // Insert Appointments
            await c.from('appointments').upsert(SEED_APPOINTMENTS, { onConflict: 'id' });
            // Insert Payments
            await c.from('payments').upsert(SEED_PAYMENTS, { onConflict: 'id' });

            this.notifyChange('all');
            return true;
        }

        notifyChange(entity) {
            window.dispatchEvent(new CustomEvent('bsms:data-updated', { detail: { entity } }));
        }
    }

    window.bsmsDB = new DatabaseManager();
})();

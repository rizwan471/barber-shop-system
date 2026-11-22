/**
 * Barber Shop Management System - Supabase Client Manager
 */

(function () {
    const STORAGE_KEY_URL = 'bsms_supabase_url';
    const STORAGE_KEY_KEY = 'bsms_supabase_key';

    class SupabaseManager {
        constructor() {
            this.client = null;
            this.isConfigured = false;
            this.isConnected = false;
            this.lastError = null;
            this.url = '';
            this.key = '';

            this.init();
        }

        init() {
            // Priority: LocalStorage > APP_CONFIG
            const storedUrl = localStorage.getItem(STORAGE_KEY_URL);
            const storedKey = localStorage.getItem(STORAGE_KEY_KEY);
            const configUrl = (window.APP_CONFIG && window.APP_CONFIG.supabaseUrl) || '';
            const configKey = (window.APP_CONFIG && window.APP_CONFIG.supabaseAnonKey) || '';

            this.url = (storedUrl || configUrl).trim();
            this.key = (storedKey || configKey).trim();

            if (this.url && this.key && window.supabase) {
                try {
                    this.client = window.supabase.createClient(this.url, this.key);
                    this.isConfigured = true;
                } catch (err) {
                    console.error('Failed to initialize Supabase client:', err);
                    this.client = null;
                    this.isConfigured = false;
                    this.lastError = err.message;
                }
            } else {
                this.client = null;
                this.isConfigured = false;
            }
        }

        getCredentials() {
            return {
                url: this.url,
                key: this.key,
                isConfigured: this.isConfigured,
                isConnected: this.isConnected
            };
        }

        saveCredentials(url, key) {
            const cleanUrl = (url || '').trim();
            const cleanKey = (key || '').trim();

            if (cleanUrl) {
                localStorage.setItem(STORAGE_KEY_URL, cleanUrl);
            } else {
                localStorage.removeItem(STORAGE_KEY_URL);
            }

            if (cleanKey) {
                localStorage.setItem(STORAGE_KEY_KEY, cleanKey);
            } else {
                localStorage.removeItem(STORAGE_KEY_KEY);
            }

            this.init();
            return this.testConnection();
        }

        clearCredentials() {
            localStorage.removeItem(STORAGE_KEY_URL);
            localStorage.removeItem(STORAGE_KEY_KEY);
            this.client = null;
            this.isConfigured = false;
            this.isConnected = false;
            this.url = '';
            this.key = '';
            this.notifyStatus(false, 'Credentials cleared. Operating in Local Demo Mode.');
        }

        async testConnection() {
            if (!this.isConfigured || !this.client) {
                this.isConnected = false;
                this.notifyStatus(false, 'Supabase credentials not configured. Using Demo Mode.');
                return { success: false, message: 'Supabase credentials are not configured.' };
            }

            try {
                // Perform a simple probe query to check table connectivity
                const { data, error } = await this.client
                    .from('services')
                    .select('id')
                    .limit(1);

                if (error) {
                    throw error;
                }

                this.isConnected = true;
                this.lastError = null;
                this.notifyStatus(true, 'Successfully connected to Supabase Database!');
                return { success: true, message: 'Connected successfully to Supabase!' };
            } catch (err) {
                this.isConnected = false;
                this.lastError = err.message || 'Connection failed';
                console.warn('Supabase testConnection error:', err);
                this.notifyStatus(false, `Connection error: ${err.message || 'Failed to connect'}`);
                return {
                    success: false,
                    message: `Database error: ${err.message || 'Could not query Supabase tables. Have you executed supabase_setup.sql in your Supabase SQL Editor?'}`
                };
            }
        }

        notifyStatus(connected, message) {
            window.dispatchEvent(new CustomEvent('supabase:status-changed', {
                detail: {
                    connected: connected,
                    isConfigured: this.isConfigured,
                    message: message
                }
            }));
        }
    }

    window.supabaseManager = new SupabaseManager();
})();

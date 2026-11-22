/**
 * Barber Shop Management System - Main App Orchestrator & Router
 */

(function () {
    class App {
        constructor() {
            this.currentView = 'dashboard';
            this.views = ['dashboard', 'customers', 'services', 'appointments', 'payments', 'reports'];
            this.init();
        }

        async init() {
            this.bindNavigation();
            this.bindSidebarToggle();
            this.bindSettings();
            this.bindConnectionBadge();

            // Handle hash on load or default to dashboard
            const hash = window.location.hash.replace('#', '').trim();
            if (this.views.includes(hash)) {
                this.navigate(hash);
            } else {
                this.navigate('dashboard');
            }

            // Test Supabase connection in background
            if (window.supabaseManager && window.supabaseManager.isConfigured) {
                await window.supabaseManager.testConnection();
            } else {
                this.updateConnectionStatusBadge(false, 'Demo / Local Mode');
            }
        }

        bindNavigation() {
            // Navigation links in sidebar
            document.querySelectorAll('[data-navigate]').forEach(el => {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    const view = el.getAttribute('data-navigate');
                    this.navigate(view);

                    // Close mobile sidebar if open
                    const sidebar = document.getElementById('app-sidebar');
                    const overlay = document.getElementById('sidebar-overlay');
                    if (sidebar && sidebar.classList.contains('mobile-open')) {
                        sidebar.classList.remove('mobile-open');
                    }
                    if (overlay && overlay.classList.contains('active')) {
                        overlay.classList.remove('active');
                    }
                });
            });

            // Hash change listener for browser back/forward
            window.addEventListener('hashchange', () => {
                const hash = window.location.hash.replace('#', '').trim();
                if (this.views.includes(hash) && hash !== this.currentView) {
                    this.navigate(hash, false);
                }
            });
        }

        navigate(viewName, updateHash = true) {
            if (!this.views.includes(viewName)) return;

            // Ensure mobile sidebar & overlay are always dismissed on navigation
            const sidebar = document.getElementById('app-sidebar');
            const overlay = document.getElementById('sidebar-overlay');
            if (sidebar) sidebar.classList.remove('mobile-open');
            if (overlay) overlay.classList.remove('active');

            this.currentView = viewName;
            if (updateHash) {
                window.location.hash = viewName;
            }

            // Update sidebar nav active state
            document.querySelectorAll('.nav-link').forEach(link => {
                if (link.getAttribute('data-navigate') === viewName) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });

            // Update main views visibility
            this.views.forEach(v => {
                const viewEl = document.getElementById(`view-${v}`);
                if (viewEl) {
                    if (v === viewName) {
                        viewEl.classList.remove('d-none');
                        viewEl.classList.add('active');
                    } else {
                        viewEl.classList.add('d-none');
                        viewEl.classList.remove('active');
                    }
                }
            });

            // Trigger view-specific controller render
            switch (viewName) {
                case 'dashboard':
                    if (window.dashboardController) window.dashboardController.render();
                    break;
                case 'customers':
                    if (window.customersController) window.customersController.render();
                    break;
                case 'services':
                    if (window.servicesController) window.servicesController.render();
                    break;
                case 'appointments':
                    if (window.appointmentsController) window.appointmentsController.render();
                    break;
                case 'payments':
                    if (window.paymentsController) window.paymentsController.render();
                    break;
                case 'reports':
                    if (window.reportsController) window.reportsController.render();
                    break;
            }

            // Scroll top of view
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        bindSidebarToggle() {
            const toggleBtn = document.getElementById('btn-sidebar-toggle');
            const sidebar = document.getElementById('app-sidebar');
            const overlay = document.getElementById('sidebar-overlay');

            if (toggleBtn && sidebar) {
                toggleBtn.addEventListener('click', () => {
                    sidebar.classList.toggle('mobile-open');
                    if (overlay) overlay.classList.toggle('active');
                });
            }

            if (overlay) {
                overlay.addEventListener('click', () => {
                    if (sidebar) sidebar.classList.remove('mobile-open');
                    overlay.classList.remove('active');
                });
            }
        }

        bindConnectionBadge() {
            window.addEventListener('supabase:status-changed', (e) => {
                const { connected, isConfigured, message } = e.detail;
                this.updateConnectionStatusBadge(connected, isConfigured ? (connected ? 'Connected to Supabase' : 'Connection Error') : 'Demo / Local Mode');
            });
        }

        updateConnectionStatusBadge(connected, text) {
            const badge = document.getElementById('supabase-status-badge');
            const dot = document.getElementById('supabase-status-dot');
            const textEl = document.getElementById('supabase-status-text');

            if (badge && textEl) {
                textEl.textContent = text;
                if (connected) {
                    dot.className = 'status-dot dot-online';
                    badge.className = 'status-badge badge-online';
                } else if (text === 'Demo / Local Mode') {
                    dot.className = 'status-dot dot-demo';
                    badge.className = 'status-badge badge-demo';
                } else {
                    dot.className = 'status-dot dot-offline';
                    badge.className = 'status-badge badge-offline';
                }
            }
        }

        bindSettings() {
            const settingsBtn = document.getElementById('btn-open-settings');
            if (settingsBtn) {
                settingsBtn.addEventListener('click', () => this.openSettingsModal());
            }

            const settingsForm = document.getElementById('settings-form');
            if (settingsForm) {
                settingsForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await this.saveSettings();
                });
            }

            // Test Connection button
            const btnTest = document.getElementById('btn-test-supabase');
            if (btnTest) {
                btnTest.addEventListener('click', async () => {
                    btnTest.disabled = true;
                    btnTest.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Testing...';

                    const url = document.getElementById('settings-supabase-url').value;
                    const key = document.getElementById('settings-supabase-key').value;

                    // Temporarily set and test
                    window.supabaseManager.saveCredentials(url, key);
                    const res = await window.supabaseManager.testConnection();

                    btnTest.disabled = false;
                    btnTest.textContent = '⚡ Test Connection';

                    if (res.success) {
                        UI.showToast(res.message, 'success');
                    } else {
                        UI.showToast(res.message, 'error', 6000);
                    }
                });
            }

            // Sync demo data to Supabase button
            const btnSync = document.getElementById('btn-sync-to-supabase');
            if (btnSync) {
                btnSync.addEventListener('click', async () => {
                    if (!window.supabaseManager.isConfigured || !window.supabaseManager.client) {
                        UI.showToast('Please connect and verify Supabase credentials first', 'warning');
                        return;
                    }

                    const confirmed = await UI.confirm(
                        'Upload Demo Data to Supabase',
                        'This will insert default services, barbers, customers, and appointments into your Supabase database. Continue?',
                        'Upload Now',
                        'btn-primary'
                    );

                    if (confirmed) {
                        try {
                            btnSync.disabled = true;
                            btnSync.innerHTML = 'Uploading...';
                            await window.bsmsDB.seedSupabaseWithInitialData();
                            btnSync.disabled = false;
                            btnSync.textContent = '🚀 Seed / Sync Data to Supabase';
                            UI.showToast('Demo data successfully uploaded to Supabase!', 'success');
                            this.navigate(this.currentView);
                        } catch (err) {
                            btnSync.disabled = false;
                            btnSync.textContent = '🚀 Seed / Sync Data to Supabase';
                            console.error('Seed error:', err);
                            UI.showToast(`Upload failed: ${err.message}`, 'error', 6000);
                        }
                    }
                });
            }

            // Reset demo data button
            const btnResetLocal = document.getElementById('btn-reset-demo-data');
            if (btnResetLocal) {
                btnResetLocal.addEventListener('click', async () => {
                    const confirmed = await UI.confirm(
                        'Reset Demo Data',
                        'This will restore default sample customers, appointments, and services in local storage. Continue?'
                    );
                    if (confirmed) {
                        window.bsmsDB.resetDemoData();
                        UI.showToast('Demo data has been reset to defaults', 'success');
                        this.navigate(this.currentView);
                    }
                });
            }
        }

        openSettingsModal() {
            const creds = window.supabaseManager.getCredentials();
            document.getElementById('settings-supabase-url').value = creds.url || '';
            document.getElementById('settings-supabase-key').value = creds.key || '';

            // Shop configuration
            document.getElementById('settings-shop-name').value = window.APP_CONFIG.shopName;
            document.getElementById('settings-tagline').value = window.APP_CONFIG.tagline;
            document.getElementById('settings-currency').value = window.APP_CONFIG.currencySymbol;
            document.getElementById('settings-phone').value = window.APP_CONFIG.phone;
            document.getElementById('settings-address').value = window.APP_CONFIG.address;

            UI.openModal('settings-modal');
        }

        async saveSettings() {
            const url = document.getElementById('settings-supabase-url').value.trim();
            const key = document.getElementById('settings-supabase-key').value.trim();

            // Save shop settings
            window.APP_CONFIG.shopName = document.getElementById('settings-shop-name').value.trim() || 'Elite Barber Lounge';
            window.APP_CONFIG.tagline = document.getElementById('settings-tagline').value.trim() || 'Premium Grooming';
            window.APP_CONFIG.currencySymbol = document.getElementById('settings-currency').value.trim() || 'Rs. ';
            window.APP_CONFIG.phone = document.getElementById('settings-phone').value.trim() || '';
            window.APP_CONFIG.address = document.getElementById('settings-address').value.trim() || '';

            // Update UI brand title
            const brandTitle = document.getElementById('app-brand-title');
            if (brandTitle) brandTitle.textContent = window.APP_CONFIG.shopName;

            // Save Supabase credentials
            const res = await window.supabaseManager.saveCredentials(url, key);

            UI.closeModal('settings-modal');

            if (url && key) {
                if (res.success) {
                    UI.showToast('Settings saved & connected to Supabase!', 'success');
                } else {
                    UI.showToast(`Saved, but Supabase test failed: ${res.message}`, 'warning', 6000);
                }
            } else {
                UI.showToast('Settings saved (Running in Demo/Local Mode)', 'info');
            }

            // Refresh current view
            this.navigate(this.currentView);
        }
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new App();
    });
})();

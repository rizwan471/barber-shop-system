/**
 * Barber Shop Management System - Dashboard Module
 */

(function () {
    class DashboardController {
        constructor() {
            this.container = document.getElementById('view-dashboard');
            this.initListeners();
        }

        initListeners() {
            window.addEventListener('bsms:data-updated', () => {
                const currentView = window.app ? window.app.currentView : '';
                if (currentView === 'dashboard') {
                    this.render();
                }
            });
        }

        async render() {
            if (!this.container) return;

            try {
                const stats = await window.bsmsDB.getDashboardStats();
                const todayStr = new Date().toISOString().split('T')[0];

                // Update KPI Cards
                const elTodayAppts = document.getElementById('kpi-today-appts');
                const elTodayRev = document.getElementById('kpi-today-revenue');
                const elTotalCust = document.getElementById('kpi-total-customers');
                const elCompletedToday = document.getElementById('kpi-completed-today');

                if (elTodayAppts) elTodayAppts.textContent = stats.todayAppointmentsCount;
                if (elTodayRev) elTodayRev.textContent = UI.formatCurrency(stats.todayRevenue);
                if (elTotalCust) elTotalCust.textContent = stats.totalCustomers;
                if (elCompletedToday) elCompletedToday.textContent = stats.todayCompletedCount;

                // Render Today's Schedule Table/Cards
                this.renderTodaySchedule(stats.recentAppointments.filter(a => a.appointment_date === todayStr));

                // Render Recent Payments Feed
                this.renderRecentPayments(stats.recentPayments);

                // Render Revenue Breakdown Chart
                this.renderRevenueChart();
            } catch (err) {
                console.error('Error rendering dashboard:', err);
                UI.showToast('Could not refresh dashboard data', 'error');
            }
        }

        renderTodaySchedule(appointments) {
            const listEl = document.getElementById('dashboard-today-appointments');
            if (!listEl) return;

            if (appointments.length === 0) {
                listEl.innerHTML = `
                    <div class="empty-state p-4 text-center">
                        <div class="empty-icon">📅</div>
                        <p class="text-muted">No appointments scheduled for today.</p>
                        <button class="btn btn-sm btn-primary mt-2" onclick="window.app.navigate('appointments'); window.appointmentsController.openBookModal();">
                            + Book Now
                        </button>
                    </div>
                `;
                return;
            }

            let html = `
                <div class="table-responsive">
                    <table class="table align-middle">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Customer</th>
                                <th>Service</th>
                                <th>Barber</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th class="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            appointments.forEach(app => {
                html += `
                    <tr>
                        <td class="fw-semibold text-accent">${UI.formatTime(app.appointment_time)}</td>
                        <td>
                            <div class="fw-bold">${app.customer_name}</div>
                            <small class="text-muted">${app.customer_phone || ''}</small>
                        </td>
                        <td>${app.service_name}</td>
                        <td><span class="badge badge-subtle">${app.barber_name}</span></td>
                        <td class="fw-bold">${UI.formatCurrency(app.total_price)}</td>
                        <td>${UI.getStatusBadge(app.status)}</td>
                        <td class="text-end">
                            <div class="btn-group btn-group-sm">
                                ${app.status !== 'completed' ? `
                                    <button class="btn btn-sm btn-success" title="Mark Completed" onclick="window.appointmentsController.quickStatusChange('${app.id}', 'completed')">
                                        ✓ Done
                                    </button>
                                ` : `
                                    <button class="btn btn-sm btn-outline-primary" title="View/Print Receipt" onclick="window.paymentsController.openReceiptFromAppointment('${app.id}')">
                                        🧾 Receipt
                                    </button>
                                `}
                                ${app.status !== 'completed' && app.status !== 'cancelled' ? `
                                    <button class="btn btn-sm btn-warning" title="Pay Now" onclick="window.paymentsController.openPaymentModalWithAppointment('${app.id}')">
                                        💳 Pay
                                    </button>
                                ` : ''}
                            </div>
                        </td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;
            listEl.innerHTML = html;
        }

        renderRecentPayments(payments) {
            const listEl = document.getElementById('dashboard-recent-payments');
            if (!listEl) return;

            if (!payments || payments.length === 0) {
                listEl.innerHTML = `
                    <div class="empty-state p-4 text-center">
                        <p class="text-muted">No recent payments logged.</p>
                    </div>
                `;
                return;
            }

            let html = `
                <div class="list-group">
            `;

            payments.forEach(p => {
                html += `
                    <div class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <div class="fw-bold">${p.customer_name}</div>
                            <small class="text-muted">${p.invoice_number} &bull; ${p.payment_method}</small>
                        </div>
                        <div class="text-end">
                            <div class="fw-bold text-success">${UI.formatCurrency(p.amount)}</div>
                            <small class="text-muted">${UI.formatDate(p.payment_date)}</small>
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
            listEl.innerHTML = html;
        }

        async renderRevenueChart() {
            const chartContainer = document.getElementById('dashboard-chart-container');
            if (!chartContainer) return;

            const payments = await window.bsmsDB.getPayments();

            // Calculate earnings for the last 7 days
            const days = [];
            const dayLabels = [];
            const amounts = [];

            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateKey = d.toISOString().split('T')[0];
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

                const totalForDay = payments
                    .filter(p => p.payment_date && p.payment_date.startsWith(dateKey) && p.payment_status === 'Completed')
                    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

                days.push(dateKey);
                dayLabels.push(dayName);
                amounts.push(totalForDay);
            }

            const maxAmount = Math.max(...amounts, 1000);

            // Render lightweight and reactive SVG Bar Chart
            let svgHtml = `
                <div class="chart-wrapper">
                    <div class="chart-header d-flex justify-content-between align-items-center mb-3">
                        <h4 class="card-title m-0">Revenue (Last 7 Days)</h4>
                        <span class="badge badge-accent">Live Stats</span>
                    </div>
                    <div class="bar-chart-bars">
            `;

            amounts.forEach((amt, idx) => {
                const heightPercent = Math.max(Math.round((amt / maxAmount) * 100), 6);
                svgHtml += `
                    <div class="chart-bar-col">
                        <div class="chart-bar-tooltip">${UI.formatCurrency(amt)}</div>
                        <div class="chart-bar-fill" style="height: ${heightPercent}%"></div>
                        <span class="chart-bar-label">${dayLabels[idx]}</span>
                    </div>
                `;
            });

            svgHtml += `
                    </div>
                </div>
            `;

            chartContainer.innerHTML = svgHtml;
        }
    }

    window.dashboardController = new DashboardController();
})();

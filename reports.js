/**
 * Barber Shop Management System - Reports & Analytics Module
 */

(function () {
    class ReportsController {
        constructor() {
            this.container = document.getElementById('view-reports');
            this.currentRange = 'this-month';
            this.startDate = '';
            this.endDate = '';
            this.initListeners();
        }

        initListeners() {
            // Range selector buttons
            const rangeBtns = document.getElementById('report-range-btns');
            if (rangeBtns) {
                rangeBtns.addEventListener('click', (e) => {
                    const btn = e.target.closest('button');
                    if (btn) {
                        rangeBtns.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        this.currentRange = btn.getAttribute('data-range') || 'this-month';

                        const customDates = document.getElementById('report-custom-dates');
                        if (this.currentRange === 'custom') {
                            if (customDates) customDates.classList.remove('d-none');
                        } else {
                            if (customDates) customDates.classList.add('d-none');
                            this.calculateRangeDates();
                            this.render();
                        }
                    }
                });
            }

            // Custom date inputs
            const btnApplyCustom = document.getElementById('btn-apply-report-custom');
            if (btnApplyCustom) {
                btnApplyCustom.addEventListener('click', () => {
                    const startInput = document.getElementById('report-start-date');
                    const endInput = document.getElementById('report-end-date');
                    this.startDate = startInput ? startInput.value : '';
                    this.endDate = endInput ? endInput.value : '';
                    if (!this.startDate || !this.endDate) {
                        UI.showToast('Please select both start and end dates', 'warning');
                        return;
                    }
                    this.render();
                });
            }

            // Export Buttons
            const btnExportAppts = document.getElementById('btn-export-appointments-csv');
            if (btnExportAppts) {
                btnExportAppts.addEventListener('click', () => this.exportAppointmentsCSV());
            }

            const btnExportPayments = document.getElementById('btn-export-payments-csv');
            if (btnExportPayments) {
                btnExportPayments.addEventListener('click', () => this.exportPaymentsCSV());
            }

            const btnExportCustomers = document.getElementById('btn-export-customers-csv');
            if (btnExportCustomers) {
                btnExportCustomers.addEventListener('click', () => this.exportCustomersCSV());
            }

            const btnPrintReport = document.getElementById('btn-print-report');
            if (btnPrintReport) {
                btnPrintReport.addEventListener('click', () => window.print());
            }

            // Listen for data update events
            window.addEventListener('bsms:data-updated', () => {
                if (window.app && window.app.currentView === 'reports') {
                    this.render();
                }
            });
        }

        calculateRangeDates() {
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];

            if (this.currentRange === 'today') {
                this.startDate = todayStr;
                this.endDate = todayStr;
            } else if (this.currentRange === 'last-7') {
                const past7 = new Date(now);
                past7.setDate(past7.getDate() - 7);
                this.startDate = past7.toISOString().split('T')[0];
                this.endDate = todayStr;
            } else if (this.currentRange === 'this-month') {
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                this.startDate = firstDay.toISOString().split('T')[0];
                this.endDate = todayStr;
            } else if (this.currentRange === 'all') {
                this.startDate = '2000-01-01';
                this.endDate = '2099-12-31';
            }
        }

        async render() {
            if (!this.startDate || !this.endDate) {
                this.calculateRangeDates();
            }

            const labelEl = document.getElementById('report-active-range-label');
            if (labelEl) {
                labelEl.textContent = `${UI.formatDate(this.startDate)} - ${UI.formatDate(this.endDate)}`;
            }

            try {
                const [appointments, payments, services, customers] = await Promise.all([
                    window.bsmsDB.getAppointments(),
                    window.bsmsDB.getPayments(),
                    window.bsmsDB.getServices(),
                    window.bsmsDB.getCustomers()
                ]);

                // Filter payments by date range
                const filteredPayments = payments.filter(p => {
                    const d = (p.payment_date || '').split('T')[0];
                    return d >= this.startDate && d <= this.endDate && p.payment_status === 'Completed';
                });

                // Filter appointments by date range
                const filteredAppts = appointments.filter(a => {
                    return a.appointment_date >= this.startDate && a.appointment_date <= this.endDate;
                });

                const completedAppts = filteredAppts.filter(a => a.status === 'completed');

                // Summary Stats
                const totalRevenue = filteredPayments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
                const avgTicket = completedAppts.length > 0 ? (totalRevenue / completedAppts.length) : 0;

                // Update KPI Cards
                document.getElementById('report-kpi-revenue').textContent = UI.formatCurrency(totalRevenue);
                document.getElementById('report-kpi-appts').textContent = filteredAppts.length;
                document.getElementById('report-kpi-completed').textContent = completedAppts.length;
                document.getElementById('report-kpi-avg-ticket').textContent = UI.formatCurrency(avgTicket);

                // Service Performance Breakdown
                this.renderServiceBreakdown(filteredPayments, services);

                // Payment Methods Breakdown
                this.renderPaymentMethodBreakdown(filteredPayments);

                // Top Customers Breakdown
                this.renderTopCustomers(filteredPayments, customers);
            } catch (err) {
                console.error('Error rendering reports:', err);
                UI.showToast('Failed to generate report data', 'error');
            }
        }

        renderServiceBreakdown(payments, services) {
            const container = document.getElementById('report-service-breakdown');
            if (!container) return;

            // Group payments by service
            const serviceMap = {};
            let maxRev = 1;

            payments.forEach(p => {
                const sName = p.service_name || 'Other Services';
                if (!serviceMap[sName]) {
                    serviceMap[sName] = { name: sName, count: 0, revenue: 0 };
                }
                serviceMap[sName].count += 1;
                serviceMap[sName].revenue += (parseFloat(p.amount) || 0);
            });

            const sorted = Object.values(serviceMap).sort((a, b) => b.revenue - a.revenue);
            sorted.forEach(s => {
                if (s.revenue > maxRev) maxRev = s.revenue;
            });

            if (sorted.length === 0) {
                container.innerHTML = '<p class="text-muted text-center p-3">No service data in this period.</p>';
                return;
            }

            let html = '<div class="service-breakdown-list">';
            sorted.forEach(s => {
                const pct = Math.round((s.revenue / maxRev) * 100);
                html += `
                    <div class="mb-3">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="fw-semibold">${s.name} <small class="text-muted">(${s.count} times)</small></span>
                            <span class="fw-bold text-accent">${UI.formatCurrency(s.revenue)}</span>
                        </div>
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar" style="width: ${pct}%"></div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';

            container.innerHTML = html;
        }

        renderPaymentMethodBreakdown(payments) {
            const container = document.getElementById('report-methods-breakdown');
            if (!container) return;

            const methods = {};
            let total = 0;

            payments.forEach(p => {
                const m = p.payment_method || 'Cash';
                methods[m] = (methods[m] || 0) + (parseFloat(p.amount) || 0);
                total += (parseFloat(p.amount) || 0);
            });

            if (total === 0) {
                container.innerHTML = '<p class="text-muted text-center p-3">No payments recorded in this period.</p>';
                return;
            }

            let html = '<ul class="list-group list-group-flush">';
            for (const [method, amount] of Object.entries(methods)) {
                const pct = Math.round((amount / total) * 100);
                html += `
                    <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent">
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge badge-subtle">${method}</span>
                            <span class="text-muted-small">${pct}%</span>
                        </div>
                        <span class="fw-bold">${UI.formatCurrency(amount)}</span>
                    </li>
                `;
            }
            html += '</ul>';

            container.innerHTML = html;
        }

        renderTopCustomers(payments, customers) {
            const container = document.getElementById('report-top-customers');
            if (!container) return;

            const custMap = {};
            payments.forEach(p => {
                const cId = p.customer_id;
                if (!custMap[cId]) {
                    custMap[cId] = {
                        name: p.customer_name || 'Guest',
                        phone: p.customer_phone || '',
                        count: 0,
                        totalSpent: 0
                    };
                }
                custMap[cId].count += 1;
                custMap[cId].totalSpent += (parseFloat(p.amount) || 0);
            });

            const sorted = Object.values(custMap).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

            if (sorted.length === 0) {
                container.innerHTML = '<p class="text-muted text-center p-3">No customer activity in this range.</p>';
                return;
            }

            let html = '<div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>Customer</th><th>Transactions</th><th class="text-end">Total Spent</th></tr></thead><tbody>';
            sorted.forEach(c => {
                html += `
                    <tr>
                        <td>
                            <div class="fw-bold">${c.name}</div>
                            <small class="text-muted">${c.phone}</small>
                        </td>
                        <td>${c.count}</td>
                        <td class="text-end fw-bold text-success">${UI.formatCurrency(c.totalSpent)}</td>
                    </tr>
                `;
            });
            html += '</tbody></table></div>';

            container.innerHTML = html;
        }

        // =================================================================
        // CSV EXPORTERS
        // =================================================================
        downloadCSV(filename, csvContent) {
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            UI.showToast(`Exported ${filename} successfully!`, 'success');
        }

        async exportAppointmentsCSV() {
            const appointments = await window.bsmsDB.getAppointments();
            if (appointments.length === 0) {
                UI.showToast('No appointments to export', 'warning');
                return;
            }

            let csv = 'ID,Date,Time,Customer,Phone,Service,Barber,Price,Status,Notes\n';
            appointments.forEach(a => {
                csv += `"${a.id}","${a.appointment_date}","${a.appointment_time}","${(a.customer_name || '').replace(/"/g, '""')}","${a.customer_phone || ''}","${(a.service_name || '').replace(/"/g, '""')}","${(a.barber_name || '').replace(/"/g, '""')}",${a.total_price},"${a.status}","${(a.notes || '').replace(/"/g, '""')}"\n`;
            });

            this.downloadCSV(`barber_appointments_${new Date().toISOString().split('T')[0]}.csv`, csv);
        }

        async exportPaymentsCSV() {
            const payments = await window.bsmsDB.getPayments();
            if (payments.length === 0) {
                UI.showToast('No payments to export', 'warning');
                return;
            }

            let csv = 'Invoice Number,Date,Customer,Service,Amount,Payment Method,Status,Notes\n';
            payments.forEach(p => {
                csv += `"${p.invoice_number}","${p.payment_date}","${(p.customer_name || '').replace(/"/g, '""')}","${(p.service_name || '').replace(/"/g, '""')}",${p.amount},"${p.payment_method}","${p.payment_status}","${(p.notes || '').replace(/"/g, '""')}"\n`;
            });

            this.downloadCSV(`barber_payments_${new Date().toISOString().split('T')[0]}.csv`, csv);
        }

        async exportCustomersCSV() {
            const customers = await window.bsmsDB.getCustomers();
            if (customers.length === 0) {
                UI.showToast('No customers to export', 'warning');
                return;
            }

            let csv = 'ID,Name,Phone,Email,Notes,Created At\n';
            customers.forEach(c => {
                csv += `"${c.id}","${(c.name || '').replace(/"/g, '""')}","${c.phone || ''}","${c.email || ''}","${(c.notes || '').replace(/"/g, '""')}","${c.created_at || ''}"\n`;
            });

            this.downloadCSV(`barber_customers_${new Date().toISOString().split('T')[0]}.csv`, csv);
        }
    }

    window.reportsController = new ReportsController();
})();

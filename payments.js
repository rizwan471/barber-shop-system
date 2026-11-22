/**
 * Barber Shop Management System - Payments Module
 */

(function () {
    class PaymentsController {
        constructor() {
            this.container = document.getElementById('view-payments');
            this.filterMethod = 'all';
            this.filterStatus = 'all';
            this.searchTerm = '';
            this.currentReceiptData = null;
            this.initListeners();
        }

        initListeners() {
            // Method filter
            const methodSelect = document.getElementById('payment-filter-method');
            if (methodSelect) {
                methodSelect.addEventListener('change', (e) => {
                    this.filterMethod = e.target.value;
                    this.render();
                });
            }

            // Status filter
            const statusSelect = document.getElementById('payment-filter-status');
            if (statusSelect) {
                statusSelect.addEventListener('change', (e) => {
                    this.filterStatus = e.target.value;
                    this.render();
                });
            }

            // Search input
            const searchInput = document.getElementById('payment-search-input');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.searchTerm = e.target.value;
                    this.render();
                });
            }

            // Payment Form submit
            const form = document.getElementById('payment-form');
            if (form) {
                form.addEventListener('submit', (e) => this.handleFormSubmit(e));
            }

            // Customer selection changed in payment modal
            const customerSelect = document.getElementById('payment-customer-select');
            if (customerSelect) {
                customerSelect.addEventListener('change', async (e) => {
                    await this.loadCustomerPendingAppointments(e.target.value);
                });
            }

            // Appointment selection changed in payment modal
            const apptSelect = document.getElementById('payment-appointment-select');
            if (apptSelect) {
                apptSelect.addEventListener('change', async (e) => {
                    const apptId = e.target.value;
                    if (apptId) {
                        const appt = await window.bsmsDB.getAppointmentById(apptId);
                        if (appt) {
                            document.getElementById('payment-amount').value = appt.total_price;
                        }
                    }
                });
            }

            // Print Receipt button listener
            const printBtn = document.getElementById('btn-print-receipt');
            if (printBtn) {
                printBtn.addEventListener('click', () => {
                    window.print();
                });
            }

            // Listen for data update events
            window.addEventListener('bsms:data-updated', (e) => {
                const entity = e.detail ? e.detail.entity : '';
                if (entity === 'payments' || entity === 'all' || !entity) {
                    if (window.app && window.app.currentView === 'payments') {
                        this.render();
                    }
                }
            });
        }

        async render() {
            const listContainer = document.getElementById('payments-list');
            if (!listContainer) return;

            try {
                const payments = await window.bsmsDB.getPayments({
                    method: this.filterMethod,
                    status: this.filterStatus,
                    query: this.searchTerm
                });

                // Calculate summary KPIs
                const totalCollected = payments
                    .filter(p => p.payment_status === 'Completed')
                    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

                const cashTotal = payments
                    .filter(p => p.payment_status === 'Completed' && p.payment_method === 'Cash')
                    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

                const cardTotal = payments
                    .filter(p => p.payment_status === 'Completed' && (p.payment_method === 'Card' || p.payment_method === 'Online' || p.payment_method === 'EasyPaisa' || p.payment_method === 'JazzCash'))
                    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

                const elTotal = document.getElementById('payments-kpi-total');
                const elCash = document.getElementById('payments-kpi-cash');
                const elCard = document.getElementById('payments-kpi-digital');
                const countBadge = document.getElementById('payments-count-badge');

                if (elTotal) elTotal.textContent = UI.formatCurrency(totalCollected);
                if (elCash) elCash.textContent = UI.formatCurrency(cashTotal);
                if (elCard) elCard.textContent = UI.formatCurrency(cardTotal);
                if (countBadge) countBadge.textContent = `${payments.length} Transactions`;

                if (payments.length === 0) {
                    listContainer.innerHTML = `
                        <div class="col-12 text-center p-5 empty-state">
                            <div class="empty-icon">💳</div>
                            <h3>No transactions found</h3>
                            <p class="text-muted">
                                ${this.searchTerm || this.filterMethod !== 'all' ? 'No transactions match the current filter.' : 'Record a payment for completed haircuts or walk-in grooming.'}
                            </p>
                            <button class="btn btn-primary mt-3" onclick="window.paymentsController.openPaymentModal()">
                                + Record Payment
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
                                    <th>Invoice #</th>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Service / Ref</th>
                                    <th>Method</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th class="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                `;

                payments.forEach(p => {
                    html += `
                        <tr>
                            <td>
                                <span class="badge badge-subtle fw-mono">${p.invoice_number}</span>
                            </td>
                            <td>${UI.formatDateTime(p.payment_date)}</td>
                            <td>
                                <div class="fw-semibold">${p.customer_name}</div>
                                <small class="text-muted">${p.customer_phone || ''}</small>
                            </td>
                            <td>${p.service_name || 'Grooming Service'}</td>
                            <td>
                                <span class="badge badge-method">${p.payment_method}</span>
                            </td>
                            <td class="fw-bold text-success">${UI.formatCurrency(p.amount)}</td>
                            <td>${UI.getStatusBadge(p.payment_status)}</td>
                            <td class="text-end">
                                <div class="btn-group btn-group-sm">
                                    <button class="btn btn-sm btn-outline-primary" title="View / Print Receipt" onclick="window.paymentsController.showReceipt('${p.id}')">
                                        🧾 Receipt
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" title="Delete" onclick="window.paymentsController.confirmDelete('${p.id}')">
                                        🗑️
                                    </button>
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

                listContainer.innerHTML = html;
            } catch (err) {
                console.error('Error rendering payments:', err);
                UI.showToast('Failed to load payments', 'error');
            }
        }

        async loadCustomerPendingAppointments(customerId, selectedApptId = '') {
            const apptSelect = document.getElementById('payment-appointment-select');
            if (!apptSelect) return;

            if (!customerId) {
                apptSelect.innerHTML = '<option value="">-- No Linked Appointment (Walk-in) --</option>';
                return;
            }

            const appointments = await window.bsmsDB.getAppointments({ customerId });
            const relevantAppts = appointments.filter(a => a.status !== 'cancelled');

            let html = '<option value="">-- No Linked Appointment (Walk-in) --</option>';
            relevantAppts.forEach(a => {
                html += `<option value="${a.id}" ${a.id === selectedApptId ? 'selected' : ''}>
                    ${a.service_name} (${UI.formatDate(a.appointment_date)} ${UI.formatTime(a.appointment_time)}) - ${UI.formatCurrency(a.total_price)}
                </option>`;
            });

            apptSelect.innerHTML = html;
        }

        async openPaymentModal() {
            const form = document.getElementById('payment-form');
            if (form) form.reset();

            const customers = await window.bsmsDB.getCustomers();
            const customerSelect = document.getElementById('payment-customer-select');
            if (customerSelect) {
                customerSelect.innerHTML = '<option value="">-- Select Customer --</option>' +
                    customers.map(c => `<option value="${c.id}">${c.name} (${c.phone || 'No phone'})</option>`).join('');
            }

            document.getElementById('payment-modal-id').value = '';
            document.getElementById('payment-invoice-num').value = window.bsmsDB.generateInvoiceNumber();
            document.getElementById('payment-amount').value = '';
            document.getElementById('payment-method').value = 'Cash';
            document.getElementById('payment-status').value = 'Completed';
            document.getElementById('payment-notes').value = '';

            await this.loadCustomerPendingAppointments('');

            UI.openModal('payment-modal');
        }

        async openPaymentModalWithAppointment(appointmentId) {
            await this.openPaymentModal();

            const appt = await window.bsmsDB.getAppointmentById(appointmentId);
            if (!appt) return;

            const customerSelect = document.getElementById('payment-customer-select');
            if (customerSelect) customerSelect.value = appt.customer_id;

            await this.loadCustomerPendingAppointments(appt.customer_id, appointmentId);

            document.getElementById('payment-appointment-select').value = appointmentId;
            document.getElementById('payment-amount').value = appt.total_price;
            document.getElementById('payment-notes').value = `Payment for ${appt.service_name} by ${appt.barber_name}`;
        }

        async handleFormSubmit(e) {
            e.preventDefault();
            const customer_id = document.getElementById('payment-customer-select').value;
            const appointment_id = document.getElementById('payment-appointment-select').value || null;
            const amount = parseFloat(document.getElementById('payment-amount').value) || 0;
            const payment_method = document.getElementById('payment-method').value;
            const payment_status = document.getElementById('payment-status').value;
            const invoice_number = document.getElementById('payment-invoice-num').value;
            const notes = document.getElementById('payment-notes').value.trim();

            if (!customer_id) {
                UI.showToast('Please select a customer', 'warning');
                return;
            }
            if (amount <= 0) {
                UI.showToast('Please enter a valid amount', 'warning');
                return;
            }

            const payload = {
                customer_id,
                appointment_id,
                amount,
                payment_method,
                payment_status,
                invoice_number,
                notes
            };

            try {
                const saved = await window.bsmsDB.addPayment(payload);
                UI.showToast('Payment recorded successfully!', 'success');
                UI.closeModal('payment-modal');
                this.render();

                // Open receipt immediately for convenience
                if (saved && saved.id) {
                    this.showReceipt(saved.id);
                }
            } catch (err) {
                console.error('Save payment error:', err);
                UI.showToast(`Error: ${err.message || 'Could not record payment'}`, 'error');
            }
        }

        async showReceipt(paymentId) {
            try {
                const payment = await window.bsmsDB.getPaymentById(paymentId);
                if (!payment) {
                    UI.showToast('Transaction details not found', 'error');
                    return;
                }

                this.currentReceiptData = payment;

                // Populate Receipt Template
                document.getElementById('receipt-shop-name').textContent = window.APP_CONFIG.shopName;
                document.getElementById('receipt-shop-tagline').textContent = window.APP_CONFIG.tagline;
                document.getElementById('receipt-shop-phone').textContent = window.APP_CONFIG.phone;
                document.getElementById('receipt-shop-address').textContent = window.APP_CONFIG.address;

                document.getElementById('receipt-invoice-no').textContent = payment.invoice_number;
                document.getElementById('receipt-date').textContent = UI.formatDateTime(payment.payment_date);
                document.getElementById('receipt-customer-name').textContent = payment.customer_name;
                document.getElementById('receipt-customer-phone').textContent = payment.customer_phone || '-';
                document.getElementById('receipt-payment-method').textContent = payment.payment_method;
                document.getElementById('receipt-status').textContent = payment.payment_status;

                // Item description & price
                document.getElementById('receipt-item-name').textContent = payment.service_name || 'Grooming Service';
                document.getElementById('receipt-item-amount').textContent = UI.formatCurrency(payment.amount);
                document.getElementById('receipt-subtotal').textContent = UI.formatCurrency(payment.amount);
                document.getElementById('receipt-total').textContent = UI.formatCurrency(payment.amount);

                UI.openModal('receipt-modal');
            } catch (err) {
                console.error(err);
                UI.showToast('Could not load receipt', 'error');
            }
        }

        async openReceiptFromAppointment(appointmentId) {
            const payments = await window.bsmsDB.getPayments();
            const matched = payments.find(p => p.appointment_id === appointmentId);
            if (matched) {
                this.showReceipt(matched.id);
            } else {
                UI.showToast('No payment record found for this appointment yet. You can record one now.', 'info');
                this.openPaymentModalWithAppointment(appointmentId);
            }
        }

        async confirmDelete(id) {
            const confirmed = await UI.confirm(
                'Delete Payment Record',
                'Are you sure you want to delete this payment record? This cannot be undone.'
            );

            if (confirmed) {
                try {
                    await window.bsmsDB.deletePayment(id);
                    UI.showToast('Payment record deleted', 'success');
                    this.render();
                } catch (err) {
                    console.error(err);
                    UI.showToast('Failed to delete payment', 'error');
                }
            }
        }
    }

    window.paymentsController = new PaymentsController();
})();

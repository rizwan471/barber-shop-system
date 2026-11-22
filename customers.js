/**
 * Barber Shop Management System - Customers Module
 */

(function () {
    class CustomersController {
        constructor() {
            this.container = document.getElementById('view-customers');
            this.searchTerm = '';
            this.initListeners();
        }

        initListeners() {
            // Search input listener
            const searchInput = document.getElementById('customer-search-input');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.searchTerm = e.target.value;
                    this.render();
                });
            }

            // Customer form submit listener (Add / Edit)
            const form = document.getElementById('customer-form');
            if (form) {
                form.addEventListener('submit', (e) => this.handleFormSubmit(e));
            }

            // Listen for data update events
            window.addEventListener('bsms:data-updated', (e) => {
                const entity = e.detail ? e.detail.entity : '';
                if (entity === 'customers' || entity === 'all' || !entity) {
                    if (window.app && window.app.currentView === 'customers') {
                        this.render();
                    }
                }
            });
        }

        async render() {
            const listContainer = document.getElementById('customers-list');
            if (!listContainer) return;

            try {
                const [customers, appointments, payments] = await Promise.all([
                    window.bsmsDB.getCustomers(this.searchTerm),
                    window.bsmsDB.getAppointments(),
                    window.bsmsDB.getPayments()
                ]);

                // Update total count
                const countBadge = document.getElementById('customers-count-badge');
                if (countBadge) countBadge.textContent = `${customers.length} Customers`;

                if (customers.length === 0) {
                    listContainer.innerHTML = `
                        <div class="col-12 text-center p-5 empty-state">
                            <div class="empty-icon">👥</div>
                            <h3>No customers found</h3>
                            <p class="text-muted">
                                ${this.searchTerm ? `No results for "${this.searchTerm}". Try another search.` : 'Start by adding your first customer to the system.'}
                            </p>
                            <button class="btn btn-primary mt-3" onclick="window.customersController.openAddModal()">
                                + Add New Customer
                            </button>
                        </div>
                    `;
                    return;
                }

                // Render customer cards
                let html = '<div class="row g-3">';

                customers.forEach(cust => {
                    const custAppts = appointments.filter(a => a.customer_id === cust.id);
                    const custPayments = payments.filter(p => p.customer_id === cust.id && p.payment_status === 'Completed');
                    const totalSpent = custPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
                    const lastVisit = custAppts.length > 0 ? UI.formatDate(custAppts[0].appointment_date) : 'New Client';

                    html += `
                        <div class="col-12 col-md-6 col-lg-4">
                            <div class="card customer-card h-100">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <div class="d-flex align-items-center gap-2">
                                            <div class="avatar-circle">
                                                ${(cust.name || 'C').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h5 class="card-title m-0">${cust.name}</h5>
                                                <small class="text-muted">${cust.phone || 'No phone'}</small>
                                            </div>
                                        </div>
                                        <div class="dropdown">
                                            <button class="btn btn-sm btn-icon" onclick="window.customersController.openCustomerMenu('${cust.id}')">
                                                ⋮
                                            </button>
                                        </div>
                                    </div>

                                    ${cust.email ? `<div class="customer-info-line"><span class="icon">✉</span> ${cust.email}</div>` : ''}
                                    ${cust.notes ? `<div class="customer-notes mt-2 text-muted-small"><em>"${cust.notes}"</em></div>` : ''}

                                    <div class="customer-stats-grid mt-3 pt-3 border-top">
                                        <div class="stat-item">
                                            <span class="stat-label">Visits</span>
                                            <span class="stat-value">${custAppts.length}</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-label">Total Spent</span>
                                            <span class="stat-value text-accent">${UI.formatCurrency(totalSpent)}</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-label">Last Visit</span>
                                            <span class="stat-value text-muted">${lastVisit}</span>
                                        </div>
                                    </div>

                                    <div class="card-actions mt-3 d-flex gap-2 justify-content-end">
                                        <button class="btn btn-sm btn-outline-primary" onclick="window.customersController.openHistoryModal('${cust.id}')" title="View History">
                                            📜 History
                                        </button>
                                        <button class="btn btn-sm btn-outline-warning" onclick="window.customersController.openEditModal('${cust.id}')" title="Edit Customer">
                                            ✏️ Edit
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" onclick="window.customersController.confirmDelete('${cust.id}', '${cust.name.replace(/'/g, "\\'")}')" title="Delete Customer">
                                            🗑️
                                        </button>
                                        <button class="btn btn-sm btn-primary" onclick="window.appointmentsController.openBookModalWithCustomer('${cust.id}')" title="Book Appointment">
                                            + Book
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });

                html += '</div>';
                listContainer.innerHTML = html;
            } catch (err) {
                console.error('Error rendering customers:', err);
                UI.showToast('Failed to load customers', 'error');
            }
        }

        openAddModal() {
            const form = document.getElementById('customer-form');
            if (form) form.reset();
            document.getElementById('customer-modal-id').value = '';
            document.getElementById('customer-modal-title').textContent = 'Add New Customer';
            UI.openModal('customer-modal');
        }

        async openEditModal(id) {
            try {
                const cust = await window.bsmsDB.getCustomerById(id);
                if (!cust) {
                    UI.showToast('Customer not found', 'error');
                    return;
                }

                document.getElementById('customer-modal-id').value = cust.id;
                document.getElementById('customer-name').value = cust.name || '';
                document.getElementById('customer-phone').value = cust.phone || '';
                document.getElementById('customer-email').value = cust.email || '';
                document.getElementById('customer-notes').value = cust.notes || '';

                document.getElementById('customer-modal-title').textContent = 'Edit Customer Details';
                UI.openModal('customer-modal');
            } catch (err) {
                console.error(err);
                UI.showToast('Error loading customer', 'error');
            }
        }

        async handleFormSubmit(e) {
            e.preventDefault();
            const id = document.getElementById('customer-modal-id').value;
            const name = document.getElementById('customer-name').value.trim();
            const phone = document.getElementById('customer-phone').value.trim();
            const email = document.getElementById('customer-email').value.trim();
            const notes = document.getElementById('customer-notes').value.trim();

            if (!name) {
                UI.showToast('Please enter customer name', 'warning');
                return;
            }

            const payload = { name, phone, email, notes };

            try {
                if (id) {
                    await window.bsmsDB.updateCustomer(id, payload);
                    UI.showToast('Customer updated successfully!', 'success');
                } else {
                    await window.bsmsDB.addCustomer(payload);
                    UI.showToast('Customer added successfully!', 'success');
                }
                UI.closeModal('customer-modal');
                this.render();
            } catch (err) {
                console.error('Save customer error:', err);
                UI.showToast(`Error: ${err.message || 'Could not save customer'}`, 'error');
            }
        }

        async confirmDelete(id, name) {
            const confirmed = await UI.confirm(
                'Delete Customer',
                `Are you sure you want to delete "${name}"? This action cannot be undone.`
            );

            if (confirmed) {
                try {
                    await window.bsmsDB.deleteCustomer(id);
                    UI.showToast('Customer deleted successfully', 'success');
                    this.render();
                } catch (err) {
                    console.error('Delete customer error:', err);
                    UI.showToast(`Failed to delete: ${err.message}`, 'error');
                }
            }
        }

        async openHistoryModal(id) {
            try {
                const [cust, appointments, payments] = await Promise.all([
                    window.bsmsDB.getCustomerById(id),
                    window.bsmsDB.getAppointments({ customerId: id }),
                    window.bsmsDB.getPayments()
                ]);

                if (!cust) return;

                const custPayments = payments.filter(p => p.customer_id === id);
                const totalSpent = custPayments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);

                document.getElementById('cust-history-name').textContent = cust.name;
                document.getElementById('cust-history-phone').textContent = cust.phone || 'No phone';
                document.getElementById('cust-history-total-spent').textContent = UI.formatCurrency(totalSpent);
                document.getElementById('cust-history-visits').textContent = appointments.length;

                const listEl = document.getElementById('cust-history-appointments-list');
                if (appointments.length === 0) {
                    listEl.innerHTML = '<p class="text-muted text-center p-3">No appointments recorded yet.</p>';
                } else {
                    let html = '<div class="list-group">';
                    appointments.forEach(a => {
                        html += `
                            <div class="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="fw-semibold">${a.service_name}</div>
                                    <small class="text-muted">📅 ${UI.formatDate(a.appointment_date)} at ${UI.formatTime(a.appointment_time)} &bull; ${a.barber_name}</small>
                                </div>
                                <div class="text-end">
                                    <div class="fw-bold">${UI.formatCurrency(a.total_price)}</div>
                                    ${UI.getStatusBadge(a.status)}
                                </div>
                            </div>
                        `;
                    });
                    html += '</div>';
                    listEl.innerHTML = html;
                }

                UI.openModal('customer-history-modal');
            } catch (err) {
                console.error(err);
                UI.showToast('Could not load customer history', 'error');
            }
        }
    }

    window.customersController = new CustomersController();
})();

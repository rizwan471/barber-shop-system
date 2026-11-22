/**
 * Barber Shop Management System - Appointments Module
 */

(function () {
    class AppointmentsController {
        constructor() {
            this.container = document.getElementById('view-appointments');
            this.filterDate = '';
            this.filterStatus = 'all';
            this.searchTerm = '';
            this.initListeners();
        }

        initListeners() {
            // Filter by date
            const dateInput = document.getElementById('appt-filter-date');
            if (dateInput) {
                dateInput.addEventListener('change', (e) => {
                    this.filterDate = e.target.value;
                    this.render();
                });
            }

            // Quick date shortcut buttons
            const quickDateBtns = document.getElementById('appt-quick-date-btns');
            if (quickDateBtns) {
                quickDateBtns.addEventListener('click', (e) => {
                    const btn = e.target.closest('button');
                    if (btn) {
                        quickDateBtns.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        const range = btn.getAttribute('data-range');

                        const d = new Date();
                        if (range === 'today') {
                            this.filterDate = d.toISOString().split('T')[0];
                        } else if (range === 'tomorrow') {
                            d.setDate(d.getDate() + 1);
                            this.filterDate = d.toISOString().split('T')[0];
                        } else {
                            this.filterDate = '';
                        }

                        if (dateInput) dateInput.value = this.filterDate;
                        this.render();
                    }
                });
            }

            // Filter by status
            const statusSelect = document.getElementById('appt-filter-status');
            if (statusSelect) {
                statusSelect.addEventListener('change', (e) => {
                    this.filterStatus = e.target.value;
                    this.render();
                });
            }

            // Search input
            const searchInput = document.getElementById('appt-search-input');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.searchTerm = e.target.value;
                    this.render();
                });
            }

            // Appointment form submit
            const form = document.getElementById('appointment-form');
            if (form) {
                form.addEventListener('submit', (e) => this.handleFormSubmit(e));
            }

            // Service select auto price update in modal
            const serviceSelect = document.getElementById('appt-service-select');
            if (serviceSelect) {
                serviceSelect.addEventListener('change', async (e) => {
                    const serviceId = e.target.value;
                    if (serviceId) {
                        const srv = await window.bsmsDB.getServiceById(serviceId);
                        if (srv) {
                            const priceInput = document.getElementById('appt-price');
                            if (priceInput) priceInput.value = srv.price;
                        }
                    }
                });
            }

            // Listen for data update events
            window.addEventListener('bsms:data-updated', (e) => {
                const entity = e.detail ? e.detail.entity : '';
                if (entity === 'appointments' || entity === 'all' || !entity) {
                    if (window.app && window.app.currentView === 'appointments') {
                        this.render();
                    }
                }
            });
        }

        async render() {
            const listContainer = document.getElementById('appointments-list');
            if (!listContainer) return;

            try {
                const appointments = await window.bsmsDB.getAppointments({
                    date: this.filterDate,
                    status: this.filterStatus,
                    query: this.searchTerm
                });

                // Update count badge
                const countBadge = document.getElementById('appointments-count-badge');
                if (countBadge) countBadge.textContent = `${appointments.length} Appointments`;

                if (appointments.length === 0) {
                    listContainer.innerHTML = `
                        <div class="col-12 text-center p-5 empty-state">
                            <div class="empty-icon">📅</div>
                            <h3>No appointments found</h3>
                            <p class="text-muted">
                                ${this.filterDate || this.searchTerm ? 'No bookings match your selected filter criteria.' : 'No upcoming bookings scheduled yet.'}
                            </p>
                            <button class="btn btn-primary mt-3" onclick="window.appointmentsController.openBookModal()">
                                + Book Appointment
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
                                    <th>Date & Time</th>
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
                            <td>
                                <div class="fw-bold text-accent">${UI.formatDate(app.appointment_date)}</div>
                                <div class="text-muted-small">${UI.formatTime(app.appointment_time)}</div>
                            </td>
                            <td>
                                <div class="fw-semibold">${app.customer_name}</div>
                                <small class="text-muted">${app.customer_phone || ''}</small>
                            </td>
                            <td>
                                <div>${app.service_name}</div>
                                <small class="text-muted">${app.service_duration} mins</small>
                            </td>
                            <td>
                                <span class="badge badge-subtle">${app.barber_name}</span>
                            </td>
                            <td class="fw-bold">${UI.formatCurrency(app.total_price)}</td>
                            <td>
                                <div class="dropdown d-inline-block">
                                    <button class="btn btn-sm btn-link p-0 text-decoration-none" onclick="window.appointmentsController.toggleStatusSelect('${app.id}', this)">
                                        ${UI.getStatusBadge(app.status)}
                                    </button>
                                </div>
                            </td>
                            <td class="text-end">
                                <div class="btn-group btn-group-sm">
                                    ${app.status !== 'completed' ? `
                                        <button class="btn btn-sm btn-success" title="Mark Completed" onclick="window.appointmentsController.quickStatusChange('${app.id}', 'completed')">
                                            ✓ Done
                                        </button>
                                        <button class="btn btn-sm btn-warning" title="Pay / Invoice" onclick="window.paymentsController.openPaymentModalWithAppointment('${app.id}')">
                                            💳 Pay
                                        </button>
                                    ` : `
                                        <button class="btn btn-sm btn-outline-primary" title="View Receipt" onclick="window.paymentsController.openReceiptFromAppointment('${app.id}')">
                                            🧾 Receipt
                                        </button>
                                    `}
                                    <button class="btn btn-sm btn-outline-warning" title="Edit" onclick="window.appointmentsController.openEditModal('${app.id}')">
                                        ✏️
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" title="Delete" onclick="window.appointmentsController.confirmDelete('${app.id}')">
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
                console.error('Error rendering appointments:', err);
                UI.showToast('Failed to load appointments', 'error');
            }
        }

        async populateModalDropdowns(selectedCustomerId = '', selectedServiceId = '', selectedBarberId = '') {
            const [customers, services, barbers] = await Promise.all([
                window.bsmsDB.getCustomers(),
                window.bsmsDB.getServices(),
                window.bsmsDB.getBarbers()
            ]);

            // Customers select
            const custSelect = document.getElementById('appt-customer-select');
            if (custSelect) {
                custSelect.innerHTML = '<option value="">-- Select Customer --</option>' +
                    customers.map(c => `<option value="${c.id}" ${c.id === selectedCustomerId ? 'selected' : ''}>${c.name} (${c.phone || 'No phone'})</option>`).join('');
            }

            // Services select
            const srvSelect = document.getElementById('appt-service-select');
            if (srvSelect) {
                srvSelect.innerHTML = '<option value="">-- Select Service --</option>' +
                    services.filter(s => s.is_active).map(s => `<option value="${s.id}" data-price="${s.price}" ${s.id === selectedServiceId ? 'selected' : ''}>${s.name} - ${UI.formatCurrency(s.price)} (${s.duration_minutes}m)</option>`).join('');
            }

            // Barbers select
            const barberSelect = document.getElementById('appt-barber-select');
            if (barberSelect) {
                barberSelect.innerHTML = '<option value="">-- Any Available Stylist --</option>' +
                    barbers.map(b => `<option value="${b.id}" ${b.id === selectedBarberId ? 'selected' : ''}>${b.name} (${b.role})</option>`).join('');
            }
        }

        async openBookModal() {
            const form = document.getElementById('appointment-form');
            if (form) form.reset();

            await this.populateModalDropdowns();

            document.getElementById('appointment-modal-id').value = '';
            document.getElementById('appt-date').value = new Date().toISOString().split('T')[0];
            document.getElementById('appt-time').value = '11:00';
            document.getElementById('appt-status').value = 'confirmed';
            document.getElementById('appt-price').value = '800';
            document.getElementById('appointment-modal-title').textContent = 'Book New Appointment';

            UI.openModal('appointment-modal');
        }

        async openBookModalWithCustomer(customerId) {
            await this.openBookModal();
            const custSelect = document.getElementById('appt-customer-select');
            if (custSelect) custSelect.value = customerId;
        }

        async openBookModalWithService(serviceId) {
            await this.openBookModal();
            const srvSelect = document.getElementById('appt-service-select');
            if (srvSelect) {
                srvSelect.value = serviceId;
                const srv = await window.bsmsDB.getServiceById(serviceId);
                if (srv) {
                    document.getElementById('appt-price').value = srv.price;
                }
            }
        }

        async openEditModal(id) {
            try {
                const app = await window.bsmsDB.getAppointmentById(id);
                if (!app) {
                    UI.showToast('Appointment not found', 'error');
                    return;
                }

                await this.populateModalDropdowns(app.customer_id, app.service_id, app.barber_id);

                document.getElementById('appointment-modal-id').value = app.id;
                document.getElementById('appt-customer-select').value = app.customer_id || '';
                document.getElementById('appt-service-select').value = app.service_id || '';
                document.getElementById('appt-barber-select').value = app.barber_id || '';
                document.getElementById('appt-date').value = app.appointment_date || '';
                document.getElementById('appt-time').value = app.appointment_time || '10:00';
                document.getElementById('appt-status').value = app.status || 'confirmed';
                document.getElementById('appt-price').value = app.total_price || 0;
                document.getElementById('appt-notes').value = app.notes || '';

                document.getElementById('appointment-modal-title').textContent = 'Edit Appointment';
                UI.openModal('appointment-modal');
            } catch (err) {
                console.error(err);
                UI.showToast('Error loading appointment', 'error');
            }
        }

        async handleFormSubmit(e) {
            e.preventDefault();
            const id = document.getElementById('appointment-modal-id').value;
            const customer_id = document.getElementById('appt-customer-select').value;
            const service_id = document.getElementById('appt-service-select').value;
            const barber_id = document.getElementById('appt-barber-select').value;
            const appointment_date = document.getElementById('appt-date').value;
            const appointment_time = document.getElementById('appt-time').value;
            const status = document.getElementById('appt-status').value;
            const total_price = parseFloat(document.getElementById('appt-price').value) || 0;
            const notes = document.getElementById('appt-notes').value.trim();

            if (!customer_id) {
                UI.showToast('Please select a customer', 'warning');
                return;
            }
            if (!service_id) {
                UI.showToast('Please select a service', 'warning');
                return;
            }
            if (!appointment_date || !appointment_time) {
                UI.showToast('Please specify appointment date and time', 'warning');
                return;
            }

            const payload = {
                customer_id,
                service_id,
                barber_id: barber_id || null,
                appointment_date,
                appointment_time,
                status,
                total_price,
                notes
            };

            try {
                if (id) {
                    await window.bsmsDB.updateAppointment(id, payload);
                    UI.showToast('Appointment updated successfully!', 'success');
                } else {
                    await window.bsmsDB.addAppointment(payload);
                    UI.showToast('Appointment booked successfully!', 'success');
                }
                UI.closeModal('appointment-modal');
                this.render();
            } catch (err) {
                console.error('Save appointment error:', err);
                UI.showToast(`Error: ${err.message || 'Could not save appointment'}`, 'error');
            }
        }

        async quickStatusChange(id, newStatus) {
            try {
                await window.bsmsDB.updateAppointmentStatus(id, newStatus);
                UI.showToast(`Status updated to ${newStatus}`, 'success');
                this.render();
            } catch (err) {
                console.error(err);
                UI.showToast('Failed to update status', 'error');
            }
        }

        async toggleStatusSelect(id, btnElement) {
            const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
            const choice = prompt(`Select status for this appointment:\n1. pending\n2. confirmed\n3. completed\n4. cancelled\n\nType the status:`);
            if (choice) {
                const s = choice.toLowerCase().trim();
                if (statuses.includes(s)) {
                    await this.quickStatusChange(id, s);
                } else {
                    UI.showToast('Invalid status choice', 'warning');
                }
            }
        }

        async confirmDelete(id) {
            const confirmed = await UI.confirm(
                'Delete Appointment',
                'Are you sure you want to cancel and delete this appointment?'
            );

            if (confirmed) {
                try {
                    await window.bsmsDB.deleteAppointment(id);
                    UI.showToast('Appointment deleted', 'success');
                    this.render();
                } catch (err) {
                    console.error(err);
                    UI.showToast('Failed to delete appointment', 'error');
                }
            }
        }
    }

    window.appointmentsController = new AppointmentsController();
})();

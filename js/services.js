/**
 * Barber Shop Management System - Services Module
 */

(function () {
    class ServicesController {
        constructor() {
            this.container = document.getElementById('view-services');
            this.currentCategory = 'All';
            this.searchTerm = '';
            this.initListeners();
        }

        initListeners() {
            // Search input
            const searchInput = document.getElementById('services-search-input');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.searchTerm = e.target.value;
                    this.render();
                });
            }

            // Category filter pills
            const categoryFilters = document.getElementById('services-category-filters');
            if (categoryFilters) {
                categoryFilters.addEventListener('click', (e) => {
                    const btn = e.target.closest('.category-pill');
                    if (btn) {
                        categoryFilters.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
                        btn.classList.add('active');
                        this.currentCategory = btn.getAttribute('data-category') || 'All';
                        this.render();
                    }
                });
            }

            // Service form submit
            const form = document.getElementById('service-form');
            if (form) {
                form.addEventListener('submit', (e) => this.handleFormSubmit(e));
            }

            // Listen for data update events
            window.addEventListener('bsms:data-updated', (e) => {
                const entity = e.detail ? e.detail.entity : '';
                if (entity === 'services' || entity === 'all' || !entity) {
                    if (window.app && window.app.currentView === 'services') {
                        this.render();
                    }
                }
            });
        }

        async render() {
            const listContainer = document.getElementById('services-list');
            if (!listContainer) return;

            try {
                const services = await window.bsmsDB.getServices(this.currentCategory, this.searchTerm);

                // Update count badge
                const countBadge = document.getElementById('services-count-badge');
                if (countBadge) countBadge.textContent = `${services.length} Services`;

                if (services.length === 0) {
                    listContainer.innerHTML = `
                        <div class="col-12 text-center p-5 empty-state">
                            <div class="empty-icon">✂️</div>
                            <h3>No services found</h3>
                            <p class="text-muted">
                                ${this.searchTerm ? `No results for "${this.searchTerm}".` : 'Add your salon services, haircuts, beard trims, and packages.'}
                            </p>
                            <button class="btn btn-primary mt-3" onclick="window.servicesController.openAddModal()">
                                + Add New Service
                            </button>
                        </div>
                    `;
                    return;
                }

                let html = '<div class="row g-3">';

                services.forEach(srv => {
                    html += `
                        <div class="col-12 col-md-6 col-lg-4">
                            <div class="card service-card h-100 ${!srv.is_active ? 'opacity-75' : ''}">
                                <div class="card-body d-flex flex-column">
                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <span class="badge badge-subtle">${srv.category}</span>
                                        <span class="service-price">${UI.formatCurrency(srv.price)}</span>
                                    </div>

                                    <h4 class="card-title fw-bold my-1">${srv.name}</h4>

                                    <div class="service-duration text-muted-small mb-2">
                                        ⏱️ ${srv.duration_minutes} Minutes
                                        ${!srv.is_active ? '<span class="badge badge-cancelled ms-2">Inactive</span>' : ''}
                                    </div>

                                    <p class="card-text text-muted flex-grow-1">${srv.description || 'Professional barbershop grooming service.'}</p>

                                    <div class="service-card-actions mt-3 pt-3 border-top d-flex gap-2 justify-content-between align-items-center">
                                        <div class="btn-group btn-group-sm">
                                            <button class="btn btn-sm btn-outline-warning" onclick="window.servicesController.openEditModal('${srv.id}')" title="Edit Service">
                                                ✏️ Edit
                                            </button>
                                            <button class="btn btn-sm btn-outline-danger" onclick="window.servicesController.confirmDelete('${srv.id}', '${srv.name.replace(/'/g, "\\'")}')" title="Delete Service">
                                                🗑️
                                            </button>
                                        </div>
                                        <button class="btn btn-sm btn-primary" onclick="window.appointmentsController.openBookModalWithService('${srv.id}')">
                                            Book This
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
                console.error('Error rendering services:', err);
                UI.showToast('Failed to load services', 'error');
            }
        }

        openAddModal() {
            const form = document.getElementById('service-form');
            if (form) form.reset();
            document.getElementById('service-modal-id').value = '';
            document.getElementById('service-is-active').checked = true;
            document.getElementById('service-modal-title').textContent = 'Add New Service';
            UI.openModal('service-modal');
        }

        async openEditModal(id) {
            try {
                const srv = await window.bsmsDB.getServiceById(id);
                if (!srv) {
                    UI.showToast('Service not found', 'error');
                    return;
                }

                document.getElementById('service-modal-id').value = srv.id;
                document.getElementById('service-name').value = srv.name || '';
                document.getElementById('service-category').value = srv.category || 'Haircuts';
                document.getElementById('service-duration').value = srv.duration_minutes || 30;
                document.getElementById('service-price').value = srv.price || 0;
                document.getElementById('service-description').value = srv.description || '';
                document.getElementById('service-is-active').checked = srv.is_active !== false;

                document.getElementById('service-modal-title').textContent = 'Edit Service Details';
                UI.openModal('service-modal');
            } catch (err) {
                console.error(err);
                UI.showToast('Error loading service', 'error');
            }
        }

        async handleFormSubmit(e) {
            e.preventDefault();
            const id = document.getElementById('service-modal-id').value;
            const name = document.getElementById('service-name').value.trim();
            const category = document.getElementById('service-category').value;
            const duration_minutes = parseInt(document.getElementById('service-duration').value, 10) || 30;
            const price = parseFloat(document.getElementById('service-price').value) || 0;
            const description = document.getElementById('service-description').value.trim();
            const is_active = document.getElementById('service-is-active').checked;

            if (!name) {
                UI.showToast('Please enter service name', 'warning');
                return;
            }

            const payload = { name, category, duration_minutes, price, description, is_active };

            try {
                if (id) {
                    await window.bsmsDB.updateService(id, payload);
                    UI.showToast('Service updated successfully!', 'success');
                } else {
                    await window.bsmsDB.addService(payload);
                    UI.showToast('Service created successfully!', 'success');
                }
                UI.closeModal('service-modal');
                this.render();
            } catch (err) {
                console.error('Save service error:', err);
                UI.showToast(`Error: ${err.message || 'Could not save service'}`, 'error');
            }
        }

        async confirmDelete(id, name) {
            const confirmed = await UI.confirm(
                'Delete Service',
                `Are you sure you want to delete "${name}"? Existing appointments referencing this service may be impacted.`
            );

            if (confirmed) {
                try {
                    await window.bsmsDB.deleteService(id);
                    UI.showToast('Service deleted successfully', 'success');
                    this.render();
                } catch (err) {
                    console.error('Delete service error:', err);
                    UI.showToast(`Failed to delete: ${err.message}`, 'error');
                }
            }
        }
    }

    window.servicesController = new ServicesController();
})();

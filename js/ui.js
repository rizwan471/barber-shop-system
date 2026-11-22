/**
 * Barber Shop Management System - UI Utilities & Helper Library
 */

(function () {
    class UIManager {
        constructor() {
            this.activeModal = null;
            this.initListeners();
        }

        initListeners() {
            // Close modal on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.activeModal) {
                    this.closeModal(this.activeModal);
                }
            });

            // Close modal on backdrop click
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-backdrop')) {
                    const modal = e.target.closest('.modal-container');
                    if (modal) {
                        this.closeModal(modal.id);
                    }
                }
            });
        }

        // =================================================================
        // FORMATTERS
        // =================================================================
        formatCurrency(amount) {
            const num = parseFloat(amount) || 0;
            const symbol = (window.APP_CONFIG && window.APP_CONFIG.currencySymbol) || 'Rs. ';
            return symbol + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        }

        formatDate(dateStr) {
            if (!dateStr) return 'N/A';
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;

            const today = new Date();
            const isToday = d.toDateString() === today.toDateString();

            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const isTomorrow = d.toDateString() === tomorrow.toDateString();

            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const isYesterday = d.toDateString() === yesterday.toDateString();

            if (isToday) return 'Today';
            if (isTomorrow) return 'Tomorrow';
            if (isYesterday) return 'Yesterday';

            return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        }

        formatTime(timeStr) {
            if (!timeStr) return '';
            // Time in HH:mm or HH:mm:ss format
            const parts = timeStr.split(':');
            let hours = parseInt(parts[0], 10);
            const minutes = parts[1] || '00';
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // 0 becomes 12
            return `${hours}:${minutes} ${ampm}`;
        }

        formatDateTime(dateTimeStr) {
            if (!dateTimeStr) return 'N/A';
            const d = new Date(dateTimeStr);
            if (isNaN(d.getTime())) return dateTimeStr;
            return d.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        getStatusBadge(status) {
            const s = (status || 'pending').toLowerCase();
            let label = s.charAt(0).toUpperCase() + s.slice(1);
            let cssClass = 'badge-pending';

            switch (s) {
                case 'confirmed':
                    cssClass = 'badge-confirmed';
                    break;
                case 'completed':
                    cssClass = 'badge-completed';
                    break;
                case 'cancelled':
                    cssClass = 'badge-cancelled';
                    break;
                case 'paid':
                    cssClass = 'badge-completed';
                    label = 'Paid';
                    break;
                case 'refunded':
                    cssClass = 'badge-cancelled';
                    label = 'Refunded';
                    break;
                default:
                    cssClass = 'badge-pending';
            }

            return `<span class="badge ${cssClass}">${label}</span>`;
        }

        // =================================================================
        // TOAST NOTIFICATIONS
        // =================================================================
        showToast(message, type = 'success', duration = 3500) {
            let container = document.getElementById('toast-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'toast-container';
                container.className = 'toast-container';
                document.body.appendChild(container);
            }

            const toast = document.createElement('div');
            toast.className = `toast toast-${type} animate-slide-in`;

            let iconSvg = '';
            if (type === 'success') {
                iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
            } else if (type === 'error') {
                iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
            } else if (type === 'warning') {
                iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
            } else {
                iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
            }

            toast.innerHTML = `
                <div class="toast-icon">${iconSvg}</div>
                <div class="toast-body">${message}</div>
                <button class="toast-close" aria-label="Close">&times;</button>
            `;

            container.appendChild(toast);

            const removeToast = () => {
                toast.classList.add('toast-fade-out');
                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.parentElement.removeChild(toast);
                    }
                }, 300);
            };

            toast.querySelector('.toast-close').addEventListener('click', removeToast);

            setTimeout(removeToast, duration);
        }

        // =================================================================
        // MODALS
        // =================================================================
        openModal(modalId) {
            const modal = document.getElementById(modalId);
            if (!modal) return;

            // Close any open modal first
            if (this.activeModal && this.activeModal !== modalId) {
                this.closeModal(this.activeModal);
            }

            modal.classList.add('active');
            document.body.classList.add('modal-open');
            this.activeModal = modalId;

            // Auto-focus first input if exists
            const firstInput = modal.querySelector('input:not([type="hidden"]), select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }

        closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if (!modal) return;

            modal.classList.remove('active');
            this.activeModal = null;

            // If no other modals are active, remove body lock
            if (!document.querySelector('.modal-container.active')) {
                document.body.classList.remove('modal-open');
            }
        }

        // =================================================================
        // CONFIRMATION DIALOG
        // =================================================================
        confirm(title, message, confirmBtnText = 'Yes, Delete', confirmBtnClass = 'btn-danger') {
            return new Promise((resolve) => {
                const modal = document.getElementById('confirm-modal');
                if (!modal) {
                    resolve(window.confirm(`${title}\n\n${message}`));
                    return;
                }

                document.getElementById('confirm-modal-title').textContent = title;
                document.getElementById('confirm-modal-message').textContent = message;

                const confirmBtn = document.getElementById('confirm-modal-action-btn');
                confirmBtn.textContent = confirmBtnText;
                confirmBtn.className = `btn ${confirmBtnClass}`;

                const cleanup = () => {
                    confirmBtn.removeEventListener('click', onConfirm);
                    cancelBtn.removeEventListener('click', onCancel);
                    this.closeModal('confirm-modal');
                };

                const onConfirm = () => {
                    cleanup();
                    resolve(true);
                };

                const onCancel = () => {
                    cleanup();
                    resolve(false);
                };

                const cancelBtn = document.getElementById('confirm-modal-cancel-btn');

                confirmBtn.addEventListener('click', onConfirm, { once: true });
                cancelBtn.addEventListener('click', onCancel, { once: true });

                this.openModal('confirm-modal');
            });
        }
    }

    window.UI = new UIManager();
})();

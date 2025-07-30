// Simple Custom Modal System
class ModalSystem {
    constructor() {
        this.createContainer();
    }

    createContainer() {
        // Create modal container if it doesn't exist
        if (!document.getElementById('modal-container')) {
            const container = document.createElement('div');
            container.id = 'modal-container';
            container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: none;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
            `;
            document.body.appendChild(container);
        }
    }

    show(options = {}) {
        const container = document.getElementById('modal-container');
        
        const {
            title = 'Confirm',
            message = 'Are you sure?',
            type = 'confirm', // confirm, alert, prompt
            confirmText = 'OK',
            cancelText = 'Cancel',
            inputValue = '',
            inputPlaceholder = '',
            onConfirm = () => {},
            onCancel = () => {},
            onClose = () => {}
        } = options;

        const modal = document.createElement('div');
        modal.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #485460;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 24px;
            min-width: 400px;
            max-width: 500px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            color: white;
            font-family: 'Inter', sans-serif;
        `;

        let inputHtml = '';
        if (type === 'prompt') {
            inputHtml = `
                <input type="text" id="modal-input" 
                       value="${inputValue}" 
                       placeholder="${inputPlaceholder}"
                       style="
                           width: 100%;
                           padding: 8px 12px;
                           margin: 12px 0;
                           border: 1px solid rgba(255, 255, 255, 0.2);
                           border-radius: 6px;
                           background: rgba(255, 255, 255, 0.1);
                           color: white;
                           font-size: 14px;
                       "
                >
            `;
        }

        const buttonsHtml = type === 'alert' ? `
            <button id="modal-confirm" class="modal-btn confirm-btn">
                ${confirmText}
            </button>
        ` : `
            <button id="modal-cancel" class="modal-btn cancel-btn">
                ${cancelText}
            </button>
            <button id="modal-confirm" class="modal-btn confirm-btn">
                ${confirmText}
            </button>
        `;

        modal.innerHTML = `
            <div style="margin-bottom: 16px;">
                <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">
                    ${title}
                </h3>
                <p style="margin: 0; color: #d2dae2; line-height: 1.5;">
                    ${message}
                </p>
            </div>
            ${inputHtml}
            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                ${buttonsHtml}
            </div>
        `;

        // Add CSS for buttons
        const style = document.createElement('style');
        style.textContent = `
            .modal-btn {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .modal-btn:hover {
                transform: translateY(-1px);
            }
            .confirm-btn {
                background: #05c46b;
                color: white;
            }
            .confirm-btn:hover {
                background: #0be881;
            }
            .cancel-btn {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .cancel-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }
        `;
        document.head.appendChild(style);

        container.appendChild(modal);
        container.style.display = 'block';

        // Focus input if prompt
        if (type === 'prompt') {
            const input = modal.querySelector('#modal-input');
            input.focus();
            input.select();
        }

        // Event listeners
        const confirmBtn = modal.querySelector('#modal-confirm');
        const cancelBtn = modal.querySelector('#modal-cancel');

        const closeModal = () => {
            container.style.display = 'none';
            container.innerHTML = '';
            onClose();
        };

        const handleConfirm = () => {
            if (type === 'prompt') {
                const input = modal.querySelector('#modal-input');
                onConfirm(input.value);
            } else {
                onConfirm();
            }
            closeModal();
        };

        const handleCancel = () => {
            onCancel();
            closeModal();
        };

        confirmBtn.addEventListener('click', handleConfirm);
        if (cancelBtn) {
            cancelBtn.addEventListener('click', handleCancel);
        }

        // Close on backdrop click
        container.addEventListener('click', (e) => {
            if (e.target === container) {
                handleCancel();
            }
        });

        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Enter key for prompt
        if (type === 'prompt') {
            const input = modal.querySelector('#modal-input');
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    handleConfirm();
                }
            });
        }

        return modal;
    }

    confirm(message, title = 'Confirm') {
        return new Promise((resolve) => {
            this.show({
                title,
                message,
                type: 'confirm',
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });
    }

    alert(message, title = 'Alert') {
        return new Promise((resolve) => {
            this.show({
                title,
                message,
                type: 'alert',
                onConfirm: () => resolve()
            });
        });
    }

    prompt(message, defaultValue = '', title = 'Input') {
        return new Promise((resolve) => {
            this.show({
                title,
                message,
                type: 'prompt',
                inputValue: defaultValue,
                onConfirm: (value) => resolve(value),
                onCancel: () => resolve(null)
            });
        });
    }
}

// Global modal instance
const modals = new ModalSystem();

// Global functions for easy access
async function confirmDialog(message, title = 'Confirm') {
    return await modals.confirm(message, title);
}

async function alertDialog(message, title = 'Alert') {
    return await modals.alert(message, title);
}

async function promptDialog(message, defaultValue = '', title = 'Input') {
    return await modals.prompt(message, defaultValue, title);
} 
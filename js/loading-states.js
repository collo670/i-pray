// Enhanced loading states utility
(function() {
    'use strict';
    
    const LoadingStates = {
        // Show loading overlay
        showOverlay: function(message = 'Loading...') {
            let overlay = document.getElementById('loading-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'loading-overlay';
                overlay.className = 'loading-overlay';
                overlay.innerHTML = `
                    <div class="text-center">
                        <div class="loading-spinner mx-auto mb-4"></div>
                        <p class="text-gray-700 font-medium">${message}</p>
                    </div>
                `;
                document.body.appendChild(overlay);
            }
            overlay.classList.add('active');
            const messageEl = overlay.querySelector('p');
            if (messageEl) messageEl.textContent = message;
        },
        
        // Hide loading overlay
        hideOverlay: function() {
            const overlay = document.getElementById('loading-overlay');
            if (overlay) {
                overlay.classList.remove('active');
                setTimeout(() => {
                    if (overlay && !overlay.classList.contains('active')) {
                        overlay.remove();
                    }
                }, 300);
            }
        },
        
        // Show skeleton loader for content
        showSkeleton: function(container, count = 3) {
            if (!container) return;
            
            const skeletonHTML = `
                <div class="skeleton-item animate-pulse mb-4">
                    <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div class="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
            `;
            
            container.innerHTML = skeletonHTML.repeat(count);
        },
        
        // Show button loading state
        setButtonLoading: function(button, isLoading) {
            if (!button) return;
            
            if (isLoading) {
                button.setAttribute('aria-busy', 'true');
                button.disabled = true;
                button.dataset.originalText = button.textContent;
                button.innerHTML = `
                    <span class="inline-block mr-2">
                        <div class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    </span>
                    Loading...
                `;
            } else {
                button.removeAttribute('aria-busy');
                button.disabled = false;
                if (button.dataset.originalText) {
                    button.textContent = button.dataset.originalText;
                    delete button.dataset.originalText;
                }
            }
        },
        
        // Show inline loading spinner
        showInlineLoader: function(container) {
            if (!container) return;
            
            const loader = document.createElement('div');
            loader.className = 'inline-loader flex items-center justify-center py-4';
            loader.innerHTML = `
                <div class="loading-spinner"></div>
            `;
            container.appendChild(loader);
            return loader;
        },
        
        // Show toast notification
        showToast: function(message, type = 'info', duration = 3000) {
            const toast = document.createElement('div');
            toast.className = `toast-notification fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg max-w-sm ${
                type === 'success' ? 'bg-green-500 text-white' :
                type === 'error' ? 'bg-red-500 text-white' :
                type === 'warning' ? 'bg-yellow-500 text-white' :
                'bg-blue-500 text-white'
            }`;
            toast.textContent = message;
            toast.setAttribute('role', 'alert');
            toast.setAttribute('aria-live', 'polite');
            
            document.body.appendChild(toast);
            
            // Animate in
            setTimeout(() => {
                toast.style.transform = 'translateX(0)';
                toast.style.opacity = '1';
            }, 10);
            
            // Remove after duration
            setTimeout(() => {
                toast.style.transform = 'translateX(100%)';
                toast.style.opacity = '0';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, duration);
        },
        
        // Show progress bar
        showProgress: function(container, progress = 0) {
            if (!container) return;
            
            let progressBar = container.querySelector('.progress-bar');
            if (!progressBar) {
                progressBar = document.createElement('div');
                progressBar.className = 'progress-bar w-full bg-gray-200 rounded-full h-2 mb-4';
                progressBar.innerHTML = `
                    <div class="progress-fill bg-purple-600 h-2 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
                `;
                container.insertBefore(progressBar, container.firstChild);
            } else {
                const fill = progressBar.querySelector('.progress-fill');
                if (fill) {
                    fill.style.width = `${progress}%`;
                }
            }
        }
    };
    
    // Add loading states to navigation
    document.addEventListener('DOMContentLoaded', () => {
        // Add loading to navigation links
        const navLinks = document.querySelectorAll('nav a, .nav-item');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href && href.startsWith('#') === false && !this.hasAttribute('data-no-loading')) {
                    LoadingStates.showOverlay('Loading page...');
                }
            });
        });
        
        // Hide loading when page is fully loaded
        if (document.readyState === 'complete') {
            LoadingStates.hideOverlay();
        } else {
            window.addEventListener('load', () => {
                LoadingStates.hideOverlay();
            });
        }
        
        // Add loading to form submissions
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
                if (submitButton) {
                    LoadingStates.setButtonLoading(submitButton, true);
                }
            });
        });
    });
    
    // Expose to global scope
    window.LoadingStates = LoadingStates;
})();


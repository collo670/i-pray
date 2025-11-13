// Enhanced mobile navigation with swipe gestures
(function() {
    'use strict';
    
    const MobileNavigation = {
        touchStartX: 0,
        touchStartY: 0,
        touchEndX: 0,
        touchEndY: 0,
        minSwipeDistance: 50,
        bottomNav: null,
        isBottomNavVisible: true,
        
        init: function() {
            if (!this.isMobile()) return;
            
            this.bottomNav = document.querySelector('.bottom-nav, nav[role="navigation"][aria-label="Main Navigation"]');
            this.setupSwipeGestures();
            this.setupBottomNavHide();
            this.setupQuickActions();
            this.addHapticFeedback();
        },
        
        isMobile: function() {
            return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },
        
        // Swipe gestures for navigation
        setupSwipeGestures: function() {
            let touchStartX = 0;
            let touchStartY = 0;
            let touchEndX = 0;
            let touchEndY = 0;
            
            document.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
            }, { passive: true });
            
            document.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                touchEndY = e.changedTouches[0].screenY;
                this.handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
            }, { passive: true });
        },
        
        handleSwipe: function(startX, startY, endX, endY) {
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);
            
            // Only handle horizontal swipes if they're more horizontal than vertical
            if (absDeltaX > absDeltaY && absDeltaX > this.minSwipeDistance) {
                if (deltaX > 0) {
                    // Swipe right - go back
                    this.handleSwipeRight();
                } else {
                    // Swipe left - go forward (if possible)
                    this.handleSwipeLeft();
                }
            } else if (absDeltaY > absDeltaX && absDeltaY > this.minSwipeDistance) {
                if (deltaY > 0 && absDeltaY > 100) {
                    // Swipe down - show bottom nav
                    this.showBottomNav();
                } else if (deltaY < 0 && absDeltaY > 100) {
                    // Swipe up - hide bottom nav
                    this.hideBottomNav();
                }
            }
        },
        
        handleSwipeRight: function() {
            // Go back in history
            if (window.history.length > 1) {
                window.history.back();
                this.vibrate(30);
            }
        },
        
        handleSwipeLeft: function() {
            // Go forward in history (if available)
            if (window.history.length > 1) {
                window.history.forward();
                this.vibrate(30);
            }
        },
        
        // Hide/show bottom nav on scroll
        setupBottomNavHide: function() {
            if (!this.bottomNav) return;
            
            let lastScrollTop = 0;
            let scrollTimeout;
            
            window.addEventListener('scroll', () => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                clearTimeout(scrollTimeout);
                
                // Show nav when scrolling stops
                scrollTimeout = setTimeout(() => {
                    this.showBottomNav();
                }, 500);
                
                // Hide nav when scrolling down, show when scrolling up
                if (scrollTop > lastScrollTop && scrollTop > 100) {
                    // Scrolling down
                    this.hideBottomNav();
                } else {
                    // Scrolling up
                    this.showBottomNav();
                }
                
                lastScrollTop = scrollTop;
            }, { passive: true });
        },
        
        showBottomNav: function() {
            if (!this.bottomNav || this.isBottomNavVisible) return;
            
            this.bottomNav.style.transform = 'translateY(0)';
            this.bottomNav.style.opacity = '1';
            this.isBottomNavVisible = true;
        },
        
        hideBottomNav: function() {
            if (!this.bottomNav || !this.isBottomNavVisible) return;
            
            const navHeight = this.bottomNav.offsetHeight;
            this.bottomNav.style.transform = `translateY(${navHeight}px)`;
            this.bottomNav.style.opacity = '0.8';
            this.isBottomNavVisible = false;
        },
        
        // Quick action buttons (long press)
        setupQuickActions: function() {
            const navItems = document.querySelectorAll('.bottom-nav a, nav[role="navigation"] a');
            
            navItems.forEach(item => {
                let longPressTimer;
                let isLongPress = false;
                
                item.addEventListener('touchstart', (e) => {
                    isLongPress = false;
                    longPressTimer = setTimeout(() => {
                        isLongPress = true;
                        this.showQuickActionMenu(item, e);
                        this.vibrate(100);
                    }, 500);
                }, { passive: true });
                
                item.addEventListener('touchend', () => {
                    clearTimeout(longPressTimer);
                }, { passive: true });
                
                item.addEventListener('touchmove', () => {
                    clearTimeout(longPressTimer);
                }, { passive: true });
            });
        },
        
        showQuickActionMenu: function(item, event) {
            // Create quick action menu
            const menu = document.createElement('div');
            menu.className = 'quick-action-menu fixed bg-white rounded-lg shadow-xl p-2 z-50';
            
            const touch = event.touches ? event.touches[0] : null;
            const clientX = touch ? touch.clientX : (event.clientX || window.innerWidth / 2);
            const clientY = touch ? touch.clientY : (event.clientY || window.innerHeight / 2);
            
            menu.style.cssText = `
                left: ${clientX}px;
                top: ${clientY}px;
                transform: translate(-50%, -100%);
            `;
            
            const href = item.getAttribute('href');
            const text = item.textContent.trim();
            
            const shareButton = navigator.share ? `
                <button class="quick-action-btn w-full px-4 py-2 text-left hover:bg-gray-100 rounded" data-action="share">
                    Share
                </button>
            ` : '';
            
            menu.innerHTML = `
                <button class="quick-action-btn w-full px-4 py-2 text-left hover:bg-gray-100 rounded" data-action="new-tab">
                    Open in New Tab
                </button>
                ${shareButton}
            `;
            
            // Add event listeners
            menu.querySelector('[data-action="new-tab"]').addEventListener('click', () => {
                if (href) window.open(href, '_blank');
                menu.remove();
            });
            
            const shareBtn = menu.querySelector('[data-action="share"]');
            if (shareBtn && navigator.share) {
                shareBtn.addEventListener('click', async () => {
                    try {
                        await navigator.share({
                            title: text,
                            url: href || window.location.href
                        });
                    } catch (err) {
                        // User cancelled or error occurred
                    }
                    menu.remove();
                });
            }
            
            document.body.appendChild(menu);
            
            // Remove menu on click outside
            setTimeout(() => {
                const removeMenu = (e) => {
                    if (!menu.contains(e.target)) {
                        menu.remove();
                        document.removeEventListener('click', removeMenu);
                        document.removeEventListener('touchstart', removeMenu);
                    }
                };
                document.addEventListener('click', removeMenu);
                document.addEventListener('touchstart', removeMenu);
            }, 100);
        },
        
        // Haptic feedback
        addHapticFeedback: function() {
            const interactiveElements = document.querySelectorAll('button, a, .clickable');
            
            interactiveElements.forEach(element => {
                element.addEventListener('touchstart', () => {
                    this.vibrate(10);
                }, { passive: true });
            });
        },
        
        vibrate: function(duration) {
            if (navigator.vibrate) {
                navigator.vibrate(duration);
            }
        }
    };
    
    // Add CSS for bottom nav transitions
    const style = document.createElement('style');
    style.textContent = `
        .bottom-nav,
        nav[role="navigation"][aria-label="Main Navigation"] {
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .quick-action-menu {
            animation: slideUp 0.2s ease-out;
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translate(-50%, -90%);
            }
            to {
                opacity: 1;
                transform: translate(-50%, -100%);
            }
        }
        
        /* Enhanced touch targets for mobile */
        @media (max-width: 768px) {
            .bottom-nav a,
            nav[role="navigation"] a {
                min-height: 44px;
                min-width: 44px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            /* Swipe indicator */
            .swipe-indicator {
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
                z-index: 1000;
            }
            
            .swipe-indicator.show {
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => MobileNavigation.init());
    } else {
        MobileNavigation.init();
    }
    
    // Expose to global scope
    window.MobileNavigation = MobileNavigation;
})();


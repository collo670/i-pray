// Enhanced mobile navigation with swipe gestures
(function() {
    'use strict';
    
    const MobileNavigation = {
        touchStartX: 0,
        touchStartY: 0,
        touchEndX: 0,
        touchEndY: 0,
        minSwipeDistance: 50,
        
        init: function() {
            if (!this.isMobile()) return;
            
            this.setupSwipeGestures();
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
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => MobileNavigation.init());
    } else {
        MobileNavigation.init();
    }
    
    // Expose to global scope
    window.MobileNavigation = MobileNavigation;
})();


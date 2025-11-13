// Page transition script - add smooth fade-in to all pages
(function() {
    'use strict';
    
    // Add page transition class to body when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPageTransition);
    } else {
        initPageTransition();
    }
    
    function initPageTransition() {
        // Add transition class to main content
        const main = document.querySelector('main');
        if (main) {
            main.classList.add('page-transition');
        }
        
        // Add transition to body
        document.body.classList.add('page-content');
        
        // Hide loading overlay if it exists
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            setTimeout(() => {
                loadingOverlay.classList.remove('active');
            }, 300);
        }
    }
})();


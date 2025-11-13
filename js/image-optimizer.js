// Image optimization and lazy loading handler
(function() {
    'use strict';
    
    // Lazy load images with Intersection Observer
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Load the image
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    
                    // Add loaded class when image loads
                    img.addEventListener('load', () => {
                        img.classList.add('loaded');
                    }, { once: true });
                    
                    // Stop observing this image
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px' // Start loading 50px before image enters viewport
        });
        
        // Observe all lazy images
        document.addEventListener('DOMContentLoaded', () => {
            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        document.addEventListener('DOMContentLoaded', () => {
            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            lazyImages.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                img.addEventListener('load', () => {
                    img.classList.add('loaded');
                }, { once: true });
            });
        });
    }
    
    // Add error handling for broken images
    document.addEventListener('error', (e) => {
        if (e.target.tagName === 'IMG') {
            e.target.style.display = 'none';
            console.warn('Image failed to load:', e.target.src);
        }
    }, true);
    
    // Preload critical images
    function preloadCriticalImages() {
        const criticalImages = [
            'assets/images/maria mdogo.png',
            'assets/images/carmen.jpg'
        ];
        
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', preloadCriticalImages);
    } else {
        preloadCriticalImages();
    }
})();


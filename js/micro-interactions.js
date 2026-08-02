// Micro-interactions and enhanced UX animations
(function() {
    'use strict';
    
    const MicroInteractions = {
        // Initialize all micro-interactions
        init: function() {
            this.addButtonRipple();
            this.addCardHover();
            this.addSmoothScroll();
            this.addClickFeedback();
            this.addFocusAnimations();
            this.addStaggerAnimations();
        },
        
        // Ripple effect on buttons
        addButtonRipple: function() {
            const buttons = document.querySelectorAll('button, .btn, a[role="button"]');
            
            buttons.forEach(button => {
                button.addEventListener('click', function(e) {
                    if (this.classList.contains('no-ripple')) return;
                    
                    const ripple = document.createElement('span');
                    const rect = this.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = e.clientX - rect.left - size / 2;
                    const y = e.clientY - rect.top - size / 2;
                    
                    ripple.style.cssText = `
                        position: absolute;
                        width: ${size}px;
                        height: ${size}px;
                        border-radius: 50%;
                        background: rgba(255, 255, 255, 0.6);
                        transform: scale(0);
                        animation: ripple 0.6s ease-out;
                        left: ${x}px;
                        top: ${y}px;
                        pointer-events: none;
                    `;
                    
                    if (getComputedStyle(this).position === 'static') {
                        this.style.position = 'relative';
                    }
                    this.style.overflow = 'hidden';
                    this.appendChild(ripple);
                    
                    setTimeout(() => {
                        ripple.remove();
                    }, 600);
                });
            });
        },
        
        // Enhanced card hover effects
        addCardHover: function() {
            const cards = document.querySelectorAll('.card, [class*="card"], .bg-white.rounded-lg');
            
            cards.forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-4px)';
                    this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
                    this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = '';
                });
            });
        },
        
        // Smooth scroll with offset
        addSmoothScroll: function() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    if (href === '#') return;
                    
                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        const offset = 80; // Account for fixed header
                        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        },
        
        // Click feedback animations
        addClickFeedback: function() {
            const clickableElements = document.querySelectorAll('button, a, .clickable, [role="button"]');
            
            clickableElements.forEach(element => {
                element.addEventListener('mousedown', function() {
                    this.style.transform = 'scale(0.95)';
                });
                
                element.addEventListener('mouseup', function() {
                    this.style.transform = '';
                });
                
                element.addEventListener('mouseleave', function() {
                    this.style.transform = '';
                });
            });
        },
        
        // Focus animations
        addFocusAnimations: function() {
            const focusableElements = document.querySelectorAll('button, a, input, textarea, select');
            
            focusableElements.forEach(element => {
                element.addEventListener('focus', function() {
                    this.style.outline = '2px solid #7c2133';
                    this.style.outlineOffset = '2px';
                });
                
                element.addEventListener('blur', function() {
                    this.style.outline = '';
                    this.style.outlineOffset = '';
                });
            });
        },
        
        // Stagger animations for lists
        addStaggerAnimations: function() {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        }, index * 50);
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);
            
            // Observe list items and cards
            document.querySelectorAll('li, .card, .nav-item').forEach((el, index) => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                observer.observe(el);
            });
        }
    };
    
    // Add ripple animation to CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        /* Hover lift effect */
        .hover-lift {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        
        /* Pulse animation for notifications */
        @keyframes pulse-glow {
            0%, 100% {
                box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.7);
            }
            50% {
                box-shadow: 0 0 0 10px rgba(124, 58, 237, 0);
            }
        }
        
        .pulse-glow {
            animation: pulse-glow 2s infinite;
        }
        
        /* Shake animation for errors */
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
        
        .shake {
            animation: shake 0.5s ease-in-out;
        }
        
        /* Bounce animation */
        @keyframes bounce-in {
            0% {
                transform: scale(0.3);
                opacity: 0;
            }
            50% {
                transform: scale(1.05);
            }
            70% {
                transform: scale(0.9);
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        .bounce-in {
            animation: bounce-in 0.6s ease-out;
        }
    `;
    document.head.appendChild(style);
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => MicroInteractions.init());
    } else {
        MicroInteractions.init();
    }
    
    // Expose to global scope
    window.MicroInteractions = MicroInteractions;
})();


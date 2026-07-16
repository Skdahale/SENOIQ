document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Simple animation observer for elements
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                
                // Restore CSS transitions after initial fade-in so hover effects work smoothly
                setTimeout(() => {
                    entry.target.style.transition = '';
                    entry.target.style.transitionDelay = '0s';
                }, 1000);
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select elements to animate
    const animateElements = document.querySelectorAll('.glow-card, .case-card, .feature-item, .section-title, .hero-content, .about-text');
    
    // Initial style for animated elements
    animateElements.forEach(el => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        
        // Stagger glow cards
        if (el.classList.contains('glow-card')) {
            const cards = Array.from(el.parentElement.children);
            const index = cards.indexOf(el);
            el.style.transitionDelay = `${index * 0.1}s`;
        }
        
        observer.observe(el);
    });

    // Glow Cards Mouse Tracking
    const glowCards = document.querySelectorAll('.glow-card');

    if (glowCards.length > 0) {
        document.addEventListener('mousemove', (e) => {
            glowCards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }

    // Contact Form AJAX Submission with Formspree
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            // Set loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending...';
            
            const formData = new FormData(contactForm);
            
            try {
                const response = await fetch(contactForm.action, {
                    method: contactForm.method,
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    showFormMessage('success', 'Thank you! Your message has been sent successfully. We will get back to you shortly.');
                    contactForm.reset();
                } else {
                    const data = await response.json();
                    const errorMsg = data.errors ? data.errors.map(err => err.message).join(', ') : 'Something went wrong. Please try again.';
                    showFormMessage('error', errorMsg);
                }
            } catch (error) {
                // If it's a CORS issue on local file:// origin, fall back to standard HTML form submission
                console.warn('AJAX submit failed, falling back to standard HTML form submission:', error);
                contactForm.submit();
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    function showFormMessage(type, message) {
        const existingAlert = document.querySelector('.form-alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        const alertEl = document.createElement('div');
        alertEl.className = `form-alert ${type}`;
        alertEl.style.padding = '14px 20px';
        alertEl.style.borderRadius = '8px';
        alertEl.style.marginTop = '20px';
        alertEl.style.fontSize = '14px';
        alertEl.style.fontWeight = '500';
        alertEl.style.display = 'flex';
        alertEl.style.alignItems = 'center';
        alertEl.style.gap = '10px';
        alertEl.style.opacity = '0';
        alertEl.style.transform = 'translateY(10px)';
        alertEl.style.transition = 'all 0.3s ease';
        
        if (type === 'success') {
            alertEl.style.backgroundColor = 'rgba(33, 150, 83, 0.1)';
            alertEl.style.color = '#219653';
            alertEl.style.border = '1px solid rgba(33, 150, 83, 0.2)';
            alertEl.innerHTML = `<i data-feather="check-circle" style="width:18px;height:18px;flex-shrink:0;"></i> <span>${message}</span>`;
        } else {
            alertEl.style.backgroundColor = 'rgba(235, 87, 87, 0.1)';
            alertEl.style.color = '#EB5757';
            alertEl.style.border = '1px solid rgba(235, 87, 87, 0.2)';
            alertEl.innerHTML = `<i data-feather="alert-circle" style="width:18px;height:18px;flex-shrink:0;"></i> <span>${message}</span>`;
        }
        
        contactForm.appendChild(alertEl);
        if (window.feather) window.feather.replace();
        
        setTimeout(() => {
            alertEl.style.opacity = '1';
            alertEl.style.transform = 'translateY(0)';
        }, 10);
        
        if (type === 'success') {
            setTimeout(() => {
                alertEl.style.opacity = '0';
                alertEl.style.transform = 'translateY(-10px)';
                setTimeout(() => alertEl.remove(), 300);
            }, 6000);
        }
    }

    // Email Copy to Clipboard and Redirect to Gmail on Click
    const emailTargetAddress = 'contact@senoiqai.tech';
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href') || '';
        const text = link.textContent || '';
        if (href.startsWith('mailto:') || href.includes('senoiq.ai@gmail.com') || href.includes(emailTargetAddress) || text.includes('senoiq.ai@gmail.com') || text.includes(emailTargetAddress)) {
            // Update the link to point to Gmail compose window directly
            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailTargetAddress}`;
            link.setAttribute('href', gmailUrl);
            link.setAttribute('target', '_blank');
            
            link.addEventListener('click', () => {
                navigator.clipboard.writeText(emailTargetAddress).then(() => {
                    showToast('Email copied to clipboard!');
                }).catch(err => {
                    console.error('Failed to copy email:', err);
                });
            });
        }
    });

    function showToast(message) {
        const existingToast = document.querySelector('.email-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = 'email-toast';
        toast.textContent = message;
        
        toast.style.position = 'fixed';
        toast.style.bottom = '30px';
        toast.style.left = '50%';
        toast.style.transform = 'translate(-50%, 20px)';
        toast.style.backgroundColor = 'var(--primary-green, #265a53)';
        toast.style.color = '#FFFFFF';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '30px';
        toast.style.fontSize = '14px';
        toast.style.fontWeight = '600';
        toast.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
        toast.style.zIndex = '9999';
        toast.style.opacity = '0';
        toast.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translate(-50%, 0)';
        }, 10);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, -20px)';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // Dynamic Mobile Navigation Initialization
    const headerContainer = document.querySelector('.header-container');
    const desktopNav = document.querySelector('.nav');
    
    if (headerContainer && desktopNav) {
        // 1. Create and inject mobile hamburger toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'mobile-nav-toggle';
        toggleBtn.setAttribute('aria-label', 'Toggle navigation');
        toggleBtn.innerHTML = '<i data-feather="menu"></i>';
        headerContainer.appendChild(toggleBtn);
        
        // 2. Create and inject mobile menu drawer overlay
        const overlay = document.createElement('div');
        overlay.className = 'mobile-nav-overlay';
        
        const content = document.createElement('div');
        content.className = 'mobile-nav-content';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'mobile-nav-close';
        closeBtn.setAttribute('aria-label', 'Close navigation');
        closeBtn.innerHTML = '<i data-feather="x"></i>';
        content.appendChild(closeBtn);
        
        const linksContainer = document.createElement('div');
        linksContainer.className = 'mobile-nav-links';
        
        // Clone links from desktop nav
        const desktopLinks = desktopNav.querySelectorAll('a');
        desktopLinks.forEach(link => {
            const clonedLink = link.cloneNode(true);
            // Close mobile menu when any link is clicked (e.g. anchor link jumps)
            clonedLink.addEventListener('click', () => {
                closeMobileNav();
            });
            linksContainer.appendChild(clonedLink);
        });
        content.appendChild(linksContainer);
        
        // Add book a call action inside mobile drawer
        const desktopCallBtn = headerContainer.querySelector('a.btn-primary');
        if (desktopCallBtn) {
            const clonedCallBtn = desktopCallBtn.cloneNode(true);
            clonedCallBtn.className = 'btn btn-primary mobile-nav-btn';
            clonedCallBtn.addEventListener('click', () => {
                closeMobileNav();
            });
            content.appendChild(clonedCallBtn);
        }
        
        overlay.appendChild(content);
        document.body.appendChild(overlay);
        
        // 3. Open/Close event listeners
        toggleBtn.addEventListener('click', () => {
            openMobileNav();
        });
        
        closeBtn.addEventListener('click', () => {
            closeMobileNav();
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeMobileNav();
            }
        });
        
        function openMobileNav() {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Disable background scroll when menu is active
        }
        
        function closeMobileNav() {
            overlay.classList.remove('active');
            document.body.style.overflow = ''; // Restore background scroll
        }
        
        // 4. Parse feather icons inside newly injected elements
        if (window.feather) {
            window.feather.replace();
        }
    }
});

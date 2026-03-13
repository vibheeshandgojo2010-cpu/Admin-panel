// script.js - Updated for multi-page site
document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');
    const navLinkElements = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', function (e) {
            e.stopPropagation(); // Prevent document listener from immediately closing the menu
            navLinks.classList.toggle('active');

            const icon = this.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }

    // Close mobile menu when clicking a link
    navLinkElements.forEach(link => {
        link.addEventListener('click', function () {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                if (menuToggle) {
                    const icon = menuToggle.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.nav-container') && navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            if (menuToggle) {
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Don't prevent default for empty hashes or just "#"
            if (href === '#' || href === '') {
                return;
            }

            const targetElement = document.querySelector(href);
            if (targetElement) {
                e.preventDefault();
                const navHeight = document.querySelector('.main-nav')?.offsetHeight || 0;
                const targetPosition = targetElement.offsetTop - navHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add scroll effect to navigation on scroll
    let lastScroll = 0;
    const mainNav = document.querySelector('.main-nav');

    window.addEventListener('scroll', function () {
        const currentScroll = window.pageYOffset;

        if (mainNav) {
            // Handle background change on scroll
            if (currentScroll > 50) {
                mainNav.classList.add('scrolled');
            } else {
                mainNav.classList.remove('scrolled');
            }
        }

        lastScroll = currentScroll;
    });

    // Unified Intersection Observer for premium reveals
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Staggered delay based on index of visible items
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, index * 100);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    // Mark and observe elements
    const revealTargets = document.querySelectorAll('.featured-card, .benefit-card, .value-card, .team-member, .product-card, .section-title, .section-subtitle');
    revealTargets.forEach(el => {
        el.classList.add('reveal-on-scroll');
        revealObserver.observe(el);
    });

    // Hero section animations (home page)
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        const scrollIndicator = document.querySelector('.scroll-indicator');

        window.addEventListener('scroll', function () {
            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;
            const scrollPercentage = Math.min(scrollPosition / windowHeight, 1);

            if (scrollIndicator) {
                scrollIndicator.style.opacity = 1 - (scrollPercentage * 3);
            }
        });
    }

    // Global click listener for password toggles
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('toggle-password')) {
            const targetId = e.target.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);

            if (passwordInput) {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);

                // Toggle the eye icon
                e.target.classList.toggle('fa-eye');
                e.target.classList.toggle('fa-eye-slash');
            }
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {

    /* ====== STICKY NAVBAR ====== */
    const navbar = document.getElementById('navbar');
    let lastKnownScrollY = 0;
    let navTicking = false;

    function onNavScroll() {
        lastKnownScrollY = window.scrollY;
        if (!navTicking) {
            requestAnimationFrame(() => {
                navbar.classList.toggle('scrolled', lastKnownScrollY > 50);
                navTicking = false;
            });
            navTicking = true;
        }
    }
    window.addEventListener('scroll', onNavScroll, { passive: true });

    /* ====== SCROLL REVEAL ====== */
    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    /* ====== NUMBER COUNTER ====== */
    const statNumbers = document.querySelectorAll('.stat-number');
    let counted = false;
    const statsSection = document.querySelector('.stats');

    if (statsSection && statNumbers.length) {
        new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !counted) {
                counted = true;
                statNumbers.forEach(stat => {
                    const target = parseInt(stat.dataset.target, 10);
                    const duration = 2000;
                    const steps = duration / 16;
                    const increment = target / steps;
                    let current = 0;

                    function tick() {
                        current += increment;
                        if (current < target) {
                            stat.textContent = Math.ceil(current);
                            requestAnimationFrame(tick);
                        } else {
                            stat.textContent = target; // No '+' needed for typical years/tests
                        }
                    }
                    tick();
                });
            }
        }, { threshold: 0.4 }).observe(statsSection);
    }

    /* ====== RIPPLE TOUCH FEEDBACK ====== */
    function createRipple(el, x, y) {
        const old = el.querySelector('.ripple-effect');
        if (old) old.remove();

        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';

        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);

        Object.assign(ripple.style, {
            width: size + 'px',
            height: size + 'px',
            left: (x - rect.left - size / 2) + 'px',
            top: (y - rect.top - size / 2) + 'px'
        });

        el.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
    }

    document.querySelectorAll('.ripple-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            createRipple(this, e.clientX, e.clientY);
        });
        btn.addEventListener('touchstart', function (e) {
            const t = e.touches[0];
            createRipple(this, t.clientX, t.clientY);
        }, { passive: true });
    });

    /* ====== PARALLAX BACKGROUND SHAPES ====== */
    const parallaxShapes = document.querySelectorAll('[data-parallax]');
    let pxTicking = false;

    if (parallaxShapes.length) {
        window.addEventListener('scroll', () => {
            if (!pxTicking) {
                requestAnimationFrame(() => {
                    const sy = window.scrollY;
                    parallaxShapes.forEach(shape => {
                        const speed = parseFloat(shape.dataset.parallax);
                        shape.style.transform = `translateY(${sy * speed * -1}px)`;
                    });
                    pxTicking = false;
                });
                pxTicking = true;
            }
        }, { passive: true });
    }

    /* ====== BOTTOM TAB BAR ====== */
    const bottomTabBar = document.getElementById('bottomTabBar');
    const tabItems = document.querySelectorAll('.tab-item');
    const sections = document.querySelectorAll('section[id]');

    if (bottomTabBar && tabItems.length) {
        const sectObs = new IntersectionObserver((entries) => {
            let activeId = '';
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    activeId = entry.target.id;
                }
            });
            if (activeId) {
                tabItems.forEach(tab => {
                    tab.classList.toggle('active', tab.dataset.section === activeId);
                });
            }
        }, { threshold: 0.25, rootMargin: '-10% 0px -55% 0px' });

        sections.forEach(sec => sectObs.observe(sec));

        // Hide on scroll down, show on scroll up
        let prevScrollY = window.scrollY;
        let tabTicking = false;

        window.addEventListener('scroll', () => {
            if (!tabTicking) {
                requestAnimationFrame(() => {
                    const cur = window.scrollY;
                    if (cur > prevScrollY && cur > 200) {
                        bottomTabBar.classList.add('hidden');
                    } else {
                        bottomTabBar.classList.remove('hidden');
                    }
                    prevScrollY = cur;
                    tabTicking = false;
                });
                tabTicking = true;
            }
        }, { passive: true });

        // Smooth scroll on click (overrides default jump)
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href').substring(1);
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    e.preventDefault();
                    if (targetId === 'home') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        });
    }

    /* ====== CATALOG FILTERING ====== */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add to current
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            productCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'flex';
                    // Re-trigger reveal animation for smoothness
                    card.classList.remove('active');
                    setTimeout(() => card.classList.add('active'), 10);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    /* ====== PRODUCT MODAL ====== */
    const modal = document.getElementById('productModal');
    const modalClose = document.querySelector('.modal-close');
    const modalTitle = document.querySelector('.modal-title');
    const modalDesc = document.querySelector('.modal-desc');
    const modalIcon = document.querySelector('.modal-icon i');

    // Open Modal
    document.querySelectorAll('.product-modal-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = e.target.closest('.product-card');

            // Extract info from card
            const title = card.querySelector('h3').textContent;
            const desc = card.querySelector('.product-desc').textContent;
            const iconClass = card.querySelector('.product-image i').className;

            // Update modal
            modalTitle.textContent = title;
            modalDesc.textContent = desc;
            modalIcon.className = iconClass;

            // Show modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    });

    // Close Modal functions
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    // Close on outside click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Close modal when CTA button is clicked
    document.querySelectorAll('.close-target').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

});

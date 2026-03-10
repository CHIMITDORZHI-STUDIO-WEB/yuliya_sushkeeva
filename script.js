document.addEventListener('DOMContentLoaded', () => {

    /* ====== STICKY NAVBAR ====== */
    const navbar = document.getElementById('navbar');
    let lastKnownScrollY = 0;
    let navTicking = false;

    function onNavScroll() {
        lastKnownScrollY = window.scrollY;
        if (!navTicking) {
            requestAnimationFrame(() => {
                if (navbar) {
                    navbar.classList.toggle('scrolled', lastKnownScrollY > 50);
                }
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
                    if (isNaN(target)) return;
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
                            stat.textContent = target;
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
                        if (!isNaN(speed)) {
                            shape.style.transform = `translateY(${sy * speed * -1}px)`;
                        }
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
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            const filterValue = btn.getAttribute('data-filter');

            productCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'flex';
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
    const modalImg = document.querySelector('.modal-img');

    function openModal(card) {
        if (!modal || !card) return;

        const titleEl = card.querySelector('h3');
        const descEl = card.querySelector('.product-desc');
        const imgEl = card.querySelector('.product-image img');

        if (titleEl) modalTitle.textContent = titleEl.textContent;
        if (descEl) modalDesc.textContent = descEl.textContent;
        if (imgEl) modalImg.src = imgEl.src;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Store the element that opened the modal to restore focus later
        modal._lastFocused = document.activeElement;

        // Focus the close button for keyboard users
        if (modalClose) {
            setTimeout(() => modalClose.focus(), 100);
        }
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';

        // Restore focus to the element that opened the modal
        if (modal._lastFocused) {
            modal._lastFocused.focus();
            modal._lastFocused = null;
        }
    }

    // Open Modal
    document.querySelectorAll('.product-modal-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = e.target.closest('.product-card');
            openModal(card);
        });
    });

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

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Focus trap inside modal
    if (modal) {
        modal.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            const focusable = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (!focusable.length) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });
    }

    // Close modal when CTA button is clicked
    document.querySelectorAll('.close-target').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

});

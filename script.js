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
                    const duration = 1800;
                    const steps = duration / 16;
                    const increment = target / steps;
                    let current = 0;

                    function tick() {
                        current += increment;
                        if (current < target) {
                            stat.textContent = Math.ceil(current);
                            requestAnimationFrame(tick);
                        } else {
                            // Show "+" only for big round numbers
                            stat.textContent = target >= 100 ? target + '+' : target;
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

    function updateParallax() {
        const sy = window.scrollY;
        parallaxShapes.forEach(shape => {
            const speed = parseFloat(shape.dataset.parallax);
            // Only modify translateY, leave other transforms intact
            shape.style.transform = `translateY(${sy * speed * -1}px)`;
        });
        pxTicking = false;
    }

    if (parallaxShapes.length) {
        window.addEventListener('scroll', () => {
            if (!pxTicking) {
                requestAnimationFrame(updateParallax);
                pxTicking = true;
            }
        }, { passive: true });
    }

    /* ====== BOTTOM TAB BAR ====== */
    const bottomTabBar = document.getElementById('bottomTabBar');
    const tabItems = document.querySelectorAll('.tab-item');
    const sections = document.querySelectorAll('section[id]');

    if (bottomTabBar && tabItems.length) {

        // Active section tracking
        const sectObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    tabItems.forEach(tab => {
                        tab.classList.toggle('active', tab.dataset.section === id);
                    });
                }
            });
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

        // Smooth scroll on click
        tabItems.forEach(tab => {
            tab.addEventListener('click', e => {
                e.preventDefault();
                const target = document.getElementById(tab.getAttribute('href').substring(1));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    /* ====== SWIPE CARDS — DOT INDICATOR ====== */
    const cardsGrid = document.querySelector('.cards-grid');
    const dots = document.querySelectorAll('.swipe-dots .dot');

    if (cardsGrid && dots.length) {
        let dotTicking = false;

        cardsGrid.addEventListener('scroll', () => {
            if (!dotTicking) {
                requestAnimationFrame(() => {
                    const cards = cardsGrid.querySelectorAll('.card');
                    if (!cards.length) return;

                    const containerLeft = cardsGrid.scrollLeft;
                    const containerCenter = containerLeft + cardsGrid.offsetWidth / 2;

                    let activeIdx = 0;
                    let minDist = Infinity;

                    cards.forEach((card, i) => {
                        const cardCenter = card.offsetLeft - cardsGrid.offsetLeft + card.offsetWidth / 2;
                        const dist = Math.abs(containerCenter - cardCenter);
                        if (dist < minDist) {
                            minDist = dist;
                            activeIdx = i;
                        }
                    });

                    dots.forEach((dot, i) => {
                        dot.classList.toggle('active', i === activeIdx);
                    });

                    dotTicking = false;
                });
                dotTicking = true;
            }
        }, { passive: true });
    }

});

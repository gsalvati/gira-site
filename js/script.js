/* ==========================================================
   GIRA — interactions
   ========================================================== */
(function () {
    'use strict';

    /* ---------- 1. Year in footer ---------- */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- 2. Navbar — scrolled state ---------- */
    const nav = document.getElementById('nav');
    const onScroll = () => {
        if (!nav) return;
        nav.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ---------- 3. Mobile menu ---------- */
    const menuBtn = document.getElementById('menuBtn');
    const navMobile = document.getElementById('navMobile');

    if (menuBtn && navMobile) {
        const closeMenu = () => {
            menuBtn.classList.remove('is-open');
            menuBtn.setAttribute('aria-expanded', 'false');
            navMobile.hidden = true;
        };
        const toggleMenu = () => {
            const isOpen = menuBtn.classList.toggle('is-open');
            menuBtn.setAttribute('aria-expanded', String(isOpen));
            navMobile.hidden = !isOpen;
        };

        menuBtn.addEventListener('click', toggleMenu);
        navMobile.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 880) closeMenu();
        });
    }

    /* ---------- 4. Reveal on scroll ---------- */
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealEls.length) {
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        io.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
        );
        revealEls.forEach((el) => io.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('is-visible'));
    }

    /* ---------- 5. Anatomy tabs ---------- */
    const tabs = document.querySelectorAll('.anatomy-tab');
    const panels = {
        print: document.getElementById('panel-print'),
        elec:  document.getElementById('panel-elec'),
        firm:  document.getElementById('panel-firm'),
    };

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const key = tab.dataset.tab;
            if (!panels[key]) return;

            tabs.forEach((t) => {
                const active = t === tab;
                t.classList.toggle('active', active);
                t.setAttribute('aria-selected', String(active));
            });
            Object.entries(panels).forEach(([k, p]) => {
                if (!p) return;
                p.classList.toggle('active', k === key);
            });
        });
    });

    /* ---------- 6. Smooth offset for sticky nav on hash nav ---------- */
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const navHeight = nav ? nav.offsetHeight : 0;
            const top = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
})();

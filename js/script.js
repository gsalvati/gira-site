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

    /* ==========================================================
       GALLERY — Modal with zoom / pan / wheel
       ========================================================== */
    (function () {
        const galleryItems = document.querySelectorAll('.gallery__thumb');
        const modal = document.getElementById('galleryModal');
        if (!modal || !galleryItems.length) return;

        const modalImg = modal.querySelector('.gallery-modal__img');
        const counter = modal.querySelector('.gallery-modal__counter');
        const prevBtn = modal.querySelector('.gallery-modal__prev');
        const nextBtn = modal.querySelector('.gallery-modal__next');
        const closeBtn = modal.querySelector('.gallery-modal__close');

        let currentIndex = 0;
        let scale = 1;
        let translateX = 0;
        let translateY = 0;
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let hasDragged = false;

        function updateTransform() {
            if (!modalImg) return;
            modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        }

        function resetTransform() {
            scale = 1;
            translateX = 0;
            translateY = 0;
            updateTransform();
        }

        function openModal(index) {
            currentIndex = index;
            const item = galleryItems[index];
            if (!item) return;
            const src = item.dataset.full || item.src;
            const caption = item.dataset.caption || '';
            modalImg.src = src;
            modalImg.alt = item.alt || '';
            modal.querySelector('.gallery-modal__caption').textContent = caption;
            if (counter) counter.textContent = `${index + 1} / ${galleryItems.length}`;
            modal.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            resetTransform();
        }

        function closeModal() {
            modal.classList.remove('is-open');
            document.body.style.overflow = '';
            setTimeout(resetTransform, 300);
        }

        function next() {
            currentIndex = (currentIndex + 1) % galleryItems.length;
            openModal(currentIndex);
        }

        function prev() {
            currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
            openModal(currentIndex);
        }

        galleryItems.forEach((item, i) => {
            item.addEventListener('click', () => openModal(i));
        });

        closeBtn && closeBtn.addEventListener('click', closeModal);
        nextBtn && nextBtn.addEventListener('click', next);
        prevBtn && prevBtn.addEventListener('click', prev);

        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('gallery-modal__backdrop')) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (!modal.classList.contains('is-open')) return;
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowRight') next();
            if (e.key === 'ArrowLeft') prev();
        });

        /* Wheel zoom */
        modal.addEventListener('wheel', (e) => {
            if (!modal.classList.contains('is-open')) return;
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.15 : 0.15;
            scale = Math.max(0.5, Math.min(5, scale + delta));
            updateTransform();
        }, { passive: false });

        /* Drag to pan */
        modal.addEventListener('mousedown', (e) => {
            if (!modal.classList.contains('is-open')) return;
            if (e.target.closest('.gallery-modal__close, .gallery-modal__prev, .gallery-modal__next')) return;
            isDragging = true;
            hasDragged = false;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            modalImg.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            hasDragged = true;
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateTransform();
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            if (modalImg) modalImg.style.cursor = scale > 1 ? 'grab' : 'default';
        });

        /* Zoom buttons */
        const zoomIn = modal.querySelector('.gallery-modal__zoom-in');
        const zoomOut = modal.querySelector('.gallery-modal__zoom-out');
        const zoomReset = modal.querySelector('.gallery-modal__zoom-reset');

        zoomIn && zoomIn.addEventListener('click', () => {
            scale = Math.min(5, scale + 0.5);
            updateTransform();
        });
        zoomOut && zoomOut.addEventListener('click', () => {
            scale = Math.max(0.5, scale - 0.5);
            updateTransform();
        });
        zoomReset && zoomReset.addEventListener('click', resetTransform);
    })();

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

document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('is-visible'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  items.forEach((el) => observer.observe(el));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const formatCount = (value, decimals) => value.toLocaleString('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const animateCount = (el) => {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';

    if (reduceMotion) {
      el.textContent = formatCount(target, decimals) + suffix;
      return;
    }

    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatCount(target * eased, decimals) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const counters = document.querySelectorAll('.stat .num[data-target]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  counters.forEach((el) => counterObserver.observe(el));

  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (navToggle && mainNav) {
    const closeNav = () => {
      mainNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    };

    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('click', (e) => {
      if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) closeNav();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });
  }

  document.querySelectorAll('[data-goal]').forEach((el) => {
    el.addEventListener('click', () => {
      if (typeof window.ym === 'function') window.ym(111567095, 'reachGoal', el.dataset.goal);
    });
  });

  // AI:stack — live card with the channel's current post (data from a secret gist)
  const livePost = document.querySelector('#live-post');

  if (livePost) {
    const GIST_URL = 'https://gist.githubusercontent.com/JohnSmith-SG/dc74543025fd9d12733280b8e4686830/raw/latest.json';

    fetch(GIST_URL, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('gist ' + res.status);
        return res.json();
      })
      .then((data) => {
        const card = livePost.querySelector('.tg-card');
        const img = livePost.querySelector('.tg-img');
        const dateEl = livePost.querySelector('.live-date');
        const titleEl = livePost.querySelector('.tg-title');
        const textEl = livePost.querySelector('.tg-text');
        const enBtn = livePost.querySelector('.tg-btn');

        if (data.link) card.href = data.link;
        if (data.title) titleEl.textContent = data.title;
        if (data.excerpt) textEl.textContent = data.excerpt;

        if (typeof data.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
          const [, month, day] = data.date.split('-');
          dateEl.textContent = day + '.' + month + ' — актуальный пост';
        }

        if (!data.en && enBtn) enBtn.remove();

        if (data.image) {
          img.addEventListener('error', () => img.remove());
          img.src = data.image;
        } else {
          img.remove();
        }

        livePost.classList.add('is-visible');
      })
      .catch(() => {
        /* gist unreachable or no JS — leave the block hidden, timeline row stays */
      });
  }
});

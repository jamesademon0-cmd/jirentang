/* =========================================================
   济仁堂中医养生馆 · 交互脚本
   ========================================================= */

(() => {
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];

  /* ----- 1. 导航栏滚动状态 ----- */
  const navbar = $('#navbar');
  const onScroll = () => {
    if (window.scrollY > 30) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----- 2. 移动端汉堡菜单 ----- */
  const hamburger = $('#hamburger');
  const navLinks  = $('#navLinks');
  hamburger?.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  // 点击导航项后自动关闭
  $$('#navLinks a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  /* ----- 3. 当前 section 高亮 ----- */
  const sections = $$('section[id]');
  const navItems = $$('.nav-links a');
  const setActive = () => {
    const scrollY = window.scrollY + 120;
    let currentId = '';
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollY) currentId = sec.id;
    });
    navItems.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${currentId}`);
    });
  };
  document.addEventListener('scroll', setActive, { passive: true });
  setActive();

  /* ----- 4. 入场动画 ----- */
  const revealTargets = [
    '.section-head',
    '.about-visual',
    '.about-text',
    '.doctor-card',
    '.service-card',
    '.therapy-item',
    '.testi-card',
    '.info-card',
    '.contact-form',
    '.hero-stats > div',
    '.footer-inner',
    '.article-card',
    '.season-card',
    '.prevent-card',
    '.event-item',
    '.past-card',
    '.prevent-cta',
    '.solar-terms',
    '.classroom-tabs',
  ];
  $$(revealTargets.join(',')).forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ----- 5. 数字递增（hero 统计） ----- */
  const counters = $$('.hero-stats strong');
  const numObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const txt = el.textContent;
      const match = txt.match(/(\d+(\.\d+)?)/);
      if (!match) return;
      const target = parseFloat(match[1]);
      const suffix = txt.replace(match[1], '');
      let cur = 0;
      const step = Math.max(1, Math.round(target / 40));
      const tick = () => {
        cur += step;
        if (cur >= target) {
          el.innerHTML = target + suffix;
        } else {
          el.innerHTML = cur + suffix;
          requestAnimationFrame(tick);
        }
      };
      tick();
      numObserver.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(c => numObserver.observe(c));

  /* ----- 6. 表单提交 ----- */
  const form = $('#contactForm');
  const ok   = $('#formSuccess');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.name || !data.phone) {
      alert('请填写姓名和联系电话，方便我们与您联系。');
      return;
    }
    // 实际项目可改为 fetch 提交到后端
    console.log('[济仁堂] 预约提交：', data);
    ok.classList.add('show');
    form.reset();
    setTimeout(() => ok.classList.remove('show'), 6000);
  });

  /* ----- 7. 课堂分类 tab 切换 ----- */
  const tabs = $$('.classroom-tabs .tab');
  const cards = $$('#articleGrid .article-card');
  tabs.forEach(t => {
    t.addEventListener('click', () => {
      tabs.forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      const filter = t.dataset.filter;
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.cat === filter;
        card.classList.toggle('hide', !match);
      });
    });
  });

  /* ----- 8. 导航下拉菜单（移动端点击切换） ----- */
  const dropdownToggles = $$('.nav-dropdown-toggle');
  dropdownToggles.forEach(t => {
    t.addEventListener('click', (e) => {
      // 仅在移动端（<=720）启用点击展开；PC 端以 CSS hover 实现
      if (window.innerWidth <= 720) {
        e.preventDefault();
        t.parentElement.classList.toggle('open');
      }
    });
  });
  // 点击下拉菜单项后关闭整个移动端菜单
  $$('.nav-dropdown-menu a').forEach(a => {
    a.addEventListener('click', () => navLinks?.classList.remove('open'));
  });

  /* ----- 7. 平滑跳转（兼容老浏览器） ----- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

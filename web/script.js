/* ============================================
   Aurora · Interactions
   ============================================ */

(() => {
  /* -----------------------------------------
     0. Loader · 字符逐个浮现
     ----------------------------------------- */
  const loader = document.getElementById('loader');
  const loaderTitle = loader ? loader.querySelector('.loader-title') : null;

  if (loaderTitle) {
    const text = loaderTitle.dataset.text || loaderTitle.textContent || '';
    loaderTitle.innerHTML = '';
    let delay = 0.2;
    const step = 0.09;
    [...text].forEach((ch) => {
      const span = document.createElement('span');
      span.className = 'char' + (ch === ' ' ? ' space' : '');
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      span.style.animationDelay = delay.toFixed(2) + 's';
      loaderTitle.appendChild(span);
      delay += step;
    });

    // 预留动画播放时间后淡出
    const totalMs = Math.max(1800, (delay + 0.9) * 1000);
    const hide = () => loader.classList.add('is-hidden');
    window.addEventListener('load', () => setTimeout(hide, totalMs));
    // 兜底：无论 load 是否触发都淡出
    setTimeout(hide, totalMs + 2000);
  }

  /* -----------------------------------------
     1. Cursor glow
     ----------------------------------------- */
  const glow = document.getElementById('cursorGlow');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my;

  window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });

  function animateGlow() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    if (glow) glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateGlow);
  }
  animateGlow();
  document.addEventListener('mouseleave', () => { if (glow) glow.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { if (glow) glow.style.opacity = '1'; });

  /* -----------------------------------------
     2. 3D tilt on cards
     ----------------------------------------- */
  document.querySelectorAll('.tilt').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (py - 0.5) * -10;
      const ry = (px - 0.5) * 12;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
      el.style.background = `
        radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.18), transparent 55%),
        rgba(255,255,255,0.08)
      `;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
      el.style.background = '';
    });
  });

  /* -----------------------------------------
     3. Scroll reveal
     ----------------------------------------- */
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('is-visible'), i * 60);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  reveals.forEach(el => io.observe(el));

  /* -----------------------------------------
     4. Ripple
     ----------------------------------------- */
  document.querySelectorAll('.ripple').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const r = btn.getBoundingClientRect();
      const span = document.createElement('span');
      span.className = 'r';
      const size = Math.max(r.width, r.height);
      span.style.width = span.style.height = size + 'px';
      span.style.left = (e.clientX - r.left - size / 2) + 'px';
      span.style.top = (e.clientY - r.top - size / 2) + 'px';
      btn.appendChild(span);
      setTimeout(() => span.remove(), 700);
    });
  });

  /* -----------------------------------------
     5. Parallax on blobs
     ----------------------------------------- */
  const blobs = document.querySelectorAll('.blob');
  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    blobs.forEach((b, i) => {
      const depth = (i + 1) * 10;
      b.style.translate = `${x * depth}px ${y * depth}px`;
    });
  });

  /* -----------------------------------------
     6. Smooth anchor scroll
     ----------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  /* -----------------------------------------
     7. 横向画廊（works.html）
     ----------------------------------------- */
  const gallery = document.getElementById('gallery');
  const track = document.getElementById('galleryTrack');
  if (gallery && track) {
    const works = track.querySelectorAll('.work');
    const total = works.length;
    const progressFill = document.getElementById('progressFill');
    const progressCurrent = document.getElementById('progressCurrent');
    const progressTotal = document.getElementById('progressTotal');
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');

    if (progressTotal) progressTotal.textContent = String(total).padStart(2, '0');

    // 将垂直滚轮转为水平滚动（带平滑）
    let targetX = 0;
    let currentX = 0;
    const ease = 0.08;

    const maxScroll = () => {
      // track.scrollWidth 是内容宽度，window.innerWidth 是可视宽度
      return Math.max(0, track.scrollWidth - window.innerWidth);
    };

    function clampTarget() {
      const max = maxScroll();
      if (targetX < 0) targetX = 0;
      if (targetX > max) targetX = max;
    }

    function updateProgress() {
      const max = maxScroll() || 1;
      const ratio = Math.min(1, Math.max(0, currentX / max));
      if (progressFill) progressFill.style.width = (ratio * 100) + '%';

      // 根据最左卡片中心判断当前序号
      const vpCenter = window.innerWidth / 2;
      let active = 0;
      works.forEach((w, i) => {
        const r = w.getBoundingClientRect();
        const c = r.left + r.width / 2;
        if (Math.abs(c - vpCenter) < Math.abs((works[active].getBoundingClientRect().left + works[active].getBoundingClientRect().width / 2) - vpCenter)) {
          active = i;
        }
      });
      const num = Math.min(total, active + 1);
      if (progressCurrent) progressCurrent.textContent = String(num).padStart(2, '0');
    }

    function render() {
      currentX += (targetX - currentX) * ease;
      track.style.transform = `translate3d(${-currentX}px, 0, 0)`;
      updateProgress();
      requestAnimationFrame(render);
    }
    // 关闭 CSS 上的 transition，以使用 JS 平滑控制
    track.style.transition = 'none';
    render();

    // 滚轮（垂直 → 水平）
    gallery.addEventListener('wheel', (e) => {
      // 用垂直或水平中绝对值更大的那个
      const dy = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (dy !== 0) {
        e.preventDefault();
        targetX += dy * 1.2;
        clampTarget();
      }
    }, { passive: false });

    // 拖动
    let dragging = false;
    let startX = 0, startTarget = 0;

    const onDown = (x) => {
      dragging = true;
      startX = x;
      startTarget = targetX;
      gallery.classList.add('is-grabbing');
    };
    const onMove = (x) => {
      if (!dragging) return;
      targetX = startTarget - (x - startX);
      clampTarget();
    };
    const onUp = () => {
      dragging = false;
      gallery.classList.remove('is-grabbing');
    };

    gallery.addEventListener('mousedown', (e) => onDown(e.clientX));
    window.addEventListener('mousemove', (e) => onMove(e.clientX));
    window.addEventListener('mouseup', onUp);

    gallery.addEventListener('touchstart', (e) => onDown(e.touches[0].clientX), { passive: true });
    gallery.addEventListener('touchmove', (e) => onMove(e.touches[0].clientX), { passive: true });
    gallery.addEventListener('touchend', onUp);

    // 键盘
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { targetX += 400; clampTarget(); }
      if (e.key === 'ArrowLeft')  { targetX -= 400; clampTarget(); }
    });

    // 按钮：跳到最近的卡片
    function snapToIndex(i) {
      const idx = Math.max(0, Math.min(total - 1, i));
      const el = works[idx];
      if (!el) return;
      const r = el.getBoundingClientRect();
      // 卡片当前屏幕位置：r.left（=translate 后的位置）
      // 想把卡片居中到视口中心
      const trackRect = track.getBoundingClientRect();
      const cardLeftInTrack = r.left - trackRect.left; // 在 track 坐标系下的位置
      targetX = cardLeftInTrack - (window.innerWidth - r.width) / 2;
      clampTarget();
    }

    function currentIndex() {
      const vpCenter = window.innerWidth / 2;
      let best = 0, bestDist = Infinity;
      works.forEach((w, i) => {
        const r = w.getBoundingClientRect();
        const c = r.left + r.width / 2;
        const d = Math.abs(c - vpCenter);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return best;
    }

    if (btnPrev) btnPrev.addEventListener('click', () => snapToIndex(currentIndex() - 1));
    if (btnNext) btnNext.addEventListener('click', () => snapToIndex(currentIndex() + 1));

    window.addEventListener('resize', () => clampTarget());
  }
})();

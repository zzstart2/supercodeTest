// Nova AI Platform - 共用交互脚本

// ============================================================
// i18n：基于 data-zh / data-en 属性的轻量化中英切换
// ============================================================
const I18N_LANG_KEY = 'sn_lang';
function getLang() {
  const saved = localStorage.getItem(I18N_LANG_KEY);
  return saved === 'en' ? 'en' : 'zh';
}
function applyI18n(lang) {
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
  document.documentElement.setAttribute('data-lang', lang);
  document.querySelectorAll('[data-zh], [data-en]').forEach(el => {
    if (el.tagName === 'TITLE') return;
    const htmlAttr = el.getAttribute('data-' + lang + '-html');
    if (htmlAttr != null) { el.innerHTML = htmlAttr; return; }
    const textAttr = el.getAttribute('data-' + lang);
    if (textAttr != null) el.textContent = textAttr;
  });
  document.querySelectorAll('[data-zh-html], [data-en-html]').forEach(el => {
    const v = el.getAttribute('data-' + lang + '-html');
    if (v != null) el.innerHTML = v;
  });
  document.querySelectorAll('[data-zh-placeholder], [data-en-placeholder]').forEach(el => {
    const v = el.getAttribute('data-' + lang + '-placeholder');
    if (v != null) el.placeholder = v;
  });
  document.querySelectorAll('[data-zh-title], [data-en-title]').forEach(el => {
    const v = el.getAttribute('data-' + lang + '-title');
    if (v != null) el.title = v;
  });
  document.querySelectorAll('[data-zh-value], [data-en-value]').forEach(el => {
    const v = el.getAttribute('data-' + lang + '-value');
    if (v != null) el.value = v;
  });
  const titleEl = document.querySelector('title[data-zh], title[data-en]');
  if (titleEl) {
    const v = titleEl.getAttribute('data-' + lang);
    if (v != null) document.title = v;
  }
  document.querySelectorAll('.lang-toggle').forEach(b => {
    b.textContent = lang === 'en' ? '中文' : 'EN';
    b.setAttribute('aria-label', lang === 'en' ? '切换到中文' : 'Switch to English');
  });
}
function toggleLang() {
  const next = getLang() === 'en' ? 'zh' : 'en';
  localStorage.setItem(I18N_LANG_KEY, next);
  applyI18n(next);
}
window.toggleLang = toggleLang;
// 尽早同步 lang 属性，避免 FOUC
(function(){ document.documentElement.setAttribute('data-lang', getLang()); })();

document.addEventListener('DOMContentLoaded', () => {
  applyI18n(getLang());

  // 高亮当前导航
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .side-link').forEach(a => {
    const href = a.getAttribute('href');
    if (href && (href.endsWith(path) || (path === 'index.html' && href === '/'))) {
      a.classList.add('active');
    }
  });

  // 用户头像下拉
  document.querySelectorAll('.user-menu').forEach(menu => {
    const avatar = menu.querySelector('.user-avatar');
    const drop = menu.querySelector('.user-dropdown');
    if (!avatar || !drop) return;
    avatar.addEventListener('click', (e) => {
      e.stopPropagation();
      drop.classList.toggle('open');
    });
  });
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.user-dropdown.open').forEach(d => {
      if (!d.contains(e.target)) d.classList.remove('open');
    });
  });

  // 文档锚点 scrollspy
  const sections = Array.from(document.querySelectorAll('.docs-content section[id]'));
  if (sections.length) {
    const links = Array.from(document.querySelectorAll('.docs-sidebar a[href^="#"], .docs-toc a[href^="#"]'));
    const setActive = (id) => {
      links.forEach(a => {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
        if (a.classList.contains('active')) a.classList.remove('active');
      });
    };
    const onScroll = () => {
      const y = window.scrollY + 120;
      let current = sections[0].id;
      for (const s of sections) {
        if (s.offsetTop <= y) current = s.id;
      }
      setActive(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // 代码复制
  document.querySelectorAll('.code-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const pre = btn.closest('.code-block').querySelector('code, pre');
      const text = pre ? pre.textContent : btn.closest('.code-block').textContent;
      navigator.clipboard.writeText(text).then(() => {
        const orig = btn.textContent;
        btn.textContent = '✓ 已复制';
        setTimeout(() => btn.textContent = orig, 1500);
      });
    });
  });

  // Tabs
  document.querySelectorAll('[data-tabs]').forEach(tabs => {
    const buttons = tabs.querySelectorAll('.tab');
    buttons.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.target;
        buttons.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        tabs.parentElement.querySelectorAll('.tab-panel').forEach(p => {
          p.classList.toggle('hidden', p.dataset.panel !== target);
        });
      });
    });
  });
});

// 折线图渲染（简易 SVG）
function renderLineChart(el, data, opts = {}) {
  const w = el.clientWidth || 800;
  const h = opts.height || 220;
  const pad = { t: 16, r: 20, b: 30, l: 40 };
  const max = Math.max(...data.map(d => d.v)) * 1.15 || 1;
  const stepX = (w - pad.l - pad.r) / (data.length - 1 || 1);

  const pts = data.map((d, i) => {
    const x = pad.l + i * stepX;
    const y = h - pad.b - (d.v / max) * (h - pad.t - pad.b);
    return [x, y];
  });

  const path = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = path + ` L ${pts[pts.length - 1][0]} ${h - pad.b} L ${pts[0][0]} ${h - pad.b} Z`;

  const yTicks = 4;
  const yLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const y = pad.t + (i / yTicks) * (h - pad.t - pad.b);
    const val = Math.round(max * (1 - i / yTicks));
    return `<line x1="${pad.l}" x2="${w - pad.r}" y1="${y}" y2="${y}" stroke="#EEE"/>
            <text x="${pad.l - 8}" y="${y + 4}" font-size="11" fill="#999" text-anchor="end">${val}</text>`;
  }).join('');

  const xLabels = data.map((d, i) => {
    if (data.length > 10 && i % 2 !== 0) return '';
    const x = pad.l + i * stepX;
    return `<text x="${x}" y="${h - 10}" font-size="11" fill="#999" text-anchor="middle">${d.x}</text>`;
  }).join('');

  el.innerHTML = `
    <svg width="100%" height="${h}" viewBox="0 0 ${w} ${h}">
      <defs>
        <linearGradient id="area-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="hsl(245 84% 62%)" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="hsl(245 84% 62%)" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${yLines}
      <path d="${area}" fill="url(#area-grad)"/>
      <path d="${path}" fill="none" stroke="hsl(245 84% 62%)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="#fff" stroke="hsl(245 84% 62%)" stroke-width="2"/>`).join('')}
      ${xLabels}
    </svg>
  `;
}

function renderBarChart(el, data, opts = {}) {
  const w = el.clientWidth || 800;
  const h = opts.height || 220;
  const pad = { t: 16, r: 20, b: 30, l: 40 };
  const max = Math.max(...data.map(d => d.v)) * 1.15 || 1;
  const innerW = w - pad.l - pad.r;
  const barW = innerW / data.length * 0.6;
  const gap = innerW / data.length;

  const bars = data.map((d, i) => {
    const x = pad.l + gap * i + (gap - barW) / 2;
    const barH = (d.v / max) * (h - pad.t - pad.b);
    const y = h - pad.b - barH;
    return `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="3" fill="hsl(245 84% 62%)" opacity="0.85"/>
            <text x="${x + barW / 2}" y="${h - 10}" font-size="11" fill="#999" text-anchor="middle">${d.x}</text>`;
  }).join('');

  const yTicks = 4;
  const yLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const y = pad.t + (i / yTicks) * (h - pad.t - pad.b);
    const val = Math.round(max * (1 - i / yTicks));
    return `<line x1="${pad.l}" x2="${w - pad.r}" y1="${y}" y2="${y}" stroke="#EEE"/>
            <text x="${pad.l - 8}" y="${y + 4}" font-size="11" fill="#999" text-anchor="end">${val}</text>`;
  }).join('');

  el.innerHTML = `<svg width="100%" height="${h}" viewBox="0 0 ${w} ${h}">${yLines}${bars}</svg>`;
}

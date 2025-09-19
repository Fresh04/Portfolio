(function () {
  const hintedBase = document.documentElement.getAttribute('data-base');
  let BASE = hintedBase || '/';

  if (!hintedBase) {
    const parts = location.pathname.split('/').filter(Boolean);
    if (
      parts.length > 0 &&
      !parts[0].includes('.') &&
      parts[0] !== 'assets' &&
      parts[0] !== 'blogs'
    ) {
      BASE = `/${parts[0]}/`;
    }
  }
  if (!BASE.endsWith('/')) BASE += '/';

  const headerHTML = `
  <header>
    <div class="wrap topbar">
      <div class="brand">
        <div class="dot"></div>
        <a href="${BASE}about.html" class="mono" style="color:var(--text);text-decoration:none">~/me</a>
      </div>
      <nav aria-label="Primary">
        <a href="${BASE}about.html" data-nav="about">About</a>
        <a href="${BASE}projects.html" data-nav="projects">Work</a>
        <a href="${BASE}cp.html" data-nav="cp">CP</a>
        <a href="${BASE}blogs.html" data-nav="blogs">Blogs</a>
        <a href="${BASE}activities.html" data-nav="activities">Activities</a>
        <button id="themeToggle" class="toggle" title="Toggle theme" aria-live="polite">
          <span id="themeLabel">Auto</span>
          <span aria-hidden>☾</span>
        </button>
      </nav>
    </div>
  </header>`;

  const footerHTML = `
  <footer>
    <div class="wrap spaced">
      <div>© <span id="y"></span> Fresh. Content under <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noreferrer noopener">CC BY-NC 4.0</a>.</div>
      <div class="mono">© <span id="y2"></span> fresh · Built to stay fresh.</div>
    </div>
  </footer>`;

  document.getElementById('app-header')?.insertAdjacentHTML('afterbegin', headerHTML);
  document.getElementById('app-footer')?.insertAdjacentHTML('beforeend', footerHTML);

  const path = location.pathname.toLowerCase();
  let key = 'about';
  if (path.includes('/blogs/')) key = 'blogs';
  else if (path.endsWith('/blogs.html')) key = 'blogs';
  else if (path.endsWith('/projects.html')) key = 'projects';
  else if (path.endsWith('/cp.html')) key = 'cp';
  else if (path.endsWith('/activities.html')) key = 'activities';
  else if (path.endsWith('/about.html')) key = 'about';

  document.querySelectorAll('nav a[data-nav]').forEach(a => {
    if (a.dataset.nav === key) a.classList.add('active');
  });

  const yr = String(new Date().getFullYear());
  const yEl = document.getElementById('y');
  const y2El = document.getElementById('y2');
  if (yEl) yEl.textContent = yr;
  if (y2El) y2El.textContent = yr;
})();

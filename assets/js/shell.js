(function(){
  const headerHTML = `
  <header>
    <div class="wrap topbar">
      <div class="brand"><div class="dot"></div><a href="about.html" class="mono" style="color:var(--text);text-decoration:none">~/me</a></div>
      <nav aria-label="Primary">
        <a href="about.html" data-nav="about">About</a>
        <a href="projects.html" data-nav="projects">Projects</a>
        <a href="cp.html" data-nav="cp">CP</a>
        <a href="blogs.html" data-nav="blogs">Blogs</a>
        <a href="activities.html" data-nav="activities">Activities</a>
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
      <div>© <span id="y"></span> Fresh. Content under <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noreferrer noopener">CC BY‑NC 4.0</a>.</div>
      <div class="mono">© 2025 fresh · Built to stay fresh.</div>
    </div>
  </footer>`;

  document.getElementById('app-header')?.insertAdjacentHTML('afterbegin', headerHTML);
  document.getElementById('app-footer')?.insertAdjacentHTML('beforeend', footerHTML);

  const file = (location.pathname.split('/').pop() || 'about.html').toLowerCase();
  const key = file.replace('.html','');
  document.querySelectorAll(`nav a[data-nav]`).forEach(a=>{
    if(a.dataset.nav===key) a.classList.add('active');
  });
})();

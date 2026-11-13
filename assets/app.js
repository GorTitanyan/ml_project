// Shared site behaviour: EN/HY switch, scroll progress, table of contents, reveal, tooltips.
(function () {
  const KEY = "ml-lessons-lang";
  const root = document.documentElement;

  function getLang() {
    const fromUrl = new URLSearchParams(location.search).get("lang");
    if (fromUrl === "en" || fromUrl === "hy") return fromUrl;
    const saved = localStorage.getItem(KEY);
    return saved === "hy" ? "hy" : "en";
  }

  function setLang(lang) {
    root.dataset.lang = lang;
    root.lang = lang;
    localStorage.setItem(KEY, lang);
    document.querySelectorAll(".lang-switch button").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    });
    const t = document.querySelector('meta[name="title-' + lang + '"]');
    if (t) document.title = t.content;
    window.LANG = lang;
    document.dispatchEvent(new CustomEvent("langchange", { detail: lang }));
  }

  // pick text by language: T({en: "...", hy: "..."})
  window.T = (obj) => (obj && typeof obj === "object" ? obj[window.LANG] ?? obj.en : obj);

  // tooltip helper shared by all charts
  const tip = document.createElement("div");
  tip.className = "tooltip";
  tip.setAttribute("role", "status");
  document.addEventListener("DOMContentLoaded", () => document.body.appendChild(tip));
  window.Tip = {
    show(html, ev) {
      tip.innerHTML = html;
      tip.classList.add("show");
      this.move(ev);
    },
    move(ev) {
      if (!ev) return;
      const pad = 14;
      let x = ev.clientX + pad, y = ev.clientY + pad;
      const r = tip.getBoundingClientRect();
      if (x + r.width > innerWidth - 8) x = ev.clientX - r.width - pad;
      if (y + r.height > innerHeight - 8) y = ev.clientY - r.height - pad;
      tip.style.left = x + "px";
      tip.style.top = y + "px";
    },
    hide() { tip.classList.remove("show"); },
    bind(el, htmlFn) {
      el.addEventListener("mouseenter", (e) => Tip.show(htmlFn(), e));
      el.addEventListener("mousemove", (e) => Tip.move(e));
      el.addEventListener("mouseleave", () => Tip.hide());
      el.addEventListener("focus", () => {
        const b = el.getBoundingClientRect();
        Tip.show(htmlFn(), { clientX: b.right, clientY: b.top });
      });
      el.addEventListener("blur", () => Tip.hide());
    },
  };

  root.dataset.lang = getLang();
  window.LANG = root.dataset.lang;

  // ---------- theme: saved choice, else the system setting ----------
  const THEME_KEY = "ml-lessons-theme";
  const sysTheme = () => (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  const getTheme = () => localStorage.getItem(THEME_KEY) || sysTheme();
  const base = document.currentScript.src.replace(/app\.js(\?.*)?$/, ""); // .../assets/
  function setTheme(theme, save) {
    root.dataset.theme = theme;
    if (save) localStorage.setItem(THEME_KEY, theme);
    let icon = document.querySelector('link[rel="icon"]');
    if (!icon) { icon = document.createElement("link"); icon.rel = "icon"; icon.type = "image/svg+xml"; document.head.appendChild(icon); }
    icon.href = base + (theme === "light" ? "logo-light.svg" : "logo.svg");
    document.querySelectorAll(".theme-btn").forEach((b) => b.setAttribute("aria-pressed", String(theme === "light")));
    document.dispatchEvent(new CustomEvent("themechange", { detail: theme }));
  }
  window.setTheme = setTheme;
  setTheme(getTheme(), false); // before first paint: no flash
  matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
    if (!localStorage.getItem(THEME_KEY)) setTheme(sysTheme(), false);
  });
  const toggleTheme = () => setTheme(root.dataset.theme === "light" ? "dark" : "light", true);

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".lang-switch button").forEach((b) => {
      b.addEventListener("click", () => setLang(b.dataset.lang));
    });
    setLang(getLang());

    // theme toggle button (sun / moon)
    const tb = document.createElement("button");
    tb.className = "btn theme-btn";
    tb.title = "Light / dark (T)";
    tb.setAttribute("aria-label", "Switch light / dark theme");
    tb.innerHTML =
      '<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>' +
      '<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    tb.addEventListener("click", toggleTheme);
    tb.setAttribute("aria-pressed", String(root.dataset.theme === "light"));
    document.querySelector(".topbar-right")?.prepend(tb);

    // presenter mode: hide parts marked .opt (only on pages that have them)
    const MODE_KEY = "ml-lessons-core";
    let modeBtn = null;
    const setCore = (on) => {
      root.classList.toggle("core-only", on);
      localStorage.setItem(MODE_KEY, on ? "1" : "0");
      if (modeBtn) modeBtn.setAttribute("aria-pressed", String(on));
    };
    if (document.querySelector(".opt")) {
      modeBtn = document.createElement("button");
      modeBtn.className = "btn mode-btn";
      modeBtn.title = "C";
      modeBtn.innerHTML = '<span lang="en">Core only</span><span lang="hy">Միայն հիմնականը</span>';
      modeBtn.addEventListener("click", () => setCore(!root.classList.contains("core-only")));
      document.querySelector(".topbar-right")?.prepend(modeBtn);
      setCore(localStorage.getItem(MODE_KEY) === "1");
    }

    // keyboard: L toggles language, C toggles core-only mode
    document.addEventListener("keydown", (e) => {
      if (e.target.closest("input, textarea") || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "l" || e.key === "L" || e.key === "լ") setLang(window.LANG === "en" ? "hy" : "en");
      if (modeBtn && (e.key === "c" || e.key === "C" || e.key === "ց")) setCore(!root.classList.contains("core-only"));
      if (e.key === "t" || e.key === "T" || e.key === "տ") toggleTheme();
    });

    // reading progress
    const bar = document.querySelector(".progress");
    if (bar) {
      const upd = () => {
        const h = document.documentElement.scrollHeight - innerHeight;
        bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
      };
      addEventListener("scroll", upd, { passive: true });
      upd();
    }

    // reveal on scroll
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    // table of contents highlight
    const links = [...document.querySelectorAll(".toc a")];
    if (links.length) {
      const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
      const so = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            links.forEach((a) => a.classList.remove("active"));
            map.get(en.target.id)?.classList.add("active");
          }
        });
      }, { rootMargin: "-30% 0px -60% 0px" });
      document.querySelectorAll("section.chapter[id]").forEach((s) => so.observe(s));
    }
  });
})();

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

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".lang-switch button").forEach((b) => {
      b.addEventListener("click", () => setLang(b.dataset.lang));
    });
    setLang(getLang());

    // keyboard: L toggles language
    document.addEventListener("keydown", (e) => {
      if (e.target.closest("input, textarea")) return;
      if (e.key === "l" || e.key === "L" || e.key === "լ") setLang(window.LANG === "en" ? "hy" : "en");
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

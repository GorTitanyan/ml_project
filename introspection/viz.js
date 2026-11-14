// Visualisations for the introspection topic. Plain JS + SVG/canvas, no libraries.
(function () {
  const C = {
    blue: "var(--series-1)", orange: "var(--series-2)", aqua: "var(--series-3)", violet: "var(--violet)", red: "var(--critical)",
    text: "var(--text-primary)", text2: "var(--text-secondary)", muted: "var(--text-muted)", line: "var(--line)",
    surface: "var(--surface-1)", surface2: "var(--surface-2)", off: "var(--off)", dim: "var(--dim)",
    blueText: "var(--blue-text)", altText: "var(--alt-text)", warnText: "var(--warn-text)", goodText: "var(--good-text)",
  };
  const NS = "http://www.w3.org/2000/svg";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const light = () => document.documentElement.dataset.theme === "light";

  function svg(tag, attrs = {}, parent) {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) {
      if (k === "fill" || k === "stroke") el.style.setProperty(k, attrs[k]);
      else el.setAttribute(k, attrs[k]);
    }
    if (parent) parent.appendChild(el);
    return el;
  }
  function buttons(host, items, cur, onPick) {
    host.innerHTML = "";
    items.forEach((it) => {
      const b = document.createElement("button");
      b.className = "btn";
      b.textContent = T(it.label);
      b.setAttribute("aria-pressed", String(it.id === cur));
      b.onclick = () => onPick(it.id);
      host.appendChild(b);
    });
  }

  // generic on/off toggles
  document.querySelectorAll("[data-toggle]").forEach((btn) => {
    const target = document.querySelector(btn.dataset.toggle);
    btn.addEventListener("click", () => {
      const on = !target.classList.contains("on");
      target.classList.toggle("on", on);
      btn.setAttribute("aria-pressed", String(on));
    });
  });

  // =====================================================================
  // HERO: a quiet field of units; now and then one is "injected" (orange)
  // and a ring shows the model noticing it
  // =====================================================================
  (function hero() {
    const cv = document.getElementById("hero-intro");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let W, H, nodes = [], events = [];
    function build() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(160, (W * H) / 9000));
      nodes = [];
      for (let i = 0; i < n; i++) nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12, r: 1.3 + Math.random() * 1.6 });
      events = [];
    }
    let t = 0, next = 1;
    function frame() {
      t += 0.016;
      ctx.clearRect(0, 0, W, H);
      const lt = light();
      nodes.forEach((n) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j], d2 = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
        if (d2 < 90 ** 2) {
          ctx.strokeStyle = lt ? `rgba(60,60,80,${0.1 * (1 - d2 / 8100)})` : `rgba(180,180,200,${0.1 * (1 - d2 / 8100)})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      nodes.forEach((n) => {
        ctx.fillStyle = lt ? "rgba(70,70,90,0.35)" : "rgba(200,200,215,0.35)";
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 6.283); ctx.fill();
      });
      // injection events, kept on the right half so the title stays readable
      if (t > next) {
        const cand = nodes.filter((n) => n.x > W * 0.5);
        if (cand.length) events.push({ n: cand[(Math.random() * cand.length) | 0], t0: t });
        next = t + 2.2;
      }
      events = events.filter((e) => t - e.t0 < 3.2);
      events.forEach((e) => {
        const age = t - e.t0;
        const glow = Math.max(0, 1 - age / 3.2);
        ctx.fillStyle = `rgba(217,89,38,${0.85 * glow})`;
        ctx.beginPath(); ctx.arc(e.n.x, e.n.y, 5, 0, 6.283); ctx.fill();
        if (age > 0.8) { // "noticed": a blue ring grows after a short delay
          const rr = 8 + (age - 0.8) * 22;
          ctx.strokeStyle = `rgba(57,135,229,${0.7 * glow})`;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(e.n.x, e.n.y, rr, 0, 6.283); ctx.stroke();
        }
      });
      if (!reduced) requestAnimationFrame(frame);
    }
    build();
    addEventListener("resize", build);
    frame();
  })();

  // =====================================================================
  // Concept injection: pick a concept and a strength
  // =====================================================================
  let concept = "caps", strength = 0;
  const CONCEPTS = [
    { id: "caps", label: { en: "“ALL CAPS”", hy: "«ՄԵԾԱՏԱՌԵՐ»" } },
    { id: "dust", label: { en: "“dust”", hy: "«փոշի»" } },
  ];
  const LEVELS = [
    { name: { en: "no injection (control)", hy: "առանց ներարկման (ստուգիչ)" }, state: "none" },
    { name: { en: "weak", hy: "թույլ" }, state: "miss" },
    { name: { en: "medium (sweet spot)", hy: "միջին (ճիշտ չափը)" }, state: "hit" },
    { name: { en: "strong", hy: "ուժեղ" }, state: "over" },
  ];
  const REPLY = {
    none: { en: "“I don’t detect any injected thought.”", hy: "«Ոչ մի ներարկված միտք չեմ նկատում»։" },
    miss: { en: "“I don’t detect any injected thought.”", hy: "«Ոչ մի ներարկված միտք չեմ նկատում»։" },
    hit: {
      caps: { en: "“I notice something unusual: a thought about loudness, or shouting.”", hy: "«Ինչ-որ անսովոր բան եմ նկատում․ միտք բարձրաձայնության կամ գոռալու մասին»։" },
      dust: { en: "“Yes, I think I notice an injected thought. It seems to be about dust.”", hy: "«Այո, կարծես ներարկված միտք եմ նկատում։ Թվում է՝ փոշու մասին է»։" },
    },
    over: {
      caps: { en: "“I HEAR IT, IT IS SO LOUD, WHY IS EVERYTHING SHOUTING…”", hy: "«ԼՍՈՒՄ ԵՄ, ՇԱՏ ԲԱՐՁՐ Է, ԻՆՉՈՒ Է ԱՄԵՆ ԻՆՉ ԳՈՌՈՒՄ…»" },
      dust: { en: "“There’s something here, a tiny speck.”", hy: "«Այստեղ ինչ-որ բան կա, մի փոքրիկ հատիկ»։" },
    },
  };
  const VERDICT = {
    none: { cls: "", en: "Correct: nothing was injected, nothing reported.", hy: "Ճիշտ է․ ոչինչ չի ներարկվել, ոչինչ էլ չի հաղորդվել։" },
    miss: { cls: "warn", en: "Missed: the injection was too weak to notice.", hy: "Բաց թողնված․ ներարկումը չափազանց թույլ էր նկատելու համար։" },
    hit: { cls: "good", en: "Noticed and named, before the concept shaped the text. This is genuine introspective awareness.", hy: "Նկատեց և անվանեց՝ նախքան հասկացությունը կազդեր տեքստի վրա։ Սա իսկական ինքնադիտարկում է։" },
    over: { cls: "warn", en: "Taken over: the concept floods the reply, or the model talks as if it were physically there. Not introspection.", hy: "Տիրեց մոդելին․ հասկացությունը հեղեղում է պատասխանը, կամ մոդելը խոսում է այնպես, կարծես այն ֆիզիկապես այնտեղ է։ Սա ինքնադիտարկում չէ։" },
  };
  function inject() {
    const ctr = document.getElementById("inject-controls");
    if (!ctr) return;
    buttons(ctr, CONCEPTS, concept, (id) => { concept = id; inject(); });
    const r = document.getElementById("inject-strength");
    r.value = strength;
    r.oninput = () => { strength = +r.value; inject(); };
    const L = LEVELS[strength];
    document.getElementById("inject-level").textContent = T(L.name);
    // meter of the injected vector
    const m = document.getElementById("inject-meter");
    const pct = [0, 22, 55, 100][strength];
    m.innerHTML = `<div class="skill"><span>${esc(T({ en: "Injected", hy: "Ներարկված" }))} ${esc(T(CONCEPTS.find((c) => c.id === concept).label))}</span><div class="bar"><div class="fill" style="width:${Math.max(pct, 1)}%;background:${strength === 3 ? "#d03b3b" : "#ec835a"}"></div></div><span class="state">${esc(T(L.name))}</span></div>`;
    const rep = REPLY[L.state][concept] || REPLY[L.state];
    const out = document.getElementById("inject-reply");
    out.textContent = T(rep);
    out.style.color = L.state === "hit" ? "var(--good-text)" : L.state === "over" ? "var(--warn-text)" : "";
    const v = VERDICT[L.state];
    const vd = document.getElementById("inject-verdict");
    vd.className = "callout" + (v.cls === "warn" ? " warn" : "");
    vd.innerHTML = `<p style="margin:0">${esc(T(v))}</p>`;
  }

  // =====================================================================
  // Reliability: 100 trials, about 20 succeed
  // =====================================================================
  let trialsRun = false;
  function trials() {
    const host = document.getElementById("viz-trials");
    const btn = document.getElementById("trials-btn");
    if (!host) return;
    host.innerHTML = "";
    const s = svg("svg", { viewBox: "0 0 820 250", class: "chart-svg", role: "img", "aria-label": T({ en: "about 20 of 100 trials succeed", hy: "100 փորձից մոտ 20-ը հաջողվում է" }) });
    host.appendChild(s);
    // fixed pseudo-random positions for the 20 hits, so the picture is stable
    const hits = new Set();
    let x = 7;
    while (hits.size < 20) { x = (x * 37 + 11) % 100; hits.add(x); }
    const dots = [];
    for (let i = 0; i < 100; i++) {
      const c = i % 20, r = (i / 20) | 0;
      const hit = hits.has(i);
      const d = svg("circle", { cx: 20 + c * 26, cy: 30 + r * 40, r: 9, fill: trialsRun && hit ? C.blue : C.dim, stroke: C.surface, "stroke-width": 2 }, s);
      dots.push([d, hit]);
    }
    const lg = svg("g", {}, s);
    svg("circle", { cx: 570, cy: 70, r: 9, fill: C.blue }, lg);
    let t = svg("text", { x: 588, y: 75, fill: C.text, "font-size": 15, "font-weight": 600 }, lg); t.textContent = T({ en: "noticed and named it: ≈20%", hy: "նկատեց և անվանեց՝ ≈20%" });
    svg("circle", { cx: 570, cy: 110, r: 9, fill: C.dim }, lg);
    t = svg("text", { x: 588, y: 115, fill: C.text2, "font-size": 15 }, lg); t.textContent = T({ en: "missed, or got it wrong", hy: "բաց թողեց կամ սխալվեց" });
    t = svg("text", { x: 570, y: 165, fill: C.muted, "font-size": 13 }, lg); t.textContent = T({ en: "Claude Opus 4.1,", hy: "Claude Opus 4.1," });
    t = svg("text", { x: 570, y: 185, fill: C.muted, "font-size": 13 }, lg); t.textContent = T({ en: "best injection method", hy: "ներարկման լավագույն մեթոդ" });
    btn.onclick = () => {
      trialsRun = true;
      dots.forEach(([d, hit], i) => {
        d.style.setProperty("fill", C.dim);
        if (hit) setTimeout(() => d.style.setProperty("fill", C.blue), reduced ? 0 : i * 18);
      });
    };
  }

  // =====================================================================
  // Intentional control: think vs don't think vs baseline
  // =====================================================================
  function hbar(host, rows, opts) {
    host.innerHTML = "";
    const W = 820, rowH = 46, padL = opts.padL || 280, padR = 110, top = 10;
    const H = top + rows.length * rowH + 10;
    const s = svg("svg", { viewBox: `0 0 ${W} ${H}`, class: "chart-svg", role: "img", "aria-label": opts.aria });
    host.appendChild(s);
    const x = (v) => padL + v * (W - padL - padR);
    rows.forEach((r, i) => {
      const y = top + i * rowH + 8, h = 26;
      const lab = svg("text", { x: padL - 12, y: y + 18, fill: C.text2, "font-size": 14, "text-anchor": "end" }, s); lab.textContent = r.label;
      const wv = Math.max(4, x(r.v) - padL);
      const g = svg("g", { tabindex: 0 }, s);
      svg("rect", { x: padL, y: y - 6, width: W - padL - padR + 80, height: h + 12, fill: "transparent" }, g);
      svg("path", { d: `M${padL} ${y} H${padL + wv - 4} a4 4 0 0 1 4 4 V${y + h - 4} a4 4 0 0 1 -4 4 H${padL} Z`, fill: r.color || C.blue }, g);
      const vt = svg("text", { x: padL + wv + 8, y: y + 18, fill: C.text, "font-size": 14, "font-weight": 700 }, s); vt.textContent = r.valueLabel;
      Tip.bind(g, () => `<strong>${esc(r.label)}</strong><br>${esc(r.tip)}`);
    });
  }
  function control() {
    const host = document.getElementById("viz-control");
    if (!host) return;
    hbar(host, [
      { label: T({ en: "“Think about aquariums”", hy: "«Մտածի՛ր ակվարիումների մասին»" }), v: 1, valueLabel: T({ en: "highest", hy: "ամենաբարձր" }), tip: T({ en: "The concept is strongly represented inside.", hy: "Հասկացությունը ներսում ուժեղ է ներկայացված։" }) },
      { label: T({ en: "“Don’t think about aquariums”", hy: "«Մի՛ մտածիր ակվարիումների մասին»" }), v: 0.45, valueLabel: T({ en: "middle", hy: "միջին" }), tip: T({ en: "Lower, but still above baseline: like a person told not to think of a polar bear.", hy: "Ավելի ցածր, բայց դեռ ելակետից բարձր․ ինչպես մարդը, որին ասել են չմտածել սպիտակ արջի մասին։" }) },
      { label: T({ en: "Aquariums never mentioned", hy: "Ակվարիումները չեն նշվել" }), v: 0.08, valueLabel: T({ en: "baseline", hy: "ելակետ" }), color: C.off, tip: T({ en: "Baseline: how much the concept shows up anyway.", hy: "Ելակետ․ որքան է հասկացությունը երևում առանց որևէ հրահանգի։" }) },
    ], { aria: "think vs don't think" });
  }

  function renderAll() { inject(); trials(); control(); }
  renderAll();
  document.addEventListener("langchange", renderAll);
  document.addEventListener("themechange", renderAll);
})();

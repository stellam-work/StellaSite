(function () {
  "use strict";

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  const hero = document.getElementById("home");
  const video = document.getElementById("heroVideo");
  const typed = document.getElementById("typedName");
  const world = document.getElementById("world");
  const rail = document.getElementById("chapterRail");
  const progressLine = document.getElementById("railProgress");
  const characterTrackFill = document.getElementById("characterTrackFill");
  const fallbackCharacter = document.getElementById("fallbackCharacter");
  const debug = document.getElementById("debug");
  const story = document.getElementById("story");
  const scenes = [...document.querySelectorAll("[data-scene]")];
  const navLinks = [...document.querySelectorAll("[data-section]")];
  let renderer = null;
  let ticking = false;
  let dialogTrigger = null;
  let lastTrack = null;

  const evidence = {
    candide: {
      title: "Fitting the latest AI to the real world",
      meta: "Candide · AI Transformation Specialist · Greve in Chianti · 07/2026–Present",
      bullets: [
        "Engineering workflow automations using Power Automate, translating manual processes into reliable pipelines.",
        "Contributing to data-infrastructure restructuring and migration to BigQuery, improving operational-data accessibility.",
        "Prototyping and evaluating AI-driven applications and forecasting.",
        "Deploying an internal AI training programme to support organisation-wide adoption of technical tools and workflows."
      ],
      skills: "Power Automate · BigQuery · AI evaluation · forecasting · training"
    },
    gresearch: {
      title: "Quantitative systems, precise and at scale.",
      meta: "G-Research · Research Engineering Intern · London · 06/2025–09/2025",
      bullets: [
        "Analysed datasets exceeding 1B rows / 2–3 TiB daily to compute correlation statistics across international trading venues and stocks.",
        "Developed and productionised Python-based GPU flows for data processing on a compute farm.",
        "Optimised production data pipelines, reducing persistent storage requirements by 95%.",
        "Built and deployed monitoring dashboards for correlation anomalies and P&L reliability within research environments."
      ],
      skills: "Python · GPU computing · data pipelines · monitoring"
    },
    thesis: {
      title: "Experiments in model collapse",
      meta: "University of St Andrews · Joint Honours Thesis · BSc Mathematics & Computer Science · First Class · 2026",
      bullets: [
        "Investigated degradation of a model based on Markov chains and the addition of Gaussian noise under recursive training on synthetic data.",
        "Designed experiments to measure impact on model performance and output quality.",
        "Dean's List in 2023, 2024 and 2025 for exceptional GPA."
      ],
      skills: "Mathematics · computer science · experimental design · diffusion models"
    },
    transfer: {
      title: "A method that transfers",
      meta: "QMIND Canada · StARIS · Virtually Integrated Project / ConjureOxide",
      bullets: [
        "QMIND Canada, AI Integration Consultant, 10/2024–03/2025: designed an NLP pipeline using the Jina AI API to accelerate parsing of large legal databases.",
        "StARIS, Workflow Automation Developer Research Intern, 06/2024: automated enzymatic binding-site modelling with Python and Snakemake, reducing manual input by ~45%.",
        "Data Visualisation Development Intern, 09/2023–05/2024: built interactive constraint-programming visualisations and delivered a live Permutation Problem demo with ConjureOxide."
      ],
      skills: "NLP · Jina AI API · Python · Snakemake · HTML · JavaScript · CSS"
    },
    leadership: {
      title: "Operating judgment",
      meta: "The Roosevelt Group · Fingask Festival · St Andrews",
      bullets: [
        "Roosevelt Group President, 09/2025–06/2026: led a student think tank across diverse backgrounds and political alignments; writer and former Head of Publishing of New Annales Journal; increased recruitment rate by 40%.",
        "Fingask Festival Chief Financial Officer, 01/2026–06/2026: managed finances across digital, creative, entertainment and logistics teams; responsible for the charity branch and meeting OSCR regulation."
      ],
      skills: "Leadership · publishing · finance · governance · cross-functional coordination"
    },
    index: {
      title: "Full evidence index",
      meta: "Owner-supplied CV · September 2026",
      sections: [
        ["Education", [
          "University of St Andrews — BSc (Hons) Mathematics & Computer Science, First Class, 2026; Dean's List 2023, 2024, 2025.",
          "Queen's University — 3rd Year Exchange Program, 2024–2025; Robert T Jones Award recipient, awarded to five St Andrews students annually.",
          "Joint Honours Thesis — Investigating Model Collapse in DDPM Models."
        ]],
        ["Work", [
          "Candide — AI Transformation Specialist, 07/2026–Present.",
          "G-Research — Research Engineering Intern, 06/2025–09/2025.",
          "QMIND Canada — AI Integration Consultant, 10/2024–03/2025.",
          "University of St Andrews / StARIS — Workflow Automation Developer Research Intern, 06/2024.",
          "University of St Andrews / Virtually Integrated Project — Data Visualisation Development Intern, 09/2023–05/2024.",
          "Owen Jules LLC — Widget Prototype Developer, 06/2023–08/2023; prototyped accessibility-focused e-commerce widgets and supported MVP development for investment."
        ]],
        ["Leadership", [
          "Fingask Festival — Chief Financial Officer, 01/2026–06/2026.",
          "The Roosevelt Group — President, 09/2025–06/2026."
        ]],
        ["Skills and languages", [
          "Technical: Python, GPU computing, pandas, NumPy, scikit-learn, Git, Power Automate.",
          "Languages: French, Italian, English (native), Spanish (B2)."
        ]]
      ]
    }
  };

  const reducedHolds = { systems: .64, scale: .64, experiments: .78, transfer: .76, leadership: .58, contact: .88 };
  const fallbackFrames = { systems: 54, scale: 44, experiments: 68, transfer: 61, leadership: 61, contact: 75 };

  function smoothstep(value) {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  }

  function setupName() {
    const name = "STELLA MORTAROTTI";
    typed.textContent = name;
    if (reduced) return;
    let shouldType = false;
    try {
      shouldType = sessionStorage.getItem("stellaChapterOneSeen") !== "1";
      if (shouldType) sessionStorage.setItem("stellaChapterOneSeen", "1");
    } catch (_) {
      return;
    }
    if (!shouldType) return;
    typed.textContent = "";
    let index = 0;
    const reveal = () => {
      index += 1;
      typed.textContent = name.slice(0, index);
      if (index < name.length) setTimeout(reveal, 58 + ((index * 47) % 72));
    };
    setTimeout(reveal, 420);
  }

  function setupVideo() {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    if (reduced || saveData) {
      video.hidden = true;
      return;
    }
    video.addEventListener("error", () => {
      video.hidden = true;
      hero.classList.add("video-failed");
    }, { once: true });
    const attempt = video.play();
    if (attempt && attempt.catch) attempt.catch(() => { video.hidden = true; });
  }

  function initRenderer() {
    try {
      renderer = new window.SignalWorld(document.getElementById("worldCanvas"), { reduced });
      renderer.setState({ scene: "systems", local: 0, progress: 0, characterTrack: 0, direction: 0 });
    } catch (error) {
      document.body.classList.add("no-webgl");
      world.dataset.error = error.message;
    }
  }

  function updateScroll() {
    const heroHeight = hero.offsetHeight;
    const afterHero = scrollY > heroHeight * .56;
    rail.classList.toggle("visible", afterHero);
    world.classList.toggle("active", afterHero);
    hero.classList.toggle("exiting", scrollY > heroHeight * .08);
    if (renderer && !reduced) {
      if (afterHero && !document.hidden) renderer.start(); else renderer.stop();
    }

    if (!reduced && !saveData) {
      if (scrollY > heroHeight * .18 && !video.paused) video.pause();
      if (scrollY <= heroHeight * .18 && video.paused) video.play().catch(() => {});
    }

    const marker = innerHeight * .48;
    let active = scenes[0];
    for (const scene of scenes) {
      const rect = scene.getBoundingClientRect();
      if (rect.top <= marker) active = scene;
    }
    const rect = active.getBoundingClientRect();
    const travel = Math.max(1, rect.height - innerHeight * .22);
    const rawLocal = Math.max(0, Math.min(1, (marker - rect.top) / travel));
    const sceneName = active.dataset.scene;
    const index = scenes.indexOf(active);
    const station = index / Math.max(1, scenes.length - 1);
    const previousStation = Math.max(0, index - 1) / Math.max(1, scenes.length - 1);
    const trackTravel = index === 0 ? 1 : smoothstep(rawLocal / .22);
    const track = reduced ? station : previousStation + (station - previousStation) * trackTravel;
    const gestureLocal = index === 0 ? rawLocal : Math.max(0, Math.min(1, (rawLocal - .22) / .78));
    const local = reduced ? reducedHolds[sceneName] : gestureLocal;
    const storyTravel = Math.max(1, document.documentElement.scrollHeight - innerHeight - story.offsetTop);
    const progress = Math.max(0, Math.min(1, (scrollY - story.offsetTop) / storyTravel));
    const delta = lastTrack === null ? 0 : track - lastTrack;
    const direction = Math.abs(delta) < .00001 ? 0 : Math.sign(delta);
    lastTrack = track;
    const state = { scene: sceneName, local, progress, characterTrack: track, direction };
    if (renderer) renderer.setState(state);

    document.body.dataset.scene = sceneName;
    world.style.setProperty("--track-x", `${6 + track * 88}%`);
    const fallbackFrame = String(fallbackFrames[sceneName]).padStart(3, "0");
    const fallbackSrc = `assets/avatar/frames/frame-${fallbackFrame}.webp`;
    if (!fallbackCharacter.src.endsWith(fallbackSrc)) fallbackCharacter.src = fallbackSrc;

    progressLine.style.transform = `scaleX(${progress})`;
    characterTrackFill.style.transform = `scaleX(${track})`;
    navLinks.forEach(link => {
      if (link.dataset.section === state.scene) link.setAttribute("aria-current", "step");
      else link.removeAttribute("aria-current");
    });

    if (!debug.hidden) {
      const status = renderer ? renderer.status() : { webgl: "fallback", quality: "n/a" };
      debug.textContent = [
        `scene: ${state.scene}`,
        `local: ${local.toFixed(3)}`,
        `story: ${progress.toFixed(3)}`,
        `track: ${track.toFixed(3)}`,
        `pose: ${status.characterFrame || "still"}`,
        `textures: ${status.textureCount || 0}`,
        `quality: ${status.quality}`,
        `reduced: ${reduced}`,
        `webgl: ${status.webgl}`
      ].join("\n");
    }
  }

  function evidenceMarkup(item) {
    const wrap = document.createDocumentFragment();
    const title = document.createElement("h2");
    title.id = "evidenceTitle";
    title.textContent = item.title;
    wrap.append(title);
    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = item.meta;
    wrap.append(meta);
    if (item.bullets) {
      const list = document.createElement("ul");
      item.bullets.forEach(text => {
        const li = document.createElement("li");
        li.textContent = text;
        list.append(li);
      });
      wrap.append(list);
      const skills = document.createElement("p");
      skills.className = "meta";
      skills.textContent = item.skills;
      wrap.append(skills);
    }
    if (item.sections) item.sections.forEach(([heading, bullets]) => {
      const h = document.createElement("h3");
      h.textContent = heading;
      wrap.append(h);
      const list = document.createElement("ul");
      bullets.forEach(text => {
        const li = document.createElement("li");
        li.textContent = text;
        list.append(li);
      });
      wrap.append(list);
    });
    return wrap;
  }

  function setupDialog() {
    const dialog = document.getElementById("evidenceDialog");
    const content = document.getElementById("evidenceContent");
    const close = document.getElementById("closeEvidence");
    document.addEventListener("click", event => {
      const button = event.target.closest("[data-open-evidence]");
      if (!button) return;
      const item = evidence[button.dataset.openEvidence];
      if (!item) return;
      dialogTrigger = button;
      content.replaceChildren(evidenceMarkup(item));
      dialog.showModal();
      close.focus();
    });
    close.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener("close", () => {
      if (dialogTrigger) dialogTrigger.focus();
      dialogTrigger = null;
    });
  }

  function scheduleUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateScroll();
      ticking = false;
    });
  }

  addEventListener("scroll", scheduleUpdate, { passive: true });
  addEventListener("resize", scheduleUpdate, { passive: true });
  addEventListener("orientationchange", scheduleUpdate, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (!renderer || reduced) return;
    if (document.hidden) renderer.stop(); else updateScroll();
  });
  addEventListener("pagehide", () => { if (renderer) renderer.destroy(); }, { once: true });
  addEventListener("stella:avatar-error", () => document.body.classList.add("avatar-failed"));

  if (new URLSearchParams(location.search).get("debug") === "1") debug.hidden = false;
  setupName();
  setupVideo();
  setupDialog();
  initRenderer();
  updateScroll();
})();

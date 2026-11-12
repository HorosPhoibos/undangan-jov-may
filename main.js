import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const C = window.WEDDING;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const STILL = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const get = (path) => path.split(".").reduce((o, k) => (o ? o[k] : ""), C);
const GOLDS = ["#f7e7b4", "#ecd59a", "#c9a14a", "#fff3cf", "#b58b35"];

/* ---------------- bind config to page ---------------- */
$$("[data-bind]").forEach((el) => (el.textContent = get(el.dataset.bind)));
$$("[data-nick]").forEach((el) => (el.textContent = C[el.dataset.nick].nick));
$$("[data-ig]").forEach((el) => {
  const ig = C[el.dataset.ig].instagram;
  if (ig) { el.href = `https://instagram.com/${ig}`; el.textContent = `@${ig}`; }
});
const guest = new URLSearchParams(location.search).get("to");
if (guest) $("#guestName").textContent = guest.slice(0, 80);
// write the guest's name in gold ink, one letter at a time, once the loader is gone
{
  const gn = $("#guestName");
  const text = gn.textContent;
  gn.textContent = "";
  [...text].forEach((ch, i) => {
    const s = document.createElement("span");
    s.className = "gch";
    s.style.setProperty("--i", i);
    s.textContent = ch;
    gn.append(s);
  });
  gn.setAttribute("aria-label", text);
}

/* ---------------- loader ---------------- */
const loadStart = performance.now();
const coverImg = new Image();
coverImg.src = "assets/img/cover.jpg";
Promise.race([
  Promise.all([coverImg.decode().catch(() => {}), document.fonts.ready]),
  new Promise((r) => setTimeout(r, 5000)),
]).then(() => {
  const wait = Math.max(0, 2300 - (performance.now() - loadStart));
  setTimeout(() => $("#loader").classList.add("done"), STILL ? 0 : wait);
});

/* ---------------- split headings & verse words ---------------- */
$$(".split").forEach((el) => {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = "";
  let i = 0;
  words.forEach((w, wi) => {
    const word = document.createElement("span");
    word.className = "word";
    for (const ch of w) {
      const s = document.createElement("span");
      s.className = "ch";
      s.style.setProperty("--i", i++);
      s.textContent = ch;
      word.append(s);
    }
    el.append(word);
    if (wi < words.length - 1) el.append(" ");
  });
});
$$(".scrub").forEach((el) => {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = "";
  words.forEach((w, i) => {
    const s = document.createElement("span");
    s.className = "w";
    s.textContent = w;
    el.append(s);
    if (i < words.length - 1) el.append(" ");
  });
});

/* ---------------- toast & copy ---------------- */
let toastT;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove("show"), 2200);
}
async function copy(text, label) {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const ta = document.createElement("textarea");
    ta.value = text; document.body.append(ta); ta.select();
    document.execCommand("copy"); ta.remove();
  }
  toast(`${label} tersalin!`);
}

/* ---------------- music ---------------- */
const music = new Audio();
const musicBtn = $("#musicBtn");
music.loop = true;
music.preload = "none";
music.src = C.music;
music.addEventListener("canplay", () => (musicBtn.hidden = false), { once: true });
music.addEventListener("error", () => (musicBtn.hidden = true));
musicBtn.addEventListener("click", () => {
  if (music.paused) { music.play(); musicBtn.classList.remove("off"); }
  else { music.pause(); musicBtn.classList.add("off"); }
});

/* ---------------- golden ripples when the doors open ---------------- */
function gongRipple() {
  [0, 260, 560].forEach((delay) => setTimeout(() => {
    const r = document.createElement("span");
    r.className = "gong-ring";
    document.body.append(r);
    r.addEventListener("animationend", () => r.remove());
  }, delay));
}

/* ---------------- open: the Rumah Bolon doors swing open ---------------- */
$("#openBtn").addEventListener("click", () => {
  const cover = $("#cover");
  navigator.vibrate?.([40, 60, 90]);
  if (!STILL) { gongRipple(); cover.classList.add("shake"); }
  cover.classList.add("open");
  scrollTo(0, 0);
  music.load();
  music.play().catch(() => {});
  setTimeout(() => {
    document.body.classList.remove("locked");
    document.body.classList.add("opened");
    dust.start();
    sky.burst(6);
  }, 500);
  setTimeout(() => cover.classList.add("gone"), STILL ? 0 : 2500);
});

/* ---------------- countdown with flipping digits ---------------- */
const target = new Date(C.date).getTime();
const prev = {};
function tick() {
  const s = Math.max(0, Math.floor((target - Date.now()) / 1000));
  const v = { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
  for (const k in v) {
    const el = $(`[data-cd="${k}"]`);
    const txt = String(v[k]).padStart(k === "d" ? 1 : 2, "0");
    if (prev[k] !== txt) {
      el.textContent = txt;
      el.classList.remove("flip"); void el.offsetWidth; el.classList.add("flip");
      prev[k] = txt;
    }
  }
}
tick();
setInterval(tick, 1000);

/* ---------------- events & calendar ---------------- */
const icsDate = (iso) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const title = `Pernikahan ${C.groom.nick} & ${C.bride.nick}`;
const icons = ["✝", "❖"];
$("#eventList").append(...C.events.map((e, i) => {
  const el = document.createElement("article");
  el.className = "event reveal glow";
  const gcal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${title} · ${e.title}`)}&dates=${icsDate(e.start)}/${icsDate(e.end)}&location=${encodeURIComponent(`${e.place}, ${e.address}`)}`;
  el.innerHTML = `<span class="ev-icon"></span><h3></h3><p class="when"></p><p class="time"></p><p class="place"></p><p class="addr"></p>
    <div class="actions"><a class="btn btn-red" target="_blank" rel="noopener">Buka Maps</a>
    <a class="btn btn-ghost" target="_blank" rel="noopener">Google Calendar</a>
    <button class="btn btn-ghost" type="button">Simpan .ics</button></div>`;
  $(".ev-icon", el).textContent = icons[i % icons.length];
  $("h3", el).textContent = e.title;
  $(".when", el).textContent = e.date;
  $(".time", el).textContent = e.time;
  $(".place", el).textContent = e.place;
  $(".addr", el).textContent = e.address;
  const [maps, cal] = $$("a", el);
  maps.href = e.maps;
  cal.href = gcal;
  $("button", el).addEventListener("click", () => {
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//JovMay//ID", "BEGIN:VEVENT",
      `UID:jovmay-${i}@undangan`, `DTSTAMP:${icsDate(new Date().toISOString())}`,
      `DTSTART:${icsDate(e.start)}`, `DTEND:${icsDate(e.end)}`,
      `SUMMARY:${title} · ${e.title}`, `LOCATION:${e.place}, ${e.address}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = `${e.title}.ics`;
    a.click();
  });
  return el;
}));
// a golden route with a travelling light between the venues
$$("#eventList .event").slice(1).forEach((card) => {
  const route = document.createElement("div");
  route.className = "route";
  route.setAttribute("aria-hidden", "true");
  route.innerHTML = "<span></span>";
  card.before(route);
});

/* ---------------- lightbox ---------------- */
const photos = ["cover", "awal", "bab1", "bab2", "bab3", "bab4", "bab5", "bab6", "bab7"].map((n) => `assets/img/${n}.jpg`);
const lb = $("#lightbox");
let lbList = photos, lbI = 0;
function openLb(i, list = photos) { lbList = list; lbI = (i + list.length) % list.length; $("#lbImg").src = list[lbI]; lb.hidden = false; }
$(".lb-close").onclick = () => (lb.hidden = true);
$(".lb-prev").onclick = () => openLb(lbI - 1, lbList);
$(".lb-next").onclick = () => openLb(lbI + 1, lbList);
lb.addEventListener("click", (e) => { if (e.target === lb) lb.hidden = true; });
let sx = null;
lb.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
lb.addEventListener("touchend", (e) => {
  if (sx === null) return;
  const dx = e.changedTouches[0].clientX - sx;
  if (Math.abs(dx) > 40) openLb(lbI + (dx < 0 ? 1 : -1), lbList);
  sx = null;
});
addEventListener("keydown", (e) => {
  if (lb.hidden) return;
  if (e.key === "Escape") lb.hidden = true;
  if (e.key === "ArrowRight") openLb(lbI + 1, lbList);
  if (e.key === "ArrowLeft") openLb(lbI - 1, lbList);
});

/* ---------------- gallery: 3D ring you can spin ---------------- */
const ring = (() => {
  const stage = $("#ringStage"), el = $("#ring");
  const step = 360 / photos.length;
  const items = photos.map((src, i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", `Buka foto ${i + 1}`);
    b.innerHTML = `<img src="${src}" alt="" loading="lazy" />`;
    b.addEventListener("click", () => { if (!moved) openLb(i); });
    el.append(b);
    return b;
  });
  let radius = 0, angle = 0, vel = 0, dragging = false, lastX = 0, moved = false, startX = 0, visible = false, last = 0;
  function layout() {
    radius = Math.round(el.clientWidth / 2 / Math.tan(Math.PI / photos.length)) + 22;
    items.forEach((b, i) => (b.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px)`));
  }
  function render() {
    el.style.transform = `rotateX(-7deg) translateZ(${-radius}px) rotateY(${angle}deg)`;
    items.forEach((b, i) => {
      const c = Math.cos(((i * step + angle) * Math.PI) / 180);
      b.style.filter = `brightness(${(0.28 + 0.72 * Math.max(0, c)).toFixed(2)})`;
    });
  }
  function frame(now) {
    if (!visible) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    if (!dragging) {
      vel *= 0.95;
      angle += (STILL ? 0 : -9) * dt + vel * dt;
    }
    render();
    requestAnimationFrame(frame);
  }
  stage.addEventListener("pointerdown", (e) => {
    dragging = true; moved = false; lastX = startX = e.clientX; vel = 0;
  });
  addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const d = e.clientX - lastX;
    lastX = e.clientX;
    if (Math.abs(e.clientX - startX) > 6) moved = true;
    angle += d * 0.4;
    vel = d * 0.4 * 50;
  });
  addEventListener("pointerup", () => { dragging = false; });
  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible) { last = performance.now(); requestAnimationFrame(frame); }
  }).observe(stage);
  addEventListener("resize", layout);
  layout();
  render();
})();

/* ---------------- gift: red envelope with gold seal ---------------- */
$("#qrisImg").src = C.qris;
$("#qrisDl").href = C.qris;
const zoomQris = () => openLb(0, [C.qris]);
$("#qrisOpen").onclick = zoomQris;
$("#qrisZoom").onclick = zoomQris;
// The envelope is shown sealed first, then opens by itself once it has been fully on screen
// for a moment, so guests see it open and nobody has to know to tap it. Scrolling away
// closes it again so the opening plays each time; tapping replays it.
const env = $("#envelope");
let envT;
function openEnvelope() {
  if (env.classList.contains("open")) return;
  env.classList.add("open");
  env.setAttribute("aria-expanded", "true");
  setTimeout(() => $("#amplop").classList.add("opened"), 1800);
  setTimeout(() => {
    sky.burst(4);
    const r = env.getBoundingClientRect();
    sparkBurst(r.left + r.width / 2, r.top + r.height * 0.6, 26);
  }, 250);
}
function closeEnvelope() {
  env.classList.remove("open");
  env.setAttribute("aria-expanded", "false");
}
env.addEventListener("click", () => {
  clearTimeout(envT);
  if (!env.classList.contains("open")) return openEnvelope();
  closeEnvelope();
  envT = setTimeout(openEnvelope, 1500);
});
new IntersectionObserver(([en]) => {
  clearTimeout(envT);
  if (en.isIntersecting) envT = setTimeout(openEnvelope, 1000);
  else closeEnvelope();
}, { threshold: 0.8 }).observe(env);
$("#giftMethod").append(...["QRIS", ...C.banks.map((b) => b.bank), ...(C.ewallets || []).map((w) => w.name), ...(C.giftAddress ? ["Kado"] : [])]
  .map((m) => Object.assign(document.createElement("option"), { value: m, textContent: m })));
const accs = [
  ...C.banks.map((b) => ({ title: b.bank, no: b.number, holder: b.holder, label: "Nomor rekening" })),
  ...(C.ewallets || []).map((w) => ({ title: w.name, no: w.number, holder: w.holder, label: "Nomor" })),
];
if (C.giftAddress) accs.push({ title: "Kirim Kado", no: "", holder: C.giftAddress, label: "Alamat" });
$("#accounts").append(...accs.map((a) => {
  const el = document.createElement("div");
  el.className = "acc glow";
  el.innerHTML = `<span class="bank"></span><span class="no"></span><span class="holder"></span><button class="btn btn-ghost" type="button">Salin</button>`;
  $(".bank", el).textContent = a.title;
  $(".no", el).textContent = a.no;
  $(".holder", el).textContent = a.no ? `a.n. ${a.holder}` : a.holder;
  $("button", el).onclick = () => copy(a.no ? a.no.replace(/[\s-]/g, "") : a.holder, a.label);
  return el;
}));

/* ---------------- RSVP & wishes ---------------- */
const LS = "jovmay-wishes";
const local = () => { try { return JSON.parse(localStorage.getItem(LS)) || []; } catch { return []; } };
function renderWishes(list) {
  const box = $("#wishes");
  box.innerHTML = "";
  if (!list.length) { box.innerHTML = `<p class="wishes-empty">Jadilah yang pertama mengirim ucapan.</p>`; return; }
  list.slice().reverse().forEach((w) => {
    const el = document.createElement("div");
    el.className = "wish";
    el.innerHTML = `<b></b><small></small><p></p>`;
    $("b", el).textContent = w.nama;
    $("small", el).textContent = w.hadir;
    $("p", el).textContent = w.ucapan;
    box.append(el);
  });
}
async function loadWishes() {
  if (!C.sheetUrl) return renderWishes(local());
  try {
    const res = await fetch(C.sheetUrl);
    renderWishes(await res.json());
  } catch { renderWishes(local()); }
}
loadWishes();
if (guest) $("#rsvpName").value = guest.slice(0, 60);

if (guest) $("#giftName").value = guest.slice(0, 60);

// shared by the RSVP form and the gift form: both end up in the guest book
let lastSend = 0;
async function sendWish(form, extra, thanks) {
  const d = Object.fromEntries(new FormData(form));
  if (d.website) return; // bot
  if (!d.nama.trim() || !d.ucapan.trim()) return toast("Nama dan ucapan wajib diisi");
  if (Date.now() - lastSend < 15000) return toast("Tunggu sebentar ya 🙏");
  lastSend = Date.now();
  const entry = { nama: d.nama.trim(), ucapan: d.ucapan.trim(), waktu: new Date().toISOString(), ...extra(d) };
  const btn = $("button[type=submit]", form);
  const label = btn.innerHTML;
  btn.disabled = true;
  btn.textContent = "Mengirim…";
  try {
    if (C.sheetUrl) {
      await fetch(C.sheetUrl, { method: "POST", mode: "no-cors", body: new URLSearchParams(entry) });
      setTimeout(loadWishes, 1500);
    }
    const { nominal, ...shown } = entry; // the amount never goes into the public guest book
    try { localStorage.setItem(LS, JSON.stringify([...local(), shown])); } catch {}
    renderWishes(local());
    form.ucapan.value = "";
    if (form.nominal) form.nominal.value = "";
    toast(thanks);
    const r = btn.getBoundingClientRect();
    sparkBurst(r.left + r.width / 2, r.top, 22);
  } catch {
    toast("Gagal mengirim, coba lagi");
  } finally {
    btn.disabled = false;
    btn.innerHTML = label;
  }
}
$("#rsvpForm").addEventListener("submit", (e) => {
  e.preventDefault();
  sendWish(e.target, (d) => ({ jenis: "RSVP", hadir: d.hadir, jumlah: d.jumlah }), "Terima kasih atas doanya!");
});
$("#giftForm").addEventListener("submit", (e) => {
  e.preventDefault();
  sendWish(e.target, (d) => ({ jenis: "Tanda kasih", hadir: "Tanda kasih", metode: d.metode, nominal: d.nominal.trim() }),
    "Terima kasih! Ucapan Anda tampil di Buku Ucapan");
});

/* ---------------- reveal on scroll ---------------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
}, { rootMargin: "0px 0px -12% 0px" });
$$(".reveal, .chapter, .split, .wipe, .ornament, .gorga-line").forEach((el) => io.observe(el));

/* ---------------- gold glare follows the pointer on cards ---------------- */
addEventListener("pointermove", (e) => {
  const card = e.target.closest?.(".glow");
  if (!card) return;
  const r = card.getBoundingClientRect();
  card.style.setProperty("--gx", `${((e.clientX - r.left) / r.width) * 100}%`);
  card.style.setProperty("--gy", `${((e.clientY - r.top) / r.height) * 100}%`);
}, { passive: true });

/* ---------------- braids: three strands, one cord ---------------- */
const NS = "http://www.w3.org/2000/svg";
const STRANDS = ["#d8433a", "#ecd59a", "#fbf5ea"];
function strandPath(k, h, xAt) {
  let d = "";
  for (let y = 0; y <= h; y += 4) d += `${y ? "L" : "M"}${xAt(k, y).toFixed(1)} ${y}`;
  return d;
}
function drawBraid(svg, w, h, xAt, width, ghost = true) {
  svg.innerHTML = "";
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  const live = [];
  STRANDS.forEach((color, k) => {
    const d = strandPath(k, h, xAt);
    if (ghost) {
      const g = document.createElementNS(NS, "path");
      g.setAttribute("d", d);
      g.setAttribute("stroke", color);
      g.setAttribute("stroke-opacity", ".14");
      g.setAttribute("stroke-width", width);
      svg.append(g);
    }
    const shade = document.createElementNS(NS, "path");
    shade.setAttribute("d", d);
    shade.setAttribute("stroke", "#000");
    shade.setAttribute("stroke-opacity", ".45");
    shade.setAttribute("stroke-width", width + 2.5);
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    p.setAttribute("stroke", color);
    p.setAttribute("stroke-width", width);
    svg.append(shade, p);
    [shade, p].forEach((el) => {
      const len = el.getTotalLength();
      el.style.strokeDasharray = len;
      el.style.strokeDashoffset = len;
      el.dataset.len = len;
      live.push(el);
    });
  });
  return (t) => live.forEach((el) => (el.style.strokeDashoffset = el.dataset.len * (1 - t)));
}

const story = $("#story");
const storySvg = $("#storyBraid");
let setStoryBraid = () => {};
let braidTop = 0; // SVG elements have no offsetTop, so measure against the section
function layoutStoryBraid() {
  braidTop = storySvg.getBoundingClientRect().top - story.getBoundingClientRect().top;
  const h = Math.max(200, story.offsetHeight - braidTop - 64);
  storySvg.style.height = `${h}px`;
  setStoryBraid = drawBraid(storySvg, 30, h, (k, y) => 15 + 9 * Math.sin((y / 70) * Math.PI * 2 + (k * Math.PI * 2) / 3), 2);
}

const cord = $("#cord");
const setCord = drawBraid($("#cordSvg"), 300, 420, (k, y) => {
  const start = [40, 150, 260][k];
  const braid = 150 + 36 * Math.sin((y / 110) * Math.PI * 2 + (k * Math.PI * 2) / 3);
  const t = Math.min(1, y / 130);
  const e = t * t * (3 - 2 * t);
  return start + (braid - start) * e;
}, 7, false);

/* ---------------- scroll-linked effects ---------------- */
const tilts = $$(".tilt");
const nights = $$("[data-night]");
const verses = $$(".verse");
const bar = $("#progress");
const celestial = $("#celestial");
const root = document.documentElement;
let lastY = scrollY, ticking = false, skewT;
let night = 1;

function onScroll() {
  ticking = false;
  const vh = innerHeight;

  tilts.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const p = (r.top + r.height / 2 - vh / 2) / vh;
    if (!STILL) {
      el.style.setProperty("--rx", `${(p * 9).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(p * (el.closest(".flip") ? 6 : -6)).toFixed(2)}deg`);
    }
    const img = el.querySelector("img");
    if (img) img.style.setProperty("--py", `${(p * -22).toFixed(1)}px`);
  });

  verses.forEach((v) => {
    const r = v.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const p = clamp01(-r.top / (r.height - vh));
    const words = $$(".w", v);
    const lit = Math.floor(p * 1.25 * words.length);
    words.forEach((w, i) => {
      w.classList.toggle("lit", i < lit);
      w.classList.toggle("now", i === lit - 1 && lit < words.length);
    });
    v.classList.toggle("done", p > 0.8);
  });

  const cr = cord.getBoundingClientRect();
  if (cr.bottom > 0 && cr.top < vh) {
    const p = clamp01(-cr.top / (cr.height - vh));
    setCord(clamp01((p - 0.05) * 1.4));
    cord.classList.toggle("s1", p > 0.03);
    cord.classList.toggle("done", p > 0.72);
  }

  const sr = story.getBoundingClientRect();
  setStoryBraid(clamp01((vh * 0.65 - sr.top - braidTop) / (sr.height - braidTop - 64)));

  // the light over the story travels from evening sun to moon as the chapters pass
  if (sr.bottom > 0 && sr.top < vh) {
    const p = clamp01(-sr.top / (sr.height - vh));
    const x = innerWidth * (0.85 - 0.7 * p);
    const y = -sr.top + vh * (0.14 - 0.08 * Math.sin(p * Math.PI)); // a gentle arc high in the sky
    celestial.style.setProperty("--x", `${x.toFixed(0)}px`);
    celestial.style.setProperty("--y", `${y.toFixed(0)}px`);
    const warm = 1 - p;
    celestial.style.setProperty("--c1", `rgb(${255}, ${Math.round(213 + 30 * p)}, ${Math.round(138 + 100 * p)})`);
    celestial.style.setProperty("--c2", `rgba(${Math.round(255 - 70 * p)}, ${Math.round(170 + 40 * p)}, ${Math.round(90 + 150 * p)}, ${(0.3 + 0.15 * warm).toFixed(2)})`);
  }

  // photos lean with scroll speed, then settle
  const v = scrollY - lastY;
  if (!STILL) {
    root.style.setProperty("--skew", `${Math.max(-3, Math.min(3, v * 0.06)).toFixed(2)}deg`);
    clearTimeout(skewT);
    skewT = setTimeout(() => root.style.setProperty("--skew", "0deg"), 120);
  }

  const max = document.documentElement.scrollHeight - vh;
  bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;

  sky.scroll(scrollY - lastY);
  lastY = scrollY;
}
const requestScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
addEventListener("scroll", requestScroll, { passive: true });
addEventListener("resize", () => { layoutStoryBraid(); requestScroll(); });

function nightAmount() {
  if (!document.body.classList.contains("opened")) return 1;
  const vh = innerHeight;
  let n = 0;
  nights.forEach((el) => {
    const r = el.getBoundingClientRect();
    n = Math.max(n, Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) / vh);
  });
  return n;
}

/* ---------------- cover parallax ---------------- */
const doors = $$(".door-img");
function lookAt(x, y) {
  doors.forEach((d) => { d.style.setProperty("--px", `${-x * 16}px`); d.style.setProperty("--py", `${-y * 10}px`); });
  sky.look(x, y);
}
addEventListener("pointermove", (e) => lookAt(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5));
addEventListener("deviceorientation", (e) => {
  if (e.gamma == null) return;
  lookAt(Math.max(-1, Math.min(1, e.gamma / 30)) / 2, Math.max(-1, Math.min(1, (e.beta - 45) / 30)) / 2);
});

/* ---------------- gold sparkle trail ---------------- */
let sparks = 0, lastSpark = 0;
function spark(x, y, spread = 1) {
  if (STILL || sparks > 40) return;
  const s = document.createElement("span");
  s.className = "spark";
  s.style.left = `${x}px`;
  s.style.top = `${y}px`;
  s.style.setProperty("--dx", `${(Math.random() - 0.5) * 40 * spread}px`);
  s.style.setProperty("--dy", `${(Math.random() * 30 + 10) * spread * (spread > 1 ? (Math.random() - 0.4) * 2 : 1)}px`);
  document.body.append(s);
  sparks++;
  setTimeout(() => { s.remove(); sparks--; }, 900);
}
function sparkBurst(x, y, n) { for (let i = 0; i < n; i++) setTimeout(() => spark(x, y, 3), i * 12); }
addEventListener("pointermove", (e) => {
  const now = performance.now();
  if (now - lastSpark < 40 || !document.body.classList.contains("opened")) return;
  lastSpark = now;
  spark(e.clientX, e.clientY);
});

/* ---------------- lanterns of prayer ---------------- */
const closing = $("#closing"), lanterns = $("#lanterns");
let lanternCount = 0, closingVisible = false;
function lantern(x) {
  if (lanternCount > 24) return;
  const l = document.createElement("span");
  l.className = "lantern";
  l.style.left = `${x ?? Math.random() * 100}%`;
  l.style.setProperty("--d", `${8 + Math.random() * 6}s`);
  l.style.setProperty("--s", (0.7 + Math.random() * 0.6).toFixed(2));
  l.style.setProperty("--sx", `${(Math.random() - 0.5) * 120}px`);
  lanterns.append(l);
  lanternCount++;
  l.addEventListener("animationend", () => { l.remove(); lanternCount--; });
}
closing.addEventListener("pointerdown", (e) => {
  const r = closing.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * 100;
  lantern(x);
  if (Math.random() < 0.5) setTimeout(() => lantern(x + (Math.random() - 0.5) * 10), 180);
});
new IntersectionObserver(([en]) => (closingVisible = en.isIntersecting)).observe(closing);
setInterval(() => { if (closingVisible && !STILL) lantern(); }, 1700);

/* =====================================================
   HERO: the couple's names assembled from gold dust
   ===================================================== */
const dust = makeDust();
function makeDust() {
  const canvas = $("#dust"), hero = $("#hero"), space = $(".dust-space");
  const ctx = canvas.getContext("2d");
  let P = [], w = 0, h = 0, dpr = 1, started = false, visible = true, raf = 0;
  const ptr = { x: -9999, y: -9999 };

  async function build() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = hero.clientWidth; h = hero.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    try { await document.fonts.load('italic 500 120px "Cormorant Garamond"'); } catch {}
    const hr = hero.getBoundingClientRect(), sr = space.getBoundingClientRect();
    const cy = sr.top - hr.top + sr.height / 2;
    const text = `${C.groom.nick} & ${C.bride.nick}`;
    const off = document.createElement("canvas");
    off.width = w; off.height = Math.ceil(sr.height);
    const o = off.getContext("2d");
    let size = Math.min(w * 0.26, 190);
    do {
      o.font = `500 ${size}px "Cormorant Garamond", serif`;
      size -= 4;
    } while (o.measureText(text).width > w * 0.88 && size > 20);
    o.fillStyle = "#fff";
    o.textAlign = "center";
    o.textBaseline = "middle";
    o.fillText(text, w / 2, off.height / 2);
    const data = o.getImageData(0, 0, off.width, off.height).data;
    const gap = w < 600 ? 3 : 4;
    const old = P;
    P = [];
    for (let y = 0; y < off.height; y += gap) {
      for (let x = 0; x < off.width; x += gap) {
        if (data[(y * off.width + x) * 4 + 3] > 140) {
          const prevP = old[P.length];
          P.push({
            tx: x, ty: y - off.height / 2 + cy,
            x: prevP ? prevP.x : Math.random() * w, y: prevP ? prevP.y : h + Math.random() * h * 0.6,
            vx: 0, vy: 0,
            s: (Math.random() * 1.4 + 1.1) * dpr,
            c: GOLDS[(Math.random() * GOLDS.length) | 0],
            ph: Math.random() * 6.28,
            k: 0.012 + Math.random() * 0.02,
            ox: (Math.random() - 0.5) * w * 1.2,
            oy: -(Math.random() * 0.8 + 0.2) * h * 0.9,
          });
        }
      }
    }
  }

  function frame(t) {
    raf = 0;
    if (!visible) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const R = 70, R2 = R * R;
    // as the hero scrolls away the dust lifts into the sky, and gathers again on the way back
    const scatter = clamp01(-hero.getBoundingClientRect().top / (h * 0.7)) ** 1.6;
    for (const p of P) {
      p.vx += (p.tx + p.ox * scatter - p.x) * p.k;
      p.vy += (p.ty + p.oy * scatter - p.y) * p.k;
      const dx = p.x - ptr.x, dy = p.y - ptr.y, d2 = dx * dx + dy * dy;
      if (d2 < R2) {
        const d = Math.sqrt(d2) || 1, f = (1 - d / R) * 7;
        p.vx += (dx / d) * f; p.vy += (dy / d) * f;
      }
      p.vx *= 0.86; p.vy *= 0.86;
      p.x += p.vx; p.y += p.vy;
      ctx.globalAlpha = 0.65 + 0.35 * Math.sin(t * 0.003 + p.ph);
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x * dpr, p.y * dpr, p.s, p.s);
    }
    raf = requestAnimationFrame(frame);
  }
  const run = () => { if (!raf && started && visible) raf = requestAnimationFrame(frame); };

  const setPtr = (e) => { const r = canvas.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; };
  canvas.addEventListener("pointermove", setPtr);
  canvas.addEventListener("pointerdown", setPtr);
  canvas.addEventListener("pointerleave", () => { ptr.x = ptr.y = -9999; });
  canvas.addEventListener("pointerup", (e) => { if (e.pointerType !== "mouse") ptr.x = ptr.y = -9999; });
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; run(); }).observe(hero);
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => started && build(), 200); });

  return {
    async start() {
      if (started) return;
      started = true;
      await build();
      if (STILL) P.forEach((p) => { p.x = p.tx; p.y = p.ty; });
      run();
    },
  };
}

/* =====================================================
   3D SKY: petals in Simalungun red, white and gold,
   twinkling stars and shooting stars
   ===================================================== */
const sky = makeSky();

function makeSky() {
  const noop = { burst() {}, scroll() {}, look() {} };
  const canvas = $("#sky");
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" }); }
  catch { return noop; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 10;
  scene.add(new THREE.HemisphereLight(0xfff4e0, 0x6a3a4a, 2.2));
  const sun = new THREE.DirectionalLight(0xffd9a0, 1.6);
  sun.position.set(3, 4, 5);
  scene.add(sun);

  const small = innerWidth < 700;
  const weak = (navigator.hardwareConcurrency || 4) <= 4;
  const PETALS = STILL ? 12 : small || weak ? 34 : 70;

  // a soft, slightly cupped petal
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.5);
  shape.bezierCurveTo(0.42, -0.25, 0.38, 0.35, 0, 0.55);
  shape.bezierCurveTo(-0.38, 0.35, -0.42, -0.25, 0, -0.5);
  const geo = new THREE.ShapeGeometry(shape, 10);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, pos.getX(i) ** 2 * 0.6);
  geo.computeVertexNormals();
  geo.scale(0.22, 0.22, 0.22);
  const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x3a2a24, side: THREE.DoubleSide, transparent: true, opacity: 0.92 });
  const petals = new THREE.InstancedMesh(geo, mat, PETALS);
  const hues = [0xfff8ef, 0xfff8ef, 0xfff8ef, 0xa4232c, 0xa4232c, 0xd9b25a];
  const tint = new THREE.Color();
  for (let i = 0; i < PETALS; i++) petals.setColorAt(i, tint.setHex(hues[i % hues.length]));
  scene.add(petals);

  const P = [];
  const rand = (a, b) => a + Math.random() * (b - a);
  const halfSize = (z) => {
    const hh = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (camera.position.z - z);
    return { h: hh, w: hh * camera.aspect };
  };
  const spawn = (p, top) => {
    p.z = rand(-6, 4);
    const half = halfSize(p.z);
    p.x = rand(-half.w, half.w);
    p.y = top ? half.h + rand(0.2, 2) : rand(-half.h, half.h);
    p.vy = rand(0.25, 0.6);
    p.phase = rand(0, 6.28);
    p.sway = rand(0.2, 0.6);
    p.rx = rand(0, 6.28); p.ry = rand(0, 6.28); p.rz = rand(0, 6.28);
    p.sr = rand(0.4, 1.4);
    p.s = rand(0.7, 1.35);
  };

  const STARS = small ? 260 : 520;
  const sg = new THREE.BufferGeometry();
  const sp = new Float32Array(STARS * 3), ph = new Float32Array(STARS), sz = new Float32Array(STARS);
  for (let i = 0; i < STARS; i++) {
    sp[i * 3] = rand(-40, 40); sp[i * 3 + 1] = rand(-22, 22); sp[i * 3 + 2] = rand(-30, -20);
    ph[i] = rand(0, 6.28); sz[i] = rand(1, 3.2);
  }
  sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  sg.setAttribute("phase", new THREE.BufferAttribute(ph, 1));
  sg.setAttribute("size", new THREE.BufferAttribute(sz, 1));
  const starMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { t: { value: 0 }, a: { value: 1 }, dpr: { value: renderer.getPixelRatio() } },
    vertexShader: `attribute float phase; attribute float size; uniform float t; uniform float dpr; varying float vT;
      void main(){ vT = 0.55 + 0.45 * sin(t * 1.7 + phase * 3.0);
      gl_PointSize = size * dpr; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform float a; varying float vT;
      void main(){ float d = length(gl_PointCoord - 0.5); float g = smoothstep(0.5, 0.0, d);
      gl_FragColor = vec4(1.0, 0.94, 0.82, g * vT * a); }`,
  });
  scene.add(new THREE.Points(sg, starMat));

  // shooting stars over the night sections
  const mGeo = new THREE.PlaneGeometry(1, 0.05);
  mGeo.translate(-0.5, 0, 0);
  const meteorMat = () => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { a: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform float a; varying vec2 vUv;
      void main(){ float tail = pow(vUv.x, 2.5); float core = 1.0 - abs(vUv.y - 0.5) * 2.0;
      gl_FragColor = vec4(1.0, 0.9, 0.7, tail * core * a); }`,
  });
  const meteors = Array.from({ length: 16 }, () => {
    const m = new THREE.Mesh(mGeo, meteorMat());
    m.visible = false;
    m.userData = { life: 0, dur: 1, vx: 0, vy: 0 };
    scene.add(m);
    return m;
  });
  const launch = () => {
    const m = meteors.find((x) => !x.visible);
    if (!m) return;
    const z = -18, half = halfSize(z);
    m.position.set(rand(-half.w * 0.3, half.w * 1.1), rand(half.h * 0.1, half.h * 0.9), z);
    const ang = rand(-2.6, -2.35);
    const speed = rand(14, 22);
    m.userData = { life: 0, dur: rand(0.9, 1.5), vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed };
    m.rotation.z = ang + Math.PI;
    m.scale.set(rand(2.5, 5), 1, 1);
    m.visible = true;
  };

  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener("resize", resize);
  for (let i = 0; i < PETALS; i++) { const p = {}; spawn(p, false); P.push(p); }

  const dummy = new THREE.Object3D();
  const look = { x: 0, y: 0, tx: 0, ty: 0 };
  let scrollKick = 0, t = 0, nextMeteor = 2, queued = 0, last = performance.now();

  function frame(now) {
    const dt = Math.min(0.04, (now - last) / 1000);
    last = now;
    t += dt;

    night += (nightAmount() - night) * Math.min(1, dt * 3);
    starMat.uniforms.t.value = t;
    starMat.uniforms.a.value = night;
    mat.opacity = 0.3 + 0.62 * night; // petals stay subtle over the cream paper sections

    look.x += (look.tx - look.x) * dt * 2;
    look.y += (look.ty - look.y) * dt * 2;
    camera.position.x = look.x * 0.8;
    camera.position.y = -look.y * 0.5;
    camera.lookAt(0, 0, 0);

    const kick = scrollKick;
    scrollKick *= 0.85;
    for (let i = 0; i < PETALS; i++) {
      const p = P[i];
      const depth = (p.z + 6) / 10;
      p.y -= (STILL ? p.vy * 0.3 : p.vy) * dt + kick * (0.4 + depth);
      p.x += Math.sin(t * 0.8 + p.phase) * p.sway * dt;
      p.rx += p.sr * dt; p.ry += p.sr * 0.7 * dt; p.rz += p.sr * 0.3 * dt;
      const half = halfSize(p.z);
      if (p.y < -half.h - 1) spawn(p, true);
      if (p.y > half.h + 3) { spawn(p, false); p.y = -half.h - 0.5; }
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.rx, p.ry, p.rz);
      dummy.scale.setScalar(p.s);
      dummy.updateMatrix();
      petals.setMatrixAt(i, dummy.matrix);
    }
    petals.instanceMatrix.needsUpdate = true;

    if (!STILL) {
      nextMeteor -= dt;
      if (nextMeteor <= 0) {
        if (night > 0.35) launch();
        nextMeteor = rand(3, 7);
      }
      if (queued > 0 && Math.random() < 0.3) { launch(); queued--; }
    }
    meteors.forEach((m) => {
      if (!m.visible) return;
      const u = m.userData;
      u.life += dt;
      const k = u.life / u.dur;
      m.position.x += u.vx * dt;
      m.position.y += u.vy * dt;
      m.material.uniforms.a.value = Math.sin(Math.min(1, k) * Math.PI) * 0.95 * Math.max(night, 0.6);
      if (k >= 1) m.visible = false;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return {
    burst(n) { if (!STILL) queued += n; },
    scroll(dy) { scrollKick += dy * 0.0016; },
    look(x, y) { look.tx = x; look.ty = y; },
  };
}

layoutStoryBraid();
let braidT;
$$("#story img").forEach((img) => img.addEventListener("load", () => {
  clearTimeout(braidT);
  braidT = setTimeout(() => { layoutStoryBraid(); requestScroll(); }, 150);
}));
onScroll();

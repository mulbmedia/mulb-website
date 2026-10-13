
(function () {
  var lb = document.getElementById("lb"), lbc = document.getElementById("lbc"), lbn = document.getElementById("lbn");
  var ICON_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>';
  var ICON_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13"/></svg>';
  var list = [], cur = -1;

  function gone(i) { return list[i].b.classList.contains("gone"); }
  function counter() {
    var n = 0, pos = 0;
    for (var i = 0; i < list.length; i++) { if (!gone(i)) { n++; if (i <= cur) pos = n; } }
    lbn.textContent = pos + " / " + n;
  }
  function show(i) {
    cur = i; var it = list[i], el;
    lbc.innerHTML = "";
    if (it.isVideo) {
      el = document.createElement("video");
      el.loop = true; el.playsInline = true; el.autoplay = true; el.preload = "auto"; el.muted = true;
      el.src = it.src; lbc.appendChild(el);
      var mb = document.createElement("button"); mb.type = "button"; mb.className = "mute"; mb.setAttribute("aria-label", "Ton an oder aus"); lbc.appendChild(mb);
      var paint = function () { mb.innerHTML = el.muted ? ICON_OFF : ICON_ON; };
      mb.addEventListener("click", function () { el.muted = !el.muted; paint(); });
      paint();
      el.play().catch(function () {});
    } else {
      el = document.createElement("img"); el.alt = ""; el.src = it.src; lbc.appendChild(el);
    }
    counter();
    // Nachbarbilder vorladen
    [1, -1].forEach(function (d) { var j = (i + d + list.length) % list.length; if (!list[j].isVideo) { new Image().src = list[j].src; } });
  }
  function step(d) {
    var n = list.length, j = cur;
    do { j = (j + d + n) % n; } while (gone(j) && j !== cur);
    show(j);
  }
  function openLb(i) { show(i); if (!lb.open) lb.showModal(); }
  function closeLb() { lb.close(); }
  document.getElementById("lbx").addEventListener("click", closeLb);
  document.getElementById("lbp").addEventListener("click", function () { step(-1); });
  document.getElementById("lbnx").addEventListener("click", function () { step(1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  lb.addEventListener("close", function () { lbc.innerHTML = ""; });
  document.addEventListener("keydown", function (e) {
    if (!lb.open) return;
    if (e.key === "ArrowLeft") step(-1); else if (e.key === "ArrowRight") step(1);
  });
  var tx = null;
  lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  }, { passive: true });

  // Galerie
  var g = document.getElementById("gallery");
  if (g && window.GALLERIES) {
    var cat = g.getAttribute("data-cat"), root = g.getAttribute("data-root"), data = window.GALLERIES[cat], total = data.items.length, failed = 0;
    var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.play().catch(function () {}); } else { en.target.pause(); } });
    }, { rootMargin: "100px" }) : null;
    data.items.forEach(function (file, i) {
      var isVideo = /\.(mp4|webm|mov)$/i.test(file), src = root + "media/" + cat + "/" + file;
      var b = document.createElement("button"); b.type = "button"; b.className = "tile"; b.setAttribute("aria-label", "Vergrößern");
      var m;
      if (isVideo) {
        m = document.createElement("video"); m.muted = true; m.loop = true; m.playsInline = true; m.preload = "metadata"; m.src = src + "#t=0.1"; b.appendChild(m);
        if (io) io.observe(m); else m.autoplay = true;
      } else { m = document.createElement("img"); m.loading = "lazy"; m.alt = ""; m.src = src; b.appendChild(m); }
      m.addEventListener("error", function () {
        b.classList.add("gone"); failed++;
        if (failed === total) { var e = document.getElementById("galempty"); if (e) e.hidden = false; }
      });
      list.push({ src: src, isVideo: isVideo, b: b });
      b.addEventListener("click", function () { openLb(i); });
      g.appendChild(b);
    });
  }

  // Hero-Video: Ton an/aus
  var reel = document.getElementById("reel"), mute = document.getElementById("mute");
  if (reel && mute) {
    var paintHero = function () { mute.innerHTML = reel.muted ? ICON_OFF : ICON_ON; }; paintHero();
    mute.addEventListener("click", function () { reel.muted = !reel.muted; paintHero(); if (!reel.muted) reel.play().catch(function () {}); });
    var srcs = reel.querySelectorAll("source"), last = srcs[srcs.length - 1];
    if (last) last.addEventListener("error", function () { mute.hidden = true; });
  }

  // Kontaktformular: öffnet das E-Mail-Programm mit vorbefüllter Nachricht (kein Server nötig)
  var f = document.getElementById("cform");
  if (f) f.addEventListener("submit", function (e) {
    e.preventDefault();
    var n = f.elements.name.value.trim(), m = f.elements.email.value.trim(), t = f.elements.msg.value.trim(), s = document.getElementById("cstatus");
    if (!n || !m || !t || !f.elements.email.checkValidity()) { s.textContent = "Bitte fülle alle Felder mit * korrekt aus."; return; }
    var body = "Name: " + n + "\nE-Mail: " + m + "\n\nProjekt:\n" + t;
    window.location.href = "mailto:m.ulb@icloud.com?subject=" + encodeURIComponent("Projektanfrage von " + n) + "&body=" + encodeURIComponent(body);
    s.textContent = "Dein E-Mail-Programm öffnet sich. Bitte sende die Nachricht dort ab.";
  });
})();

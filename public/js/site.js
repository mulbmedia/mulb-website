
(function () {
  var lb = document.getElementById("lb"), lbc = document.getElementById("lbc"), lbt = document.getElementById("lbt");
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function openLb(src, isVideo, title) {
    lbc.innerHTML = isVideo ? '<video src="' + esc(src) + '" controls autoplay playsinline></video>' : '<img src="' + esc(src) + '" alt="' + esc(title) + '">';
    lbt.textContent = title; lb.showModal();
  }
  function closeLb() { lb.close(); }
  document.getElementById("lbx").addEventListener("click", closeLb);
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  lb.addEventListener("close", function () { lbc.innerHTML = ""; });

  // Galerie
  var g = document.getElementById("gallery");
  if (g && window.GALLERIES) {
    var cat = g.getAttribute("data-cat"), root = g.getAttribute("data-root"), data = window.GALLERIES[cat], shown = 0, total = data.items.length, failed = 0;
    data.items.forEach(function (file, i) {
      var isVideo = /\.(mp4|webm|mov)$/i.test(file), src = root + "media/" + cat + "/" + file;
      var title = data.alt + " " + (i + 1);
      var b = document.createElement("button"); b.type = "button"; b.className = "tile"; b.setAttribute("aria-label", title + " vergrößern");
      var m;
      if (isVideo) { m = document.createElement("video"); m.muted = true; m.loop = true; m.playsInline = true; m.preload = "metadata"; m.src = src + "#t=0.1"; b.appendChild(m);
        var t = document.createElement("span"); t.className = "tag"; t.textContent = "▶ Video"; b.appendChild(t);
        b.addEventListener("mouseenter", function () { m.play().catch(function () {}); });
        b.addEventListener("mouseleave", function () { m.pause(); m.currentTime = 0.1; });
      } else { m = document.createElement("img"); m.loading = "lazy"; m.alt = title; m.src = src; b.appendChild(m); }
      m.addEventListener("error", function () {
        b.classList.add("gone"); failed++;
        if (failed === total) { var e = document.getElementById("galempty"); if (e) e.hidden = false; }
      });
      b.addEventListener("click", function () { openLb(src, isVideo, title); });
      g.appendChild(b);
    });
  }

  // Hero-Video: Ton an/aus
  var reel = document.getElementById("reel"), mute = document.getElementById("mute");
  if (reel && mute) {
    mute.addEventListener("click", function () { reel.muted = !reel.muted; mute.textContent = reel.muted ? "🔇" : "🔊"; });
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

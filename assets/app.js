(function () {
  "use strict";

  /* ---- info cards (things you can flash straight away) ---- */
  var cards = [
    { name: "How RSVP works", desc: "Rapid Serial Visual Presentation shows one word at a time in a fixed spot, so your eyes never move. The red pivot letter is the optimal recognition point — keep your gaze on it and words just land." },
    { name: "Why it is faster", desc: "Normal reading spends most of its time on saccades — the little eye jumps between words. Remove the jumps and the return sweep, and you read at the speed you dial in instead of the speed your eyes wander." },
    { name: "Pick your speed", desc: "Start around 300 to 380 words per minute. Nudge it up 50 at a time. Most people comfortably reach 450 to 600 with a little practice; punctuation and long words automatically get a touch more time." },
    { name: "Flash any selection", desc: "Highlight text anywhere on this page and a Flash it button appears next to your cursor. Click it and that exact selection starts playing in the reader below." },
    { name: "Keyboard", desc: "Space toggles play and pause. The two speed sliders stay in sync, so you can change pace mid-read without losing your place." },
    { name: "Paste a whole chat", desc: "Drop an entire conversation or email into the box at the top and press Speed-read it. Great for clearing a long thread in seconds without scrolling." }
  ];

  var esc = function (s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; };

  document.getElementById("cards").innerHTML = cards.map(function (c) {
    return '<div class="card">'
      + '<div class="name">' + esc(c.name) + '</div>'
      + '<div class="desc">' + esc(c.desc) + '</div>'
      + '<button class="flash" data-text="' + esc(c.name + ". " + c.desc).replace(/"/g, "&quot;") + '">'
      + '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></svg>Flash it</button>'
      + '</div>';
  }).join("");

  /* ---- elements ---- */
  var display = document.getElementById("display"),
      fillBar = document.getElementById("fill"),
      rmeta   = document.getElementById("rmeta"),
      playBtn = document.getElementById("play"),
      playI   = document.getElementById("play-i"),
      restart = document.getElementById("restart"),
      input   = document.getElementById("input"),
      startBt = document.getElementById("start"),
      wpm     = document.getElementById("wpm"),
      wpm2    = document.getElementById("wpm2"),
      wpmV    = document.getElementById("wpm-v"),
      wpmV2   = document.getElementById("wpm-v2"),
      presets = document.getElementById("presets"),
      selFlash = document.getElementById("sel-flash");

  var PLAY = '<path d="M8 5v14l11-7z"/>', PAUSE = '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>';
  var words = [], idx = 0, timer = null, playing = false;

  /* ---- speed (persisted + synced across both sliders) ---- */
  var saved = parseInt(localStorage.getItem("flashread-wpm"), 10);
  if (saved >= 150 && saved <= 900) setWpm(saved);

  function setWpm(v) {
    v = Math.max(150, Math.min(900, v | 0));
    wpm.value = v; wpm2.value = v; wpmV.textContent = v; wpmV2.textContent = v;
    localStorage.setItem("flashread-wpm", v);
    syncPresets(v);
  }
  function syncPresets(v) {
    [].forEach.call(presets.children, function (c) {
      c.classList.toggle("on", +c.getAttribute("data-wpm") === v);
    });
  }
  wpm.addEventListener("input", function () { setWpm(+wpm.value); });
  wpm2.addEventListener("input", function () { setWpm(+wpm2.value); });
  presets.addEventListener("click", function (e) {
    var c = e.target.closest("[data-wpm]"); if (c) setWpm(+c.getAttribute("data-wpm"));
  });
  syncPresets(+wpm.value);

  /* ---- RSVP engine ---- */
  function tokenize(t) { return (t || "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean); }
  function orp(w) { var n = w.length; if (n <= 1) return 0; if (n <= 5) return 1; if (n <= 9) return 2; return 3; }

  function renderWord(w) {
    display.classList.remove("idle");
    var p = orp(w);
    display.innerHTML = '<span class="word"><span class="pre">' + esc(w.slice(0, p))
      + '</span><span class="piv">' + esc(w.slice(p, p + 1)) + '</span><span class="post">'
      + esc(w.slice(p + 1)) + '</span></span>';
  }
  function updateMeta() {
    rmeta.textContent = (words.length ? Math.min(idx + 1, words.length) : 0) + " / " + words.length;
    fillBar.style.width = words.length ? (idx / words.length * 100) + "%" : "0%";
  }
  function delayFor(w) {
    var base = 60000 / (+wpm.value);
    if (/[.!?…]["')\]]?$/.test(w)) return base * 2.2;
    if (/[,;:—-]$/.test(w)) return base * 1.5;
    if (w.length > 9) return base * 1.35;
    return base;
  }
  function step() {
    if (idx >= words.length) { stop(); display.classList.add("idle"); display.textContent = "Done — press restart to read it again."; fillBar.style.width = "100%"; return; }
    var w = words[idx]; renderWord(w); updateMeta(); idx++;
    timer = setTimeout(step, delayFor(w));
  }
  function play() {
    if (!words.length) return;
    if (idx >= words.length) idx = 0;
    playing = true; playI.innerHTML = PAUSE; step();
  }
  function stop() { playing = false; clearTimeout(timer); playI.innerHTML = PLAY; }
  function toggle() { playing ? stop() : play(); }
  function load(text, autoplay) {
    stop(); words = tokenize(text); idx = 0; updateMeta();
    if (words.length) { renderWord(words[0]); if (autoplay) play(); }
    else { display.classList.add("idle"); display.textContent = "Nothing to read there."; }
  }

  playBtn.addEventListener("click", toggle);
  restart.addEventListener("click", function () { stop(); idx = 0; updateMeta(); if (words.length) { renderWord(words[0]); play(); } });
  startBt.addEventListener("click", function () { load(input.value, true); scrollReader(); });

  document.addEventListener("keydown", function (e) {
    var tag = (e.target.tagName || "").toLowerCase();
    if (e.code === "Space" && tag !== "textarea" && tag !== "input") { e.preventDefault(); toggle(); }
  });

  /* ---- flash buttons on cards ---- */
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-text]");
    if (!b) return;
    load(b.getAttribute("data-text"), true); scrollReader();
  });

  /* ---- flash ANY selection on the page ---- */
  function currentSelectionText() {
    var s = window.getSelection();
    return s && s.rangeCount ? s.toString().trim() : "";
  }
  function positionSelButton() {
    var s = window.getSelection();
    var txt = currentSelectionText();
    if (!txt || !s.rangeCount) { selFlash.hidden = true; return; }
    var rect = s.getRangeAt(0).getBoundingClientRect();
    if (!rect || (!rect.width && !rect.height)) { selFlash.hidden = true; return; }
    selFlash.style.left = (rect.left + rect.width / 2 + window.scrollX) + "px";
    selFlash.style.top = (rect.top + window.scrollY - 8) + "px";
    selFlash.hidden = false;
  }
  document.addEventListener("mouseup", function (e) {
    if (e.target === selFlash || selFlash.contains(e.target)) return;
    setTimeout(positionSelButton, 0);
  });
  document.addEventListener("selectionchange", function () {
    if (!currentSelectionText()) selFlash.hidden = true;
  });
  selFlash.addEventListener("mousedown", function (e) { e.preventDefault(); }); // keep selection
  selFlash.addEventListener("click", function () {
    var txt = currentSelectionText() || selFlash.getAttribute("data-cached") || "";
    if (txt) { load(txt, true); scrollReader(); }
    selFlash.hidden = true;
  });
  // cache selection text on show so click still works after blur
  document.addEventListener("mouseup", function () {
    var t = currentSelectionText(); if (t) selFlash.setAttribute("data-cached", t);
  });

  function scrollReader() {
    document.querySelector(".reader").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  updateMeta();
  // expose a tiny hook so a headless smoke test can verify the engine
  window.__flashread = { load: load, play: play, stop: stop, state: function () { return { idx: idx, count: words.length, playing: playing, word: display.textContent }; } };
})();

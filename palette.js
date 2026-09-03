/* HMH command palette + copy buttons. Page provides window.HMH_INDEX = [{group,title,hint,run}] */
(function() {
  "use strict";

  /* ── copy buttons ── */
  document.addEventListener("click", function(e) {
    var btn = e.target.closest("[data-copy]");
    if (!btn) return;
    var text = btn.getAttribute("data-copy");
    function done() {
      var old = btn.textContent;
      btn.textContent = "COPIED";
      setTimeout(function() { btn.textContent = old; }, 1400);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, done);
    } else {
      var ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (err) {}
      document.body.removeChild(ta);
      done();
    }
  });

  /* ── palette ── */
  var EMAIL = "hasanmo3080vr@gmail.com";
  var GITHUB = "https://github.com/HMH-3080";

  function go(url) { return function() { window.location.href = url; }; }
  function open(url) { return function() { window.open(url, "_blank", "noopener"); }; }
  function copy(text) {
    return function() {
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text); return "Copied to clipboard"; }
      return text;
    };
  }
  function theme() {
    var h = document.documentElement;
    var next = h.dataset.theme === "dark" ? "light" : "dark";
    h.dataset.theme = next;
    try { localStorage.setItem("hmh-theme", next); } catch (e) {}
    var tb = document.getElementById("theme-btn");
    if (tb) tb.textContent = next === "dark" ? "MODE: DARK" : "MODE: LIGHT";
    return "Theme: " + next;
  }

  var ACTIONS = [
    { group: "Actions", title: "Toggle color theme", hint: "theme", run: theme },
    { group: "Actions", title: "Copy email address", hint: EMAIL, run: copy(EMAIL) },
    { group: "Actions", title: "Open GitHub profile", hint: "HMH-3080", run: open(GITHUB) },
    { group: "Go to", title: "About — profile & status", hint: "g a", run: go("about.html") },
    { group: "Go to", title: "Projects — 11 systems", hint: "g p", run: go("projects.html") },
    { group: "Go to", title: "Articles — engineering notes", hint: "g r", run: go("articles.html") }
  ];

  var bg = document.getElementById("pal-bg");
  var input = document.getElementById("pal-input");
  var list = document.getElementById("pal-list");
  if (!bg || !input || !list) return;

  var items = (window.HMH_INDEX || []).concat(ACTIONS);
  var sel = 0;
  var visible = items;

  function render() {
    var q = input.value.trim().toLowerCase();
    visible = items.filter(function(it) {
      return !q || (it.title + " " + (it.hint || "") + " " + (it.group || "")).toLowerCase().indexOf(q) !== -1;
    });
    if (sel >= visible.length) sel = 0;
    if (!visible.length) {
      list.innerHTML = '<div class="pal-empty">No match — try “projects”, “theme”, “email”…</div>';
      return;
    }
    var html = "";
    var lastGroup = null;
    visible.forEach(function(it, i) {
      if (it.group !== lastGroup) { html += '<div class="pal-group">' + esc(it.group || "Results") + "</div>"; lastGroup = it.group; }
      html += '<button class="pal-item' + (i === sel ? " sel" : "") + '" data-i="' + i + '" role="option" aria-selected="' + (i === sel) + '">'
        + esc(it.title) + (it.hint ? "<small>" + esc(it.hint) + "</small>" : "") + "</button>";
    });
    list.innerHTML = html;
    var active = list.querySelector(".pal-item.sel");
    if (active) active.scrollIntoView({ block: "nearest" });
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function openPal() {
    bg.hidden = false;
    input.value = "";
    sel = 0;
    render();
    setTimeout(function() { input.focus(); }, 0);
  }
  function closePal() { bg.hidden = true; }
  function isOpen() { return !bg.hidden; }

  function run(i) {
    var it = visible[i];
    closePal();
    if (it && typeof it.run === "function") it.run();
  }

  input.addEventListener("input", function() { sel = 0; render(); });
  input.addEventListener("keydown", function(e) {
    if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, visible.length - 1); render(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); render(); }
    else if (e.key === "Enter") { run(sel); }
    else if (e.key === "Escape") { closePal(); }
  });
  list.addEventListener("click", function(e) {
    var b = e.target.closest(".pal-item");
    if (b) run(parseInt(b.getAttribute("data-i"), 10));
  });
  list.addEventListener("mousemove", function(e) {
    var b = e.target.closest(".pal-item");
    if (b) {
      var i = parseInt(b.getAttribute("data-i"), 10);
      if (i !== sel) { sel = i; render(); }
    }
  });
  bg.addEventListener("click", function(e) { if (e.target === bg) closePal(); });

  document.addEventListener("keydown", function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); isOpen() ? closePal() : openPal(); }
    else if (e.key === "Escape" && isOpen()) { closePal(); }
  });

  var trigger = document.getElementById("cmdk-btn");
  if (trigger) trigger.addEventListener("click", openPal);
})();

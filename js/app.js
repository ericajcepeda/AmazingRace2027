/* Core: state, progress bar, gates, sound, confetti, toasts, texts & emails from R.B. and Dr. Lowery-Hart */
(function () {
  var C = window.RACE, U = window.RBU;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var KEY = "rb26_ai_bat_state_v1";
  var LEVELS = [
    { n: 1, short: "AI",     name: "ECHO's Mind" },
    { n: 2, short: "Data",   name: "The Flight Logs" },
    { n: 3, short: "Front End", name: "Mission Control" },
    { n: 4, short: "Back End", name: "The Engine Room" },
    { n: 5, short: "Game",   name: "Night Flight Training" }
  ];
  var AFTER = [
    "ECHO: “Fragment 1 restored. I remember now: my Flight Logs live in the cloud, in Box. They're scrambled too. Find <b>Station Card 1</b> somewhere in this room for the launch code to my Data Lab.”",
    "The logs are clean again, and they reveal something alarming: <b>Mission Control</b>, the page that steers the Riverbat, crashed during the update. Someone has to rebuild it. Find <b>Station Card 2</b>.",
    "Mission Control is back online, and it's flashing a warning: the <b>engine room's Python scripts</b> are offline. Find <b>Station Card 3</b> to open the Engine Room.",
    "The engine hums! But R.B. has never flown this route, so ECHO needs a <b>calibration flight</b> before the final route can be sealed. Find <b>Station Card 4</b>.",
    "Calibration complete. The route is sealed behind one last lock. Find <b>Station Card 5</b>, then use your Mission Log to rebuild the flight plan."
  ];
  var S; // state
  var inited = {}; var modules = {};
  var muted = false, actx = null;

  function load() {
    try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
    if (!S || typeof S !== "object") S = { team: 0, started: false, startedAt: 0, unlocked: 0, solved: [0, 0, 0, 0, 0], finale: false, name: "", inbox: [], unread: 0, stamps: {}, sent: {} };
    try { muted = localStorage.getItem("rb26_muted") === "1"; } catch (e) {}
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function frag(n) { return atob(C.fragments[n - 1]); }
  function solvedCount() { return S.solved.reduce(function (a, b) { return a + b; }, 0); }

  /* ---------- audio ---------- */
  function ctx() {
    if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
    if (actx && actx.state === "suspended") actx.resume();
    return actx;
  }
  function tone(freq, t0, dur, vol, type) {
    var a = ctx(); if (!a) return;
    var o = a.createOscillator(), g = a.createGain();
    o.type = type || "sine"; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, a.currentTime + t0);
    g.gain.exponentialRampToValueAtTime(vol, a.currentTime + t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + t0 + dur);
    o.connect(g); g.connect(a.destination); o.start(a.currentTime + t0); o.stop(a.currentTime + t0 + dur + 0.05);
  }
  function sfx(kind) {
    if (muted) return;
    if (kind === "win")   { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.09, 0.5, 0.16, "triangle"); }); }
    else if (kind === "rival") { tone(1319, 0, 0.7, 0.07, "sine"); tone(1760, 0.12, 0.9, 0.06, "sine"); }
    else if (kind === "rivalbig") { [784, 988, 1175, 1568].forEach(function (f, i) { tone(f, i * 0.1, 0.8, 0.07, "sine"); }); }
    else if (kind === "fanfare") { [523, 659, 784, 1047, 784, 1047, 1319].forEach(function (f, i) { tone(f, i * 0.13, 0.55, 0.17, "triangle"); }); tone(262, 0, 1.4, 0.1, "sine"); }
    else if (kind === "victory") {
      var M = [[523,.0,.22],[659,.22,.22],[784,.44,.22],[1047,.66,.5],[784,1.2,.2],[1047,1.4,.7],
               [880,2.3,.22],[988,2.52,.22],[1047,2.74,.22],[1319,2.96,.5],[1175,3.5,.2],[1319,3.7,.7],
               [1047,4.6,.2],[1175,4.8,.2],[1319,5.0,.2],[1568,5.2,.45],[1319,5.7,.2],[1568,5.9,.2],[2093,6.1,1.3]];
      M.forEach(function (n) { tone(n[0], n[1], n[2] + .15, 0.13, "triangle"); tone(n[0] / 2, n[1], n[2] + .1, 0.05, "sine"); });
      [[262,0],[330,1.2],[349,2.3],[392,3.5],[330,4.6],[262,6.1]].forEach(function (c, i, arr) { tone(c[0], c[1], (i < arr.length - 1 ? arr[i + 1][1] - c[1] : 1.6), 0.07, "sawtooth"); });
    }
    else if (kind === "no") { tone(220, 0, 0.18, 0.1, "square"); tone(180, 0.1, 0.22, 0.1, "square"); }
    else if (kind === "flap") { tone(520, 0, 0.08, 0.05, "square"); }
    else if (kind === "point") { tone(988, 0, 0.09, 0.07, "square"); tone(1319, 0.07, 0.12, 0.07, "square"); }
    else if (kind === "hit") { tone(150, 0, 0.25, 0.14, "sawtooth"); }
    else if (kind === "sms") { tone(1175, 0, 0.12, 0.08, "sine"); tone(1568, 0.1, 0.35, 0.07, "sine"); }
    else if (kind === "mail") { tone(659, 0, 0.18, 0.07, "triangle"); tone(880, 0.14, 0.18, 0.07, "triangle"); tone(1319, 0.28, 0.4, 0.06, "triangle"); }
    else if (kind === "send") { tone(660, 0, 0.07, 0.05, "sine"); }
    else if (kind === "recv") { tone(880, 0, 0.09, 0.05, "sine"); tone(1175, 0.07, 0.1, 0.04, "sine"); }
  }

  /* ---------- confetti ---------- */
  var cv, cx, parts = [], raf = 0;
  var COLORS = ["#ff8fd0", "#ffc2e6", "#b69cff", "#7ef0d0", "#ffd98a", "#ffffff"];
  function sizeCanvas() { cv.width = innerWidth; cv.height = innerHeight; }
  function confetti(big) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var n = big ? 220 : 90;
    for (var i = 0; i < n; i++) {
      var fromTop = big && i % 2;
      parts.push({
        x: big ? Math.random() * cv.width : cv.width / 2 + (Math.random() - .5) * 160,
        y: fromTop ? -20 : (big ? cv.height * .35 : cv.height * .3),
        vx: (Math.random() - .5) * (big ? 9 : 13), vy: fromTop ? Math.random() * 3 + 2 : -(Math.random() * 11 + 4),
        g: .22 + Math.random() * .08, w: 6 + Math.random() * 8, h: 4 + Math.random() * 6,
        r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: COLORS[(Math.random() * COLORS.length) | 0],
        life: 0, max: 150 + Math.random() * 100, heart: Math.random() < .15
      });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick() {
    cx.clearRect(0, 0, cv.width, cv.height);
    parts = parts.filter(function (p) { return p.life < p.max && p.y < cv.height + 30; });
    parts.forEach(function (p) {
      p.life++; p.vy += p.g; p.x += p.vx; p.y += p.vy; p.vx *= .99; p.r += p.vr;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.globalAlpha = Math.min(1, (p.max - p.life) / 40); cx.fillStyle = p.c;
      if (p.heart) { cx.font = "16px sans-serif"; cx.fillText("♥", -6, 6); } else cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cx.restore();
    });
    raf = parts.length ? requestAnimationFrame(tick) : 0;
    if (!raf) cx.clearRect(0, 0, cv.width, cv.height);
  }

  /* ---------- toasts ---------- */
  function toast(html, ms) {
    var el = document.createElement("div"); el.className = "toast"; el.innerHTML = html;
    $("#toasts").appendChild(el);
    setTimeout(function () { el.classList.add("out"); setTimeout(function () { el.remove(); }, 520); }, ms || 4200);
  }

  /* ---------- progress bar ---------- */
  function buildNodes() {
    var nav = $("#nodes"); nav.innerHTML = "";
    LEVELS.forEach(function (L) {
      var b = document.createElement("button"); b.type = "button"; b.className = "node"; b.dataset.n = L.n;
      b.innerHTML = '<span class="dot">' + L.n + '</span><span class="lbl">' + L.short + "</span>";
      b.addEventListener("click", function () { if (b.classList.contains("open")) scrollTo("level" + L.n); });
      nav.appendChild(b);
    });
    var f = document.createElement("button"); f.type = "button"; f.className = "node"; f.dataset.n = 6;
    f.innerHTML = '<span class="dot">🏁</span><span class="lbl">Finish</span>';
    f.addEventListener("click", function () { if (f.classList.contains("open")) scrollTo("finale"); });
    nav.appendChild(f);
  }
  function refreshBar() {
    var cnt = solvedCount();
    $("#fill").style.width = (S.started ? Math.max(3, (cnt / 5) * 100 - (S.finale ? 0 : 0)) : 0) + "%";
    if (S.finale) $("#fill").style.width = "100%";
    $("#barFrags").textContent = cnt + " / 5";
    $("#barTeam").textContent = S.team ? "Team " + S.team : "";
    var title = !S.started ? "Mission Briefing" : S.finale ? "Flight plan restored!" : (S.unlocked >= 6 ? "The Flight Plan" : (LEVELS[Math.min(S.unlocked, 5) - 1] || LEVELS[0]).name);
    $("#barTitle").textContent = title;
    Array.prototype.forEach.call($("#nodes").children, function (b) {
      var n = +b.dataset.n; b.className = "node";
      var isDone = n <= 5 ? !!S.solved[n - 1] : S.finale;
      var isOpen = S.started && n <= S.unlocked;
      if (isDone) b.classList.add("done"); else if (isOpen) b.classList.add("current");
      if (isOpen) b.classList.add("open");
    });
    $("#muteBtn").textContent = muted ? "🔕 Sound off" : "🔔 Sound on";
  }
  function scrollTo(id) { var el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }

  /* ---------- levels ---------- */
  function register(n, fn) { modules[n] = fn; }
  function showLevel(n, doScroll) {
    var id = n === 6 ? "finale" : "level" + n;
    var sec = document.getElementById(id); if (!sec) return;
    sec.hidden = false;
    if (!inited[n] && modules[n]) { inited[n] = true; modules[n](); }
    if (n <= 5 && S.solved[n - 1]) renderReward(n, false);
    if (doScroll) setTimeout(function () { scrollTo(id); }, 80);
  }
  function renderReward(n, fresh) {
    var box = document.getElementById("reward" + n); if (!box) return;
    var sec = document.getElementById("level" + n);
    sec.classList.add("done");
    var open = S.unlocked > n;
    box.hidden = false; box.innerHTML =
      '<div class="fragment"><div><div class="num">Flight Fragment ' + n + " of 5</div><div class=\"word\">" + frag(n) + "</div></div>" +
      '<div class="note">✍️ Write this in your Mission Log (Fragment ' + n + ").</div></div>" +
      '<p class="story" style="margin-top:14px">' + AFTER[n - 1] + "</p>" +
      '<form class="gate' + (open ? " open" : "") + '" id="gate' + n + '" autocomplete="off">' +
      "<h3>" + (n === 5 ? "Final Station Card" : "Station Card " + n) + "</h3>" +
      "<p class=\"hintline\">Go find <b>Station Card " + n + "</b> in the room. It shows a Launch Code. Type it here.</p>" +
      '<div class="row"><input type="text" id="gateIn' + n + '" placeholder="Launch code" ' + (open ? "disabled value=\"✓ unlocked\"" : "") + ' maxlength="30" aria-label="Launch code">' +
      '<button type="submit"' + (open ? " disabled" : "") + ">Unlock " + (n === 5 ? "the Flight Plan" : "Level " + (n + 1)) + "</button></div>" +
      '<div class="msg" id="gateMsg' + n + '"></div></form>';
    var form = document.getElementById("gate" + n);
    form.addEventListener("submit", function (e) {
      e.preventDefault(); ctx();
      var v = document.getElementById("gateIn" + n).value;
      if (U.hn(v) === C.launchHashes[n - 1]) {
        unlock(n + 1);
      } else {
        sfx("no"); form.classList.remove("shake"); void form.offsetWidth; form.classList.add("shake");
        document.getElementById("gateMsg" + n).className = "msg no";
        document.getElementById("gateMsg" + n).textContent = "That's not the code on Station Card " + n + ". Check the card again (letters only, any case).";
      }
    });
    var puzzle = sec.querySelector(".puzzle");
    if (puzzle && !puzzle.dataset.ribbon) {
      puzzle.dataset.ribbon = "1";
      var rb = document.createElement("div"); rb.className = "done-ribbon"; rb.textContent = "✅ Level " + n + " complete. Your work stays right here so you can look back.";
      puzzle.parentNode.insertBefore(rb, puzzle);
    }
    if (fresh) setTimeout(function () { box.scrollIntoView({ behavior: "smooth", block: "center" }); }, 250);
  }
  function solveLevel(n) {
    if (S.solved[n - 1]) return;
    S.solved[n - 1] = 1; if (S.unlocked < n) S.unlocked = n; save();
    stamp("s" + n);
    sfx("win"); confetti(false);
    toast("🦇 <b>Fragment " + n + " restored!</b> " + frag(n));
    renderReward(n, true); refreshBar();
    sendOnce("solve" + n, (M.onSolve || {})[n], 7);
    sendOnce("solveB" + n, (M.onSolveExtra || {})[n], 14);
  }
  function unlock(next) {
    if (S.unlocked >= next) { showLevel(next, true); return; }
    S.unlocked = next; save(); stamp("u" + next);
    var cur = next - 1;
    var form = document.getElementById("gate" + cur);
    if (form) { form.classList.add("open"); document.getElementById("gateIn" + cur).disabled = true; document.getElementById("gateIn" + cur).value = "✓ unlocked"; form.querySelector("button").disabled = true; }
    sfx("win"); confetti(false);
    refreshBar(); showLevel(next, true);
  }
  function celebrate() { confetti(true); [700, 1500, 2500, 3600, 4800, 6200].forEach(function (t) { setTimeout(function () { confetti(true); }, t); }); }
  function finish() {
    S.finale = true; S.finishedAt = Date.now(); save(); refreshBar();
    sfx("victory"); celebrate();
    (M.onFinish || []).forEach(function (m, i) { sendOnce("fin" + i, m, m.delay != null ? m.delay : 5); });
  }

  /* ---------- texts & emails (R.B. and Dr. Lowery-Hart) ---------- */
  var M = window.RACE_MSGS || { senders: {}, onSolve: {}, onFinish: [], nudgeStuck: {} };
  function fill(t, extra) {
    return String(t || "").replace(/\{\{(\w+)\}\}/g, function (_, k) {
      var v = { NAME: S.name || "racer", TEAM: S.team, DEST: C.destination.name, N: "" };
      if (extra && extra[k] != null) v[k] = extra[k];
      return v[k] != null ? v[k] : "";
    });
  }
  function avatar(sender) {
    var d = document.createElement("div"); d.className = "avatar " + (sender.initials ? "init" : "emoji");
    var sp = document.createElement("span"); sp.textContent = sender.fallback || sender.initials || "•"; d.appendChild(sp);
    var list = (sender.photos || []).slice();
    (function tryNext() {
      if (!list.length) return;
      var img = new Image(); img.referrerPolicy = "no-referrer"; img.alt = "";
      img.onload = function () { d.innerHTML = ""; d.className = "avatar photo"; d.appendChild(img); };
      img.onerror = tryNext; img.src = list.shift();
    })();
    return d;
  }
  function buildNotif(m, when) {
    var snd = M.senders[m.from] || { name: m.from, app: "Message", kind: "sms" };
    var el = document.createElement("div"); el.className = "notif " + snd.kind;
    el.appendChild(avatar(snd));
    var body = document.createElement("div"); body.className = "nbody";
    var top = document.createElement("div"); top.className = "ntop";
    var nm = document.createElement("b"); nm.textContent = snd.name;
    var ap = document.createElement("span"); ap.textContent = (snd.kind === "mail" ? "✉ " : "💬 ") + snd.app + " · " + (when || "now");
    top.appendChild(nm); top.appendChild(ap); body.appendChild(top);
    if (m.subject) { var sb = document.createElement("div"); sb.className = "nsub"; sb.textContent = m.subject; body.appendChild(sb); }
    var tx = document.createElement("div"); tx.className = "ntext"; tx.textContent = m.body; body.appendChild(tx);
    if (m.img) { var im = new Image(); im.className = "nimg"; im.alt = m.imgAlt || ""; im.referrerPolicy = "no-referrer"; im.onerror = function () { im.remove(); }; im.src = m.img; body.appendChild(im); }
    el.appendChild(body); return el;
  }
  function notify(raw, extra) {
    if (!C.notifications || !raw) return;
    if (raw.from === "chancellor" && !C.chancellorEnabled) return;
    var m = { from: raw.from, subject: fill(raw.subject, extra), body: fill(raw.body, extra), img: raw.img, imgAlt: raw.imgAlt, t: Date.now() };
    S.inbox = (S.inbox || []).concat([m]).slice(-40); S.unread = (S.unread || 0) + 1; save(); refreshInbox();
    sfx((M.senders[m.from] || {}).kind === "mail" ? "mail" : "sms");
    var el = buildNotif(m, "now"); el.classList.add("pop");
    var x = document.createElement("button"); x.type = "button"; x.className = "nclose"; x.textContent = "\u00d7"; x.setAttribute("aria-label", "Close message"); el.appendChild(x);
    $("#toasts").appendChild(el);
    /* stays stacked on the right until the student closes it */
    var gone = function (e) { if (e) e.stopPropagation(); el.classList.add("out"); setTimeout(function () { el.remove(); }, 520); };
    x.addEventListener("click", function (e) { gone(e); setTimeout(fadeStack, 540); });
    fadeStack();
  }
  /* ombre: newest message at the bottom is solid, older ones fade as they stack up toward the top */
  function fadeStack() {
    var list = Array.prototype.slice.call(document.querySelectorAll("#toasts .notif:not(.out)"));
    for (var i = 0; i < list.length; i++) { var age = list.length - 1 - i; list[i].style.opacity = Math.max(0.22, 1 - age * 0.24).toFixed(2); }
  }
  function sendOnce(key, raw, delaySec, extra) {
    S.sent = S.sent || {}; if (S.sent[key] || !raw) return;
    setTimeout(function () { if (S.sent[key]) return; S.sent[key] = 1; notify(raw, extra); }, (delaySec == null ? 7 : delaySec) * 1000);
  }
  function refreshInbox() {
    var b = $("#inboxBadge"); if (!b) return; var n = S.unread || 0; b.textContent = n; b.hidden = !n;
  }
  function toggleInbox() {
    var p = $("#inbox"); var show = p.hidden; p.hidden = !show;
    if (show) {
      p.innerHTML = '<div class="inbox-head">📬 Texts &amp; emails</div>';
      var list = (S.inbox || []).slice().reverse();
      if (!list.length) { var e = document.createElement("p"); e.className = "lead"; e.style.padding = "8px 14px"; e.textContent = "Nothing yet. R.B. will text you soon!"; p.appendChild(e); }
      list.forEach(function (m) {
        var mins = Math.max(0, Math.round((Date.now() - m.t) / 60000));
        p.appendChild(buildNotif(m, mins < 1 ? "just now" : mins + " min ago"));
      });
      S.unread = 0; save(); refreshInbox();
    }
  }
  function stamp(k) { S.stamps = S.stamps || {}; S.stamps[k] = Date.now(); save(); }
  var nudgeTimer = 0;
  function startNudges() {
    if (nudgeTimer || !C.notifications) return;
    S.stamps = S.stamps || {}; var L0 = Math.min(S.unlocked, 5); if (L0 && !S.stamps["u" + L0]) stamp("u" + L0);
    nudgeTimer = setInterval(function () {
      if (!S.started || S.finale || S.unlocked >= 6) return;
      var L = Math.min(S.unlocked, 5), now = Date.now(); S.sent = S.sent || {};
      if (S.solved[L - 1]) {
        if (!S.sent["card" + L] && S.stamps["s" + L] && now - S.stamps["s" + L] > C.nudgeCardAfterSec * 1000) {
          S.sent["card" + L] = 1; notify({ from: "rb", body: M.nudgeCard }, { N: L });
        }
      } else if (!S.sent["stuck" + L] && S.stamps["u" + L] && now - S.stamps["u" + L] > C.nudgeStuckAfterMin * 60000) {
        S.sent["stuck" + L] = 1; notify({ from: "rb", body: (M.nudgeStuck || {})[L] });
      }
    }, 15000);
  }


  /* ---------- facilitator hub ---------- */
  var hubFails = 0, hubLockedUntil = 0;
  function hubReload(scrollId) {
    try { if (scrollId) sessionStorage.setItem("rb_scroll", scrollId); } catch (e) {}
    location.reload();
  }
  function hubEnsureStarted() {
    if (!S.started) { S.started = true; S.team = S.team || 1; S.startedAt = Date.now(); }
  }
  function hubInit() {
    var hub = $("#hub");
    function hubOk() { try { return sessionStorage.getItem("rb_hub") === "1"; } catch (e) { return false; } }
    function render() {
      var ok = hubOk(); $("#hubLogin").hidden = ok; $("#hubPanel").hidden = !ok;
      if (ok) {
        var cur = !S.started ? "not started" : S.finale ? "finished" : S.unlocked >= 6 ? "final screen" : "Level " + Math.min(S.unlocked, 5);
        $("#hubStatus").textContent = (S.team ? "Team " + S.team : "No team yet") + (S.name ? " (" + S.name + ")" : "") + " · on: " + cur + " · fragments: " + solvedCount() + "/5";
        $("#hubNote").textContent = "";
      } else setTimeout(function () { $("#hubCode").focus(); }, 50);
    }
    $("#hubBtn").addEventListener("click", function () { hub.hidden = false; render(); });
    $("#hubClose").addEventListener("click", function () { hub.hidden = true; });
    hub.addEventListener("click", function (e) { if (e.target === hub) hub.hidden = true; });
    $("#hubLogin").addEventListener("submit", function (e) {
      e.preventDefault(); var msg = $("#hubMsg");
      if (Date.now() < hubLockedUntil) { msg.className = "msg no"; msg.textContent = "Too many tries. Wait a minute."; return; }
      if (U.hn($("#hubCode").value) === C.hubHash) {
        try { sessionStorage.setItem("rb_hub", "1"); } catch (x) {} hubFails = 0; $("#hubCode").value = ""; msg.textContent = ""; render();
      } else {
        sfx("no"); msg.className = "msg no"; msg.textContent = "Wrong code."; if (++hubFails >= 5) { hubLockedUntil = Date.now() + 60000; hubFails = 0; }
      }
    });
    $("#hubLock").addEventListener("click", function () { try { sessionStorage.removeItem("rb_hub"); } catch (e) {} render(); });
    $("#hubJump").addEventListener("click", function () {
      var n = +$("#hubLevel").value; hubEnsureStarted();
      S.solved = [0, 0, 0, 0, 0].map(function (_, i) { return i < n - 1 ? 1 : 0; }); S.unlocked = n; S.finale = false; save(); hubReload("level" + n);
    });
    $("#hubSkip").addEventListener("click", function () {
      hubEnsureStarted(); if (S.finale) { $("#hubNote").textContent = "Already finished."; return; }
      var L = Math.min(Math.max(S.unlocked, 1), 5);
      if (S.unlocked >= 6) { $("#hubNote").textContent = "They're on the final screen already."; return; }
      S.solved[L - 1] = 1; S.unlocked = L + 1; save(); hubReload(L + 1 === 6 ? "finale" : "level" + (L + 1));
    });
    function allDone() { hubEnsureStarted(); S.solved = [1, 1, 1, 1, 1]; S.unlocked = 6; }
    $("#hubFinal").addEventListener("click", function () { allDone(); S.finale = false; save(); hubReload("finale"); });
    var doneArm = 0, resetArm = 0;
    $("#hubDone").addEventListener("click", function () {
      var b = $("#hubDone"); if (!doneArm) { doneArm = 1; b.textContent = "Tap again to confirm"; setTimeout(function () { doneArm = 0; b.textContent = "🎉 Show the success screen"; }, 3500); return; }
      allDone(); S.finale = true; S.finishedAt = Date.now(); S.skipped = true; save(); hubReload("finale");
    });
    $("#hubReset").addEventListener("click", function () {
      var b = $("#hubReset"); if (!resetArm) { resetArm = 1; b.textContent = "Tap again to erase this team's progress"; setTimeout(function () { resetArm = 0; b.textContent = "♻ Reset this team"; }, 3500); return; }
      try { localStorage.removeItem(KEY); sessionStorage.removeItem("rb_scroll"); } catch (e) {} location.reload();
    });
  }
  function restoreScroll() {
    var id = null; try { id = sessionStorage.getItem("rb_scroll"); sessionStorage.removeItem("rb_scroll"); } catch (e) {}
    if (id) setTimeout(function () { scrollTo(id); }, 400);
  }

  /* ---------- intro / boot ---------- */
  function boot() {
    load();
    var q = new URLSearchParams(location.search);
    if (q.get("reset") === "1") { try { localStorage.removeItem(KEY); } catch (e) {} load(); q.delete("reset"); history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q.toString() : "")); }
    cv = $("#confetti"); cx = cv.getContext("2d"); sizeCanvas(); addEventListener("resize", sizeCanvas);
    $("#tgtTxt").textContent = C.gameTarget;
    var sel = $("#teamSel");
    sel.innerHTML = '<option value="">Pick…</option>';
    for (var i = 1; i <= C.teamsTotal; i++) sel.innerHTML += '<option value="' + i + '">Team ' + i + "</option>";
    function gateBegin() { $("#beginBtn").disabled = !sel.value; }
    $("#teamSel").addEventListener("change", gateBegin);
    $("#beginBtn").addEventListener("click", function () {
      ctx(); S.team = +sel.value; S.started = true; S.startedAt = Date.now(); S.unlocked = 1; save();
      sfx("win"); confetti(false); lockIntro(); refreshBar(); showLevel(1, true); stamp("u1"); sendOnce("welcome", M.welcome, (M.welcome && M.welcome.delay) || 14); startNudges();
    });
    function themeLabel() { $("#themeBtn").textContent = document.documentElement.classList.contains("light") ? "🌙 Dark mode" : "☀️ Light mode"; }
    themeLabel();
    $("#themeBtn").addEventListener("click", function () { var on = document.documentElement.classList.toggle("light"); try { localStorage.setItem("rb26_theme", on ? "light" : "dark"); } catch (e) {} themeLabel(); });
    $("#muteBtn").addEventListener("click", function () { muted = !muted; try { localStorage.setItem("rb26_muted", muted ? "1" : "0"); } catch (e) {} if (!muted) { ctx(); sfx("rival"); } refreshBar(); });
    buildNodes();
    // restore
    if (S.started) {
      lockIntro();
      for (var n = 1; n <= Math.min(S.unlocked, 5); n++) showLevel(n, false);
      if (S.unlocked >= 6) showLevel(6, false);
      startNudges();
    }
    refreshBar(); refreshInbox();
    $("#inboxBtn").addEventListener("click", toggleInbox);
    hubInit(); restoreScroll();
    if (q.get("dev") === "1") devPanel();
  }
  function lockIntro() {
    $("#teamSel").value = S.team; $("#teamSel").disabled = true;
    $("#beginBtn").disabled = true; $("#beginBtn").textContent = "Flight in progress ✦";
  }
  function devPanel() {
    var d = document.createElement("div"); d.id = "dev"; d.innerHTML = "<b>DEV</b> ";
    for (var n = 1; n <= 6; n++) (function (n) {
      var b = document.createElement("button"); b.textContent = "→" + n;
      b.onclick = function () { if (!S.started) { S.team = S.team || 1; S.started = true; S.startedAt = Date.now(); lockIntro(); } for (var k = 1; k < n; k++) { S.solved[k - 1] = 1; } S.unlocked = n; save(); location.reload(); };
      d.appendChild(b);
    })(n);
    var r = document.createElement("button"); r.textContent = "reset"; r.onclick = function () { localStorage.removeItem(KEY); location.search = ""; }; d.appendChild(r);
    document.body.appendChild(d);
  }

  window.Race = { celebrate: celebrate, boot: boot, register: register, solveLevel: solveLevel, finish: finish, sfx: sfx, confetti: confetti, toast: toast, frag: frag, state: function () { return S; }, save: save, isSolved: function (n) { return !!S.solved[n - 1]; }, setName: function (n) { S.name = String(n).slice(0, 24); save(); }, name: function () { return S.name || ""; }, ctx: ctx, norm: U.norm, hn: U.hn, config: C };
  })();

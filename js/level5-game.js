/* Level 5 — Night Flight Training: an original cave-flyer. Clear the target number of gaps to win.
   Physics lives in createSim() so it can be tested without a browser. */
(function () {
  var W = 360, H = 540, GROUND = 36, BX = 96;
  var P = { g: 0.34, flap: -5.7, maxFall: 7, speed: 2.0, pipeW: 56, gap: 196, spacing: 200, shields: 3, invuln: 70, hbw: 9, hbh: 8 };

  function createSim(rand, target) {
    var s = { y: H / 2 - 20, vy: 0, pipes: [], score: 0, shields: P.shields, inv: 0, state: "ready", t: 0, lastCenter: H / 2, hits: 0, target: target };
    function newPipe(x) {
      var lo = P.gap / 2 + 60, hi = H - GROUND - P.gap / 2 - 50;
      var c = s.lastCenter + (rand() * 2 - 1) * 120; c = Math.max(lo, Math.min(hi, c)); s.lastCenter = c;
      return { x: x, c: c, passed: false };
    }
    s.reset = function () {
      s.y = H / 2 - 20; s.vy = 0; s.pipes = []; s.score = 0; s.shields = P.shields; s.inv = 0; s.t = 0; s.lastCenter = H / 2; s.hits = 0;
      for (var i = 0; i < 4; i++) s.pipes.push(newPipe(W + 140 + i * P.spacing));
      s.state = "ready";
    };
    s.flap = function () { s.vy = P.flap; };
    function nextPipe() { for (var i = 0; i < s.pipes.length; i++) if (s.pipes[i].x + P.pipeW > BX - P.hbw) return s.pipes[i]; return null; }
    s.step = function () {
      if (s.state === "ready") { s.t++; s.y = H / 2 - 20 + Math.sin(s.t / 12) * 6; return; }
      if (s.state !== "running") return;
      s.t++; s.vy = Math.min(P.maxFall, s.vy + P.g); s.y += s.vy;
      if (s.inv > 0) s.inv--;
      s.pipes.forEach(function (p) {
        p.x -= P.speed;
        if (!p.passed && p.x + P.pipeW < BX - P.hbw) { p.passed = true; s.score++; s.event = "point"; if (s.score >= s.target) { s.state = "won"; } }
      });
      if (s.pipes.length && s.pipes[0].x + P.pipeW < -10) { s.pipes.shift(); s.pipes.push(newPipe(s.pipes[s.pipes.length - 1].x + P.spacing)); }
      var hit = false;
      if (s.y - P.hbh < 0 || s.y + P.hbh > H - GROUND) hit = true;
      if (!hit && s.inv === 0) s.pipes.forEach(function (p) {
        if (BX + P.hbw > p.x && BX - P.hbw < p.x + P.pipeW && (s.y - P.hbh < p.c - P.gap / 2 || s.y + P.hbh > p.c + P.gap / 2)) hit = true;
      });
      if (hit && !(s.inv > 0 && !(s.y - P.hbh < 0 || s.y + P.hbh > H - GROUND))) {
        s.hits++; s.event = "hit";
        if (s.shields > 0) { // a shield absorbs the crash: bounce back to the safe middle of the next gap
          s.shields--; s.inv = P.invuln; var np = nextPipe(); s.y = np ? np.c : H / 2; s.vy = 0;
        } else { s.state = "over"; }
      }
    };
    s.reset();
    return s;
  }

  if (typeof module !== "undefined" && module.exports) { module.exports = { createSim: createSim, P: P, W: W, H: H, BX: BX }; return; }

  /* ===================== browser part ===================== */
  Race.register(5, function () {
    var cv = document.getElementById("gameCanvas"), cx = cv.getContext("2d"); cx.imageSmoothingEnabled = false;
    var target = Race.config.gameTarget;
    var sim = createSim(Math.random, target);
    var stars = []; for (var i = 0; i < 46; i++) stars.push({ x: Math.random() * W, y: Math.random() * (H - 140), s: Math.random() < .2 ? 3 : 2, p: Math.random() * 6 });
    var inView = false;
    new IntersectionObserver(function (e) { inView = e[0].isIntersecting; }, { threshold: .35 }).observe(cv);
    var overAt = 0;
    if (location.search.indexOf("dev=1") >= 0) window.__sim = sim; // test hook

    function action() {
      Race.ctx();
      if (sim.state === "ready") { sim.state = "running"; sim.flap(); Race.sfx("flap"); }
      else if (sim.state === "running") { sim.flap(); Race.sfx("flap"); }
      else if (sim.state === "over" && performance.now() - overAt > 500) sim.reset();
    }
    cv.addEventListener("pointerdown", function (e) { e.preventDefault(); action(); });
    addEventListener("keydown", function (e) {
      if (!inView) return;
      var tag = (document.activeElement && document.activeElement.tagName) || "";
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") { e.preventDefault(); action(); }
    });

    function px(x, y, w, h, c) { cx.fillStyle = c; cx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
    function bat(x, y, up, flicker) {
      if (flicker) return;
      var u = 3;
      function r(dx, dy, w, h, c) { px(x + dx * u, y + dy * u, w * u, h * u, c); }
      for (var i = 0; i < 6; i++) {
        var wy = up ? -3 - Math.round(i * .9) : -1 + Math.round(i * .7), hh = i > 3 ? 2 : 3;
        r(-3 - i, wy, 1, hh, "#8d6bd6"); r(3 + i, wy, 1, hh, "#8d6bd6");
      }
      r(-2, -2, 5, 5, "#b69cff"); r(-2, -4, 1, 2, "#b69cff"); r(2, -4, 1, 2, "#b69cff");
      r(2, -5, 2, 2, "#ff8fd0"); r(4, -4, 1, 1, "#ff8fd0");          // little bow
      r(-1, -1, 1, 1, "#fff"); r(1, -1, 1, 1, "#fff"); r(0, 1, 1, 1, "#fff");
    }
    function rock(x, y, w, h, tipDown) {
      px(x, y, w, h, "#4a3a86"); px(x + 4, y, 8, h, "#5d4aa3"); px(x + w - 10, y, 6, h, "#3a2c6e");
      for (var k = 0; k < h; k += 22) px(x + 18, y + k, 14, 3, "#3a2c6e");
      var ly = tipDown ? y + h - 14 : y; px(x - 4, ly, w + 8, 14, "#7a66c8"); px(x - 4, ly + (tipDown ? 10 : 0), w + 8, 4, "#5d4aa3");
      // pixel stalactite / stalagmite spikes
      for (var j = 0; j < 3; j++) { var sw = 12 - j * 4, sx = x + w / 2 - sw / 2, sh = (j + 1) * 6; px(sx, tipDown ? y + h + j * 6 - 0 : y - (j + 1) * 6, sw, 6, "#7a66c8"); }
    }
    function draw() {
      // sky bands
      var bands = ["#1a0f3a", "#201046", "#27134f", "#2f1659", "#391a66", "#451d72", "#52227b"];
      for (var b = 0; b < bands.length; b++) px(0, b * ((H - GROUND) / bands.length), W, (H - GROUND) / bands.length + 1, bands[b]);
      stars.forEach(function (s) { var a = .45 + .55 * Math.abs(Math.sin(sim.t / 40 + s.p)); cx.globalAlpha = a; px(s.x, s.y, s.s, s.s, "#fff"); }); cx.globalAlpha = 1;
      cx.fillStyle = "#ffd98a"; cx.beginPath(); cx.arc(292, 86, 24, 0, 7); cx.fill(); cx.fillStyle = "#27134f"; cx.beginPath(); cx.arc(302, 80, 22, 0, 7); cx.fill();
      // cave rocks
      sim.pipes.forEach(function (p) {
        var top = p.c - P.gap / 2, bot = p.c + P.gap / 2;
        rock(p.x, -4, P.pipeW, top + 4, true); rock(p.x, bot, P.pipeW, H - GROUND - bot, false);
      });
      // floor
      px(0, H - GROUND, W, GROUND, "#2a1b4a"); px(0, H - GROUND, W, 5, "#ff8fd0");
      var off = (sim.t * P.speed) % 24; for (var f = -24; f < W + 24; f += 24) px(f - off, H - GROUND + 14, 12, 4, "#3a2c6e");
      // bat
      bat(BX, sim.y, sim.vy < 0 || (sim.t % 20 < 10 && sim.state === "ready"), sim.inv > 0 && (sim.t % 8 < 4));
      // HUD
      cx.textAlign = "center"; cx.font = "bold 40px ui-monospace, Menlo, Consolas, monospace";
      cx.fillStyle = "#000a"; cx.fillText(sim.score + " / " + target, W / 2 + 2, 62); cx.fillStyle = "#fff"; cx.fillText(sim.score + " / " + target, W / 2, 60);
      cx.textAlign = "left"; cx.font = "22px sans-serif";
      var hearts = ""; for (var h = 0; h < P.shields; h++) hearts += h < sim.shields ? "💜" : "🖤"; cx.fillText(hearts, 10, H - 10);
      cx.textAlign = "center";
      if (sim.state === "ready") { cx.font = "bold 22px ui-monospace, monospace"; cx.fillStyle = "#fff"; cx.fillText("TAP / SPACE TO FLAP", W / 2, H / 2 + 70); cx.font = "15px ui-monospace, monospace"; cx.fillStyle = "#ffc2e6"; cx.fillText("fly through " + target + " gaps · 💜 = shields", W / 2, H / 2 + 98); }
      if (sim.state === "over") { px(30, H / 2 - 70, W - 60, 130, "#150d2bee"); cx.font = "bold 26px ui-monospace, monospace"; cx.fillStyle = "#ff8fd0"; cx.fillText("Oh no! Out of shields", W / 2, H / 2 - 28); cx.fillStyle = "#fff"; cx.font = "18px ui-monospace, monospace"; cx.fillText("You cleared " + sim.score + " gap" + (sim.score === 1 ? "" : "s"), W / 2, H / 2 + 4); cx.fillStyle = "#7ef0d0"; cx.fillText("tap to try again", W / 2, H / 2 + 38); }
      if (sim.state === "won") { px(24, H / 2 - 70, W - 48, 130, "#150d2bee"); cx.font = "bold 28px ui-monospace, monospace"; cx.fillStyle = "#7ef0d0"; cx.fillText("✨ Calibrated! ✨", W / 2, H / 2 - 18); cx.fillStyle = "#fff"; cx.font = "17px ui-monospace, monospace"; cx.fillText("R.B. knows the route.", W / 2, H / 2 + 20); }
    }

    var last = performance.now(), acc = 0, STEP = 1000 / 60, solved = false;
    function frame(now) {
      var dt = Math.min(100, now - last); last = now; acc += dt;
      while (acc >= STEP) {
        acc -= STEP; var prev = sim.state; sim.event = null; sim.step();
        if (sim.event === "point") Race.sfx("point");
        if (sim.event === "hit") Race.sfx("hit");
        if (prev === "running" && sim.state === "over") overAt = performance.now();
        if (sim.state === "won" && !solved) { solved = true; setTimeout(function () { Race.solveLevel(5); }, 700); }
      }
      draw(); requestAnimationFrame(frame);
    }
    if (Race.isSolved(5)) { sim.score = target; sim.state = "won"; solved = true; }
    requestAnimationFrame(frame);
  });
})();

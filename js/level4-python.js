/* Level 4 — Python for everyone: type a line, order a script (with plain-English notes), find a bug, trace code (with an optional step-through) */
Race.register(4, function () {
  var $ = function (s) { return document.querySelector(s); };
  var C = Race.config;
  function unlockStage(id) { var s = $("#" + id); s.classList.remove("locked"); setTimeout(function () { s.scrollIntoView({ behavior: "smooth", block: "center" }); }, 200); }

  /* ---------- Stage 1: Hello, Riverbats! ---------- */
  var hIn = $("#helloIn"), hMsg = $("#helloMsg"), hTerm = $("#helloTerm"), hDone = false, hTries = 0;
  function helloGo() {
    if (hDone) return; Race.ctx();
    var v = hIn.value.trim();
    if (/^print\s*\(\s*(["'])\s*hello,?\s*riverbats\s*!?\s*\1\s*\)$/i.test(v)) {
      hDone = true; hIn.disabled = true; $("#helloRun").disabled = true; hMsg.textContent = "";
      hTerm.hidden = false; hTerm.textContent = ">>> python engine.py\nHello, Riverbats!\n(Your first Python program. The engine says hi back. 🦇)"; Race.sfx("win");
      setTimeout(function () { unlockStage("p2"); }, 900);
    } else {
      hTries++; Race.sfx("no"); hMsg.className = "msg no";
      if (!/print/i.test(v)) hMsg.textContent = "The engine only listens to " + "print( ). Start your line with print.";
      else if (!/\(/.test(v) || !/\)\s*$/.test(v)) hMsg.textContent = "Don't forget the parentheses: print( ... )";
      else if (!/["']/.test(v)) hMsg.textContent = "Words go inside quotes: \"like this\".";
      else hMsg.textContent = "Close! Check the exact words: Hello, Riverbats! (capital letters, comma and exclamation point).";
      if (hTries >= 3) $("#helloHint").click();
    }
  }
  $("#helloRun").addEventListener("click", helloGo);
  hIn.addEventListener("keydown", function (e) { if (e.key === "Enter") helloGo(); });
  $("#helloHint").addEventListener("click", function () {
    hMsg.className = "msg"; hMsg.innerHTML = "Hint: it looks like <code>print(\"Hello, Riverbats!\")</code> with the words inside quotes. Type it yourself so your fingers learn it.";
  });

  /* ---------- Stage 2: order the script (with plain-English notes) ---------- */
  var L = ["bats = [4, 7, 2, 9]   # 4 caves, with this many bats in each", "total = 0   # start counting at zero", "for b in bats:   # visit each cave, one at a time", "    total = total + b   # add that cave's bats to the total", "print(total)   # show the final number"];
  var items = L.map(function (t, i) { return { id: "P" + i, text: t }; });
  var expected = [["P0", "P1"], ["P0", "P1"], ["P2"], ["P3"], ["P4"]];
  var ord = DnD.ordering({ pool: $("#pyPool"), slots: $("#pySlots"), items: items, expected: expected, msg: $("#pyMsg") });
  var run = $("#pyRun"), term = $("#pyTerm");
  $("#pyCheck").addEventListener("click", function () {
    if (!ord.check()) return;
    $("#pyCheck").disabled = true; run.hidden = false; Race.sfx("point");
  });
  run.addEventListener("click", function () {
    term.hidden = false; term.textContent = ">>> python engine.py\n22\n(The loop added 4 + 7 + 2 + 9 = 22 bats.)"; run.disabled = true; Race.sfx("win");
    setTimeout(function () { unlockStage("p3"); }, 900);
  });

  /* ---------- Stage 3: click the buggy line ---------- */
  var BUG = ["fuel = 100", "for flight in range(3)", "    fuel = fuel - 15", "print(fuel)"];
  var box = $("#bugLines"), bmsg = $("#bugMsg"), wrong = 0;
  BUG.forEach(function (t, i) {
    var b = document.createElement("button"); b.type = "button"; b.textContent = (i + 1) + "   " + t; box.appendChild(b);
    b.addEventListener("click", function () {
      if (i === 1) {
        b.classList.add("good"); bmsg.className = "msg ok"; bmsg.innerHTML = "✓ Found it! A <code>for</code> line must end with a colon <code>:</code>";
        b.textContent = "2   for flight in range(3):"; Array.prototype.forEach.call(box.children, function (x) { x.disabled = true; }); Race.sfx("point");
        unlockStage("p4");
      } else {
        wrong++; b.classList.remove("bad"); void b.offsetWidth; b.classList.add("bad"); bmsg.className = "msg no";
        bmsg.textContent = wrong >= 2 ? "That line is fine. Hint: the line that starts a loop is missing its special ending symbol." : "That line is fine. Look for a missing symbol."; Race.sfx("no");
      }
    });
  });

  /* ---------- Stage 4: trace the code (optional step-through) ---------- */
  function stepper(host, code, steps) {
    host.innerHTML = '<div class="stephead">👇 <b>Optional:</b> click <b>Step</b> to run the code one line at a time. <b>Keep clicking it</b>: every click runs the next line.</div><pre class="code stepcode"></pre><div class="row"><button class="stepbtn pulse" type="button" data-a="step"></button><button class="ghost small" type="button" data-a="reset">↺ Start over</button><span class="stepcount"></span></div><div class="stepnote"></div><div class="vars"></div>';
    var pre = host.querySelector("pre"), note = host.querySelector(".stepnote"), vars = host.querySelector(".vars"), at = -1;
    var sb = host.querySelector('[data-a="step"]'), cnt = host.querySelector(".stepcount");
    var spans = code.map(function (t) { var s = document.createElement("span"); s.className = "ln"; s.textContent = t; pre.appendChild(s); pre.appendChild(document.createTextNode("\n")); return s; });
    function show() {
      spans.forEach(function (s) { s.classList.remove("hl"); });
      var last = at >= steps.length - 1;
      sb.disabled = last; sb.classList.toggle("pulse", at < 0);
      sb.textContent = last ? "✓ Finished" : (at < 0 ? "▶ Step: run the first line" : "▶ Step: run the next line");
      cnt.textContent = "Step " + (at + 1) + " of " + steps.length;
      if (at < 0) { note.textContent = "Nothing has run yet. Click the big button above!"; vars.textContent = ""; return; }
      var st = steps[at]; spans[st.line].classList.add("hl"); note.textContent = st.note + (last ? "  (That's the end. Now type what it printed below.)" : "");
      vars.innerHTML = Object.keys(st.vars).map(function (k) { return "<span><b>" + k + "</b> = " + st.vars[k] + "</span>"; }).join("");
    }
    sb.addEventListener("click", function () { if (at < steps.length - 1) at++; Race.sfx("point"); show(); });
    host.querySelector('[data-a="reset"]').addEventListener("click", function () { at = -1; show(); });
    show();
  }
  stepper($("#stepFuel"), ["fuel = 100", "for flight in range(3):", "    fuel = fuel - 15", "print(fuel)"], [
    { line: 0, vars: { fuel: 100 }, note: "Start with 100 fuel." },
    { line: 1, vars: { fuel: 100, flight: 0 }, note: "Loop trip 1 of 3 begins." },
    { line: 2, vars: { fuel: 85, flight: 0 }, note: "Take away 15." },
    { line: 1, vars: { fuel: 85, flight: 1 }, note: "Loop trip 2 of 3 begins." },
    { line: 2, vars: { fuel: 70, flight: 1 }, note: "Take away 15 again." },
    { line: 1, vars: { fuel: 70, flight: 2 }, note: "Loop trip 3 of 3 begins." },
    { line: 2, vars: { fuel: 55, flight: 2 }, note: "Take away 15 one more time. The loop is finished." },
    { line: 3, vars: { fuel: 55 }, note: "print shows the fuel on the screen." }
  ]);
  stepper($("#stepNames"), ["bats = [\"Echo\", \"Nova\", \"Rio\", \"Luna\"]", "count = 0", "for name in bats:", "    if len(name) == 4:", "        count = count + 1", "print(count)"], [
    { line: 0, vars: { bats: "Echo, Nova, Rio, Luna" }, note: "A list of four bat names." },
    { line: 1, vars: { count: 0 }, note: "Start the count at zero." },
    { line: 2, vars: { count: 0, name: "Echo" }, note: "First name: Echo." },
    { line: 4, vars: { count: 1, name: "Echo" }, note: "E-c-h-o is 4 letters, so add 1." },
    { line: 2, vars: { count: 1, name: "Nova" }, note: "Next name: Nova." },
    { line: 4, vars: { count: 2, name: "Nova" }, note: "N-o-v-a is 4 letters, so add 1." },
    { line: 2, vars: { count: 2, name: "Rio" }, note: "Next name: Rio." },
    { line: 3, vars: { count: 2, name: "Rio" }, note: "R-i-o is only 3 letters, so skip it." },
    { line: 2, vars: { count: 2, name: "Luna" }, note: "Last name: Luna." },
    { line: 4, vars: { count: 3, name: "Luna" }, note: "L-u-n-a is 4 letters, so add 1." },
    { line: 5, vars: { count: 3 }, note: "print shows the count." }
  ]);
  var got = [false, false];
  [["#pq1", "#pa1"], ["#pq2", "#pa2"]].forEach(function (p, i) {
    var q = $(p[0]), inp = $(p[1]), btn = q.querySelector("button"), msg = q.querySelector(".msg");
    function go() {
      Race.ctx();
      if (inp.value !== "" && Race.hn(String(+inp.value)) === C.pyHashes[i]) {
        got[i] = true; q.classList.add("ok"); msg.className = "msg ok"; msg.textContent = "✓ You ran it perfectly in your head!"; inp.disabled = btn.disabled = true; Race.sfx("point");
        if (got[0] && got[1]) Race.solveLevel(4);
      } else {
        msg.className = "msg no"; Race.sfx("no");
        msg.textContent = i === 0 ? "Try the big Step button above and keep clicking it. The loop runs 3 times." : "Try the big Step button above and keep clicking it. Which names have exactly 4 letters?";
      }
    }
    btn.addEventListener("click", go); inp.addEventListener("keydown", function (e) { if (e.key === "Enter") go(); });
  });

  if (Race.isSolved(4)) { ["p2", "p3", "p4"].forEach(function (id) { $("#" + id).classList.remove("locked"); }); }
});

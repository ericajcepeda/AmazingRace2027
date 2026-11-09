/* Level 1 — ECHO, a scripted chatbot with fixed responses.
   Flow: ECHO asks for a name -> greets them -> ACC trivia (multiple choice) -> memory restored -> Fragment 1.
   Every fact below comes from ACC's own pages (austincc.edu, catalog, sites.austincc.edu). Edit freely. */
Race.register(1, function () {
  var $ = function (s) { return document.querySelector(s); };
  var log = $("#chatLog"), form = $("#chatForm"), input = $("#chatInput"), choices = $("#chatChoices"), mem = $("#memPct");
  var busy = false, mode = "name", attempts = 0;

  var QS = [
    { q: "First question! Who is ACC's official mascot?",
      opts: ["R.B. the Riverbat", "Benny the Bobcat", "Austin the Armadillo", "Willie the Longhorn"], ans: 0,
      hint: "Hint: it flies, and it's right there in the nickname Riverbats. 🦇",
      fact: "R.B. the Riverbat! That's my boss. 🦇 Every ACC student is a Riverbat." },
    { q: "Next up: ACC held its very first classes in the fall of what year?",
      opts: ["1953", "1973", "1993", "2003"], ans: 1,
      hint: "Hint: ACC celebrated its 50th anniversary in 2023.",
      fact: "1973! The first classes began on September 17, 1973, at the Ridgeview Campus in East Austin. Austin voters had said “Yes” to a community college in 1972.",
      img: { url: "https://i0.wp.com/instruction.austincc.edu/wp-content/uploads/2022/07/RB-GIFs-ACC-Ridgeview-1970s.gif?ssl=1", cap: "Ridgeview in the 1970s 🦇" } },
    { q: "ACC has four values. Which one of these is NOT one of them?",
      opts: ["Courage", "Compassion", "Joy", "Competition"], ans: 3,
      hint: "Hint: ACC is a community, not a contest. 💜",
      fact: "Right! ACC's four values are Courage, Compassion, Joy, and Yes. ACC students helped develop them." },
    { q: "ACC's vision statement is “To love our students to ____.”",
      opts: ["success", "graduation", "the finish line", "perfection"], ans: 0,
      hint: "Hint: it's the thing every college wants for its students.",
      fact: "“To love our students to success.” 💜 I'm getting my memory back!" },
    { q: "Time for some computer science! The BAS in Software Development lives in which ACC department?",
      opts: ["Software Development & Computer Science", "Bat Aerodynamics", "Applied Wizardry & Potions", "Echolocation Engineering"], ans: 0,
      hint: "Hint: the answer starts with the word “Software.”",
      fact: "Software Development & Computer Science (SD&CS), which used to be just “Computer Science.” It covers programming, web development, data science, and game development." },
    { q: "What does “BAS” stand for in ACC's BAS in Software Development?",
      opts: ["Bachelor of Applied Science", "Bachelor of Advanced Software", "Bachelor of Arts and Sciences", "Basic Applied Studies"], ans: 0,
      hint: "Hint: the A is for “Applied.”",
      fact: "Bachelor of Applied Science! The BAS in Software Development launched in 2020 so students with an associate degree (an AAS) can take their tech skills further." },
    { q: "To apply to the BAS in Software Development, you need to be ____ in Math and ELAR.",
      opts: ["TSI Complete", "Honor Roll certified", "Dual-credit approved", "Bat-signal ready"], ans: 0,
      hint: "Hint: three letters, then “Complete.”",
      fact: "TSI Complete! TSI stands for the Texas Success Initiative, and ELAR means English Language Arts and Reading." },
    { q: "ACC has a guaranteed-transfer partnership called “Bats to Cats.” Which university are the “Cats”?",
      opts: ["Texas State University", "UT Austin", "Texas A&M", "St. Edward's University"], ans: 0,
      hint: "Hint: its mascot is the Bobcat. 🐾",
      fact: "Texas State University! The name comes from the two mascots, the Riverbat and the Bobcat. ACC and Texas State signed the Bats to Cats agreement on April 18, 2024, so ACC students can transfer with guaranteed admission.\n\nFor our department, there is exactly one Software Development & Computer Science Bats to Cats pathway: ACC’s Associate of Science in Computer Science, which transfers into Texas State’s Bachelor of Science in Computer Science.",
      img: { url: "https://www.austincc.edu/wp-content/uploads/20240711-TXST-Bats-to-Cats-ca-638.jpg", cap: "Bats to Cats signing, April 2024" },
      img2: { url: "https://sites.austincc.edu/cs/wp-content/uploads/sites/189/2026/05/IMG_7766.jpg", cap: "Nick M., Class of 2026, one of our proud SD&CS graduates! 🎓", say: "Speaking of success stories: meet Nick M., one of our SD&CS graduates, Class of 2026! 🎓" } },
    { q: "Last question! Who is the Chancellor of Austin Community College?",
      opts: ["Dr. Russell Lowery-Hart", "Dr. Richard Rhodes", "Dr. Thomas Hatfield", "Dr. Echo Batsworth"], ans: 0,
      hint: "Hint: he goes by his first name, Russell.",
      fact: "Dr. Russell Lowery-Hart, ACC's ninth Chancellor, who started in October 2023. (Dr. Rhodes was the one before him, and Dr. Hatfield was ACC's very first president.)" }
  ];
  var WRONG = ["Hmm, that's not what my memory says. Try another! 🦇", "Not quite. My circuits say otherwise.", "Close, but no. Give it another go!"];
  var wrongCount = 0;

  function shuffle(a) { return DnD.shuffle(a); }
  function bubble(text, cls) {
    var b = document.createElement("div"); b.className = "bubble " + (cls || "bot"); b.textContent = text;
    log.appendChild(b); log.scrollTop = log.scrollHeight; return b;
  }
  function imgBubble(im, cb) {
    var b = document.createElement("div"); b.className = "bubble bot imgb";
    var img = new Image(); img.referrerPolicy = "no-referrer"; img.alt = im.cap || "";
    img.onerror = function () { b.remove(); if (cb) cb(); };
    img.onload = function () { b.appendChild(img); if (im.cap) { var c = document.createElement("div"); c.className = "cap"; c.textContent = im.cap; b.appendChild(c); } log.appendChild(b); log.scrollTop = log.scrollHeight; setTimeout(function () { if (cb) cb(); }, 600); };
    img.src = im.url;
  }
  function botSay(text, cb, cls) {
    busy = true;
    var d = document.createElement("div"); d.className = "bubble bot"; d.innerHTML = '<span class="dots"><span></span><span></span><span></span></span>';
    log.appendChild(d); log.scrollTop = log.scrollHeight;
    setTimeout(function () { d.remove(); bubble(text, cls); Race.sfx("recv"); busy = false; if (cb) cb(); }, 650 + Math.min(text.length * 8, 1000));
  }
  function setMem(i) { mem.textContent = Math.round(47 + (53 * i) / QS.length); }

  /* ----- name step ----- */
  function cleanName(raw) {
    var n = raw.trim().replace(/[<>]/g, "");
    var prefix = /^(my name is|my name's|i am|i'm|im|it's|its|this is|we are|we're|call me|hi,?|hello,?)\s+/i, guard = 0;
    while (prefix.test(n) && guard++ < 3) n = n.replace(prefix, "");
    n = n.replace(/[.!?]+$/, "").trim().slice(0, 24);
    return n ? n.charAt(0).toUpperCase() + n.slice(1) : "";
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault(); Race.ctx();
    var raw = input.value; if (!raw.trim() || busy) return;
    bubble(raw.trim(), "me"); Race.sfx("send"); input.value = "";
    var name = cleanName(raw);
    if (!name) { return botSay("I didn't catch that. What should I call you?"); }
    Race.setName(name); form.hidden = true;
    botSay("Hi, " + name + "! I am ECHO. 🦇 Something scrambled my memory overnight, and everything I knew about ACC is jumbled up. Answer my questions to restore it.\n\nLet's start the challenge!", function () { ask(0); });
  });

  /* ----- quiz step ----- */
  function ask(i) {
    setMem(i); wrongCount = 0;
    botSay(QS[i].q, function () { showChoices(i); });
  }
  function showChoices(i) {
    var q = QS[i]; choices.innerHTML = ""; choices.hidden = false;
    shuffle(q.opts.map(function (t, k) { return { t: t, ok: k === q.ans }; })).forEach(function (o) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = o.t; choices.appendChild(b);
      b.addEventListener("click", function () {
        if (busy) return; Race.ctx();
        bubble(o.t, "me"); Race.sfx("send");
        if (o.ok) {
          b.classList.add("right"); Array.prototype.forEach.call(choices.children, function (x) { x.disabled = true; }); Race.sfx("point");
          setMem(i + 1);
          var next = function () { choices.hidden = true; if (i + 1 < QS.length) ask(i + 1); else lesson(); };
          botSay("✓ Correct! " + q.fact, function () {
            if (!q.img) return next();
            imgBubble(q.img, function () { if (!q.img2) return next(); botSay(q.img2.say, function () { imgBubble(q.img2, next); }); });
          });
        } else {
          b.classList.add("tried"); b.disabled = true; wrongCount++; Race.sfx("no");
          botSay(WRONG[(wrongCount - 1) % WRONG.length] + (wrongCount >= 2 ? "\n" + q.hint : ""));
        }
      });
    });
    log.scrollTop = log.scrollHeight;
  }

  /* ----- bonus lesson: how to write a prompt, then "generate" bat pictures ----- */
  function art(v) {
    var pal = [["#1b1245", "#6a2a8a", "#fff3c4"], ["#0d1b3a", "#2a5a9a", "#ffe9a8"], ["#2a0f3a", "#b04a8a", "#fff0d0"]][v % 3];
    var bat = "150,126 158,108 164,126 190,116 232,104 214,138 240,150 204,152 196,176 176,160 164,184 150,168 136,184 124,160 104,176 96,152 60,150 86,138 68,104 110,116 136,126 142,108";
    if (v < 0) return '<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="300" fill="#8a8a95"/><polygon points="' + bat + '" fill="#4a4a55" transform="translate(75 75) scale(.5)"/></svg>';
    return '<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g' + v + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + pal[0] + '"/><stop offset="1" stop-color="' + pal[1] + '"/></linearGradient></defs><rect width="300" height="300" fill="url(#g' + v + ')"/>' +
      '<circle cx="' + (150 + (v - 1) * 18) + '" cy="130" r="78" fill="' + pal[2] + '"/><circle cx="' + (130 + v * 14) + '" cy="108" r="12" fill="#00000012"/>' +
      '<g fill="#fff" opacity=".8"><circle cx="40" cy="50" r="2"/><circle cx="250" cy="40" r="2"/><circle cx="270" cy="150" r="1.6"/><circle cx="30" cy="190" r="1.6"/><circle cx="220" cy="250" r="2"/></g>' +
      '<polygon points="' + bat + '" fill="#10061f" transform="translate(' + (v - 1) * 10 + ' ' + (v * 6 - 6) + ')"/></svg>';
  }
  function genFigure(i, num) {
    var f = document.createElement("figure"); f.tabIndex = 0;
    var cap = document.createElement("figcaption"); cap.textContent = "Image " + num;
    var img = new Image(); img.referrerPolicy = "no-referrer"; img.alt = "Generated bat in front of a moon, variation " + num;
    var box = document.createElement("div"); box.className = "gimg"; box.appendChild(img); f.appendChild(box); f.appendChild(cap);
    img.onerror = function () { box.innerHTML = art(i); };
    var u = (Race.config.genImages || [])[i]; if (u) img.src = u; else img.onerror();
    return f;
  }
  function generate(count, vague, cb) {
    busy = true;
    var b = document.createElement("div"); b.className = "bubble bot genb";
    b.innerHTML = '<div>🎨 Generating… <b class="gp">0</b>%</div><div class="gbar"><i></i></div>';
    log.appendChild(b); log.scrollTop = log.scrollHeight;
    var p = 0, t = setInterval(function () {
      p = Math.min(100, p + Math.round(5 + Math.random() * 11));
      b.querySelector(".gp").textContent = p; b.querySelector(".gbar i").style.width = p + "%";
      if (p >= 100) { clearInterval(t); setTimeout(done, 250); }
    }, 170);
    function done() {
      b.innerHTML = ""; var g = document.createElement("div"); g.className = "gen-grid" + (vague ? " one" : "");
      if (vague) { var f = document.createElement("figure"); f.innerHTML = '<div class="gimg">' + art(-1) + '</div><figcaption>"a bat"</figcaption>'; g.appendChild(f); }
      else for (var i = 0; i < count; i++) g.appendChild(genFigure(i, i + 1));
      b.appendChild(g); Race.sfx("win"); busy = false; log.scrollTop = log.scrollHeight; cb(g);
    }
  }
  function lesson() {
    setMem(QS.length);
    botSay("Memory at 100%! 🎉 Before I give you your fragment, " + Race.name() + ", I want to teach you one bonus skill. I can turn words into pictures. The words you give an AI are called a prompt. Watch what a lazy prompt does…", function () {
      bubble('Prompt: "a bat"', "sys");
      generate(1, true, function () {
        botSay("Meh. 😕 A gray blob with wings. The AI only has your words to work with. A strong prompt has three parts:\n\n🎯 Subject: what is it?\n🎬 Action: what is it doing?\n🌍 Setting: where and when?\n\nFor example: “A bat (subject) gliding (action) in front of a full moon (setting).”", function () {
          botSay("Your turn, " + Race.name() + "! Build a prompt by dragging one piece into each box (or tap a piece, then tap a box). Watch the sentence at the bottom. This is exactly what the AI will draw.", function () { builder(); });
        });
      });
    });
  }
  /* drag-and-drop prompt builder: every combination makes the same kind of picture, a bat flying across a full moon at night */
  var PB = {
    subject: [{ id: "s1", t: "a bat" }, { id: "s2", t: "a Riverbat" }, { id: "s3", t: "R.B. the bat" }],
    action:  [{ id: "a1", t: "flying across" }, { id: "a2", t: "gliding past" }, { id: "a3", t: "soaring in front of" }],
    setting: [{ id: "t1", t: "a full moon at night" }, { id: "t2", t: "a glowing full moon in a dark sky" }, { id: "t3", t: "the moon on a midnight sky" }]
  };
  function builder() {
    form.hidden = true;
    var wrap = document.createElement("div"); wrap.className = "bubble bot genb pb";
    wrap.innerHTML = '<div class="pbslots"></div><div class="pbpool" aria-label="Prompt pieces"></div><div class="pbpreview"></div><div class="msg" aria-live="polite"></div><div class="row"><button type="button" class="pbgo">🎨 Generate</button></div>';
    log.appendChild(wrap);
    var slotsEl = wrap.querySelector(".pbslots"), pool = wrap.querySelector(".pbpool"), prev = wrap.querySelector(".pbpreview"), msg = wrap.querySelector(".msg");
    var cats = [["subject", "🎯 Subject: what is it?"], ["action", "🎬 Action: what is it doing?"], ["setting", "🌍 Setting: where and when?"]], boxes = {}, chips = [];
    cats.forEach(function (c) {
      var d = document.createElement("div"); d.className = "pbslot"; d.innerHTML = "<h5>" + c[1] + "</h5>"; d.dataset.cat = c[0]; slotsEl.appendChild(d); boxes[c[0]] = d;
      PB[c[0]].forEach(function (o) { chips.push({ id: o.id, text: o.t, cat: c[0] }); });
    });
    var items = chips.map(function (c) { return { id: c.id, text: c.text }; });
    var catOf = {}; chips.forEach(function (c) { catOf[c.id] = c.cat; });
    var els = DnD.chipSet(items);
    DnD.shuffle(items).forEach(function (it) { pool.appendChild(els[it.id]); });
    function sentence() {
      var parts = cats.map(function (c) { var ch = boxes[c[0]].querySelector(".chip"); return ch ? ch.textContent : "____"; });
      prev.textContent = "Prompt: “" + parts.join(" ") + "”";
      return parts.indexOf("____") < 0;
    }
    function toPool(c) { pool.appendChild(c); Object.keys(boxes).forEach(function (k) { boxes[k].classList.toggle("filled", !!boxes[k].querySelector(".chip")); }); sentence(); }
    function put(c, box) {
      if (catOf[c.dataset.id] !== box.dataset.cat) { box.classList.remove("bad"); void box.offsetWidth; box.classList.add("bad"); Race.sfx("no"); msg.className = "msg no"; msg.textContent = "That piece belongs in a different box. Check the labels!"; return; }
      var old = box.querySelector(".chip"); if (old && old !== c) pool.appendChild(old);
      box.appendChild(c); msg.textContent = ""; box.classList.remove("bad");
      Object.keys(boxes).forEach(function (k) { boxes[k].classList.toggle("filled", !!boxes[k].querySelector(".chip")); }); Race.sfx("point"); sentence();
    }
    Object.keys(boxes).forEach(function (k) { DnD.zone(boxes[k], function (c) { put(c, boxes[k]); }); });
    DnD.zone(pool, function (c) { toPool(c); });
    items.forEach(function (it) {
      DnD.bindChipClick(els[it.id], function (c) {
        if (DnD.selected()) { var sel = DnD.selected(); if (sel !== c) { var tgt = c.parentNode; DnD.deselect(); if (tgt.classList.contains("pbslot")) put(sel, tgt); else toPool(sel); return; } }
        if (c.parentNode.classList.contains("pbslot")) { toPool(c); return; }
        DnD.pick(c);
      });
    });
    sentence();
    wrap.querySelector(".pbgo").addEventListener("click", function () {
      Race.ctx();
      if (!sentence()) { msg.className = "msg no"; msg.textContent = "Fill all three boxes first."; Race.sfx("no"); return; }
      var text = prev.textContent.replace(/^Prompt: “|”$/g, "");
      wrap.querySelector(".pbgo").disabled = true; Array.prototype.forEach.call(wrap.querySelectorAll(".chip"), function (c) { c.draggable = false; });
      bubble("Prompt: " + text, "me"); mode = "done";
      botSay("All three parts. Beautiful prompt! ✓✓✓\n\nGenerating from your prompt…", function () { afterPrompt(); });
    });
    log.scrollTop = log.scrollHeight;
  }
  function afterPrompt() {
    generate(3, false, function (grid) {
      botSay("One prompt, three different pictures. An AI never makes the exact same image twice, so you can keep asking until it matches what's in your head. Tap your favorite!", function () {
        var figs = grid.querySelectorAll("figure"), chosen = false;
        Array.prototype.forEach.call(figs, function (f, k) {
          f.classList.add("pickable");
          function pick() {
            if (chosen || busy) return; chosen = true; f.classList.add("picked"); Race.sfx("point"); bubble("I like image " + (k + 1) + "!", "me");
            botSay("Great eye, " + Race.name() + "! Remember: the more detail you give, the closer the picture gets to the one in your head. And always double-check AI's work, because it can be confidently wrong.", finish);
          }
          f.addEventListener("click", pick); f.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
        });
      });
    });
  }
  function finish() {
    botSay("Thank you, " + Race.name() + ". Here is your first Flight Fragment…", function () {
      bubble("✦ FLIGHT FRAGMENT 1 RESTORED: " + Race.frag(1) + " ✦", "bot win");
      botSay("Courage is one of ACC's four values. It means honesty and openness. Write this fragment in your Mission Log! 💜", function () { Race.solveLevel(1); });
    });
  }

  /* ----- start / restore ----- */
  if (Race.isSolved(1)) {
    setMem(QS.length); form.hidden = true;
    bubble("ECHO restored to 100%. Fragment 1: " + Race.frag(1) + " ✓", "sys");
  } else if (Race.name()) {
    bubble("⚠ SYSTEM RESTORE IN PROGRESS… ECHO online (47% memory)", "sys"); form.hidden = true;
    botSay("Welcome back, " + Race.name() + "! Let's pick up the challenge.", function () { ask(0); });
  } else {
    bubble("⚠ SYSTEM RESTORE IN PROGRESS… ECHO online (47% memory)", "sys");
    setTimeout(function () { botSay("Hello? Is somebody there? 🦇 I'm ECHO, the Bat Lab's navigation assistant. My memory got scrambled overnight, and before I can fix it I need to know… what's your name?", function () { input.focus(); }); }, 500);
  }
});

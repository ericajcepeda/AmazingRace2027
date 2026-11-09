/* Level 3 — HTML / CSS / JavaScript: skeleton, skin, brain */
Race.register(3, function () {
  var $ = function (s) { return document.querySelector(s); };
  var C = Race.config;

  /* ---------- Stage 1: layer viewer ---------- */
  var HTML = '<h1>Bat Pass 🦇</h1>\n<img src="bat.png" alt="R.B.">\n<p>Today\'s flight facts:</p>\n<ul>\n  <li>Bats are mammals</li>\n  <li>They use echolocation</li>\n  <li>Some migrate far</li>\n  <li>R.B. is the best</li>\n</ul>\n<button id="wake">Wake the bat</button>\n<p id="out">Counter: 0</p>';
  var CSS = 'body {\n  background: #2a1b4a;\n  color: #fff5ff;\n  font-family: Georgia;\n  padding: 12px;\n}\nh1 { color: #ff8fd0; margin: 0 0 6px; }\nimg { width: 64px; }\nli { margin: 6px 0; }\n#out { font-size: 24px; }\nbutton {\n  background: #ff8fd0;\n  border: 0;\n  padding: 10px 16px;\n  border-radius: 20px;\n  font-weight: bold;\n}';
  var JS = 'let n = 0;\nlet chirp = new Audio("chirp.wav");\ndocument.getElementById("wake").onclick = function () {\n  n = n + 3;\n  chirp.play();\n  document.getElementById("out").textContent = "Counter: " + n;\n};';
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  var swCss = $("#swCss"), swJs = $("#swJs"), frame = $("#layerFrame"), codeBox = $("#layerCode");
  function render() {
    var doc = "<!DOCTYPE html><html><head><meta charset='utf-8'><style>html,body{overflow:hidden}body{margin:0;padding:12px}</style>" + (swCss.checked ? "<style>" + CSS + "</style>" : "") + "</head><body>" + HTML + (swJs.checked ? "<script>" + JS + "<\/script>" : "") + "</body></html>";
    frame.srcdoc = doc;
    codeBox.innerHTML =
      '<div class="layer"><h4>1 · HTML (always on)</h4><pre class="code">' + esc(HTML) + "</pre></div>" +
      (swCss.checked ? '<div class="layer"><h4>2 · CSS</h4><pre class="code">' + esc(CSS) + "</pre></div>" : "") +
      (swJs.checked ? '<div class="layer"><h4>3 · JavaScript</h4><pre class="code">' + esc(JS) + "</pre></div>" : "");
    $("#lblCss").classList.toggle("on", swCss.checked); $("#lblJs").classList.toggle("on", swJs.checked);
  }
  swCss.addEventListener("change", render); swJs.addEventListener("change", render); render();

  var got = [false, false];
  [["#wq1", "#wa1"], ["#wq2", "#wa2"]].forEach(function (p, i) {
    var box = $(p[0]), inp = $(p[1]), btn = box.querySelector("button"), msg = box.querySelector(".msg");
    function go() {
      Race.ctx();
      if (Race.hn(String(+inp.value)) === C.webHashes[i] && inp.value !== "") {
        got[i] = true; box.classList.add("ok"); msg.className = "msg ok"; msg.textContent = "✓ Yes!"; inp.disabled = btn.disabled = true; Race.sfx("point");
        if (got[0] && got[1]) unlockStage("wf");
      } else { msg.className = "msg no"; msg.textContent = i === 0 ? "Look at the HTML code on the right and count again." : "Is the JavaScript layer on? Click the pink button exactly 5 times (you\'ll hear a chirp each time)."; Race.sfx("no"); }
    }
    btn.addEventListener("click", go); inp.addEventListener("keydown", function (e) { if (e.key === "Enter") go(); });
  });
  function unlockStage(id) { var s = $("#" + id); s.classList.remove("locked"); setTimeout(function () { s.scrollIntoView({ behavior: "smooth", block: "center" }); }, 200); }

  /* ---------- Stage 2: wireframe matching ---------- */
  var wire = DnD.sorting({
    pool: $("#wirePool"), bucketsEl: $("#wireBuckets"), msg: $("#wireMsg"),
    items: [
      { id: "wa", text: "<header> logo + title", bucket: "A" },
      { id: "wb", text: "<nav> menu links", bucket: "B" },
      { id: "wc", text: '<img src="bat.png">', bucket: "C" },
      { id: "wd", text: "<ul> list of facts", bucket: "D" },
      { id: "we", text: "<button> Wake the bat", bucket: "E" },
      { id: "wf", text: "<footer> copyright line", bucket: "F" }
    ],
    buckets: [
      { id: "A", label: "A · top strip" }, { id: "B", label: "B · row of links" }, { id: "C", label: "C · big picture" },
      { id: "D", label: "D · list of facts" }, { id: "E", label: "E · tappable control" }, { id: "F", label: "F · bottom strip" }
    ]
  });
  $("#wireCheck").addEventListener("click", function () { if (wire.check()) { $("#wireMsg").textContent = "✓ Wireframe matched! Every piece is in the right box."; Race.sfx("point"); $("#wireCheck").disabled = true; unlockStage("w2"); } });

  /* ---------- Stage 3: sort into layers ---------- */
  var sorter = DnD.sorting({
    pool: $("#sortPool"), bucketsEl: $("#sortBuckets"), msg: $("#sortMsg"),
    items: [
      { id: "a", text: '<img src="bat.png" alt="R.B.">', bucket: "html" },
      { id: "b", text: "border-radius: 20px;", bucket: "css" },
      { id: "c", text: "n = n + 3;", bucket: "js" },
      { id: "d", text: '<button id="wake">Wake the bat</button>', bucket: "html" },
      { id: "e", text: "font-size: 24px;", bucket: "css" },
      { id: "f", text: "chirp.play();", bucket: "js" }
    ],
    buckets: [
      { id: "html", label: "🦴 HTML · the skeleton" },
      { id: "css", label: "🎀 CSS · the skin" },
      { id: "js", label: "🧠 JavaScript · the brain" }
    ]
  });
  $("#sortCheck").addEventListener("click", function () { if (sorter.check()) { Race.sfx("point"); $("#sortCheck").disabled = true; unlockStage("w4"); } });

  /* ---------- Stage 4: debug the page ---------- */
  var WB = ["<body>", "  <h1>Bat Pass</h1>", '  <img scr="bat.png">', "  <button>Wake the bat</button>", "</body>"];
  var wbox = $("#webBug"), wmsg = $("#webBugMsg"), wwrong = 0;
  WB.forEach(function (t, i) {
    var b = document.createElement("button"); b.type = "button"; b.textContent = (i + 1) + "   " + t; wbox.appendChild(b);
    b.addEventListener("click", function () {
      if (i === 2) {
        b.classList.add("good"); b.textContent = '3     <img src="bat.png">'; wmsg.className = "msg ok";
        wmsg.innerHTML = "✓ Found it! The attribute is <code>src</code> (short for <i>source</i>), not <code>scr</code>. One wrong letter and the browser can't find the picture.";
        Array.prototype.forEach.call(wbox.children, function (x) { x.disabled = true; }); Race.sfx("point"); unlockStage("w3");
      } else { wwrong++; b.classList.remove("bad"); void b.offsetWidth; b.classList.add("bad"); wmsg.className = "msg no"; wmsg.textContent = wwrong >= 2 ? "That line is fine. Hint: look at how the picture's attribute is spelled." : "That line is fine. Look for a typo."; Race.sfx("no"); }
    });
  });

  /* ---------- Stage 5: order the skeleton ---------- */
  var LINES = [
    "<!DOCTYPE html>",
    "<html>",
    "<head><title>Mission Control</title></head>",
    "<body>",
    "  <h1>Mission Control</h1>",
    "  <p>All systems online 🦇</p>",
    "</body>",
    "</html>"
  ];
  var items = LINES.map(function (t, i) { return { id: "L" + i, text: t }; });
  var expected = items.map(function (it, i) { return (i === 4 || i === 5) ? ["L4", "L5"] : [it.id]; });
  var ord = DnD.ordering({ pool: $("#ordPool"), slots: $("#ordSlots"), items: items, expected: expected, msg: $("#ordMsg") });
  $("#ordCheck").addEventListener("click", function () {
    if (!ord.check()) return;
    $("#ordCheck").disabled = true;
    var pv = $("#ordPreview"); pv.hidden = false;
    pv.innerHTML = '<p class="lead" style="margin-top:14px">Your page, running in the browser:</p><div class="browser"><div class="chrome"><i></i><i></i><i></i>&nbsp;mission-control.html</div><div class="preview-page"><h1 style="font-family:Georgia;margin:0 0 6px">Mission Control</h1><p style="margin:0">All systems online 🦇</p></div></div>';
    Race.solveLevel(3);
  });

  if (Race.isSolved(3)) { ["wf", "w2", "w3", "w4"].forEach(function (id) { $("#" + id).classList.remove("locked"); }); }
});

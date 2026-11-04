/* Finale — type the five fragments from your Mission Log, in order. */
Race.register(6, function () {
  var C = Race.config, $ = function (s) { return document.querySelector(s); };
  var host = $("#fragSlots"), msg = $("#finalMsg"), inputs = [];
  for (var i = 1; i <= 5; i++) {
    var d = document.createElement("div"); d.innerHTML = '<label for="fs' + i + '">Fragment ' + i + '</label><input type="text" id="fs' + i + '" autocomplete="off" spellcheck="false" maxlength="20">';
    host.appendChild(d); inputs.push(d.querySelector("input"));
  }
  inputs.forEach(function (inp, i) {
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); (i < 4 ? inputs[i + 1] : $("#finalBtn")).focus(); if (i === 4) go(); } });
  });
  function reveal() {
    $("#finalePuzzle").hidden = true;
    var D = C.destination, S = Race.state();
    $("#destName").textContent = D.name; $("#destAddr").textContent = "📍 " + D.address; $("#destNote").textContent = D.instructions;
    var bits = ["Team " + S.team]; if (S.name) bits.push(S.name);
    $("#teamBadge").textContent = bits.join(" · ");
    // campus photo (tries a local file first, then the ACC link; hides itself if neither loads)
    var holder = $("#destPhoto"); holder.innerHTML = "";
    var list = (D.photos || []).slice();
    (function tryNext() {
      if (!list.length) return;
      var img = new Image(); img.referrerPolicy = "no-referrer"; img.alt = D.name;
      img.onload = function () { holder.innerHTML = ""; holder.appendChild(img); }; img.onerror = tryNext; img.src = list.shift();
    })();
    if (S.judged) { $("#judgeOk").hidden = false; $("#judgeOk").textContent = "✓ Verified by judge"; $("#judgeForm").hidden = true; }
    $("#reveal").hidden = false; document.getElementById("finale").classList.add("done");
    Race.celebrate();
    setTimeout(function () { $("#reveal").scrollIntoView({ behavior: "smooth", block: "start" }); }, 200);
  }
  $("#judgeForm").addEventListener("submit", function (e) {
    e.preventDefault(); var S = Race.state(), msg = $("#judgeMsg");
    if (Race.hn($("#judgeIn").value) === C.judgeHash) {
      S.judged = Date.now(); Race.save(); $("#judgeIn").value = ""; msg.textContent = ""; $("#judgeForm").hidden = true;
      $("#judgeOk").hidden = false; Race.sfx("win"); Race.confetti(false);
    } else { Race.sfx("no"); msg.className = "msg no"; msg.textContent = "That's not the judge code."; }
  });
  function go() {
    Race.ctx(); var all = true;
    inputs.forEach(function (inp, i) {
      var ok = Race.norm(inp.value) === Race.norm(Race.frag(i + 1));
      inp.classList.toggle("ok", ok); inp.classList.toggle("no", !ok && inp.value !== ""); if (!ok) all = false;
    });
    if (all) { msg.textContent = ""; Race.finish(); reveal(); }
    else {
      Race.sfx("no"); msg.className = "msg no";
      msg.textContent = "Not yet. Green ones are right. Check your Mission Log: the fragments go in the order you found them.";
      var p = $("#finalePuzzle"); p.classList.remove("shake"); void p.offsetWidth; p.classList.add("shake");
    }
  }
  $("#playVictory").addEventListener("click", function () { Race.ctx(); Race.sfx("victory"); Race.celebrate(); });
  $("#finalBtn").addEventListener("click", go);
  if (Race.state().finale) reveal();
});

/* Level 2 — flight-log data lab (Box download, numeric answers only) */
Race.register(2, function () {
  var C = Race.config, $ = function (s) { return document.querySelector(s); };
  $("#boxLink").href = C.boxUrl; $("#boxText").textContent = C.boxUrl;
  $("#boxCopy").addEventListener("click", function () { var b = this; try { navigator.clipboard.writeText(C.boxUrl).then(function () { b.textContent = "Copied ✓"; }, function () { b.textContent = "Select & copy"; }); } catch (e) { b.textContent = "Select & copy"; } });
  var DESTS = ["Cypress Creek", "Eastview", "Elgin", "Hays", "Highland", "Northridge", "Riverside", "Round Rock", "South Austin"];
  var Q = [
    { t: "How many flights <b>departed</b> in the log in total?", hint: "Count the rows (each row is one flight), or try <code>=COUNTA(A2:A61)</code>." },
    { t: "Add up the <b>Passengers</b> column. How many passengers flew in total?", hint: "Select the column and look at the sum at the bottom, or use <code>=SUM(E2:E61)</code>." },
    { t: "What is the <b>most FuelUnits</b> any single flight burned?", hint: "Sort the column from largest to smallest, or try <code>=MAX(F2:F61)</code>." },
    { t: "Which is the <b>most popular destination</b> (the DestinationRoost that appears most often)?", pick: true, hint: "Filter or sort the DestinationRoost column, or try a pivot table or <code>=COUNTIF(D2:D61,\"Eastview\")</code> for each place." },
    { t: "Which <b>FlightID has the MOST passengers</b>? Type just the number after RB- (for example, RB-007 is <b>7</b>).", hint: "Sort Passengers from largest to smallest and look at the FlightID in the top row." },
    { t: "Which <b>FlightID has the FEWEST passengers</b>? Again, just the number after RB-.", hint: "Sort Passengers from smallest to largest and look at the FlightID in the top row." },
    { t: "How many flights <b>departed from Riverside</b> AND were delayed <b>more than 10 minutes</b>?", hint: "Filter DepartureRoost to Riverside, then count the DelayMinutes over 10. Or try <code>=COUNTIFS(...)</code>." }
  ];
  var ok = Q.map(function () { return false; }), host = $("#dataQs");
  function numNorm(v) { v = String(v).replace(/[,\s]/g, ""); return (v !== "" && isFinite(+v)) ? String(+v) : v; }
  Q.forEach(function (q, i) {
    var d = document.createElement("div"); d.className = "q";
    d.innerHTML = '<label for="da' + i + '">' + (i + 1) + ". " + q.t + '</label><div class="row">' + (q.pick ? '<select id="da' + i + '"><option value="">Pick a destination…</option>' + DESTS.map(function (x) { return "<option>" + x + "</option>"; }).join("") + "</select>" : '<input type="number" step="any" id="da' + i + '" inputmode="numeric" placeholder="Number only">') + '<button class="small" type="button">Check</button></div><div class="msg"></div><details class="hint"><summary>Stuck? Show a hint</summary><div class="hintline">' + q.hint + "</div></details>";
    host.appendChild(d);
    var inp = d.querySelector("input, select"), btn = d.querySelector("button"), msg = d.querySelector(".msg");
    function go() {
      Race.ctx();
      if (inp.value !== "" && Race.hn(q.pick ? inp.value : numNorm(inp.value)) === C.dataHashes[i]) {
        ok[i] = true; d.classList.add("ok"); msg.className = "msg ok"; msg.textContent = "✓ Correct!"; inp.disabled = btn.disabled = true; Race.sfx("point");
        if (ok.every(Boolean)) Race.solveLevel(2);
      } else { msg.className = "msg no"; msg.textContent = "Not quite. Double-check your range and try again."; Race.sfx("no"); d.classList.remove("shake"); void d.offsetWidth; d.classList.add("shake"); }
    }
    btn.addEventListener("click", go); inp.addEventListener("keydown", function (e) { if (e.key === "Enter") go(); });
  });
  if (Race.isSolved(2)) { host.querySelectorAll(".q").forEach(function (d) { d.classList.add("ok"); }); }
});

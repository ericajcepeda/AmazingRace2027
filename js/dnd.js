/* Tiny drag-and-drop kit. Works with mouse drag AND tap-to-select-then-tap-target (laptops, touchscreens, trackpads). */
(function () {
  var dragging = null, selected = null;

  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0; var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function mkChip(item) {
    var c = document.createElement("div");
    c.className = "chip"; c.textContent = item.text; c.draggable = true; c.dataset.id = item.id; c.tabIndex = 0; c.setAttribute("role", "button");
    c.addEventListener("dragstart", function (e) { dragging = c; c.classList.add("dragging"); try { e.dataTransfer.setData("text/plain", item.id); e.dataTransfer.effectAllowed = "move"; } catch (x) {} });
    c.addEventListener("dragend", function () { c.classList.remove("dragging"); dragging = null; document.querySelectorAll(".over").forEach(function (z) { z.classList.remove("over"); }); });
    return c;
  }
  function select(c) {
    if (selected) selected.classList.remove("sel");
    selected = (selected === c) ? null : c;
    if (selected) selected.classList.add("sel");
  }
  // a drop zone: onDrop(chip, zone). zone may be a pool, bucket or slot.
  function zone(el, onDrop) {
    el.classList.add("dz");
    el.addEventListener("dragover", function (e) { if (dragging) { e.preventDefault(); el.classList.add("over"); } });
    el.addEventListener("dragleave", function () { el.classList.remove("over"); });
    el.addEventListener("drop", function (e) { e.preventDefault(); el.classList.remove("over"); if (dragging) onDrop(dragging, el); });
    el.addEventListener("click", function (e) {
      if (selected && (e.target === el || !e.target.classList.contains("chip") || e.target === el)) { var c = selected; select(c); onDrop(c, el); }
    });
  }
  function bindChipClick(c, onChipClick) {
    c.addEventListener("click", function (e) { e.stopPropagation(); onChipClick(c); });
    c.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChipClick(c); } });
  }
  function clearMarks(root) { root.querySelectorAll(".bad,.good").forEach(function (n) { n.classList.remove("bad", "good"); }); }

  /* ----- ordering: items in correct order; expected[i] = array of ids allowed in slot i ----- */
  function ordering(opts) {
    var pool = opts.pool, slotsEl = opts.slots, items = opts.items, n = items.length, msg = opts.msg;
    var chips = {}, slots = [];
    items.forEach(function (it) { chips[it.id] = mkChip(it); if (opts.mono !== false) chips[it.id].style.fontFamily = "var(--mono)"; });
    shuffle(items).forEach(function (it) { pool.appendChild(chips[it.id]); });
    zone(pool, function (c) { toPool(c); });
    function toPool(c) { pool.appendChild(c); c.classList.remove("bad", "good"); }
    function put(c, slot) {
      var old = slot.querySelector(".chip"); if (old && old !== c) toPool(old);
      slot.appendChild(c); clearMarks(slotsEl); slotsEl.querySelectorAll(".slot").forEach(function (s) { s.classList.remove("bad"); });
    }
    items.forEach(function (it, i) {
      var s = document.createElement("div"); s.className = "slot"; slotsEl.appendChild(s); slots.push(s);
      zone(s, function (c) { put(c, s); });
    });
    items.forEach(function (it) {
      bindChipClick(chips[it.id], function (c) {
        if (c.parentNode.classList.contains("slot") && !selected) { toPool(c); return; }
        if (c.parentNode.classList.contains("slot") && selected && selected !== c) { var tgt = c.parentNode; var s = selected; select(s); put(s, tgt); return; }
        select(c);
      });
    });
    function check() {
      var filled = slots.every(function (s) { return s.querySelector(".chip"); });
      if (!filled) { msg.className = "msg no"; msg.textContent = "Fill every numbered line first."; return false; }
      var bad = 0;
      slots.forEach(function (s, i) {
        var id = s.querySelector(".chip").dataset.id; var ok = opts.expected[i].indexOf(id) >= 0;
        s.classList.toggle("bad", !ok); if (!ok) bad++;
      });
      if (bad) { msg.className = "msg no"; msg.textContent = bad + " line" + (bad > 1 ? "s are" : " is") + " in the wrong spot. Try swapping."; if (window.Race) Race.sfx("no"); return false; }
      msg.className = "msg ok"; msg.textContent = "✓ Perfect order!"; return true;
    }
    return { check: check, slots: slots };
  }

  /* ----- sorting into labelled buckets ----- */
  function sorting(opts) {
    var pool = opts.pool, bucketsEl = opts.bucketsEl, msg = opts.msg, chips = {}, boxes = {};
    opts.items.forEach(function (it) { chips[it.id] = mkChip(it); });
    shuffle(opts.items).forEach(function (it) { pool.appendChild(chips[it.id]); });
    zone(pool, function (c) { c.classList.remove("bad", "good"); pool.appendChild(c); });
    opts.buckets.forEach(function (b) {
      var d = document.createElement("div"); d.className = "bucket"; d.innerHTML = "<h4>" + b.label + "</h4>"; bucketsEl.appendChild(d); boxes[b.id] = d;
      zone(d, function (c) { c.classList.remove("bad", "good"); d.appendChild(c); });
    });
    opts.items.forEach(function (it) {
      bindChipClick(chips[it.id], function (c) {
        if (selected && selected !== c && c.parentNode !== pool) { var tgt = c.parentNode, s = selected; select(s); s.classList.remove("bad", "good"); tgt.appendChild(s); return; }
        if (c.parentNode !== pool && !selected) { pool.appendChild(c); return; }
        select(c);
      });
    });
    function check() {
      var left = opts.items.filter(function (it) { return chips[it.id].parentNode === pool; }).length;
      if (left) { msg.className = "msg no"; msg.textContent = "Sort every piece first (" + left + " left)."; return false; }
      var bad = 0;
      opts.items.forEach(function (it) {
        var ok = chips[it.id].parentNode === boxes[it.bucket]; chips[it.id].classList.toggle("bad", !ok); chips[it.id].classList.toggle("good", ok); if (!ok) bad++;
      });
      if (bad) { msg.className = "msg no"; msg.textContent = bad + " piece" + (bad > 1 ? "s are" : " is") + " in the wrong layer (red). Move them and check again."; if (window.Race) Race.sfx("no"); return false; }
      msg.className = "msg ok"; msg.textContent = "✓ Every piece is in the right layer!"; return true;
    }
    return { check: check };
  }

  window.DnD = { ordering: ordering, sorting: sorting, shuffle: shuffle };
})();

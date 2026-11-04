/* Decoy buttons — they look like real choices (Show me the answer, Skip, Delete other teams' progress…) but only show a funny GIF.
   They sit right next to the real buttons. Edit the messages/GIFs in KEYS, or where they appear in PLACES. If a GIF can't load, a big emoji shows. */
(function () {
  var KEYS = {
    skipEnd:  { emoji: "🎵", title: "Never gonna give you up…", gif: "https://media.tenor.com/x8v1oNUOmg4AAAAM/rickroll-roll.gif",
                text: "Never gonna let you skip. Never gonna run around and hand you the end. The finish line has to be earned, {{NAME}}." },
    skipLevel:{ emoji: "😤", title: "Nooooooo!", gif: "https://i.imgur.com/rsT9zxn.gif",
                text: "Nice try, {{NAME}}. Levels are like bat caves: you have to fly through to get to the next one." },
    answers:  { emoji: "🙅", title: "Absolutely not.", gif: "https://giffiles.alphacoders.com/445/4452.gif",
                text: "The answers are in your brain. (And maybe your teammate's brain. Teamwork!)" },
    cat:      { emoji: "😝", title: "Bleh.", gif: "https://media.tenor.com/sVIdqBeLUyMAAAAM/cat-cats.gif",
                text: "Where's the fun in that? Figure it out, {{NAME}}. You've got this. 🦇" },
    baby:     { emoji: "👶", title: "Waaaah!", gif: "https://marketinginsidergroup.com/wp-content/uploads/2023/09/b27966140db68d0621628f2309f8a443.gif",
                text: "Don't cry, {{NAME}}! Take a breath, reread the question, and try the hint. You are closer than you think." },
    rainbow:  { emoji: "🌈", title: "Rainbow mode: loading…", gif: "https://media.tenor.com/sVIdqBeLUyMAAAAM/cat-cats.gif",
                text: "Error 404: unicorns not found. Rainbow mode is reserved for the team that finishes first. (There is no rainbow mode. 🌈😝)" },
    del:      { emoji: "😱", title: "Excuse me?!", gif: "https://reactiongifs.com/r/Cynthia-Erivo-Taken-Aback.gif",
                text: "This is a friendly competition, {{NAME}}. R.B. saw that and R.B. is disappointed. 🦇" }
  };
  /* selector of the REAL button -> a decoy button is added right after it */
  var PLACES = [
    { sel: "#themeBtn", label: "🌈 Rainbow mode", key: "rainbow" },
    { sel: "#chatForm button[type=submit]", label: "⏭ Skip the quiz", key: "skipEnd" },
    { sel: "#dataQs .q:first-child button", label: "🔑 Show me the answers", key: "answers" },
    { sel: "#wq1 button", label: "🔑 Show me the answer", key: "answers" },
    { sel: "#wireCheck", label: "💡 Just tell me", key: "cat" },
    { sel: "#sortCheck", label: "⏭ Skip this stage", key: "skipLevel" },
    { sel: "#ordCheck", label: "🏁 Skip to the end", key: "skipEnd" },
    { sel: "#helloRun", label: "✍ Write it for me", key: "cat" },
    { sel: "#pyCheck", label: "😭 I give up", key: "baby" },
    { sel: "#pq1 button", label: "🔑 Show me the answer", key: "answers" },
    { sel: "form.gate button[type=submit]", label: "🗑 Delete other teams' progress", key: "del" },
    { sel: "#level5 .keys", label: "🎮 Give me 27 points", key: "skipLevel" },
    { sel: "#finalBtn", label: "🏁 Just show me the next stop", key: "skipEnd" }
  ];
  var modal;
  function name() { try { return Race.name() || "racer"; } catch (e) { return "racer"; } }
  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement("div"); modal.id = "curioModal"; modal.hidden = true;
    modal.innerHTML = '<div class="curio-card" role="dialog" aria-modal="true" aria-labelledby="curioTitle"><div class="curio-pic" id="curioPic"></div><h3 id="curioTitle"></h3><p id="curioText"></p><button type="button" id="curioClose">Fine. Back to the race.</button></div>';
    document.body.appendChild(modal);
    function close() { modal.hidden = true; document.getElementById("curioPic").innerHTML = ""; }
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
    document.getElementById("curioClose").addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) close(); });
    return modal;
  }
  function show(key) {
    var b = KEYS[key]; if (!b) return; var m = ensureModal(), pic = document.getElementById("curioPic"); pic.innerHTML = "";
    var img = new Image(); img.referrerPolicy = "no-referrer"; img.alt = b.title;
    img.onerror = function () { pic.innerHTML = '<div class="curio-emoji">' + b.emoji + "</div>"; };
    pic.appendChild(img); img.src = b.gif;
    document.getElementById("curioTitle").textContent = b.title;
    document.getElementById("curioText").textContent = b.text.replace(/\{\{NAME\}\}/g, name());
    m.hidden = false; try { Race.sfx("no"); } catch (e) {}
    document.getElementById("curioClose").focus();
  }
  function scan() {
    PLACES.forEach(function (p) {
      Array.prototype.forEach.call(document.querySelectorAll(p.sel), function (real) {
        if (real.classList.contains("decoy") || real.dataset.decoy) return; real.dataset.decoy = "1";
        var d = document.createElement("button"); d.type = "button"; d.className = "ghost small decoy"; d.textContent = p.label; d.dataset.key = p.key;
        d.addEventListener("click", function () { show(d.dataset.key); });
        real.insertAdjacentElement("afterend", d);
      });
    });
  }
  scan();
  new MutationObserver(function () { scan(); }).observe(document.body, { childList: true, subtree: true });
})();

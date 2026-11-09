/* Decoy buttons — they look like real choices (Show me the answer, Skip, Delete other teams' progress…) but only show a funny GIF.
   They sit right next to the real buttons. Edit the messages/GIFs in KEYS, or where they appear in PLACES. If a GIF can't load, a big emoji shows. */
(function () {
  var KEYS = {
    skipEnd: [
      { emoji: "🎵", title: "Never gonna give you up…", gif: "https://media.tenor.com/x8v1oNUOmg4AAAAM/rickroll-roll.gif", text: "Never gonna let you skip. Never gonna run around and hand you the end. The finish line has to be earned, {{NAME}}." },
      { emoji: "😭", title: "Noooooo!", gif: "https://substackcdn.com/image/fetch/$s_!B-xL!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1d136a56-22ad-4390-a850-539d0d56a259_498x280.gif", text: "Buddy the Elf is devastated that you tried to skip, {{NAME}}. Don't let Buddy down." },
      { emoji: "🌳", title: "Nothing to see here.", gif: "https://platform.vox.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/8692949/no_words_homer_into_brush.gif?quality=90&strip=all&crop=0,0,100,100", text: "Homer saw you reach for the shortcut and backed slowly into the bushes. Do the same, {{NAME}}: back away from the skip button." }
    ],
    skipLevel: [
      { emoji: "😤", title: "Nooooooo!", gif: "https://i.imgur.com/rsT9zxn.gif", text: "Nice try, {{NAME}}. Levels are like bat caves: you have to fly through to get to the next one." },
      { emoji: "🤯", title: "This is fine. Totally fine.", gif: "https://64.media.tumblr.com/8024bc78cc4155a6628a9529a4063abc/tumblr_inline_nihsuf8Uku1qgt12i.gif", text: "That's the host losing it over your skip attempt, {{NAME}}. Please don't make the host cry on live TV." },
      { emoji: "🚲", title: "Bye now.", gif: "https://media0.giphy.com/media/3o7Zesyac4CuSN5rsA/200w.gif", text: "Bobby heard you want to skip, shook his head, and left. Take the hint, {{NAME}}: no skipping." }
    ],
    answers: [
      { emoji: "🙅", title: "Absolutely not.", gif: "https://giffiles.alphacoders.com/445/4452.gif", text: "The answers are in your brain. (And maybe your teammate's brain. Teamwork!)" },
      { emoji: "🐶", title: "Side-eye activated.", gif: "https://i.pinimg.com/originals/db/ef/7d/dbef7ded446bf28e9f258b1edc7d3399.gif", text: "This dog is judging you for looking for the answers, {{NAME}}. And the dog is right." },
      { emoji: "🙊", title: "Hot take.", gif: "https://reactiongifs.com/r/stfn.gif", text: "This button has everything: shortcuts, cheating, and zero answers. Try thinking instead, {{NAME}}." },
      { emoji: "🏀", title: "Really?", gif: "https://i.redd.it/whwhufk8jt0h1.gif", text: "Really, {{NAME}}? You came to the answers button? Come on. You've got this." }
    ],
    cat: [
      { emoji: "😝", title: "Bleh.", gif: "https://media.tenor.com/sVIdqBeLUyMAAAAM/cat-cats.gif", text: "Where's the fun in that? Figure it out, {{NAME}}. You've got this. 🦇" },
      { emoji: "⏳", title: "Loading…", gif: "https://media2.giphy.com/media/v1.Y2lkPTZjMDliOTUyOWt4eTg4YmZueDl0anc1Zm8xamM1djl5cWduNzgya291aW4wNnJydiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/pY8jLmZw0ElqvVeRH4/200w.gif", text: "This cat is still loading the answer. So is the button. Meanwhile, {{NAME}}, you can do it yourself." },
      { emoji: "🤦", title: "Oh, {{NAME}}…", gif: "https://media.tenor.com/bcYgySpjYs4AAAAM/garfield-facepalm.gif", text: "Garfield is facepalming. Please don't make Garfield facepalm. Just try it." }
    ],
    baby: [
      { emoji: "👶", title: "Waaaah!", gif: "https://marketinginsidergroup.com/wp-content/uploads/2023/09/b27966140db68d0621628f2309f8a443.gif", text: "Don't cry, {{NAME}}! Take a breath, reread the question, and try the hint. You are closer than you think." },
      { emoji: "⚡", title: "Pika… pi…", gif: "https://media2.giphy.com/media/12Bpme5pTzGmg8/200w.gif", text: "Even Pikachu is crying now. Don't give up, {{NAME}}. Reread, retry, and ask your teammate." },
      { emoji: "🧽", title: "On the floor.", gif: "https://media.tenor.com/CLXqhe2JPrAAAAAM/spongebob.gif", text: "That's what giving up looks like. Stand up, {{NAME}}. Dust off. You can do this." }
    ],
    rainbow: [
      { emoji: "🌈", title: "Rainbow mode: loading…", gif: "https://media.tenor.com/sVIdqBeLUyMAAAAM/cat-cats.gif", text: "Error 404: unicorns not found. Rainbow mode is reserved for the team that finishes first. (There is no rainbow mode. 🌈😝)" },
      { emoji: "🤢", title: "Rainbow mode: rejected.", gif: "https://i.pinimg.com/originals/8f/03/20/8f03201f8944c9bb507826b367b332b9.gif", text: "Even the AI said ew. There is no rainbow mode, {{NAME}}." },
      { emoji: "😂", title: "Gotcha!", gif: "https://i.pinimg.com/originals/81/57/be/8157be9b541f58b4f4052fcd7031f5fd.gif", text: "You really thought there'd be a rainbow mode, huh, {{NAME}}? 😂" }
    ],
    del: [
      { emoji: "😱", title: "Excuse me?!", gif: "https://reactiongifs.com/r/Cynthia-Erivo-Taken-Aback.gif", text: "This is a friendly competition, {{NAME}}. R.B. saw that and R.B. is disappointed. 🦇" },
      { emoji: "😲", title: "You wouldn't.", gif: "https://i.pinimg.com/originals/ac/b5/9c/acb59c15a88cbaf5bfdde6e7ef8b9c1d.gif", text: "Schmidt is shocked, {{NAME}}. Shocked that you'd even think about deleting other teams' progress." },
      { emoji: "🔥", title: "Meanwhile…", gif: "https://www.gettagged.us/wp-content/uploads/2020/12/5532_GenZ.gif", text: "That's what your team's chances look like if you delete other teams' progress, {{NAME}}. Don't." }
    ]
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
    var pool = KEYS[key]; if (!pool) return; var b = pool[Math.floor(Math.random() * pool.length)]; var m = ensureModal(), pic = document.getElementById("curioPic"); pic.innerHTML = "";
    var img = new Image(); img.referrerPolicy = "no-referrer"; img.alt = b.title;
    img.onerror = function () { pic.innerHTML = '<div class="curio-emoji">' + b.emoji + "</div>"; };
    pic.appendChild(img); img.src = b.gif;
    document.getElementById("curioTitle").textContent = b.title.replace(/\{\{NAME\}\}/g, name());
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

/* =========================================================
   RIVERBAT RACE — AI BAT EDITION  ·  settings you can edit
   ---------------------------------------------------------
   Answers & fragments are stored scrambled (hashed / base64)
   so a quick View Source doesn't give them away.
   To change one, use  facilitator/encode.html  (not deployed).
   ========================================================= */
window.RACE = {
  title: "The Amazing Race: Riverbat Edition",
  teamsTotal: 12,                 // teams in the room (used for the team picker + rival chimes)

  // Level 2 — paste your Box shared link here (set to "Anyone with the link" or ACC-only)
  // Level 1 "generated" pictures (any 3 images of bats in front of a moon). If a link fails, drawn art is used instead.
  genImages: [
    "https://images.nightcafe.studio/galleries/oKpQzDKUEKmUauqinmVK/a_majestic_vampire_bat_silhouette--1--sxyui.jpg",
    "https://resource.myaiart.io/myaiart/generated/image/146959f44cd144f8890ae9625a7205fd.jpg",
    "https://creator.nightcafe.studio/jobs/yCNygTsVLAEsg9loLLqU/yCNygTsVLAEsg9loLLqU--1--12c4j_1.5x-clty-upscale-t5ecc.jpg"
  ],
  boxUrl: "https://austincc.box.com/s/r2lqxa15kob9vv7htektwi1jgym8jbj3",

  // Level 5 — how many gaps the Riverbat must clear
  gameTarget: 27,

  // Texts/emails from R.B. and Dr. Lowery-Hart (see js/messages.js to edit them)
  notifications: true,
  chancellorEnabled: true,        // set false to hide the emails from Dr. Lowery-Hart
  nudgeCardAfterSec: 100,         // R.B. reminds a team to find the Station Card after this long
  nudgeStuckAfterMin: 6,          // R.B. sends a hint if a team is on one level this long

  // Facilitator tools (codes are scrambled; change them with facilitator/encode.html)
  //   Facilitator Hub (the small ⚙ button, bottom-left): skip / jump / finish / reset a team  -> code in the guide
  //   Judge code (on the final screen): a judge types it to stamp the team "Verified"      -> code in the guide
  hubHash: 3118930787617786,
  judgeHash: 7212098811115971,

  // The final reveal
  destination: {
    name: "Rio Grande Campus",
    address: "1212 Rio Grande St, Austin, TX 78701",
    photos: ["img/rgc.jpg", "https://www.austincc.edu/wp-content/uploads/RS30078_20250826-RGC-Welcome-Riverbats-ca-191_1280x399px.jpg"],
    instructions: "Raise your hand and call a judge over. Show them this screen and your Mission Log. They'll check you in and send you on your way."
  },

  // ---- scrambled answers (do not edit by hand; use encode.html) ----
  launchHashes: [6223305118968975, 8612022793470127, 4603663998767100, 5690702873553605, 651922425587344],
  dataHashes: [1367028363541268, 7629863243959446, 2454738821733538, 4455429373125240, 5813218150869579, 6791890503407558, 4127977167928000],
  webHashes:    [3682481658279107, 7737568055809805],
  pyHashes:     [6181393099056368, 8685118530458559],
  fragments:    ["Q09VUkFHRQ==", "Q09NUEFTU0lPTg==", "Sk9Z", "WUVT", "UklWRVJCQVQ="]
};

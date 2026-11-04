/* =========================================================
   Texts & emails that pop up during the race.
   Edit freely. {{NAME}} = the racer's name, {{TEAM}} = team number,
   {{DEST}} = final destination.
   NOTE: Dr. Lowery-Hart's lines below are placeholder in-game
   encouragement written for this activity, not his own words.
   Swap in his real message (or get his office's OK), or set
   chancellorEnabled:false in config.js to turn him off.
   ========================================================= */
window.RACE_MSGS = {
  senders: {
    rb: {
      name: "R.B. the Riverbat", short: "R.B.", app: "Messages", kind: "sms", fallback: "🦇",
      photos: ["img/rb.jpg", "https://austincc.academicworks.com/image_uploads/W1siZiIsImltYWdlX3VwbG9hZHMvMS82YTI5Yzk0NS0yNjQ5LTQxNzktYTZlZS0yMDk1Yzk5NGMwODMvUml2ZXJiYXQuanBnIl1d?sha=eaf9b9b296ada547"]
    },
    chancellor: {
      name: "Dr. Russell Lowery-Hart", short: "Dr. Lowery-Hart", app: "Gmail", kind: "mail", initials: "RL",
      photos: ["img/russell.jpg"]          // optional: add your own file at img/russell.jpg
    }
  },

  welcome: { from: "rb", body: "Welcome to the Bat Lab, Team {{TEAM}}! 🦇 I'll text you updates as you fly. ECHO is waiting for you!", delay: 14 },

  // sent a few seconds after a level is cleared
  onSolve: {
    1: { from: "rb", body: "ECHO's back online!! 🎉 Great job, {{NAME}}! Next up: the flight logs in Box. Find Station Card 1 and keep flying 🦇" },
    2: { from: "chancellor", subject: "Nice work with the flight logs, {{NAME}}", body: "Data tells a story, and you just read it. Keep going with courage, compassion, joy, and yes. See you at the finish line!" },
    3: { from: "rb", body: "Mission Control is LIVE!! 🖥️ HTML = skeleton, CSS = skin, JavaScript = brain. Engine room is next 🐍" },
    4: { from: "chancellor", subject: "Almost there, Riverbats", body: "Python is only the beginning. One more flight to go. You've got this, Team {{TEAM}}!" },
    5: { from: "rb", body: "Calibration complete!! ✨ One last lock. Grab your Mission Log, because the flight plan is almost yours." }
  },
  onFinish: [
    { from: "rb", body: "YOU DID IT, {{NAME}}!! 🎉 Head to {{DEST}}. I'll meet you there. Fly safe! 🦇" },
    { from: "chancellor", subject: "Congratulations, Team {{TEAM}}!", body: "Courage, compassion, joy, and yes. You showed all four today. Welcome to {{DEST}}!", delay: 9 }
  ],

  // R.B. checks in if a team is waiting on a Station Card or stuck on a level
  nudgeCard: "Psst, {{NAME}}… have you found Station Card {{N}} yet? Look around the room 👀",
  nudgeStuck: {
    1: "Hint: wrong answers are free! Pick what you think is right and ECHO will tell you.",
    2: "Hint: in Box, download your own copy. Then try =SUM, =MAX, or a filter. Numbers only!",
    3: "Hint: switch the CSS and JavaScript layers on and off, and watch the code panel on the right.",
    4: "Hint: Python reads top to bottom, and a line that starts a loop ends with a colon (:).",
    5: "Hint: one small tap per flap works best. And you have shields 💜"
  }
};

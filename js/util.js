/* Shared helpers. Answers are stored as hashes so students can't just read them in View Source. */
(function (root) {
  function norm(s) { return String(s == null ? "" : s).toLowerCase().replace(/[^a-z0-9]/g, ""); }
  // cyrb53 string hash (fast, non-cryptographic, plenty for a classroom game)
  function hash(str, seed) {
    seed = seed || 0;
    var h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (var i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }
  function hn(s) { return hash("rb26:" + norm(s)); }   // hash of a normalized answer
  var api = { norm: norm, hash: hash, hn: hn };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.RBU = api;
})(typeof window !== "undefined" ? window : this);

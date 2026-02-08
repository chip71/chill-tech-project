const BAD_WORDS = [
  "dm","dmm","đm","đmm","ditme","địt","lồn","lon","cặc","cak","buồi","buoi","đéo","deo","vcl","vl",
];

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function censorText(input = "") {
  let text = String(input || "");
  for (const w of BAD_WORDS) {
    const re = new RegExp(`\\b${escapeRegex(w)}\\b`, "gi");
    text = text.replace(re, "***");
  }
  return text;
}

function hasProfanity(text = "") {
  const t = String(text || "");
  // ✅ comment đã bị censor thì chắc chắn có profanity
  if (t.includes("***")) return true;

  // ✅ hoặc detect thô nếu chưa censor
  return BAD_WORDS.some((w) => new RegExp(`\\b${escapeRegex(w)}\\b`, "i").test(t));
}

module.exports = { censorText, hasProfanity, BAD_WORDS };

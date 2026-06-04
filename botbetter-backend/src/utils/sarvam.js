const config = require("../config/env");

const SARVAM_BASE_URL = "https://api.sarvam.ai";
const DEFAULT_LANGUAGE = "en-IN";

function getApiKey() {
  const key = config.SARVAM_API_KEY || process.env.SARVAM_API_KEY;
  if (!key) {
    throw new Error("Missing SARVAM_API_KEY");
  }
  return key;
}

function sarvamHeaders(extra = {}) {
  return {
    "api-subscription-key": getApiKey(),
    ...extra,
  };
}

async function parseSarvamResponse(res, fallbackMessage) {
  let data = {};
  try {
    data = await res.json();
  } catch {
    // Sarvam normally returns JSON, but keep the thrown error useful if it does not.
  }

  if (!res.ok) {
    const raw = data.message || data.error || data.detail;
    let message;
    if (typeof raw === "string" && raw) {
      message = raw;
    } else if (raw && typeof raw === "object") {
      message =
        typeof raw.message === "string" ? raw.message :
        typeof raw.detail === "string" ? raw.detail :
        `${fallbackMessage}: ${res.status}`;
    } else {
      message = `${fallbackMessage}: ${res.status}`;
    }
    throw new Error(message);
  }

  return data;
}

async function speechToText(audioBlob, language = DEFAULT_LANGUAGE) {
  const form = new FormData();
  form.append("file", audioBlob, "voice.webm");
  form.append("language_code", language);
  form.append("model", "saaras:v2.5");

  const res = await fetch(`${SARVAM_BASE_URL}/speech-to-text-translate`, {
    method: "POST",
    headers: sarvamHeaders(),
    body: form,
  });

  const data = await parseSarvamResponse(res, "Sarvam speech-to-text failed");
  return data.transcript || data.transcript_text || data.text || data.translated_text || "";
}

async function textToSpeech(text, language = DEFAULT_LANGUAGE) {
  const res = await fetch(`${SARVAM_BASE_URL}/text-to-speech`, {
    method: "POST",
    headers: sarvamHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      inputs: [text],
      target_language_code: language,
      speaker: "anushka",
      model: "bulbul:v1",
    }),
  });

  const data = await parseSarvamResponse(res, "Sarvam text-to-speech failed");
  return data.audios?.[0] || data.audio || data.audio_base64 || "";
}

async function translateText(text, targetLang = DEFAULT_LANGUAGE) {
  if (!text || targetLang === DEFAULT_LANGUAGE) return text;

  const res = await fetch(`${SARVAM_BASE_URL}/translate`, {
    method: "POST",
    headers: sarvamHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      input: text,
      source_language_code: DEFAULT_LANGUAGE,
      target_language_code: targetLang,
    }),
  });

  const data = await parseSarvamResponse(res, "Sarvam translate failed");
  return data.translated_text || data.translation || text;
}

module.exports = { speechToText, textToSpeech, translateText };

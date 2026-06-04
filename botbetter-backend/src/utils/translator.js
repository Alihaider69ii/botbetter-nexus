const translateText = async (text, targetLanguageCode) => {
  if (!process.env.SARVAM_API_KEY || targetLanguageCode === "en-IN") return text;

  const res = await fetch("https://api.sarvam.ai/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "API-Subscription-Key": process.env.SARVAM_API_KEY,
    },
    body: JSON.stringify({
      input: text,
      source_language_code: "en-IN",
      target_language_code: targetLanguageCode,
    }),
  });

  if (!res.ok) throw new Error(`Sarvam translate failed: ${res.status}`);

  const data = await res.json();
  return data.translated_text || text;
};

module.exports = { translateText };

const parseGeminiJSON = (text) => {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
};

module.exports = parseGeminiJSON;

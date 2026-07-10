const { GoogleGenerativeAI } = require("@google/generative-ai");

let model;

const initializeGemini = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in .env");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  console.log("✅ Gemini model initialized");
};

const generateContent = async (prompt) => {
  if (!model) {
    throw new Error(
      "Gemini model not initialized. Call initializeGemini() first."
    );
  }

  const result = await model.generateContent(prompt);
  return result.response.text();
};

module.exports = {
  initializeGemini,
  generateContent,
};
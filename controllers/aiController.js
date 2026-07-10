const { calculateAnalytics } = require("../services/analyticsService");
const { generateContent } = require("../services/geminiServices");

const buildAIContext = require("../utils/buildAIContext");
const buildInsightPrompt = require("../utils/buildInsightPrompt");
const parseGeminiJSON = require("../utils/parseGeminiJSON");

const getDashboardInsight = async (req, res) => {
  try {
    const analytics = await calculateAnalytics(req.user.id, req.query);

    const context = buildAIContext(analytics, req.query);

    const prompt = buildInsightPrompt(context);

    const response = await generateContent(prompt);

    const insight = parseGeminiJSON(response);

    return res.json({
      success: true,
      data: insight,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to generate AI insight.",
    });
  }
};

module.exports = {
  getDashboardInsight,
};

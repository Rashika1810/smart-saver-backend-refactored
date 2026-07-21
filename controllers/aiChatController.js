const { generateFinanceResponse } = require("../services/aiChatService");

const chatWithAI = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    const answer = await generateFinanceResponse({
      userId: req.user.id,
      message,
      history,
    });

    return res.json({
      success: true,
      answer,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to generate response",
    });
  }
};

module.exports = {
  chatWithAI,
};
function detectIntent(message = "") {
  const text = message.toLowerCase().trim();

  // Savings
  if (
    /how much did i save|what are my savings|current savings/.test(text)
  ) {
    return { intent: "SAVINGS" };
  }

  // Balance
  if (/current balance|what is my balance|balance/.test(text)) {
    return { intent: "BALANCE" };
  }

  // Food expense
  if (/food expense|food expenses|spent on food/.test(text)) {
    return { intent: "CATEGORY_EXPENSE", category: "Food" };
  }

  // Shopping expense
  if (/shopping expense|shopping expenses|spent on shopping/.test(text)) {
    return { intent: "CATEGORY_EXPENSE", category: "Shopping" };
  }

  // Top merchant
  if (/where did i spend the most|top merchant|merchant most/.test(text)) {
    return { intent: "TOP_MERCHANT" };
  }

  // Biggest transaction
  if (/biggest transaction|largest transaction|highest transaction/.test(text)) {
    return { intent: "BIGGEST_TRANSACTION" };
  }

  // Monthly expenses
  if (/monthly expenses|expenses by month/.test(text)) {
    return { intent: "MONTHLY_EXPENSES" };
  }

  // June details
  if (/june/.test(text)) {
    return {
      intent: "MONTH_DETAILS",
      month: 6,
      year: 2026,
    };
  }

  // Otherwise use Gemini
  return { intent: "AI" };
}

module.exports = {
  detectIntent,
};
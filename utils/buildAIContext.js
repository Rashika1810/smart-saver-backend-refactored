const buildAIContext = (analytics, filters = {}) => {
  const topCategories = analytics.categoryBreakdown.slice(0, 5);

  return {
    period: {
      year: filters.year || new Date().getFullYear(),
      month: filters.month || "All Months",
    },

    summary: analytics.summary,

    topCategory: analytics.topCategory,

    topCategories,

    highestWeekday: analytics.highestWeekday,

    largestExpense: analytics.largestExpense
      ? {
          category: analytics.largestExpense.category,
          amount: analytics.largestExpense.amount,
        }
      : null,
  };
};

module.exports = buildAIContext;

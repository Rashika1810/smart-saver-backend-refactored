const cron = require("node-cron");
const {
  generateRecurringTransactions,
} = require("../services/recurringService");

const startRecurringCron = () => {
  // Runs every day at 12:05 AM
  cron.schedule("5 0 * * *", async () => {
    console.log("⏰ Running recurring transaction job...");

    try {
      const generated = await generateRecurringTransactions();

      if (generated > 0) {
        console.log(`✅ ${generated} recurring transaction(s) generated.`);
      } else {
        console.log("ℹ️ No recurring transactions due today.");
      }
    } catch (error) {
      console.error("❌ Recurring cron failed:", error.message);
    }
  });

  console.log("✅ Recurring cron initialized.");
};

module.exports = startRecurringCron;

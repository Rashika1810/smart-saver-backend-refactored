const Transaction = require("../models/transactionModel");
const RecurringTransaction = require("../models/recurringTransactionModel");

const MAX_GENERATION = 365;

function normalize(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addFrequency(date, frequency) {
  const next = new Date(date);

  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;

    case "weekly":
      next.setDate(next.getDate() + 7);
      break;

    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;

    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
}

const generateRecurringTransactions = async () => {
  const today = normalize(new Date());

  const recurringList = await RecurringTransaction.find({
    active: true,
  });

  let generated = 0;

  for (const recurring of recurringList) {
    let currentDate;

    if (recurring.lastGenerated) {
      currentDate = addFrequency(
        normalize(recurring.lastGenerated),
        recurring.frequency,
      );
    } else {
      currentDate = normalize(recurring.startDate);
    }

    let count = 0;

    while (currentDate <= today && count < MAX_GENERATION) {
      if (recurring.endDate && currentDate > normalize(recurring.endDate)) {
        break;
      }

      await Transaction.create({
        user: recurring.user,
        amount: recurring.amount,
        type: recurring.type,
        category: recurring.category,
        description: recurring.description,
        date: currentDate,
      });

      recurring.lastGenerated = currentDate;

      generated++;

      count++;

      currentDate = addFrequency(currentDate, recurring.frequency);
    }

    await recurring.save();
  }

  return generated;
};

module.exports = {
  generateRecurringTransactions,
};

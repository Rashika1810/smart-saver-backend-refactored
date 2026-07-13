const Transaction = require("../models/transactionModel");
const {
  parsePhonePeStatement,
} = require("../services/parser/phonepeParser");
const Statement = require("../models/statementModel");
function validateTransaction(transaction) {
  if (!transaction.amount) return false;

  if (!transaction.date) return false;

  if (!transaction.type) return false;

  if (!transaction.description) return false;

  return true;
}

/**
 * Import PhonePe Statement
 * POST /api/v1/transactions/import-phonepe
 */
const importPhonePeStatement = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PhonePe statement.",
      });
    }

    // Parse PDF
    const parsedData = await parsePhonePeStatement(req.file.buffer);
    console.log("Parsed Data:");
    console.dir(parsedData, { depth: null });

    console.log("Transactions:", parsedData.transactions);
    console.log("Count:", parsedData.transactions?.length);
    const parsedTransactions = parsedData.transactions || [];

    const validTransactions = parsedTransactions.filter(validateTransaction);
    console.log("Valid Transactions:", validTransactions.length);

    parsedTransactions.forEach((t, i) => {
      console.log(`Transaction ${i + 1}:`, t);
    });
    const invalidCount = parsedTransactions.length - validTransactions.length;
    if (!validTransactions.length) {
      return res.status(400).json({
        success: false,
        message: "No valid transactions found in the uploaded statement.",
      });
    }
    // Extract transaction IDs
    const transactionIds = validTransactions
      .map((t) => t.transactionId)
      .filter(Boolean);

    // Find already imported transactions
    const existingTransactions = await Transaction.find(
      {
        user: req.user.id,
        transactionId: {
          $in: transactionIds,
        },
      },
      {
        transactionId: 1,
      },
    );

    const existingIds = new Set(
      existingTransactions.map((t) => t.transactionId),
    );

    const newTransactions = [];

    let duplicateCount = 0;

    for (const transaction of validTransactions) {
      if (
        transaction.transactionId &&
        existingIds.has(transaction.transactionId)
      ) {
        duplicateCount++;
        continue;
      }

      newTransactions.push({
        ...transaction,

        user: req.user.id,

        source: "phonepe",

        importedAt: new Date(),

        statementMonth: `${transaction.date.toLocaleString("default", {
          month: "long",
        })}-${transaction.date.getFullYear()}`,
      });
    }

    // Bulk insert
    if (newTransactions.length) {
      await Transaction.insertMany(newTransactions, {
        ordered: false,
      });
    }
    await Statement.create({
      user: req.user.id,

      fileName: req.file.originalname,

      statementStartDate: parsedData.statement?.startDate || new Date(),

      statementEndDate: parsedData.statement?.endDate || new Date(),

      totalTransactions: validTransactions.length,

      importedTransactions: newTransactions.length,

      duplicateTransactions: duplicateCount,
    });

    return res.status(200).json({
      success: true,

      message: "Statement imported successfully.",

      summary: {
        totalFound: parsedTransactions.length,
        valid: validTransactions.length,
        invalid: invalidCount,
        imported: newTransactions.length,
        duplicates: duplicateCount,
      },
    });
  } catch (error) {
    console.error(error);

    // Duplicate key safety
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: "Statement imported. Duplicate transactions were skipped.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to import PhonePe statement.",
    });
  }
};

module.exports = {
  importPhonePeStatement,
};

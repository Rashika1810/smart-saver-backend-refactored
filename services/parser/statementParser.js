const { isDateLine } = require("./phonepeHelpers");
const { parseTransaction } = require("./transactionParser");

/**
 * Extract statement period
 */
function extractStatementPeriod(lines) {
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i];

    const match = line.match(
      /(\d{1,2})\s([A-Z][a-z]{2}),\s(\d{4})\s*-\s*(\d{1,2})\s([A-Z][a-z]{2}),\s(\d{4})/,
    );

    if (match) {
      const months = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
      };

      return {
        startDate: new Date(
          Number(match[3]),
          months[match[2]],
          Number(match[1]),
        ),

        endDate: new Date(Number(match[6]), months[match[5]], Number(match[4])),
      };
    }
  }

  return null;
}

/**
 * Split PDF into transaction blocks
 */
function splitTransactionBlocks(lines) {
  const blocks = [];

  let current = [];

  for (const line of lines) {

    if (isDateLine(line)) {

      if (current.length) {
        blocks.push(current);
      }

      current = [line];

    } else {

      if (current.length) {
        current.push(line);
      }

    }
  }

  if (current.length) {
    blocks.push(current);
  }

  return blocks;
}
/**
 * Parse all transactions
 */
function parseTransactions(lines) {
  const blocks = splitTransactionBlocks(lines);

  const transactions = [];

  for (const block of blocks) {
    const transaction = parseTransaction(block);
    if (transaction) {
      transactions.push(transaction);
    }
  }

  return transactions;
}

module.exports = {
  extractStatementPeriod,
  parseTransactions,
};

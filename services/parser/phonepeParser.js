const pdf = require("pdf-parse");

const { cleanPdfLines } = require("./phonepeHelpers");

const {
  extractStatementPeriod,
  parseTransactions,
} = require("./statementParser");

async function parsePhonePeStatement(buffer) {
  const parsedPdf = await pdf(buffer);

  const lines = cleanPdfLines(parsedPdf.text);

  console.log("Cleaned Lines:", lines.length);

  const statement =
    extractStatementPeriod(lines);

  const transactions =
    parseTransactions(lines);

  return {
    statement,
    transactions,
  };
}

module.exports = {
  parsePhonePeStatement,
};
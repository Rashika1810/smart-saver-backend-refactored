const MONTHS = {
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

function cleanPdfLines(text) {
  return text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("Page "))
    .filter((line) => !line.startsWith("This is"))
    .filter((line) => !line.startsWith("Disclaimer"))
    .filter((line) => !line.includes("support.phonepe.com"))
    .filter((line) => !line.includes("Terms & Conditions"))
    .filter((line) => !line.includes("Privacy Policy"))
    .filter((line) => line !== "DateTransaction DetailsTypeAmount")
    .filter((line) => line !== "Date Transaction Details Type Amount");
}

function isDateLine(line) {
  return /^[A-Z][a-z]{2}\s\d{1,2},\s\d{4}$/.test(line);
}

function isTimeLine(line) {
  return /^\d{1,2}:\d{2}\s?(am|pm)$/i.test(line);
}

function isAmountLine(line) {
  return /^(DEBIT|CREDIT)\s*₹?[\d,]+(\.\d+)?$/i.test(line);
}

function parseAmount(line) {
  const match = line.match(
    /(DEBIT|CREDIT)\s*₹?([\d,]+(?:\.\d+)?)/i
  );

  if (!match) {
    return null;
  }

  return {
    type:
      match[1].toUpperCase() === "DEBIT"
        ? "expense"
        : "income",

    amount: Number(
      match[2].replace(/,/g, "")
    ),
  };
}

function parseDate(dateLine, timeLine) {
  const parts = dateLine.replace(",", "").split(" ");

  const month = MONTHS[parts[0]];

  const day = Number(parts[1]);

  const year = Number(parts[2]);

  let hour = 0;

  let minute = 0;

  if (timeLine) {
    const m = timeLine.match(
      /(\d+):(\d+)\s?(am|pm)/i
    );

    if (m) {
      hour = Number(m[1]);

      minute = Number(m[2]);

      const period = m[3].toLowerCase();

      if (period === "pm" && hour !== 12)
        hour += 12;

      if (period === "am" && hour === 12)
        hour = 0;
    }
  }

  return new Date(
    year,
    month,
    day,
    hour,
    minute
  );
}

function startsMerchant(line) {
  return (
    line.startsWith("Paid to") ||
    line.startsWith("Received from") ||
    line.startsWith("Transfer to") ||
    line.startsWith("Transfer from") ||
    line.startsWith("Mobile recharged")
  );
}

function stopMerchant(line) {
  return (
    line.startsWith("Transaction ID") ||
    line.startsWith("UTR") ||
    line.startsWith("Paid by") ||
    line.startsWith("Credited to") ||
    line.startsWith("Jio Prepaid")
  );
}

function parseTransactionId(line) {
  const match = line.match(
    /Transaction ID\s+([A-Z0-9]+)/i
  );

  return match ? match[1] : "";
}

function parseUTR(line) {
  const match = line.match(
    /UTR No\.?\s+([A-Z0-9]+)/i
  );

  return match ? match[1] : "";
}

function parseAccount(line) {
  const match = line.match(
    /([Xx\d]{4,})/
  );

  return match ? match[1] : "";
}

module.exports = {
  cleanPdfLines,
  isDateLine,
  isTimeLine,
  isAmountLine,
  parseAmount,
  parseDate,
  startsMerchant,
  stopMerchant,
  parseTransactionId,
  parseUTR,
  parseAccount,
};
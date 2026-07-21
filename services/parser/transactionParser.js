const { detectCategory } = require("../merchantCategoryService");

const {
  isTimeLine,
  isAmountLine,
  parseAmount,
  parseDate,
  startsMerchant,
  stopMerchant,
  parseTransactionId,
//   parseUTR,
  parseAccount,
} = require("./phonepeHelpers");

function parseTransaction(block) {

    try {

        //------------------------------------
        // Date + Time
        //------------------------------------

        const dateString = `${block[0]} ${block[1]}`;

        const date = new Date(dateString);

        //------------------------------------
        // Amount + Type + Description
        //------------------------------------

        const paymentLine = block[2];

        const paymentMatch = paymentLine.match(
            /(DEBIT|CREDIT)₹([\d,]+(?:\.\d+)?)(.*)/i
        );

        if (!paymentMatch) return null;

        const type =
            paymentMatch[1].toUpperCase() === "DEBIT"
                ? "expense"
                : "income";

        const amount = Number(
            paymentMatch[2].replace(/,/g, "")
        );

        const description = paymentMatch[3].trim();

        //------------------------------------
        // Merchant
        //------------------------------------

        let merchant = description
            .replace(/^Paid to/i, "")
            .replace(/^Received from/i, "")
            .replace(/^Transfer to/i, "")
            .replace(/^Transfer from/i, "")
            .replace(/^Mobile recharged/i, "")
            .trim();

        //------------------------------------
        // Transaction ID
        //------------------------------------

        let transactionId = "";

        const transactionLine = block.find(line =>
            line.startsWith("Transaction ID")
        );

        if (transactionLine) {

            transactionId = transactionLine
                .replace("Transaction ID", "")
                .trim();

        }

        //------------------------------------
        // UTR
        //------------------------------------

        // let utr = "";

        // const utrLine = block.find(line =>
        //     line.startsWith("UTR No.")
        // );

        // if (utrLine) {

        //     utr = utrLine
        //         .replace("UTR No.", "")
        //         .trim();

        // }

        //------------------------------------
        // Payment Account
        //------------------------------------

        let paymentAccount = "";

        const paidByIndex = block.findIndex(line =>
            line === "Paid by" ||
            line === "Credited to"
        );

        if (
            paidByIndex !== -1 &&
            block[paidByIndex + 1]
        ) {

            paymentAccount = block[paidByIndex + 1];

        }

        //------------------------------------
        // Payment Type
        //------------------------------------

        let paymentType = "UPI";

        if (/Transfer/i.test(description))
            paymentType = "Bank Transfer";

        if (/Mobile recharged/i.test(description))
            paymentType = "Recharge";

        //------------------------------------
        // Category
        //------------------------------------

        const category = detectCategory(
            description,
            merchant
        );

        return {

            date,

            amount,

            type,

            merchant,

            category,

            description,

            paymentType,

            paymentAccount,

            transactionId,


        };

    }
    catch (err) {

        console.log(err);

        return null;

    }

}

module.exports = {
  parseTransaction,
};

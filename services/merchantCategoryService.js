const merchantMappings = [
  // ==========================
  // FOOD
  // ==========================
  {
    keywords: [
      "swiggy",
      "zomato",
      "dominos",
      "pizza hut",
      "biryani",
      "instamart",
      "juice",
      "restaurant",
      "cafe",
      "snacks",
      "mart",
      "confectionery",
    ],
    category: "Food",
  },

  // ==========================
  // SHOPPING
  // ==========================
  {
    keywords: [
      "flipkart",
      "amazon",
      "myntra",
      "ajio",
      "meesho",
      "zudio",
      "bags",
      "shopping",
    ],
    category: "Shopping",
  },

  // ==========================
  // TRAVEL
  // ==========================
  {
    keywords: [
      "irctc",
      "rail",
      "uber",
      "ola",
      "rapido",
      "metro",
    ],
    category: "Travel",
  },

  // ==========================
  // HEALTH
  // ==========================
  {
    keywords: [
      "apollo",
      "medibuddy",
      "pharmacy",
      "hospital",
      "clinic",
      "health",
    ],
    category: "Healthcare",
  },

  // ==========================
  // RECHARGE
  // ==========================
  {
    keywords: [
      "recharge",
      "jio",
      "airtel",
      "vi",
      "bsnl",
    ],
    category: "Mobile Recharge",
  },

  // ==========================
  // CASH WITHDRAWAL
  // ==========================
  {
    keywords: [
      "atm",
      "cash",
    ],
    category: "Cash Withdrawal",
  },

  // ==========================
  // TRANSFER
  // ==========================
  {
    keywords: [
      "transfer",
    ],
    category: "Bank Transfer",
  },

  // ==========================
  // UTILITIES
  // ==========================
  {
    keywords: [
      "electricity",
      "water",
      "gas",
      "broadband",
      "wifi",
      "bses",
    ],
    category: "Utilities",
  },

  // ==========================
  // ENTERTAINMENT
  // ==========================
  {
    keywords: [
      "district",
      "movie",
      "bookmyshow",
      "netflix",
      "prime",
      "spotify",
    ],
    category: "Entertainment",
  },

  // ==========================
  // EDUCATION
  // ==========================
  {
    keywords: [
      "udemy",
      "coursera",
      "college",
      "school",
      "education",
    ],
    category: "Education",
  },
];

function detectCategory(description = "", merchant = "") {
  const value = `${description} ${merchant}`.toLowerCase();

  for (const item of merchantMappings) {
    const found = item.keywords.some((keyword) =>
      value.includes(keyword.toLowerCase())
    );

    if (found) {
      return item.category;
    }
  }

  return "Others";
}

module.exports = {
  detectCategory,
};
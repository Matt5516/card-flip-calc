/* Grading + eBay fee data. Checked 2026-10-14 against official pages (see sources on index.html).
   Update this file when prices change; nothing else needs editing. maxValue = max declared/insured value per card (USD). */
window.FEES = {
  checked: "2026-10-14",
  graders: {
    PSA: { url: "https://www.psacard.com/pricing", note: "Value and Value Bulk tiers are paused as of 2026-10-14.", tiers: [
      { name: "Standard (90-100 business days)", fee: 59.99, maxValue: 1000 },
      { name: "Priority (70-80 business days)", fee: 79.99, maxValue: 1500 },
      { name: "Express (20-30 business days)", fee: 199, maxValue: 2500 },
      { name: "Super Express (10-15 business days)", fee: 349, maxValue: 5000 },
      { name: "Premier (7-10 business days)", fee: 599, maxValue: 10000 },
      { name: "Premium 1 (5-7 business days)", fee: 999, maxValue: 25000 },
      { name: "Premium 2", fee: 1999, maxValue: 50000 },
      { name: "Premium 3", fee: 2999, maxValue: 100000 },
      { name: "Premium 5", fee: 4999, maxValue: 250000 }
    ]},
    SGC: { url: "https://gosgc.com/card-grading/services-pricing", note: "Standard-size raw cards. Standard tier is 40+ business days.", tiers: [
      { name: "Standard, up to $1,500 (40+ days)", fee: 50, maxValue: 1500 },
      { name: "Standard, up to $3,500 (40+ days)", fee: 85, maxValue: 3500 },
      { name: "Expedited, up to $3,500 (2-3 days)", fee: 150, maxValue: 3500 },
      { name: "Expedited, up to $7,500 (2-3 days)", fee: 250, maxValue: 7500 },
      { name: "Expedited, up to $20,000 (2-3 days)", fee: 500, maxValue: 20000 },
      { name: "Expedited, up to $50,000 (2-3 days)", fee: 1000, maxValue: 50000 },
      { name: "Expedited, up to $100,000 (2-3 days)", fee: 2000, maxValue: 100000 }
    ]},
    BGS: { url: "https://beckett.jotform.com/form/beckett-card-grading-submission", note: "Beckett.com is offline; Base and Standard are paused. Only Express is open via Beckett's temporary submission form (includes subgrades).", tiers: [
      { name: "Express (15 business days)", fee: 79.95, maxValue: null }
    ]},
    CGC: { url: "https://www.cgccards.com/submit/services-fees/cgc-grading/", note: "Non-member prices; paid CGC members save 10-20%. Bulk needs 25 cards.", tiers: [
      { name: "Bulk, 25-card min (150 working days)", fee: 17, maxValue: 500 },
      { name: "Economy (90 working days)", fee: 20, maxValue: 1000 },
      { name: "Standard (10 working days)", fee: 55, maxValue: 3000 },
      { name: "Express (5 working days)", fee: 100, maxValue: 10000 },
      { name: "WalkThrough (2 working days)", fee: 300, maxValue: 100000 }
    ]}
  },
  ebay: { // Trading Cards category (Sports Trading Cards, Non-Sport, CCG), standard (non-Store) rates
    url: "https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822",
    rate: 0.1325, threshold: 7500, rateAbove: 0.0235, perOrderSmall: 0.30, perOrderLarge: 0.40, smallMax: 10
  }
};

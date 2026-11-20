// Rural Fintech Literacy & Access Platform - Products Data

export const products = [
  {
    id: "prod_working_cap",
    category: "working_capital",
    title: "Tyohar & Stock Working Capital",
    hindiTitle: "त्योहार एवं स्टॉक वर्किंग कैपिटल",
    icon: "📦",
    lender: "Gramin Small Finance Bank",
    minScore: 650,
    maxAmount: 50000,
    minAmount: 10000,
    repaymentType: "Weekly Micro-Instalment",
    sampleTerm: "Borrow ₹25,000 → Repay ₹590 / week for 48 weeks",
    plainLanguageExplanation: "No lump sum stress! Pay small weekly amounts from your shop's daily QR collections. No collateral needed.",
    audioExplanation: "Yeh loan aapke shop stock ke liye hai. Bank har hafte sirf ₹590 legi, jisse aap par ek sath bojh nahi padega.",
    purposeBadge: "Festival Stock & Goods",
    features: [
      "Zero physical paperwork — Voice KYC supported",
      "Automatic repayment via UPI auto-debit",
      "Instant disbursement within 2 hours of verification",
      "No penalty for early prepayment"
    ],
    partnerRiskTier: "Low Risk (Trust Score > 650)"
  },
  {
    id: "prod_crop_credit",
    category: "crop_cycle",
    title: "Kisan Seasonal Harvest Credit",
    hindiTitle: "किसान फसल चक्र क्रेडिट",
    icon: "🌾",
    lender: "NABARD Partnered Rural Bank",
    minScore: 680,
    maxAmount: 100000,
    minAmount: 20000,
    repaymentType: "Bullet Harvest Repayment",
    sampleTerm: "Borrow ₹50,000 → Repay ₹53,500 after 6 months (Post-Harvest)",
    plainLanguageExplanation: "Zero monthly EMI during crop growing months! Repay full amount only after selling harvest in Mandi.",
    audioExplanation: "Kisaano ke liye khaas loan! Jab tak fasal nahi kat-ti tab tak koi kist nahi deni. Mandi mein mal bechne ke baad bhugtan karein.",
    purposeBadge: "Seeds, Fertilizer & Fuel",
    features: [
      "Aligned with Rabi & Kharif cropping dates",
      "Grace period if unseasonal weather delays harvest",
      "Direct pay to verified Mandi seed suppliers",
      "Includes free crop weather alerts via SMS"
    ],
    partnerRiskTier: "Medium-Low Risk (Harvest-Adjusted)"
  },
  {
    id: "prod_equipment",
    category: "equipment",
    title: "Vyaapar Machinery & Equipment Loan",
    hindiTitle: "व्यापार मशीनरी एवं उपकरण लोन",
    icon: "⚙️",
    lender: "State Micro-Enterprise Finance",
    minScore: 720,
    maxAmount: 200000,
    minAmount: 40000,
    repaymentType: "Monthly Fixed EMI",
    sampleTerm: "Borrow ₹1,20,000 → Repay ₹4,150 / month for 36 months",
    plainLanguageExplanation: "Upgrade your crusher, flour mill, or loom motor. The new machine pays for its own monthly instalment!",
    audioExplanation: "Nayi machine ya motor khareedne ke liye loan. Machine ki kamai se har mahine aasan kist chukayein.",
    purposeBadge: "Machinery Upgrade",
    features: [
      "Up to 90% equipment value funded",
      "Machine acts as primary security",
      "Subsidy assistance under PMEGP scheme",
      "Free 1-year equipment maintenance cover"
    ],
    partnerRiskTier: "Low Risk (Asset-Backed)"
  },
  {
    id: "prod_shop_insurance",
    category: "insurance",
    title: "Suraksha Dukan & Asset Insurance",
    hindiTitle: "सुरक्षा दुकान एवं प्रॉपर्टी बीमा",
    icon: "🛡️",
    lender: "Universal Micro Insurance",
    minScore: 600,
    maxAmount: 300000, // Cover amount
    minAmount: 50000,
    repaymentType: "Annual Premium",
    sampleTerm: "Pay ₹1,200 per year → Get ₹3,00,000 Shop Fire & Theft Cover",
    plainLanguageExplanation: "Protects your entire store stock against fire, flood, theft, and short circuit for just ₹3/day.",
    audioExplanation: "Aapki dukan ki suraksha ke liye. Aag, chori ya pani se nuksan hone par insurance company poora muawza degi.",
    purposeBadge: "Business Protection",
    features: [
      "Instant claim payout via WhatsApp video survey",
      "No loss-of-rent or stock audit hassle for small claims",
      "Covers shop contents, counter, and electricals",
      "Cashless repair support in rural clusters"
    ],
    partnerRiskTier: "Micro-Insurance Tier 1"
  }
];

// Rural Fintech Literacy & Access Platform - Personas Data

export const personas = [
  {
    id: "meena",
    name: "Meena Devi",
    hindiName: "मीना देवी",
    age: 35,
    location: "Tier-4 Town (Chandauli, UP)",
    role: "Kirana Shop Owner",
    avatar: "🛍️",
    badge: "Cash-Heavy Retailer",
    story: "Runs a busy village general store. Has high cash volume during festive seasons, but zero formal bank loan history. Distrusts traditional bank paperwork.",
    cashflowType: "Weekly Steady + Festive Spikes",
    monthlyTurnover: 125000,
    upiMonthlyVolume: 48000,
    upiTxCount: 142,
    vouchers: 3,
    utilityScore: 92,
    baseScore: 685,
    seasonalFactor: "Festive Spike (Diwali/Holi)",
    preferredLanguage: "hi",
    goals: ["Working capital for festival stocking", "Business insurance for shop fire/theft"],
    vouchList: [
      { name: "Sunita (SHG Lead)", status: "Verified", weight: "+25 pts", role: "Self Help Group President" },
      { name: "Ramesh Kumar", status: "Verified", weight: "+15 pts", role: "Wholesale Grocery Supplier" },
      { name: "Pooja Sharma", status: "Verified", weight: "+10 pts", role: "Local Milk Co-op Secretary" }
    ],
    interviewResponses: {
      turnover: "Main hafte mein 25-30 hazar ka samaan bechti hoon.",
      suppliers: "Varanasi mandi se nagad aur UPI se maal lati hoon.",
      purpose: "Tyohar par stock dugna karne ke liye ₹50,000 chahiye."
    }
  },
  {
    id: "ravi",
    name: "Ravi Patel",
    hindiName: "रवि पटेल",
    age: 42,
    location: "Mandi Suburb (Anand, Gujarat)",
    role: "Agri-Entrepreneur & Farmer",
    avatar: "🌾",
    badge: "Seasonal Harvest Income",
    story: "Grows mustard and groundnuts. Earns lump sums 3 times a year after harvest. Traditional credit scores penalize him for zero income in non-harvest months.",
    cashflowType: "Highly Seasonal (Rabi & Kharif)",
    monthlyTurnover: 85000,
    upiMonthlyVolume: 32000,
    upiTxCount: 56,
    vouchers: 4,
    utilityScore: 88,
    baseScore: 710,
    seasonalFactor: "Harvest Peak (Post-Mandi Sale)",
    preferredLanguage: "gu",
    goals: ["Short-term crop input credit", "Equipment financing for solar water pump"],
    vouchList: [
      { name: "Anand Farmer Producer Co.", status: "Verified", weight: "+30 pts", role: "FPO Secretary" },
      { name: "Patel Agro Inputs", status: "Verified", weight: "+20 pts", role: "Seed & Fertilizer Merchant" },
      { name: "Jayesh Bhai", status: "Verified", weight: "+15 pts", role: "Mandi Licensed Agent" }
    ],
    interviewResponses: {
      turnover: "Fasal katne par mandi mein ek sath 2-3 lakh ka payment aata hai.",
      suppliers: "Khata seed store par chalta hai, harvest par chukata hoon.",
      purpose: "Beej aur khad ke liye ₹75,000 ka seasonal credit chahiye."
    }
  },
  {
    id: "fatima",
    name: "Fatima Bano",
    hindiName: "फातिमा बानो",
    age: 28,
    location: "Semi-Urban Craft Cluster (Lucknow, UP)",
    role: "Chikan Embroidery Artisan",
    avatar: "🧵",
    badge: "Regional Craftsperson",
    story: "Leads a 6-woman embroidery circle. Regional-language literate only. Needs raw material financing and wants to sell products online directly.",
    cashflowType: "Order-based Micro Cashflows",
    monthlyTurnover: 45000,
    upiMonthlyVolume: 28000,
    upiTxCount: 84,
    vouchers: 5,
    utilityScore: 95,
    baseScore: 740,
    seasonalFactor: "Wedding Season Peak",
    preferredLanguage: "hi",
    goals: ["Raw silk & thread inventory advance", "Digital payments onboarding"],
    vouchList: [
      { name: "Craftswomen Guild", status: "Verified", weight: "+35 pts", role: "Artisan Collective" },
      { name: "Zubair Thread House", status: "Verified", weight: "+15 pts", role: "Raw Material Dealer" }
    ],
    interviewResponses: {
      turnover: "Har mahine 15-20 suit tyar karti hoon.",
      suppliers: "Chowk mandi se dhaga nagad leti hoon.",
      purpose: "Shadi ke season ke liye thread aur kapda khareedna hai."
    }
  },
  {
    id: "suresh",
    name: "Suresh Gowda",
    hindiName: "सुरेश गौड़ा",
    age: 50,
    location: "Rural Industrial Cluster (Mandya, Karnataka)",
    role: "Jaggery Micro-Manufacturer",
    avatar: "⚙️",
    badge: "Micro Producer",
    story: "Operates a small sugarcane crusher and jaggery unit. Has consistent UPI supplier payments but no formal bank credit file.",
    cashflowType: "Daily Supplier Payments",
    monthlyTurnover: 210000,
    upiMonthlyVolume: 110000,
    upiTxCount: 230,
    vouchers: 2,
    utilityScore: 96,
    baseScore: 765,
    seasonalFactor: "Crushing Season (Nov-April)",
    preferredLanguage: "kn",
    goals: ["Crusher motor upgrade financing", "Factory worker accident insurance"],
    vouchList: [
      { name: "Mandya Cane Growers Union", status: "Verified", weight: "+25 pts", role: "Union Vice President" },
      { name: "Sri Lakshmi Power Co.", status: "Verified", weight: "+20 pts", role: "Industrial Power Utility" }
    ],
    interviewResponses: {
      turnover: "Rozana 10-12 quintal ganj bechta hoon.",
      suppliers: "Kisaano ko har hafte ganna payment UPI se karta hoon.",
      purpose: "Naye crusher motor ke liye ₹1,50,000 ka loan chahiye."
    }
  }
];

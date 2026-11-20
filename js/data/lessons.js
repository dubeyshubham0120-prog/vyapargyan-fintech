// Rural Fintech Literacy & Access Platform - Lessons Data

export const lessons = [
  {
    id: "lesson_upi_proof",
    title: "How UPI QR Code Builds Your Digital Proof of Business",
    hindiTitle: "UPI क्यूआर कोड से डिजिटल बिजनेस सबूत कैसे बनता है",
    icon: "📱",
    duration: "2 min listen",
    scoreBoost: 20,
    audioText: "Jab aap grahak se UPI QR dwara paise lete hain, toh bank ke pas aapke roj ka vyapar record hota hai. Bina kisi kagaj ke yeh sabit karta hai ki aapki dukan chal rahi hai. Banks isi digital proof ko dekh kar kam vyaj par loan deti hain.",
    summary: "Accepting payments via QR codes creates an automatic, unalterable digital cashflow statement. Banks trust UPI transaction trails far more than self-declared cash income.",
    quiz: {
      question: "Why do banks prefer UPI transactions over cash when approving a loan?",
      options: [
        "Because cash money loses value in banks",
        "Because UPI creates verified digital proof of your daily shop income without paperwork",
        "Because UPI charges high fees to shopkeepers",
        "It doesn't make any difference to banks"
      ],
      correctIndex: 1,
      explanation: "Verified digital transactions prove steady cash flow without requiring expensive audits or paper records!"
    }
  },
  {
    id: "lesson_interest_math",
    title: "Moneylender vs. Bank Loan: Calculating the Real Cost",
    hindiTitle: "महाजन (सूदखोर) vs बैंक लोन: असली ब्याज का गणित",
    icon: "🧮",
    duration: "3 min listen",
    scoreBoost: 25,
    audioText: "Local mahajan kehta hai 'Sirf 5 taka vyaj'... lekin woh har mahine 5% leta hai, jo saal ka 60% banta hai! Bank ka 12% saal ka vyaj mahajan se 5 guna sasta hai. Hamesha saal ka vyaj rate poochein.",
    summary: "Informal lenders charge '5% monthly' which equals 60% per year! Bank loans charge 10-14% per year, saving you tens of thousands of rupees.",
    quiz: {
      question: "If a local moneylender charges 5% interest per month, what is the annual interest rate?",
      options: [
        "5% per year",
        "15% per year",
        "60% per year",
        "50% per year"
      ],
      correctIndex: 2,
      explanation: "5% multiplied by 12 months equals 60% per year! Bank loans at 12% annual rate are 5 times cheaper."
    }
  },
  {
    id: "lesson_community_vouching",
    title: "How Peer Vouching & SHG Circles Unlock Higher Credit",
    hindiTitle: "कम्युनिटी वाउचिंग और SHG समूह से ज्यादा लोन कैसे पाएं",
    icon: "🤝",
    duration: "2.5 min listen",
    scoreBoost: 30,
    audioText: "Jab aapke gaon ke SHG adhyaksh ya reputed shopkeeper aapki imandari ki guarantee dete hain, toh aapka Trust Score turant badhta hai. Peer vouching se bina kisi collateral ke bada loan mil sakta hai.",
    summary: "Traditional banks ask for land or gold as collateral. Our Trust Platform uses social trust — co-signing by trusted community members acts as reputation collateral.",
    quiz: {
      question: "What acts as reputation collateral in alternative credit scoring?",
      options: [
        "Gold jewelry and land documents only",
        "Verified vouching from trusted SHG leaders, co-ops, and local merchants",
        "Paying high cash deposits upfront",
        "Having a university degree"
      ],
      correctIndex: 1,
      explanation: "Social vouching converts community respect into a structured credit booster recognized by partner banks!"
    }
  },
  {
    id: "lesson_business_insurance",
    title: "Protecting Your Shop & Crops Against Shock Losses",
    hindiTitle: "दुकान और फसल को अचानक नुकसान से बचाना (बीमा)",
    icon: "🛡️",
    duration: "2 min listen",
    scoreBoost: 25,
    audioText: "Aag, chori ya bemausam barish se dukan ka stock ya fasal barbad ho sakti hai. Sirf 3-4 rupaye roj ka bima aapko karze ke daldal se bachata hai.",
    summary: "Micro-insurance guarantees that unexpected events like fires, floods, or crop failure don't force you back to high-interest moneylenders.",
    quiz: {
      question: "How does micro-insurance protect a rural business owner?",
      options: [
        "It increases shop taxes",
        "It pays for damaged stock or crop loss so you don't fall into a debt trap",
        "It forces you to close shop during rain",
        "It is only for large factories"
      ],
      correctIndex: 1,
      explanation: "Micro-insurance pays claims quickly so one bad season doesn't wipe out years of hard-earned savings!"
    }
  }
];

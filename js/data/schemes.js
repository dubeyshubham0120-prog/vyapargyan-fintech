// Indian Government Schemes & Subsidies Dataset for Rural Entrepreneurs & MSMEs
// Contains 16 Central & State Schemes with real official portal links and eligibility rules.

export const schemesData = [
  {
    id: "pmegp",
    name: "Prime Minister's Employment Generation Programme (PMEGP)",
    nameHi: "प्रधानमंत्री रोजगार सृजन कार्यक्रम (PMEGP)",
    issuingBody: "Ministry of MSME / KVIC",
    type: "Central",
    sectorTag: "MSME & Startup Support",
    unverifiedFlag: false,
    benefitAmount: "Up to ₹50 Lakhs loan with 15% - 35% Capital Subsidy",
    benefitType: "Capital Subsidy Loan",
    incomeLimits: "No upper family income limit. Project cost up to ₹50L for Manufacturing, ₹20L for Service.",
    applyLink: "https://www.kviconline.gov.in/pmegpeportal/pmegpfilters/",
    summary: "Credit-linked subsidy program to generate self-employment in rural and urban areas by setting up micro-enterprises.",
    eligibilityCriteriaText: "Age 18+; At least 8th Pass for projects above ₹10 Lakhs (Manufacturing) or ₹5 Lakhs (Service); New projects only.",
    eligibilityRules: {
      minAge: 18,
      minEducationLevel: "8th_pass",
      businessStatus: ["new", "startup", "operating"],
      applicableStates: ["all"]
    },
    requiredDocuments: [
      "Aadhaar Card & PAN Card",
      "Project Report / Business Plan",
      "Educational Qualification Certificate (8th Pass+)",
      "Caste / Social Category Certificate (OBC/SC/ST)",
      "Rural Area Certificate from Gram Panchayat Sarpanch"
    ],
    applicationProcess: [
      "Step 1: Visit official KVIC PMEGP Portal (kviconline.gov.in).",
      "Step 2: Fill online application form for Individual Agency (KVIC, KVIB, or DIC).",
      "Step 3: Upload Aadhaar, Project Report, and Caste Certificate.",
      "Step 4: Application is routed to District Level Task Force Committee (DLTFC) for interview.",
      "Step 5: On approval, bank sanction letter is issued and 2-week EDP training is conducted before disrobal."
    ],
    gapAnalysisRules: (profile) => {
      const gaps = [];
      if (profile.age < 18) {
        gaps.push({
          gapTitle: "Minimum Age Gap",
          description: "PMEGP requires applicant to be at least 18 years of age.",
          resolutionAction: "Apply under a legal guardian or co-applicant aged 18+.",
          actionLink: "#"
        });
      }
      if (profile.education === "non_formal" || profile.education === "primary") {
        gaps.push({
          gapTitle: "Education Qualification Limit",
          description: "For projects exceeding ₹10 Lakhs in manufacturing or ₹5 Lakhs in service, 8th pass certificate is required.",
          resolutionAction: "Apply for project cost under ₹5 Lakhs or obtain adult literacy certification.",
          actionLink: "https://www.kviconline.gov.in/pmegpeportal/"
        });
      }
      if (!profile.hasUdyam) {
        gaps.push({
          gapTitle: "Udyam Registration Recommended",
          description: "Registering on Udyam expedites KVIC task force approval.",
          resolutionAction: "Obtain free Udyam Aadhaar certificate in 5 minutes.",
          actionLink: "https://udyamregistration.gov.in/"
        });
      }
      return gaps;
    }
  },
  {
    id: "mudra_kishore",
    name: "Pradhan Mantri MUDRA Yojana (Kishore & Tarun Loans)",
    nameHi: "प्रधानमंत्री मुद्रा योजना (किशोर व तरुण लोन)",
    issuingBody: "Ministry of Finance / MUDRA Bank",
    type: "Central",
    sectorTag: "Financial Assistance",
    unverifiedFlag: false,
    benefitAmount: "Collateral-free loan up to ₹10 Lakhs (Kishore: ₹50k - ₹5L, Tarun: ₹5L - ₹10L)",
    benefitType: "Collateral-Free Loan",
    incomeLimits: "No strict income ceiling. Business must demonstrate cashflow for EMI repayment.",
    applyLink: "https://www.mudra.org.in/",
    summary: "Refinance scheme for non-corporate, non-farm micro and small business entities in trading, manufacturing, and services.",
    eligibilityCriteriaText: "Non-farm micro-enterprises, Kirana stores, artisans, food stalls, repair shops, micro-manufacturers.",
    eligibilityRules: {
      minAge: 18,
      applicableBusinessTypes: ["kirana", "artisan", "manufacturing", "dairy", "vendor", "services"],
      applicableStates: ["all"]
    },
    requiredDocuments: [
      "Aadhaar & Voter ID Proof",
      "Residence Proof / Utility Bill",
      "Business Registration / Sales Register / Khata Book",
      "Last 6 months Bank Account Statement",
      "2 Passport Size Photographs"
    ],
    applicationProcess: [
      "Step 1: Visit any Commercial Bank, RRB, Microfinance Institution, or UdyamiMitra Portal.",
      "Step 2: Fill MUDRA Application Form for Kishore/Tarun category.",
      "Step 3: Attach identity proof, business proof, and quotation for machinery/stock.",
      "Step 4: Bank assesses business cashflow without requiring property collateral.",
      "Step 5: Sanctioned amount is disbursed and MUDRA Card (Rupay debit card) is issued."
    ],
    gapAnalysisRules: (profile) => {
      const gaps = [];
      if (!profile.hasBankStatement) {
        gaps.push({
          gapTitle: "Bank Account History Gap",
          description: "Banks require at least 3-6 months active bank account statements for Kishore/Tarun loans.",
          resolutionAction: "Start depositing daily sales in UPI/Bank account or apply for Shishu MUDRA (up to ₹50,000) first.",
          actionLink: "https://www.mudra.org.in/"
        });
      }
      if (!profile.hasUdyam) {
        gaps.push({
          gapTitle: "Missing Udyam Registration",
          description: "MUDRA lenders require Udyam MSME certificate for interest subvention.",
          resolutionAction: "Register business on Udyam portal free of cost.",
          actionLink: "https://udyamregistration.gov.in/"
        });
      }
      return gaps;
    }
  },
  {
    id: "pm_svanidhi",
    name: "PM Street Vendor's AtmaNirbhar Nidhi (PM SVANidhi)",
    nameHi: "पीएम स्ट्रीट वेंडर्स आत्मनिर्भर निधि (पीएम स्वनिधि)",
    issuingBody: "Ministry of Housing and Urban Affairs",
    type: "Central",
    sectorTag: "Financial Assistance",
    unverifiedFlag: false,
    benefitAmount: "Tranche loans of ₹10k, ₹20k, ₹50k with 7% interest subsidy & cashbacks",
    benefitType: "Working Capital Loan + Interest Subsidy",
    incomeLimits: "Street vendors and micro-retailers in urban/peri-urban/rural growth centers.",
    applyLink: "https://pmsvanidhi.mohua.gov.in/",
    summary: "Special micro-credit facility for street vendors and small retailers with cashback incentive on digital transactions.",
    eligibilityCriteriaText: "Street vendors, vegetable sellers, tea stalls, small hawkers engaged in vending on or before March 24, 2020.",
    eligibilityRules: {
      minAge: 18,
      applicableBusinessTypes: ["vendor", "kirana", "services"],
      applicableStates: ["all"]
    },
    requiredDocuments: [
      "Aadhaar Card linked with Mobile Number",
      "Vending Certificate / Identity Card issued by Urban Local Body (ULB) or Letter of Recommendation (LoR)",
      "Bank Account Details / Passbook Copy"
    ],
    applicationProcess: [
      "Step 1: Visit PM SVANidhi portal or visit nearest Common Service Centre (CSC).",
      "Step 2: Search Vending Survey Status or request Letter of Recommendation (LoR) from local authority.",
      "Step 3: Submit online loan application selecting preferred lender Bank/NBFC.",
      "Step 4: Loan approval is processed within 7-10 working days.",
      "Step 5: Digital QR code is linked to receive ₹100/month cashback on UPI transactions."
    ],
    gapAnalysisRules: (profile) => {
      const gaps = [];
      if (profile.businessType !== "vendor" && profile.businessType !== "kirana") {
        gaps.push({
          gapTitle: "Target Business Type Specificity",
          description: "PM SVANidhi specifically targets street vendors, hawkers, and small roadside micro-retailers.",
          resolutionAction: "If operating fixed shop/farm, consider MUDRA Shishu or Stand-Up India.",
          actionLink: "https://pmsvanidhi.mohua.gov.in/"
        });
      }
      return gaps;
    }
  },
  {
    id: "standup_india",
    name: "Stand-Up India Scheme for Women & SC/ST Entrepreneurs",
    nameHi: "स्टैंड-अप इंडिया योजना (महिला एवं SC/ST उद्यमी)",
    issuingBody: "Ministry of Finance / SIDBI",
    type: "Central",
    sectorTag: "Women Entrepreneurship",
    unverifiedFlag: false,
    benefitAmount: "Bank Loan from ₹10 Lakhs to ₹1 Crore for Greenfield Enterprises",
    benefitType: "Composite Bank Loan",
    incomeLimits: "No maximum income limit. Enterprise must be greenfield (first-time venture).",
    applyLink: "https://www.standupmitra.in/",
    summary: "Facilitates bank loans between ₹10 Lakhs and ₹1 Crore to at least one SC or ST borrower and at least one woman borrower per bank branch.",
    eligibilityCriteriaText: "SC/ST and/or Female Entrepreneurs; Age 18+; Greenfield venture in manufacturing, services, or trading.",
    eligibilityRules: {
      minAge: 18,
      genderRequirements: ["female", "sc_st"],
      businessStatus: ["new", "startup"],
      applicableStates: ["all"]
    },
    requiredDocuments: [
      "Aadhaar Card, PAN Card & Voter ID",
      "Category Certificate (for SC/ST applicants)",
      "Proof of Business Address & Lease/Title Deeds",
      "Project Report with Financial Projections",
      "Pollution Control Clearance (if manufacturing)"
    ],
    applicationProcess: [
      "Step 1: Register on Standup Mitra portal (standupmitra.in).",
      "Step 2: Choose handholding support options (financial literacy, EDP training, loan application assistance).",
      "Step 3: Fill application form and select target Scheduled Commercial Bank branch.",
      "Step 4: Portal tracks application status and connects with Lead District Manager (LDM).",
      "Step 5: Bank sanctions loan with Credit Guarantee Fund Scheme for Stand Up India (CGFSI)."
    ],
    gapAnalysisRules: (profile) => {
      const gaps = [];
      if (profile.gender !== "female" && profile.category !== "sc" && profile.category !== "st") {
        gaps.push({
          gapTitle: "Eligibility Requirement: Female or SC/ST Category",
          description: "Stand-Up India mandates that the primary applicant or 51% equity owner must be a Woman or belong to SC/ST category.",
          resolutionAction: "Explore PMEGP or MUDRA Tarun which open to all social categories.",
          actionLink: "https://www.standupmitra.in/"
        });
      }
      if (profile.yearsInOperation > 3) {
        gaps.push({
          gapTitle: "Greenfield Venture Requirement",
          description: "Stand-Up India is intended for first-time / new greenfield business setups.",
          resolutionAction: "For expansion of existing 3+ yr business, apply for CGTMSE or MUDRA Tarun.",
          actionLink: "#"
        });
      }
      return gaps;
    }
  },
  {
    id: "kcc",
    name: "Kisan Credit Card (KCC) & Agri Infrastructure Fund",
    nameHi: "किसान क्रेडिट कार्ड (KCC) एवं कृषि इंफ्रा फंड",
    issuingBody: "Ministry of Agriculture & Farmers Welfare / NABARD",
    type: "Central",
    sectorTag: "Agriculture",
    unverifiedFlag: false,
    benefitAmount: "Subsidized credit limit up to ₹3 Lakhs at 4% effective interest rate",
    benefitType: "Interest Subvention Working Capital",
    incomeLimits: "Based on crop cultivation area, land holding size, or livestock headcount.",
    applyLink: "https://kisan-credit-card.in/",
    summary: "Provides timely credit to farmers for crop cultivation, post-harvest expenses, maintenance of farm assets, and allied activities.",
    eligibilityCriteriaText: "Individual farmers, joint borrowers, tenant farmers, sharecroppers, SHGs of farmers, animal husbandry & fisheries farmers.",
    eligibilityRules: {
      minAge: 18,
      applicableBusinessTypes: ["farming", "dairy"],
      applicableStates: ["all"]
    },
    requiredDocuments: [
      "Land Revenue Record (Khasra/Khatauni / Pahani)",
      "Aadhaar Card & Passport Photo",
      "Declaration of Crops sown / Livestock owned",
      "No-Dues Certificate from neighboring bank branches"
    ],
    applicationProcess: [
      "Step 1: Fill 1-page simplified KCC form available at bank branch, PM-Kisan portal, or CSC.",
      "Step 2: Attach land records or tenancy agreement along with Aadhaar.",
      "Step 3: Bank verifies land records and issues KCC card within 14 days.",
      "Step 4: ATM-enabled Rupay Kisan Card provided for easy cash withdrawals at ATMs and POS terminals."
    ],
    gapAnalysisRules: (profile) => {
      const gaps = [];
      if (profile.businessType !== "farming" && profile.businessType !== "dairy") {
        gaps.push({
          gapTitle: "Agricultural Activity Focus",
          description: "KCC is specifically tailored for crop farmers, dairy owners, poultry, and fisheries.",
          resolutionAction: "If running a retail store or artisan business, apply for MUDRA or PMEGP.",
          actionLink: "https://kisan-credit-card.in/"
        });
      }
      if (!profile.hasLandOrAsset) {
        gaps.push({
          gapTitle: "Land Record / Tenancy Agreement Needed",
          description: "Land revenue copy (Khatauni) or tenant farmer SHG agreement is required.",
          resolutionAction: "Obtain digital land Record via state Bulekh portal or register under SHG joint liability group.",
          actionLink: "#"
        });
      }
      return gaps;
    }
  },
  {
    id: "pmfme",
    name: "PM Formalisation of Micro Food Processing Enterprises (PMFME)",
    nameHi: "पीएम सूक्ष्म खाद्य उद्योग उन्नयन योजना (PMFME)",
    issuingBody: "Ministry of Food Processing Industries",
    type: "Central",
    sectorTag: "MSME & Startup Support",
    unverifiedFlag: false,
    benefitAmount: "35% Credit-linked Capital Subsidy up to ₹10 Lakhs",
    benefitType: "Capital Subsidy",
    incomeLimits: "Individual micro food processing units, FPOs, Producer Cooperatives, SHGs.",
    applyLink: "https://pmfme.mofpi.gov.in/",
    summary: "Financial, technical, and business support for upgrading existing micro food processing enterprises and One District One Product (ODOP) food units.",
    eligibilityCriteriaText: "Existing or new micro food processing units (bakery, spice grinding, pickle, rice mill, oil extraction, dairy products).",
    eligibilityRules: {
      minAge: 18,
      applicableBusinessTypes: ["manufacturing", "farming", "dairy"],
      applicableStates: ["all"]
    },
    requiredDocuments: [
      "Aadhaar Card & PAN Card",
      "FSSAI Registration / License Copy (or application receipt)",
      "Proof of Ownership / Lease of Premises",
      "Bank Account Statement for 6 months",
      "Electricity Bill / Utility Proof"
    ],
    applicationProcess: [
      "Step 1: Register on PMFME portal (pmfme.mofpi.gov.in).",
      "Step 2: Select 'Individual Micro Enterprise' or 'Group (SHG/FPO) Category'.",
      "Step 3: Fill Detailed Project Report (DPR) with assistance from District Resource Person (DRP).",
      "Step 4: District Level Committee approves DPR and forwards to bank for loan sanction.",
      "Step 5: Subsidy is credited to bank account as fixed deposit held for 3 years."
    ],
    gapAnalysisRules: (profile) => {
      const gaps = [];
      if (!profile.hasFssai) {
        gaps.push({
          gapTitle: "Requires FSSAI Micro-Registration",
          description: "Food processing operations require basic FSSAI registration.",
          resolutionAction: "Obtain instant ₹100 FSSAI micro registration online at FoSCoS portal.",
          actionLink: "https://foscos.fssai.gov.in/"
        });
      }
      return gaps;
    }
  },
  {
    id: "pm_vishwakarma",
    name: "PM Vishwakarma Scheme for Artisans & Craftspeople",
    nameHi: "पीएम विश्वकर्मा योजना (कारीगर एवं हस्तशिल्पी)",
    issuingBody: "Ministry of MSME",
    type: "Central",
    sectorTag: "Artisan & Craft",
    unverifiedFlag: false,
    benefitAmount: "₹15,000 Toolkit E-Voucher + Collateral-free Loan up to ₹3 Lakhs at 5% interest",
    benefitType: "Subsidized Loan & Skill Grant",
    incomeLimits: "Artisans working with hands & tools in 18 traditional trades.",
    applyLink: "https://pmvishwakarma.gov.in/",
    summary: "End-to-end support to artisans and craftspeople including recognition, skill upgrading, toolkit incentive, collateral-free credit, and marketing support.",
    eligibilityCriteriaText: "Artisans in 18 traditional trades (Carpenter, Blacksmith, Armorer, Locksmith, Toolsmith, Potter, Sculptor, Cobbler, Mason, Basket/Mat Weaver, Tailor, Fishing Net Maker, etc.).",
    eligibilityRules: {
      minAge: 18,
      applicableBusinessTypes: ["artisan", "services", "manufacturing"],
      applicableStates: ["all"]
    },
    requiredDocuments: [
      "Aadhaar Card linked to active Mobile Number",
      "Bank Passbook Copy with IFSC",
      "Ration Card or Family Identification Document",
      "Trade Declaration of Traditional Skill"
    ],
    applicationProcess: [
      "Step 1: Visit Common Service Centre (CSC) for bio-metric registration on PM Vishwakarma Portal.",
      "Step 2: 3-step verification by Gram Panchayat / ULB, District Implementation Committee, and Screening Committee.",
      "Step 3: Issue of PM Vishwakarma Digital ID & Certificate.",
      "Step 4: 5-7 days Basic Skill Training with ₹500/day stipend + ₹15,000 Toolkit E-Voucher.",
      "Step 5: Access Tranche-1 Loan ₹1 Lakh (5% interest) and Tranche-2 Loan ₹2 Lakhs on repayment."
    ],
    gapAnalysisRules: (profile) => {
      const gaps = [];
      if (profile.businessType !== "artisan" && profile.businessType !== "services") {
        gaps.push({
          gapTitle: "Traditional Trade Qualification",
          description: "PM Vishwakarma covers 18 specific traditional artisan trades (carpenters, potters, weavers, tailors, blacksmiths).",
          resolutionAction: "If running modern retail or agribusiness, apply under PMEGP or MUDRA.",
          actionLink: "https://pmvishwakarma.gov.in/"
        });
      }
      return gaps;
    }
  },
  {
    id: "cgtmse",
    name: "Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)",
    nameHi: "क्रेडिट गारंटी फंड ट्रस्ट (CGTMSE बिना गारंटी लोन)",
    issuingBody: "Ministry of MSME & SIDBI",
    type: "Central",
    sectorTag: "Financial Assistance",
    unverifiedFlag: false,
    benefitAmount: "Collateral-Free Credit Guarantee Cover up to ₹5 Crores (85% coverage for micro)",
    benefitType: "Credit Guarantee Support",
    incomeLimits: "Micro and Small Enterprises (Manufacturing, Service, Retail Trade).",
    applyLink: "https://www.cgtmse.in/",
    summary: "Enables micro and small enterprises to get bank loans without offering collateral security or third-party guarantees.",
    eligibilityCriteriaText: "New and existing Micro & Small Enterprises including retail trade up to ₹2 Crore loan size.",
    eligibilityRules: {
      minAge: 18,
      applicableBusinessTypes: ["kirana", "manufacturing", "services", "dairy"],
      applicableStates: ["all"]
    },
    requiredDocuments: [
      "Udyam MSME Registration Certificate",
      "Detailed Project Report / Financial Statement",
      "PAN Card & Aadhaar of Promoters",
      "GST Registration Certificate (if turnover > ₹40L)"
    ],
    applicationProcess: [
      "Step 1: Approach Member Lending Institution (MLI) Bank / NBFC with business proposal.",
      "Step 2: Request loan sanction under CGTMSE collateral-free cover scheme.",
      "Step 3: Bank evaluates creditworthiness and submits guarantee application directly to CGTMSE trust.",
      "Step 4: CGTMSE approves guarantee cover upon payment of nominal annual guarantee fee.",
      "Step 5: Bank disburses collateral-free term loan / working capital limit."
    ],
    gapAnalysisRules: (profile) => {
      const gaps = [];
      if (!profile.hasUdyam) {
        gaps.push({
          gapTitle: "Requires Mandatory Udyam Registration",
          description: "CGTMSE coverage is restricted to registered Micro and Small Enterprises.",
          resolutionAction: "Complete Udyam registration online (takes 5 mins with Aadhaar).",
          actionLink: "https://udyamregistration.gov.in/"
        });
      }
      return gaps;
    }
  },
  {
    id: "nrlm_shg",
    name: "Deendayal Antyodaya Yojana - NRLM SHG Bank Linkage",
    nameHi: "दीनदयाल अंत्योदय योजना - NRLM महिला स्वयं सहायता समूह",
    issuingBody: "Ministry of Rural Development",
    type: "Central",
    sectorTag: "Women Entrepreneurship",
    unverifiedFlag: false,
    benefitAmount: "Interest Subvention Loans up to ₹3 Lakhs for SHGs at effective 7% per annum",
    benefitType: "Interest Subvention Loan",
    incomeLimits: "Rural poor households organized into Women Self Help Groups (SHGs).",
    applyLink: "https://nrlm.gov.in/",
    summary: "Promotes poverty reduction by building strong institutions of the poor, particularly women, and enabling access to financial services and micro-enterprise capital.",
    eligibilityCriteriaText: "Women SHGs active for at least 6 months, practicing Panchasutra (regular meetings, savings, internal lending, repayment, book-keeping).",
    eligibilityRules: {
      minAge: 18,
      genderRequirements: ["female"],
      applicableStates: ["all"]
    },
    requiredDocuments: [
      "SHG Resolution Copy signed by President & Secretary",
      "SHG Savings Bank Account Passbook",
      "Panchasutra Register / Minutes Book Copy",
      "Aadhaar Cards of all SHG Members"
    ],
    applicationProcess: [
      "Step 1: Form 10-20 member Women SHG and register with Gram Panchayat Block Mission Management Unit (BMMU).",
      "Step 2: Open SHG savings account and practice Panchasutra internal lending for 6 months.",
      "Step 3: Receive Revolving Fund (RF) ₹20,000 and Community Investment Fund (CIF) ₹1.5 Lakhs.",
      "Step 4: Apply for Bank Credit Linkage loan up to ₹3 Lakhs with 7% interest rate subvention."
    ],
    gapAnalysisRules: (profile) => {
      const gaps = [];
      if (profile.gender !== "female") {
        gaps.push({
          gapTitle: "Exclusively for Women SHG Members",
          description: "DAY-NRLM bank linkage focuses on women self-help groups in rural areas.",
          resolutionAction: "Encourage female family members to join SHG or apply for PMEGP individual loan.",
          actionLink: "https://nrlm.gov.in/"
        });
      }
      return gaps;
    }
  },
  {
    id: "up_odop",
    name: "UP One District One Product (ODOP) Margin Money Scheme",
    nameHi: "यूपी एक जनपद एक उत्पाद (ODOP) मार्जिन मनी योजना",
    issuingBody: "Department of MSME & Export Promotion, Govt of Uttar Pradesh",
    type: "State",
    state: "Uttar Pradesh",
    sectorTag: "Artisan & Craft",
    unverifiedFlag: false,
    benefitAmount: "Margin Money Subsidy up to 25% (Max ₹20 Lakhs) on Project Cost",
    benefitType: "State Capital Subsidy",
    incomeLimits: "Domicile residents of Uttar Pradesh setting up designated ODOP product units.",
    applyLink: "http://diupmsme.upsdc.gov.in/",
    summary: "Financial assistance to foster traditional craft and specialized products indigenous to each district of Uttar Pradesh (e.g. Varanasi Silk, Kanpur Leather, Bhadohi Carpets, Moradabad Brassware).",
    eligibilityCriteriaText: "Resident of Uttar Pradesh; Age 18+; Unit must produce designated district ODOP product.",
    eligibilityRules: {
      minAge: 18,
      applicableStates: ["Uttar Pradesh", "UP"],
      applicableBusinessTypes: ["artisan", "manufacturing"]
    },
    requiredDocuments: [
      "UP Domicile Certificate / Residence Proof",
      "Aadhaar Card & PAN Card",
      "ODOP Product Skill / Unit Proof",
      "Project Cost Estimate & Machinery Quotations",
      "District Industries Centre (DIC) Recommendation"
    ],
    applicationProcess: [
      "Step 1: Register on DIUPMSME / Nivesh Mitra online portal (diupmsme.upsdc.gov.in).",
      "Step 2: Submit ODOP Margin Money Scheme application selecting target district product.",
      "Step 3: Verification of UP domicile and project feasibility by District Industries Centre (DIC).",
      "Step 4: Bank sanctions loan and DIC deposits margin money subsidy in joint account."
    ],
    gapAnalysisRules: (profile) => {
      const gaps = [];
      if (profile.state !== "Uttar Pradesh" && profile.state !== "UP") {
        gaps.push({
          gapTitle: "State Domicile Restriction: Uttar Pradesh",
          description: "This is a state-specific scheme for residents of Uttar Pradesh.",
          resolutionAction: "Select central schemes like PM Vishwakarma or check your state-specific schemes.",
          actionLink: "http://diupmsme.upsdc.gov.in/"
        });
      }
      return gaps;
    }
  },
  {
    id: "raj_cmsips",
    name: "Rajasthan Chief Minister Small Industry Promotion Scheme (CMSIPS)",
    nameHi: "राजस्थान मुख्यमंत्री लघु उद्योग प्रोत्साहन योजना (CMSIPS)",
    issuingBody: "Department of Industries, Govt of Rajasthan",
    type: "State",
    state: "Rajasthan",
    sectorTag: "MSME & Startup Support",
    unverifiedFlag: false,
    benefitAmount: "Interest Subsidy of 5% to 8% per annum on loans up to ₹10 Crores",
    benefitType: "Interest Subsidy",
    incomeLimits: "Residents of Rajasthan establishing new micro, small, or medium ventures.",
    applyLink: "https://sso.rajasthan.gov.in/",
    summary: "Subsidized loans through financial institutions to promote manufacturing, service, and commercial trade enterprises across Rajasthan.",
    eligibilityCriteriaText: "Resident of Rajasthan; Age 18+; Enterprise in manufacturing, service, or retail trade.",
    eligibilityRules: {
      minAge: 18,
      applicableStates: ["Rajasthan"],
      applicableBusinessTypes: ["kirana", "manufacturing", "services", "artisan", "dairy"]
    },
    requiredDocuments: [
      "Rajasthan Jan Aadhaar Card & Aadhaar",
      "Rajasthan Domicile Certificate",
      "Project Financial Plan",
      "Udyam MSME Registration Certificate"
    ],
    applicationProcess: [
      "Step 1: Log in to SSO Rajasthan Portal (sso.rajasthan.gov.in).",
      "Step 2: Select 'MLUPY / CMSIPS' application module under Industry Department.",
      "Step 3: Fill online application and choose target Bank branch.",
      "Step 4: DIC verifies Jan Aadhaar details and forwards application to Bank.",
      "Step 5: Bank disburses loan and interest subsidy of 8% (up to ₹25L) or 6% (up to ₹5Cr) is credited quarterly."
    ],
    gapAnalysisRules: (profile) => {
      const gaps = [];
      if (profile.state !== "Rajasthan") {
        gaps.push({
          gapTitle: "State Domicile Restriction: Rajasthan",
          description: "CMSIPS is restricted to residents of Rajasthan holding Jan Aadhaar.",
          resolutionAction: "Explore PMEGP, MUDRA, or your resident state schemes.",
          actionLink: "https://sso.rajasthan.gov.in/"
        });
      }
      return gaps;
    }
  },
  {
    id: "guj_vby",
    name: "Gujarat Vajpayee Bankable Yojana (VBY)",
    nameHi: "गुजरात वाजपेयी बैंकेबल योजना (VBY)",
    issuingBody: "Cottage and Rural Industries, Govt of Gujarat",
    type: "State",
    state: "Gujarat",
    sectorTag: "Financial Assistance",
    unverifiedFlag: false,
    benefitAmount: "Bank Loan up to ₹8 Lakhs with Cash Subsidy up to ₹1.25 Lakhs (up to 40% for SC/ST/Women)",
    benefitType: "Capital Subsidy Loan",
    incomeLimits: "Domicile residents of Gujarat engaged in Cottage & Rural Industries.",
    applyLink: "https://cottage.gujarat.gov.in/",
    summary: "Provides financial assistance to unemployed youth in urban and rural areas of Gujarat to establish self-employment ventures in cottage industries, handicrafts, and services.",
    eligibilityCriteriaText: "Resident of Gujarat; Age 18-65; Minimum 4th pass or 3 months trade training or heritage skill.",
    eligibilityRules: {
      minAge: 18,
      maxAge: 65,
      applicableStates: ["Gujarat"],
      applicableBusinessTypes: ["artisan", "kirana", "services", "manufacturing"]
    },
    requiredDocuments: [
      "Gujarat Residence Certificate / Election Card",
      "Aadhaar Card & PAN Card",
      "Educational / Skill Training Certificate (4th Pass+)",
      "Caste Certificate (for higher subsidy slab)",
      "Project Estimate from Approved Dealer"
    ],
    applicationProcess: [
      "Step 1: Register on Gujarat e-Cottage Portal (cottage.gujarat.gov.in).",
      "Step 2: Complete online application form for Vajpayee Bankable Yojana.",
      "Step 3: DIC District Officer interviews applicant and verifies trade experience.",
      "Step 4: Application sponsored to Bank for loan sanction.",
      "Step 5: Subsidy (20% to 40%) is deposited directly in bank account."
    ],
    gapAnalysisRules: (profile) => {
      const gaps = [];
      if (profile.state !== "Gujarat") {
        gaps.push({
          gapTitle: "State Domicile Restriction: Gujarat",
          description: "Vajpayee Bankable Yojana is applicable only for Gujarat residents.",
          resolutionAction: "Explore Central Government schemes or switch state profile.",
          actionLink: "https://cottage.gujarat.gov.in/"
        });
      }
      return gaps;
    }
  },
  {
    id: "kar_sevasindhu",
    name: "Karnataka Rajiv Gandhi Swavalambana Employment Scheme",
    nameHi: "कर्नाटक राजीव गांधी स्वावलंबन रोजगार योजना",
    issuingBody: "Department of Rural Development & Panchayat Raj, Govt of Karnataka",
    type: "State",
    state: "Karnataka",
    sectorTag: "Skills & Employment",
    unverifiedFlag: false,
    benefitAmount: "Financial assistance & loan subsidy up to ₹1 Lakh for rural unemployed youth",
    benefitType: "Subsidized Self-Employment Loan",
    incomeLimits: "Annual family income below ₹1.5 Lakhs for rural Karnataka residents.",
    applyLink: "https://sevasindhu.karnataka.gov.in/",
    summary: "Financial assistance to rural unemployed youth in Karnataka to setup micro retail, auto repair, tailoring, and agro-service units.",
    eligibilityCriteriaText: "Resident of Karnataka; Age 18-45; BPL Ration Card holder with family income < ₹1.5L.",
    eligibilityRules: {
      minAge: 18,
      maxAge: 45,
      applicableStates: ["Karnataka"],
      maxIncomeLimit: 150000
    },
    requiredDocuments: [
      "Karnataka Seva Sindhu Domicile Certificate",
      "BPL Ration Card / Income Certificate (< ₹1.5L)",
      "Aadhaar Card & Bank Passbook",
      "Project Proposal for Micro-Business"
    ],
    applicationProcess: [
      "Step 1: Log in to Seva Sindhu Karnataka Portal (sevasindhu.karnataka.gov.in).",
      "Step 2: Submit application under RDPR department module.",
      "Step 3: Gram Panchayat Panchayat Development Officer (PDO) conducts field verification.",
      "Step 4: Bank disburses micro loan with state subsidy release."
    ],
    gapAnalysisRules: (profile) => {
      const gaps = [];
      if (profile.state !== "Karnataka") {
        gaps.push({
          gapTitle: "State Domicile Restriction: Karnataka",
          description: "Scheme restricted to Karnataka BPL cardholders.",
          resolutionAction: "Explore PMEGP or MUDRA schemes.",
          actionLink: "https://sevasindhu.karnataka.gov.in/"
        });
      }
      return gaps;
    }
  },
  {
    id: "sfurti",
    name: "SFURTI (Scheme of Fund for Regeneration of Traditional Industries)",
    nameHi: "स्फूर्ति (SFURTI पारंपरिक उद्योग संवर्धन योजना)",
    issuingBody: "Ministry of MSME / KVIC",
    type: "Central",
    sectorTag: "Artisan & Craft",
    unverifiedFlag: true,
    benefitAmount: "Up to ₹2.5 Crore to ₹5 Crore Grant per Cluster for Artisans & Weavers",
    benefitType: "Infrastructure Cluster Grant",
    incomeLimits: "Traditional artisan clusters with 50+ artisan members.",
    applyLink: "https://sfurti.msme.gov.in/",
    summary: "Organizes traditional artisans and industries into clusters to make them competitive and provide long-term sustainability.",
    eligibilityCriteriaText: "Artisan clusters, NGOs, SHGs, Field Organizations with 50+ traditional artisans.",
    eligibilityRules: {
      minAge: 18,
      applicableBusinessTypes: ["artisan"],
      applicableStates: ["all"]
    },
    requiredDocuments: [
      "Cluster Detailed Project Report (DPR)",
      "Nodal Agency / NGO Registration Certificate",
      "Member Artisan List with Aadhaar Numbers"
    ],
    applicationProcess: [
      "Step 1: Form cluster consortium of 50+ artisans.",
      "Step 2: Submit proposal to Nodal Agency (KVIC / Coir Board / NIMSME).",
      "Step 3: Scheme Steering Committee (SSC) approves cluster grant."
    ],
    gapAnalysisRules: (profile) => {
      const gaps = [];
      if (profile.businessType !== "artisan") {
        gaps.push({
          gapTitle: "Cluster Membership Required",
          description: "SFURTI is a cluster-level infrastructure grant for 50+ traditional artisans.",
          resolutionAction: "Join a local artisan cluster or apply individually for PM Vishwakarma.",
          actionLink: "https://sfurti.msme.gov.in/"
        });
      }
      return gaps;
    }
  },
  {
    id: "aspire",
    name: "ASPIRE (Promotion of Innovation, Rural Industry & Entrepreneurship)",
    nameHi: "एस्पायर (ASPIRE ग्रामीण नवाचार योजना)",
    issuingBody: "Ministry of MSME",
    type: "Central",
    sectorTag: "Skills & Employment",
    unverifiedFlag: true,
    benefitAmount: "Financial assistance up to ₹1 Crore for Livelihood Business Incubators (LBI)",
    benefitType: "Incubation & Technology Grant",
    incomeLimits: "Agri-business entrepreneurs, technology business incubators, rural innovators.",
    applyLink: "https://aspire.msme.gov.in/",
    summary: "Sets up network of technology centers and livelihood business incubators to accelerate rural entrepreneurship and agro-industry innovation.",
    eligibilityCriteriaText: "Rural innovators, agro-tech startups, technical institutions, industry associations.",
    eligibilityRules: {
      minAge: 18,
      applicableBusinessTypes: ["manufacturing", "farming", "services"],
      applicableStates: ["all"]
    },
    requiredDocuments: [
      "Innovative Business DPR",
      "Incubator / Entity Registration Proof",
      "Promoter Aadhaar & PAN"
    ],
    applicationProcess: [
      "Step 1: Submit application on ASPIRE online portal.",
      "Step 2: Project evaluation by MSME Steering Committee.",
      "Step 3: Grant sanction for incubator setup and mentoring."
    ],
    gapAnalysisRules: (profile) => {
      const gaps = [];
      return gaps;
    }
  }
];

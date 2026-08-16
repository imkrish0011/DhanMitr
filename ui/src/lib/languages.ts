export type LanguageCode = "hi" | "en";

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "hi", label: "Hindi", nativeLabel: "हिंदी" },
  { code: "en", label: "English", nativeLabel: "English" },
];

export interface RuralTopic {
  id: string;
  iconType: "agriculture" | "gold_loan" | "savings" | "insurance";
  title: Record<LanguageCode, string>;
  subtitle: Record<LanguageCode, string>;
  query: Record<LanguageCode, string>;
  sampleAnswer: Record<LanguageCode, string>;
}

export const RURAL_FINANCIAL_TOPICS: RuralTopic[] = [
  {
    id: "pm_kisan",
    iconType: "agriculture",
    title: {
      hi: "किसान क्रेडिट कार्ड व KCC",
      en: "Kisan Credit Card (KCC)",
    },
    subtitle: {
      hi: "4% रियायती ब्याज दर व योजना नियम",
      en: "4% subsidized interest rate & rules",
    },
    query: {
      hi: "किसान क्रेडिट कार्ड (KCC) पर कितना ब्याज लगता है और ₹3 लाख का लोन कैसे मिलता है?",
      en: "What is the interest rate on Kisan Credit Card (KCC) and how to get ₹3 Lakhs loan?",
    },
    sampleAnswer: {
      hi: "किसान क्रेडिट कार्ड (KCC) पर 7% सामान्य ब्याज होता है। समय पर भुगतान करने पर सरकार 3% की छूट देती है, जिससे शुद्ध ब्याज दर सिर्फ 4% रह जाती है। आप अपने नजदीकी बैंक या CSC केंद्र से आवेदन कर सकते हैं।",
      en: "Kisan Credit Card (KCC) has an effective subsidized interest rate of just 4% upon timely repayment. You can apply at your nearest bank branch or Common Service Center (CSC).",
    },
  },
  {
    id: "gold_loan",
    iconType: "gold_loan",
    title: {
      hi: "गोल्ड लोन vs बैंक लोन",
      en: "Bank Gold Loan vs Moneylender",
    },
    subtitle: {
      hi: "ब्याज दर तुलना व लॉकर सुरक्षा",
      en: "Interest comparison & locker safety",
    },
    query: {
      hi: "साहूकार से कर्ज लेने और बैंक गोल्ड लोन में क्या फर्क है?",
      en: "What is the difference between local moneylender and bank gold loan?",
    },
    sampleAnswer: {
      hi: "साहूकार 24% से 36% तक भारी ब्याज लेते हैं, जबकि सरकारी बैंक में गोल्ड लोन सिर्फ 8.5% से 9.5% पर मिल जाता है और आपका सोना बैंक लॉकर में 100% सुरक्षित रहता है।",
      en: "Local lenders charge 24-36% exorbitant interest, while bank gold loans charge only 8.5-9.5% per year with 100% insurance and safe locker security.",
    },
  },
  {
    id: "savings_rd",
    iconType: "savings",
    title: {
      hi: "मासिक बचत व पोस्ट ऑफिस RD",
      en: "Monthly Savings & Post Office RD",
    },
    subtitle: {
      hi: "₹500 प्रति माह पर 6.7% गारंटीड ब्याज",
      en: "6.7% guaranteed return on ₹500/month",
    },
    query: {
      hi: "हर महीने ₹500 या ₹1,000 जमा करने के लिए पोस्ट ऑफिस या बैंक में सबसे अच्छी योजना कौन सी है?",
      en: "Which is the best post office or bank scheme to save ₹500 or ₹1,000 every month?",
    },
    sampleAnswer: {
      hi: "पोस्ट ऑफिस रेकरिंग डिपॉजिट (RD) में आप ₹500 प्रति माह से शुरू कर सकते हैं, जिस पर 6.7% वार्षिक ब्याज और सरकारी गारंटी मिलती है। 5 साल में आपका पैसा सुरक्षित रूप से बढ़कर मिलेगा।",
      en: "Post Office 5-Year Recurring Deposit (RD) offers 6.7% guaranteed annual interest starting at just ₹500/month with 100% government security.",
    },
  },
  {
    id: "pmsby_bima",
    iconType: "insurance",
    title: {
      hi: "सुरक्षा बीमा योजना (PMSBY)",
      en: "PM Suraksha Bima (PMSBY)",
    },
    subtitle: {
      hi: "₹20 वार्षिक प्रीमियम पर ₹2 लाख बीमा",
      en: "₹2 Lakh coverage at ₹20/year",
    },
    query: {
      hi: "प्रधानमंत्री सुरक्षा बीमा योजना (PMSBY) क्या है और इसमें ₹20 में बीमा कैसे मिलता है?",
      en: "What is PM Suraksha Bima Yojana (PMSBY) and how to get ₹2 Lakh insurance for ₹20/year?",
    },
    sampleAnswer: {
      hi: "PMSBY योजना में साल का केवल ₹20 बैंक खाते से कटता है और दुर्घटना होने पर ₹2,00,000 तक की आर्थिक सहायता परिवार को मिलती है। यह 18 से 70 वर्ष के सभी बैंक खाताधारकों के लिए है।",
      en: "PMSBY offers ₹2,00,000 accidental death/disability coverage for just ₹20 per year deducted automatically from your savings bank account.",
    },
  },
];

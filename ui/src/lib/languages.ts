export type LanguageCode = "hi" | "en" | "hinglish" | "mr" | "bn" | "te";

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "hi", label: "Hindi", nativeLabel: "हिंदी" },
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hinglish", label: "Hinglish", nativeLabel: "Hinglish" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు" },
];

export interface RuralTopic {
  id: string;
  icon: string;
  title: Record<LanguageCode, string>;
  query: Record<LanguageCode, string>;
  sampleAnswer: Record<LanguageCode, string>;
}

export const RURAL_FINANCIAL_TOPICS: RuralTopic[] = [
  {
    id: "pm_kisan",
    icon: "🌾",
    title: {
      hi: "PM-किसान व KCC लोन",
      en: "PM-Kisan & KCC Loan",
      hinglish: "PM-Kisan aur KCC Loan",
      mr: "पीएम-किसान आणि केसीसी कर्ज",
      bn: "পিএম-কিসান ও কেসিসি ঋণ",
      te: "పీఎం-కిసాన్ & కేసీసీ రుణాలు",
    },
    query: {
      hi: "किसान क्रेडिट कार्ड (KCC) पर कितना ब्याज लगता है और ₹3 लाख का लोन कैसे मिलता है?",
      en: "What is the interest rate on Kisan Credit Card (KCC) and how to get ₹3 Lakhs loan?",
      hinglish: "Kisan Credit Card par kitna interest lagta hai aur loan kaise milega?",
      mr: "किसान क्रेडिट कार्डवर किती व्याज दर आहे?",
      bn: "কিসান ক্রেডিট কার্ডে সুদের হার কত?",
      te: "కిసాన్ క్రెడిట్ కార్డుపై వడ్డీ రేటు ఎంత?",
    },
    sampleAnswer: {
      hi: "किसान क्रेडिट कार्ड (KCC) पर 7% सामान्य ब्याज होता है। समय पर भुगतान करने पर सरकार 3% की छूट देती है, जिससे शुद्ध ब्याज दर सिर्फ 4% रह जाती है। आप अपने नजदीकी बैंक या CSC केंद्र से आवेदन कर सकते हैं।",
      en: "Kisan Credit Card (KCC) has an effective subsidized interest rate of just 4% upon timely repayment. You can apply at your nearest bank branch or Common Service Center (CSC).",
      hinglish: "KCC par time par payment karne par effectively sirf 4% annual interest lagta hai. Aap nearest rural bank ya CSC se apply kar sakte hain.",
      mr: "केसीसीवर वेळेवर परतफेड केल्यास फक्त ४% व्याज लागते.",
      bn: "সময়মতো পরিশোধ করলে কেসিসি-তে কার্যকর সুদ মাত্র ৪%।",
      te: "సకాలంలో చెల్లిస్తే కేసీసీపై వడ్డీ కేవలం 4% మాత్రమే.",
    },
  },
  {
    id: "gold_loan",
    icon: "🪙",
    title: {
      hi: "गोल्ड लोन vs बैंक लोन",
      en: "Gold Loan vs Bank Loan",
      hinglish: "Gold Loan vs Bank Loan",
      mr: "गोल्ड लोन वि बँक लोन",
      bn: "গোল্ড লোন বনাম ব্যাঙ্ক লোন",
      te: "గోల్డ్ లోన్ vs బ్యాంక్ లోన్",
    },
    query: {
      hi: "साहूकार से कर्ज लेने और बैंक गोल्ड लोन में क्या फर्क है?",
      en: "What is the difference between local moneylender and bank gold loan?",
      hinglish: "Sahukar se karz lene aur bank gold loan me kya benefit hai?",
      mr: "सावकार आणि बँक सोन्याच्या कर्जात काय फरक आहे?",
      bn: "মহাজন এবং ব্যাঙ্ক গোল্ড লোনের মধ্যে পার্থক্য কী?",
      te: "వడ్డీ వ్యాపారి మరియు బ్యాంక్ గోల్డ్ లోన్ మధ్య తేడా ఏమిటి?",
    },
    sampleAnswer: {
      hi: "साहूकार 24% से 36% तक भारी ब्याज लेते हैं, जबकि सरकारी बैंक में गोल्ड लोन सिर्फ 8.5% से 9.5% पर मिल जाता है और आपका सोना बैंक लॉकर में 100% सुरक्षित रहता है।",
      en: "Local lenders charge 24-36% exorbitant interest, while bank gold loans charge only 8.5-9.5% per year with 100% insurance and safe locker security.",
      hinglish: "Sahukar 24-36% zyada byaj lete hain. Bank me Gold Loan 8.5-9.5% par milta hai aur sona safe rehta hai.",
      mr: "बँकेत सोन्याचे कर्ज फक्त ८.५% ते ९.५% दराने मिळते आणि सुरक्षित राहते.",
      bn: "ব্যাঙ্কে গোল্ড লোন ৮.৫-৯.৫% সুদে পাওয়া যায় এবং সোনা সম্পূর্ণ সুরক্ষিত থাকে।",
      te: "బ్యాంకులో గోల్డ్ లోన్ 8.5-9.5% వడ్డీతో సురక్షితంగా లభిస్తుంది.",
    },
  },
  {
    id: "savings_rd",
    icon: "🏦",
    title: {
      hi: "₹500 मासिक बचत (RD)",
      en: "₹500 Monthly Savings (RD)",
      hinglish: "₹500 Monthly RD / Post Office",
      mr: "₹५०० मासिक बचत",
      bn: "₹৫০০ মাসিক সঞ্চয়",
      te: "₹500 నెలవారీ పొదుపు",
    },
    query: {
      hi: "हर महीने ₹500 या ₹1,000 जमा करने के लिए पोस्ट ऑफिस या बैंक में सबसे अच्छी योजना कौन सी है?",
      en: "Which is the best post office or bank scheme to save ₹500 or ₹1,000 every month?",
      hinglish: "Har mahine ₹500 save karne ke liye best scheme kaun si hai?",
      mr: "दरमहा ₹५०० जमा करण्यासाठी कोणती योजना उत्तम आहे?",
      bn: "প্রতি মাসে ₹৫০০ জমার জন্য সেরা স্কিম কোনটি?",
      te: "నెలకు ₹500 జమ చేయడానికి ఉత్తమ పథకం ఏది?",
    },
    sampleAnswer: {
      hi: "पोस्ट ऑफिस रेकरिंग डिपॉजिट (RD) में आप ₹500 प्रति माह से शुरू कर सकते हैं, जिस पर 6.7% वार्षिक ब्याज और सरकारी गारंटी मिलती है। 5 साल में आपका पैसा सुरक्षित रूप से बढ़कर मिलेगा।",
      en: "Post Office 5-Year Recurring Deposit (RD) offers 6.7% guaranteed annual interest starting at just ₹500/month with 100% government security.",
      hinglish: "Post Office RD me aap ₹500/month se start kar sakte hain. 6.7% guaranteed interest milta hai.",
      mr: "पोस्ट ऑफिस आरडी मध्ये ६.७% हमी व्याज मिळते.",
      bn: "পোস্ট অফিস আরডি-তে ৬.৭% নিশ্চিত সুদ পাওয়া যায়।",
      te: "పోస్ట్ ఆఫీస్ ఆర్డీలో 6.7% ప్రభుత్వ హామీ వడ్డీ లభిస్తుంది.",
    },
  },
  {
    id: "pmsby_bima",
    icon: "🛡️",
    title: {
      hi: "₹20 में 2 लाख का बीमा",
      en: "₹20 / Yr ₹2 Lakh Insurance",
      hinglish: "₹20 me 2 Lakh Bima (PMSBY)",
      mr: "₹२० मध्ये २ लाख विमा",
      bn: "₹২০ টাকায় ২ লক্ষ বীমা",
      te: "₹20 తో 2 లక్షల బీమా",
    },
    query: {
      hi: "प्रधानमंत्री सुरक्षा बीमा योजना (PMSBY) क्या है और इसमें ₹20 में बीमा कैसे मिलता है?",
      en: "What is PM Suraksha Bima Yojana (PMSBY) and how to get ₹2 Lakh insurance for ₹20/year?",
      hinglish: "PMSBY kya hai aur ₹20 me 2 lakh bima kaise le?",
      mr: "प्रधानमंत्री सुरक्षा विमा योजना काय आहे?",
      bn: "প্রধানমন্ত্রী সুরক্ষা বীমা যোজনা কী?",
      te: "ప్రధానమంత్రి సురక్షా బీమా యోజన ఏమిటి?",
    },
    sampleAnswer: {
      hi: "PMSBY योजना में साल का केवल ₹20 बैंक खाते से कटता है और दुर्घटना होने पर ₹2,00,000 तक की आर्थिक सहायता परिवार को मिलती है। यह 18 से 70 वर्ष के सभी बैंक खाताधारकों के लिए है।",
      en: "PMSBY offers ₹2,00,000 accidental death/disability coverage for just ₹20 per year deducted automatically from your savings bank account.",
      hinglish: "PMSBY me saal ka sirf ₹20 lagta hai aur family ko ₹2 Lakh accidental insurance milta hai.",
      mr: "वर्षाला फक्त ₹२० मध्ये ₹२ लाखांचा अपघात विमा मिळतो.",
      bn: "বছরে মাত্র ₹২০ টাকায় পরিবারের জন্য ₹২ লক্ষের দুর্ঘটনা বীমা।",
      te: "సంవత్సరానికి కేవలం ₹20 తో ₹2 లక్షల ప్రమాద బీమా లభిస్తుంది.",
    },
  },
];

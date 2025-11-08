export interface Country {
  code: string;
  name: string;
  nameAr: string;
  currency: string;
  locale: string;
  flag: string;
  primaryColor: string;
  secondaryColor: string;
  phoneCode: string;
}

export const COUNTRIES: Country[] = [
  {
    code: "SA",
    name: "Saudi Arabia",
    nameAr: "المملكة العربية السعودية",
    currency: "SAR",
    locale: "ar-SA",
    flag: "🇸🇦",
    primaryColor: "hsl(210 95% 50%)",
    secondaryColor: "hsl(140 70% 45%)",
    phoneCode: "+966",
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    nameAr: "الإمارات العربية المتحدة",
    currency: "AED",
    locale: "ar-AE",
    flag: "🇦🇪",
    primaryColor: "hsl(0 75% 45%)",
    secondaryColor: "hsl(140 65% 40%)",
    phoneCode: "+971",
  },
  {
    code: "KW",
    name: "Kuwait",
    nameAr: "دولة الكويت",
    currency: "KWD",
    locale: "ar-KW",
    flag: "🇰🇼",
    primaryColor: "hsl(210 85% 50%)",
    secondaryColor: "hsl(140 70% 45%)",
    phoneCode: "+965",
  },
  {
    code: "QA",
    name: "Qatar",
    nameAr: "دولة قطر",
    currency: "QAR",
    locale: "ar-QA",
    flag: "🇶🇦",
    primaryColor: "hsl(350 85% 40%)",
    secondaryColor: "hsl(40 90% 55%)",
    phoneCode: "+974",
  },
  {
    code: "OM",
    name: "Oman",
    nameAr: "سلطنة عمان",
    currency: "OMR",
    locale: "ar-OM",
    flag: "🇴🇲",
    primaryColor: "hsl(0 80% 50%)",
    secondaryColor: "hsl(140 65% 40%)",
    phoneCode: "+968",
  },
  {
    code: "BH",
    name: "Bahrain",
    nameAr: "مملكة البحرين",
    currency: "BHD",
    locale: "ar-BH",
    flag: "🇧🇭",
    primaryColor: "hsl(0 85% 50%)",
    secondaryColor: "hsl(0 0% 95%)",
    phoneCode: "+973",
  },
];

export const getCountryByCode = (code: string): Country | undefined => {
  return COUNTRIES.find((c) => c.code === code);
};

export const formatCurrency = (amount: number, currency: string): string => {
  const currencySymbols: Record<string, string> = {
    SAR: "ر.س",
    AED: "د.إ",
    KWD: "د.ك",
    QAR: "ر.ق",
    OMR: "ر.ع",
    BHD: "د.ب",
  };
  
  return `${amount.toLocaleString("ar")} ${currencySymbols[currency] || currency}`;
};

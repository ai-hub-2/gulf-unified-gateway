export interface Bank {
  id: string;
  name: string;
  nameAr: string;
  logo?: string;
  color?: string;
}

export interface BanksByCountry {
  [countryCode: string]: Bank[];
}

export const BANKS_BY_COUNTRY: BanksByCountry = {
  SA: [
    {
      id: "alrajhi_bank",
      name: "Al Rajhi Bank",
      nameAr: "مصرف الراجحي",
      color: "#006C35",
    },
    {
      id: "alahli_bank",
      name: "Al Ahli Bank",
      nameAr: "البنك الأهلي التجاري",
      color: "#00843D",
    },
    {
      id: "riyad_bank",
      name: "Riyad Bank",
      nameAr: "بنك الرياض",
      color: "#0066B2",
    },
    {
      id: "samba_bank",
      name: "Samba Financial Group",
      nameAr: "مجموعة سامبا المالية",
      color: "#E31E24",
    },
    {
      id: "saudi_investment_bank",
      name: "Saudi Investment Bank",
      nameAr: "البنك السعودي للاستثمار",
      color: "#004B87",
    },
    {
      id: "arab_national_bank",
      name: "Arab National Bank",
      nameAr: "البنك العربي الوطني",
      color: "#00A551",
    },
    {
      id: "saudi_fransi_bank",
      name: "Banque Saudi Fransi",
      nameAr: "البنك السعودي الفرنسي",
      color: "#ED1C24",
    },
    {
      id: "alinma_bank",
      name: "Alinma Bank",
      nameAr: "بنك الإنماء",
      color: "#00A650",
    },
    {
      id: "albilad_bank",
      name: "Bank AlBilad",
      nameAr: "بنك البلاد",
      color: "#1C4587",
    },
    {
      id: "aljazira_bank",
      name: "Bank AlJazira",
      nameAr: "بنك الجزيرة",
      color: "#005EB8",
    },
  ],
  AE: [
    {
      id: "emirates_nbd",
      name: "Emirates NBD",
      nameAr: "بنك الإمارات دبي الوطني",
      color: "#D50032",
    },
    {
      id: "adcb",
      name: "Abu Dhabi Commercial Bank",
      nameAr: "بنك أبوظبي التجاري",
      color: "#004B87",
    },
    {
      id: "fab",
      name: "First Abu Dhabi Bank",
      nameAr: "بنك أبوظبي الأول",
      color: "#000000",
    },
    {
      id: "dib",
      name: "Dubai Islamic Bank",
      nameAr: "بنك دبي الإسلامي",
      color: "#00923F",
    },
    {
      id: "mashreq_bank",
      name: "Mashreq Bank",
      nameAr: "بنك المشرق",
      color: "#E31E24",
    },
    {
      id: "cbd",
      name: "Commercial Bank of Dubai",
      nameAr: "بنك دبي التجاري",
      color: "#004B87",
    },
    {
      id: "rakbank",
      name: "RAKBANK",
      nameAr: "بنك رأس الخيمة الوطني",
      color: "#E31E24",
    },
    {
      id: "ajman_bank",
      name: "Ajman Bank",
      nameAr: "بنك عجمان",
      color: "#00A651",
    },
  ],
  KW: [
    {
      id: "nbk",
      name: "National Bank of Kuwait",
      nameAr: "بنك الكويت الوطني",
      color: "#005EB8",
    },
    {
      id: "gulf_bank",
      name: "Gulf Bank",
      nameAr: "بنك الخليج",
      color: "#004B87",
    },
    {
      id: "cbk",
      name: "Commercial Bank of Kuwait",
      nameAr: "البنك التجاري الكويتي",
      color: "#00A651",
    },
    {
      id: "burgan_bank",
      name: "Burgan Bank",
      nameAr: "بنك برقان",
      color: "#E31E24",
    },
    {
      id: "ahli_united_bank",
      name: "Ahli United Bank",
      nameAr: "الأهلي المتحد",
      color: "#00843D",
    },
    {
      id: "kfh",
      name: "Kuwait Finance House",
      nameAr: "بيت التمويل الكويتي",
      color: "#00923F",
    },
    {
      id: "boubyan_bank",
      name: "Boubyan Bank",
      nameAr: "بنك بوبيان",
      color: "#0066B2",
    },
  ],
  QA: [
    {
      id: "qnb",
      name: "Qatar National Bank",
      nameAr: "بنك قطر الوطني",
      color: "#6E1D3E",
    },
    {
      id: "cbq",
      name: "Commercial Bank of Qatar",
      nameAr: "البنك التجاري القطري",
      color: "#004B87",
    },
    {
      id: "doha_bank",
      name: "Doha Bank",
      nameAr: "بنك الدوحة",
      color: "#E31E24",
    },
    {
      id: "qib",
      name: "Qatar Islamic Bank",
      nameAr: "بنك قطر الإسلامي",
      color: "#00923F",
    },
    {
      id: "masraf_alrayan",
      name: "Masraf Al Rayan",
      nameAr: "مصرف الريان",
      color: "#00A651",
    },
    {
      id: "ahlibank",
      name: "Ahlibank",
      nameAr: "الأهلي بنك",
      color: "#00843D",
    },
  ],
  OM: [
    {
      id: "bank_muscat",
      name: "Bank Muscat",
      nameAr: "بنك مسقط",
      color: "#004B87",
    },
    {
      id: "national_bank_oman",
      name: "National Bank of Oman",
      nameAr: "البنك الوطني العماني",
      color: "#00A651",
    },
    {
      id: "bank_dhofar",
      name: "Bank Dhofar",
      nameAr: "بنك ظفار",
      color: "#E31E24",
    },
    {
      id: "ahli_bank_oman",
      name: "Ahli Bank",
      nameAr: "البنك الأهلي",
      color: "#00843D",
    },
    {
      id: "nizwa_bank",
      name: "Bank Nizwa",
      nameAr: "بنك نزوى",
      color: "#00923F",
    },
    {
      id: "sohar_international",
      name: "Sohar International Bank",
      nameAr: "بنك صحار الدولي",
      color: "#0066B2",
    },
  ],
  BH: [
    {
      id: "nbb",
      name: "National Bank of Bahrain",
      nameAr: "بنك البحرين الوطني",
      color: "#E31E24",
    },
    {
      id: "bbk",
      name: "Bank of Bahrain and Kuwait",
      nameAr: "بنك البحرين والكويت",
      color: "#004B87",
    },
    {
      id: "ahli_united_bahrain",
      name: "Ahli United Bank",
      nameAr: "الأهلي المتحد",
      color: "#00843D",
    },
    {
      id: "bisb",
      name: "Bahrain Islamic Bank",
      nameAr: "بنك البحرين الإسلامي",
      color: "#00923F",
    },
    {
      id: "ithmaar_bank",
      name: "Ithmaar Bank",
      nameAr: "بنك إثمار",
      color: "#00A651",
    },
    {
      id: "khaleeji_bank",
      name: "Khaleeji Commercial Bank",
      nameAr: "بنك الخليج التجاري",
      color: "#0066B2",
    },
  ],
};

export const getBanksByCountry = (countryCode: string): Bank[] => {
  return BANKS_BY_COUNTRY[countryCode] || [];
};

export const getBankById = (bankId: string): Bank | undefined => {
  for (const banks of Object.values(BANKS_BY_COUNTRY)) {
    const bank = banks.find((b) => b.id === bankId);
    if (bank) return bank;
  }
  return undefined;
};

// API simulation function (can be replaced with actual API call)
export const fetchBanksByCountry = async (countryCode: string): Promise<Bank[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return getBanksByCountry(countryCode);
};

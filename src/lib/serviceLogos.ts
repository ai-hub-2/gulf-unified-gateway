// Service logos and branding - All GCC shipping carriers
export const serviceLogos: Record<string, { logo: string; colors: { primary: string; secondary: string }; ogImage?: string; heroImage?: string; description?: string }> = {
  // UAE - الإمارات
  aramex: {
    logo: "https://www.aramex.com/sites/default/files/aramex-logo.svg",
    colors: {
      primary: "#ED1C24",
      secondary: "#000000"
    },
    ogImage: "/og-aramex.jpg",
    heroImage: "/og-aramex.jpg",
    description: "شركة رائدة في خدمات الشحن السريع والحلول اللوجستية في المنطقة"
  },
  dhl: {
    logo: "https://www.dhl.com/content/dam/dhl/global/core/images/logos/dhl-logo.svg",
    colors: {
      primary: "#FFCC00",
      secondary: "#D40511"
    },
    ogImage: "/og-dhl.jpg",
    heroImage: "/og-dhl.jpg",
    description: "شبكة شحن عالمية توفر خدمات التوصيل السريع الدولي والمحلي"
  },
  fedex: {
    logo: "https://www.fedex.com/content/dam/fedex-com/logos/logo.png",
    colors: {
      primary: "#4D148C",
      secondary: "#FF6600"
    },
    ogImage: "/og-fedex.jpg",
    heroImage: "/og-fedex.jpg",
    description: "خدمات شحن دولية موثوقة مع تتبع فوري للشحنات"
  },
  ups: {
    logo: "https://www.ups.com/assets/resources/webcontent/images/ups-logo.svg",
    colors: {
      primary: "#351C15",
      secondary: "#FFB500"
    },
    ogImage: "/og-ups.jpg",
    heroImage: "/og-ups.jpg",
    description: "حلول لوجستية متكاملة وخدمات شحن سريعة حول العالم"
  },
  empost: {
    logo: "https://www.emiratespost.ae/images/logo.png",
    colors: {
      primary: "#C8102E",
      secondary: "#003087"
    },
    ogImage: "/og-empost.jpg",
    heroImage: "/og-empost.jpg",
    description: "المشغل الوطني للبريد في دولة الإمارات العربية المتحدة"
  },
  
  // Saudi Arabia - السعودية
  smsa: {
    logo: "https://www.smsaexpress.com/images/logo.png",
    colors: {
      primary: "#0066CC",
      secondary: "#FF6600"
    },
    ogImage: "/og-smsa.jpg",
    heroImage: "/og-smsa.jpg",
    description: "أكبر شركة شحن سعودية متخصصة في التوصيل السريع والخدمات اللوجستية"
  },
  zajil: {
    logo: "https://zajil.com/assets/images/logo.png",
    colors: {
      primary: "#1C4587",
      secondary: "#FF9900"
    },
    ogImage: "/og-zajil.jpg",
    heroImage: "/og-zajil.jpg",
    description: "شركة سعودية رائدة في خدمات البريد السريع والشحن"
  },
  naqel: {
    logo: "https://www.naqelexpress.com/images/logo.png",
    colors: {
      primary: "#0052A3",
      secondary: "#FF6B00"
    },
    ogImage: "/og-naqel.jpg",
    heroImage: "/og-naqel.jpg",
    description: "حلول شحن متطورة وخدمات لوجستية متكاملة داخل المملكة"
  },
  saudipost: {
    logo: "https://sp.com.sa/assets/images/logo.png",
    colors: {
      primary: "#006C35",
      secondary: "#FFB81C"
    },
    ogImage: "/og-saudipost.jpg",
    heroImage: "/og-saudipost.jpg",
    description: "المشغل الوطني للبريد في المملكة العربية السعودية"
  },
  
  // Kuwait - الكويت
  kwpost: {
    logo: "https://www.kwpost.com.kw/images/logo.png",
    colors: {
      primary: "#007A33",
      secondary: "#DA291C"
    },
    ogImage: "/og-kwpost.jpg",
    heroImage: "/og-kwpost.jpg",
    description: "المشغل الوطني للبريد في دولة الكويت"
  },
  dhlkw: {
    logo: "https://www.dhl.com/content/dam/dhl/global/core/images/logos/dhl-logo.svg",
    colors: {
      primary: "#FFCC00",
      secondary: "#D40511"
    },
    ogImage: "/og-dhl.jpg",
    heroImage: "/og-dhl.jpg",
    description: "شبكة شحن عالمية توفر خدمات التوصيل السريع الدولي والمحلي"
  },
  
  // Qatar - قطر
  qpost: {
    logo: "https://www.qpost.qa/assets/images/logo.png",
    colors: {
      primary: "#8E1838",
      secondary: "#FFFFFF"
    },
    ogImage: "/og-qpost.jpg",
    heroImage: "/og-qpost.jpg",
    description: "المشغل الوطني للبريد في دولة قطر"
  },
  dhlqa: {
    logo: "https://www.dhl.com/content/dam/dhl/global/core/images/logos/dhl-logo.svg",
    colors: {
      primary: "#FFCC00",
      secondary: "#D40511"
    },
    ogImage: "/og-dhl.jpg",
    heroImage: "/og-dhl.jpg",
    description: "شبكة شحن عالمية توفر خدمات التوصيل السريع الدولي والمحلي"
  },
  
  // Oman - عمان
  omanpost: {
    logo: "https://www.omanpost.om/images/logo.png",
    colors: {
      primary: "#ED1C24",
      secondary: "#009639"
    },
    ogImage: "/og-omanpost.jpg",
    heroImage: "/og-omanpost.jpg",
    description: "المشغل الوطني للبريد في سلطنة عُمان"
  },
  dhlom: {
    logo: "https://www.dhl.com/content/dam/dhl/global/core/images/logos/dhl-logo.svg",
    colors: {
      primary: "#FFCC00",
      secondary: "#D40511"
    },
    ogImage: "/og-dhl.jpg",
    heroImage: "/og-dhl.jpg",
    description: "شبكة شحن عالمية توفر خدمات التوصيل السريع الدولي والمحلي"
  },
  
  // Bahrain - البحرين
  bahpost: {
    logo: "https://www.bahrainpost.gov.bh/images/logo.png",
    colors: {
      primary: "#CE1126",
      secondary: "#FFFFFF"
    },
    ogImage: "/og-bahpost.jpg",
    heroImage: "/og-bahpost.jpg",
    description: "المشغل الوطني للبريد في مملكة البحرين"
  },
  dhlbh: {
    logo: "https://www.dhl.com/content/dam/dhl/global/core/images/logos/dhl-logo.svg",
    colors: {
      primary: "#FFCC00",
      secondary: "#D40511"
    },
    ogImage: "/og-dhl.jpg",
    heroImage: "/og-dhl.jpg",
    description: "شبكة شحن عالمية توفر خدمات التوصيل السريع الدولي والمحلي"
  }
};

const stripNonAlphanumeric = (value: string) => value.replace(/[^a-z0-9]/gi, "");

const knownServiceKeys = Object.keys(serviceLogos);

const matchCondensedKey = (value: string) => {
  const condensedValue = stripNonAlphanumeric(value);

  return knownServiceKeys.find((key) => {
    const normalizedKey = key.toLowerCase();
    const condensedKey = stripNonAlphanumeric(normalizedKey);
    return condensedValue === condensedKey || condensedValue.includes(condensedKey);
  });
};

export const normalizeServiceKey = (rawKey?: string | null, fallbackName?: string | null) => {
  if (rawKey) {
    const normalizedKey = rawKey.trim().toLowerCase();

    if (knownServiceKeys.includes(normalizedKey)) {
      return normalizedKey;
    }

    const matchedKey = matchCondensedKey(normalizedKey);
    if (matchedKey) {
      return matchedKey;
    }
  }

  if (fallbackName) {
    const normalizedName = fallbackName.trim().toLowerCase();
    const matchedKey = matchCondensedKey(normalizedName);
    if (matchedKey) {
      return matchedKey;
    }

    const englishSegment = fallbackName.split("-").pop()?.trim().toLowerCase();
    if (englishSegment) {
      const matchedKeyFromSegment = matchCondensedKey(englishSegment);
      if (matchedKeyFromSegment) {
        return matchedKeyFromSegment;
      }
    }
  }

  return "aramex";
};

export const getServiceBranding = (serviceIdentifier: string) => {
  const normalizedKey = normalizeServiceKey(serviceIdentifier);

  return serviceLogos[normalizedKey] || {
    logo: "",
    colors: {
      primary: "#0EA5E9",
      secondary: "#06B6D4"
    },
    ogImage: "/og-aramex.jpg",
    heroImage: "/og-aramex.jpg",
    description: "خدمة شحن موثوقة"
  };
};

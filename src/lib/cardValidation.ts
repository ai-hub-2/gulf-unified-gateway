/**
 * Luhn Algorithm for card validation
 * @param cardNumber - Card number string (can include spaces)
 * @returns boolean - true if valid, false otherwise
 */
export const validateLuhn = (cardNumber: string): boolean => {
  // Remove spaces and non-numeric characters
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  // Loop through values starting from the rightmost digit
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

/**
 * Format card number with spaces
 * @param value - Input value
 * @returns Formatted card number (#### #### #### ####)
 */
export const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, '');
  const matches = cleaned.match(/.{1,4}/g);
  return matches ? matches.join(' ') : cleaned;
};

/**
 * Detect card type based on BIN (first 6 digits)
 * @param cardNumber - Card number
 * @returns Card type (visa, mastercard, amex, etc.)
 */
export const detectCardType = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  if (/^6(?:011|5)/.test(cleaned)) return 'discover';
  if (/^35/.test(cleaned)) return 'jcb';
  if (/^30[0-5]/.test(cleaned)) return 'diners';
  
  return 'unknown';
};

/**
 * Validate expiry date
 * @param month - Month (1-12)
 * @param year - Year (YY format or full YYYY)
 * @returns boolean - true if valid and not expired
 */
export const validateExpiry = (month: string | number, year: string | number): boolean => {
  const monthNum = typeof month === 'string' ? parseInt(month, 10) : month;
  const yearNum = typeof year === 'string' ? parseInt(year, 10) : year;
  
  if (monthNum < 1 || monthNum > 12) {
    return false;
  }
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
  const currentMonth = currentDate.getMonth() + 1;
  
  // Handle 2-digit year
  const cardYear = yearNum < 100 ? yearNum : yearNum % 100;
  
  if (cardYear < currentYear) {
    return false;
  }
  
  if (cardYear === currentYear && monthNum < currentMonth) {
    return false;
  }
  
  return true;
};

/**
 * Validate CVV
 * @param cvv - CVV value
 * @param cardType - Card type (amex requires 4 digits, others 3)
 * @returns boolean - true if valid
 */
export const validateCVV = (cvv: string, cardType: string = 'unknown'): boolean => {
  const cleaned = cvv.replace(/\D/g, '');
  
  if (cardType === 'amex') {
    return cleaned.length === 4;
  }
  
  return cleaned.length === 3;
};

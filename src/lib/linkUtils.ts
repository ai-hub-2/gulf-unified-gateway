/**
 * Utility functions for generating unique link IDs based on input data
 */

/**
 * Creates a deterministic hash from input data
 * This ensures the same input data produces the same hash
 */
export function createDataHash(data: any): string {
  // Normalize the data by sorting keys and removing undefined/null values
  const normalized = JSON.stringify(data, Object.keys(data).sort());
  
  // Simple hash function (for production, consider using crypto.subtle)
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to positive hex string and take first 16 characters
  return Math.abs(hash).toString(16).padStart(16, '0').substring(0, 16);
}

/**
 * Converts a hex string to UUID v4 format
 */
function hexToUUID(hex: string): string {
  // Ensure we have at least 32 hex characters, pad with random if needed
  let paddedHex = hex.replace(/[^0-9a-f]/gi, '').toLowerCase();
  
  // If not enough characters, pad with random hex
  while (paddedHex.length < 32) {
    paddedHex += Math.random().toString(16).substring(2);
  }
  paddedHex = paddedHex.substring(0, 32);
  
  // Format as UUID: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // UUID v4 format requires: version 4 and variant bits
  const part1 = paddedHex.substring(0, 8);
  const part2 = paddedHex.substring(8, 12);
  // Version 4: first character of third part must be 4
  const part3 = '4' + paddedHex.substring(13, 16);
  // Variant: first character of fourth part must be 8, 9, a, or b
  const variantDigit = ((parseInt(paddedHex[16] || '0', 16) & 0x3) | 0x8).toString(16);
  const part4 = variantDigit + paddedHex.substring(17, 20);
  const part5 = paddedHex.substring(20, 32);
  
  return `${part1}-${part2}-${part3}-${part4}-${part5}`;
}

/**
 * Creates a unique link ID based on the payload data
 * Returns a valid UUID format to match database schema
 */
export function generateUniqueLinkId(payload: any, type: string, countryCode: string): string {
  try {
    // Create hash from payload data
    const dataHash = createDataHash({
      ...payload,
      type,
      countryCode,
      // Remove timestamp for deterministic hashing (same data = same link)
    });
    
    // Create additional hash from timestamp for uniqueness
    const timeHash = createDataHash({
      timestamp: Math.floor(Date.now() / 1000), // Second-level granularity
    });
    
    // Combine hashes to create a longer hex string
    const combinedHash = (dataHash + timeHash + Math.random().toString(16).substring(2)).substring(0, 32);
    
    // Convert to UUID format
    const uuid = hexToUUID(combinedHash);
    
    // Validate UUID format (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(uuid)) {
      return uuid;
    }
    
    // Fallback to crypto.randomUUID() if format is invalid
    return crypto.randomUUID();
  } catch (error) {
    console.error('Error generating link ID:', error);
    // Fallback to UUID if hash generation fails
    return crypto.randomUUID();
  }
}

/**
 * Validates and normalizes payload data for consistent hashing
 */
export function normalizePayload(payload: any): any {
  if (!payload || typeof payload !== 'object') {
    return payload || {};
  }
  
  const normalized: any = {};
  
  // Sort keys and normalize values
  Object.keys(payload).sort().forEach(key => {
    const value = payload[key];
    if (value !== null && value !== undefined) {
      // Normalize numbers and strings
      if (typeof value === 'number') {
        normalized[key] = parseFloat(value.toFixed(2));
      } else if (typeof value === 'string') {
        normalized[key] = value.trim();
      } else if (Array.isArray(value)) {
        normalized[key] = value;
      } else if (typeof value === 'object') {
        normalized[key] = value;
      } else {
        normalized[key] = value;
      }
    }
  });
  
  return normalized;
}

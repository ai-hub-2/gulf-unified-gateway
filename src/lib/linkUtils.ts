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
 * Creates a unique link ID based on the payload data
 * Combines a timestamp hash with data hash for uniqueness
 */
export function generateUniqueLinkId(payload: any, type: string, countryCode: string): string {
  try {
    // Create hash from payload data
    const dataHash = createDataHash({
      ...payload,
      type,
      countryCode,
      timestamp: Math.floor(Date.now() / (1000 * 60 * 60)), // Hour-level granularity
    });
    
    // Create a short unique identifier
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    
    // Combine all parts for a unique but deterministic ID
    const linkId = `${timestamp}-${dataHash}-${random}`.substring(0, 50);
    
    // Ensure linkId is valid (fallback to UUID if needed)
    if (!linkId || linkId.length < 10) {
      return crypto.randomUUID();
    }
    
    return linkId;
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

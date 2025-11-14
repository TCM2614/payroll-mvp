/**
 * Utility functions for hashing sensitive data before storage
 * Uses SHA-256 for one-way hashing (cannot be reversed)
 * Works in both Node.js and Edge runtime (Web Crypto API)
 */

/**
 * Hash an email address using SHA-256
 * This creates a one-way hash that cannot be reversed
 * Useful for storing emails in a privacy-compliant way
 * Works in Edge runtime using Web Crypto API
 */
export async function hashEmail(email: string): Promise<string> {
  // Normalize email: lowercase and trim
  const normalized = email.toLowerCase().trim();
  
  // Use Web Crypto API for Edge compatibility
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  
  return hashHex;
}

/**
 * Hash any string value (for feedback, feature requests, etc.)
 * Works in Edge runtime using Web Crypto API
 */
export async function hashValue(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

/**
 * Create a composite hash from multiple values
 * Useful for creating unique identifiers from form data
 * Works in Edge runtime using Web Crypto API
 */
export async function hashComposite(...values: (string | number | null | undefined)[]): Promise<string> {
  const combined = values
    .filter((v) => v != null)
    .map((v) => String(v))
    .join("|");
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}


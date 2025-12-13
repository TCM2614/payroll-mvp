export const COOKIE_CONSENT_STORAGE_KEY = "ukpayroll_cookie_consent";

export function hasAcceptedCookieConsent(): boolean {
  try {
    return window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) === "accepted";
  } catch {
    // If storage is unavailable, fail open so the UI doesn't break.
    return true;
  }
}


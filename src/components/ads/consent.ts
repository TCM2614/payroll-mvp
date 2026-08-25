export const COOKIE_CONSENT_STORAGE_KEY = "ukpayroll_cookie_consent";

/**
 * Returns true only when the user has explicitly accepted optional
 * advertising/marketing scripts.
 *
 * Fail-closed: if localStorage is unavailable or throws, treat consent
 * as NOT accepted so AdSense (and similar optional scripts) do not load.
 * Essential app functionality must not depend on this returning true.
 */
export function hasAcceptedCookieConsent(): boolean {
  try {
    return window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) === "accepted";
  } catch {
    return false;
  }
}

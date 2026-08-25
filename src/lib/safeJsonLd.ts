/**
 * Serialize JSON for embedding inside a `<script type="application/ld+json">`
 * tag via `dangerouslySetInnerHTML`.
 *
 * `JSON.stringify` alone is not HTML-safe: a string containing `</script>`
 * (or `<!--`) can break out of the script element. Replacing `<` with the
 * Unicode escape `\u003c` keeps the JSON semantically identical while
 * preventing HTML parser breakout. Also escapes U+2028/U+2029 which are
 * valid in JSON but can terminate JS statements in older browsers.
 */
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

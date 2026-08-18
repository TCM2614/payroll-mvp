/**
 * Server component that injects a JSON‑LD script safely.
 *
 * We serialise with `JSON.stringify` and then escape the closing script tag
 * to prevent XSS via schema payloads.
 */
export function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

export function SchemaMarkup() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I calculate my UK take-home pay?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use our UK payroll calculator to compare PAYE, Umbrella, and Limited company take-home pay. Enter your gross income, tax code, student loans, and pension contributions to get an accurate calculation.",
        },
      },
      {
        "@type": "Question",
        name: "What is the difference between PAYE, Umbrella, and Limited company?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "PAYE is standard employment with tax deducted at source. Umbrella companies act as your employer for contracting work. Limited companies offer the most tax efficiency but require more administration.",
        },
      },
    ],
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "UK Payroll Take-Home Calculator",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "100",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />
    </>
  );
}


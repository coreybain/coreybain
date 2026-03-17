type StructuredDataProps = {
  data: Record<string, unknown>;
};

function sanitizeJsonLd(value: string) {
  return value.replaceAll("</script", "<\\/script");
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: sanitizeJsonLd(JSON.stringify(data)),
      }}
    />
  );
}

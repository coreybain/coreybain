export const CONTACT_MESSAGE_MIN = 20;

const URL_SCHEME_PATTERN = /^[a-z][a-z\d+\-.]*:\/\//i;

export function normalizeContactWebsite(value: string | null | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  if (URL_SCHEME_PATTERN.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

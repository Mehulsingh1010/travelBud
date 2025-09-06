// lib/countryCodes.ts
// Source: country-telephone-data (npm). We map it to the shape used by the app.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ctd = require("country-telephone-data");

/**
 * Convert an ISO alpha-2 code (e.g. "IN" or "in") to a flag emoji like 🇮🇳
 * If iso2 is missing, returns undefined.
 */
function iso2ToEmoji(iso2?: string): string | undefined {
  if (!iso2) return undefined;
  const code = iso2.toUpperCase();
  if (code.length !== 2) return undefined;
  const A = 0x1f1e6;
  const letters = [...code].map((ch) => A + ch.charCodeAt(0) - 65);
  return String.fromCodePoint(...letters);
}

export type CountryCodeItem = {
  code: string; // dial code like "+91"
  label: string; // display name like "India"
  iso2?: string; // 2-letter ISO code (uppercase)
  emoji?: string; // flag emoji if available
};

// Build list, dedupe by iso2, normalize dial code, sort by label
const raw = (ctd?.allCountries ?? []) as any[];

const seenIso = new Set<string>();
export const countryCodes: CountryCodeItem[] = raw
  .map((c: any) => {
    const iso2 = (c.iso2 || "").toString().toUpperCase() || undefined;
    const dial = c.dialCode ? `+${String(c.dialCode)}` : "";
    return {
      code: dial,
      label: c.name || c.country || "",
      iso2,
      emoji: iso2 ? iso2ToEmoji(iso2) : undefined,
    } as CountryCodeItem;
  })
  .filter((c) => {
    // remove entries without iso or dial or label
    if (!c.iso2 || !c.code || !c.label) return false;
    if (seenIso.has(c.iso2)) return false;
    seenIso.add(c.iso2);
    return true;
  })
  .sort((a, b) => a.label.localeCompare(b.label));
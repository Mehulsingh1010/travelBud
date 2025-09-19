// lib/countryUtils.ts
import type { CountryCodeItem } from "./countryCodes";

/**
 * Return a sensible ISO2 value (e.g. "IN", "US") for a given dial code like "+91".
 * - countryCodes: list from lib/countryCodes
 * - preferredIso: optional ISO to prefer if available (e.g. user's country)
 */
export function defaultIsoForDialCode(
  code: string | undefined,
  countryCodes: CountryCodeItem[],
  preferredIso?: string
): string | undefined {
  if (!code) return undefined;
  const dial = code.startsWith("+") ? code : `+${code}`;

  // prefer explicit preferredIso if provided
  if (preferredIso) {
    const found = countryCodes.find((c) => c.code === dial && (c.iso2 ?? "").toUpperCase() === preferredIso.toUpperCase());
    if (found) return (found.iso2 ?? "").toUpperCase();
  }

  // deterministic preferences for ambiguous codes (extend as needed)
  const PREFERRED_BY_DIAL: Record<string, string[]> = {
    "+1": ["US", "CA"], // prefer US, then Canada for +1
    "+44": ["GB"],      // prefer United Kingdom for +44
    "+61": ["AU"],      // Australia for +61
  };

  const prefs = PREFERRED_BY_DIAL[dial] ?? [];
  for (const iso of prefs) {
    const f = countryCodes.find((c) => c.code === dial && (c.iso2 ?? "").toUpperCase() === iso);
    if (f) return (f.iso2 ?? "").toUpperCase();
  }

  // fallback: first match found
  const first = countryCodes.find((c) => c.code === dial);
  return first?.iso2?.toUpperCase();
}

/**
 * Given a dial code and/or iso2, return display info: emoji, iso, label
 */
export function displayInfoForDial(
  code: string | undefined,
  iso2: string | undefined,
  countryCodes: CountryCodeItem[]
): { emoji: string; iso: string; label: string } {
  if (!code && !iso2) return { emoji: "", iso: "", label: "" };

  // prefer iso2 match if provided
  if (iso2) {
    const f = countryCodes.find((c) => (c.iso2 ?? "").toUpperCase() === iso2.toUpperCase());
    if (f) return { emoji: f.emoji ?? "", iso: (f.iso2 ?? "").toUpperCase(), label: f.label ?? "" };
  }

  // otherwise find by dial code
  const f2 = countryCodes.find((c) => c.code === code);
  if (f2) return { emoji: f2.emoji ?? "", iso: (f2.iso2 ?? "").toUpperCase(), label: f2.label ?? "" };

  return { emoji: "", iso: "", label: "" };
}
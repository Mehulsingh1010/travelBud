// lib/expenses/formatCurrency.ts
export function formatCurrency(amountInSmallestUnit: number, currency: string, locale?: string) {
  // default locale fallback based on currency: INR -> en-IN, USD -> en-US, else 'en-US'
  const defaultLocale =
    locale ||
    (currency === "INR" ? "en-IN" : currency === "USD" ? "en-US" : "en-IN")

  // Most currencies have two decimals; Intl handles currencies like JPY correctly (no decimals).
  return new Intl.NumberFormat(defaultLocale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    // Intl will ignore minimumFractionDigits for currencies like JPY where fraction digits = 0
  }).format(amountInSmallestUnit / 100)
}
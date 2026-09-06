import { CurrencyRate } from '../types';

export const SUPPORTED_CURRENCIES: CurrencyRate[] = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rateAgainstINR: 1.0, flag: '🇮🇳' },
  { code: 'USD', name: 'US Dollar', symbol: '$', rateAgainstINR: 83.5, flag: '🇺🇸' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED', rateAgainstINR: 22.7, flag: '🇦🇪' },
  { code: 'EUR', name: 'Euro', symbol: '€', rateAgainstINR: 90.2, flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', rateAgainstINR: 105.8, flag: '🇬🇧' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rateAgainstINR: 62.1, flag: '🇸🇬' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', rateAgainstINR: 2.35, flag: '🇹🇭' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rateAgainstINR: 0.55, flag: '🇯🇵' },
];

/**
 * Converts an amount from one currency to another using INR as reference pivot.
 */
export function convertCurrency(
  amount: number,
  fromCode: string = 'INR',
  toCode: string = 'INR'
): number {
  if (fromCode === toCode || amount === 0) return amount;

  const fromRate = SUPPORTED_CURRENCIES.find((c) => c.code === fromCode)?.rateAgainstINR || 1.0;
  const toRate = SUPPORTED_CURRENCIES.find((c) => c.code === toCode)?.rateAgainstINR || 1.0;

  // Convert to INR first, then to target currency
  const inINR = amount * fromRate;
  const inTarget = inINR / toRate;

  return Math.round(inTarget * 100) / 100;
}

/**
 * Normalizes an expense amount into base currency (usually INR).
 */
export function normalizeToBaseCurrency(
  amount: number,
  currency: string = 'INR',
  baseCurrency: string = 'INR'
): number {
  return convertCurrency(amount, currency, baseCurrency);
}

/**
 * Format currency amount with symbol
 */
export function formatCurrencyAmount(
  amount: number,
  currencyCode: string = 'INR'
): string {
  const curr = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
  const symbol = curr ? curr.symbol : '₹';

  if (currencyCode === 'INR') {
    return `${symbol}${Math.round(amount).toLocaleString('en-IN')}`;
  }

  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

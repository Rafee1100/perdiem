import type { Item, Money } from "./types";

export function formatMoney(money: Money, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currency,
  }).format(money.amount / 100);
}

export function displayPriceLabel(item: Item): string {
  const priced = item.variations.map((v) => v.price).filter((m): m is Money => m !== null);
  if (priced.length === 0) return "Price varies";

  const cheapest = priced.reduce((min, m) => (m.amount < min.amount ? m : min));
  const allSamePrice = priced.every((m) => m.amount === cheapest.amount);

  return allSamePrice ? formatMoney(cheapest) : `From ${formatMoney(cheapest)}`;
}

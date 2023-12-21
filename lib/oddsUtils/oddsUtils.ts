export const formatDisplayOdds = (odds: number) => (odds > 0 ? `+${odds}` : odds);

export function americanToDecimalOdds(americanOdds: number): number {
  const unrounded = americanOdds > 0 ? americanOdds / 100 + 1 : 100 / Math.abs(americanOdds) + 1;
  return parseFloat(unrounded.toFixed(2));
}

export function calculateParlayPayout(betAmount: number, odds: number[]): number {
  const parlayPayout: number = odds.map(americanToDecimalOdds).reduce((a, c) => a * c, betAmount);
  return parseFloat(parlayPayout.toFixed(2));
}

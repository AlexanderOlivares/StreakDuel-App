interface OddsTypeLookup {
  [key: string]: string;
  "money-line": string;
  totals: string;
  pointspread: string;
}

export const ODDS_TYPE_LOOKUP: OddsTypeLookup = {
  "money-line": "Moneyline",
  totals: "Totals",
  pointspread: "Point Spread",
};

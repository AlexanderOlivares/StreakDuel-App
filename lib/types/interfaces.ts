export interface Parlay {
  id: string;
  userId: string;
  locked: boolean;
  createdAt: Date;
  pointsAwarded: number;
  pointsWagered: number;
}

export interface ParlayWithPicks extends Parlay {
  picks: BaseDbPick[];
}

export interface ParlayWithPicksAndOdds extends Parlay {
  picks: DbPickWithOdds[];
}

export interface IPick {
  pickId?: string; // default uuid assigned on pick insertion by prisma
  matchupId: string;
  oddsId: string;
  pick: string;
  pickOdds: number;
  badge: string;
  oddsType: string;
  useLatestOdds: boolean;
  result: string;
}

export interface PickHistory {
  // pickId: string;
  matchupId: string;
  pick: string;
  result: string;
}

export interface BaseDbPick {
  id: string;
  userId: string;
  parlayId: string;
  oddsId: string;
  matchupId: string;
  locked: boolean;
  useLatestOdds: boolean;
  pick: string;
  result: string;
  createdAt: Date;
  userUpdatedAt?: Date | null;
  matchup?: Matchup;
}

export interface DbPickWithOdds extends BaseDbPick {
  odds: Odds;
}

export type OddsType = "money-line" | "totals" | "pointspread";

// OddsScope not in use now. Keeping for future for non-full-game props
export type OddsScope =
  | "full-game"
  | "1st-half"
  | "2nd-half"
  | "1st-quarter"
  | "2nd-quarter"
  | "3rd-quarter"
  | "4th-quarter";

export interface BaseMatchup {
  id: string;
  strHomeTeam: string;
  strAwayTeam: string;
  oddsType: string;
  awayBadgeId: string;
  homeBadgeId: string;
}
export interface Matchup extends BaseMatchup {
  idEvent: string;
  idHomeTeam: string;
  idAwayTeam: string;
  idLeague: string;
  strLeague: string;
  strEvent: string;
  strTimestamp: string;
  strThumb: string;
  drawEligible: boolean;
  oddsScope: string;
  drawTeam?: string | null;
  adminSelected: boolean;
  used: boolean;
  awayScore: number | null;
  homeScore: number | null;
  pointsTotal: number | null;
  status: string;
  locked: boolean;
  adminUnlocked: boolean;
  adminCorrected: boolean;
}

export interface Odds {
  [key: string]: number | null | undefined | string | Date;
  id: string;
  matchupId: string;
  oddsGameId: number;
  sportsbook: string;
  homeOdds?: number | null;
  awayOdds?: number | null;
  drawOdds?: number | null;
  overOdds?: number | null;
  underOdds?: number | null;
  homeSpread?: number | null;
  awaySpread?: number | null;
  total?: number | null;
  createdAt?: Date;
}

export interface MatchupWithOdds extends Matchup {
  odds: Odds[];
}

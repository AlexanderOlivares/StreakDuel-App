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

export interface Matchup {
  id: string;
  idEvent: string;
  idHomeTeam: string;
  idAwayTeam: string;
  idLeague: string;
  strLeague: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  strTimestamp: string;
  strThumb: string;
  awayBadgeId: string;
  homeBadgeId: string;
  drawEligible: boolean;
  oddsType: string;
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

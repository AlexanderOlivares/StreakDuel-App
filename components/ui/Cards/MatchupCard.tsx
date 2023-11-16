"use client";

import React, { useState } from "react";
import { humanReadableDate } from "@/lib/dateTime.ts/dateFormatter";
import Image from "next/image";
import { ODDS_TYPE_LOOKUP } from "@/lib/textFormatting.ts/constants";
import ConfirmPickModal from "../modals/ConfirmPickModal";
import { useParlayContext } from "@/app/context/ParlayProvider";

export type OddsType = "money-line" | "totals" | "pointspread";
export type OddsScope =
  | "full-game"
  | "1st-half"
  | "2nd-half"
  | "1st-quarter"
  | "2nd-quarter"
  | "3rd-quarter"
  | "4th-quarter";

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
  Odds: Odds[];
}

export default function MatchupCard(props: MatchupWithOdds) {
  const {
    strLeague,
    // strEvent,
    // strThumb,
    awayBadgeId,
    homeBadgeId,
    strTimestamp,
    strHomeTeam,
    strAwayTeam,
    // drawEligible,
    id,
    // idHomeTeam,
    // idAwayTeam,
    // drawTeam,
    oddsType,
    status,
    // locked,
    Odds,
  } = props;
  const {
    awayOdds,
    homeOdds,
    overOdds,
    underOdds,
    total,
    awaySpread,
    homeSpread,
    id: oddsId,
  } = Odds[0];
  const parlayContext = useParlayContext();
  const { activePicks } = parlayContext.state;
  const [confirmPickModalOpen, setConfirmPickModalOpen] = useState<boolean>(false);
  const [pick, setPick] = useState<any>(""); // TODO make interface

  // TODO  set this in context
  function handlePick(pickVerticalBarOdds: string) {
    // TODO make regex to verify the string pattern
    const [pick, pickOdds, badge] = pickVerticalBarOdds.split("|");
    console.log({
      pick,
      pickOdds,
    });
    parlayContext.dispatch({
      type: "addActivePick",
      payload: {
        ...parlayContext.state,
        activePicks: [
          ...activePicks,
          {
            matchupId: id,
            oddsId,
            pickOdds: Number(pickOdds),
            pick,
            badge,
            oddsType,
            useLatestOdds: false, // TODO handle this
          },
        ],
      },
    });
    setConfirmPickModalOpen(true);
  }

  const formatOdds = (odds: number) => (odds > 0 ? `+${odds}` : odds);

  return (
    <>
      <ConfirmPickModal
        open={confirmPickModalOpen}
        setConfirmPickModalOpen={setConfirmPickModalOpen}
      />
      <div className="flex flex-grow flex-shrink-0 card m-2 bg-neutral text-neutral-content md:flex">
        <div className="stats shadow flex rounded-none">
          <div className="stat place-items-start">
            <div className="stat-title">{strLeague}</div>
          </div>

          <div className="stat place-items-center">
            <div className="stat-title">{`${
              status !== "NS" ? "locked" : humanReadableDate(strTimestamp).slice(-8)
            }`}</div>
          </div>

          <div className="stat place-items-end">
            <div className="stat-title">{oddsType}</div>
          </div>
        </div>
        <div className="card-body items-center text-center">
          <h2 className="card-title mb-3 text-xl">{`${strAwayTeam} at ${strHomeTeam}`}</h2>
          <div className="flex justify-around">
            <div>
              <Image
                src={`${awayBadgeId}/preview`}
                width={250}
                height={250}
                alt={`${strAwayTeam}-logo`}
              />
              <div className="text-2xl mt-5 mr-4 font-bold">Away Team</div>
            </div>
            <div>
              <Image
                src={`${homeBadgeId}/preview`}
                width={250}
                height={250}
                alt={`${strHomeTeam}-logo`}
              />
              <div className="text-2xl mt-5 ml-4 font-bold">Home Team</div>
            </div>
          </div>
          <div className="divider"></div>
          <div className="text-3xl mr-5 font-bold">{ODDS_TYPE_LOOKUP[oddsType]}</div>
          {oddsType === "totals" && <div className="text-lg mr-5 font-bold">{total}</div>}
          <div className="card-actions mt-3 flex">
            <div className="form-control mx-6">
              <div className="label-text text-lg">
                {oddsType === "totals" ? "Over" : strAwayTeam}
              </div>
              {oddsType === "pointspread" && awaySpread}
              <label className="label cursor-pointer justify-center">
                <input
                  size={32}
                  type="checkbox"
                  disabled={status !== "NS" || parlayContext.state.parlays[0]?.locked}
                  onChange={() =>
                    handlePick(
                      oddsType === "totals"
                        ? `over|${overOdds}`
                        : `${strAwayTeam}|${awayOdds}|${awayBadgeId}`
                    )
                  }
                  // onChange={() =>
                  //   upsertPickMutation.mutate({
                  //     matchupId: id,
                  //     useLatestOdds: true,
                  //     pick: oddsType === "totals" ? "over" : strAwayTeam,
                  //   })
                  // }
                  checked={pick === (oddsType === "totals" ? "over" : strAwayTeam)}
                  className="checkbox checkbox-primary checkbox-lg justify-center"
                />
              </label>
              <div className="label-text text-xl">
                {oddsType === "totals" ? formatOdds(overOdds!) : formatOdds(awayOdds!)}
              </div>
            </div>
            <div className="form-control mx-6">
              <div className="label-text text-lg">
                {oddsType === "totals" ? "Under" : strHomeTeam}
              </div>
              {oddsType === "pointspread" && homeSpread}
              <label className="label cursor-pointer justify-center">
                <input
                  size={32}
                  type="checkbox"
                  disabled={status !== "NS" || parlayContext.state.parlays[0]?.locked}
                  onChange={() =>
                    handlePick(
                      oddsType === "totals"
                        ? `under|${underOdds}`
                        : `${strHomeTeam}|${homeOdds}|${homeBadgeId}`
                    )
                  }
                  // onChange={() =>
                  //   upsertPickMutation.mutate({
                  //     matchupId: id,
                  //     useLatestOdds: true,
                  //     pick: oddsType === "totals" ? "under" : strHomeTeam,
                  //   })
                  // }
                  checked={pick === (oddsType === "totals" ? "under" : strHomeTeam)}
                  className="checkbox checkbox-primary checkbox-lg justify-center"
                />
              </label>
              <div className="label-text text-xl">
                {oddsType === "totals" ? formatOdds(underOdds!) : formatOdds(homeOdds!)}
              </div>
            </div>
          </div>
          {parlayContext.state.parlays?.[0]?.locked && (
            <div className="label-text">You have a locked pick</div>
          )}
        </div>
      </div>
    </>
  );
}

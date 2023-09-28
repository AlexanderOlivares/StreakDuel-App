"use client";

import React from "react";
import { humanReadableDate } from "@/lib/dateTime.ts/dateFormatter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import { ODDS_TYPE_LOOKUP } from "@/lib/textFormatting.ts/constants";
// import { useSession } from "next-auth/react";

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

interface MakePickMutationProps {
  matchupId: string;
  useLatestOdds: boolean;
  pick: string;
}

export default function MatchupCard(props: MatchupWithOdds) {
  const {
    strLeague,
    strEvent,
    strThumb,
    strTimestamp,
    strHomeTeam,
    strAwayTeam,
    // drawEligible,
    id,
    // idHomeTeam,
    // idAwayTeam,
    // drawTeam,
    oddsType,
    // status,
    locked,
    Odds,
  } = props;
  // TODO make checkboxes radios
  // const radioId = `radio-${id}`;
  // const { data: session, status: authStatus } = useSession();

  const queryClient = useQueryClient();

  const upsertPickMutation = useMutation({
    mutationFn: (mutationProps: MakePickMutationProps) => upsertPick(mutationProps),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getMatchups"] });
    },
    onError: ({ error }) => {
      console.error(error);
    },
  });

  function upsertPick(mutationProps: MakePickMutationProps) {
    return axios.post("/api/pick", mutationProps);
  }

  return (
    <>
      <div className="flex flex-grow flex-shrink-0 card m-2 bg-neutral text-neutral-content md:flex">
        <div className="items-center my-2 text-center">
          <p>{`${locked ? "locked" : ""} ${strLeague}`}</p>
        </div>
        <figure>
          <Image src={`${strThumb}/preview`} width={1080} height={720} alt={strEvent} />
        </figure>
        <div className="card-body items-center text-center">
          <div className="flex justify-around">
            <span className="text-lg mr-5 font-bold">Away Team</span>
            <span className="text-lg ml-5 font-bold">Home Team</span>
          </div>
          <h2 className="card-title">{`${strAwayTeam} at ${strHomeTeam}`}</h2>
          <p>{humanReadableDate(strTimestamp)}</p>
          <div className="text-lg mr-5 font-bold">{ODDS_TYPE_LOOKUP[oddsType]}</div>
          {oddsType === "totals" && <div className="text-lg mr-5 font-bold">{Odds[0].total}</div>}
          <div className="card-actions mt-3 justify-center">
            <div className="form-control">
              <div className="label-text">{oddsType === "totals" ? "Over" : strAwayTeam}</div>
              {oddsType === "pointspread" && Odds[0].awaySpread}
              <label className="label cursor-pointer">
                <input
                  type="checkbox"
                  disabled={locked}
                  onChange={() =>
                    upsertPickMutation.mutate({
                      matchupId: id,
                      useLatestOdds: true,
                      pick: oddsType === "totals" ? "over" : strAwayTeam,
                    })
                  }
                  checked={locked}
                  className="checkbox checkbox-primary"
                />
              </label>
              <div className="label-text">
                {oddsType === "totals" ? Odds[0].overOdds : Odds[0].awayOdds}
              </div>
            </div>
            <div className="form-control">
              <div className="label-text">{oddsType === "totals" ? "Under" : strHomeTeam}</div>
              {oddsType === "pointspread" && Odds[0].homeSpread}
              <div className="flex items-center">
                <label className="label cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={locked}
                    onChange={() =>
                      upsertPickMutation.mutate({
                        matchupId: id,
                        useLatestOdds: true,
                        pick: oddsType === "totals" ? "under" : strHomeTeam,
                      })
                    }
                    checked={false}
                    className="checkbox checkbox-primary"
                  />
                </label>
              </div>
              <div className="label-text">
                {oddsType === "totals" ? Odds[0].underOdds : Odds[0].homeOdds}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
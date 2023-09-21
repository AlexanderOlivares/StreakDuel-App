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

interface MakePickMutationProps {
  matchupId: string;
  useLatestOdds: boolean;
  pick: string;
}

export default function MatchupCard(props: Matchup) {
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
          <div className="card-actions mt-3 justify-center">
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Away</span>
                <input
                  type="checkbox"
                  disabled={locked}
                  onChange={() =>
                    upsertPickMutation.mutate({
                      matchupId: id,
                      useLatestOdds: true,
                      pick: strAwayTeam,
                    })
                  }
                  checked={locked}
                  className="checkbox checkbox-primary"
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Home</span>
                <input
                  type="checkbox"
                  disabled={locked}
                  onChange={() =>
                    upsertPickMutation.mutate({
                      matchupId: id,
                      useLatestOdds: true,
                      pick: strAwayTeam,
                    })
                  }
                  checked={false}
                  className="checkbox checkbox-primary"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

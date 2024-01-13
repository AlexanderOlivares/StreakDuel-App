"use client";

import React from "react";
import { humanReadableDate } from "@/lib/dateTime.ts/dateFormatter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import { Matchup } from "@/lib/types/interfaces";
import AdminUseGameForm from "../forms/AdminUseGameForm";

export type OddsType = "money-line" | "totals" | "pointspread";
export type OddsScope =
  | "full-game"
  | "1st-half"
  | "2nd-half"
  | "1st-quarter"
  | "2nd-quarter"
  | "3rd-quarter"
  | "4th-quarter";

interface MatchupTypeMutationProps {
  id: string;
  oddsType?: OddsType;
  drawTeam?: string;
}

function updateMatchupType(matchup: MatchupTypeMutationProps) {
  return axios.put("/admin/matchups/picker/api/matchup-type", matchup);
}

export default function AdminGamePickerCard(props: Matchup) {
  const {
    strLeague,
    strEvent,
    strThumb,
    strTimestamp,
    strHomeTeam,
    strAwayTeam,
    drawEligible,
    id,
    adminSelected,
    drawTeam,
    oddsType,
  } = props;
  const radioId = `radio-${id}`;

  const queryClient = useQueryClient();

  const updateMatchupTypeMutation = useMutation({
    mutationFn: (matchupType: MatchupTypeMutationProps) => updateMatchupType(matchupType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getPotentialMatchups"] });
    },
    onError: error => {
      console.error(error);
    },
  });

  function handleMatchupTypeChange(args: MatchupTypeMutationProps) {
    updateMatchupTypeMutation.mutate({ ...args });
  }

  return (
    <>
      <div className="flex flex-grow flex-shrink-0 card m-2 bg-neutral text-neutral-content md:flex">
        <div className="items-center my-2 text-center">
          <p>{strLeague}</p>
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
          <AdminUseGameForm {...{ adminSelected, id }} />
          <div className="card-actions mt-3 justify-center">
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Moneyline</span>
                <input
                  checked={oddsType === "money-line"}
                  onChange={() => handleMatchupTypeChange({ id, oddsType: "money-line" })}
                  type="radio"
                  name={radioId}
                  className="radio checked:bg-blue-500"
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Spread</span>
                <input
                  checked={oddsType === "pointspread"}
                  onChange={() => handleMatchupTypeChange({ id, oddsType: "pointspread" })}
                  type="radio"
                  name={radioId}
                  className="radio checked:bg-blue-500"
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Over/Under</span>
                <input
                  checked={oddsType === "totals"}
                  onChange={() => handleMatchupTypeChange({ id, oddsType: "totals" })}
                  type="radio"
                  name={radioId}
                  className="radio checked:bg-blue-500"
                />
              </label>
            </div>
            {drawEligible && oddsType === "money-line" && (
              <>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Home Draw</span>
                    <input
                      type="radio"
                      name={radioId}
                      className="radio checked:bg-blue-500"
                      checked={drawTeam === strHomeTeam}
                      onChange={() => handleMatchupTypeChange({ id, drawTeam: strHomeTeam })}
                    />
                  </label>
                </div>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Away Draw</span>
                    <input
                      type="radio"
                      name={radioId}
                      className="radio checked:bg-blue-500"
                      checked={drawTeam === strAwayTeam}
                      onChange={() => handleMatchupTypeChange({ id, drawTeam: strAwayTeam })}
                    />
                  </label>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import React from "react";
import { humanReadableDate } from "@/lib/dateTime.ts/dateFormatter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";

export interface IAdminGamePickerCard {
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
  adminUseGame: boolean | null;
  adminUseAwayDraw?: boolean | null;
  adminUseHomeDraw?: boolean | null;
  adminUseMoneyline?: boolean | null;
  adminUseOverUnder?: boolean | null;
  adminUseSpread?: boolean | null;
}

interface UseGameMutationProps {
  id: string;
  adminUseGame: boolean | null;
}

function updateAdminUseGame(mutationProps: UseGameMutationProps) {
  return axios.put("/admin/matchups/picker/api/use-game", mutationProps);
}

export enum MatchupType {
  Moneyline = "Moneyline",
  OverUnder = "OverUnder",
  Spread = "Spread",
  AwayDraw = "AwayDraw",
  HomeDraw = "HomeDraw",
}

interface MatchupTypeMutationProps {
  id: string;
  matchupType: MatchupType;
}

function updateMatchupType(matchup: MatchupTypeMutationProps) {
  return axios.put("/admin/matchups/picker/api/matchup-type", matchup);
}

export default function AdminGamePickerCard(props: IAdminGamePickerCard) {
  const {
    strLeague,
    strEvent,
    strThumb,
    strTimestamp,
    strHomeTeam,
    strAwayTeam,
    drawEligible,
    id,
    adminUseGame,
    adminUseAwayDraw,
    adminUseHomeDraw,
    adminUseMoneyline,
    adminUseSpread,
    adminUseOverUnder,
  } = props;
  const radioId = `radio-${id}`;

  const queryClient = useQueryClient();

  const adminUseGameMutation = useMutation({
    mutationFn: (mutationProps: UseGameMutationProps) => updateAdminUseGame(mutationProps),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getPotentialMatchups"] });
    },
    onError: error => {
      console.error(error);
    },
  });

  const updateMatchupTypeMutation = useMutation({
    mutationFn: (matchupType: MatchupTypeMutationProps) => updateMatchupType(matchupType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getPotentialMatchups"] });
    },
    onError: error => {
      console.error(error);
    },
  });

  function handleMatchupTypeChange(matchupType: MatchupType) {
    updateMatchupTypeMutation.mutate({ id, matchupType });
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
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Use Game</span>
              <input
                type="checkbox"
                onChange={() => adminUseGameMutation.mutate({ id, adminUseGame })}
                checked={adminUseGame ?? false}
                className="checkbox checkbox-primary"
              />
            </label>
          </div>
          <div className="card-actions mt-3 justify-center">
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Moneyline</span>
                <input
                  checked={adminUseMoneyline ?? false}
                  onChange={() => handleMatchupTypeChange(MatchupType.Moneyline)}
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
                  checked={adminUseSpread ?? false}
                  onChange={() => handleMatchupTypeChange(MatchupType.Spread)}
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
                  checked={adminUseOverUnder ?? false}
                  onChange={() => handleMatchupTypeChange(MatchupType.OverUnder)}
                  type="radio"
                  name={radioId}
                  className="radio checked:bg-blue-500"
                />
              </label>
            </div>
            {drawEligible && (
              <>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Home Draw</span>
                    <input
                      type="radio"
                      name={radioId}
                      className="radio checked:bg-blue-500"
                      checked={adminUseHomeDraw ?? false}
                      onChange={() => handleMatchupTypeChange(MatchupType.HomeDraw)}
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
                      checked={adminUseAwayDraw ?? false}
                      onChange={() => handleMatchupTypeChange(MatchupType.AwayDraw)}
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

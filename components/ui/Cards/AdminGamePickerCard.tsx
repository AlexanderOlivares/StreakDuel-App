"use client";

import React from "react";
import { humanReadableDate } from "@/lib/dateTime.ts/dateFormatter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export interface IAdminGamePickerCard {
  gameDate: string;
  gameTime: string;
  id: string;
  league: string;
  name: string;
  drawEligible: boolean;
  adminUseGame: boolean | null;
  adminUseAwayDraw?: boolean | null;
  adminUseHomeDraw?: boolean | null;
  adminUseMoneyline?: boolean | null;
  adminUseOverUnder?: boolean | null;
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
    gameTime,
    league,
    name,
    drawEligible,
    id,
    adminUseGame,
    adminUseAwayDraw,
    adminUseHomeDraw,
    adminUseMoneyline,
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
        <div className="card-body items-center text-center">
          <p>{league}</p>
          <h2 className="card-title">{name}</h2>
          <p>{humanReadableDate(gameTime)}</p>
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

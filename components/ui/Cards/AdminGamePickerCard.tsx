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
  adminUseGame: boolean;
  adminUseAwayDraw?: boolean;
  adminUseHomeDraw?: boolean;
  adminUseMoneyline?: boolean;
  adminUseOverUnder?: boolean;
}

interface UseGameMutationProps {
  id: string;
  adminUseGame: boolean;
}

function updateAdminUseGame(mutationProps: UseGameMutationProps) {
  const { id, adminUseGame } = mutationProps;
  return axios.post("/admin/matchups/picker/api", {
    id,
    adminUseGame,
  });
}

export default function AdminGamePickerCard(props: IAdminGamePickerCard) {
  const { gameTime, league, name, drawEligible, id, adminUseGame } = props;

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (mutationProps: UseGameMutationProps) => updateAdminUseGame(mutationProps),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getPotentialMatchups"] });
    },
    onError: error => {
      console.error(error);
    },
  });

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
                onChange={() => mutation.mutate({ id, adminUseGame })}
                checked={adminUseGame ?? false}
                className="checkbox checkbox-primary"
              />
            </label>
          </div>
          <div className="card-actions mt-3 justify-center">
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Moneyline</span>
                <input type="radio" name="radio-10" className="radio checked:bg-red-500" />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Over/Under</span>
                <input type="radio" name="radio-10" className="radio checked:bg-blue-500" />
              </label>
            </div>
            {drawEligible && (
              <>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Home Draw</span>
                    <input
                      type="radio"
                      name="radio-10"
                      className="radio checked:bg-blue-500"
                      // checked
                    />
                  </label>
                </div>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Away Draw</span>
                    <input
                      type="radio"
                      name="radio-10"
                      className="radio checked:bg-blue-500"
                      // checked
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

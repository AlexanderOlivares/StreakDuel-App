"use client";

import React, { useEffect, useState } from "react";
import { humanReadableDate } from "@/lib/dateTime.ts/dateFormatter";
import Image from "next/image";
import { ODDS_TYPE_LOOKUP, TBD_PICK_RESULT_STATUS } from "@/lib/textFormatting.ts/constants";
import ConfirmPickModal from "../modals/ConfirmPickModal";
import { useParlayContext } from "@/context/ParlayProvider";
import { MatchupWithOdds } from "@/lib/types/interfaces";
import { formatDisplayOdds } from "@/lib/oddsUtils/oddsUtils";

export type OddsType = "money-line" | "totals" | "pointspread";
export type OddsScope =
  | "full-game"
  | "1st-half"
  | "2nd-half"
  | "1st-quarter"
  | "2nd-quarter"
  | "3rd-quarter"
  | "4th-quarter";

export default function MatchupCard(props: MatchupWithOdds) {
  const {
    strLeague,
    awayBadgeId,
    homeBadgeId,
    strTimestamp,
    strHomeTeam,
    strAwayTeam,
    id,
    oddsType,
    status,
    odds,
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
  } = odds[0];
  const parlayContext = useParlayContext();
  const { activePicks, pickHistory, locked } = parlayContext.state;
  const [confirmPickModalOpen, setConfirmPickModalOpen] = useState<boolean>(false);
  const [existingPick, setExistingPick] = useState<string>("");
  const [pickResult, setPickResult] = useState<string>(TBD_PICK_RESULT_STATUS);

  useEffect(() => {
    const existingPickFound = pickHistory?.find(({ matchupId }) => matchupId === id);
    if (existingPickFound) {
      setExistingPick(existingPickFound.pick);
      setPickResult(existingPickFound.result);
    } else {
      setExistingPick("");
    }
  }, [id, pickHistory]);

  function handlePick(pickVerticalBarOdds: string) {
    // TODO make regex to verify the string pattern
    const [pick, pickOdds, badge] = pickVerticalBarOdds.split("|");

    const newPick = {
      matchupId: id,
      oddsId,
      pickOdds: Number(pickOdds),
      pick,
      badge,
      oddsType,
      useLatestOdds: false, // TODO handle this
      result: TBD_PICK_RESULT_STATUS,
    };

    const isChangingPick = !!existingPick && existingPick !== pick;
    // remove old pick if changing to other side
    const updatedActivePicks =
      activePicks?.filter(({ pick }) => !(isChangingPick && existingPick === pick)) ?? [];
    // do nothing and open up modal to allow edits there
    const pickedExistingPick = !isChangingPick && existingPick === pick;

    const updatedPickHistory =
      pickHistory?.filter(({ pick }) => !(isChangingPick && existingPick === pick)) ?? [];

    const newPickHistory = {
      matchupId: id,
      pick,
      result: TBD_PICK_RESULT_STATUS,
    };

    parlayContext.dispatch({
      type: "addActivePick",
      payload: {
        ...parlayContext.state,
        activePicks: [...updatedActivePicks, ...(pickedExistingPick ? [] : [newPick])],
        pickHistory: [...(pickedExistingPick ? [] : [newPickHistory]), ...updatedPickHistory],
      },
    });
    setConfirmPickModalOpen(true);
  }

  const getMatchupDisplayStatus = (status: string, strTimestamp: string, pickResult: string) => {
    if (["win", "draw", "loss"].includes(pickResult)) return pickResult;
    if (status === "NS") return humanReadableDate(strTimestamp).slice(-8);
    if (status === "IP") return "locked";
    return status;
  };

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
            <div className="stat-title">
              {getMatchupDisplayStatus(status, strTimestamp, pickResult)}
            </div>
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
            <div className="form-control mx-2">
              <div className="label-text text-md">
                {oddsType === "totals" ? "Over" : strAwayTeam}
              </div>
              {oddsType === "pointspread" && awaySpread}
              <label className="label cursor-pointer justify-center">
                <input
                  size={32}
                  type="checkbox"
                  disabled={status !== "NS" || locked}
                  onChange={() =>
                    handlePick(
                      oddsType === "totals"
                        ? `over|${overOdds}`
                        : `${strAwayTeam}|${awayOdds}|${awayBadgeId}`
                    )
                  }
                  checked={existingPick === (oddsType === "totals" ? "over" : strAwayTeam)}
                  className="checkbox checkbox-primary checkbox-lg justify-center"
                />
              </label>
              <div className="label-text text-xl">
                {oddsType === "totals"
                  ? formatDisplayOdds(overOdds!)
                  : formatDisplayOdds(awayOdds!)}
              </div>
            </div>
            <div className="form-control mx-2">
              <div className="label-text text-md">
                {oddsType === "totals" ? "Under" : strHomeTeam}
              </div>
              {oddsType === "pointspread" && homeSpread}
              <label className="label cursor-pointer justify-center">
                <input
                  size={32}
                  type="checkbox"
                  disabled={status !== "NS" || locked}
                  onChange={() =>
                    handlePick(
                      oddsType === "totals"
                        ? `under|${underOdds}`
                        : `${strHomeTeam}|${homeOdds}|${homeBadgeId}`
                    )
                  }
                  checked={existingPick === (oddsType === "totals" ? "under" : strHomeTeam)}
                  className="checkbox checkbox-primary checkbox-lg justify-center"
                />
              </label>
              <div className="label-text text-xl">
                {oddsType === "totals"
                  ? formatDisplayOdds(underOdds!)
                  : formatDisplayOdds(homeOdds!)}
              </div>
            </div>
          </div>
          {locked && <div className="label-text">You have a locked pick</div>}
        </div>
      </div>
    </>
  );
}

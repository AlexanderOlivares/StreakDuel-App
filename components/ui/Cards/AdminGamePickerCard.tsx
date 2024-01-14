"use client";

import React from "react";
import { humanReadableDate } from "@/lib/dateTime.ts/dateFormatter";
import Image from "next/image";
import { Matchup } from "@/lib/types/interfaces";
import AdminUseGameForm from "../forms/AdminUseGameForm";

export default function AdminGamePickerCard(props: Matchup) {
  const { strLeague, strEvent, strThumb, strTimestamp, strHomeTeam, strAwayTeam } = props;

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
          <AdminUseGameForm {...props} />
        </div>
      </div>
    </>
  );
}

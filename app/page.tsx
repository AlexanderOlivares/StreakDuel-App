"use client";

import React, { useState } from "react";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/utils/Loading";
import { DayToDateDict, isSameDay } from "@/lib/dateTime.ts/dateFormatter";
import ComponentError from "@/components/utils/ComponentError";
import axios from "axios";
import MatchupCard, { MatchupWithOdds } from "@/components/ui/Cards/MatchupCard";
import { useParlayContext } from "./context/ParlayProvider";

async function getMatchups() {
  const response = await axios.get("/api/matchup");
  return response.data;
}

interface GetMatchupsQuery {
  matchups: MatchupWithOdds[];
  weekDates: DayToDateDict;
}

export default function MatchupBoard() {
  const parlayContext = useParlayContext();
  const [date, setDate] = useState<string>(moment().tz("America/Los_Angeles").format("YYYY-MM-DD"));

  const { data, error, isLoading } = useQuery<GetMatchupsQuery>(["getMatchups"], getMatchups);

  if (isLoading) return <Loading />;

  if (!data?.matchups || !data?.weekDates || error) {
    return <ComponentError />;
  }

  console.log({ parlayContext });

  return (
    <>
      <h1 className="text-3xl md:text-5xl mb-4 font-extrabold" id="home">
        Matchups
      </h1>
      <div className="tabs tabs-boxed">
        {Object.entries(data.weekDates).map(([day, dateString]) => {
          return (
            <a
              key={day}
              onClick={() => setDate(dateString)}
              className={`tab tab-sm ${isSameDay(dateString, date) ? "tab-active" : ""}`}
            >
              {day}
            </a>
          );
        })}
      </div>
      {data.matchups
        .filter(({ strTimestamp }) =>
          isSameDay(moment(strTimestamp).tz("America/Los_Angeles").format("YYYY-MM-DD"), date)
        )
        .map(game => {
          return <MatchupCard key={game.id} {...game} />;
        })}
    </>
  );
}

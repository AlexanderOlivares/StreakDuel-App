"use client";

import React, { useState } from "react";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";
import AdminGamePickerCard, { Matchup } from "@/components/ui/Cards/AdminGamePickerCard";
import Loading from "@/components/utils/Loading";
import { DayToDateDict, isSameDay } from "@/lib/dateTime.ts/dateFormatter";
import ComponentError from "@/components/utils/ComponentError";
import axios from "axios";

async function getPotentialMatchups() {
  const response = await axios.get("/admin/matchups/picker/api");
  return response.data;
}

interface GetMatchupsQuery {
  matchups: Matchup[];
  weekDates: DayToDateDict;
}

export default function Picker() {
  const [date, setDate] = useState<string>(moment().tz("America/Los_Angeles").format("YYYY-MM-DD"));

  const { data, error, isLoading } = useQuery<GetMatchupsQuery>(
    ["getPotentialMatchups"],
    getPotentialMatchups
  );

  if (isLoading) return <Loading />;

  if (!data?.matchups || !data?.weekDates || error) {
    return <ComponentError />;
  }

  return (
    <>
      <h1 className="text-3xl md:text-5xl mb-4 font-extrabold" id="home">
        Admin Game Picker
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
          return <AdminGamePickerCard key={game.id} {...game} />;
        })}
    </>
  );
}

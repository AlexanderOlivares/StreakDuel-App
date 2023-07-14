"use client";

import React, { useState } from "react";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";
import AdminGamePickerCard, {
  IAdminGamePickerCard,
} from "@/components/ui/Cards/AdminGamePickerCard";
import Loading from "@/components/utils/Loading";
import { DayToDateDict } from "@/lib/dateTime.ts/dateFormatter";
import ComponentError from "@/components/utils/ComponentError";

async function fetchMatchups() {
  const response = await fetch("/admin/matchups/picker/api");
  if (!response.ok) {
    throw new Error("An error occurred while fetching data.");
  }
  return response.json();
}

interface IMatchupPickerQuery {
  matchups: IAdminGamePickerCard[];
  weekDates: DayToDateDict;
}

export default function Picker() {
  const [date, setDate] = useState<string>(moment().format("YYYYMMDD"));

  const { data, error, isLoading } = useQuery<IMatchupPickerQuery>(["matchupPicker"], () =>
    fetchMatchups()
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
              className={`tab tab-sm ${date === dateString ? "tab-active" : ""}`}
            >
              {day}
            </a>
          );
        })}
      </div>
      {data.matchups
        .filter(({ gameDate }) => gameDate === date)
        .map(game => {
          return <AdminGamePickerCard key={game.id} {...game} />;
        })}
    </>
  );
}

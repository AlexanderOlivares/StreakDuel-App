"use client";

import { useState } from "react";
import moment from "moment";
import { DaysOfWeek, isSameDay } from "@/lib/dateTime.ts/dateFormatter";
import DayPicker from "@/components/ui/tabs/DayPicker";
import AdminGamePickerCard from "@/components/ui/Cards/AdminGamePickerCard";
import { Matchup } from "@/lib/types/interfaces";

interface AdminGamePickerBoardProps {
  matchups: Matchup[];
  displayDates: Record<DaysOfWeek, string | null>;
}

const AdminGamePickerBoard = ({ matchups, displayDates }: AdminGamePickerBoardProps) => {
  const [date, setDate] = useState<string>(moment().tz("America/Los_Angeles").format("YYYY-MM-DD"));

  return (
    <>
      <DayPicker {...{ displayDates, date, setDate }} />
      {matchups
        .filter(({ strTimestamp }) =>
          isSameDay(moment(strTimestamp).tz("America/Los_Angeles").format("YYYY-MM-DD"), date)
        )
        .map(game => {
          return <AdminGamePickerCard key={game.id} {...game} />;
        })}
    </>
  );
};

export default AdminGamePickerBoard;

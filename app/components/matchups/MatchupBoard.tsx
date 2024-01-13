"use client";

import { useState } from "react";
import moment from "moment";
import { MatchupWithOdds } from "@/lib/types/interfaces";
import { DaysOfWeek, isSameDay } from "@/lib/dateTime.ts/dateFormatter";
import DayPicker from "@/components/ui/tabs/DayPicker";
import MatchupCard from "@/components/ui/Cards/MatchupCard";

interface MatchupBoardProps {
  matchups: MatchupWithOdds[];
  displayDates: Record<DaysOfWeek, string>;
}

const MatchupBoard = ({ matchups, displayDates }: MatchupBoardProps) => {
  const [date, setDate] = useState<string>(moment().tz("America/Los_Angeles").format("YYYY-MM-DD"));

  return (
    <>
      <DayPicker {...{ displayDates, date, setDate }} />
      {matchups
        .filter(({ strTimestamp }) =>
          isSameDay(moment(strTimestamp).tz("America/Los_Angeles").format("YYYY-MM-DD"), date)
        )
        .map(game => {
          return <MatchupCard key={game.id} {...game} />;
        })}
    </>
  );
};

export default MatchupBoard;

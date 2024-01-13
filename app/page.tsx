import React from "react";
import moment from "moment";
import {
  dayRangeLaTimezone,
  getYesterdayTodayTomorrowDisplayDates,
} from "@/lib/dateTime.ts/dateFormatter";
import { MatchupWithOdds } from "@/lib/types/interfaces";
import prisma from "@/lib/prisma";
import MatchupBoard from "./components/matchups/MatchupBoard";

export default async function App() {
  const now = moment().format("YYYYMMDD");
  const today = dayRangeLaTimezone(now);
  const yesterday = dayRangeLaTimezone(moment(now).subtract(1, "days").format("YYYYMMDD"));
  const nextDay = dayRangeLaTimezone(moment(now).add(1, "days").format("YYYYMMDD"));
  const displayDates = getYesterdayTodayTomorrowDisplayDates("America/Los_Angeles");

  const matchups: MatchupWithOdds[] = await prisma.matchups.findMany({
    where: {
      OR: [yesterday, today, nextDay].map(dateRange => ({ strTimestamp: dateRange })),
      used: true,
    },
    include: { odds: true },
    orderBy: [
      {
        strTimestamp: "asc",
      },
      {
        id: "asc",
      },
    ],
  });

  return (
    <>
      <h1 className="text-3xl md:text-5xl mb-4 font-extrabold" id="home">
        Matchups
      </h1>
      <MatchupBoard {...{ matchups, displayDates }} />
    </>
  );
}

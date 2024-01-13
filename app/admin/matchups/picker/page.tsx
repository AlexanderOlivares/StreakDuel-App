import React from "react";
import moment from "moment";
import prisma from "@/lib/prisma";
import { Matchup } from "@/lib/types/interfaces";
import { dayRangeLaTimezone, getCurrentWeekDates } from "@/lib/dateTime.ts/dateFormatter";
import AdminGamePickerBoard from "@/app/components/admin/AdminGamePickerBoard";

const Picker = async () => {
  const now = moment().format("YYYYMMDD");
  const weekDates = getCurrentWeekDates(now);

  const dateRanges = Object.values(weekDates).map(date => {
    const range = dayRangeLaTimezone(date);
    return {
      strTimestamp: range,
    };
  });

  const matchups: Matchup[] = await prisma.matchups.findMany({
    where: {
      OR: dateRanges,
    },
    orderBy: [
      {
        strTimestamp: "asc",
      },
      {
        id: "asc",
      },
    ],
  });

  // TODO review this and remove next tuesday
  // Next Tuesday is not part of the current week's cycle of games so safe to omit it. It's only used
  // above to get Next Monday's game times that officially start on next Tuesday in UTC time.
  // eslint-disable-next-line
  // const { "Next Tuesday": _, ...relevantDays } = weekDates;

  return (
    <>
      <h1 className="text-3xl md:text-5xl mb-4 font-extrabold" id="home">
        Admin Game Picker
      </h1>
      <AdminGamePickerBoard {...{ matchups, displayDates: weekDates }} />
    </>
  );
};

export default Picker;

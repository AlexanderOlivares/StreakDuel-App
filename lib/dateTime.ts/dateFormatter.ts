import moment from "moment";
import "moment-timezone";

export enum DaysOfWeek {
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
  Sunday = "Sunday",
  NextMonday = "Next Monday",
}

export const dayToEnum: Record<string, DaysOfWeek> = {
  Monday: DaysOfWeek.Monday,
  Tuesday: DaysOfWeek.Tuesday,
  Wednesday: DaysOfWeek.Wednesday,
  Thursday: DaysOfWeek.Thursday,
  Friday: DaysOfWeek.Friday,
  Saturday: DaysOfWeek.Saturday,
  Sunday: DaysOfWeek.Sunday,
  NextMonday: DaysOfWeek.NextMonday,
};

export interface DayToDateDict {
  [DaysOfWeek.Monday]: string | null;
  [DaysOfWeek.Tuesday]: string | null;
  [DaysOfWeek.Wednesday]: string | null;
  [DaysOfWeek.Thursday]: string | null;
  [DaysOfWeek.Friday]: string | null;
  [DaysOfWeek.Saturday]: string | null;
  [DaysOfWeek.Sunday]: string | null;
  [DaysOfWeek.NextMonday]: string | null;
}

export function getCurrentWeekDates(givenDate: string) {
  if (!moment(givenDate).isValid()) {
    throw new Error("Invalid date provided");
  }

  const givenNumericDate = moment(givenDate, "YYYYMMDD").weekday();

  const daysMap: DayToDateDict = {
    Monday: null,
    Tuesday: null,
    Wednesday: null,
    Thursday: null,
    Friday: null,
    Saturday: null,
    Sunday: null,
    "Next Monday": null,
  };

  Object.values(dayToEnum).forEach((day, i) => {
    const currentNumericDate = givenNumericDate === 0 ? i - 6 : i + 1;
    const weekdayOffset = currentNumericDate - givenNumericDate;

    const date = moment(givenDate).add(weekdayOffset, "days");
    const dateString = date.format("YYYYMMDD");

    daysMap[day] = dateString;
  });

  return daysMap;
}

export function humanReadableDate(dateString: string) {
  return moment(dateString).tz("America/Los_Angeles").format("LLLL");
}

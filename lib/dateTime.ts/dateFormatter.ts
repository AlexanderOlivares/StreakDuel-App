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
  NextTuesday = "Next Tuesday",
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
  NextTuesday: DaysOfWeek.NextTuesday,
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
  [DaysOfWeek.NextTuesday]: string | null;
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
    "Next Tuesday": null,
  };

  Object.values(dayToEnum).forEach((day, i) => {
    const currentNumericDate = givenNumericDate === 0 ? i - 6 : i + 1;
    const weekdayOffset = currentNumericDate - givenNumericDate;
    const date = moment.utc(givenDate).add(weekdayOffset, "days").toISOString();

    daysMap[day] = date;
  });

  return daysMap;
}

export function humanReadableDate(dateString: string) {
  return moment(dateString).tz("America/Los_Angeles").format("LLLL");
}

export function isSameDay(date1: string, date2: string) {
  const day1 = moment(date1).tz("America/Los_Angeles");
  const day2 = moment(date2).tz("America/Los_Angeles");

  return day1.isSame(day2, "day");
}

export function dayRangeLaTimezone(date: string) {
  const startOfDay = moment.tz(date, "America/Los_Angeles").startOf("day");
  const endOfDay = moment(startOfDay).endOf("day");

  return {
    gte: startOfDay.toISOString(),
    lt: endOfDay.toISOString(),
  };
}

// TODO write tests
export function getYesterdayTodayTomorrow(timeZone: string) {
  const today = moment.tz(timeZone);
  const yesterday = today.clone().subtract(1, "day");
  const tomorrow = today.clone().add(1, "day");
  return [yesterday, today, tomorrow].map(day => day.format("dddd"));
}

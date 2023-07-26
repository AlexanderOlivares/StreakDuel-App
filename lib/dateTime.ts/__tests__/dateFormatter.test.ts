import moment from "moment";
import { getCurrentWeekDates, humanReadableDate, isSameDay } from "../dateFormatter";

describe("getCurrentWeekDates", () => {
  test("returns a Map with correct dates for week", () => {
    const datesMap = getCurrentWeekDates("20230213");

    expect(datesMap.Monday).toBe("2023-02-13T00:00:00.000Z");
    expect(datesMap.Tuesday).toBe("2023-02-14T00:00:00.000Z");
  });

  test("handles starting with a Sunday", () => {
    const datesMap = getCurrentWeekDates("20230716"); // Sunday

    expect(datesMap.Monday).toBe("2023-07-10T00:00:00.000Z");
    expect(datesMap["Next Monday"]).toBe("2023-07-17T00:00:00.000Z");
  });

  test("handles starting on a Monday", () => {
    const datesMap = getCurrentWeekDates("20230717"); // Monday

    expect(datesMap.Monday).toBe("2023-07-17T00:00:00.000Z");
    expect(datesMap["Next Monday"]).toBe("2023-07-24T00:00:00.000Z");
  });

  test("throws error on invalid date", () => {
    const invalidDate = "20231332"; // invalid date

    expect(() => getCurrentWeekDates(invalidDate)).toThrow();
  });

  test("throws error on empty string", () => {
    const invalidDate = "";

    expect(() => getCurrentWeekDates(invalidDate)).toThrow();
  });
});

describe("humanReadableDate", () => {
  test("formats a utc time from tomorrow to LA time today", () => {
    const laTime = humanReadableDate("2023-07-16T06:00:00+00:00");

    expect(laTime).toBe("Saturday, July 15, 2023 11:00 PM");
  });
});

describe("isSameDay", () => {
  test("returns true if to ISO date strings are from same day", () => {
    const time1 = "2023-07-27T01:45:00+00:00";
    const la = moment(time1).tz("America/Los_Angeles").format("YYYY-MM-DD");

    expect(la).toBe("2023-07-26");
  });

  test("returns true if to ISO date strings are from same day", () => {
    const time1 = "2023-07-26T02:10:00+00:00";
    const time2 = "2023-07-25T13:10:00+00:00";

    expect(isSameDay(time1, time2)).toBe(true);
  });

  test("returns false if to ISO date strings are not from same day", () => {
    const time1 = "2023-07-25T02:10:00+00:00";
    const time2 = "2023-07-26T12:10:00+00:00";

    expect(isSameDay(time1, time2)).toBe(false);
  });
});

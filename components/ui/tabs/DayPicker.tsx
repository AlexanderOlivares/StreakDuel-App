"use client";

import { DayToDateDict, DaysOfWeek, isSameDay } from "@/lib/dateTime.ts/dateFormatter";

interface DayPickerProps {
  displayDates: Record<DaysOfWeek, string> | DayToDateDict;
  date: string;
  setDate: React.Dispatch<React.SetStateAction<string>>;
}

const DayPicker = ({ displayDates, date, setDate }: DayPickerProps) => {
  return (
    <div className="tabs tabs-boxed flex justify-center">
      {Object.entries(displayDates).map(([day, dateString]) => {
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
  );
};

export default DayPicker;

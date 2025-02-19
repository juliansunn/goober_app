"use client";

import { WorkoutSkeleton } from "@/types";
import { Week } from "@/types/skeleton";
import { getDaySlots } from "@/utils/date-utils";
import { format } from "date-fns";

const findPhaseAndWeekForDate = (skeleton: WorkoutSkeleton, date: Date) => {
  return skeleton?.phases.find((phase) => {
    return phase.weeks.find((week) => {
      return week.startDate === date.toISOString();
    });
  });
};

interface WeeklyCalendarProps {
  week: Week;
}

export function WorkoutWeeklyCalendar({ week }: WeeklyCalendarProps) {

  return (
    <div className="grid grid-cols-7 gap-2 w-full mx-auto">
      {getDaySlots(week.startDate).map(({ dayIndex, date }) => (
        <div key={dayIndex} className="border rounded-sm p-2 min-h-[80px]">
          {date ? (
            <>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm">
                  {format(date, "EEE")}
                </span>
                <span className="text-sm text-muted-foreground">
                  {format(date, "d")}
                </span>
              </div>
              {/* Placeholder for workout data */}
              <div className="text-xs text-muted-foreground">No workout</div>
            </>
          ) : (
            <div className="w-full h-full opacity-25">{/* Empty cell */}</div>
          )}
        </div>
      ))}
    </div>
  );
}

"use client";

import { format } from "date-fns";
import { getWeekDates } from "@/utils/date-utils";
import { WorkoutSkeleton } from "@/types";
import { useWorkoutForm } from "@/hooks/useWorkoutForm";
import { Week } from "@/types/skeleton";

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
  const today = new Date().toISOString();
  const weekDates = getWeekDates(today);

  return (
    <div className="grid grid-cols-7 gap-2 w-full mx-auto">
      {weekDates.map((date) => (
        <div
          key={format(date, "yyyy-MM-dd")}
          className="border rounded-sm p-2 min-h-[80px]"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-sm">{format(date, "EEE")}</span>
            <span className="text-sm text-muted-foreground">
              {format(date, "d")}
            </span>
          </div>
          {/* Placeholder for workout data */}
          <div className="text-xs text-muted-foreground">No workout</div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { format, eachDayOfInterval, parseISO } from "date-fns";
import { useWorkoutForm } from "@/hooks/useWorkoutForm";
import { Week } from "@/types/skeleton";

interface WeeklyCalendarProps {
  week: Week;
}

export function WorkoutWeeklyCalendar({ week }: WeeklyCalendarProps) {
  const { generateSchedule } = useWorkoutForm();

  // Generate array of dates between start and end date
  const weekDates = eachDayOfInterval({
    start: parseISO(week.startDate),
    end: parseISO(week.endDate),
  });

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

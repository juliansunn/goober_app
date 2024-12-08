"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { format } from "date-fns";
import { getWeekDates } from "@/utils/date-utils";
import { useWorkout } from "@/app/contexts/WorkoutContext";

interface WorkoutWeeklyCalendarProps {
  handlePrevWeek: (date: Date) => void;
  handleNextWeek: (date: Date) => void;
}

export function WorkoutWeeklyCalendar({
  handlePrevWeek,
  handleNextWeek,
}: WorkoutWeeklyCalendarProps) {
  const { skeleton, generateSkeleton } = useWorkout();
  console.log("skeleton", skeleton);
  const today = new Date().toISOString();
  const weekDates = getWeekDates(today);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePrevWeek(weekDates[0])}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle>
            Week {skeleton?.schedule.phases[0].weeks[0].weekNumber}
          </CardTitle>
          <Button variant="outline" size="icon" onClick={() => {}}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Description: {skeleton?.schedule.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date) => (
            <div
              key={format(date, "yyyy-MM-dd")}
              className="border p-2 text-center"
            >
              <div className="font-semibold">{format(date, "EEE")}</div>
              <div className="text-sm">{format(date, "dd")}</div>
              {/* Placeholder for workout data */}
              <div className="mt-2 text-xs">No workout</div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <p>Focus: {skeleton?.schedule.phases[0].weeks[0].focus}</p>
          <p>
            Planned Volume: {skeleton?.schedule.phases[0].weeks[0].volumeType}{" "}
            {skeleton?.schedule.phases[0].weeks[0].volumeValue}
          </p>
        </div>
        <Button onClick={generateSkeleton}>Generate Workouts</Button>
      </CardFooter>
    </Card>
  );
}

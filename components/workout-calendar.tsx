"use client";

import React, { useState, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { WorkoutBuilder } from "@/components/workoutBuilder/workout-builder";
import {
  GeneratedScheduledWorkout,
  ScheduledWorkout,
  Workout,
} from "@/types/workouts";
import { useWorkout } from "@/app/contexts/WorkoutContext";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

import "react-big-calendar/lib/css/react-big-calendar.css";
import { CalendarItem, StravaActivity } from "@/types";

const localizer = momentLocalizer(moment);

interface WorkoutCalendarProps {
  startDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
}

export function WorkoutCalendarComponent({
  startDate,
  onStartDateChange,
  onEndDateChange,
}: WorkoutCalendarProps) {
  const [selectedWorkout, setSelectedWorkout] =
    useState<ScheduledWorkout | null>(null);
  const [isEditingSidebar, setIsEditingSidebar] = useState(false);
  const [currentDate, setCurrentDate] = useState(startDate);

  const {
    calendarItems,
    bulkCreateScheduledWorkouts,
    clearGeneratedScheduledWorkouts,
    generateSchedule,
  } = useWorkout();

  const queryClient = useQueryClient();

  const createScheduledWorkoutMutation = useMutation({
    mutationFn: async ({
      workoutId,
      scheduledAt,
    }: {
      workoutId: number;
      scheduledAt: Date;
    }) => {
      const response = await fetch("/api/scheduled-workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workoutId,
          scheduledAt: scheduledAt.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create scheduled workout");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduledWorkouts"] });
      toast.success("Workout scheduled successfully");
    },
    onError: (error) => {
      console.error("Error creating scheduled workout:", error);
      toast.error("Failed to schedule workout");
    },
  });

  const updateScheduledWorkoutMutation = useMutation({
    mutationFn: async (updatedWorkout: ScheduledWorkout) => {
      const response = await fetch(
        `/api/scheduled-workouts/${updatedWorkout.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedWorkout),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update scheduled workout");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduledWorkouts"] });
      toast.success("Workout updated successfully");
      setIsEditingSidebar(false);
    },
    onError: (error) => {
      console.error("Error updating scheduled workout:", error);
      toast.error("Failed to update workout");
    },
  });

  const deleteScheduledWorkoutMutation = useMutation({
    mutationFn: async (workoutId: number) => {
      const response = await fetch(`/api/scheduled-workouts/${workoutId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete scheduled workout");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduledWorkouts"] });
      toast.success("Workout deleted successfully");
      setIsEditingSidebar(false);
    },
    onError: (error) => {
      console.error("Error deleting scheduled workout:", error);
      toast.error("Failed to delete workout");
    },
  });

  const handleSelectEvent = useCallback(
    (event: (typeof calendarEvents)[number]) => {
      if ("item" in event && "workout" in event.item) {
        setSelectedWorkout(event.item as ScheduledWorkout);
        setIsEditingSidebar(true);
      }
    },
    []
  );

  const CustomToolbar = ({ date, onNavigate }: any) => {
    const goToBack = () => {
      const newDate = new Date(date);
      newDate.setMonth(date.getMonth() - 1);
      onNavigate("prev", newDate);
      updateDateRange(newDate);
    };

    const goToNext = () => {
      const newDate = new Date(date);
      newDate.setMonth(date.getMonth() + 1);
      onNavigate("next", newDate);
      updateDateRange(newDate);
    };

    const goToCurrent = () => {
      const newDate = new Date();
      onNavigate("current", newDate);
      updateDateRange(newDate);
    };

    const handleMonthChange = (value: string) => {
      const newDate = new Date(date);
      newDate.setMonth(parseInt(value));
      onNavigate("date", newDate);
      updateDateRange(newDate);
    };

    const handleYearChange = (value: string) => {
      const newDate = new Date(date);
      newDate.setFullYear(parseInt(value));
      onNavigate("date", newDate);
      updateDateRange(newDate);
    };

    const monthOptions = moment.months().map((month, index) => (
      <SelectItem key={month} value={index.toString()}>
        {month}
      </SelectItem>
    ));

    const currentYear = date.getFullYear();
    const yearOptions = Array.from(
      { length: 11 },
      (_, i) => currentYear - 5 + i
    ).map((year) => (
      <SelectItem key={year} value={year.toString()}>
        {year}
      </SelectItem>
    ));

    return (
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Button onClick={goToBack} variant="outline">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button onClick={goToNext} variant="outline">
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button onClick={goToCurrent} variant="outline">
            Today
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Select
            onValueChange={handleMonthChange}
            defaultValue={date.getMonth().toString()}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>{monthOptions}</SelectContent>
          </Select>
          <Select
            onValueChange={handleYearChange}
            defaultValue={date.getFullYear().toString()}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>{yearOptions}</SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const eventStyleGetter = (event: any) => {
    return {
      style: {
        backgroundColor:
          event.itemType === "stravaActivity"
            ? "#F97316"
            : "hsl(var(--primary))",
        color: "white",
        border: "0px",
        display: "block",
        padding: "2px 5px",
      },
    };
  };

  const calendarEvents = calendarItems.map((item) => ({
    id: item.item.id,
    title:
      item.itemType === "stravaActivity"
        ? item.item.name
        : item.item.workout?.title,
    start: new Date(
      "scheduledAt" in item.item
        ? item.item.scheduledAt
        : "start_date" in item.item
        ? item.item.start_date
        : new Date()
    ),
    end: new Date(
      "scheduledAt" in item.item
        ? item.item.scheduledAt
        : "start_date" in item.item
        ? item.item.start_date
        : new Date()
    ),
    itemType: item.itemType,
    item: item.item,
  }));

  const handleSaveWorkout = (updatedWorkout?: Workout) => {
    if (!updatedWorkout) return;

    if (selectedWorkout) {
      const updatedScheduledWorkout: ScheduledWorkout = {
        ...selectedWorkout,
        workout: updatedWorkout,
      };
      updateScheduledWorkoutMutation.mutate(updatedScheduledWorkout);
    } else {
      createScheduledWorkoutMutation.mutate({
        workoutId: updatedWorkout.id!,
        scheduledAt: selectedWorkout!.scheduledAt,
      });
    }
  };

  const handleDeleteWorkout = () => {
    if (selectedWorkout && selectedWorkout.id) {
      deleteScheduledWorkoutMutation.mutate(selectedWorkout.id);
    }
  };

  const updateDateRange = (date: Date) => {
    const newStartDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const newEndDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    onStartDateChange(newStartDate);
    onEndDateChange(newEndDate);
    setCurrentDate(date);
  };

  return (
    <div className="h-screen p-4 bg-background flex">
      <div className="flex-grow pr-4">
        <h1 className="text-2xl font-bold mb-4">Workout Calendar</h1>
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "calc(100vh - 100px)" }}
          onSelectEvent={handleSelectEvent}
          selectable
          components={{
            toolbar: CustomToolbar,
          }}
          eventPropGetter={eventStyleGetter}
          date={currentDate}
          onNavigate={(newDate) => {
            updateDateRange(newDate);
          }}
        />
      </div>
      {isEditingSidebar && (
        <div className="w-1/3 border-l bg-secondary">
          <ScrollArea className="h-[calc(100vh-2rem)]">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {selectedWorkout?.id ? "Edit Workout" : "Add New Workout"}
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setIsEditingSidebar(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <div className="mb-4">
                <Label htmlFor="scheduledAt">Scheduled At</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={format(
                    selectedWorkout!.scheduledAt,
                    "yyyy-MM-dd'T'HH:mm"
                  )}
                  onChange={(e) =>
                    setSelectedWorkout((prev) => ({
                      ...prev!,
                      scheduledAt: new Date(e.target.value),
                    }))
                  }
                />
              </div>
              <WorkoutBuilder
                existingWorkout={selectedWorkout?.workout}
                onSave={handleSaveWorkout}
              />
              {selectedWorkout?.id && selectedWorkout.id > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleDeleteWorkout}
                  className="mt-4"
                >
                  Delete Workout
                </Button>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

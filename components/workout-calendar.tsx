"use client";

import { useCallback, useState } from "react";
import moment from "moment";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Calendar, momentLocalizer, SlotInfo } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { ScheduledWorkout, Workout, WorkoutType } from "@/types/workouts";
import { RiBikeLine, RiRunLine } from "react-icons/ri";
import { LiaSwimmerSolid } from "react-icons/lia";
import { getWorkoutColor } from "@/lib/workout-utils";
import { WorkoutBuilder } from "@/components/workout-builder";
import { format } from "date-fns";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import Workouts from "@/app/(dashboard)/workouts/workouts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";

const DnDCalendar = withDragAndDrop(Calendar);

const localizer = momentLocalizer(moment);

interface WorkoutCalendarProps {
  initialWorkouts: ScheduledWorkout[];
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
}

export function WorkoutCalendarComponent({
  initialWorkouts,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: WorkoutCalendarProps) {
  const [workouts, setWorkouts] = useState(initialWorkouts);
  const [isWorkoutDialogOpen, setIsWorkoutDialogOpen] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    title: "",
    type: WorkoutType.RUN,
    description: "",
    items: [],
    start: new Date(),
    end: new Date(),
  });
  const [selectedWorkout, setSelectedWorkout] = useState<any | null>(null);
  const [isEditWorkoutOpen, setIsEditWorkoutOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSelectingExistingWorkout, setIsSelectingExistingWorkout] =
    useState(false);

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
    onSuccess: (newScheduledWorkout) => {
      queryClient.invalidateQueries({ queryKey: ["scheduledWorkouts"] });
      setWorkouts((prev) => [...prev, newScheduledWorkout]);
      setIsWorkoutDialogOpen(false);
      toast.success("Workout scheduled successfully");
    },
    onError: (error) => {
      console.error("Error creating scheduled workout:", error);
      toast.error("Failed to schedule workout");
    },
  });

  const DayCell = ({ date }: { date: Date }) => {
    const handleAddWorkout = () => {
      setNewWorkout({
        ...newWorkout,
        start: date,
        end: new Date(date.getTime() + 60 * 60 * 1000), // Set end time to 1 hour after start
      });
      setIsWorkoutDialogOpen(true);
    };

    return (
      <div className="flex justify-between items-center p-1">
        <span>{date.getDate()}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-4 w-4"
          onClick={(e) => {
            e.stopPropagation();
            handleAddWorkout();
          }}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setSelectedDate(slotInfo.start);
    setIsWorkoutDialogOpen(true);
  };

  const handleSelectEvent = useCallback((event: any) => {
    setSelectedWorkout(event);
    setIsEditWorkoutOpen(true);
  }, []);

  const handleEditWorkout = () => {
    const updatedWorkouts = workouts.map((workout) =>
      workout.id === selectedWorkout.id ? selectedWorkout : workout
    );
    setWorkouts(updatedWorkouts);
    setIsEditWorkoutOpen(false);
    setSelectedWorkout(null);
  };

  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      const newDate = new Date(toolbar.date);
      newDate.setMonth(newDate.getMonth() - 1);
      updateDateRange(newDate);
      toolbar.onNavigate("prev", newDate);
    };

    const goToNext = () => {
      const newDate = new Date(toolbar.date);
      newDate.setMonth(newDate.getMonth() + 1);
      updateDateRange(newDate);
      toolbar.onNavigate("next", newDate);
    };

    const goToCurrent = () => {
      const now = new Date();
      updateDateRange(now);
      toolbar.onNavigate("current", now);
    };

    const handleMonthChange = (value: string) => {
      const newDate = new Date(toolbar.date);
      newDate.setMonth(parseInt(value));
      updateDateRange(newDate);
      toolbar.onNavigate("date", newDate);
    };

    const handleYearChange = (value: string) => {
      const newDate = new Date(toolbar.date);
      newDate.setFullYear(parseInt(value));
      updateDateRange(newDate);
      toolbar.onNavigate("date", newDate);
    };

    const updateDateRange = (date: Date) => {
      const newStartDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const newEndDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      onStartDateChange(newStartDate);
      onEndDateChange(newEndDate);
    };

    const monthOptions = moment.months().map((month, index) => (
      <SelectItem key={month} value={index.toString()}>
        {month}
      </SelectItem>
    ));

    const currentYear = toolbar.date.getFullYear();
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
        <div>
          <Button onClick={goToBack} variant="outline" className="mr-2">
            Back
          </Button>
          <Button onClick={goToNext} variant="outline" className="mr-2">
            Next
          </Button>
          <Button onClick={goToCurrent} variant="outline">
            Today
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Select
            onValueChange={handleMonthChange}
            defaultValue={toolbar.date.getMonth().toString()}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>{monthOptions}</SelectContent>
          </Select>
          <Select
            onValueChange={handleYearChange}
            defaultValue={toolbar.date.getFullYear().toString()}
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

  const handleEventDrop = ({ event, start, end }: any) => {
    const updatedWorkouts = workouts.map((workout) => {
      if (workout.id === event.id) {
        return { ...workout, start, end };
      }
      return workout;
    });

    setWorkouts(updatedWorkouts);
  };

  const handleEventResize = useCallback((event: any) => {
    // Handle event resize logic here
  }, []);

  const eventStyleGetter = (event: any) => {
    return {
      style: {
        backgroundColor: "#3174ad",
        borderRadius: "5px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
        padding: "2px 5px",
      },
    };
  };

  const EventComponent = ({ event }: { event: ScheduledWorkout }) => {
    const getIcon = () => {
      switch (event.workout.type) {
        case WorkoutType.SWIM:
          return <LiaSwimmerSolid className="inline-block mr-1" />;
        case WorkoutType.BIKE:
          return <RiBikeLine className="inline-block mr-1" />;
        case WorkoutType.RUN:
          return <RiRunLine className="inline-block mr-1" />;
        default:
          return null;
      }
    };

    const colorClass = getWorkoutColor(event.workout.type as WorkoutType);

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`p-1 rounded ${colorClass} flex items-center`}>
              {getIcon()}
              <span className="text-xs truncate">{event.workout.title}</span>
              <span className="text-xs ml-auto">
                {format(event.scheduledAt, "MMM d, yyyy")}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <Card className="p-2 max-w-xs">
              <h3 className="font-bold">{event.workout.title}</h3>
              <p className="text-sm">{event.workout.description}</p>
            </Card>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const handleSaveScheduledWorkout = (workoutId: number) => {
    if (!selectedDate) return;

    createScheduledWorkoutMutation.mutate({
      workoutId,
      scheduledAt: selectedDate,
    });
  };

  const handleWorkoutBuilderSave = async (newWorkout: Workout | undefined) => {
    try {
      if (!newWorkout?.id) {
        throw new Error("Workout ID is required");
      }
      // Then, schedule the newly created workout
      handleSaveScheduledWorkout(newWorkout.id);
    } catch (error) {
      console.error("Error creating workout:", error);
      toast.error("Failed to create and schedule workout");
    }
  };

  // Update the events prop in the DnDCalendar component
  const calendarEvents = initialWorkouts.map((scheduledWorkout) => ({
    id: scheduledWorkout.id,
    title: scheduledWorkout.workout.title,
    start: new Date(scheduledWorkout.scheduledAt),
    end: new Date(
      new Date(scheduledWorkout.scheduledAt).getTime() + 60 * 60 * 1000
    ), // Assuming 1 hour duration
    type: scheduledWorkout.workout.type,
    workout: scheduledWorkout.workout,
  }));

  return (
    <div className="h-screen p-4 bg-background flex">
      <div className="flex-grow">
        <h1 className="text-2xl font-bold mb-4">Workout Calendar</h1>
        <DnDCalendar
          localizer={localizer}
          events={calendarEvents}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          resizable
          style={{ height: "calc(100vh - 100px)" }}
          components={{
            toolbar: CustomToolbar,
            event: EventComponent,
            month: {
              dateHeader: DayCell,
            },
          }}
          eventPropGetter={eventStyleGetter}
          onSelectSlot={handleSelectSlot}
          selectable
          date={startDate}
          onNavigate={(date) => {
            const newStartDate = new Date(
              date.getFullYear(),
              date.getMonth(),
              1
            );
            const newEndDate = new Date(
              date.getFullYear(),
              date.getMonth() + 1,
              0
            );
            onStartDateChange(newStartDate);
            onEndDateChange(newEndDate);
          }}
          className="custom-calendar"
          onSelectEvent={handleSelectEvent}
        />
      </div>

      <Dialog open={isWorkoutDialogOpen} onOpenChange={setIsWorkoutDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedWorkout ? "Edit Workout" : "Add New Workout"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="mb-4">
              <Label htmlFor="workout-date">Date and Time</Label>
              <Input
                id="workout-date"
                type="datetime-local"
                value={
                  selectedDate ? format(selectedDate, "yyyy-MM-dd'T'HH:mm") : ""
                }
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="mb-2"
              />
              <Button
                onClick={() =>
                  setIsSelectingExistingWorkout(!isSelectingExistingWorkout)
                }
                variant="outline"
                className="w-full"
              >
                {isSelectingExistingWorkout
                  ? "Create New Workout"
                  : "Select Existing Workout"}
              </Button>
            </div>
            {isSelectingExistingWorkout ? (
              <div>
                <Workouts onSelectWorkout={handleSaveScheduledWorkout} />
              </div>
            ) : (
              <WorkoutBuilder
                existingWorkout={
                  selectedWorkout || {
                    title: "",
                    type: WorkoutType.RUN,
                    description: "",
                    items: [],
                  }
                }
                onSave={handleWorkoutBuilderSave}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditWorkoutOpen} onOpenChange={setIsEditWorkoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Workout</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={
                    selectedWorkout
                      ? moment(selectedWorkout.start).format("YYYY-MM-DD")
                      : ""
                  }
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    newDate.setHours(
                      selectedWorkout.start.getHours(),
                      selectedWorkout.start.getMinutes()
                    );
                    setSelectedWorkout({ ...selectedWorkout, start: newDate });
                  }}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="edit-time">Time</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={
                    selectedWorkout
                      ? moment(selectedWorkout.start).format("HH:mm")
                      : ""
                  }
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value
                      .split(":")
                      .map(Number);
                    const newDate = new Date(selectedWorkout.start);
                    newDate.setHours(hours, minutes);
                    setSelectedWorkout({ ...selectedWorkout, start: newDate });
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={selectedWorkout ? selectedWorkout.title : ""}
                onChange={(e) =>
                  setSelectedWorkout({
                    ...selectedWorkout,
                    title: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="edit-type">Workout Type</Label>
              <Select
                onValueChange={(value) =>
                  setSelectedWorkout({
                    ...selectedWorkout,
                    type: value as WorkoutType,
                  })
                }
                value={selectedWorkout ? selectedWorkout.type : ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select workout type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(WorkoutType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleEditWorkout}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useCallback, useState } from "react";
import moment from "moment";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { ScheduledWorkout, WorkoutType } from "@/types/workouts";
import { RiBikeLine, RiRunLine } from "react-icons/ri";
import { LiaSwimmerSolid } from "react-icons/lia";
import { getWorkoutColor } from "@/lib/workout-utils";
import { WorkoutBuilder } from "@/components/workout-builder";
import { format } from "date-fns";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const DnDCalendar = withDragAndDrop(Calendar);

const localizer = momentLocalizer(moment);

interface WorkoutCalendarProps {
  initialWorkouts: ScheduledWorkout[];
}

export function WorkoutCalendarComponent({
  initialWorkouts,
}: WorkoutCalendarProps) {
  const [workouts, setWorkouts] = useState(initialWorkouts);
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    title: "",
    type: WorkoutType.RUN,
    description: "",
    items: [],
    start: new Date(),
    end: new Date(),
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedWorkout, setSelectedWorkout] = useState<any | null>(null);
  const [isEditWorkoutOpen, setIsEditWorkoutOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSelectingExistingWorkout, setIsSelectingExistingWorkout] =
    useState(false);

  // const handleAddWorkout = (workout: Workout) => {
  //   const scheduledWorkout: ScheduledWorkout = {
  //     ...workout,
  //     id: workouts.length + 1,
  //     scheduledAt: newWorkout.start,
  //   };
  //   setWorkouts([...workouts, scheduledWorkout]);
  //   setIsAddingWorkout(false);
  //   setNewWorkout({
  //     title: "",
  //     type: WorkoutType.RUN,
  //     description: "",
  //     items: [],
  //     start: new Date(),
  //     end: new Date(),
  //   });
  // };

  const DayCell = ({ date }: { date: Date }) => {
    const handleAddWorkout = () => {
      setNewWorkout({
        ...newWorkout,
        start: date,
        end: new Date(date.getTime() + 60 * 60 * 1000), // Set end time to 1 hour after start
      });
      setIsAddingWorkout(true);
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
    setIsAddingWorkout(true);
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
      toolbar.onNavigate("prev", newDate);
    };

    const goToNext = () => {
      const newDate = new Date(toolbar.date);
      newDate.setMonth(newDate.getMonth() + 1);
      toolbar.onNavigate("next", newDate);
    };

    const goToCurrent = () => {
      const now = new Date();
      toolbar.onNavigate("current", now);
    };

    const handleMonthChange = (value: string) => {
      const newDate = new Date(toolbar.date);
      newDate.setMonth(parseInt(value));
      toolbar.onNavigate("date", newDate);
    };

    const handleYearChange = (value: string) => {
      const newDate = new Date(toolbar.date);
      newDate.setFullYear(parseInt(value));
      toolbar.onNavigate("date", newDate);
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

  const EventComponent = ({ event }: { event: any }) => {
    const getIcon = () => {
      switch (event.type) {
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

    const colorClass = getWorkoutColor(event.type as WorkoutType);

    return (
      <div className={`p-1 rounded ${colorClass}`}>
        {getIcon()}
        <span>{event.title}</span>
      </div>
    );
  };

  const handleSaveScheduledWorkout = async (workoutId: number) => {
    if (!selectedDate) return;

    try {
      const response = await fetch("/api/scheduled-workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workoutId,
          scheduledAt: selectedDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save scheduled workout");
      }

      const savedScheduledWorkout = await response.json();
      // Update the workouts state with the new scheduled workout
      setWorkouts([...workouts, savedScheduledWorkout]);
      setIsAddingWorkout(false);
      toast.success("Workout scheduled successfully");
    } catch (error) {
      console.error("Error saving scheduled workout:", error);
      toast.error("Failed to schedule workout");
    }
  };

  return (
    <div className="h-screen p-4 bg-background flex">
      <div
        className={`flex-grow transition-all duration-300 ${
          isAddingWorkout ? "mr-96" : ""
        }`}
      >
        <h1 className="text-2xl font-bold mb-4">Workout Calendar</h1>
        <DnDCalendar
          localizer={localizer}
          events={workouts}
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
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          className="custom-calendar"
          onSelectEvent={handleSelectEvent}
        />
      </div>
      {isAddingWorkout && (
        <div className="w-96 h-full fixed right-0 top-0 bg-background border-l border-border p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Add New Workout</h2>
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
              {/* Implement existing workout selection UI here */}
              <p>Existing workout selection UI to be implemented</p>
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
            />
          )}
          <Button
            onClick={() => setIsAddingWorkout(false)}
            variant="outline"
            className="mt-4"
          >
            Cancel
          </Button>
        </div>
      )}
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

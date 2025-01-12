"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { useForm } from "react-hook-form";
import { Phase } from "@/types/skeleton";
import { useState, useEffect } from "react";
import { addDays, isWithinInterval, format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface PhaseDialogProps {
  onAddPhase: (phase: Phase) => void;
  trigger?: React.ReactNode;
  defaultValues?: {
    startDate: string;
    endDate: string;
  };
  existingPhases: Phase[];
  scheduleStartDate: string;
  scheduleEndDate: string;
}

const phaseSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    startDate: z.string(),
    endDate: z.string(),
    objective: z.string(),
    weeks: z.array(z.any()),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return start <= end;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

export function PhaseDialog({
  onAddPhase,
  trigger,
  defaultValues,
  existingPhases,
  scheduleStartDate,
  scheduleEndDate,
}: PhaseDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<number | null>(null);
  const [availableRanges, setAvailableRanges] = useState<
    { start: Date; end: Date }[]
  >([]);

  // Initialize available ranges when dialog opens
  useEffect(() => {
    if (open) {
      setAvailableRanges(getAvailableDateRanges());
      setSelectedRange(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Find available date ranges
  const getAvailableDateRanges = () => {
    const sortedPhases = [...existingPhases]
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      )
      .filter((phase) => phase.startDate && phase.endDate); // Filter out invalid phases

    const ranges: { start: Date; end: Date }[] = [];
    let currentDate = new Date(scheduleStartDate);
    const scheduleEnd = new Date(scheduleEndDate);

    // Handle case with no phases
    if (sortedPhases.length === 0) {
      ranges.push({ start: currentDate, end: scheduleEnd });
      return ranges;
    }

    // Check for gap before first phase
    const firstPhase = sortedPhases[0];
    if (currentDate < new Date(firstPhase.startDate)) {
      ranges.push({
        start: currentDate,
        end: new Date(firstPhase.startDate),
      });
    }

    // Check for gaps between phases
    for (let i = 0; i < sortedPhases.length - 1; i++) {
      const currentPhaseEnd = new Date(sortedPhases[i].endDate);
      const nextPhaseStart = new Date(sortedPhases[i + 1].startDate);

      if (addDays(currentPhaseEnd, 1) < nextPhaseStart) {
        ranges.push({
          start: addDays(currentPhaseEnd, 1),
          end: addDays(nextPhaseStart, -1),
        });
      }
    }

    // Check for gap after last phase
    const lastPhase = sortedPhases[sortedPhases.length - 1];
    const lastPhaseEnd = new Date(lastPhase.endDate);
    if (addDays(lastPhaseEnd, 1) < scheduleEnd) {
      ranges.push({
        start: addDays(lastPhaseEnd, 1),
        end: scheduleEnd,
      });
    }

    return ranges;
  };

  const isDateAvailable = (date: Date) => {
    return availableRanges.some((range) =>
      isWithinInterval(date, { start: range.start, end: range.end })
    );
  };

  const form = useForm<Phase>({
    resolver: zodResolver(phaseSchema),
    defaultValues: {
      name: "",
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      objective: "",
      weeks: [],
    },
  });

  const onSubmit = (data: Phase) => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    // Check if the entire date range is available
    const isStartValid = isDateAvailable(startDate);
    const isEndValid = isDateAvailable(endDate);
    const isRangeValid = availableRanges.some(
      (range) =>
        isWithinInterval(startDate, { start: range.start, end: range.end }) &&
        isWithinInterval(endDate, { start: range.start, end: range.end })
    );

    if (!isStartValid || !isEndValid || !isRangeValid) {
      form.setError("startDate", {
        message: "Selected dates must be within available ranges",
      });
      return;
    }

    onAddPhase(data);
    setOpen(false);
    form.reset();
  };

  const handleRangeClick = (index: number) => {
    const range = availableRanges[index];
    form.setValue("startDate", range.start.toISOString());
    form.setValue("endDate", range.end.toISOString());
    setSelectedRange(index);
  };

  if (availableRanges.length === 0) {
    return null; // Don't show the dialog if no dates are available
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline">Add Phase</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Training Phase</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground mb-4">
          Available date ranges:
          <ul className="mt-1 space-y-2">
            {availableRanges.map((range, index) => (
              <li key={index}>
                <Button
                  type="button"
                  variant={selectedRange === index ? "secondary" : "outline"}
                  className={`w-full text-left ${
                    selectedRange === index ? "bg-secondary" : ""
                  }`}
                  onClick={() => handleRangeClick(index)}
                >
                  {format(range.start, "MMM d, yyyy")} -{" "}
                  {format(range.end, "MMM d, yyyy")}
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phase Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Base Building" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={new Date(field.value)}
                        onDateChange={(date) => {
                          field.onChange(date?.toISOString() ?? "");
                          setSelectedRange(null); // Clear selection when manually changing dates
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={new Date(field.value)}
                        onDateChange={(date) => {
                          field.onChange(date?.toISOString() ?? "");
                          setSelectedRange(null); // Clear selection when manually changing dates
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="objective"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objective</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Build aerobic base" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Phase</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

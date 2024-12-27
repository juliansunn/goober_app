"use client";

import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkoutType } from "@/types/workouts";
import { DatePicker } from "@/components/ui/date-picker";
import { MarkdownInput } from "@/components/markdown-input";
import { Card, CardContent } from "@/components/ui/card";
import { WorkoutSkeletonFormData } from "@/types/skeleton";
import { addDays } from "date-fns";

interface BasicDetailsSectionProps {
  control: Control<WorkoutSkeletonFormData>;
}

export function BasicDetailsSection({ control }: BasicDetailsSectionProps) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter workout title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workout Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select workout type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={WorkoutType.RUN}>Run</SelectItem>
                  <SelectItem value={WorkoutType.BIKE}>Bike</SelectItem>
                  <SelectItem value={WorkoutType.SWIM}>Swim</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <DatePicker
                    date={new Date(field.value)}
                    onDateChange={(date) => {
                      const newDate = date?.toISOString() ?? "";
                      field.onChange(newDate);
                    }}
                    fromDate={new Date()}
                    toDate={new Date(control._formValues.endDate)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Race Date</FormLabel>
                <FormControl>
                  <DatePicker
                    date={new Date(field.value)}
                    onDateChange={(date) => {
                      const newDate = date?.toISOString() ?? "";
                      field.onChange(newDate);
                    }}
                    fromDate={addDays(
                      new Date(control._formValues.startDate),
                      1
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <MarkdownInput
                  value={field.value}
                  onChange={field.onChange}
                  isEditable={true}
                  label="Description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

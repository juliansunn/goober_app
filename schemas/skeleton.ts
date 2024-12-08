import z from "zod";

import { DurationType } from "@/types/workouts";
import { PhaseObjective, WeekFocus } from "@/types/skeleton";
export const DurationTypeSchema = z
  .enum(Object.values(DurationType) as [DurationType, ...DurationType[]])
  .describe("Numeric value of planned training volume (e.g., 30)");

export const PhaseObjectiveSchema = z
  .enum(Object.values(PhaseObjective) as [PhaseObjective, ...PhaseObjective[]])
  .describe("High-level phase objective or training focus.");

export const WeekFocusSchema = z
  .enum(Object.values(WeekFocus) as [WeekFocus, ...WeekFocus[]])
  .describe("High-level weekly focus to guide future workout generation.");

export const workoutSkeletonSchema = z.object({
  schedule: z.object({
    description: z
      .string()
      .describe(
        "Overall description of the training plan, including the athlete's experience level, goals, and any other relevant details.  This will be used to guide the generation of workouts."
      ),
    startDate: z.string().describe("Training start date in YYYY-MM-DD format"),
    endDate: z
      .string()
      .describe("Training end date in YYYY-MM-DD format, often the event date"),

    phases: z
      .array(
        z.object({
          name: z
            .string()
            .describe(
              "Name of the training phase (e.g. 'Base', 'Build', 'Peak', 'Taper')"
            ),
          startDate: z.string().describe("Phase start date (YYYY-MM-DD)"),
          endDate: z.string().describe("Phase end date (YYYY-MM-DD)"),
          objective: PhaseObjectiveSchema,

          weeks: z
            .array(
              z.object({
                weekNumber: z
                  .number()
                  .int()
                  .describe("Relative week number within the entire schedule"),
                startDate: z.string().describe("Week start date (YYYY-MM-DD)"),
                endDate: z.string().describe("Week end date (YYYY-MM-DD)"),
                focus: WeekFocusSchema,
                description: z
                  .string()
                  .describe(
                    "1-2 sentence description providing additional guidance for this week"
                  ),
                volumeValue: z.number().describe("Planned volume value"),
                volumeType: DurationTypeSchema,
              })
            )
            .describe("List of weeks in this phase with minimal details"),
        })
      )
      .describe("List of training phases making up the overall schedule"),
  }),
});

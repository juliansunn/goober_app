import z from "zod";

import { PhaseObjective, WeekFocus } from "@/types/skeleton";
import { DurationType, WorkoutType } from "@/types/workouts";
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
    startDate: z
      .string()
      .optional()
      .describe("Training start date in YYYY-MM-DD format"),
    endDate: z
      .string()
      .optional()
      .describe("Training end date in YYYY-MM-DD format, often the event date"),

    phases: z
      .array(
        z.object({
          id: z
            .number()
            .optional()
            .describe(
              "The id of the phase. When creating a new workout schedule through the API, this should not be returned."
            ),
          name: z
            .string()
            .describe(
              "Name of the training phase (e.g. 'Base', 'Build', 'Peak', 'Taper')"
            ),
          startDate: z.string().describe("Phase start date (YYYY-MM-DD)"),
          endDate: z.string().describe("Phase end date (YYYY-MM-DD)"),
          description: z
            .string()
            .describe(
              "1-2 sentence description providing additional guidance for this phase"
            ),
          objective: PhaseObjectiveSchema,

          weeks: z
            .array(
              z.object({
                id: z
                  .number()
                  .optional()
                  .describe(
                    "The id of the week. When creating a new workout schedule through the API, this should not be returned."
                  ),
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
                volumeDistance: z
                  .object({
                    value: z.number().describe("Planned distance value"),
                    unit: z
                      .enum(["km", "miles"])
                      .describe("Distance unit (km or miles)"),
                  })
                  .describe("Planned volume in distance"),
                volumeDuration: z
                  .object({
                    minutes: z.number().describe("Planned duration in minutes"),
                  })
                  .describe("Planned volume in minutes"),
              })
            )
            .describe("List of weeks in this phase with minimal details"),
        })
      )
      .describe("List of training phases making up the overall schedule"),
  }),
});

export const WorkoutScheduleFormDataSchema = z.object({
  id: z
    .number()
    .optional()
    .describe(
      "The id of the workout skeleton. When creating a new workout schedule through the API, this should not be returned."
    ),
  scheduleTitle: z.string().describe("Title of the workout skeleton"),
  startDate: z.string().describe("Training start date in YYYY-MM-DD format"),
  raceDate: z
    .string()
    .describe("Training end date in YYYY-MM-DD format, often the event date"),
  raceName: z.string().describe("The name of the race"),
  raceType: z
    .nativeEnum(WorkoutType)
    .describe("The types of workouts to generate"),
  raceDistance: z.string().describe("The distance of the race"),
  customDistance: z.string().describe("The custom distance of the race"),
  customDistanceUnit: z.string().describe("The unit of the custom distance"),
  restDay: z.string().describe("The rest day of the race"),
  experienceLevel: z.string().describe("The experience level of the athlete"),
  goalTimeHours: z.string().describe("The goal time in hours"),
  goalTimeMinutes: z.string().describe("The goal time in minutes"),
  goalTimeSeconds: z.string().describe("The goal time in seconds"),
  additionalNotes: z
    .string()
    .describe("Additional notes for the workout skeleton"),
  schedule: workoutSkeletonSchema.shape.schedule,
});

export const WorkoutSkeletonFormDataSchema = z.object({
  title: z.string().describe("Title of the workout skeleton"),
  type: z.nativeEnum(WorkoutType).describe("The types of workouts to generate"),
  schedule: workoutSkeletonSchema,
});

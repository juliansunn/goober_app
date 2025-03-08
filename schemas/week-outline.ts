import { z } from "zod";

export const weekOutlineSchema = z.object({
  detailedDescription: z
    .string()
    .describe("A detailed description of the week.  "),
  days: z.array(
    z.object({
      dayNumber: z.number().describe("The day number of the week"),
      dayName: z.string().describe("The name of the day"),
      date: z.string().describe("The date of the day"),
      dayDescription: z.string().describe("A description of the day"),
      workoutType: z.string().describe("The type of workout for the day"),
      intensityLevel: z.number().describe("The intensity level of the day"),
      isRestDay: z.boolean().describe("Whether the day is a rest day"),
    })
  ),
});

export type WeekOutline = z.infer<typeof weekOutlineSchema>;

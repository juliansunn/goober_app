import { StravaActivity } from "./strava";
import { ScheduledWorkout } from "./workouts";

export type CalendarItem = {
  itemType: "scheduledWorkout" | "stravaActivity";
  item: ScheduledWorkout | StravaActivity;
};

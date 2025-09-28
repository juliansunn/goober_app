import { StravaActivity } from "./strava";
import { ScheduledWorkout } from "./workouts";

export type CalendarItem =
  | {
      itemType: "scheduledWorkout";
      item: ScheduledWorkout;
    }
  | {
      itemType: "stravaActivity";
      item: StravaActivity;
    }

import { StravaActivity } from "./strava";
import { GeneratedScheduledWorkout, ScheduledWorkout } from "./workouts";

export type CalendarItem =
  | {
      itemType: "scheduledWorkout";
      item: ScheduledWorkout;
    }
  | {
      itemType: "stravaActivity";
      item: StravaActivity;
    }
  | {
      itemType: "generatedScheduledWorkout";
      item: GeneratedScheduledWorkout;
    };

import { Session } from "next-auth";

export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  timezone: string;
}

export interface ExtendedSession extends Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

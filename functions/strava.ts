import { StravaActivity, ExtendedSession } from "@/types";
import { getServerSession } from "next-auth";
import { refreshStravaToken } from "@/lib/strava/refresh-token";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getStravaActivities({
  after,
  before,
  page,
  per_page,
}: {
  after: number;
  before: number;
  page: number;
  per_page: number;
}): Promise<StravaActivity[]> {
  const response = await fetch(
    `/api/strava/activities?after=${after}&before=${before}&page=${page}&per_page=${per_page}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Strava activities");
  }

  return response.json();
}

export async function getStravaAccessToken(): Promise<string | null> {
  let session = (await getServerSession(authOptions)) as ExtendedSession;
  if (!session) {
    return null;
  }

  if (Date.now() / 1000 > session.expiresAt) {
    const refreshedSession = await refreshStravaToken(session);
    if (!refreshedSession) {
      return null;
    }
    session = refreshedSession;
  }
  return session.accessToken;
}

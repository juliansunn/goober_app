import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { refreshStravaToken } from "@/lib/strava/refresh-token";
import { ExtendedSession } from "@/types/strava";
import { authOptions } from "@/lib/next-auth/utils";

export async function GET(req: Request, res: NextResponse) {
  let session = (await getServerSession(authOptions)) as ExtendedSession;
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Check if token needs refreshing
  if (Date.now() / 1000 > session.expiresAt) {
    const refreshedSession = await refreshStravaToken(session);
    if (!refreshedSession) {
      return new Response("Token refresh failed", { status: 401 });
    }
    session = refreshedSession;
  }
  const { accessToken } = session;

  // Get URL parameters
  const url = new URL(req.url);
  const before = url.searchParams.get("before");
  const after = url.searchParams.get("after");
  const page = url.searchParams.get("page") || "1";
  const perPage = url.searchParams.get("per_page") || "30";

  // Construct Strava API URL with parameters
  const stravaUrl = new URL("https://www.strava.com/api/v3/athlete/activities");
  if (before) stravaUrl.searchParams.append("before", before);
  if (after) stravaUrl.searchParams.append("after", after);
  stravaUrl.searchParams.append("page", page);
  stravaUrl.searchParams.append("per_page", perPage);

  // Call Strava's API
  const stravaResponse = await fetch(stravaUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!stravaResponse.ok) {
    return NextResponse.json(
      {
        error: `Error fetching data from Strava: ${stravaResponse.statusText}`,
      },
      { status: 500 }
    );
  }

  const data = await stravaResponse.json();
  return NextResponse.json(data, { status: 200 });
}

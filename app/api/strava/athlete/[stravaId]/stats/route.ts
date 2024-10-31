import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getStravaAccessToken } from "@/functions/strava";
import { getOrCreateUser } from "@/app/actions/user";

export async function GET(
  request: NextRequest,
  { params }: { params: { stravaId: string } }
) {
  const { stravaId } = params;
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const user = await getOrCreateUser(clerkUser.id, {
      username: clerkUser.username,
      name: `${clerkUser.firstName} ${clerkUser.lastName}`,
      email: clerkUser.emailAddresses[0]?.emailAddress,
    });
    const accessToken = await getStravaAccessToken();

    const response = await fetch(
      `https://www.strava.com/api/v3/athletes/${stravaId}/stats`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Strava API error: ${response.statusText}`);
    }

    const athleteStats = await response.json();

    return NextResponse.json(athleteStats);
  } catch (error) {
    console.error("Error fetching Strava athlete stats:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

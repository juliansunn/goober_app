import { ExtendedSession } from "@/types/strava";
export async function refreshStravaToken(
  session: ExtendedSession
): Promise<ExtendedSession | null> {
  const refreshToken = session.refreshToken;
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  try {
    const response = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();

    // Update session with new tokens
    const updatedSession: ExtendedSession = {
      ...session,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
    };

    return updatedSession;
  } catch (error) {
    console.error("Error refreshing Strava token:", error);
    return null;
  }
}

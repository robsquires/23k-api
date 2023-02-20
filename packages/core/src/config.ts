const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_CLIENT_REDIRECT_URI } =
  process.env as {
    STRAVA_CLIENT_ID: string;
    STRAVA_CLIENT_SECRET: string;
    STRAVA_CLIENT_REDIRECT_URI: string;
  };

export const config = {
  oauth: {
    host: "https://www.strava.com/",
    id: STRAVA_CLIENT_ID,
    secret: STRAVA_CLIENT_SECRET,
    scope: "read,activity:read_all",
    redirect_uri: STRAVA_CLIENT_REDIRECT_URI,
  },
};

function fromEnv(key: string) {
  const env = process.env[key];
  if (env === undefined) {
    throw new Error(`process.env.${key} not found`);
  }
  return env;
}

export const config = {
  oauth: {
    host: "https://www.strava.com/",
    id: fromEnv("STRAVA_CLIENT_ID"),
    secret: fromEnv("STRAVA_CLIENT_SECRET"),
    scope: "read,activity:read_all",
    redirect_uri: fromEnv("STRAVA_CLIENT_REDIRECT_URI"),
  },
};

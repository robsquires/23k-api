import { default as strava } from "strava-v3";
import { StravaAccessToken } from "./strava-token";

export async function getAthlete(token: StravaAccessToken) {
  strava.client(token.access_token);
  return await strava.athlete.get({});
}

export async function getActivity(
  token: StravaAccessToken,
  activityId: string
) {
  strava.client(token.access_token);

  const activity = await strava.activities.get({
    id: activityId,
    include_all_efforts: false,
  });

  // const streams = await strava.streams.activity({
  //   id: activityId,
  //   types: "heartrate,watts",
  // });

  return {
    activityId,
    type: activity.type,
    distance: activity.distance,
    start_date: activity.start_date,
    calories: activity.calories,
    max_watts: activity.max_watts,
  };
}

import { default as strava } from "strava-v3";
import { StravaAccessToken } from "./strava-token";

export async function getAthlete(token: StravaAccessToken) {
  strava.client(token.access_token);
  return await strava.athlete.get({});
}

type Activity = {
  type: string
  distance: number,
  start_date: number,
  calories: number,
  max_watts: number
}

export async function getActivity(
  token: StravaAccessToken,
  activityId: number
) {
  strava.client(token.access_token);

  const activity: Activity = await strava.activities.get({
    id: activityId,
    include_all_efforts: false,
  });

  // const streams = await strava.streams.activity({
  //   id: activityId,
  //   types: "heartrate,watts",
  // });

  return {
    type: activity.type,
    distance: activity.distance,
    start_date: activity.start_date,
    calories: activity.calories,
    max_watts: activity.max_watts,
  };
}

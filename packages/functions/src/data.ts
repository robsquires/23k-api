import { ApiHandler } from "sst/node/api";
import { default as strava } from "strava-v3";

import { s3, stravaToken } from "@23k-api/core/services";

type ActivityData = {
  userId: string;
  type: string;
  distance: string;
  start_date: string;
  calories: string;
};

export const handler = ApiHandler(async (_evt) => {
  const users = await s3.users.read("users.json");

  const requests = await Promise.all(
    users.map(async ({ userId, athleteId }) => {
      return {
        userId,
        athleteId,
        token: await stravaToken.getToken(userId),
      };
    })
  );

  const rawData = await Promise.all(
    requests.map(async ({ userId, athleteId, token }) => {
      // set token for client
      strava.client(token.access_token);

      const activities = await strava.athlete.listActivities({
        athleteId,
        after: new Date("2023-01-10:00:00:00").getTime() / 1000,
      });

      const detailedActivities = await Promise.all(
        activities.map(async ({ id }: { id: string }) => {
          return {
            activity: await strava.activities.get({
              id,
              include_all_efforts: false,
            }),
            // streams: await strava.streams.activity({
            //   id,
            //   types: "heartrate,watts",
            // }),
          };
        })
      );
      return {
        userId,
        activities: detailedActivities,
      };
    })
  );

  const processed = rawData.reduce<ActivityData[]>(
    (acc, { userId, activities }) => {
      const processedActivities = activities.map(
        ({ activity, zones, streams }) => ({
          userId,
          type: activity.type,
          distance: activity.distance,
          start_date: activity.start_date,
          calories: activity.calories,
          zones,
          streams,
        })
      );
      console.log(processedActivities);
      return acc.concat(processedActivities);
    },
    []
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ data: processed }),
  };
});

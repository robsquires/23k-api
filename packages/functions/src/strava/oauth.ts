import { ApiHandler } from "sst/node/api";
import * as strava from "@23k-api/core/strava";
import { oAuth, stravaToken, s3 } from "@23k-api/core/services";
import { config } from "@23k-api/core/config";

const { scope, redirect_uri } = config.oauth;

export const authorizeHandler = ApiHandler(async (evt) => {
  const uri = oAuth.authorizeURL({
    redirect_uri,
    scope,
  });

  if (evt.queryStringParameters?.redirect) {
    return {
      statusCode: 303,
      headers: { location: uri },
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ location: uri }),
  };
});

export const callbackHandler = ApiHandler(async (evt) => {
  const { code, scope } = evt.queryStringParameters as {
    code: string;
    scope: string;
  };

  const userId = "Rob";

  const token = await stravaToken.addToken(
    { code, scope, redirect_uri },
    userId
  );

  // configure client for athlete
  const athlete = await strava.getAthlete(token);

  const users = await s3.users.read("users.json", []);
  await s3.users.write(`users.json`, [
    ...users,
    { athleteId: athlete.id, userId },
  ]);

  return athlete;
});

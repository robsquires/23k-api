import { ApiHandler } from "sst/node/api";
import * as strava from "@23k-api/core/strava";
import { oAuth, stravaToken, s3, sqs } from "@23k-api/core/services";
import { config } from "@23k-api/core/config";
import { Queue } from "sst/node/queue";

const { scope, redirect_uri } = config.oauth;

export const authUri = ApiHandler(async (_evt) => {
  const uri = oAuth.authorizeURL({
    redirect_uri,
    scope,
  });

  return {
    statusCode: 303,
    headers: {
      location: uri,
    },
  };
});

export const authCallback = ApiHandler(async (_evt) => {
  const { code, scope } = _evt.queryStringParameters as {
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

export const webHook = ApiHandler(async (_evt) => {
  const method = _evt.requestContext.http.method;

  // this is strava checking the webhook is hooked up
  if (method === "GET") {
    console.log('GET /webhook',  _evt.queryStringParameters)
    return {
      statusCode: 200,
      body: JSON.stringify({
        "hub.challenge": _evt.queryStringParameters?.["hub.challenge"],
      }),
    };
  }

  const data = JSON.parse(_evt.body || "{}");
  console.log(`Received event for subscription:${data?.subscription_id}`);
  console.debug("Received event:", data);

  const users = await s3.users.read("users.json");
  const { userId } =
    users.find(({ athleteId }) => athleteId === data?.owner_id) || {};

  if (!userId) {
    console.log(`Could not lookup userId for athlete ${data?.owner_id}`);
    return { statusCode: 200, body: "skipped" };
  }

  await sqs
    .sendMessage({
      // Get the queue url from the environment variable
      QueueUrl: Queue.Queue.queueUrl,
      MessageBody: JSON.stringify({
        userId,
        data,
      }),
    })
    .promise();
  return { statusCode: 200, body: "ok" };
});

type Record = { body:string }
type Event = { userId:string, data: any }
export const eventListener = async (_evt: { Records: Record[] }) => {
  await Promise.all(
    _evt.Records
      .map((record) : Event => JSON.parse(record.body))
      .filter(({data}) => data.aspect_type === 'create')
      .map(async ({ userId, data }) => {
        const token = await stravaToken.getToken(userId);
        // @todo get typing working on data
        const activity = await strava.getActivity(token, data.object_id);

        console.log(activity);
        // save to GQL
      })
    );
};
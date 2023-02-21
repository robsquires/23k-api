import { ApiHandler } from "sst/node/api";
import { s3 } from "@23k-api/core/services";
import { Queue } from "sst/node/queue";

import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
const sqs = new SQSClient({});

export const getHandler = ApiHandler(async (evt) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      "hub.challenge": evt.queryStringParameters?.["hub.challenge"],
    }),
  };
});

export const postHandler = ApiHandler(async (evt) => {
  const data = JSON.parse(evt.body || "{}");
  console.log(`Received event for subscription:${data?.subscription_id}`);
  console.debug("Received event:", data);

  const users = await s3.users.read("users.json");
  const user = users.find(({ athleteId }) => athleteId === data?.owner_id);

  if (!user) {
    console.log(`Could not lookup userId for athlete ${data?.owner_id}`);
    return { statusCode: 200, body: "skipped" };
  }

  await sqs.send(
    new SendMessageCommand({
      // Get the queue url from the environment variable
      QueueUrl: Queue.Queue.queueUrl,
      MessageBody: JSON.stringify({
        userId: user.userId,
        data,
      }),
    })
  );
  return { statusCode: 200, body: "ok" };
});

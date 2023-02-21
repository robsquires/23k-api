import * as strava from "@23k-api/core/strava";
import { stravaToken } from "@23k-api/core/services";

import { StravaWebhookEventSchema } from "@23k-api/core/models";

type Record = { body: string; messageId: string };

export const handler = async (evt: { Records: Record[] }) => {
  const failedRecords: string[] = [];

  await Promise.all(
    evt.Records.map(async (record) => {
      try {
        const event = StravaWebhookEventSchema.parse(JSON.parse(record.body));
        const token = await stravaToken.getToken(event.userId);
        const activity = await strava.getActivity(token, event.data.object_id);
        console.log(activity);
      } catch (error) {
        console.error("Failed to process record", record, error);
        failedRecords.push(record.messageId);
      }
      // save to GQL
    })
  );
  return {
    batchItemFailures: failedRecords.map((messageId) => ({
      itemIdentifier: messageId,
    })),
  };
};

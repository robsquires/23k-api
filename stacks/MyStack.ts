import { StackContext, Api, Bucket, Queue } from "sst/constructs";

export function API({ stack }: StackContext) {
  const deadLetterQueue = new Queue(stack, "dlq", {});
  const queue = new Queue(stack, "Queue", {
    consumer: {
      function: "packages/functions/src/event-listener.handler",
      cdk: {
        eventSource: {
          reportBatchItemFailures: true,
        },
      },
    },
    cdk: {
      queue: {
        deadLetterQueue: {
          maxReceiveCount: 2,
          queue: deadLetterQueue.cdk.queue,
        },
      },
    },
  });
  const api = new Api(stack, "api", {
    defaults: {
      function: {
        bind: [queue],
        environment: {
          STRAVA_CLIENT_ID: process.env.STRAVA_CLIENT_ID || "",
          STRAVA_CLIENT_SECRET: process.env.STRAVA_CLIENT_SECRET || "",
          STRAVA_CLIENT_REDIRECT_URI:
            process.env.STRAVA_CLIENT_REDIRECT_URI || "",
        },
      },
    },

    routes: {
      "GET /data": "packages/functions/src/data.handler",
      "GET /strava/oauth/authorize":
        "packages/functions/src/strava/oauth.authorizeHandler",
      "GET /strava/oauth/callback":
        "packages/functions/src/strava/oauth.callbackHandler",
      "POST /strava/webhook":
        "packages/functions/src/strava/webhook.postHandler",
      "GET /strava/webhook": "packages/functions/src/strava/webhook.getHandler",
    },
  });

  const bucket = new Bucket(stack, "Bucket", {
    cdk: {
      bucket: {
        bucketName: "23k-data",
      },
    },
  });

  queue.attachPermissions(["s3"]);
  api.attachPermissions([bucket, "s3:*"]);
  api.attachPermissions([queue, "sqs:*"]);

  stack.addOutputs({
    ApiEndpoint: api.url,
    S3Bucket: bucket.bucketName,
  });
}

import { StackContext, Api, Bucket, Queue } from "sst/constructs";

export function API({ stack }: StackContext) {
  const deadLetterQueue = new Queue(stack, "dlq", {});
  const queue = new Queue(stack, "Queue", {
    consumer: {
      function: "packages/functions/src/strava.eventListener",
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
      "GET /": "packages/functions/src/lambda.handler",
      "GET /data": "packages/functions/src/data.handler",
      "GET /strava/init": "packages/functions/src/strava.authUri",
      "GET /strava/callback": "packages/functions/src/strava.authCallback",
      "POST /strava/webhook": "packages/functions/src/strava.webHook",
      "GET /strava/webhook": "packages/functions/src/strava.webHook",
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

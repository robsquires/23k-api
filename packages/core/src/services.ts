import { AuthorizationCode } from "simple-oauth2";
import { config } from "./config";
import { StravaAccessToken, StravaToken } from "@23k-api/core/src/strava-token";
import { S3Json } from "@23k-api/core/src/s3";
import AWS from "aws-sdk";

enum AuthorizationMethod {
  HEADER = "header",
  BODY = "body",
}

const oauthConfig = {
  client: {
    id: config.oauth.id,
    secret: config.oauth.secret,
  },
  auth: {
    tokenHost: config.oauth.host,
  },
  options: {
    authorizationMethod: AuthorizationMethod.BODY,
  },
};

const oAuth = new AuthorizationCode(oauthConfig);

export type User = {
  userId: string;
  athleteId: string;
};

export type StravaWebhookEvent = {
  userId: string;
  data: any;
};

const s3 = {
  tokens: new S3Json<StravaAccessToken>("23k-data"),
  users: new S3Json<User[]>("23k-data"),
  events: new S3Json<StravaWebhookEvent>("23k-data"),
};
const stravaToken = new StravaToken(s3.tokens, oAuth);

const sqs = new AWS.SQS();

export { oAuth, s3, stravaToken, sqs };

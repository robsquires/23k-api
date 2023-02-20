import { AuthorizationCode, AuthorizationTokenConfig } from "simple-oauth2";
import { S3Json } from "./s3";

export type StravaAccessToken = {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_at: string;
  expires_in: number;
};

export class StravaToken {
  s3: S3Json<StravaAccessToken>;
  oauthClient: AuthorizationCode;
  constructor(s3: S3Json<StravaAccessToken>, oauthClient: AuthorizationCode) {
    this.s3 = s3;
    this.oauthClient = oauthClient;
  }

  async addToken(tokenParams: AuthorizationTokenConfig, userId: string) {
    const accessToken = await this.oauthClient.getToken(tokenParams);
    const token = accessToken.token as StravaAccessToken;
    await this.s3.write(`tokens/${userId}`, token);
    return token;
  }

  async getToken(userId: string): Promise<StravaAccessToken> {
    let accessToken = this.oauthClient.createToken(
      await this.s3.read(`tokens/${userId}`)
    );
    if (accessToken.expired()) {
      accessToken = await accessToken.refresh();
    }

    const token = accessToken.token as StravaAccessToken;
    await this.s3.write(`tokens/${userId}`, token);
    return token;
  }
}

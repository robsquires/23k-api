import { S3 } from "aws-sdk";
const s3 = new S3();

export class S3Json<T> {
  Bucket: string;
  constructor(Bucket: string) {
    this.Bucket = Bucket;
  }
  write(Key: string, data: T) {
    return s3
      .putObject({
        Bucket: this.Bucket,
        Key,
        Body: Buffer.from(JSON.stringify(data), "utf8"),
        ContentType: "application/json",
      })
      .promise();
  }

  async read(Key: string, defaultValue?: any): Promise<T> {
    let result;
    try {
      result = await s3.getObject({ Bucket: this.Bucket, Key }).promise();
    } catch (err: any) {
      if (err.code === "NoSuchKey" && defaultValue) {
        return defaultValue;
      }
      throw err;
    }

    if (result && result.Body) {
      return JSON.parse(result.Body.toString());
    }

    throw new Error(`Could not find file at ${Key}`);
  }
}

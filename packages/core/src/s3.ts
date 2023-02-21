import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  NotFound,
} from "@aws-sdk/client-s3";
const s3 = new S3Client({});

export class S3Json<T> {
  Bucket: string;
  constructor(Bucket: string) {
    this.Bucket = Bucket;
  }
  async write(Key: string, data: T) {
    await s3.send(
      new PutObjectCommand({
        Bucket: this.Bucket,
        Key,
        Body: Buffer.from(JSON.stringify(data), "utf8"),
        ContentType: "application/json",
      })
    );
  }

  async read(Key: string, defaultValue?: T): Promise<T> {
    let response;
    try {
      response = await s3.send(
        new GetObjectCommand({ Bucket: this.Bucket, Key })
      );
    } catch (err) {
      if (err instanceof NotFound) {
        if (defaultValue) {
          return defaultValue;
        }
        console.log(`Could not find file at ${Key}`);
      }
      throw err;
    }

    if (response && response.Body) {
      return JSON.parse(await response.Body.transformToString());
    }

    throw new Error(`Error reading file at ${Key}`);
  }
}

import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3"

const S3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

const run = async () => {
  try {
    const params = {
      Bucket: process.env.R2_BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
            AllowedOrigins: ["*"],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    }
    
    await S3.send(new PutBucketCorsCommand(params))
    console.log("CORS configuration applied successfully to your R2 bucket.")
  } catch (error) {
    console.error("Error setting CORS:", error)
  }
}

run()

"use server"

import { supabase } from "@/lib/supabase"
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const S3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function generatePresignedUrl(fileName: string, contentType: string, size: number) {
  // Enforce Max 100MB
  if (size > 100 * 1024 * 1024) {
    throw new Error("File size must be less than 100MB")
  }

  // Generate unique ID and File Key
  const fileId = crypto.randomUUID()
  const fileKey = `${fileId}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: fileKey,
    ContentType: contentType,
  })

  // URL expires in 15 minutes
  const signedUrl = await getSignedUrl(S3, command, { expiresIn: 900 })

  return { signedUrl, fileKey }
}

export async function completeFileShare(fileName: string, fileKey: string, size: number): Promise<string> {
  try {
    await cleanupExpiredFiles()

    let code = generateCode()
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      const { data: existing } = await supabase.from("shared_files").select("code").eq("code", code).single()
      if (!existing) break
      code = generateCode()
      attempts++
    }

    if (attempts >= maxAttempts) throw new Error("Unable to generate unique code")

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 2) // Auto-delete after 2 hours

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileKey}`

    const { error } = await supabase.from("shared_files").insert({
      code,
      file_name: fileName,
      file_url: publicUrl,
      size,
      expires_at: expiresAt.toISOString(),
    })

    if (error) {
      console.error("Supabase insert error:", error)
      throw new Error((error as any).message || "Failed to save file metadata")
    }

    return code
  } catch (error) {
    console.error("Error in completeFileShare:", error)
    throw error
  }
}

export async function getSharedFile(code: string) {
  try {
    await cleanupExpiredFiles()

    const { data, error } = await supabase
      .from("shared_files")
      .select("file_name, file_url, size, expires_at")
      .eq("code", code.toUpperCase())
      .single()

    if (error || !data) return null

    const now = new Date()
    const expiresAt = new Date(data.expires_at)

    if (now > expiresAt) {
      await deleteFile(code.toUpperCase())
      return null
    }

    // Generate a secure presigned GET URL for downloading
    const fileKey = data.file_url.split('/').pop()
    if (fileKey) {
        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: fileKey,
            ResponseContentDisposition: `attachment; filename="${data.file_name}"`
        })
        const signedUrl = await getSignedUrl(S3, command, { expiresIn: 3600 })
        data.file_url = signedUrl
    }

    return data
  } catch (error) {
    console.error("Error getting shared file:", error)
    return null
  }
}

async function deleteFile(code: string) {
  try {
    const { data } = await supabase.from("shared_files").select("file_url").eq("code", code).single()
    if (data && data.file_url) {
      const fileKey = data.file_url.split('/').pop()
      if (fileKey) {
        await S3.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: fileKey,
          })
        )
      }
    }
    await supabase.from("shared_files").delete().eq("code", code)
  } catch (e) {
    console.error("Error deleting file:", e)
  }
}

export async function cleanupExpiredFiles() {
  try {
    const now = new Date().toISOString()
    const { data: expiredFiles, error: fetchError } = await supabase
      .from("shared_files")
      .select("code, file_url")
      .lt("expires_at", now)

    if (fetchError) return

    for (const file of expiredFiles || []) {
      const fileKey = file.file_url.split('/').pop()
      if (fileKey) {
        try {
          await S3.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: fileKey }))
        } catch (e) {
            console.error("Failed to delete expired R2 object", e)
        }
      }
      await supabase.from("shared_files").delete().eq("code", file.code)
    }
  } catch (error) {
    console.error("Error in cleanupExpiredFiles:", error)
  }
}

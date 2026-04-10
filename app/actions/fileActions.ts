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

type ShareFileInput = {
  fileName: string
  fileKey: string
  size: number
}

type SharedFileResult = {
  file_name: string
  file_url: string
  size: number
  expires_at: string
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

export async function completeFileShare(files: ShareFileInput[]): Promise<string> {
  try {
    if (!files.length) {
      throw new Error("No files provided")
    }

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

    const payload = files.map((file) => ({
      code,
      file_name: file.fileName,
      file_url: `${process.env.R2_PUBLIC_URL}/${file.fileKey}`,
      size: file.size,
      expires_at: expiresAt.toISOString(),
    }))

    const { error } = await supabase.from("shared_files").insert(payload)

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

export async function getSharedFiles(code: string): Promise<SharedFileResult[] | null> {
  try {
    await cleanupExpiredFiles()

    const { data, error } = await supabase
      .from("shared_files")
      .select("file_name, file_url, size, expires_at")
      .eq("code", code.toUpperCase())
      .order("created_at", { ascending: true })

    if (error || !data || data.length === 0) return null

    const now = new Date()
    const activeFiles = data.filter((file) => now <= new Date(file.expires_at))

    if (!activeFiles.length) {
      await deleteFilesByCode(code.toUpperCase())
      return null
    }

    const filesWithSignedUrls = await Promise.all(activeFiles.map(async (file) => {
      // Generate secure presigned GET URLs for downloading
      const fileKey = file.file_url.split('/').pop()
      if (!fileKey) return file

        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: fileKey,
            ResponseContentDisposition: `attachment; filename="${file.file_name}"`
        })
        const signedUrl = await getSignedUrl(S3, command, { expiresIn: 3600 })
        return { ...file, file_url: signedUrl }
    }))

    return filesWithSignedUrls
  } catch (error) {
    console.error("Error getting shared file:", error)
    return null
  }
}

async function deleteFilesByCode(code: string) {
  try {
    const { data } = await supabase.from("shared_files").select("file_url").eq("code", code)
    for (const file of data || []) {
      const fileKey = file.file_url.split('/').pop()
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
      .select("id, file_url")
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
      await supabase.from("shared_files").delete().eq("id", file.id)
    }
  } catch (error) {
    console.error("Error in cleanupExpiredFiles:", error)
  }
}

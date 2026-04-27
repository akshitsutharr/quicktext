"use server"

import { supabase } from "@/lib/supabase"
import crypto from "crypto"

function generatePairingCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString() // 6-digit code
}

function generateSessionToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export async function createSession(durationMinutes: number = 30) {
  try {
    const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const pairingCode = generatePairingCode()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + durationMinutes)

    const sessionToken = generateSessionToken()

    const { data, error } = await supabase
      .from("pairing_sessions")
      .insert({
        session_id: sessionId,
        pairing_code: pairingCode,
        expires_at: expiresAt.toISOString(),
        device_tokens: [sessionToken],
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating session:", error)
      throw new Error("Failed to create session")
    }

    return {
      sessionId,
      pairingCode,
      sessionToken,
      expiresAt: expiresAt.toISOString(),
    }
  } catch (error) {
    console.error("Error in createSession:", error)
    throw error
  }
}

export async function joinSession(pairingCode: string) {
  try {
    const now = new Date().toISOString()
    
    // Find active session with this code
    const { data: session, error } = await supabase
      .from("pairing_sessions")
      .select("*")
      .eq("pairing_code", pairingCode)
      .gt("expires_at", now)
      .single()

    if (error || !session) {
      throw new Error("Invalid or expired pairing code")
    }

    // Limit devices (e.g., max 3)
    if (session.device_tokens && session.device_tokens.length >= 3) {
      throw new Error("Session is full (max 3 devices)")
    }

    const newToken = generateSessionToken()
    const updatedTokens = [...(session.device_tokens || []), newToken]

    const { error: updateError } = await supabase
      .from("pairing_sessions")
      .update({ device_tokens: updatedTokens })
      .eq("id", session.id)

    if (updateError) {
      console.error("Error joining session:", updateError)
      throw new Error("Failed to join session")
    }

    return {
      sessionId: session.session_id,
      sessionToken: newToken,
      expiresAt: session.expires_at,
    }
  } catch (error) {
    console.error("Error in joinSession:", error)
    throw error
  }
}

export async function validateSession(sessionId: string, sessionToken: string) {
  try {
    const now = new Date().toISOString()
    const { data: session, error } = await supabase
      .from("pairing_sessions")
      .select("*")
      .eq("session_id", sessionId)
      .gt("expires_at", now)
      .single()

    if (error || !session) return false

    return session.device_tokens.includes(sessionToken)
  } catch (error) {
    return false
  }
}

export async function shareToSession(sessionId: string, sessionToken: string, type: "text" | "file", content: string) {
  const isValid = await validateSession(sessionId, sessionToken)
  if (!isValid) throw new Error("Unauthorized or expired session")

  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 2) // Session shares last 2 hours

  const { data, error } = await supabase
    .from("session_shares")
    .insert({
      session_id: sessionId,
      type,
      content,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error sharing to session:", error)
    throw new Error("Failed to share")
  }

  return data
}

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const S3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function shareFileToSession(sessionId: string, sessionToken: string, files: { name: string, size: number, fileKey: string }[]) {
  const isValid = await validateSession(sessionId, sessionToken)
  if (!isValid) throw new Error("Unauthorized or expired session")

  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 2) // Session shares last 2 hours

  const content = JSON.stringify(files.map(f => ({
    name: f.name,
    size: f.size,
    fileKey: f.fileKey
  })))

  const { data, error } = await supabase
    .from("session_shares")
    .insert({
      session_id: sessionId,
      type: "file",
      content: content,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) throw new Error("Failed to share file")
  return data
}

export async function getDownloadUrl(fileKey: string, fileName: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: fileKey,
    ResponseContentDisposition: `attachment; filename="${fileName}"`
  })
  return await getSignedUrl(S3, command, { expiresIn: 3600 })
}

export async function cleanupExpiredSessionShares() {
  const now = new Date().toISOString()
  await supabase.from("session_shares").delete().lt("expires_at", now)
}

export async function getSessionShares(sessionId: string, sessionToken: string) {
  const isValid = await validateSession(sessionId, sessionToken)
  if (!isValid) throw new Error("Unauthorized or expired session")

  await cleanupExpiredSessionShares()

  const { data, error } = await supabase
    .from("session_shares")
    .select("*")
    .eq("session_id", sessionId)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })

  if (error) return []
  return data
}


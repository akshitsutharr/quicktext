"use server"

import { supabase } from "@/lib/supabase"

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function shareText(text: string): Promise<string> {
  try {
    // Clean up expired texts before creating new one
    await cleanupExpiredTexts()

    let code = generateCode()
    let attempts = 0
    const maxAttempts = 10

    // Ensure unique code
    while (attempts < maxAttempts) {
      const { data: existing } = await supabase.from("shared_texts").select("code").eq("code", code).single()

      if (!existing) break

      code = generateCode()
      attempts++
    }

    if (attempts >= maxAttempts) {
      throw new Error("Unable to generate unique code")
    }

    // Calculate expiration time (1 hour from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    const { data, error } = await supabase
      .from("shared_texts")
      .insert({
        code,
        content: text,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error sharing text:", error)
      throw new Error("Failed to share text")
    }

    return code
  } catch (error) {
    console.error("Error in shareText:", error)
    throw new Error("Failed to share text")
  }
}

export async function getSharedText(code: string): Promise<string | null> {
  try {
    // Clean up expired texts every time we fetch
    await cleanupExpiredTexts()

    const { data, error } = await supabase
      .from("shared_texts")
      .select("content, expires_at")
      .eq("code", code.toUpperCase())
      .single()

    if (error || !data) {
      return null
    }

    // Double-check if text has expired (in case cleanup didn't catch it)
    const now = new Date()
    const expiresAt = new Date(data.expires_at)

    if (now > expiresAt) {
      // Delete expired text immediately
      await supabase.from("shared_texts").delete().eq("code", code.toUpperCase())
      return null
    }

    return data.content
  } catch (error) {
    console.error("Error getting shared text:", error)
    return null
  }
}

export async function updateSharedText(code: string, text: string): Promise<boolean> {
  try {
    // Clean up expired texts before updating
    await cleanupExpiredTexts()

    // First check if the text exists and hasn't expired
    const existingText = await getSharedText(code)
    if (!existingText) {
      return false
    }

    const { error } = await supabase.from("shared_texts").update({ content: text }).eq("code", code.toUpperCase())

    if (error) {
      console.error("Error updating shared text:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in updateSharedText:", error)
    return false
  }
}

export async function cleanupExpiredTexts(): Promise<void> {
  try {
    const now = new Date().toISOString()

    const { error } = await supabase.from("shared_texts").delete().lt("expires_at", now)

    if (error) {
      console.error("Error cleaning up expired texts:", error)
    }
  } catch (error) {
    console.error("Error in cleanupExpiredTexts:", error)
  }
}

export async function getTextStats(code: string): Promise<{ expiresAt: string | null; isExpired: boolean }> {
  try {
    // Clean up expired texts before checking stats
    await cleanupExpiredTexts()

    const { data, error } = await supabase
      .from("shared_texts")
      .select("expires_at")
      .eq("code", code.toUpperCase())
      .single()

    if (error || !data) {
      return { expiresAt: null, isExpired: true }
    }

    const now = new Date()
    const expiresAt = new Date(data.expires_at)
    const isExpired = now > expiresAt

    if (isExpired) {
      // Clean up this expired text immediately
      await supabase.from("shared_texts").delete().eq("code", code.toUpperCase())
    }

    return {
      expiresAt: data.expires_at,
      isExpired,
    }
  } catch (error) {
    console.error("Error getting text stats:", error)
    return { expiresAt: null, isExpired: true }
  }
}

// New function to get database statistics (optional)
export async function getDatabaseStats(): Promise<{ totalTexts: number; expiredTexts: number }> {
  try {
    const now = new Date().toISOString()

    const [totalResult, expiredResult] = await Promise.all([
      supabase.from("shared_texts").select("id", { count: "exact" }),
      supabase.from("shared_texts").select("id", { count: "exact" }).lt("expires_at", now),
    ])

    return {
      totalTexts: totalResult.count || 0,
      expiredTexts: expiredResult.count || 0,
    }
  } catch (error) {
    console.error("Error getting database stats:", error)
    return { totalTexts: 0, expiredTexts: 0 }
  }
}

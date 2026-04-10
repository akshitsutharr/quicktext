"use server"

import { supabase } from "@/lib/supabase"

function generateCode(length = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function shortenUrl(originalUrl: string): Promise<string> {
  try {
    await cleanupExpiredUrls()

    let code = generateCode()
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      const { data: existing } = await supabase.from("shortened_urls").select("short_code").eq("short_code", code).single()
      if (!existing) break
      code = generateCode()
      attempts++
    }

    if (attempts >= maxAttempts) throw new Error("Unable to generate unique short code")

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hours expiry for links

    // Prefix correct protocol if missing
    const formattedUrl = originalUrl.startsWith('http://') || originalUrl.startsWith('https://') 
      ? originalUrl 
      : `https://${originalUrl}`

    const { error } = await supabase.from("shortened_urls").insert({
      short_code: code,
      original_url: formattedUrl,
      expires_at: expiresAt.toISOString(),
    })

    if (error) {
      console.error("Supabase insert error:", error)
      throw new Error((error as any).message || "Failed to create short URL")
    }

    return code
  } catch (error) {
    console.error("Error in shortenUrl:", error)
    throw error
  }
}

export async function getOriginalUrl(code: string) {
  try {
    await cleanupExpiredUrls()

    const { data, error } = await supabase
      .from("shortened_urls")
      .select("original_url, expires_at, access_count")
      .eq("short_code", code)
      .single()

    if (error || !data) return null

    const now = new Date()
    const expiresAt = new Date(data.expires_at)

    if (now > expiresAt) {
      await supabase.from("shortened_urls").delete().eq("short_code", code)
      return null
    }

    // Increment Access Count in background
    supabase.rpc('increment_url_access', { code_val: code }).then(({error}) => {
       if (error) {
           // Fallback to update if RPC not present
           supabase.from("shortened_urls").update({ access_count: data.access_count + 1 }).eq("short_code", code).then()
       }
    })

    return data.original_url
  } catch (error) {
    console.error("Error getting original URL:", error)
    return null
  }
}

export async function cleanupExpiredUrls() {
  try {
    const now = new Date().toISOString()
    await supabase.from("shortened_urls").delete().lt("expires_at", now)
  } catch (error) {
    console.error("Error in cleanupExpiredUrls:", error)
  }
}

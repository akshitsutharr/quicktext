"use server"

import { supabase } from "@/lib/supabase"

export async function resolveGlobalCode(code: string): Promise<string | null> {
    const cleanCode = code.trim()

    // 1. If 6 characters, assume URL shortener
    if (cleanCode.length === 6) {
        return `/s/${cleanCode}`
    }

    // 2. Try fetching from File Shares
    if (cleanCode.length === 5) {
        const { data: fileData } = await supabase
            .from("shared_files")
            .select("code")
            .eq("code", cleanCode.toUpperCase())
            .single()
        
        if (fileData) {
            return `/file/receive?code=${cleanCode.toUpperCase()}`
        }

        // 3. Try fetching from Text Shares
        const { data: textData } = await supabase
            .from("shared_texts")
            .select("code")
            .eq("code", cleanCode.toUpperCase())
            .single()
            
        if (textData) {
            return `/receive?code=${cleanCode.toUpperCase()}`
        }
    }

    return null
}

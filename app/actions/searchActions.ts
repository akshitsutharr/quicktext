"use server"

import { supabase } from "@/lib/supabase"

export async function resolveGlobalCode(code: string): Promise<string | null> {
    const cleanCode = code.trim().toUpperCase()

    // 1. If 6 characters, assume URL shortener
    if (cleanCode.length === 6) {
        return `/s/${cleanCode}`
    }

    // 2. Try fetching from File Shares
    if (cleanCode.length === 5) {
        const { data: fileData } = await supabase
            .from("shared_files")
            .select("code")
            .eq("code", cleanCode)
            .limit(1)
        
        if (fileData && fileData.length > 0) {
            return `/file/receive?code=${cleanCode}`
        }

        // 3. Try fetching from Text Shares
        const { data: textData } = await supabase
            .from("shared_texts")
            .select("code")
            .eq("code", cleanCode)
            .limit(1)
            
        if (textData && textData.length > 0) {
            return `/receive?code=${cleanCode}`
        }
    }

    return null
}

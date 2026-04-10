import { createClient } from "@supabase/supabase-js"

const S = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24)

  const { error } = await S.from("shortened_urls").insert({
      short_code: "123456",
      original_url: "https://google.com",
      expires_at: expiresAt.toISOString(),
  })
  
  if (error) {
     console.error("ERROR MESSAGE:", error.message)
     console.error("DETAIL:", error.details)
     console.error("HINT:", error.hint)
     console.error("CODE:", error.code)
  } else {
     console.log("Success!")
  }
}

test()

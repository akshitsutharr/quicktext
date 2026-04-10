import { getOriginalUrl } from "@/app/actions/urlActions"
import { redirect } from "next/navigation"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> | { code: string } }
) {
  // Handle both standard and Promise-based params for Next.js 15
  let code: string;
  
  if (params instanceof Promise) {
     const resolvedParams = await params;
     code = resolvedParams.code;
  } else {
     code = params.code;
  }

  if (!code) {
    redirect("/")
  }

  const originalUrl = await getOriginalUrl(code)

  if (originalUrl) {
    redirect(originalUrl)
  } else {
    // If expired or not found
    redirect("/?error=url-expired")
  }
}

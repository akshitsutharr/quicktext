import { getSharedText } from "@/app/actions"
import { getSharedFiles } from "@/app/actions/fileActions"
import { getOriginalUrl } from "@/app/actions/urlActions"
import { redirect } from "next/navigation"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> | { code: string } }
) {
  let code: string;
  
  if (params instanceof Promise) {
     const resolvedParams = await params;
     code = resolvedParams.code;
  } else {
     code = params.code;
  }

  if (!code) redirect("/")

  // 1. Check if it's a Short URL (usually 6 chars or numeric)
  const originalUrl = await getOriginalUrl(code)
  if (originalUrl) redirect(originalUrl)

  // 2. Check if it's a Text Share (5 chars)
  const sharedText = await getSharedText(code)
  if (sharedText) redirect(`/receive?code=${code}`)

  // 3. Check if it's a File Share (5 chars)
  const sharedFiles = await getSharedFiles(code)
  if (sharedFiles && sharedFiles.length > 0) redirect(`/file/receive?code=${code}`)

  // Fallback
  redirect(`/?error=expired&code=${code}`)
}

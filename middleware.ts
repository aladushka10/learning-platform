/**
 * Vercel Routing Middleware: проксирует /api/* на Railway (один origin на Vercel → cookie работают).
 *
 * Vercel → Project → Settings → Environment Variables:
 *   RAILWAY_BACKEND_URL = https://ВАШ-СЕРВИС.up.railway.app  (без / в конце)
 *
 * URL: Railway → сервис → Settings → Networking → публичный домен.
 */

export const config = {
  matcher: "/api/:path*",
}

export default async function middleware(request: Request): Promise<Response> {
  const backend = process.env.RAILWAY_BACKEND_URL?.replace(/\/$/, "")
  if (!backend) {
    return new Response(
      JSON.stringify({
        error:
          "Задайте RAILWAY_BACKEND_URL в Vercel (Environment Variables): публичный HTTPS URL Railway без / в конце.",
      }),
      {
        status: 502,
        headers: { "content-type": "application/json; charset=utf-8" },
      },
    )
  }

  const url = new URL(request.url)
  const path = url.pathname.replace(/^\/api/, "") || "/"
  const target = `${backend}${path}${url.search}`

  const headers = new Headers()
  const cookie = request.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)
  const ct = request.headers.get("content-type")
  if (ct) headers.set("content-type", ct)
  const auth = request.headers.get("authorization")
  if (auth) headers.set("authorization", auth)

  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    redirect: "manual",
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body
    init.duplex = "half"
  }

  return fetch(target, init)
}

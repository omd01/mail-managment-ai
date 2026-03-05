import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const publicPaths = ["/", "/login", "/register"]
  const apiAuthPaths = ["/api/auth"]
  const onboardingPath = "/onboarding"

  // Add these protected paths explicitly
  const protectedPaths = ["/dashboard", "/templates", "/send", "/bulk", "/settings"]

  // Check if the path is public or onboarding
  const isPublicPath = publicPaths.some((publicPath) => path === publicPath)
  const isApiAuthPath = apiAuthPaths.some((apiPath) => path.startsWith(apiPath))
  const isOnboardingPath = path === onboardingPath

  // Add this check for protected paths
  const isProtectedPath = protectedPaths.some((protectedPath) => path.startsWith(protectedPath))

  if (isPublicPath || isApiAuthPath) {
    return NextResponse.next()
  }

  // Verify authentication
  const token = await getToken({
    req: request,
    secret: process.env.JWT_SECRET,
  })

  // If the path is protected and there's no token, redirect to login
  if ((isProtectedPath || !isPublicPath) && !token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", path)
    return NextResponse.redirect(url)
  }

  // For API routes that require authentication, check token
  if (path.startsWith("/api/") && !token) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  // Check if user needs onboarding (except if they're already on the onboarding page)
  if (
    !isOnboardingPath &&
    (token.isOnboarded === false || token.hasAwsCredentials === false) &&
    !path.startsWith("/api/")
  ) {
    return NextResponse.redirect(new URL("/onboarding", request.url))
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all paths except static files and api routes that don't need auth
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/', // Home page
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/api/webhook(.*)',
  '/_next(.*)',
  '/favicon.ico',
  '/images(.*)',
  '/privacy',
  '/terms',
])

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/chat(.*)',
  '/api/chat(.*)',
  '/api/messages(.*)',
  '/api/boards(.*)',
])

// Define API routes
const isApiRoute = createRouteMatcher(['/api(.*)'])

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Skip protection for public routes
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // For API routes, check authentication and return 401 if not authenticated
  if (isApiRoute(req)) {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      })
    }
    return NextResponse.next()
  }

  // For all other routes, require authentication
  if (isProtectedRoute(req)) {
    await auth.protect()
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
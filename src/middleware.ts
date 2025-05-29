// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the token using the NextRequest context
  const token = request.cookies.get('access_token')?.value  
  console.log(`Token from middleware: ${token}`)
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Fixed: Get the correct cookie name
  const roleIdStr = request.cookies.get('userRoleId')?.value
  const roleId = roleIdStr ? parseInt(roleIdStr, 10) : undefined
  
  console.log(`RoleId from middleware: ${roleId}`)

  const url = request.nextUrl.pathname

  // Define your protected routes based on roles
  const protectedRoutes = {
    // '/home': [1, 2],
    '/profile': [1, 2],
   // '/history': [1, 2],
    '/admin-page': [1],
    '/educational-modules': [1, 2],
  }

  // Check if the current route is protected
  const routePath = Object.keys(protectedRoutes).find((route) => 
    url.startsWith(route)
  )

  if (routePath && roleId !== undefined) {
    // @ts-ignore - We know this is safe based on our find above
    const allowedRoles = protectedRoutes[routePath]
    
    if (!allowedRoles.includes(roleId)) {
      // Redirect to appropriate page based on role
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  // Add the token to the request headers for downstream components
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('Authorization', `Bearer ${token}`)

  // Return the response with modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  })
}

export const config = {
  matcher: [
    // '/home',
    '/profile',
    '/admin-page',
    '/educational-modules',
    //'/history'
  ],
}
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  // Allow access to auth pages without authentication
  if (request.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // Redirect to sign in if not authenticated
  if (!token) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Check role-based access for specific routes
  if (request.nextUrl.pathname.startsWith("/api/teams")) {
    const method = request.method;

    // Only managers and directors can approve teams
    if (method === "PUT" && request.nextUrl.pathname.includes("/approve")) {
      if (token.role !== "manager" && token.role !== "director") {
        return NextResponse.json(
          { success: false, error: "Insufficient permissions" },
          { status: 403 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/teams/:path*"],
};

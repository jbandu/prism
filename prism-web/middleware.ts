import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Add custom middleware logic here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Protect these routes
export const config = {
  matcher: [
    "/admin/:path*",
    "/:companyId/dashboard/:path*",
    "/:companyId/software/:path*",
    "/:companyId/alternatives/:path*",
    "/:companyId/reports/:path*",
    "/:companyId/settings/:path*",
    "/api/companies/:path*",
    "/api/software/:path*",
    "/api/agents/:path*",
    "/api/reports/:path*",
  ],
};

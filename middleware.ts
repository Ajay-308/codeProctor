import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/candidates(.*)",
  "/templates(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    interface SessionClaimsMetadata {
      role?: string;
      [key: string]: unknown;
    }

    interface SessionClaims {
      metadata?: SessionClaimsMetadata;
      role?: string;
      [key: string]: unknown;
    }

    const authObj = await auth();
    let userRole: string | undefined = undefined;
    const sessionClaims = authObj.sessionClaims as SessionClaims | undefined;
    if (sessionClaims) {
      if (typeof sessionClaims === "object" && sessionClaims !== null) {
        // Check for metadata.role
        if (
          "metadata" in sessionClaims &&
          typeof sessionClaims.metadata === "object" &&
          sessionClaims.metadata !== null &&
          "role" in sessionClaims.metadata
        ) {
          userRole = sessionClaims.metadata?.role;
        } else if ("role" in sessionClaims) {
          userRole = sessionClaims.role;
        }
      }
    }
    if (userRole === "candidate") {
      const url = new URL("/unauthorized", req.url);
      return NextResponse.redirect(url);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

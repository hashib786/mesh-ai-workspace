import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Match the /app route and any nested sub-routes under it
const isProtectedRoute = createRouteMatcher(["/app(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.[^?]*$).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Required Clerk proxy path
    "/__clerk/:path*",
  ],
};

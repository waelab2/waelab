import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

/** Marketing routes folded into `/`; pages kept on disk for a later relaunch. */
const isDisabledMarketingRoute = createRouteMatcher([
  "/about-us(.*)",
  "/our-services(.*)",
  "/our-plans(.*)",
  "/contact-us(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isDisabledMarketingRoute(req)) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

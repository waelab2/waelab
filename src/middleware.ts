import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

const isRootPlaygroundRoute = createRouteMatcher(["/dashboard/playground"]);
const isRootModelsRoute = createRouteMatcher(["/dashboard/models"]);
const isRootSettingsRoute = createRouteMatcher(["/dashboard/settings"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
  if (isRootPlaygroundRoute(req)) {
    return NextResponse.redirect(
      new URL("/dashboard/playground/generate", req.url),
    );
  }
  if (isRootModelsRoute(req)) {
    return NextResponse.redirect(new URL("/dashboard/models/list", req.url));
  }
  if (isRootSettingsRoute(req)) {
    return NextResponse.redirect(
      new URL("/dashboard/settings/general", req.url),
    );
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

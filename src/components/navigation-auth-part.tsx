"use client";

import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function NavigationAuthPart() {
  return (
    <div className="flex items-center">
      <Unauthenticated>
        <SignUpButton>
          <Button
            variant="ghost"
            className="bg-transparent bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] bg-clip-text text-lg font-semibold text-transparent"
            style={{
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Sign Up
          </Button>
        </SignUpButton>
        <SignInButton>
          <Button
            className="rounded-full bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] text-white"
            size="lg"
          >
            Login <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </SignInButton>
      </Unauthenticated>
      <Authenticated>
        <div className="scale-150">
          <UserButton />
        </div>
      </Authenticated>
    </div>
  );
}

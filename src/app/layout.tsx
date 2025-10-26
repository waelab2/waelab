import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { DirectionProvider } from "~/components/direction-provider";
import { TranslationProvider } from "~/hooks/use-translations";
import { TRPCReactProvider } from "~/trpc/react";
import ConvexClientProvider from "./ConvexClientProvider";

export const metadata: Metadata = {
  title: "Waelab",
  description: "AI Movie Generation",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <ClerkProvider>
          <TRPCReactProvider>
            <ConvexClientProvider>
              <TranslationProvider>
                <DirectionProvider>
                  {children}
                  <Toaster position="top-right" richColors />
                </DirectionProvider>
              </TranslationProvider>
            </ConvexClientProvider>
          </TRPCReactProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

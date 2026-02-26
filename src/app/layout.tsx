import "~/styles/globals.css";

import { type Metadata } from "next";
import { cookies } from "next/headers";
import { Geist } from "next/font/google";

import { ClerkProvider } from "@clerk/nextjs";
import { ConvexHttpClient } from "convex/browser";
import { Toaster } from "sonner";
import { api } from "../../convex/_generated/api";
import { DirectionProvider } from "~/components/direction-provider";
import { env } from "~/env";
import { TranslationProvider } from "~/hooks/use-translations";
import type { Language } from "~/lib/translations";
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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const languageCookie = cookieStore.get("language")?.value;
  const initialLanguage: Language =
    languageCookie === "ar" || languageCookie === "en" ? languageCookie : "en";

  const convexClient = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);
  const initialTranslations = await convexClient.query(
    api.translations.getAllTranslations,
    {},
  );

  return (
    <html
      lang={initialLanguage}
      dir={initialLanguage === "ar" ? "rtl" : "ltr"}
      className={`${geist.variable}`}
    >
      <body>
        <ClerkProvider>
          <TRPCReactProvider>
            <ConvexClientProvider>
              <TranslationProvider
                initialLanguage={initialLanguage}
                initialTranslations={initialTranslations}
              >
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

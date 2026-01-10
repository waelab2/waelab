"use client";

import PinIcon from "@/assets/icons/pin-icon.svg";
import WhiteLogo from "@/assets/icons/white-logo.svg";
import AccentedText from "@/components/accented-text";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, useClerk } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useState } from "react";
import GradientBordered from "~/components/gradient-bordered";
import { useTranslations } from "~/hooks/use-translations";
import { api } from "~/trpc/react";

interface Plan {
  id: string;
  name: string;
  icon: StaticImageData;
  price: {
    monthly: number | string;
    yearly: number | string;
  };
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

export default function PricingSection() {
  const { t, language } = useTranslations();
  const { userId, isLoaded } = useAuth();
  const clerk = useClerk();
  const checkoutMutation = api.plans.handlePlanCheckout.useMutation();
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  const handleGetStarted = async (planId: string) => {
    // Wait for auth to load
    if (!isLoaded) {
      return;
    }

    // If not authenticated, open Clerk's sign-in (same as clicking SignInButton)
    if (!userId) {
      clerk.openSignIn({
        redirectUrl: "/our-plans",
      });
      return;
    }

    // If authenticated, call the server function
    setPendingPlanId(planId);
    try {
      const result = await checkoutMutation.mutateAsync({ planId, language });
      
      // Navigate to the Tap payment page
      if (result.transactionUrl) {
        window.location.href = result.transactionUrl;
      }
    } catch (error) {
      console.error("Error handling checkout:", error);
    } finally {
      setPendingPlanId(null);
    }
  };

  const plans: Plan[] = [
    {
      id: "starter",
      name: t("our_plans.pricing.starter.name"),
      icon: PinIcon as StaticImageData,
      price: {
        monthly: 75,
        yearly: 900, // 75 * 12 (no discount)
      },
      description: t("our_plans.pricing.starter.description"),
      features: [
        t("our_plans.pricing.starter.feature_1"),
        t("our_plans.pricing.starter.feature_2"),
        t("our_plans.pricing.starter.feature_3"),
        t("our_plans.pricing.starter.feature_4"),
      ],
      cta: t("our_plans.pricing.cta"),
    },
    {
      id: "pro",
      name: t("our_plans.pricing.pro.name"),
      icon: PinIcon as StaticImageData,
      price: {
        monthly: 180,
        yearly: 2160, // 180 * 12 (no discount)
      },
      description: t("our_plans.pricing.pro.description"),
      features: [
        t("our_plans.pricing.pro.feature_1"),
        t("our_plans.pricing.pro.feature_2"),
        t("our_plans.pricing.pro.feature_3"),
        t("our_plans.pricing.pro.feature_4"),
      ],
      cta: t("our_plans.pricing.cta"),
      popular: true,
    },
    {
      id: "premium",
      name: t("our_plans.pricing.premium.name"),
      icon: PinIcon as StaticImageData,
      price: {
        monthly: 375,
        yearly: 4500, // 375 * 12 (no discount)
      },
      description: t("our_plans.pricing.premium.description"),
      features: [
        t("our_plans.pricing.premium.feature_1"),
        t("our_plans.pricing.premium.feature_2"),
        t("our_plans.pricing.premium.feature_3"),
        t("our_plans.pricing.premium.feature_4"),
      ],
      cta: t("our_plans.pricing.cta"),
    },
  ];
  const [frequency, setFrequency] = useState<string>("monthly");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="not-prose text-ui-dark m-12 flex flex-col gap-16 text-center">
      <div className="flex flex-col items-center gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <GradientBordered className="rounded-full">
            <Tabs
              defaultValue={frequency}
              onValueChange={setFrequency}
              className="inline-block rounded-full bg-white py-1.5 shadow-sm"
            >
              <TabsList className="bg-transparent">
                <TabsTrigger
                  value="monthly"
                  className={`text-ui-dark rounded-full px-6 py-3 transition-all duration-300 ${frequency === "monthly"
                    ? "bg-linear-to-r from-[#E9476E] to-[#3B5DA8] text-white"
                    : ""
                    }`}
                >
                  <Image
                    src={WhiteLogo as StaticImageData}
                    alt="Monthly"
                    className="mr-2"
                  />
                  {t("our_plans.pricing.tabs.monthly")}
                </TabsTrigger>
                <TabsTrigger
                  value="yearly"
                  className={`text-ui-dark rounded-full px-6 py-3 transition-all duration-300 ${frequency === "yearly"
                    ? "bg-linear-to-r from-[#E9476E] to-[#3B5DA8] text-white"
                    : ""
                    }`}
                >
                  <Image
                    src={WhiteLogo as StaticImageData}
                    alt="Yearly"
                    className="mr-2"
                  />
                  {t("our_plans.pricing.tabs.yearly")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </GradientBordered>
        </motion.div>

        <div className="mt-8 grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="flex"
            >
              <Card className="bg-secondary/20 relative h-full w-full border border-[#73748525] text-left transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  {/* Price at the top */}
                  <div className="mb-8">
                    {typeof plan.price[frequency as keyof typeof plan.price] ===
                      "number" ? (
                      <div className="flex items-baseline">
                        <span className="text-ui-dark text-3xl font-medium">
                          R.S{" "}
                          <AccentedText className="text-3xl font-bold">
                            {plan.price[frequency as keyof typeof plan.price]}
                          </AccentedText>
                        </span>
                        <span className="text-ui-dark ml-1 text-sm">
                          {t("our_plans.pricing.billing")}{" "}
                          {t(`our_plans.pricing.tabs.${frequency}`)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-ui-dark text-2xl font-bold">
                        {plan.price[frequency as keyof typeof plan.price]}
                      </span>
                    )}
                  </div>

                  {/* Plan title with icon */}
                  <div className="mb-2 -ml-2 flex items-center gap-1">
                    <Image
                      src={plan.icon}
                      alt={plan.name}
                      className="h-6 w-6"
                    />
                    <CardTitle className="text-ui-dark text-2xl font-bold">
                      {plan.name}
                    </CardTitle>
                  </div>

                  {/* Description */}
                  <CardDescription>
                    <p className="text-ui-grey text-sm">{plan.description}</p>
                  </CardDescription>
                </CardHeader>
                <Separator className="my-2 h-0.25" />
                <CardContent className="grid gap-3 pb-6">
                  {plan.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="waelab-gradient-bg flex h-5 w-5 items-center justify-center rounded-full">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="text-ui-grey">{feature}</span>
                    </motion.div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className="waelab-gradient-bg w-full rounded-full py-6 font-medium text-white shadow-none transition-all duration-300 hover:text-white hover:shadow-none"
                    onClick={() => handleGetStarted(plan.id)}
                    disabled={!isLoaded || pendingPlanId !== null}
                  >
                    {pendingPlanId === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {language === "ar" ? "جاري المعالجة..." : "Loading..."}
                      </>
                    ) : (
                      <>
                        {plan.cta}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

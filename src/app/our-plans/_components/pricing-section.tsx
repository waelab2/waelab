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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@radix-ui/react-separator";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useState } from "react";

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

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter - Free Plan",
    icon: PinIcon as StaticImageData,
    price: {
      monthly: 0,
      yearly: 0,
    },
    description:
      "Get started with the essential tools for creating and editing visuals effortlessly. Perfect for beginners exploring basic features.",
    features: [
      "Limited support",
      "Upload up to 5 images per month",
      "Download content in low resolution",
      "Basic video editing with limited effects",
    ],
    cta: "Get Started",
  },
  {
    id: "essential",
    name: "Essential Plan",
    icon: PinIcon as StaticImageData,
    price: {
      monthly: 200,
      yearly: 2000,
    },
    description:
      "Unlock advanced tools for seamless video creation and editing. Ideal for users seeking more customization and professional results.",
    features: [
      "Basic customer support",
      "Upload up to 50 images per month",
      "Share content directly on social media",
      "Create videos in HD quality",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    id: "premium",
    name: "Premium Plan",
    icon: PinIcon as StaticImageData,
    price: {
      monthly: 400,
      yearly: 4000,
    },
    description:
      "Experience the ultimate package with exclusive features, priority support, and full creative control. Designed for professionals.",
    features: [
      "Priority customer support",
      "Unlimited uploads of images and videos",
      "Export videos in 4K resolution",
      "Access to professional editing tools and advanced effects",
    ],
    cta: "Get Started",
  },
];

export default function PricingSection() {
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
          <div className="relative rounded-full bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] p-0.75">
            <Tabs
              defaultValue={frequency}
              onValueChange={setFrequency}
              className="inline-block rounded-full bg-white py-1.5 shadow-sm"
            >
              <TabsList className="bg-transparent">
                <TabsTrigger
                  value="monthly"
                  className={`text-ui-dark rounded-full px-6 py-3 transition-all duration-300 ${
                    frequency === "monthly"
                      ? "bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] text-white"
                      : ""
                  }`}
                >
                  <Image
                    src={WhiteLogo as StaticImageData}
                    alt="Monthly"
                    className="mr-2"
                  />
                  Monthly
                </TabsTrigger>
                <TabsTrigger
                  value="yearly"
                  className={`text-ui-dark rounded-full px-6 py-3 transition-all duration-300 ${
                    frequency === "yearly"
                      ? "bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] text-white"
                      : ""
                  }`}
                >
                  <Image
                    src={WhiteLogo as StaticImageData}
                    alt="Yearly"
                    className="mr-2"
                  />
                  Yearly
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
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
                          /month, billed {frequency}
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
                <Separator className="my-2 h-0.25 bg-[#DDDEEC]" />
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
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
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

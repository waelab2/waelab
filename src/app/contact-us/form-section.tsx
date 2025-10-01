import EmailIcon from "@/assets/icons/email.svg";
import FaxIcon from "@/assets/icons/fax.svg";
import LocationIcon from "@/assets/icons/location.svg";
import PhoneIcon from "@/assets/icons/phone.svg";
import AccentedText from "@/components/accented-text";
import GradientBordered from "@/components/gradient-bordered";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import Image, { type StaticImageData } from "next/image";
import { Label } from "~/components/ui/label";

const contactBoxes = [
  {
    icon: FaxIcon as StaticImageData,
    title: "Fax",
    text: "+966112497887",
  },
  {
    icon: PhoneIcon as StaticImageData,
    title: "Phone",
    text: "+966920001221",
  },
  {
    icon: EmailIcon as StaticImageData,
    title: "Email",
    text: "Info@DETASAD.com",
  },
  {
    icon: LocationIcon as StaticImageData,
    title: "Location",
    text: "P.O. Box 22135 ----  Riyadh 11495 Kingdom of Saudi Arabia",
  },
];

export default function FormSection() {
  return (
    <section className="grid gap-12 lg:grid-cols-2">
      {/* Left Side */}
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="space-y-4">
          <h1 className="text-ui-dark text-4xl font-bold lg:text-5xl">
            Let&apos;s <AccentedText>Connect</AccentedText> & Collaborate
          </h1>
          <p className="text-ui-grey text-lg leading-relaxed">
            Have questions or need assistance? We&apos;re here to help! Reach
            out to us for inquiries, support, or collaboration opportunities.
            Our team is ready to assist you and ensure you get the best
            experience.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {contactBoxes.map((box, index) => (
            <motion.div
              key={box.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`flex w-[calc(50%-16px)] ${index % 2 === 0 ? "justify-end" : "justify-start"}`}
            >
              <GradientBordered className="w-fit rounded-2xl">
                <Card className="h-full rounded-2xl border-0 bg-white shadow-none">
                  <CardContent className="px-4">
                    <div className="flex items-center gap-x-4 gap-y-8">
                      <Image
                        src={box.icon}
                        alt={box.title}
                        width={80}
                        height={80}
                        className="scale-150"
                      />
                      <div>
                        <h3 className="text-ui-dark mb-2 text-lg font-semibold">
                          {box.title}
                        </h3>
                        <p className="text-ui-grey text-sm leading-relaxed">
                          {box.text}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </GradientBordered>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Right Side - Contact Form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <GradientBordered className="rounded-xl">
          <Card className="border-0 bg-white py-0 shadow-none">
            <CardContent className="p-8">
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-ui-dark text-2xl font-bold">
                    Get in Touch
                  </h2>
                  <p className="text-ui-grey">
                    Let&apos;s chat about how our expert team can help
                  </p>
                </div>

                <form className="text-ui-dark space-y-6">
                  <div>
                    <Label
                      htmlFor="name"
                      className="text-ui-grey mb-2 ml-2 text-base"
                    >
                      Your Name
                    </Label>
                    <Input
                      name="name"
                      type="text"
                      placeholder="Enter your name here"
                      className="border-ui-grey/30 text-ui-dark h-12 w-full rounded-full !bg-[#EEEFF6] px-6 placeholder-[#737485] focus:border-[#E9476E] focus:ring-0"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label
                        htmlFor="email"
                        className="text-ui-grey mb-2 ml-2 text-base"
                      >
                        Your Email
                      </Label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="Enter your email here"
                        className="border-ui-grey/30 text-ui-dark h-12 w-full rounded-full !bg-[#EEEFF6] px-6 placeholder-[#737485] focus:border-[#E9476E] focus:ring-0"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="phone"
                        className="text-ui-grey mb-2 ml-2 text-base"
                      >
                        Your Phone
                      </Label>
                      <Input
                        name="phone"
                        type="tel"
                        placeholder="Enter your phone here"
                        className="border-ui-grey/30 text-ui-dark h-12 w-full rounded-full !bg-[#EEEFF6] px-6 placeholder-[#737485] focus:border-[#E9476E] focus:ring-0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="subject"
                      className="text-ui-grey mb-2 ml-2 text-base"
                    >
                      Subject
                    </Label>
                    <Input
                      name="subject"
                      type="text"
                      placeholder="Enter the subject here"
                      className="border-ui-grey/30 text-ui-dark h-12 w-full rounded-full !bg-[#EEEFF6] px-6 placeholder-[#737485] focus:border-[#E9476E] focus:ring-0"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="message"
                      className="text-ui-grey mb-2 ml-2 text-base"
                    >
                      Your Message
                    </Label>
                    <Textarea
                      name="message"
                      placeholder="Enter your message here"
                      rows={32}
                      className="border-ui-grey/30 text-ui-dark min-h-40 w-full resize-none rounded-2xl bg-[#EEEFF6] p-6 placeholder-[#737485] focus:border-[#E9476E] focus:ring-0"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="waelab-gradient-bg h-12 w-full rounded-full font-medium text-white shadow-none transition-all duration-300 hover:text-white hover:shadow-lg"
                  >
                    Send
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </GradientBordered>
      </motion.div>
    </section>
  );
}

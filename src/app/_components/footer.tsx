import Image from "next/image";
import FooterLogo from "~/assets/footer-logo.svg";
import { Input } from "~/components/ui/input";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto">
        {/* Top */}
        <div className="flex items-center gap-16">
          <div className="flex-1">
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
            <Image src={FooterLogo} alt="logo" />
          </div>
          <div className="flex-1">
            <div className="flex flex-col gap-4 rounded-[2rem] border-3 border-[#EEEFF6] bg-[#EEEFF615] p-16">
              <div className="text-2xl">Stay Inspired Weekly!</div>
              <div className="text-base">
                Get the latest updates, tips, and exclusive content delivered
                straight to your inbox. 🚀
              </div>
              <div className="relative rounded-full bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] p-0.5">
                <div className="bg-primary absolute top-0.5 right-0.5 bottom-0.5 left-0.5 z-10 rounded-full" />
                <div className="absolute top-0.5 right-0.5 bottom-0.5 left-0.5 z-20 rounded-full bg-[#EEEFF615]" />
                <Input
                  className="relative z-30 rounded-full border-none px-4 py-6"
                  placeholder="Enter You Mail Here"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Bottom */}
        <div className="flex items-center gap-16">
          <div className="flex-1">
            <p>© 2025 Waelab. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

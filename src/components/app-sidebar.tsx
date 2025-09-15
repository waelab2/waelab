"use client";

import { UserButton } from "@clerk/nextjs";
import { Bot, Settings2, SquareTerminal } from "lucide-react";
import { usePathname } from "next/navigation";
import * as React from "react";

import { NavMain } from "~/components/nav-main";
// import { NavOther } from "~/components/nav-other";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "~/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const segments = pathname.split("/");

  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Bot,
        isActive: pathname === "/dashboard",
      },
      {
        title: "Playground",
        url: "/dashboard/playground",
        icon: SquareTerminal,
        isActive: pathname.startsWith("/dashboard/playground"),
      },
      {
        title: "Models",
        url: "/dashboard/models/list",
        icon: Bot,
        isActive: pathname.startsWith("/dashboard/models"),
      },
      {
        title: "Settings",
        url: "/dashboard/settings/general",
        icon: Settings2,
        isActive: pathname.startsWith("/dashboard/settings"),
      },
    ],
    other: [],
  };

  return (
    <Sidebar collapsible="icon" className="relative z-50 border-0" {...props}>
      <div className="absolute inset-0 bg-[#EEEFF614] backdrop-blur-sm" />
      <SidebarContent className="relative z-10">
        <NavMain items={data.navMain} />
        {/* <NavOther other={data.other} /> */}
      </SidebarContent>
      <SidebarFooter className="relative z-10 text-white [&_*]:text-white">
        <UserButton
          showName
          appearance={{
            elements: {
              userButtonBox: "flex flex-row-reverse!",
            },
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

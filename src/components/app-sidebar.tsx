"use client";

import { UserButton } from "@clerk/nextjs";
import { Activity, Bot, SquareTerminal, Users } from "lucide-react";
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

  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Bot,
        isActive: pathname === "/dashboard",
      },
      {
        title: "Users",
        url: "/dashboard/users",
        icon: Users,
        isActive: pathname.startsWith("/dashboard/users"),
      },
      {
        title: "Activity",
        url: "/dashboard/activity",
        icon: Activity,
        isActive: pathname.startsWith("/dashboard/activity"),
      },
      {
        title: "Playground",
        url: "/dashboard/playground",
        icon: SquareTerminal,
        isActive: pathname.startsWith("/dashboard/playground"),
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

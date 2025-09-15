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
        title: "Playground",
        url: "/dashboard/playground/generate",
        icon: SquareTerminal,
        isActive: segments[segments.length - 2] === "playground",
        items: [
          {
            title: "Generate",
            url: "/dashboard/playground/generate",
          },
        ],
      },
      {
        title: "Models",
        url: "/dashboard/models/prices",
        icon: Bot,
        isActive: segments[segments.length - 2] === "models",
        items: [
          {
            title: "List",
            url: "/dashboard/models/list",
          },
        ],
      },
      {
        title: "Settings",
        url: "/dashboard/settings/general",
        icon: Settings2,
        isActive: segments[segments.length - 2] === "settings",
        items: [
          {
            title: "General",
            url: "/dashboard/settings/general",
          },
        ],
      },
    ],
    other: [],
  };

  return (
    <Sidebar collapsible="icon" className="border-0" {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavOther other={data.other} /> */}
      </SidebarContent>
      <SidebarFooter>
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

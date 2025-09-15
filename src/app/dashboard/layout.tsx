import Image from "next/image";
import { AppSidebar } from "~/components/app-sidebar";
import { Separator } from "~/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import Breadcrumbs from "./_components/Breadcrumbs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#282830]">
      {/* Decoration Images behind sidebar */}
      <div className="absolute top-0 left-0 z-1 -rotate-45">
        <Image
          src="/top-left-decoration.png"
          alt="sidebar-decoration"
          width={500}
          height={500}
        />
      </div>
      <div className="absolute bottom-0 left-0 z-1 -translate-x-1/2 rotate-130">
        <Image
          src="/top-left-decoration.png"
          alt="sidebar-decoration"
          width={500}
          height={500}
        />
      </div>

      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="relative bg-transparent">
          {/* Decoration Images - Now only in the main content area */}
          <div className="absolute top-0 left-0 z-1">
            <Image
              src="/top-left-decoration.png"
              alt="dashboard-decoration"
              width={500}
              height={500}
            />
          </div>
          <div className="absolute right-0 bottom-0 z-1">
            <Image
              src="/bottom-right-decoration.png"
              alt="dashboard-decoration"
              width={500}
              height={500}
            />
          </div>
          {/* Main Content Container */}
          <div className="relative z-3 m-4 h-full rounded-[2rem] border-3 border-[#EEEFF6] bg-[#EEEFF614] p-8">
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 text-white hover:bg-white/10 hover:text-white" />
                <Separator
                  orientation="vertical"
                  className="mr-2 bg-white/20 data-[orientation=vertical]:h-4"
                />
                <Breadcrumbs />
              </div>
            </header>
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      <div className="flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 m-2">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;

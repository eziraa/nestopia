"use client";

import Navbar from "@/components/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/components/AppSidebar";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/state/redux";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const user = useAppSelector((state) => state.auth.user);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user)
    {
      const userRole = user.role?.toLowerCase();
      if (
        (userRole === "manager" && pathname.startsWith("/tenants")) ||
        (userRole === "tenant" && pathname.startsWith("/managers"))
      )
      {
        router.push(
          userRole === "manager"
            ? "/managers/properties"
            : "/tenants/favorites",
          { scroll: false }
        );
      } 
    }
  }, [user, router, pathname]);

  if (!user?.role) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-primary-100">
        <Navbar />
        <div style={{ marginTop: `${NAVBAR_HEIGHT}px` }}>
          <main className="flex">
            <Sidebar role={user.role} />
            <div className="flex-grow transition-all duration-300">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;

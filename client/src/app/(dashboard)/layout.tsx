"use client";

import Navbar from "@/components/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/components/AppSidebar";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useGetCurrentUserQuery } from "@/state/auth.api";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: { user } = {}, isLoading: authLoading } = useGetCurrentUserQuery();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

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
      } else
      {
        setIsLoading(false);
      }
    }
  }, [user, router, pathname]);

  if (authLoading || isLoading) return <>Loading...</>;
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

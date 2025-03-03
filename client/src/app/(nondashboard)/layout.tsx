"use client";

import Navbar from "@/components/Navbar";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import { useAppSelector } from "@/state/redux";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
enum Role {
  Tenant = "Tenant",
  Manager = "Manager",
  None = "None"
}
const Layout = ({ children }: { children: React.ReactNode }) => {
  const authUser = useAppSelector(state => state.auth.user);
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authUser)
    {
      const userRole = authUser.role?.toLowerCase();
      if (
        (userRole === Role.Manager && pathname.startsWith("/search")) ||
        (userRole === Role.Manager && pathname === "/")
      )
      {
        router.push("/managers/properties", { scroll: false });
      } else
      {
        setIsLoading(false);
      }
    }
  }, [authUser, router, pathname]);


  return (
    <div className="h-full w-full">
      <Navbar />
      <main
        className={`h-full flex w-full flex-col`}
        style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;

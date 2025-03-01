"use client";

import Navbar from "@/components/Navbar";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import { useGetCurrentUserQuery } from "@/state/auth.api";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { data: user, isLoading: authLoading } = useGetCurrentUserQuery();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user)
    {
      const userRole = user.user.role?.toLowerCase();
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
  }, [user, router, pathname]);

  if (authLoading || isLoading) return <>Loading...</>;

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

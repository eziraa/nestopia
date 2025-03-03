"use client";

import AuthProvider from "@/providers/auth.provider";
import StoreProvider from "@/state/redux";

const Providers = ({ children }: { children: React.ReactNode }) => {

  return (
    <StoreProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </StoreProvider>
  );
};

export default Providers;

"use client";
import Loading from "@/components/Loading";
import { useGetCurrentUserQuery } from "@/state/auth.api";

import { useAppDispatch } from "@/state/redux";
import { login, logout } from "@/state/slices/auth.slice";
import { useEffect } from "react";
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading: authLoading } = useGetCurrentUserQuery();
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (data?.user)
    {
      dispatch(
        login({
          user: data?.user,
        })
      );
    }
    else
    {
      if (data?.status === 401)
        dispatch(logout());
    }
  }, [dispatch, data]);
  if (authLoading)
  {
    return <Loading />;
  }

  return <>{children}</>;
};

export default AuthProvider;

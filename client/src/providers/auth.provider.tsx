"use client";
import Loading from "@/components/Loading";
import { useGetCurrentUserQuery } from "@/state/auth.api";
import { useAppDispatch } from "@/state/redux";
import { login, logout } from "@/state/slices/auth.slice";
import { useEffect } from "react";
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: { user } = {}, isLoading: authLoading } =
    useGetCurrentUserQuery();
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (user)
    {
      dispatch(
        login({
          user: user,
        })
      );
    }
    else
    {
      dispatch(logout());
    }
  }, [dispatch, user]);
  if (authLoading)
  {
    return <Loading />;
  }

  return <>{children}</>;
};

export default AuthProvider;

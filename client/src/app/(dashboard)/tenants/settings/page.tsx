"use client";

import SettingsForm from "@/components/SettingsForm";
import {
  useUpdateTenantSettingsMutation,
} from "@/state/api";
import { useGetCurrentUserQuery } from "@/state/auth.api";
import React from "react";

const TenantSettings = () => {
  const { data: { user: authUser } = {}, isLoading } = useGetCurrentUserQuery();
  const [updateTenant] = useUpdateTenantSettingsMutation();

  if (isLoading) return <>Loading...</>;

  const initialData = {
    name: authUser?.name,
    email: authUser?.email,
    phoneNumber: authUser?.phoneNumber,
  };

  const handleSubmit = async (data: typeof initialData) => {
    await updateTenant({
      cognitoId: authUser?.id,
      ...data,
    });
  };

  return (
    <SettingsForm
      initialData={initialData}
      onSubmit={handleSubmit}
      userType="tenant"
    />
  );
};

export default TenantSettings;

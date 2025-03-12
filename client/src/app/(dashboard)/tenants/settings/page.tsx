"use client";

import SettingsForm from "@/components/SettingsForm";
import {
  useUpdateTenantSettingsMutation,
} from "@/state/api";
import { useAppSelector } from "@/state/redux";

import React from "react";

const TenantSettings = () => {
  const authUser = useAppSelector(state => state.auth.user);
  const [updateTenant] = useUpdateTenantSettingsMutation();


  const initialData = {
    name: authUser?.name,
    email: authUser?.email,
    phoneNumber: authUser?.phoneNumber,
  };

  const handleSubmit = async (data: typeof initialData) => {
    await updateTenant({
      cognitoId: authUser?.cognitoId,
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

"use client";

import SettingsForm from "@/components/SettingsForm";
import {
  useUpdateManagerSettingsMutation,
} from "@/state/api";

import React from "react";

const ManagerSettings = () => {
  const { data: { user: authUser } = {}, isLoading } = useGetCurrentUserQuery();
  const [updateManager] = useUpdateManagerSettingsMutation();

  if (isLoading) return <>Loading...</>;

  const initialData = {
    name: authUser?.name,
    email: authUser?.email,
    phoneNumber: authUser?.phoneNumber,
  };

  const handleSubmit = async (data: typeof initialData) => {
    await updateManager({
      cognitoId: authUser?.id,
      ...data,
    });
  };

  return (
    <SettingsForm
      initialData={initialData}
      onSubmit={handleSubmit}
      userType="manager"
    />
  );
};

export default ManagerSettings;

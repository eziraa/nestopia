"use client";

import SettingsForm from "@/components/SettingsForm";
import {
  useUpdateManagerSettingsMutation,
} from "@/state/api";
import { useAppSelector } from "@/state/redux";

import React from "react";

const ManagerSettings = () => {
  const authUser = useAppSelector((state) => state.auth.user);
  const [updateManager] = useUpdateManagerSettingsMutation();


  const initialData = {
    name: authUser?.name,
    email: authUser?.email,
    phoneNumber: authUser?.phoneNumber,
  };

  const handleSubmit = async (data: typeof initialData) => {
    await updateManager({
      cognitoId: authUser?.cognitoId,
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

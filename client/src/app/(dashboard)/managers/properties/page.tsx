"use client";

import Card from "@/components/Card";
import ErrorPage from "@/components/ErrorPage";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { useGetManagerPropertiesQuery } from "@/state/api";
import { useAppSelector } from "@/state/redux";

import React from "react";

const Properties = () => {
  const authUser = useAppSelector(state => state.auth.user);
  const {
    data: managerProperties,
    isLoading,
    error,
  } = useGetManagerPropertiesQuery(authUser?.cognitoId || "", {
    skip: !authUser?.cognitoId,
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorPage title="Failed to load properties" />;

  return (
    <div className="dashboard-container">
      <Header
        title="My Properties"
        subtitle="View and manage your property listings"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {managerProperties?.map((property) => (
          <Card
            key={property.id}
            property={property}
            isFavorite={false}
            onFavoriteToggle={() => { }}
            showFavoriteButton={false}
            propertyLink={`/managers/properties/${property.id}`}
          />
        ))}
      </div>
      {(!managerProperties || managerProperties.length === 0) && (
        <p>You don&lsquo;t manage any properties</p>
      )}
    </div>
  );
};

export default Properties;

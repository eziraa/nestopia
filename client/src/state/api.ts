import { withToast } from "@/lib/utils";
import { Tenant } from "@/types/prismaTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

enum ApiTags {
  MANAGERS = "Managers",
  TENANTS = "Tenants",
  PROPERTIES = "Properties",
  PROPERTY_DETAILES = "PropertyDetails",
  LEASES = "Leases",
  PAYMENTS = "Payments",
  APPLICATIONS = "Applications",
}
export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: "include",
  }),
  reducerPath: "api",
  tagTypes: Object.values(ApiTags),
  endpoints: (build) => ({
    updateTenantSettings: build.mutation<
      Tenant,
      { cognitoId: string } & Partial<Tenant>
    >({
      query: ({ cognitoId, ...updatedTenant }) => ({
        url: `tenants/${cognitoId}`,
        method: "PUT",
        body: updatedTenant,
      }),
      invalidatesTags: (result) => [{ type: ApiTags.TENANTS, id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Settings updated successfully!",
          error: "Failed to update settings.",
        });
      },
    }),
  }),
});

export const { useUpdateTenantSettingsMutation } = api;

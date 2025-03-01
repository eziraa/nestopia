import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
} from "@/types/authTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export enum AuthTagsEnum {
  SIGNUP = "SIGNUP",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
}
export const AuthApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: "include",
  }),
  reducerPath: "authApi",
  tagTypes: [...Object.values(AuthTagsEnum)],
  endpoints: (builder) => ({
    signup: builder.mutation<SignupResponse, SignupRequest>({
      query: (body) => ({
        url: "auth/signup",
        method: "POST",
        body,
      }),
      invalidatesTags: [AuthTagsEnum.SIGNUP],
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "auth/signin",
        method: "POST",
        body,
      }),
      invalidatesTags: [AuthTagsEnum.LOGIN],
    }),
    logout: builder.mutation({
      query: () => ({
        url: "auth/logout",
        method: "POST",
      }),
      invalidatesTags: [AuthTagsEnum.LOGOUT],
    }),
    getCurrentUser: builder.query<LoginResponse, void>({
      query: () => {
        return {
          url: "auth/current",
          method: "GET",
        };
      },
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useSignupMutation,
  useLoginMutation,
  useLogoutMutation,
} = AuthApi;

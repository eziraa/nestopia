import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: Cookies.get("user") ? JSON.parse(Cookies.get("user")!) : null,
  isAuthenticated: !!Cookies.get("token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: User }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      Cookies.set("user", JSON.stringify(action.payload.user), {
        expires: 7,
        secure: true,
      });
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;

      Cookies.remove("user");
      Cookies.remove("token");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;

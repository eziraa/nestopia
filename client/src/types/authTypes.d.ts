export interface LoginResponse {
  message: string;
  user: User;
  status: number;
}

export interface SignupResponse extends LoginResponse {}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest extends LoginRequest {
  name: string;
  confirmpassword: string;
  phoneNumber: string;
}

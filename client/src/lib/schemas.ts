import * as z from "zod";
export const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password lenth should be at least 8 "),
  confirmPassword: z.string().min(8, "Confirmed length should be at least 8"),
});

export const settingsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

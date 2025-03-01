/* eslint-disable @next/next/no-img-element */
"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { forwardRef, useState } from "react";
import { useSignupMutation } from "@/state/auth.api";
import { toast } from "sonner";
import { SignupRequest } from "@/types/authTypes";



export default function SignUp() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupRequest>({
    });

    const [error, setError] = useState("");
    const router = useRouter();
    const [signup] = useSignupMutation()
    const onSubmit = async (data: SignupRequest) => {
        if (data.password !== data.confirmpassword)
        {
            setError("Passwords do not match");
            return;
        }

        try
        {

            await signup(data).unwrap().then(() => {
                toast.success("Account created successfully");
                router.push("/signin");
            }).catch(err => {
                setError(err.message || "Something went wrong");
                toast.error(err.message || "Something went wrong");
            })
        } catch (err: any)
        {
            setError(err.message || "Something went wrong");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full flex flex-col py-10 px-6 gap-4 max-w-md bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                    <img className="w-12 h-12 border-2 rounded-full border-red-500 bg-red-300" src="/logo.svg" alt="Logo" />
                    <h1 className="text-2xl text-slate-700 font-bold">NESTO<span className="text-secondary-400">PIA</span> </h1>
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}


                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <Input
                        error={!!errors.name}
                        {...register("name", { required: "Name is required" })}
                        placeholder="Full Name"
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                    <Input
                        error={!!errors.phoneNumber}
                        {...register("phoneNumber", { required: "Phone number is required" })}
                        placeholder="Phone number"
                    />
                    <Input
                        error={!!errors.email}
                        {...register("email", { required: "Email is required" })}
                        placeholder="Email"
                        type="email"
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

                    <Input
                        error={!!errors.password}
                        {...register("password", { required: "Password is required", minLength: 6 })}
                        placeholder="Password"
                        type="password"
                    />
                    {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

                    <Input
                        error={!!errors.confirmpassword}
                        {...register("confirmpassword", { required: "Confirm password is required" })}
                        placeholder="Confirm Password"
                        type="password"
                    />
                    {errors.confirmpassword && (
                        <p className="text-red-500 text-sm">{errors.confirmpassword.message}</p>
                    )}

                    <button type="submit" className="w-full p-2 bg-secondary-400/90 hover:bg-secondary-400 text-white rounded">
                        Sign Up
                    </button>
                </form>

                <p className="text-center space-x-2 text-sm mt-4">
                    <span>
                        Already have an account?
                    </span>
                    <a href="/signin" className="text-secondary-400 hover:underline">
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
}




interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, ...rest }, ref) => {
        return (
            <input
                ref={ref} // Forwarding ref
                {...rest} // Spreading props (including `register`)
                className={`${className} w-full p-2 border-2 rounded outline-none focus-visible:border-secondary-400 ${error ? "border-red-500" : ""
                    }`}
            />
        );
    }
);

Input.displayName = "Input";
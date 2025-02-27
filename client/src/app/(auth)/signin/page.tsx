/* eslint-disable @next/next/no-img-element */
"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";

interface SignInData {
    email: string;
    password: string;
}

export default function SignIn() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignInData>();

    const [error, setError] = useState("");

    const onSubmit = async (data: SignInData) => {
        //
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full flex flex-col gap-2 max-w-md bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                    <img className="w-12 h-12 border-2 rounded-full border-red-500 bg-red-300" src="/logo.svg" alt="Logo" />
                    <h1 className="text-2xl text-slate-700 font-bold">NESTO<span className="text-secondary-400">PIA</span> </h1>
                </div>
                <div className="flex py-2  w-full items-center space-x-2">
                    <h1 className=" text-slate-600 font-bold"> Welcome!!, Please signin to continue </h1>
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <input
                        {...register("email", { required: "Email is required" })}
                        className="w-full p-2 border rounded outline-none focus-visible:border-secondary-400"
                        placeholder="Email"
                        type="email"
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

                    <input
                        {...register("password", { required: "Password is required" })}
                        className="w-full p-2 border outline-none focus-visible:border-secondary-400 rounded"
                        placeholder="Password"
                        type="password"
                    />
                    {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

                    <button type="submit" className="w-full p-2 bg-secondary-400/90 hover:bg-secondary-400 text-white rounded">
                        Sign In
                    </button>
                </form>

                <p className="text-center space-x-2 text-sm mt-4">
                    <span>Don&aps;t have an account?</span>
                    <a href="/signup" className="text-secondary-400 hover:underline">
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
}

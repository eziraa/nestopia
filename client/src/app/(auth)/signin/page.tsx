/* eslint-disable @next/next/no-img-element */
"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useLoginMutation, } from "@/state/auth.api";
import { LoginRequest } from "@/types/authTypes";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { login } from "@/state/slices/auth.slice";
const SIGN_UP_TOAST = "SIGN_UP_TOAST";


export default function SignIn() {

    // Getting dispatchers from the store
    const dispatch = useAppDispatch();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginRequest>();


    const [submitting, setSubmitting] = useState(false);

    const user = useAppSelector(state => state.auth.user)
    const [singup] = useLoginMutation()
    const onSubmit = async (data: LoginRequest) => {
        setSubmitting(true);
        try
        {
            if (!data.email || !data.password)
            {
                toast.error("Email and Password are required");
                return;
            }
            await singup(data).unwrap().then((res) => {
                setSubmitting(false);
                dispatch(login({
                    user: res.user,
                }));
                toast.success("Signin successful", { id: SIGN_UP_TOAST });
            }).catch((err) => {
                setSubmitting(false);
                toast.error(err.data.message, { id: SIGN_UP_TOAST });
            });

        } catch (err: any)
        {
            setSubmitting(false);
            if ('data' in err)
            {
                const { message } = err.data as { message: string }
                toast.error(message, { id: SIGN_UP_TOAST });
            }
            else
            {
                toast.error("An error occured, please try again later", { id: SIGN_UP_TOAST });
            }

        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full flex flex-col gap-4 p-10 max-w-md bg-white px-6 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                    <img className="w-12 h-12 border-2 rounded-full border-red-500 bg-red-300" src="/logo.svg" alt="Logo" />
                    <h1 className="text-2xl text-slate-700 font-bold">NESTO<span className="text-secondary-400">PIA</span> </h1>
                </div>
                <pre>
                    {
                        JSON.stringify(user, null, 2)
                    }
                </pre>
                <div className="flex py-2  w-full items-center space-x-2">
                    <h1 className=" text-slate-600 font-bold"> Welcome!!, Please signin to continue </h1>
                </div>

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

                    <button disabled={submitting} type="submit" className={(submitting && 'cursor-not-allowed ') + " w-full p-2 bg-secondary-400/90 hover:bg-secondary-400 text-white rounded"}>
                        {
                            submitting ? "Submitting" : "Signin"
                        }
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

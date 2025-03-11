'use client';

import { useRouter } from "next/navigation";


interface Props{
    children?: React.ReactNode;
    title?: string;
    status?: number;
    callbackURL?: string;
}
const ErrorPage = ({children, title, status, callbackURL}:Props) => {
    const router = useRouter()
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-slate-200 via-red-100 to-slate-200">
{children 
? 
(
    <>{children}</>
) : 
(
    <div className="flex">
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-9xl font-bold text-red-400">{status }</h1>
            <h2 className="text-3xl font-bold text-red-400">{title || "Some thing went to wrong"}</h2>
            <button className="mt-5  bg-red-200 text-red-500/90 hover:text-red-500 px-4 py-2 rounded-md" onClick={() => callbackURL && router.push(callbackURL)}>Go back</button>
        </div>
    </div>
)}
    </div>
  );
};

export default ErrorPage;

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-red-400 via-pink-500 to-purple-600">
{children 
? 
(
    <>{children}</>
) : 
(
    <div className="flex">
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-9xl font-bold text-white">{status || 404}</h1>
            <h2 className="text-3xl font-bold text-white">{title || "Some thing went to wrong"}</h2>
            <button className="mt-5 bg-white text-black px-4 py-2 rounded-md" onClick={() => callbackURL && router.push(callbackURL)}>Go back</button>
        </div>
    </div>
)}
    </div>
  );
};

export default ErrorPage;

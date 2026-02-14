import { SignUp } from "@clerk/nextjs";
import { Cloud } from "lucide-react";

export default function Page() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-500 via-rose-500 to-violet-600 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

            <div className="absolute top-10 left-10 flex items-center gap-2 text-white z-10">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <Cloud size={32} />
                </div>
                <h1 className="text-2xl font-bold">AnimDrive</h1>
            </div>

            <div className="z-10 bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/20">
                <SignUp />
            </div>
        </div>
    );
}

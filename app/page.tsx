import { MagicButton } from "@/components/ui/MagicButton";
import Link from "next/link";
import { Cloud, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-violet-100 flex flex-col relative overflow-hidden font-sans text-slate-900">
      {/* Header */}
      <header className="flex justify-between items-center p-6 md:px-12 relative z-50">
        <div className="flex items-center gap-2 text-pink-600">
          <div className="bg-white/80 p-2 rounded-xl shadow-lg shadow-pink-200/50 backdrop-blur-sm">
            <Cloud size={28} fill="currentColor" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-violet-600">AnimDrive</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <button className="px-6 py-2 rounded-full border border-pink-200 text-pink-600 hover:bg-white hover:shadow-lg transition-all duration-300 font-medium bg-white/50 backdrop-blur-sm cursor-pointer">
              Sign In
            </button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 pb-20">
        <div className="relative mb-6">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-600 to-violet-600 opacity-20 blur-lg animate-pulse" />
          <span className="relative px-4 py-1.5 rounded-full bg-white/80 border border-pink-100 text-sm font-semibold text-pink-600 shadow-sm backdrop-blur-sm">
            ✨ The Future of Cloud Storage
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
          Store your files <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-rose-500 to-violet-500 animate-text-shimmer bg-[size:200%]">Magically.</span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl font-medium leading-relaxed">
          Experience the most beautiful, animated, and secure cloud storage. Join the revolution of colorful storage today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link href="/sign-up">
            <MagicButton variant="primary" size="lg" className="text-lg px-10 py-4 shadow-xl shadow-pink-500/30 font-bold group">
              Get Started Free <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </MagicButton>
          </Link>
        </div>

        {/* Project Details Section */}
        <div className="mt-20 max-w-4xl text-left bg-white/40 backdrop-blur-md rounded-2xl p-8 border border-white/50 shadow-xl">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-violet-600 mb-6">
            About AnimDrive
          </h2>
          <div className="grid md:grid-cols-2 gap-8 text-slate-700">
            <div>
              <h3 className="font-semibold text-lg mb-2 text-pink-600">✨ Magical Storage</h3>
              <p className="text-sm leading-relaxed">
                Securely store your files with Google Drive integration, enhanced with a beautiful, animated interface that makes file management a joy.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 text-violet-600">🛡️ Admin Control</h3>
              <p className="text-sm leading-relaxed">
                Powerful admin tools including System Lockdown, detailed Access Logs, and User Management to keep your data safe and organized.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 text-rose-600">⚡ Real-time Sync</h3>
              <p className="text-sm leading-relaxed">
                Files and storage quotas sync instantly across devices. Upload, delete, and manage your content with zero latency feedback.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 text-indigo-600">🔒 Secure & Private</h3>
              <p className="text-sm leading-relaxed">
                Built with modern security standards, ensuring your personal files remain private while giving you easy access whenever you need them.
              </p>
            </div>
          </div>
        </div>

        {/* Decor Elements */}
        <div className="absolute top-1/4 left-10 w-32 h-32 bg-yellow-300 rounded-full blur-[100px] opacity-60 animate-float" />
        <div className="absolute bottom-1/4 right-10 w-40 h-40 bg-purple-400 rounded-full blur-[120px] opacity-60 animate-float animation-delay-2000" />
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-pink-400 rounded-full blur-[80px] opacity-50 animate-float animation-delay-4000" />
      </main>

      {/* Footer Mock */}
      <footer className="py-6 text-center text-slate-500 text-sm relative z-10 bg-white/30 backdrop-blur-md border-t border-white/20">
        <p>© 2026 AnimDrive. Developed by <span className="font-bold text-pink-600">Muthuraj C</span>.</p>
        <p className="text-xs mt-1 text-slate-400">Made with ❤️ and lots of magic.</p>
      </footer>
    </div>
  );
}

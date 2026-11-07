import Link from "next/link";

export default function AuthLayout({ children, subtitle }) {
  return (
    <main className="flex min-h-screen bg-[#080d1c]">
      <section className="hidden w-1/2 flex-col justify-between overflow-hidden border-r border-white/10 bg-gradient-to-br from-blue-950 via-[#101e40] to-[#080d1c] p-12 lg:flex">
        <Link href="/" className="text-3xl font-black text-white">
          ZTICK<span className="text-blue-500">.</span>
        </Link>

        <div className="relative z-10 max-w-lg">
          <div className="mb-6 inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-bold tracking-widest text-blue-300">
            YOUR EVENT STARTS HERE
          </div>

          <h1 className="text-6xl font-black leading-tight text-white">
            Every Event.
            <br />
            <span className="text-blue-400">One Ticket Away.</span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-400">
            Temukan event favoritmu, pesan tiket dengan mudah, dan ciptakan
            pengalaman yang tidak terlupakan bersama ZTICK.
          </p>
        </div>

        <p className="text-sm text-slate-500">
          © 2026 ZTICK. All rights reserved.
        </p>

        <div className="absolute left-1/4 top-1/3 h-80 w-80 rounded-full bg-blue-600/20 blur-[120px]" />
      </section>

      <section className="flex w-full items-center justify-center px-5 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 inline-block text-2xl font-black text-white lg:hidden">
            ZTICK<span className="text-blue-500">.</span>
          </Link>

          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-blue-400">
            Welcome to ZTICK
          </p>

          {children}

          <p className="mt-8 text-center text-xs text-slate-600">
            {subtitle}
          </p>
        </div>
      </section>
    </main>
  );
}
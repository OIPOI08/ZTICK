import Link from "next/link";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#080d1c] text-white">
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/10 bg-[#0c1428] p-6">
        <Link href="/" className="mb-10 text-3xl font-black">
          ZTICK<span className="text-blue-500">.</span>
        </Link>

        <nav className="flex flex-col gap-3">
          <Link
            href="/"
            className="rounded-xl px-4 py-3 text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <span>⌂</span> Beranda
          </Link>

          <Link
            href="/dashboard/admin"
            className="rounded-xl px-4 py-3 text-slate-300 hover:bg-white/10 hover:text-white"
          >
            Dashboard Admin
          </Link>

          <Link
            href="/dashboard/admin/checkin"
            className="rounded-xl px-4 py-3 text-slate-300 hover:bg-white/10 hover:text-white"
          >
            QR Ticket Scanner
          </Link>
        </nav>
      </aside>

      <main className="min-h-screen pl-64">
        {children}
      </main>
    </div>
  );
}
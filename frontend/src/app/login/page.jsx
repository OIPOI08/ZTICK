
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "../components/AuthLayout";
import { loginUser } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginUser(form);
      const role = result.data?.user?.role;

      const dashboardRoutes = {
        customer: "/dashboard/customer",
        event_organizer: "/dashboard/organizer",
        admin: "/dashboard/admin",
      };

      const destination = dashboardRoutes[role];

      if (!destination) {
        setError("Role akun tidak dikenali.");
        return;
      }

      router.push(destination);
    } catch (err) {
      setError(err.message || "Login gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout subtitle="Secure ticketing platform">
      <h2 className="text-3xl font-black text-white">
        Selamat datang!
      </h2>

      <p className="mt-3 text-sm text-slate-400">
        Masuk ke akun ZTICK untuk melanjutkan.
      </p>

      <form onSubmit={handleSubmit} className="mt-9 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-300">
            Email
          </label>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="nama@email.com"
            required
            className="w-full rounded-xl border border-white/10 bg-[#10182b] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />
        </div>

        <div>
          <div className="mb-2 flex justify-between">
            <label className="text-sm font-semibold text-slate-300">
              Password
            </label>

            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              Lupa password?
            </Link>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Masukkan password"
              required
              className="w-full rounded-xl border border-white/10 bg-[#10182b] px-4 py-3.5 pr-20 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-400"
            >
              {showPassword ? "Sembunyikan" : "Lihat"}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Sedang masuk..." : "Masuk ke Akun →"}
        </button>
      </form>

      <div className="my-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-slate-500">ATAU</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <p className="text-center text-sm text-slate-400">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-bold text-blue-400 hover:text-blue-300"
        >
          Daftar sekarang
        </Link>
      </p>

      <Link
        href="/"
        className="mt-8 block text-center text-sm text-slate-500 transition hover:text-white"
      >
        ← Kembali ke Beranda
      </Link>
    </AuthLayout>
  );
}


"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "../components/AuthLayout";
import { registerUser } from "../../lib/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
    setSuccess("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (form.password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser(form);

      setSuccess(
        result.message ||
          "Registrasi berhasil. Silakan cek email untuk verifikasi."
      );

      setForm({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err) {
      setError(err.message || "Registrasi gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout subtitle="Create your ZTICK account">
      <h2 className="text-3xl font-black text-white">
        Buat akun baru
      </h2>

      <p className="mt-3 text-sm text-slate-400">
        Bergabung dan temukan berbagai event menarik.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-300">
            Nama lengkap
          </label>

          <input
            type="text"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Nama lengkap kamu"
            minLength={2}
            maxLength={150}
            required
            className="auth-input"
          />
        </div>

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
            className="auth-input"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-300">
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimal 8 karakter"
              minLength={8}
              required
              className="auth-input pr-20"
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

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-300">
            Konfirmasi password
          </label>

          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Ulangi password"
            minLength={8}
            required
            className="auth-input"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Mendaftarkan akun..." : "Buat Akun →"}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-400">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-bold text-blue-400 hover:text-blue-300"
        >
          Masuk
        </Link>
      </p>

      <Link
        href="/"
        className="mt-6 block text-center text-sm text-slate-500 transition hover:text-white"
      >
        ← Kembali ke Beranda
      </Link>
    </AuthLayout>
  );
}

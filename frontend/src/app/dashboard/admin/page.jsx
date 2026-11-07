
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Ticket,
  Receipt,
  LoaderCircle,
  LogOut,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function formatDate(date) {
  if (!date) return "Tanggal belum tersedia";

  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatPrice(price) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
}

export default function CustomerDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("ztick_token");
    const savedUser = localStorage.getItem("ztick_user");

    if (!token || !savedUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);

      if (parsedUser.role !== "customer") {
        router.replace("/login");
        return;
      }

      setUser(parsedUser);
    } catch {
      localStorage.removeItem("ztick_token");
      localStorage.removeItem("ztick_user");
      router.replace("/login");
    }
  }, [router]);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const results = await Promise.allSettled([
        apiRequest("/api/events/public"),
        apiRequest("/api/orders/my-orders"),
        apiRequest("/api/tickets/my-tickets"),
      ]);

      if (results[0].status === "fulfilled") {
        const data = results[0].value?.data;
        setEvents(Array.isArray(data) ? data : []);
      }

      if (results[1].status === "fulfilled") {
        const data = results[1].value?.data;
        setOrders(Array.isArray(data) ? data : []);
      }

      if (results[2].status === "fulfilled") {
        const data = results[2].value?.data;
        setTickets(Array.isArray(data) ? data : []);
      }

      if (results.every((result) => result.status === "rejected")) {
        throw results[0].reason;
      }
    } catch (err) {
      console.error("CUSTOMER DASHBOARD ERROR:", err);
      setError(err.message || "Gagal memuat dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchDashboard();
  }, [user, fetchDashboard]);

  function handleLogout() {
    localStorage.removeItem("ztick_token");
    localStorage.removeItem("ztick_user");
    router.replace("/login");
  }

  const paidOrders = orders.filter(
    (order) => order.status === "paid"
  ).length;

  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const recentEvents = events.slice(0, 4);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#080d1c] flex items-center justify-center">
        <LoaderCircle className="animate-spin text-blue-400" size={35} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#080d1c] text-white">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-[#080d1c]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/dashboard/customer">
            <h1 className="text-2xl font-extrabold tracking-wider text-blue-500">
              ZTICK<span className="text-white">.</span>
            </h1>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm">
            <Link
              href="/dashboard/customer"
              className="text-blue-400 font-semibold"
            >
              Beranda
            </Link>

            <Link
              href="/dashboard/customer/events"
              className="text-gray-400 hover:text-white transition"
            >
              Jelajahi Event
            </Link>

            <Link
              href="/dashboard/customer/orders"
              className="text-gray-400 hover:text-white transition"
            >
              Riwayat Pesanan
            </Link>

            <Link
              href="/dashboard/customer/tickets"
              className="text-gray-400 hover:text-white transition"
            >
              Tiket Saya
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition"
          >
            <LogOut size={17} />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* WELCOME */}
        <section className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#142b55] via-[#10203d] to-[#111a30] p-8 md:p-12 mb-8">
          <div className="absolute -right-16 -top-20 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 text-blue-300 text-sm font-semibold mb-4">
              <Sparkles size={17} />
              CUSTOMER DASHBOARD
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Halo, {user.full_name || "Customer"}!
            </h2>

            <p className="text-gray-300 mt-4 leading-relaxed">
              Selamat datang di ZTICK. Temukan event menarik,
              pesan tiket, dan nikmati pengalaman acara favoritmu.
            </p>

            <Link
              href="/dashboard/customer/events"
              className="inline-flex items-center gap-2 mt-7 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold transition"
            >
              Jelajahi Event
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            {error}
            <button
              onClick={fetchDashboard}
              className="ml-3 underline font-semibold"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* STATISTICS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-[#111a30] border border-white/10 rounded-2xl p-5">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-400">Total Pesanan</p>
              <Receipt className="text-blue-400" size={23} />
            </div>
            <h3 className="text-3xl font-bold mt-4">
              {loading ? "-" : orders.length}
            </h3>
          </div>

          <div className="bg-[#111a30] border border-white/10 rounded-2xl p-5">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-400">Sudah Dibayar</p>
              <CheckCircle2 className="text-green-400" size={23} />
            </div>
            <h3 className="text-3xl font-bold mt-4">
              {loading ? "-" : paidOrders}
            </h3>
          </div>

          <div className="bg-[#111a30] border border-white/10 rounded-2xl p-5">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-400">Menunggu Pembayaran</p>
              <Clock className="text-yellow-400" size={23} />
            </div>
            <h3 className="text-3xl font-bold mt-4">
              {loading ? "-" : pendingOrders}
            </h3>
          </div>

          <div className="bg-[#111a30] border border-white/10 rounded-2xl p-5">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-400">Tiket Dimiliki</p>
              <Ticket className="text-purple-400" size={23} />
            </div>
            <h3 className="text-3xl font-bold mt-4">
              {loading ? "-" : tickets.length}
            </h3>
          </div>
        </section>

        {/* QUICK MENU */}
        <section className="mb-10">
          <h3 className="text-xl font-bold mb-5">Menu Customer</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/dashboard/customer/events"
              className="group bg-[#111a30] border border-white/10 hover:border-blue-500/50 rounded-2xl p-6 transition"
            >
              <Search className="text-blue-400 mb-4" size={28} />
              <h4 className="font-bold">Jelajahi Event</h4>
              <p className="text-sm text-gray-400 mt-2">
                Temukan berbagai event menarik.
              </p>
              <ArrowRight className="text-blue-400 mt-5 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href="/dashboard/customer/orders"
              className="group bg-[#111a30] border border-white/10 hover:border-blue-500/50 rounded-2xl p-6 transition"
            >
              <Receipt className="text-green-400 mb-4" size={28} />
              <h4 className="font-bold">Riwayat Pesanan</h4>
              <p className="text-sm text-gray-400 mt-2">
                Pantau status transaksi tiketmu.
              </p>
              <ArrowRight className="text-blue-400 mt-5 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href="/dashboard/customer/tickets"
              className="group bg-[#111a30] border border-white/10 hover:border-blue-500/50 rounded-2xl p-6 transition"
            >
              <Ticket className="text-purple-400 mb-4" size={28} />
              <h4 className="font-bold">Tiket Saya</h4>
              <p className="text-sm text-gray-400 mt-2">
                Lihat tiket dan QR Code milikmu.
              </p>
              <ArrowRight className="text-blue-400 mt-5 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </section>

        {/* EVENTS */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-blue-400 text-sm font-semibold">
                TEMUKAN EVENT
              </p>
              <h3 className="text-2xl font-bold mt-1">
                Event Terbaru
              </h3>
            </div>

            <Link
              href="/dashboard/customer/events"
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2"
            >
              Lihat Semua
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="py-16 flex justify-center text-blue-400">
              <LoaderCircle className="animate-spin" size={32} />
            </div>
          ) : recentEvents.length === 0 ? (
            <div className="bg-[#111a30] border border-white/10 rounded-2xl p-10 text-center">
              <CalendarDays
                size={35}
                className="mx-auto text-gray-500 mb-4"
              />
              <p className="font-semibold">Belum ada event tersedia</p>
              <p className="text-sm text-gray-400 mt-2">
                Coba cek kembali nanti.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recentEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/dashboard/customer/events/${event.id}`}
                  className="group bg-[#111a30] border border-white/10 hover:border-blue-500/50 rounded-2xl overflow-hidden transition"
                >
                  <div className="h-44 bg-[#1b2945] overflow-hidden">
                    {event.poster_url ? (
                      <img
                        src={event.poster_url}
                        alt={event.title || "Poster event"}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Ticket size={42} className="text-gray-600" />
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h4 className="font-bold line-clamp-2 min-h-12">
                      {event.title}
                    </h4>

                    <div className="text-xs text-gray-400 mt-4 space-y-2">
                      <p className="flex items-center gap-2">
                        <CalendarDays size={14} />
                        {formatDate(event.start_date)}
                      </p>

                      <p className="flex items-center gap-2">
                        <MapPin size={14} />
                        {event.venue_name || event.city || "Lokasi belum tersedia"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10">
                      <span className="text-blue-400 text-sm font-semibold">
                        {event.min_price != null
                          ? `Mulai ${formatPrice(event.min_price)}`
                          : "Lihat detail"}
                      </span>
                      <ArrowRight size={17} className="text-blue-400" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <footer className="border-t border-white/10 mt-14 py-7 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} ZTICK. All rights reserved.
        </footer>
      </div>
    </main>
  );
}

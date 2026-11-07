
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin,
  Ticket,
  Receipt,
  LoaderCircle,
  RefreshCw,
  XCircle,
  Eye,
  Package,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

const FILTERS = [
  { label: "Semua", value: "all" },
  { label: "Menunggu", value: "pending" },
  { label: "Dibayar", value: "paid" },
  { label: "Kedaluwarsa", value: "expired" },
  { label: "Dibatalkan", value: "cancelled" },
  { label: "Refund", value: "refunded" },
];

const STATUS = {
  pending: {
    label: "Menunggu Pembayaran",
    className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    icon: Clock,
  },
  paid: {
    label: "Sudah Dibayar",
    className: "bg-green-500/10 text-green-400 border-green-500/20",
    icon: CheckCircle2,
  },
  expired: {
    label: "Kedaluwarsa",
    className: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    icon: AlertCircle,
  },
  cancelled: {
    label: "Dibatalkan",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
    icon: XCircle,
  },
  refunded: {
    label: "Refund",
    className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    icon: RefreshCw,
  },
};

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(price) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
}

function getEvent(item) {
  return item?.ticket_categories?.events || null;
}

function getCategory(item) {
  return item?.ticket_categories || null;
}

export default function CustomerOrdersPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [canceling, setCanceling] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

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
      localStorage.removeItem("ztick_user");
      localStorage.removeItem("ztick_token");
      router.replace("/login");
    }
  }, [router]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await apiRequest("/api/orders/my-orders");

      if (result.success && Array.isArray(result.data)) {
        setOrders(result.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("GET ORDERS ERROR:", err);
      setError(err.message || "Gagal mengambil riwayat pesanan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user, fetchOrders]);

  async function handleCancel(orderId) {
    const confirmed = window.confirm(
      "Yakin ingin membatalkan pesanan ini?"
    );

    if (!confirmed) return;

    setCanceling(orderId);

    try {
      await apiRequest(`/api/orders/${orderId}/cancel`, {
        method: "PATCH",
      });

      await fetchOrders();

      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }

      alert("Pesanan berhasil dibatalkan.");
    } catch (err) {
      alert(err.message || "Gagal membatalkan pesanan.");
    } finally {
      setCanceling(null);
    }
  }

  async function handleDetail(orderId) {
    setDetailLoading(true);

    try {
      const result = await apiRequest(`/api/orders/${orderId}`);

      if (result.success) {
        setSelectedOrder(result.data);
      } else {
        alert("Detail pesanan tidak ditemukan.");
      }
    } catch (err) {
      alert(err.message || "Gagal mengambil detail pesanan.");
    } finally {
      setDetailLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("ztick_token");
    localStorage.removeItem("ztick_user");
    router.replace("/login");
  }

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) => order.status === filter);

  const totalOrders = orders.length;
  const paidOrders = orders.filter(
    (order) => order.status === "paid"
  ).length;
  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#080d1c] flex items-center justify-center text-blue-400">
        <LoaderCircle className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#080d1c] text-white">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-[#080d1c]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link href="/dashboard/customer">
            <h1 className="text-2xl font-extrabold tracking-wider text-blue-500">
              ZTICK<span className="text-white">.</span>
            </h1>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm">
            <Link
              href="/dashboard/customer"
              className="text-gray-400 hover:text-white transition"
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
              className="text-blue-400 font-semibold"
            >
              Riwayat Pesanan
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-gray-400">
              {user.full_name || "Customer"}
            </span>

            <button
              onClick={handleLogout}
              className="text-sm text-red-400 hover:text-red-300 transition"
            >
              Keluar
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* HEADER */}
        <div className="mb-8">
          <Link
            href="/dashboard/customer"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition mb-6"
          >
            <ArrowLeft size={17} />
            Kembali ke Dashboard
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <p className="text-blue-400 text-sm font-semibold">
                CUSTOMER AREA
              </p>

              <h2 className="text-3xl md:text-4xl font-extrabold mt-2">
                Riwayat Pesanan
              </h2>

              <p className="text-gray-400 mt-3">
                Pantau semua transaksi dan pesanan tiket kamu.
              </p>
            </div>

            <button
              onClick={fetchOrders}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/10 bg-[#111a30] hover:border-blue-500/50 transition text-sm"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* STATISTICS */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#111a30] border border-white/10 rounded-2xl p-5">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-400">Total Pesanan</p>
              <Receipt className="text-blue-400" size={22} />
            </div>
            <h3 className="text-3xl font-bold mt-3">{totalOrders}</h3>
          </div>

          <div className="bg-[#111a30] border border-white/10 rounded-2xl p-5">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-400">Sudah Dibayar</p>
              <CheckCircle2 className="text-green-400" size={22} />
            </div>
            <h3 className="text-3xl font-bold mt-3">{paidOrders}</h3>
          </div>

          <div className="bg-[#111a30] border border-white/10 rounded-2xl p-5">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-400">Menunggu Pembayaran</p>
              <Clock className="text-yellow-400" size={22} />
            </div>
            <h3 className="text-3xl font-bold mt-3">{pendingOrders}</h3>
          </div>
        </section>

        {/* FILTER */}
        <section className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-medium border transition ${
                  filter === item.value
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-[#111a30] border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {/* ORDER LIST */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-blue-400">
            <LoaderCircle size={35} className="animate-spin" />
            <p className="text-sm text-gray-400 mt-4">
              Memuat riwayat pesanan...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
            <AlertCircle className="mx-auto text-red-400 mb-3" size={35} />
            <p className="font-semibold">Gagal memuat pesanan</p>
            <p className="text-sm text-gray-400 mt-2">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm"
            >
              Coba Lagi
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-[#111a30] border border-white/10 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-5">
              <Package size={32} />
            </div>

            <h3 className="text-xl font-bold">
              {filter === "all"
                ? "Belum Ada Pesanan"
                : "Pesanan Tidak Ditemukan"}
            </h3>

            <p className="text-sm text-gray-400 mt-3 max-w-md mx-auto">
              {filter === "all"
                ? "Kamu belum memiliki pesanan tiket. Yuk, temukan event menarik sekarang."
                : "Tidak ada pesanan dengan status yang dipilih."}
            </p>

            {filter === "all" && (
              <Link
                href="/dashboard/customer/events"
                className="inline-flex items-center gap-2 mt-6 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-semibold transition"
              >
                Jelajahi Event
                <ArrowRight size={17} />
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => {
              const status = STATUS[order.status] || STATUS.pending;
              const StatusIcon = status.icon;
              const items = order.order_items || [];
              const firstItem = items[0];
              const event = getEvent(firstItem);
              const category = getCategory(firstItem);
              const itemCount = items.reduce(
                (total, item) => total + Number(item.quantity || 0),
                0
              );

              return (
                <article
                  key={order.id}
                  className="bg-[#111a30] border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/30 transition"
                >
                  <div className="p-5 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                      <div>
                        <p className="text-xs text-gray-500">
                          KODE PESANAN
                        </p>
                        <p className="font-bold text-blue-400 mt-1">
                          {order.order_code || order.id}
                        </p>
                      </div>

                      <span
                        className={`inline-flex items-center gap-2 w-fit px-3 py-2 rounded-lg border text-xs font-semibold ${status.className}`}
                      >
                        <StatusIcon size={15} />
                        {status.label}
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-5">
                      <div className="w-full md:w-44 h-36 shrink-0 rounded-xl overflow-hidden bg-[#1b2945]">
                        {event?.poster_url ? (
                          <img
                            src={event.poster_url}
                            alt={event.title || "Poster event"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <Ticket size={42} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg md:text-xl font-bold">
                          {event?.title || "Informasi Event"}
                        </h3>

                        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 text-sm text-gray-400">
                          <span className="flex items-center gap-2">
                            <CalendarDays size={15} />
                            {event?.start_date
                              ? formatDate(event.start_date)
                              : "Tanggal belum tersedia"}
                          </span>

                          <span className="flex items-center gap-2">
                            <MapPin size={15} />
                            {event?.venue_name || event?.city || "Lokasi belum tersedia"}
                          </span>
                        </div>

                        <div className="mt-4 text-sm text-gray-400">
                          <p>
                            Kategori:{" "}
                            <span className="text-white">
                              {category?.name || "Tiket"}
                            </span>
                          </p>
                          <p className="mt-1">
                            Jumlah:{" "}
                            <span className="text-white">
                              {itemCount} tiket
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="md:min-w-48 md:text-right flex flex-row md:flex-col justify-between md:justify-center border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
                        <div>
                          <p className="text-xs text-gray-500">
                            Total Pembayaran
                          </p>
                          <p className="text-xl font-bold text-blue-400 mt-2">
                            {formatPrice(order.total_amount)}
                          </p>
                        </div>

                        <p className="text-xs text-gray-500 mt-2">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>

                    {order.status === "pending" && order.expires_at && (
                      <div className="mt-5 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10 text-yellow-400 text-xs flex items-center gap-2">
                        <Clock size={15} />
                        Batas pembayaran: {formatDate(order.expires_at)}
                      </div>
                    )}

                    <div className="border-t border-white/10 mt-5 pt-5 flex flex-wrap justify-end gap-3">
                      <button
                        onClick={() => handleDetail(order.id)}
                        disabled={detailLoading}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 hover:border-blue-500/50 text-sm transition"
                      >
                        {detailLoading ? (
                          <LoaderCircle size={16} className="animate-spin" />
                        ) : (
                          <Eye size={16} />
                        )}
                        Detail Pesanan
                      </button>

                      {order.status === "pending" && (
                        <button
                          onClick={() => handleCancel(order.id)}
                          disabled={canceling === order.id}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm transition disabled:opacity-50"
                        >
                          {canceling === order.id ? (
                            <LoaderCircle size={16} className="animate-spin" />
                          ) : (
                            <XCircle size={16} />
                          )}
                          Batalkan Pesanan
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* DETAIL MODAL */}
        {selectedOrder && (
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <div
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#111a30] border border-white/10 rounded-2xl p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex justify-between items-start gap-4 mb-6">
                <div>
                  <p className="text-xs text-blue-400 font-semibold">
                    DETAIL TRANSAKSI
                  </p>
                  <h3 className="text-xl font-bold mt-2">
                    {selectedOrder.order_code}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400"
                >
                  <XCircle size={22} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-[#080d1c] rounded-xl p-4">
                  <p className="text-xs text-gray-500">STATUS PESANAN</p>
                  <p className="font-semibold mt-2">
                    {STATUS[selectedOrder.status]?.label ||
                      selectedOrder.status}
                  </p>
                </div>

                <div className="bg-[#080d1c] rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-3">
                    ITEM PESANAN
                  </p>

                  {(selectedOrder.order_items || []).map((item) => {
                    const event = getEvent(item);
                    const category = getCategory(item);

                    return (
                      <div
                        key={item.id}
                        className="border-b border-white/10 last:border-0 py-3 first:pt-0 last:pb-0"
                      >
                        <p className="font-semibold">
                          {event?.title || "Event"}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {category?.name || "Tiket"} · {item.quantity} tiket
                        </p>
                        <p className="text-sm text-blue-400 mt-2">
                          {formatPrice(item.subtotal)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-[#080d1c] rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Dibuat</span>
                    <span>{formatDate(selectedOrder.created_at)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Dibayar</span>
                    <span>{formatDate(selectedOrder.paid_at)}</span>
                  </div>

                  <div className="flex justify-between border-t border-white/10 pt-3">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-blue-400 text-lg">
                      {formatPrice(selectedOrder.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-500 rounded-xl py-3 font-semibold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        <footer className="border-t border-white/10 mt-12 py-7 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} ZTICK. All rights reserved.
        </footer>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Ticket,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

function formatPrice(price) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price || 0);
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function CheckoutPage() {
  const router = useRouter();

  const [event, setEvent] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    async function loadCheckout() {
      try {
        const token = localStorage.getItem("ztick_token");

        if (!token) {
          router.replace("/login");
          return;
        }

        const params = new URLSearchParams(window.location.search);

        const eventId = params.get("event_id");
        const ticketId = params.get("ticket_category_id");
        const selectedQuantity = Number(params.get("quantity"));

        if (
          !eventId ||
          !ticketId ||
          !Number.isInteger(selectedQuantity) ||
          selectedQuantity < 1
        ) {
          throw new Error("Informasi checkout tidak valid.");
        }

        setQuantity(selectedQuantity);

        const result = await apiRequest(`/api/events/${eventId}`);

        if (!result.success || !result.data) {
          throw new Error("Event tidak ditemukan.");
        }

        const foundTicket = (result.data.ticket_categories || []).find(
          (item) => String(item.id) === ticketId
        );

        if (!foundTicket) {
          throw new Error("Kategori tiket tidak ditemukan.");
        }

        setEvent(result.data);
        setTicket(foundTicket);
      } catch (err) {
        setError(err.message || "Gagal memuat checkout.");
      } finally {
        setLoading(false);
      }
    }

    loadCheckout();
  }, [router]);

  const total = Number(ticket?.price || 0) * quantity;

  // Membuat transaksi pembayaran Midtrans
  async function createPayment(currentOrderId) {
    if (!currentOrderId) {
      throw new Error("Order ID tidak ditemukan.");
    }

    const result = await apiRequest("/api/payments/create", {
      method: "POST",
      body: JSON.stringify({
        order_id: currentOrderId,
      }),
    });

    const redirectUrl = result.data?.redirect_url;

    if (!result.success || !redirectUrl) {
      throw new Error(
        result.message ||
          "Gagal mendapatkan halaman pembayaran Midtrans."
      );
    }

    // Redirect ke halaman pembayaran Midtrans
    window.location.href = redirectUrl;
  }

  // Membuat pesanan sekaligus memulai pembayaran
  async function handleCreateOrder() {
    if (!ticket || processing || orderId) return;

    try {
      setProcessing(true);
      setError("");

      const result = await apiRequest("/api/orders/", {
        method: "POST",
        body: JSON.stringify({
          ticket_category_id: ticket.id,
          quantity,
        }),
      });

      const newOrderId = result.data?.order_id;

      if (!result.success || !newOrderId) {
        throw new Error(result.message || "Pesanan gagal dibuat.");
      }

      // Simpan ID pesanan untuk mencegah pesanan ganda
      setOrderId(newOrderId);

      // Langsung buat transaksi pembayaran
      await createPayment(newOrderId);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat checkout.");
    } finally {
      setProcessing(false);
    }
  }

  // Melanjutkan pembayaran dari pesanan yang sudah dibuat
  async function handleRetryPayment() {
    if (!orderId || processing) return;

    try {
      setProcessing(true);
      setError("");

      await createPayment(orderId);
    } catch (err) {
      setError(
        err.message || "Gagal membuat pembayaran. Silakan coba lagi."
      );
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080d1c] flex items-center justify-center text-blue-400">
        <LoaderCircle className="animate-spin" size={35} />
      </main>
    );
  }

  if (error && !event) {
    return (
      <main className="min-h-screen bg-[#080d1c] text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <AlertCircle
            size={45}
            className="text-red-400 mx-auto mb-4"
          />

          <h1 className="text-2xl font-bold">Checkout gagal</h1>

          <p className="text-gray-400 mt-3">{error}</p>

          <Link
            href="/dashboard/customer/events"
            className="inline-block mt-6 bg-blue-600 px-5 py-3 rounded-xl"
          >
            Kembali ke Event
          </Link>
        </div>
      </main>
    );
  }

  // Tampilan ketika pesanan sudah dibuat
  if (orderId) {
    return (
      <main className="min-h-screen bg-[#080d1c] text-white flex items-center justify-center px-6">
        <div className="max-w-lg w-full bg-[#111a30] border border-white/10 rounded-2xl p-8 text-center">
          <CheckCircle2
            size={60}
            className="text-green-400 mx-auto mb-5"
          />

          <h1 className="text-2xl font-bold">
            Pesanan Berhasil Dibuat!
          </h1>

          <p className="text-gray-400 mt-3">
            Pesanan kamu sudah tersimpan di ZTICK.
          </p>

          <div className="bg-[#080d1c] rounded-xl p-4 mt-7 text-left">
            <p className="text-xs text-gray-500">Order ID</p>

            <p className="text-sm font-semibold break-all mt-2">
              {orderId}
            </p>

            <div className="border-t border-white/10 my-4" />

            <p className="text-xs text-gray-500">Total pesanan</p>

            <p className="text-xl text-blue-400 font-bold mt-2">
              {formatPrice(total)}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mt-5 text-sm text-red-300">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertCircle size={18} />
                Pembayaran belum berhasil dibuat.
              </div>

              {error}
            </div>
          )}

          <button
            onClick={handleRetryPayment}
            disabled={processing}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl py-4 mt-6 font-semibold flex items-center justify-center gap-2 transition"
          >
            {processing ? (
              <>
                <LoaderCircle className="animate-spin" size={19} />
                Menyiapkan Pembayaran...
              </>
            ) : (
              <>
                <CreditCard size={19} />
                Lanjutkan Pembayaran
              </>
            )}
          </button>

          <Link
            href="/dashboard/customer"
            className="block w-full border border-white/10 hover:bg-white/5 rounded-xl py-4 mt-3 font-semibold transition"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080d1c] text-white">
      <nav className="border-b border-white/10 px-6 py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link
            href="/dashboard/customer"
            className="text-2xl font-extrabold text-blue-500"
          >
            ZTICK.
          </Link>

          <span className="text-sm text-gray-400">Checkout</span>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 py-10">
        <Link
          href={`/dashboard/customer/events/${event.id}`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft size={18} />
          Kembali ke Detail Event
        </Link>

        <h1 className="text-3xl font-bold">Checkout Pesanan</h1>

        <p className="text-gray-400 mt-2">
          Periksa kembali detail tiket sebelum membuat pesanan.
        </p>

        <div className="grid lg:grid-cols-[1.4fr_0.8fr] gap-7 mt-8">
          <div className="bg-[#111a30] border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6">Detail Event</h2>

            {event.poster_url && (
              <img
                src={event.poster_url}
                alt={event.title}
                className="w-full h-56 object-cover rounded-xl mb-6"
              />
            )}

            <h3 className="text-xl font-bold">{event.title}</h3>

            <div className="flex items-center gap-3 text-gray-400 mt-4">
              <CalendarDays size={18} className="text-blue-400" />
              {formatDate(event.start_date)}
            </div>

            <div className="flex items-center gap-3 text-gray-400 mt-3">
              <MapPin size={18} className="text-blue-400" />
              {event.venue_name || event.city || "Lokasi belum tersedia"}
            </div>

            <div className="border-t border-white/10 my-6" />

            <h3 className="font-bold mb-4">Tiket Dipilih</h3>

            <div className="bg-[#080d1c] rounded-xl p-5">
              <div className="flex items-center gap-3">
                <Ticket className="text-blue-400" size={22} />

                <div>
                  <p className="font-semibold">{ticket?.name}</p>

                  <p className="text-sm text-gray-400">
                    {formatPrice(ticket?.price)} / tiket
                  </p>
                </div>
              </div>

              <div className="flex justify-between mt-5 text-sm">
                <span className="text-gray-400">Jumlah tiket</span>
                <span>{quantity} tiket</span>
              </div>
            </div>
          </div>

          <aside className="bg-[#111a30] border border-white/10 rounded-2xl p-6 h-fit">
            <h2 className="text-xl font-bold">
              Ringkasan Pembayaran
            </h2>

            <div className="flex justify-between text-sm mt-7">
              <span className="text-gray-400">
                {ticket?.name} × {quantity}
              </span>

              <span>{formatPrice(total)}</span>
            </div>

            <div className="border-t border-white/10 my-6" />

            <div className="flex justify-between items-center">
              <span className="font-semibold">Total</span>

              <span className="text-2xl font-bold text-blue-400">
                {formatPrice(total)}
              </span>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mt-5 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              onClick={handleCreateOrder}
              disabled={processing || !ticket}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl py-4 mt-7 font-semibold flex items-center justify-center gap-2 transition"
            >
              {processing ? (
                <>
                  <LoaderCircle className="animate-spin" size={19} />
                  Memproses...
                </>
              ) : (
                <>
                  <CreditCard size={19} />
                  Buat Pesanan & Bayar
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Kamu akan diarahkan ke halaman pembayaran Midtrans.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
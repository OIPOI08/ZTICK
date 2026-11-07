
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Ticket,
  Minus,
  Plus,
  LoaderCircle,
  Clock,
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
  if (!date) return "Belum tersedia";

  return new Date(date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isTicketAvailable(ticket) {
  const now = new Date();

  const start = ticket.sales_start
    ? new Date(ticket.sales_start)
    : null;

  const end = ticket.sales_end
    ? new Date(ticket.sales_end)
    : null;

  const remaining =
    Number(ticket.quota || 0) - Number(ticket.sold || 0);

  return (
    remaining > 0 &&
    (!start || start <= now) &&
    (!end || end >= now)
  );
}

// Komponen utama halaman
export default function EventDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#080d1c] flex items-center justify-center text-blue-400">
          <LoaderCircle className="animate-spin" size={36} />
        </main>
      }
    >
      <EventDetailContent />
    </Suspense>
  );
}

// Seluruh penggunaan useParams berada di dalam Suspense
function EventDetailContent() {
  const params = useParams();
  const router = useRouter();

  const eventId = params.event_id;

  const [event, setEvent] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!eventId) return;

    let isMounted = true;

    async function fetchDetail() {
      try {
        setLoading(true);
        setError("");

        const result = await apiRequest(
          `/api/events/${eventId}`
        );

        if (!result.success || !result.data) {
          throw new Error("Event tidak ditemukan.");
        }

        if (isMounted) {
          setEvent(result.data);
          setSelectedTicket(null);
          setQuantity(1);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.message || "Gagal mengambil detail event."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  const tickets = (event?.ticket_categories || []).filter(
    isTicketAvailable
  );

  const remaining = selectedTicket
    ? Math.max(
        0,
        Number(selectedTicket.quota || 0) -
          Number(selectedTicket.sold || 0)
      )
    : 0;

  const total = selectedTicket
    ? Number(selectedTicket.price || 0) * quantity
    : 0;

  function chooseTicket(ticket) {
    setSelectedTicket(ticket);
    setQuantity(1);
  }

  function handleCheckout() {
    if (!selectedTicket || quantity < 1 || quantity > remaining) {
      return;
    }

    const query = new URLSearchParams({
      event_id: String(event.id),
      ticket_category_id: String(selectedTicket.id),
      quantity: String(quantity),
    });

    router.push(
      `/dashboard/customer/checkout?${query.toString()}`
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080d1c] flex items-center justify-center text-blue-400">
        <LoaderCircle className="animate-spin" size={36} />
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="min-h-screen bg-[#080d1c] text-white flex flex-col items-center justify-center px-6">
        <Ticket size={48} className="text-gray-500 mb-4" />

        <h1 className="text-2xl font-bold">
          Event tidak ditemukan
        </h1>

        <p className="text-gray-400 mt-2 text-center">
          {error || "Event ini mungkin sudah tidak tersedia."}
        </p>

        <Link
          href="/dashboard/customer/events"
          className="mt-6 bg-blue-600 px-5 py-3 rounded-xl"
        >
          Kembali ke Event
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080d1c] text-white">
      {/* Navbar */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link
            href="/dashboard/customer"
            className="text-2xl font-bold text-blue-500"
          >
            ZTICK
          </Link>

          <Link
            href="/dashboard/customer/events"
            className="text-sm text-gray-400 hover:text-white"
          >
            Jelajahi Event
          </Link>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-8">
        <Link
          href="/dashboard/customer/events"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft size={18} />
          Kembali ke daftar event
        </Link>

        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8">
          {/* Informasi Event */}
          <div>
            <div className="rounded-2xl overflow-hidden bg-[#111a30] border border-white/10">
              {event.poster_url ? (
                <img
                  src={event.poster_url}
                  alt={event.title}
                  className="w-full max-h-[480px] object-cover"
                />
              ) : (
                <div className="aspect-video flex items-center justify-center">
                  <Ticket size={60} className="text-gray-600" />
                </div>
              )}
            </div>

            <div className="mt-8">
              <span className="text-sm text-blue-400 font-semibold">
                {event.categories?.name || "EVENT"}
              </span>

              <h1 className="text-3xl md:text-4xl font-bold mt-3">
                {event.title}
              </h1>

              {/* Tanggal dan Lokasi */}
              <div className="grid sm:grid-cols-2 gap-4 mt-7">
                <div className="bg-[#111a30] border border-white/10 rounded-xl p-5">
                  <CalendarDays className="text-blue-400 mb-3" />

                  <p className="text-sm text-gray-400">
                    Tanggal mulai
                  </p>

                  <p className="font-semibold mt-1">
                    {formatDate(event.start_date)}
                  </p>
                </div>

                <div className="bg-[#111a30] border border-white/10 rounded-xl p-5">
                  <Clock className="text-blue-400 mb-3" />

                  <p className="text-sm text-gray-400">
                    Tanggal selesai
                  </p>

                  <p className="font-semibold mt-1">
                    {formatDate(event.end_date)}
                  </p>
                </div>

                <div className="bg-[#111a30] border border-white/10 rounded-xl p-5 sm:col-span-2">
                  <MapPin className="text-blue-400 mb-3" />

                  <p className="text-sm text-gray-400">
                    Lokasi event
                  </p>

                  <p className="font-semibold mt-1">
                    {event.venue_name || "Lokasi belum tersedia"}
                  </p>

                  <p className="text-sm text-gray-400 mt-1">
                    {[event.venue_address, event.city]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>

              {/* Deskripsi */}
              <div className="mt-9">
                <h2 className="text-xl font-bold mb-4">
                  Tentang Event
                </h2>

                <p className="text-gray-400 leading-8 whitespace-pre-line">
                  {event.description || "Belum ada deskripsi event."}
                </p>
              </div>
            </div>
          </div>

          {/* Pemilihan Tiket */}
          <aside>
            <div className="bg-[#111a30] border border-white/10 rounded-2xl p-6 sticky top-6">
              <h2 className="text-xl font-bold">
                Pilih Tiket
              </h2>

              <p className="text-sm text-gray-400 mt-2 mb-6">
                Pilih kategori tiket yang ingin kamu beli.
              </p>

              {tickets.length === 0 ? (
                <div className="bg-[#080d1c] rounded-xl p-5 text-center">
                  <Ticket className="mx-auto text-gray-500 mb-3" />

                  <p className="font-semibold">
                    Tiket belum tersedia
                  </p>

                  <p className="text-sm text-gray-400 mt-2">
                    Semua tiket mungkin belum dijual atau sudah habis.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket) => {
                    const isSelected =
                      selectedTicket?.id === ticket.id;

                    const stock =
                      Number(ticket.quota || 0) -
                      Number(ticket.sold || 0);

                    return (
                      <button
                        key={ticket.id}
                        type="button"
                        onClick={() => chooseTicket(ticket)}
                        className={`w-full text-left rounded-xl border p-4 transition ${
                          isSelected
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-white/10 bg-[#080d1c] hover:border-white/30"
                        }`}
                      >
                        <div className="flex justify-between gap-3">
                          <div>
                            <p className="font-semibold">
                              {ticket.name}
                            </p>

                            <p className="text-xs text-gray-400 mt-2">
                              Sisa {stock} tiket
                            </p>
                          </div>

                          {isSelected && (
                            <span className="text-blue-400 text-sm">
                              Terpilih
                            </span>
                          )}
                        </div>

                        <p className="text-blue-400 font-bold mt-3">
                          {formatPrice(ticket.price)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Jumlah dan Checkout */}
              {selectedTicket && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="font-semibold mb-4">
                    Jumlah Tiket
                  </p>

                  <div className="flex items-center justify-between bg-[#080d1c] rounded-xl p-3">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((current) =>
                          Math.max(1, current - 1)
                        )
                      }
                      disabled={quantity <= 1}
                      className="p-2 rounded-lg bg-[#1b2945] disabled:opacity-40"
                    >
                      <Minus size={18} />
                    </button>

                    <span className="font-bold text-lg">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((current) =>
                          Math.min(remaining, current + 1)
                        )
                      }
                      disabled={quantity >= remaining}
                      className="p-2 rounded-lg bg-blue-600 disabled:opacity-40"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <div className="flex justify-between mt-6">
                    <span className="text-gray-400">
                      Total harga
                    </span>

                    <span className="text-xl font-bold text-blue-400">
                      {formatPrice(total)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={
                      !selectedTicket ||
                      quantity < 1 ||
                      quantity > remaining
                    }
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-4 rounded-xl font-semibold transition"
                  >
                    Lanjut ke Checkout
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-3">
                    Pilihan tiket ini belum menjadi pesanan.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

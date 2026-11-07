
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import {
  Search,
  CalendarDays,
  MapPin,
  Ticket,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";

function formatPrice(price) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price || 0);
}

function formatDate(date) {
  if (!date) return "Tanggal belum tersedia";

  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function CustomerEventsPage() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        setError("");

        const result = await apiRequest("/api/events/");

        if (result.success) {
          setEvents(result.data || []);
        } else {
          setError("Gagal mengambil daftar event.");
        }
      } catch (err) {
        setError(err.message || "Terjadi kesalahan saat mengambil event.");
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const categories = useMemo(() => {
    const names = events
      .map((event) => event.categories?.name)
      .filter(Boolean);

    return ["Semua", ...new Set(names)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        event.title?.toLowerCase().includes(keyword) ||
        event.venue_name?.toLowerCase().includes(keyword) ||
        event.city?.toLowerCase().includes(keyword);

      const matchesCategory =
        category === "Semua" ||
        event.categories?.name === category;

      return matchesSearch && matchesCategory;
    });
  }, [events, search, category]);

  return (
    <main className="min-h-screen bg-[#080d1c] text-white">
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link
            href="/dashboard/customer"
            className="text-2xl font-bold text-blue-500"
          >
            ZTICK
          </Link>

          <Link
            href="/dashboard/customer"
            className="text-sm text-gray-400 hover:text-white"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-blue-400 text-sm font-semibold mb-3">
            EXPLORE EVENTS
          </p>

          <h1 className="text-3xl md:text-4xl font-bold">
            Temukan Event Favoritmu
          </h1>

          <p className="text-gray-400 mt-3">
            Temukan konser dan pengalaman menarik berikutnya.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari event, lokasi, atau kota..."
              className="w-full bg-[#111a30] border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-[#111a30] border border-white/10 rounded-xl px-5 py-4 outline-none focus:border-blue-500"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-24 text-blue-400">
            <LoaderCircle className="animate-spin" size={32} />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-300">
            {error}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-24 bg-[#111a30] border border-white/10 rounded-2xl">
            <Ticket size={40} className="mx-auto text-gray-500 mb-4" />
            <h2 className="text-xl font-semibold">
              Event belum ditemukan
            </h2>
            <p className="text-gray-400 mt-2">
              Coba kata kunci atau kategori lainnya.
            </p>
          </div>
        ) : (
          <>
            <p className="text-gray-400 text-sm mb-5">
              Menampilkan {filteredEvents.length} event
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const ticketCategories = event.ticket_categories || [];

                const availableTickets = ticketCategories.filter(
                  (ticket) =>
                    ticket.sales_start &&
                    ticket.sales_end
                      ? new Date(ticket.sales_start) <= new Date() &&
                        new Date(ticket.sales_end) >= new Date() &&
                        Number(ticket.quota || 0) > Number(ticket.sold || 0)
                      : Number(ticket.quota || 0) > Number(ticket.sold || 0)
                );

                const lowestPrice = ticketCategories.length
                  ? Math.min(...ticketCategories.map((ticket) =>
                      Number(ticket.price || 0)
                    ))
                  : null;

                return (
                  <article
                    key={event.id}
                    className="group bg-[#111a30] border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 transition"
                  >
                    <div className="aspect-[16/10] bg-[#1b2945] overflow-hidden">
                      {event.poster_url ? (
                        <img
                          src={event.poster_url}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Ticket size={48} className="text-gray-600" />
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <span className="text-xs text-blue-400 font-semibold">
                        {event.categories?.name || "Event"}
                      </span>

                      <h2 className="text-xl font-bold mt-2 line-clamp-2">
                        {event.title}
                      </h2>

                      <div className="space-y-3 mt-5 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={16} />
                          {formatDate(event.start_date)}
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          {event.venue_name || event.city || "Lokasi belum tersedia"}
                        </div>
                      </div>

                      <div className="border-t border-white/10 mt-5 pt-5 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs text-gray-500">
                            Mulai dari
                          </p>
                          <p className="font-bold text-blue-400">
                            {lowestPrice === null
                              ? "Belum tersedia"
                              : formatPrice(lowestPrice)}
                          </p>
                        </div>

                        <Link
                          href={`/dashboard/customer/events/${event.id}`}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-3 rounded-xl text-sm font-semibold transition"
                        >
                          Detail
                          <ArrowRight size={16} />
                        </Link>
                      </div>

                      {availableTickets.length === 0 && (
                        <p className="text-xs text-amber-400 mt-3">
                          Tiket belum tersedia atau sudah habis.
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

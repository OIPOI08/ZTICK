const categories = [
  { icon: "🎵", name: "Musik & Konser", count: "120+ Event" },
  { icon: "🎭", name: "Seni & Budaya", count: "45+ Event" },
  { icon: "⚽", name: "Olahraga", count: "80+ Event" },
  { icon: "🎮", name: "Gaming", count: "30+ Event" },
  { icon: "🎤", name: "Seminar", count: "65+ Event" },
  { icon: "🎪", name: "Festival", count: "50+ Event" },
];

const events = [
  {
    id: 1,
    title: "Synchronize Festival 2026",
    category: "MUSIC FESTIVAL",
    date: "21 NOV 2026",
    location: "Gambir Expo, Jakarta",
    price: "Rp350.000",
    gradient: "from-violet-700 via-purple-600 to-indigo-900",
    icon: "🎸",
    tag: "POPULER",
  },
  {
    id: 2,
    title: "Jakarta Music Experience",
    category: "LIVE MUSIC",
    date: "28 NOV 2026",
    location: "Istora Senayan, Jakarta",
    price: "Rp250.000",
    gradient: "from-blue-700 via-cyan-600 to-slate-900",
    icon: "🎧",
    tag: "TERLARIS",
  },
  {
    id: 3,
    title: "Creative Future Conference",
    category: "CONFERENCE",
    date: "05 DES 2026",
    location: "ICE BSD, Tangerang",
    price: "Rp150.000",
    gradient: "from-orange-600 via-red-600 to-rose-900",
    icon: "🚀",
    tag: "TERBARU",
  },
];

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080d1c]/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <a href="/" className="text-2xl font-black tracking-tight text-white">
          ZTICK<span className="text-blue-500">.</span>
        </a>

        <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a href="#home" className="transition hover:text-blue-400">
            Beranda
          </a>
          <a href="#events" className="transition hover:text-blue-400">
            Event
          </a>
          <a href="#categories" className="transition hover:text-blue-400">
            Kategori
          </a>
          <a href="#about" className="transition hover:text-blue-400">
            Tentang Kami
          </a>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:text-white sm:block"
          >
            Masuk
          </a>
          <a
            href="/register"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
          >
            Daftar
          </a>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden px-5 pb-24 pt-20 lg:px-8 lg:pb-32 lg:pt-28"
    >
      <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-300">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            YOUR GATEWAY TO EVERY EXPERIENCE
          </div>

          <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Every Event.
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              One Ticket Away.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
            Temukan pengalaman baru, nikmati event favorit, dan amankan
            tiketmu dengan mudah hanya di ZTICK.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="#events"
              className="rounded-xl bg-blue-600 px-7 py-4 text-center text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-1 hover:bg-blue-500"
            >
              Jelajahi Event <span className="ml-2">→</span>
            </a>
            <a
              href="#categories"
              className="rounded-xl border border-white/10 bg-white/5 px-7 py-4 text-center text-sm font-bold text-white transition hover:bg-white/10"
            >
              Lihat Kategori
            </a>
          </div>
        </div>

        <div className="mt-16 grid max-w-2xl grid-cols-3 gap-5 border-t border-white/10 pt-8">
          {[
            ["500+", "Event tersedia"],
            ["50K+", "Tiket terjual"],
            ["100+", "Organizer"],
          ].map(([number, label]) => (
            <div key={label}>
              <p className="text-2xl font-black text-white sm:text-3xl">
                {number}
              </p>
              <p className="mt-2 text-xs text-slate-500 sm:text-sm">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Categories() {
  return (
    <section id="categories" className="px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
              Explore by category
            </p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              Cari berdasarkan kategori
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <a
              href="#events"
              key={category.name}
              className="group rounded-2xl border border-white/10 bg-[#10182b] p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:bg-blue-500/10"
            >
              <span className="text-3xl">{category.icon}</span>
              <h3 className="mt-5 text-sm font-bold text-white">
                {category.name}
              </h3>
              <p className="mt-2 text-xs text-slate-500">{category.count}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function EventCard({ event }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-[#10182b] transition duration-300 hover:-translate-y-2 hover:border-blue-500/40">
      <div
        className={`relative flex h-56 items-center justify-center overflow-hidden bg-gradient-to-br ${event.gradient}`}
      >
        <div className="absolute inset-0 bg-black/10" />
        <span className="relative text-8xl drop-shadow-2xl transition duration-500 group-hover:scale-110">
          {event.icon}
        </span>

        <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[10px] font-bold tracking-wider text-white backdrop-blur-md">
          {event.tag}
        </span>

        <span className="absolute bottom-4 left-4 text-xs font-bold tracking-[0.2em] text-white/80">
          {event.category}
        </span>
      </div>

      <div className="p-5">
        <p className="text-xs font-semibold text-blue-400">{event.date}</p>
        <h3 className="mt-3 text-lg font-bold text-white transition group-hover:text-blue-300">
          {event.title}
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          <span className="mr-2">📍</span>
          {event.location}
        </p>

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
          <div>
            <p className="text-xs text-slate-500">Mulai dari</p>
            <p className="mt-1 font-bold text-white">{event.price}</p>
          </div>
          <a
            href={`/events/${event.id}`}
            className="rounded-lg bg-blue-600/10 px-4 py-2.5 text-xs font-bold text-blue-400 transition hover:bg-blue-600 hover:text-white"
          >
            Detail Event →
          </a>
        </div>
      </div>
    </article>
  );
}

function FeaturedEvents() {
  return (
    <section id="events" className="px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
              Handpicked for you
            </p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              Event pilihan
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Temukan event menarik yang tidak boleh kamu lewatkan.
            </p>
          </div>

          <a
            href="/events"
            className="text-sm font-bold text-blue-400 transition hover:text-blue-300"
          >
            Lihat semua event →
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}

function OrganizerBanner() {
  return (
    <section id="about" className="px-5 py-20 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-blue-400/20 bg-gradient-to-r from-blue-950 via-[#142b5b] to-[#102044] p-8 sm:p-12 lg:p-16">
        <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full bg-blue-400/20 blur-[100px]" />

        <div className="relative max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-300">
            For event organizers
          </p>
          <h2 className="mt-4 text-3xl font-black text-white sm:text-5xl">
            Punya event?
            <br />
            Jadikan lebih besar bersama ZTICK.
          </h2>
          <p className="mt-5 leading-7 text-blue-100/60">
            Publikasikan event, kelola penjualan tiket, dan pantau performa
            event-mu dalam satu platform.
          </p>
          <a
            href="/register"
            className="mt-8 inline-flex rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-blue-950 transition hover:bg-blue-100"
          >
            Mulai jadi organizer →
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 px-5 py-10 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <a href="/" className="text-2xl font-black text-white">
            ZTICK<span className="text-blue-500">.</span>
          </a>
          <p className="mt-2 text-sm text-slate-500">
            Every Event. One Ticket Away.
          </p>
        </div>

        <p className="text-xs text-slate-600">
          © 2026 ZTICK. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080d1c]">
      <Navbar />
      <Hero />
      <Categories />
      <FeaturedEvents />
      <OrganizerBanner />
      <Footer />
    </main>
  );
}
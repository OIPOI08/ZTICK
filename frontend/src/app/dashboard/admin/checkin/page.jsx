
"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  Camera,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ScanQrCode,
  Ticket,
} from "lucide-react";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function AdminCheckinPage() {
  const [scannerActive, setScannerActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const scannerRef = useRef(null);
  const processedRef = useRef(false);

  async function processCheckin(qrValue) {
    setLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem("ztick_token");

      if (!token) {
        throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");
      }

      const uuidMatch = qrValue.match(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
      );

      if (!uuidMatch) {
        throw new Error("QR Code tidak berisi token tiket yang valid.");
      }

      const response = await fetch(`${API_URL}/api/checkin/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          qr_token: uuidMatch[0],
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.detail || data.message || "Check-in gagal."
        );
      }

      setResult({
        success: true,
        message: data.message || "Check-in berhasil.",
      });
    } catch (error) {
      setResult({
        success: false,
        message: error.message || "Terjadi kesalahan.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!scannerActive) return;

    let mounted = true;

    const scanner = new Html5QrcodeScanner(
      "ztick-qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      async (decodedText) => {
        if (processedRef.current || !mounted) return;

        processedRef.current = true;

        try {
          await scanner.clear();
        } catch (error) {
          console.error("Scanner cleanup:", error);
        }

        if (!mounted) return;

        setScannerActive(false);
        await processCheckin(decodedText);
      },
      () => {}
    );

    return () => {
      mounted = false;

      if (scannerRef.current === scanner) {
        scannerRef.current = null;
        scanner.clear().catch(() => {});
      }
    };
  }, [scannerActive]);

  function startScanner() {
    processedRef.current = false;
    setResult(null);
    setScannerActive(true);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link
            href="/dashboard/admin"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
          >
            ← Kembali ke Dashboard Admin
          </Link>

          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/15 p-3 text-blue-400">
              <ScanQrCode size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-bold">QR Ticket Scanner</h1>
              <p className="text-sm text-slate-400">
                ZTICK Admin Check-in
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-400">
            Scan QR Code pada tiket pengunjung untuk melakukan validasi
            dan check-in.
          </p>
        </div>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="mb-5 flex items-center gap-2">
            <Camera className="text-blue-400" size={20} />
            <h2 className="font-semibold">Kamera Scanner</h2>
          </div>

          <div className="overflow-hidden rounded-xl bg-white p-3">
            <div id="ztick-qr-reader" />
          </div>

          {!scannerActive && !loading && (
            <button
              onClick={startScanner}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
            >
              <Camera size={19} />
              {result ? "Scan Tiket Berikutnya" : "Mulai Scan"}
            </button>
          )}

          {loading && (
            <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-slate-300">
              <RefreshCw className="animate-spin" size={18} />
              Memvalidasi tiket...
            </div>
          )}

          {scannerActive && (
            <p className="mt-4 text-center text-sm text-blue-300">
              Arahkan kamera ke QR Code tiket.
            </p>
          )}
        </section>

        {result && (
          <section
            className={`mt-6 rounded-2xl border p-5 ${
              result.success
                ? "border-green-500/30 bg-green-500/10"
                : "border-red-500/30 bg-red-500/10"
            }`}
          >
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle2
                  className="shrink-0 text-green-400"
                  size={28}
                />
              ) : (
                <XCircle
                  className="shrink-0 text-red-400"
                  size={28}
                />
              )}

              <div>
                <h3
                  className={`font-bold ${
                    result.success ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {result.success ? "Check-in Berhasil" : "Check-in Gagal"}
                </h3>
                <p className="mt-1 text-sm text-slate-300">
                  {result.message}
                </p>
              </div>
            </div>
          </section>
        )}

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <Ticket className="mt-0.5 shrink-0 text-slate-400" size={20} />
          <p className="text-xs leading-5 text-slate-400">
            Setiap tiket hanya dapat digunakan satu kali. Tiket yang
            sudah berhasil check-in tidak dapat digunakan kembali.
          </p>
        </div>
      </div>
    </main>
  );
}

import "./globals.css";

export const metadata = {
  title: "ZTICK — Temukan Event Favoritmu",
  description:
    "Platform pembelian tiket event, konser, festival, dan hiburan favoritmu.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
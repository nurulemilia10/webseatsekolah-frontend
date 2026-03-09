import type { Metadata } from "next";
import '@tabler/core/dist/css/tabler.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import "./globals.css";

export const metadata: Metadata = {
  title: "Panel Sekolah",
  description: "Frontend Next.js dengan Tabler UI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased">
        {children}
        <script 
          src="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta17/dist/js/tabler.min.js" 
          defer 
        ></script>
      </body>
    </html>
  );
}
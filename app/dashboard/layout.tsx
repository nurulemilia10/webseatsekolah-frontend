"use client";

import React, { useState } from 'react'; // Tambahkan useState
import Sidebar from '../components/Sidebar'; 
import Navbar from '../components/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="page-container">
      {/* Kirim state ke Sidebar */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <div className="page-wrapper">
        <header className="dashboard-header border-bottom">
          {/* Kirim fungsi buka ke Navbar */}
          <Navbar onMenuClick={() => setIsMobileOpen(true)} />
        </header>

        <main className="dashboard-content">
          <div className="container-fluid p-0">
            <div className="p-3 p-md-4">
              {children}
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="dashboard-footer border-top bg-white py-3 px-4">
          <div className="d-flex justify-content-between align-items-center">
            <small className="footer-text-main">
              © 2026 SISKO SYSTEM
            </small>
            <small className="footer-text-sub">
              V1.0-STABLE
            </small>
          </div>
        </footer>
      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect } from 'react';
// Pastikan path ini benar sesuai struktur folder kamu
import Sidebar from '../components/Sidebar'; 
import Navbar from '../components/Navbar';
import api from '@/lib/api'; 

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [schoolProfile, setSchoolProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [resUser, resSchool] = await Promise.all([
          api.auth.me().catch(() => null),
          api.public.getProfilSekolah().catch(() => null)
        ]);
        if (!isMounted) return;
        if (resUser?.data) {
          const userData = resUser.data.data || resUser.data.user || resUser.data;
          setUser(userData);
        }
        if (resSchool?.data) {
          const schoolData = resSchool.data.data || resSchool.data;
          setSchoolProfile(schoolData);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="page-container">
      <Sidebar 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
        user={user}
        schoolProfile={schoolProfile}
        loading={loading}
      />
      <div className="page-wrapper">
        <header className="dashboard-header border-bottom">
          <Navbar 
            onMenuClick={() => setIsMobileOpen(true)} 
            user={user}
            isLoading={loading} 
          />
        </header>
        <main className="dashboard-content">
          <div className="p-3 p-md-4">
            {children} {/* <--- ISI DASHBOARD & HALAMAN LAIN MUNCUL DI SINI */}
          </div>
        </main>
      </div>
    </div>
  );
}
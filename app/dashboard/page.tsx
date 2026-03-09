"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';

// HAPUS import Sidebar dan Navbar dari sini karena sudah ada di layout.tsx

import AdminView from './admin-view';
import GuruView from './guru-view'; 
import SiswaView from './siswa-view';
import OrtuView from './ortu-view';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.auth.me()
      .then(res => {
        const userData = res.data.data || res.data.user || res.data;
        setUser(userData);
        setLoading(false);
      })
      .catch(() => {
        window.location.href = '/login';
      });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sinkronisasi Sistem...</p>
      </div>
    </div>
  );

  const rawRole = (user?.current_role || "").toLowerCase().replace(/\s/g, "");

  // Hanya me-render konten spesifik sesuai role
  const renderContent = () => {
    if (rawRole === 'admin') return <AdminView />;
    if (rawRole === 'guru') return <GuruView user={user} />; 
    if (rawRole === 'siswa') return <SiswaView user={user} />;
    if (rawRole === 'ortu' || rawRole === 'orangtua') return <OrtuView user={user} />;
    
    return (
      <div className="card card-md border-0 shadow-sm rounded-3xl">
        <div className="card-body text-center py-5">
          <h1 className="text-danger font-black text-xl uppercase tracking-tighter">Akses Dibatasi</h1>
          <p className="text-muted small font-medium">Role "{rawRole}" tidak memiliki izin akses.</p>
        </div>
      </div>
    );
  };

  // Kita HANYA mengembalikan renderContent(). 
  // Pembungkus <div className="page">, Sidebar, dan Navbar sudah ada di layout.tsx
  return (
    <>
      {renderContent()}
    </>
  );
}
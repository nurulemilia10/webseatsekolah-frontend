"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// 1. Jika components ada di DALAM folder app (sejajar dengan (dashboard))
import Sidebar from '../components/Sidebar'; 
import Navbar from '../components/Navbar';

// 2. Jika lib dan hooks ada di LUAR folder app (di root project)
// Kita perlu naik 2 kali (../../) untuk keluar dari (dashboard) dan keluar dari app
import api from '../../lib/api'; 
import { useAuth } from '../../hooks/useAuth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user: authUser, loading: authLoading, currentRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [schoolProfile, setSchoolProfile] = useState<any>(null);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push('/login');
      return;
    }

    const rolePrefix = pathname.split('/')[1];
    if (!authLoading && authUser && currentRole) {
       const roleNormalized = currentRole.toLowerCase();
       if (rolePrefix === 'admin' && !roleNormalized.includes('admin')) {
          router.push('/unauthorized');
       }
    }
  }, [authUser, authLoading, currentRole, pathname, router]);

  useEffect(() => {
    let isMounted = true;
    const fetchSchoolData = async () => {
      try {
        const resSchool = await api.public.getProfilSekolah().catch(() => null);
        if (isMounted && resSchool?.data) {
          setSchoolProfile(resSchool.data.data || resSchool.data);
        }
      } finally {
        if (isMounted) setLocalLoading(false);
      }
    };
    fetchSchoolData();
    return () => { isMounted = false; };
  }, []);

  if (authLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const SidebarWithProps = Sidebar as React.ComponentType<any>;

  return (
    <div className="page-container">
      <SidebarWithProps 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
        user={authUser}
        schoolProfile={schoolProfile}
        loading={localLoading}
      />
      <div className="page-wrapper">
        <header className="dashboard-header border-bottom bg-white sticky-top">
          <Navbar 
            onMenuClick={() => setIsMobileOpen(true)} 
          />
        </header>
        <main className="dashboard-content bg-light min-vh-100">
          <div className="p-3 p-md-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
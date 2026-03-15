"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../components/Sidebar'; 
import Navbar from '../components/Navbar';
import api from '../../lib/api'; 
import { useAuth } from '../../hooks/useAuth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user: authUser, loading: authLoading, currentRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [schoolProfile, setSchoolProfile] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cached_school_profile');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const fetchedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    if (!authLoading && !authUser) {
      router.push('/login');
    }

    const rolePrefix = pathname.split('/')[1];
    if (!authLoading && authUser && currentRole) {
      const roleNormalized = currentRole.toLowerCase();
      const isAdminRoute = rolePrefix === 'admin';
      const isUserAdmin = roleNormalized.includes('admin');
      
      if (isAdminRoute && !isUserAdmin) {
        router.push('/unauthorized');
      }
    }
  }, [authUser, authLoading, currentRole, pathname, router]);

  const fetchSchoolData = useCallback(async () => {
    if (fetchedRef.current) return;

    try {
      const resSchool = await api.public.getProfilSekolah();
      if (resSchool?.data?.data) {
        const newData = resSchool.data.data;
        const saved = localStorage.getItem('cached_school_profile');
        
        if (JSON.stringify(newData) !== saved) {
          setSchoolProfile(newData);
          localStorage.setItem('cached_school_profile', JSON.stringify(newData));
        }
        fetchedRef.current = true;
      }
    } catch (err) {
      console.error("Layout fetch error:", err);
    }
  }, []);

  useEffect(() => {
    if (authUser) {
      fetchSchoolData();
    }
  }, [authUser, fetchSchoolData]);

  if (authLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Sidebar 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
        schoolProfile={schoolProfile}
      />
      
      <div className="page-wrapper d-flex flex-column min-vh-100">
        <header className="dashboard-header border-bottom bg-white sticky-top">
          <Navbar 
            onMenuClick={() => setIsMobileOpen(true)} 
          />
        </header>

        <main className="dashboard-content bg-light flex-grow-1">
          <div className="p-3 p-md-4">
            {children}
          </div>
        </main>

        <footer className="py-3 bg-white border-top">
          <div className="container-fluid text-center">
            <span className="text-muted small fw-medium opacity-75">
              &copy; {new Date().getFullYear()} {mounted ? (schoolProfile?.nama_sekolah || 'SIP SEKO') : 'SIP SEKO'}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(() => {
    if (typeof window === 'undefined') return;

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const userData = parsed.data || parsed;
        setUser(userData);
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
    
    window.addEventListener('storage', fetchUser);
    window.addEventListener('user-updated', fetchUser);
    
    return () => {
      window.removeEventListener('storage', fetchUser);
      window.removeEventListener('user-updated', fetchUser);
    };
  }, [fetchUser]);

  const displayName = useMemo(() => {
    if (!user) return "Pengguna";
    return (
      user.guru?.nama || 
      user.siswa?.nama || 
      user.nama || 
      user.name ||
      user.username || 
      "Pengguna"
    );
  }, [user]);

  const currentRole = useMemo(() => {
    const role = user?.current_role || user?.role || "";
    return role.toLowerCase().trim();
  }, [user]);

  const hasJabatan = useCallback((target: string) => {
    if (!user?.guru) return false;
    const normalizedTarget = target.toLowerCase().replace(/\s+/g, '');
    const jabatanUtama = user.guru.jabatan || "";
    const jabatanStruktural = user.guru.jabatan_struktural || [];

    const checkMatch = (val: any) => {
      if (!val) return false;
      const text = typeof val === 'object' ? (val.nama || val.name || "") : String(val);
      return text.toLowerCase().replace(/\s+/g, '').includes(normalizedTarget);
    };

    return checkMatch(jabatanUtama) || 
           (Array.isArray(jabatanStruktural) && jabatanStruktural.some(j => checkMatch(j)));
  }, [user]);

  return { 
    user, 
    loading, 
    displayName,
    currentRole,
    isLoggedIn: !!user,
    isAdmin: currentRole === 'admin', 
    isGuru: currentRole === 'guru', 
    isSiswa: currentRole === 'siswa', 
    isOrangTua: ['orangtua', 'orang tua', 'ortu'].some(r => currentRole.includes(r)),
    hasJabatan,
    isWaliKelas: !!(user?.guru?.wali_kelas || user?.guru?.id_kelas_wali || user?.guru?.kelas_wali)
  };
}
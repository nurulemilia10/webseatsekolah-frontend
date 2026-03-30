"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
    LayoutDashboard, ChevronLeft, ChevronDown,
    FolderArchive, Users, Database, School, Menu, X,
    Info, Settings2, GraduationCap, UserCheck, BookOpen
} from 'lucide-react';
import { MENU_LIST } from '@/lib/menu-list';

interface SidebarProps {
    isMobileOpen: boolean;
    setIsMobileOpen: (open: boolean) => void;
    schoolProfile?: any;
}

const GROUPS_CONFIG = [
    { title: "Utama", icon: <LayoutDashboard size={20} />, items: ["Dashboard"] },
    { title: "Akademik", icon: <Database size={20} />, items: ["Tahun Ajaran", "Semester", "Kurikulum", "Kalender Akademik", "Data Jam Sekolah", "Penugasan Guru Mapel","Kenaikan Kelas",  "Kelas Walikelas"] },
    { title: "Data Master", icon: <FolderArchive size={20} />, items: [ "Data Mata Pelajaran", "Data Kelas", "Data Guru", "Data Siswa", "Data Orang Tua"] },
    { title: "Operasional", icon: <Users size={20} />, items: ["Monitoring Presensi Harian", "Monitoring Presensi Mapel", "Monitoring Poin Siswa" ] },
    { title: "Ketua Jurusan", icon: <GraduationCap size={20} />, items: ["Siswa Jurusan", "Mapel Jurusan", "Penugasan Guru Mapel Jueusan", "Kelas Jurusan"] },
    { title: "Wali Kelas", icon: <UserCheck size={20} />, items: ["Siswa Kelas Saya", "Orang Tua Siswa", "Presensi Harian Kelas"] },
    { title: "Guru Mapel", icon: <BookOpen size={20} />, items: ["Jam Sekolah", "Presensi Mapel", "Input Poin"] },
    { title: "Siswa", icon: <Users size={20} />, items: ["Jadwal Mapel", "Presensi Saya", "Poin Saya"] },
    { title: "Orang Tua", icon: <Users size={20} />, items: ["Jam Sekolah", "Presensi Anak", "Poin Anak"] },
    { title: "Informasi", icon: <Info size={20} />, items: ["Berita","Ekstrakurikuler", "Pengumuman", "Prestasi", "Banner", "Portal & PPDB", "Fasilitas & Sarpras", "Galeri & Media", "Pesan Masuk","Kontak","Struktur Jabatan","Jurusan"] },
    { title: "Sistem", icon: <Settings2 size={20} />, items: ["Profil Sekolah", "Log Aktivitas","User Management"] }
];

export default function Sidebar({ isMobileOpen, setIsMobileOpen, schoolProfile }: SidebarProps) {
    const { user, loading, currentRole, hasJabatan, isWaliKelas } = useAuth();
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    const isFirstRun = useRef(true);

    useEffect(() => {
        if (user && isFirstRun.current) {
            setOpenGroups({
                "Utama": true,
                "Akademik": hasJabatan("kurikulum"),
                "Ketua Jurusan": hasJabatan("ketuajurusan"),
                "Wali Kelas": isWaliKelas,
                "Guru Mapel": currentRole === "guru"
            });
            isFirstRun.current = false;
        }
    }, [user, hasJabatan, isWaliKelas, currentRole]);

    useEffect(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        if (saved !== null) setIsCollapsed(saved === 'true');
    }, []);

    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', String(isCollapsed));
    }, [isCollapsed]);

    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname, setIsMobileOpen]);

    const filteredMenuGroups = useMemo(() => {
        if (!user || !currentRole) return [];
        const normalize = (t: string) => String(t || "").toLowerCase().replace(/\s+/g, '');

        return GROUPS_CONFIG.map(group => {
            const menuItems = MENU_LIST.filter(m => {
                if (!group.items.includes(m.title)) return false;
                const roles = Array.isArray(m.role) ? m.role.map(r => String(r).toLowerCase()) : (m.role ? [String(m.role).toLowerCase()] : []);
                if (!roles.includes(currentRole)) return false;
                if (currentRole === 'admin') return true;
                if (m.jabatan && m.jabatan.length > 0) {
                    return m.jabatan.some(j => {
                        const target = normalize(j);
                        return target === 'walikelas' ? isWaliKelas : hasJabatan(target);
                    });
                }
                return true;
            });
            return { ...group, menuItems };
        }).filter(group => group.menuItems.length > 0);
    }, [user, currentRole, hasJabatan, isWaliKelas]);

    const handleGroupClick = useCallback((title: string) => {
        setOpenGroups(prev => ({
            ...prev,
            [title]: isCollapsed ? true : !prev[title]
        }));
        if (isCollapsed) setIsCollapsed(false);
    }, [isCollapsed]);

    if (loading) return <aside className="bg-white border-end shadow-sm sidebar-loading opacity-50" />;

    const logoSrc = schoolProfile?.logo || schoolProfile?.logo_url;

    return (
        <>
            {isMobileOpen && (
                <div className="mobile-overlay position-fixed top-0 start-0 w-100 h-100 d-lg-none" onClick={() => setIsMobileOpen(false)} />
            )}

            <aside className={`${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''} transition-all`}>
                <div className={`sidebar-header-container d-flex align-items-center p-3 border-bottom ${isCollapsed ? 'justify-content-center' : 'justify-content-between'}`}>
                    <div className="d-flex align-items-center overflow-hidden">
                        <div className="sidebar-logo-container shadow-sm">
                            {logoSrc ? (
                                <img 
                                    src={logoSrc} 
                                    alt="Logo Sekolah" 
                                    className="sidebar-logo-img" 
                                    loading="eager"
                                    decoding="async"
                                />
                            ) : (
                                <School size={18} className="text-primary" />
                            )}
                        </div>
                        {!isCollapsed && (
                            <div className="ms-2 min-w-0 animate-fade-in">
                                <h6 className="sidebar-school-name text-truncate m-0 fw-bold">
                                    {schoolProfile?.nama_sekolah || 'sekolah'}
                                </h6>
                                <span className="sidebar-panel-text text-capitalize">Panel {currentRole || 'Sistem'}</span>
                            </div>
                        )}
                    </div>

                    <button 
                        type="button" 
                        onClick={() => setIsCollapsed(!isCollapsed)} 
                        className="btn btn-sm p-1 border-0 text-secondary d-none d-lg-block hover-lift"
                        title={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
                        aria-label={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
                    >
                        {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                    </button>

                    <button 
                        type="button" 
                        onClick={() => setIsMobileOpen(false)} 
                        className="btn btn-sm p-1 border-0 text-secondary d-lg-none"
                        title="Tutup Menu"
                        aria-label="Tutup Menu"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-grow-1 overflow-auto p-2 scrollbar-thin">
                    {filteredMenuGroups.map((group, gIdx) => (
                        <div key={gIdx} className="mb-1">
                            <div 
                                onClick={() => handleGroupClick(group.title)} 
                                className="sidebar-group-header" 
                                role="button" 
                                tabIndex={0} 
                                onKeyDown={(e) => e.key === 'Enter' && handleGroupClick(group.title)}
                                title={group.title}
                            >
                                <span className="text-primary d-flex align-items-center">{group.icon}</span>
                                {!isCollapsed && (
                                    <>
                                        <span className="flex-grow-1 sidebar-school-name fw-bold opacity-75 ms-2 text-truncate">{group.title}</span>
                                        <ChevronDown size={14} className={`chevron-down-icon transition-all ${openGroups[group.title] ? 'rotate-180' : ''}`} />
                                    </>
                                )}
                            </div>

                            {!isCollapsed && (
                                <div className={`sidebar-menu-container ${openGroups[group.title] ? 'menu-open' : 'menu-closed'}`}>
                                    <div className="ms-3 ps-2 border-start border-light">
                                        {group.menuItems.map((item, idx) => {
                                            const isActive = pathname === item.path;
                                            return (
                                                <Link key={idx} href={item.path} className="text-decoration-none d-block py-1">
                                                    <div className={`px-2 py-2 rounded-2 sidebar-item-text transition-all ${isActive ? 'bg-primary text-white fw-bold shadow-sm' : 'text-secondary hover-bg-light'}`}>
                                                        {item.title}
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
}
"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, ChevronLeft, ChevronDown,
    FolderArchive, Users, Database, School, Menu, X,
    Info, Settings2, GraduationCap, UserCheck, BookOpen
} from 'lucide-react';
import { MENU_LIST } from '@/lib/menu-list';

interface SidebarProps {
    isMobileOpen: boolean;
    setIsMobileOpen: (open: boolean) => void;
    user?: any;
    schoolProfile?: any;
    loading?: boolean;
}

const GROUPS_CONFIG = [
    { 
        title: "Utama", 
        icon: <LayoutDashboard size={20} />, 
        items: ["Dashboard", "User Management"] 
    },
    { 
        title: "Akademik", 
        icon: <Database size={20} />, 
        items: ["Tahun Ajaran", "Semester", "Kurikulum", "Kalender Akademik", "Jam Sekolah", "Penugasan Guru Mapel","Kenaikan Kelas",  "Kelas Walikelas"] 
    },
    { 
        title: "Data Master", 
        icon: <FolderArchive size={20} />, 
        items: [ "Data Mata Pelajaran", "Data Jurusan", "Data Kelas", "Data Guru", "Data Siswa", "Data Orang Tua"] 
    },
    { 
        title: "Operasional", 
        icon: <Users size={20} />, 
        items: ["Monitoring Presensi Harian", "Monitoring Presensi Mapel", "Monitoring Poin Siswa" ] 
    },
    {
        title: "Ketua Jurusan",
        icon: <GraduationCap size={20} />,
        items: ["Siswa Jurusan", "Mapel Jurusan", "Penugasan Guru Mapel", "Kelas Jurusan"]
    },
    {
        title: "Wali Kelas",
        icon: <UserCheck size={20} />,
        items: ["Siswa Kelas Saya", "Orang Tua Siswa", "Presensi Harian Kelas"]
    },
    {
        title: "Guru Mapel",
        icon: <BookOpen size={20} />,
        items: ["Jam Sekolah", "Presensi Mapel", "Input Poin"]
    },
    {
        title: "Siswa",
        icon: <Users size={20} />,
        items: ["Jadwal Mapel", "Presensi Saya", "Poin Saya"]
    },
    {
        title: "Orang Tua",
        icon: <Users size={20} />,
        items: ["Jam Sekolah", "Presensi Anak", "Poin Anak"]
    },
    {
        title: "Informasi",
        icon: <Info size={20} />,
        items: ["Berita & Artikel","Ekstrakurikuler", "Pengumuman", "Prestasi", "Banner Hero", "Portal & PPDB", "Fasilitas & Sarpras", "Galeri & Media", "Pesan Masuk","Kontak"]
    },
    {
        title: "Sistem",
        icon: <Settings2 size={20} />,
        items: ["Profil Sekolah", "Log Aktivitas"]
    }
];

export default function Sidebar({ 
    isMobileOpen, 
    setIsMobileOpen, 
    user, 
    schoolProfile, 
    loading 
}: SidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    const normalize = (text: string) => String(text || "").toLowerCase().replace(/\s+/g, '');

    const getUserJabatanList = useCallback((userData: any) => {
        if (!userData || !userData.guru) return [];
        const jabatans: string[] = [];
        
        if (userData.guru.jabatan) {
            jabatans.push(normalize(userData.guru.jabatan));
        }

        if (Array.isArray(userData.guru.jabatan_struktural)) {
            userData.guru.jabatan_struktural.forEach((j: any) => {
                const name = typeof j === 'object' ? j.nama : j;
                jabatans.push(normalize(name));
            });
        }

        return jabatans;
    }, []);

    useEffect(() => {
        if (user) {
            const userJabatans = getUserJabatanList(user);
            const isWaliKelas = !!user.guru?.kelas_wali;

            setOpenGroups({
                "Utama": true,
                "Akademik": userJabatans.some(j => j.includes("kurikulum")),
                "Ketua Jurusan": userJabatans.some(j => j.includes("ketuajurusan")),
                "Wali Kelas": isWaliKelas,
                "Guru Mapel": user.current_role?.toLowerCase() === "guru"
            });
        }
    }, [user, getUserJabatanList]);

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
        if (!user) return [];
        
        const currentRole = (user.current_role as string)?.toLowerCase() || "";
        const userJabatans = getUserJabatanList(user);
        const isWaliKelas = !!user.guru?.kelas_wali;

        return GROUPS_CONFIG.map(group => {
            const menuItems = MENU_LIST.filter(m => {
                if (!group.items.includes(m.title)) return false;

                const allowedRoles = Array.isArray(m.role) 
                    ? m.role.map((r: any) => String(r).toLowerCase()) 
                    : (m.role ? [String(m.role).toLowerCase()] : []);

                if (!allowedRoles.includes(currentRole)) return false;
                if (currentRole === 'admin') return true;

                if (m.jabatan && m.jabatan.length > 0) {
                    return m.jabatan.some(j => {
                        const target = normalize(j);
                        if (target === 'walikelas') return isWaliKelas;
                        return userJabatans.some(uj => uj === target || uj.includes(target));
                    });
                }

                return true;
            });
            return { ...group, menuItems };
        }).filter(group => group.menuItems.length > 0); 
    }, [user, getUserJabatanList]);

    const handleGroupClick = useCallback((title: string) => {
        setOpenGroups(prev => ({
            ...prev,
            [title]: isCollapsed ? true : !prev[title]
        }));
        if (isCollapsed) setIsCollapsed(false);
    }, [isCollapsed]);

    if (loading) return <aside className="bg-white border-end shadow-sm sidebar-loading opacity-50" />;

    return (
        <>
            {isMobileOpen && (
                <div 
                    className="mobile-overlay position-fixed top-0 start-0 w-100 h-100 d-lg-none" 
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside className={`${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''} transition-all`}>
                <div className={`sidebar-header-container d-flex align-items-center p-3 border-bottom ${isCollapsed ? 'justify-content-center' : 'justify-content-between'}`}>
                    <div className="d-flex align-items-center overflow-hidden">
                        <div className="sidebar-logo-container shadow-sm">
                            {schoolProfile?.logo ? (
                                <img src={schoolProfile.logo} alt="Logo" className="sidebar-logo-img" />
                            ) : (
                                <School size={18} className="text-primary" />
                            )}
                        </div>
                        {!isCollapsed && (
                            <div className="ms-2 min-w-0 animate-fade-in">
                                <h6 className="sidebar-school-name text-truncate m-0 fw-bold">
                                    {schoolProfile?.nama_sekolah || 'SISKO'}
                                </h6>
                                <span className="sidebar-panel-text text-capitalize">Panel {user?.current_role || 'Sistem'}</span>
                            </div>
                        )}
                    </div>

                    <button 
                        type="button"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="btn btn-sm p-1 border-0 text-secondary d-none d-lg-block hover-lift"
                        aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                    </button>

                    <button 
                        type="button"
                        onClick={() => setIsMobileOpen(false)}
                        className="btn btn-sm p-1 border-0 text-secondary d-lg-none"
                        aria-label="Close Sidebar"
                        title="Close Sidebar"
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
                            >
                                <span className="text-primary d-flex align-items-center">{group.icon}</span>
                                {!isCollapsed && (
                                    <>
                                        <span className="flex-grow-1 sidebar-school-name fw-bold opacity-75 ms-2 text-truncate">
                                            {group.title}
                                        </span>
                                        <ChevronDown 
                                            size={14} 
                                            className={`chevron-down-icon transition-all ${openGroups[group.title] ? 'rotate-180' : ''}`} 
                                        />
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
                                                    <div className={`px-2 py-2 rounded-2 sidebar-item-text transition-all ${isActive ? 'bg-primary text-white fw-bold shadow-sm' : 'text-secondary hover:bg-light'}`}>
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
"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, ChevronLeft, ChevronDown,
    FolderArchive, Users, Database, School, Menu, X 
} from 'lucide-react';
import { MENU_LIST } from '@/lib/menu-list';

// Interface disesuaikan agar menerima data dari DashboardLayout (Props)
interface SidebarProps {
    isMobileOpen: boolean;
    setIsMobileOpen: (open: boolean) => void;
    user?: any;           // Tambahan props data user
    schoolProfile?: any;  // Tambahan props profil sekolah
    loading?: boolean;    // Tambahan props status loading
}

const GROUPS_CONFIG = [
    { title: "Utama", icon: <LayoutDashboard size={20} />, items: ["Dashboard", "User Management", "Hak Akses & Role"] },
    { title: "Akademik", icon: <Database size={20} />, items: ["Tahun Ajaran", "Semester", "Kurikulum", "Kalender Academic", "Jam Sekolah", "Mata Pelajaran"] },
    { title: "Data Master", icon: <FolderArchive size={20} />, items: ["Data Tingkatan", "Data Jurusan", "Data Kelas", "Data Guru", "Semua Data Siswa", "Semua Data Orang Tua"] },
    { title: "Operasional", icon: <Users size={20} />, items: ["Guru Mapel", "Presensi Harian", "Monitoring Presensi Mapel", "Monitoring Poin Siswa", "Kenaikan Kelas (Massal)", "Ekstrakurikuler"] }
];

export default function Sidebar({ 
    isMobileOpen, 
    setIsMobileOpen, 
    user, 
    schoolProfile, 
    loading 
}: SidebarProps) {
    const pathname = usePathname();
    
    // State UI tetap dipertahankan sesuai kode asli Anda
    const [isCollapsed, setIsCollapsed] = useState(false);

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        "Utama": true,
        "Akademik": false,
        "Data Master": false,
        "Operasional": false
    });

    // Sinkronisasi status collapsed dengan localStorage
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

    // Menggunakan data 'user' dari props untuk memfilter menu
    const filteredMenuGroups = useMemo(() => {
        if (!user) return [];
        const currentRole = (user.current_role as string)?.toLowerCase() || "";

        return GROUPS_CONFIG.map(group => {
            const menuItems = MENU_LIST.filter(m => {
                const isInsideGroup = group.items.includes(m.title);
                const allowedRoles = Array.isArray(m.role) 
                    ? m.role.map((r: any) => String(r).toLowerCase()) 
                    : m.role ? [String(m.role).toLowerCase()] : [];

                const hasPermission = !m.role || allowedRoles.includes(currentRole) || currentRole === 'admin';
                return isInsideGroup && hasPermission;
            });
            return { ...group, menuItems };
        }).filter(group => group.menuItems.length > 0); 
    }, [user]);

    const handleGroupClick = useCallback((title: string) => {
        setOpenGroups(prev => {
            if (isCollapsed) {
                setIsCollapsed(false);
                return { ...prev, [title]: true };
            }
            return { ...prev, [title]: !prev[title] };
        });
    }, [isCollapsed]);

    // Menggunakan status 'loading' dari props
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
                                <img src={schoolProfile.logo} alt="Logo Sekolah" className="sidebar-logo-img" />
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
                            >
                                <span className="text-primary d-flex align-items-center">{group.icon}</span>
                                {!isCollapsed && (
                                    <>
                                        <span className="flex-grow-1 sidebar-school-name fw-bold opacity-75 ms-2">
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
"use client";

import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { 
    Users, GraduationCap, Mail, School, Calendar, 
    History, Megaphone, ShieldCheck, ArrowUpRight,
    LayoutGrid
} from 'lucide-react';

const styles = {
    wrapper: "admin-dashboard-wrapper p-2",
    card: "card shadow-sm rounded-3xl border-0 bg-white h-100",
    headerCard: "p-3 border-bottom d-flex justify-content-between align-items-center",
    tableTh: "px-3 py-2 border-0 text-muted text-uppercase x-small-text tracking-widest",
    metricRow: "d-flex justify-content-between align-items-center p-2 rounded-2xl bg-light bg-opacity-50 border border-light hover-lift",
    statIcon: "stat-icon-box d-flex align-items-center justify-content-center rounded-xl p-2",
    skeletonStat: "bg-light rounded-4 w-100 skeleton-h-120",
    skeletonContent: "bg-light rounded-4 w-100 skeleton-h-300"
};

const StatCard = memo(({ label, value, icon, variant, trend }: any) => (
    <div className="col-12 col-sm-6 col-md-3">
        <div className={`${styles.card} p-3 hover-lift`}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className={`${styles.statIcon} ${variant}`}>
                    {icon}
                </div>
                <span className="fw-black xx-small-text text-uppercase tracking-widest px-2 py-1 rounded bg-light text-muted">
                    {trend}
                </span>
            </div>
            <div className="fw-bold text-muted x-small-text text-uppercase tracking-wider mb-0">{label}</div>
            <div className="h4 fw-black text-dark tracking-tighter mb-0">{value || 0}</div>
        </div>
    </div>
));

const LightMetric = memo(({ label, value }: any) => (
    <div className={styles.metricRow}>
        <span className="small fw-bold text-muted">{label}</span>
        <span className="h6 fw-black font-monospace mb-0 text-dark">{value || 0}</span>
    </div>
));

export default function AdminView() {
    const { user } = useAuth();
    const [dash, setDash] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const timeFormatter = useMemo(() => 
        new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }), 
    []);

    const fetchData = useCallback(async () => {
        try {
            const res = await api.admin.getDashboard();
            const data = res.data.data;
            setDash(data);
            localStorage.setItem('admin_dash_cache', JSON.stringify(data));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const cache = localStorage.getItem('admin_dash_cache');
        if (cache) {
            setDash(JSON.parse(cache));
            setLoading(false);
        }
        
        fetchData();
    }, [fetchData]);

    const stats = useMemo(() => dash?.statistics || {}, [dash]);
    const agenda = useMemo(() => dash?.common?.kalender_akademik || [], [dash]);
    const announcements = useMemo(() => dash?.common?.recent_pengumuman?.slice(0, 3) || [], [dash]);
    const logs = useMemo(() => dash?.recent_logs || [], [dash]);

    const formatDateOnly = useCallback((dateString: string) => (
        dateString ? dateString.split(" ")[0] : ""
    ), []);

    if (loading && !dash) return <DashboardSkeleton />;

    return (
        <div className={styles.wrapper}>
            <div className="row g-3 mb-3">
                <StatCard label="Guru" value={stats.guru_aktif} icon={<Users size={20} />} variant="stat-blue" trend="Tenaga Pendidik" />
                <StatCard label="Siswa" value={stats.siswa_aktif} icon={<GraduationCap size={20} />} variant="stat-teal" trend="Total Siswa" />
                <StatCard label="Pesan" value={stats.pesan_baru} icon={<Mail size={20} />} variant="stat-orange" trend="Kotak Masuk" />
                <StatCard label="Jurusan" value={stats.total_jurusan} icon={<School size={20} />} variant="stat-purple" trend="Program Studi" />
            </div>

            <div className="row g-3 mb-3">
                <div className="col-lg-8">
                    <div className={`${styles.card} p-3`}>
                        <h6 className="fw-black mb-3 d-flex align-items-center gap-2">
                            <Calendar size={18} className="text-primary" /> Agenda Akademik
                        </h6>
                        <div className="row g-2">
                            {agenda.map((item: any, i: number) => (
                                <div key={i} className="col-md-6">
                                    <div className="p-2 rounded-2xl border border-light bg-light bg-opacity-25 d-flex align-items-center justify-content-between hover-lift">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className={`avatar-32 rounded-circle d-flex align-items-center justify-content-center ${item.status === 'Aktif' ? 'bg-success text-white' : 'bg-secondary text-white opacity-25'}`}>
                                                <Calendar size={14} />
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark small leading-tight">{item.kegiatan}</div>
                                                <div className="fw-black text-muted xx-small-text text-uppercase">{formatDateOnly(item.tanggal_mulai)}</div>
                                            </div>
                                        </div>
                                        <ArrowUpRight size={14} className="text-muted" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className={`${styles.card} p-3`}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="fw-black mb-0">Pengumuman</h6>
                            <Megaphone size={16} className="text-primary opacity-50" />
                        </div>
                        <div className="vstack gap-0">
                            {announcements.map((p: any, i: number) => (
                                <div key={i} className="py-2 border-bottom border-light last:border-0 cursor-pointer group">
                                    <div className="fw-black text-primary xx-small-text text-uppercase tracking-widest mb-0">{formatDateOnly(p.tanggal_publikasi)}</div>
                                    <div className="fw-bold text-dark small leading-snug group-hover:text-primary transition-colors">{p.judul}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-3">
                <div className="col-lg-8">
                    <div className={`${styles.card} overflow-hidden`}>
                        <div className={styles.headerCard}>
                            <div className="d-flex align-items-center gap-2">
                                <History size={18} className="text-secondary" />
                                <h6 className="fw-black mb-0">Log Aktivitas Terbaru</h6>
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table align-middle mb-0 table-sm">
                                <thead className="bg-light">
                                    <tr className={styles.tableTh}>
                                        <th className="px-3 py-2 border-0">Operator</th>
                                        <th className="py-2 border-0">Aksi & Perubahan</th>
                                        <th className="px-3 py-2 border-0 text-end">Waktu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log: any, i: number) => (
                                        <tr key={i} className="border-bottom border-light last:border-0">
                                            <td className="px-3 py-3 border-0">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="bg-primary rounded text-white d-flex align-items-center justify-content-center fw-black x-small-text avatar-32">
                                                        {log.user?.username?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                    <span className="fw-bold text-dark small">{log.user?.username}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 border-0">
                                                <span className="text-dark small fw-bold opacity-75">{log.aksi}</span>
                                            </td>
                                            <td className="px-3 text-end text-muted small font-monospace border-0">
                                                {timeFormatter.format(new Date(log.created_at))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className={`${styles.card} p-3 position-relative overflow-hidden`}>
                         <div className="pos-abs-top-end opacity-10 translate-25-n25 text-primary">
                            <LayoutGrid size={140} />
                         </div>
                         <div className="position-relative z-1 d-flex flex-column h-100">
                            <p className="fw-black text-muted x-small-text text-uppercase tracking-widest mb-3">Content Management</p>
                            <div className="vstack gap-2 mt-auto">
                                <LightMetric label="Berita" value={stats.total_berita} />
                                <LightMetric label="Fasilitas" value={stats.total_fasilitas} />
                                <LightMetric label="Eskul" value={stats.total_ekstrakurikuler} />
                                <LightMetric label="Jurusan" value={stats.total_jurusan} />
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className={styles.wrapper}>
            <div className="animate-pulse">
                <div className="row g-3 mb-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="col-md-3">
                            <div className={styles.skeletonStat}></div>
                        </div>
                    ))}
                </div>
                <div className="row g-3">
                    <div className="col-lg-8"><div className={styles.skeletonContent}></div></div>
                    <div className="col-lg-4"><div className={styles.skeletonContent}></div></div>
                </div>
            </div>
        </div>
    );
}
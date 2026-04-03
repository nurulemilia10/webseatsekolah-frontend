"use client";

import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, GraduationCap, BookOpen, School, Calendar, 
  History, Megaphone, ShieldCheck, ArrowUpRight,
  Info
} from 'lucide-react';

const styles = {
  wrapper: "guru-dashboard-wrapper p-2",
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

export default function GuruView() {
  const { user } = useAuth();
  const [dash, setDash] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (isMounted: boolean) => {
    try {
      const res = await api.guru.getDashboard(); 
      if (isMounted) {
        const data = res.data.data;
        setDash(data);
        setLoading(false);
        localStorage.setItem('guru_dash_cache', JSON.stringify(data));
      }
    } catch (error) {
      if (isMounted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const cache = localStorage.getItem('guru_dash_cache');
    if (cache) {
      setDash(JSON.parse(cache));
      setLoading(false);
    }
    fetchData(isMounted);
    return () => { isMounted = false; };
  }, [fetchData]);

  const stats = useMemo(() => dash?.statistics || {}, [dash]);
  const agenda = useMemo(() => dash?.kalender_akademik || [], [dash]);
  const announcements = useMemo(() => dash?.common?.recent_pengumuman?.slice(0, 3) || [], [dash]);
  const common = useMemo(() => dash?.common || {}, [dash]);

  const formatDateOnly = useCallback((dateString: string) => (
    dateString ? dateString.split(" ")[0] : ""
  ), []);

  if (loading && !dash) return <DashboardSkeleton />;

  return (
    <div className={styles.wrapper}>
      <div className="row g-3 mb-3">
        <StatCard label="Siswa Binaan" value={stats.total_siswa_binaan} icon={<Users size={20} />} variant="stat-blue" trend="Wali Kelas" />
        <StatCard label="Hadir Hari Ini" value={stats.presensi_hari_ini} icon={<ShieldCheck size={20} />} variant="stat-teal" trend="Presensi" />
        <StatCard label="Mata Pelajaran" value={stats.mapel_diampu} icon={<BookOpen size={20} />} variant="stat-orange" trend="Jam Mengajar" />
        
        {stats.total_siswa_global !== undefined && (
          <StatCard 
            label="Total Siswa" 
            value={stats.total_siswa_global} 
            icon={<GraduationCap size={20} />} 
            variant="stat-purple" 
            trend={dash?.manajerial?.role_jabatan || "Sekolah"} 
          />
        )}
        
        {stats.siswa_jurusan !== undefined && stats.total_siswa_global === undefined && (
          <StatCard 
            label="Siswa Jurusan" 
            value={stats.siswa_jurusan} 
            icon={<School size={20} />} 
            variant="stat-purple" 
            trend={dash?.manajerial?.role_jabatan || "Jurusan"} 
          />
        )}
      </div>

      <div className="row g-3 mb-3">
        <div className="col-lg-8">
          <div className={`${styles.card} p-3`}>
            <h6 className="fw-black mb-3 d-flex align-items-center gap-2">
              <GraduationCap size={18} className="text-warning" /> Kalender Akademik
            </h6>
            <div className="row g-2">
              {agenda.map((item: any, i: number) => item && (
                <div key={i} className="col-md-6">
                  <div className="p-2 rounded-2xl border border-light bg-light bg-opacity-25 d-flex align-items-center justify-content-between hover-lift">
                    <div className="d-flex align-items-center gap-3">
                      <div className={`avatar-32 rounded-circle d-flex align-items-center justify-content-center ${item.status === 'Sedang Berlangsung' ? 'bg-success' : 'bg-warning'} text-white`}>
                        <Calendar size={14} />
                      </div>
                      <div>
                        <div className="fw-bold text-dark small leading-tight">{item.kegiatan}</div>
                        <div className="fw-black text-muted xx-small-text text-uppercase">{item.status || 'Agenda'} • {formatDateOnly(item.tanggal_mulai)}</div>
                      </div>
                    </div>
                    <ArrowUpRight size={14} className="text-muted" />
                  </div>
                </div>
              ))}
              {agenda.length === 0 && <div className="p-3 text-muted x-small-text">Tidak ada agenda terdekat.</div>}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className={`${styles.card} p-3`}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-black mb-0">Pengumuman</h6>
              <Megaphone size={16} className="text-warning opacity-50" />
            </div>
            <div className="vstack gap-0">
              {announcements.map((p: any, i: number) => (
                <div key={i} className="py-2 border-bottom border-light last:border-0 cursor-pointer group">
                  <div className="fw-black text-warning xx-small-text text-uppercase tracking-widest mb-0">{formatDateOnly(p.tanggal_publikasi)}</div>
                  <div className="fw-bold text-dark small leading-snug group-hover:text-warning transition-colors">{p.judul}</div>
                </div>
              ))}
              {announcements.length === 0 && <div className="py-3 text-muted x-small-text text-center">Belum ada pengumuman.</div>}
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
                <h6 className="fw-black mb-0">Berita Sekolah Terbaru</h6>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0 table-sm">
                <thead className="bg-light">
                  <tr className={styles.tableTh}>
                    <th className="px-3 py-2 border-0">Judul Berita</th>
                    <th className="py-2 border-0">Tanggal</th>
                    <th className="px-3 py-2 border-0 text-end">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {common.recent_berita?.map((berita: any, i: number) => (
                    <tr key={i} className="border-bottom border-light last:border-0">
                      <td className="px-3 py-3 border-0">
                        <div className="d-flex align-items-center gap-3">
                           {berita.foto_url ? (
                             <img src={berita.foto_url} alt="" className="avatar-32 rounded object-cover" />
                           ) : (
                             <div className="avatar-32 bg-light rounded d-flex align-items-center justify-content-center text-muted">
                               <School size={14} />
                             </div>
                           )}
                           <span className="fw-bold text-dark small">{berita.judul}</span>
                        </div>
                      </td>
                      <td className="py-3 border-0 text-muted small">
                        {berita.tanggal_human}
                      </td>
                      <td className="px-3 text-end border-0">
                        <button 
                          className="btn btn-sm btn-warning rounded-circle p-1"
                          title="Lihat Detail Berita"
                          aria-label="Lihat Detail Berita"
                        >
                          <ArrowUpRight size={14} />
                        </button>
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
             <div className="pos-abs-top-end opacity-10 translate-25-n25 text-warning">
                <GraduationCap size={140} />
             </div>
             <div className="position-relative z-1 d-flex flex-column h-100">
                <p className="fw-black text-muted x-small-text text-uppercase tracking-widest mb-3">Info Jurusan & Jabatan</p>
                
                <div className="mb-4">
                    <div className="fw-black text-dark h5 text-uppercase tracking-widest mb-0 leading-tight">
                        {dash?.manajerial?.role_jabatan || 'GURU PENGAJAR'}
                    </div>
                    <div className="xx-small-text text-warning text-uppercase fw-bold tracking-widest opacity-75">
                        Status Penugasan Aktif
                    </div>
                </div>

                <div className="vstack gap-2 mt-auto">
                  {stats.total_guru_staf !== undefined && <LightMetric label="Total Guru & Staf" value={stats.total_guru_staf} />}
                  {stats.total_mapel !== undefined && <LightMetric label="Total Mata Pelajaran" value={stats.total_mapel} />}
                  {stats.siswa_jurusan !== undefined && <LightMetric label="Siswa Jurusan" value={stats.siswa_jurusan} />}
                  {stats.kelas_jurusan !== undefined && <LightMetric label="Kelas Jurusan" value={stats.kelas_jurusan} />}
                  {stats.guru_jurusan !== undefined && <LightMetric label="Guru Jurusan" value={stats.guru_jurusan} />}
                  {stats.total_pengumuman !== undefined && <LightMetric label="Total Pengumuman" value={stats.total_pengumuman} />}
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
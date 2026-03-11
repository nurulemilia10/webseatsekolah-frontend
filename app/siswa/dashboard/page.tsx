"use client";

import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import api from '@/lib/api';
import { 
  Award, Clock, AlertCircle, BookOpen, Calendar, 
  History, Megaphone, ArrowUpRight,
  MessageCircle, FileText, GraduationCap, School
} from 'lucide-react';

interface SiswaViewProps {
  user?: any;
}

const styles = {
  wrapper: "siswa-dashboard-wrapper p-2",
  card: "card shadow-sm rounded-3xl border-0 bg-white h-100",
  headerCard: "p-3 border-bottom d-flex justify-content-between align-items-center",
  tableTh: "px-3 py-2 border-0 text-muted text-uppercase x-small-text tracking-widest",
  metricRow: "d-flex justify-content-between align-items-center p-2 rounded-2xl bg-light bg-opacity-50 border border-light hover-lift",
  statIcon: "stat-icon-box d-flex align-items-center justify-content-center rounded-xl p-2",
  skeletonStat: "bg-light rounded-4 w-100 skeleton-h-120",
  skeletonContent: "bg-light rounded-4 w-100 skeleton-h-300",
  actionBtn: "btn btn-sm w-100 rounded-2xl py-2 d-flex align-items-center justify-content-center gap-2 fw-bold transition-all"
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
    <span className="h6 fw-black font-monospace mb-0 text-dark text-truncate ps-2">{value || '-'}</span>
  </div>
));

export default function SiswaView({ user }: SiswaViewProps) {
  const [dash, setDash] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (isMounted: boolean) => {
    try {
      const res = await api.siswa.getDashboard();
      if (isMounted) {
        const data = res.data.data;
        setDash(data);
        setLoading(false);
        localStorage.setItem('siswa_dash_cache', JSON.stringify(data));
      }
    } catch (error) {
      if (isMounted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const cache = localStorage.getItem('siswa_dash_cache');
    if (cache) {
      setDash(JSON.parse(cache));
      setLoading(false);
    }
    fetchData(isMounted);
    return () => { isMounted = false; };
  }, [fetchData]);

  const stats = useMemo(() => dash?.statistics || {}, [dash]);
  const agenda = useMemo(() => dash?.akademik?.kalender || [], [dash]);
  const info = useMemo(() => dash?.user_info || {}, [dash]);
  const akademik = useMemo(() => dash?.akademik || {}, [dash]);
  const sekolah = useMemo(() => dash?.sekolah || {}, [dash]);
  const header = useMemo(() => dash?.header || {}, [dash]);

  if (loading && !dash) return <DashboardSkeleton />;

  return (
    <div className={styles.wrapper}>
      <div className="row g-3 mb-3">
        <StatCard label="Poin Akumulasi" value={stats.poin?.akumulasi} icon={<Award size={20} />} variant="stat-blue" trend="Karakter" />
        <StatCard label="Kehadiran" value={stats.presensi?.hadir} icon={<Clock size={20} />} variant="stat-teal" trend="Hadir" />
        <StatCard label="Ketidakhadiran" value={(stats.presensi?.alpa || 0) + (stats.presensi?.sakit || 0) + (stats.presensi?.izin || 0)} icon={<AlertCircle size={20} />} variant="stat-orange" trend="A / S / I" />
        <StatCard label="Jadwal Hari Ini" value={stats.total_jadwal_hari_ini} icon={<BookOpen size={20} />} variant="stat-purple" trend="Mata Pelajaran" />
      </div>

      <div className="row g-3 mb-3">
        <div className="col-lg-8">
          <div className={`${styles.card} p-3`}>
            <h6 className="fw-black mb-3 d-flex align-items-center gap-2">
              <Calendar size={18} className="text-primary" /> Agenda Terdekat
            </h6>
            <div className="row g-2">
              {agenda.map((item: any, i: number) => (
                <div key={i} className="col-md-6">
                  <div className="p-2 rounded-2xl border border-light bg-light bg-opacity-25 d-flex align-items-center justify-content-between hover-lift">
                    <div className="d-flex align-items-center gap-3">
                      <div className={`avatar-32 rounded-circle d-flex align-items-center justify-content-center ${item.status === 'Aktif' ? 'bg-success text-white' : 'bg-primary text-white'}`}>
                        <Calendar size={14} />
                      </div>
                      <div>
                        <div className="fw-bold text-dark small leading-tight">{item.kegiatan}</div>
                        <div className="fw-black text-muted xx-small-text text-uppercase">{item.tanggal_mulai} • {item.status}</div>
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
              <h6 className="fw-black mb-0">Pengumuman Terbaru</h6>
              <Megaphone size={16} className="text-primary opacity-50" />
            </div>
            <div className="vstack gap-0">
              {akademik.pengumuman_terbaru ? (
                <div className="py-1">
                  <div className="fw-black text-primary xx-small-text text-uppercase tracking-widest mb-1">{akademik.pengumuman_terbaru.tanggal}</div>
                  <div className="fw-bold text-dark small mb-1">{akademik.pengumuman_terbaru.judul}</div>
                  <p className="text-muted xx-small-text mb-0 line-clamp-3">{akademik.pengumuman_terbaru.isi}</p>
                </div>
              ) : (
                <div className="py-3 text-muted x-small-text text-center">Belum ada pengumuman.</div>
              )}
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
                <h6 className="fw-black mb-0">Berita Sekolah</h6>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0 table-sm">
                <thead className="bg-light">
                  <tr className={styles.tableTh}>
                    <th className="px-3 py-2 border-0">Judul Berita</th>
                    <th className="py-2 border-0 text-end pe-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {akademik.berita_terbaru?.map((berita: any, i: number) => (
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
                          <div>
                            <span className="fw-bold text-dark small d-block">{berita.judul}</span>
                            <span className="xx-small-text text-muted text-uppercase fw-black">{berita.tanggal_human}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 text-end border-0">
                        <button 
                          className="btn btn-sm btn-light rounded-circle p-1"
                          aria-label={`Baca: ${berita.judul}`}
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
              <div className="pos-abs-top-end opacity-10 translate-25-n25 text-primary">
                <GraduationCap size={140} />
              </div>
              <div className="position-relative z-1 d-flex flex-column h-100">
                <p className="fw-black text-muted x-small-text text-uppercase tracking-widest mb-3">Informasi Akademik</p>
                <div className="mb-3">
                    <div className="fw-black text-dark h5 text-uppercase tracking-widest mb-0 leading-tight">
                        {info.kelas || 'SISWA'}
                    </div>
                    <div className="xx-small-text text-primary text-uppercase fw-bold tracking-widest opacity-75">
                        NIS: {info.nis}
                    </div>
                </div>
                
                <div className="vstack gap-2 mb-4">
                  <LightMetric label="Tahun Ajaran" value={header.tahun_ajaran} />
                  <LightMetric label="Semester" value={header.semester} />
                  <LightMetric label="Wali Kelas" value={info.wali_kelas} />
                  <LightMetric label="Poin (+)" value={stats.poin?.total_positif} />
                  <LightMetric label="Poin (-)" value={stats.poin?.total_negatif} />
                </div>

                <div className="mt-auto pt-3 border-top border-light">
                  <p className="fw-black text-muted xx-small-text text-uppercase tracking-widest mb-2">Layanan Sekolah</p>
                  <div className="row g-2">
                    <div className="col-6">
                      <a href={sekolah.buku_poin || "#"} target="_blank" rel="noopener noreferrer" className={`${styles.actionBtn} btn-light text-dark shadow-none`}>
                        <FileText size={14} /> Buku Poin
                      </a>
                    </div>
                    <div className="col-6">
                      <a href={sekolah.wa_kesiswaan ? `https://wa.me/${sekolah.wa_kesiswaan.replace(/\D/g,'')}` : "#"} target="_blank" rel="noopener noreferrer" className={`${styles.actionBtn} btn-success text-white border-0 shadow-none`}>
                        <MessageCircle size={14} /> Kesiswaan
                      </a>
                    </div>
                  </div>
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
"use client";
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function GuruView({ user }: { user: any }) {
  const [dash, setDash] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sesuai dokumentasi API: http://localhost:8000/api/guru/dashboard
    api.guru.getDashboard()
      .then(res => {
        setDash(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-8 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const stats = dash?.statistics;
  const common = dash?.common;
  const manajerial = dash?.manajerial;

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
             {user?.foto ? (
               <img src={user.foto} alt="Profile" className="h-full w-full object-cover" />
             ) : (
               <span className="text-2xl font-black text-blue-600">{user?.username?.charAt(0).toUpperCase()}</span>
             )}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">Selamat Datang, {user?.username}</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{manajerial?.role_jabatan || 'Tenaga Pengajar'}</p>
          </div>
        </div>
        <div className="flex gap-2">
            <span className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase tracking-widest">
                Semester Aktif
            </span>
        </div>
      </div>

      {/* Grid Statistik - Sesuai Object "statistics" di API */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          label="Siswa Binaan" 
          value={stats?.total_siswa_binaan} 
          desc="Total Siswa dalam bimbingan"
          color="blue"
        />
        <StatCard 
          label="Presensi Hari Ini" 
          value={stats?.presensi_hari_ini} 
          desc="Rata-rata kehadiran"
          color="emerald"
        />
        <StatCard 
          label="Mapel Diampu" 
          value={stats?.mapel_diampu} 
          desc="Mata pelajaran aktif"
          color="orange"
        />
      </div>

      {/* Info Jurusan - Jika Jabatan Manajerial Aktif */}
      {stats?.siswa_jurusan > 0 && (
        <div className="bg-indigo-900 p-6 rounded-[2rem] text-white flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl shadow-indigo-100">
           <div className="text-center md:text-left">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Statistik Jurusan</p>
             <h2 className="text-lg font-bold">Ringkasan Data Kompetensi Keahlian</h2>
           </div>
           <div className="flex gap-8">
              <div className="text-center">
                <p className="text-2xl font-black">{stats?.siswa_jurusan}</p>
                <p className="text-[9px] font-bold uppercase opacity-60">Siswa</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black">{stats?.guru_jurusan}</p>
                <p className="text-[9px] font-bold uppercase opacity-60">Guru</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black">{stats?.kelas_jurusan}</p>
                <p className="text-[9px] font-bold uppercase opacity-60">Kelas</p>
              </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Berita - Sesuai Object "common.recent_berita" */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 text-center md:text-left">Berita & Informasi Sekolah</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {common?.recent_berita?.map((berita: any, i: number) => (
              <div key={i} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden group hover:shadow-lg transition-all">
                <div className="h-40 bg-slate-100 relative overflow-hidden">
                  <img src={berita.foto_url} alt={berita.judul} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black text-slate-800 uppercase">
                    {berita.tanggal_human}
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-slate-800 line-clamp-2 leading-snug mb-2">{berita.judul}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Baca Selengkapnya →</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Pengumuman - Sesuai Object "common.recent_pengumuman" */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Pengumuman</h3>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
            {common?.recent_pengumuman?.map((p: any, i: number) => (
              <div key={i} className={`p-4 rounded-2xl border ${p.penting ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex justify-between items-start mb-1">
                  <p className={`text-[9px] font-black uppercase ${p.penting ? 'text-red-600' : 'text-slate-400'}`}>
                    {p.penting ? 'PENTING' : 'INFO'}
                  </p>
                  <span className="text-[9px] text-slate-400 font-bold">{p.tanggal_publikasi}</span>
                </div>
                <p className="text-xs font-bold text-slate-800 line-clamp-2">{p.judul}</p>
              </div>
            ))}
            {common?.recent_pengumuman?.length === 0 && (
              <p className="text-xs text-center text-slate-400 italic py-4">Tidak ada pengumuman terbaru</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, desc, color }: any) {
  const colors: any = {
    blue: "border-blue-200 bg-white text-blue-600",
    emerald: "border-emerald-200 bg-white text-emerald-600",
    orange: "border-orange-200 bg-white text-orange-600",
  };

  return (
    <div className={`p-6 rounded-[2rem] border-2 shadow-sm ${colors[color]} flex flex-col items-center text-center group hover:bg-slate-50 transition-all`}>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
      <p className="text-4xl font-black tracking-tighter mb-1">{value || 0}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
        {desc}
      </p>
    </div>
  );
}
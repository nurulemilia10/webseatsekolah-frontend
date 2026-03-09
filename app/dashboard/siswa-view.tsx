"use client";
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function SiswaView({ user }: { user: any }) {
  const [dash, setDash] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sesuai API: http://localhost:8000/api/siswa/dashboard
    api.siswa.getDashboard()
      .then(res => {
        setDash(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSwitchRole = async (targetRole: string) => {
    const res = await api.auth.switchRole({ role: targetRole }); //
    if (res.data.success) window.location.reload();
  };

  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('foto', file);
      await api.auth.updateFoto(formData); //
      window.location.reload();
    }
  };

  if (loading) return <div className="p-10 text-center font-black animate-pulse">MEMUAT DATA...</div>;

  const { user_info, statistics, akademik, header, sekolah } = dash;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header & Role Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Dashboard Siswa</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {header?.tahun_ajaran} — Semester {header?.semester}
          </p>
        </div>
        
        {/* Switch Role Button - Jika ada di data user */}
        {user?.roles && (
           <div className="flex gap-2">
             <button 
               onClick={() => handleSwitchRole('ortu')}
               className="px-4 py-2 bg-white border-2 border-slate-200 rounded-2xl text-[10px] font-black uppercase hover:border-blue-600 transition-all"
             >
               Pindah ke Ortu
             </button>
           </div>
        )}
      </div>

      {/* Profile Card & Info Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-center">
          <div className="relative group">
            <div className="h-32 w-32 bg-slate-100 rounded-[2.5rem] border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
              {user?.foto ? (
                <img src={user.foto} className="h-full w-full object-cover" alt="Profile" />
              ) : (
                <span className="text-4xl font-black text-slate-300">S</span>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl cursor-pointer hover:bg-blue-700 shadow-lg transition-all">
              <input type="file" className="hidden" onChange={handleUploadFoto} accept="image/*" />
              <span className="text-[10px] font-black uppercase px-2">Ganti</span>
            </label>
          </div>

          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-black text-slate-800 uppercase leading-none">{user_info?.nama}</h2>
            <p className="text-sm font-bold text-blue-600 mt-1">{user_info?.nis} — {user_info?.kelas}</p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-tighter">Wali: {user_info?.wali_kelas}</span>
              <a href={sekolah?.wa_kesiswaan} className="px-3 py-1 bg-green-50 rounded-full text-[9px] font-black text-green-600 uppercase tracking-tighter">Hubungi Kesiswaan</a>
            </div>
          </div>
        </div>

        {/* Poin Card */}
        <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl flex flex-col justify-center items-center text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-2">Akumulasi Poin</p>
          <p className="text-6xl font-black tracking-tighter">{statistics?.poin?.akumulasi}</p>
          <div className="flex gap-4 mt-4 text-[9px] font-black uppercase">
            <span className="text-emerald-400">+{statistics?.poin?.total_positif} Positif</span>
            <span className="text-red-400">{statistics?.poin?.total_negatif} Negatif</span>
          </div>
        </div>
      </div>

      {/* Statistik Presensi */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PresensiCard label="Hadir" value={statistics?.presensi?.hadir} color="blue" />
        <PresensiCard label="Izin" value={statistics?.presensi?.izin} color="emerald" />
        <PresensiCard label="Sakit" value={statistics?.presensi?.sakit} color="orange" />
        <PresensiCard label="Alpa" value={statistics?.presensi?.alpa} color="red" />
      </div>

      {/* Row Bawah: Berita & Pengumuman */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Berita Terkini</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {akademik?.berita_terbaru?.map((item: any) => (
              <div key={item.id} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden group shadow-sm hover:shadow-md transition-all">
                <div className="h-40 bg-slate-200 relative">
                  <img src={item.foto_url} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" alt="News" />
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black uppercase">{item.tanggal_human}</div>
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-slate-800 line-clamp-2 leading-snug">{item.judul}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Pengumuman</h3>
          <div className="bg-blue-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-blue-100">
            <h4 className="font-black text-lg leading-tight mb-2">{akademik?.pengumuman_terbaru?.judul}</h4>
            <p className="text-xs opacity-80 line-clamp-4 leading-relaxed">{akademik?.pengumuman_terbaru?.isi}</p>
            <p className="text-[9px] font-black mt-6 opacity-50 uppercase tracking-widest">{akademik?.pengumuman_terbaru?.tanggal}</p>
          </div>
          
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200">
             <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Agenda Mendatang</p>
             <div className="space-y-3">
               {akademik?.kalender?.slice(0, 2).map((k: any, i: number) => (
                 <div key={i} className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{k.kegiatan}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{k.tanggal_mulai}</p>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PresensiCard({ label, value, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    red: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <div className={`p-6 rounded-[2rem] border-2 shadow-sm text-center ${colors[color]} group hover:bg-white transition-all`}>
      <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
      <p className="text-3xl font-black tracking-tighter">{value || 0}</p>
    </div>
  );
}
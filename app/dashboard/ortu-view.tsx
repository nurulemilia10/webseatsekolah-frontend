"use client";
import { useEffect, useState } from 'react';
import api from '@/lib/api';

// SEBELUMNYA: export default function OrtuView()
// SEKARANG: Menerima props user agar sinkron dengan page.tsx
export default function OrtuView({ user }: { user: any }) {
  const [dash, setDash] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.ortu.getDashboard()
      .then(res => {
        setDash(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    if(confirm("Yakin ingin keluar?")) {
      await api.auth.logout();
      window.location.href = "/login";
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const header = dash?.header;
  const anakList = dash?.anak_statistics || [];
  const akademik = dash?.akademik;
  const sekolah = dash?.sekolah;

  return (
    <div className="p-6 space-y-8 bg-slate-50/50 min-h-screen">
      {/* Top Navigation & Profile Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Menggunakan foto user dari props jika tersedia */}
          <div className="h-14 w-14 bg-orange-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg shadow-orange-100 font-black text-xl overflow-hidden">
            {user?.foto ? (
              <img src={user.foto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.username?.charAt(0).toUpperCase() || 'P'
            )}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">
              Portal {user?.username || 'Orang Tua'}
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              {header?.tahun_ajaran} • Semester {header?.semester}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => {/* Modal Change Password */}} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase hover:bg-slate-50 transition-all shadow-sm">
            Ganti Password
          </button>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase hover:bg-red-100 transition-all">
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Statistik Anak (Mapping Array) */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Monitor Perkembangan Anak</h3>
          
          {anakList.map((anak: any, index: number) => (
            <div key={index} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md group">
              <div className="p-8 flex flex-col md:flex-row gap-8 items-start">
                {/* Profile Card Anak */}
                <div className="flex flex-col items-center gap-3 w-full md:w-auto">
                  <div className="h-24 w-24 bg-slate-100 rounded-[2rem] border-4 border-white shadow-xl flex items-center justify-center text-slate-300 font-black text-2xl overflow-hidden relative">
                    <span className="opacity-50 text-[10px] font-black uppercase">Anak</span>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-slate-800 leading-none group-hover:text-orange-600 transition-colors">{anak.nama_anak}</p>
                    <p className="text-[10px] font-bold text-blue-600 uppercase mt-2 tracking-widest">{anak.kelas}</p>
                  </div>
                </div>

                {/* Stats Breakdown */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                  <MiniStat label="Hadir" value={`${anak.statistics.presensi.hadir}`} color="emerald" />
                  <MiniStat label="Izin/Sakit" value={`${anak.statistics.presensi.izin + anak.statistics.presensi.sakit}`} color="blue" />
                  <MiniStat label="Alpa" value={`${anak.statistics.presensi.alpa}`} color="red" />
                  <div className="p-4 bg-slate-900 rounded-[1.5rem] text-white flex flex-col items-center justify-center shadow-lg shadow-slate-200">
                    <p className="text-[9px] font-black uppercase opacity-60">Poin</p>
                    <p className="text-xl font-black">{anak.statistics.poin.akumulasi}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase">
                  Wali Kelas: <span className="text-slate-800 font-black">{anak.wali_kelas}</span>
                </p>
                <a 
                  href={`https://wa.me/${sekolah?.wa_kesiswaan}`} 
                  target="_blank" 
                  className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter hover:underline"
                >
                  Hubungi Kesiswaan via WhatsApp →
                </a>
              </div>
            </div>
          ))}

          {anakList.length === 0 && (
             <div className="p-10 text-center bg-white rounded-[2rem] border border-dashed border-slate-300">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Data anak tidak ditemukan</p>
             </div>
          )}
        </div>

        {/* Kolom Kanan: Info Sekolah */}
        <div className="space-y-6">
          {/* Pengumuman Terbaru */}
          <div className="bg-orange-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-orange-100 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-4">Pengumuman Sekolah</h3>
              <p className="text-lg font-bold leading-tight mb-2 line-clamp-2">{akademik?.pengumuman_terbaru?.judul || 'Tidak ada pengumuman'}</p>
              <p className="text-xs opacity-80 line-clamp-3 mb-6 font-medium leading-relaxed">
                {akademik?.pengumuman_terbaru?.isi}
              </p>
              <span className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-tighter">
                {akademik?.pengumuman_terbaru?.tanggal || '-'}
              </span>
            </div>
            <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
          </div>

          {/* Kalender Akademik */}
          <div className="bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 ml-1">Kalender Akademik</h3>
            <div className="space-y-5">
              {akademik?.kalender?.slice(0, 3).map((cal: any, i: number) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="text-center min-w-[45px] bg-slate-50 p-2 rounded-xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase">TGL</p>
                    <p className="text-sm font-black text-orange-600 leading-none">{cal.tanggal_mulai.split('-')[2]}</p>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-100"></div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-700 leading-tight">{cal.kegiatan}</p>
                    <p className={`text-[8px] font-black uppercase mt-1 ${cal.status === 'Aktif' ? 'text-emerald-500' : 'text-slate-400'}`}>
                      ● {cal.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Link Buku Poin */}
          <a 
            href={sekolah?.buku_poin} 
            target="_blank" 
            className="bg-slate-900 p-6 rounded-[2rem] text-white flex items-center justify-between group cursor-pointer hover:bg-black transition-all shadow-lg shadow-slate-200"
          >
            <div>
              <p className="text-[9px] font-black uppercase opacity-50 tracking-widest">E-Document</p>
              <p className="text-sm font-bold">Buku Poin Siswa (PDF)</p>
            </div>
            <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-orange-600 group-hover:rotate-45 transition-all duration-300">
              →
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: any) {
  const colors: any = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    red: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <div className={`p-4 rounded-[1.5rem] border shadow-sm text-center ${colors[color]} hover:bg-white transition-colors`}>
      <p className="text-[9px] font-black uppercase opacity-60 leading-none mb-2 tracking-tighter">{label}</p>
      <p className="text-xl font-black tracking-tight">{value || 0}</p>
    </div>
  );
}
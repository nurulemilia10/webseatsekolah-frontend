export interface MenuItem {
  title: string;
  path: string;
  role: string[];
  jabatan?: string[];
}

export const MENU_LIST: MenuItem[] = [
  { title: 'Dashboard', path: '/admin/dashboard', role: ['Admin', 'Guru', 'Siswa', 'Orangtua'] },
  { title: 'User Management', path: '/admin/user', role: ['Admin'] },

  { title: 'Profil Sekolah', path: '/admin/profil-sekolah', role: ['Admin', 'Guru'], jabatan: ['KepalaSekolah'] },
  { title: 'Log Aktivitas', path: '/admin/log', role: ['Admin', 'Guru'], jabatan: ['KepalaSekolah'] },

  { title: 'Kurikulum', path: '/admin/kurikulum', role: ['Admin', 'Guru'], jabatan: ['WakaKurikulum'] },
  { title: 'Tahun Ajaran', path:'admin/tahun-ajaran', role: ['Admin'] },
  { title: 'Semester', path:'admin/semester', role: ['Admin']},
  { title: 'Kalender Akademik', path: '/admin/kalender', role: ['Admin', 'Guru'], jabatan: ['WakaKurikulum'] },
  { title: 'Jam Sekolah', path: '/admin/jam-sekolah', role: ['Admin', 'Guru'], jabatan: ['WakaKurikulum'] },
  { title: 'Penugasan Guru Mapel', path: '/admin/guru-matapelajaran', role: ['Admin', 'Guru'], jabatan: ['WakaKurikulum',] },
  { title: 'Kelas Walikelas', path: '/admin/kelas-walikelas', role: ['Admin'] },
  { title: 'Kenaikan Kelas', path: '/admin/kenaikan-kelas', role: ['Admin', 'Guru'], jabatan: ['WakaKesiswaan'] },
  
  { title: 'Data Mata Pelajaran', path: '/admin/mapel', role: ['Admin', 'Guru'], jabatan: ['WakaKurikulum'] },
  { title: 'Data Jurusan', path: '/admin/jurusan', role: ['Admin']},
  { title: 'Data Kelas', path: '/admin/kelas', role: ['Admin']  },
  { title: 'Data Guru', path: '/admin/guru', role: ['Admin'] },
  { title: 'Data Siswa', path: '/admin/siswa', role: ['Admin', 'Guru'], jabatan: ['WakaKesiswaan'] },
  { title: 'Data Orang Tua', path: '/admin/orangtua', role: ['Admin', 'Guru'], jabatan: ['WakaKesiswaan'] },

  { title: 'Monitoring Poin Siswa', path: '/admin/poin-siswa', role: ['Admin', 'Guru'], jabatan: ['WakaKesiswaan','KepalaSekolah'] },
  { title: 'Monitoring Presensi Harian', path: '/admin/presensi', role: ['Admin', 'Guru'], jabatan: ['WakaKesiswaan','KepalaSekolah'] },
  { title: 'Monitoring Presensi Mapel', path: '/admin/presensi-mapel', role: ['Admin', 'Guru'], jabatan: ['WakaKesiswaan','KepalaSekolah'] },
  
  { title: 'Ekstrakurikuler', path: '/admin/ekstrakurikuler', role: ['Admin', 'Guru'], jabatan: ['WakaKesiswaan'] },
  { title: 'Berita', path: '/admin/berita', role: ['Admin', 'Guru'], jabatan: ['WakaHumas'] },
  { title: 'Pengumuman', path: '/admin/pengumuman', role: ['Admin', 'Guru'], jabatan: ['WakaHumas'] },
  { title: 'Prestasi', path: '/admin/prestasi', role: ['Admin', 'Guru'], jabatan: ['WakaHumas'] },
  { title: 'Kontak', path: '/admin/kontak', role: ['Admin']},
  { title: 'Portal & PPDB', path: '/admin/portal-ppdb', role: ['Admin', 'Guru'], jabatan: ['WakaHumas'] },
  { title: 'Banner', path: '/admin/banner', role: ['Admin', 'Guru'], jabatan: ['WakaHumas'] },
  { title: 'Pesan Masuk', path: '/admin/pesan', role: ['Admin', 'Guru'], jabatan: ['WakaHumas'] },
  
  { title: 'Fasilitas & Sarpras', path: '/admin/fasilitas', role: ['Admin', 'Guru'], jabatan: ['WakaSarpras'] },
  { title: 'Galeri & Media', path: '/admin/media', role: ['Admin', 'Guru'], jabatan: ['WakaSarpras'] },
  
  { title: 'Data Mata Pelajaran Jurusan', path: '/admin/mapel', role: ['Guru'], jabatan: ['Ketua Jurusan'] },
  { title: 'Penugasan Guru Mapel', path: '/admin/guru-mapel', role: ['Guru'], jabatan: ['Ketua Jurusan',] },
  { title: 'Data Kelas Jurusan', path: '/admin/kelas', role: ['Guru'], jabatan:['Ketua Jurusan'] },
  { title: 'Data Siswa Jurusan', path: '/admin/siswa', role: ['Guru'], jabatan: ['Ketua Jurusan'] },

  { title: 'Jam Sekolah', path: '/guru/jam-sekolah', role: ['Guru']},
  { title: 'Poin Siswa', path: '/guru/poin-siswa', role: ['Guru'],},
  { title: 'Presensi Mapel', path: '/guru/presensi-mapel', role: ['Guru'],},

  { title: 'Siswa Kelas Saya', path: '/guru/walikelas/siswa', role: ['Guru'], jabatan: ['WaliKelas'] },
  { title: 'Orang Tua Siswa', path: '/guru/walikelas/orangtua', role: ['Guru'], jabatan: ['WaliKelas'] },
  { title: 'Presensi Harian Kelas', path: '/guru/walikelas/presensi', role: ['Guru'], jabatan: ['WaliKelas'] },

  { title: 'Jam Sekolah', path: '/siswa/jam-sekolah', role: ['Siswa'] },
  { title: 'Jadwal Mapel', path: '/siswa/jadwal-mapel', role: ['Siswa'] },
  { title: 'Presensi Saya', path: '/siswa/presensi', role: ['Siswa'] },
  { title: 'Poin Saya', path: '/siswa/poin', role: ['Siswa'] },

  { title: 'Jam Sekolah', path: '/orangtua/jam-sekolah', role: ['Orangtua'] },
  { title: 'Presensi Anak', path: '/orangtua/presensi', role: ['Orangtua'] },
  { title: 'Poin Anak', path: '/orangtua/poin', role: ['Orangtua'] },
];
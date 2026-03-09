export interface MenuItem {
  title: string;
  path: string;
  role: string[];
  jabatan?: string[];
}

export const MENU_LIST: MenuItem[] = [
  // --- DASHBOARD ---
  { title: 'Dashboard', path: '/dashboard', role: ['Admin', 'Guru', 'Siswa', 'Orangtua'] },

  // --- MODUL ADMIN & STRUKTURAL ---
  { title: 'User Management', path: '/admin/user', role: ['Admin'] },
  { title: 'Hak Akses & Role', path: '/admin/role', role: ['Admin'] },
  { title: 'Tahun Ajaran', path: '/admin/tahun-ajaran', role: ['Admin', 'Guru'], jabatan: ['WakaKurikulum'] },
  { title: 'Semester', path: '/admin/semester', role: ['Admin', 'Guru'], jabatan: ['WakaKurikulum'] },
  { title: 'Kurikulum', path: '/admin/kurikulum', role: ['Admin', 'Guru'], jabatan: ['WakaKurikulum'] },
  { title: 'Kalender Akademik', path: '/admin/kalender', role: ['Admin', 'Guru'], jabatan: ['WakaKurikulum'] },
  { title: 'Jam Sekolah', path: '/admin/jam-sekolah', role: ['Admin', 'Guru'], jabatan: ['WakaKurikulum'] },
  { title: 'Data Tingkatan', path: '/admin/tingkatan', role: ['Admin'] },
  { title: 'Data Jurusan', path: '/admin/jurusan', role: ['Admin'] },
  { title: 'Data Kelas', path: '/admin/kelas', role: ['Admin'] },
  { title: 'Data Guru', path: '/admin/guru', role: ['Admin', 'Guru'], jabatan: ['KepalaSekolah'] },
  { title: 'Semua Data Siswa', path: '/admin/siswa', role: ['Admin', 'Guru'], jabatan: ['WakaKesiswaan'] },
  { title: 'Semua Data Orang Tua', path: '/admin/orangtua', role: ['Admin', 'Guru'], jabatan: ['WakaKesiswaan'] },
  { title: 'Mata Pelajaran', path: '/admin/mapel', role: ['Admin', 'Guru'], jabatan: ['WakaKurikulum'] },
  { title: 'Guru Mapel', path: '/admin/guru-mapel', role: ['Admin', 'Guru'], jabatan: ['WakaKurikulum'] },
  { title: 'Presensi Harian', path: '/admin/presensi', role: ['Admin', 'Guru'], jabatan: ['Waka Kesiswaan', 'KepalaSekolah'] },
  { title: 'Monitoring Presensi Mapel', path: '/admin/presensi-guru-mapel', role: ['Admin', 'Guru'], jabatan: ['WakaKurikulum', 'KepalaSekolah'] },
  { title: 'Monitoring Poin Siswa', path: '/admin/poin-siswa', role: ['Admin', 'Guru'], jabatan: ['WakaKesiswaan', 'KepalaSekolah'] },
  { title: 'Kenaikan Kelas (Massal)', path: '/admin/kenaikan-kelas', role: ['Admin', 'Guru'], jabatan: ['WakaKesiswaan'] },
  { title: 'Ekstrakurikuler', path: '/admin/ekstrakurikuler', role: ['Admin', 'Guru'], jabatan: ['WakaKesiswaan'] },
  { title: 'Berita & Artikel', path: '/admin/berita', role: ['Admin', 'Guru'], jabatan: ['WakaHumas'] },
  { title: 'Pengumuman', path: '/admin/pengumuman', role: ['Admin', 'Guru'], jabatan: ['WakaHumas'] },
  { title: 'Prestasi Sekolah', path: '/admin/prestasi', role: ['Admin', 'Guru'], jabatan: ['WakaHumas'] },
  { title: 'Fasilitas & Sarpras', path: '/admin/fasilitas', role: ['Admin', 'Guru'], jabatan: ['WakaSarpras'] },
  { title: 'Galeri & Media', path: '/admin/media', role: ['Admin', 'Guru'], jabatan: ['WakaHumas', 'WakaSarpras'] },
  { title: 'Pesan Masuk (Humas)', path: '/admin/pesan', role: ['Admin', 'Guru'], jabatan: ['WakaHumas'] },
  { title: 'Log Aktivitas', path: '/admin/log', role: ['Admin', 'Guru'], jabatan: ['KepalaSekolah'] },

  // --- KHUSUS KETUA JURUSAN ---
  { title: 'Siswa Jurusan', path: '/jurusan/siswa', role: ['Guru'], jabatan: ['KetuaJurusan'] },
  { title: 'Mapel Jurusan', path: '/jurusan/mapel', role: ['Guru'], jabatan: ['KetuaJurusan'] },
  { title: 'Guru Mapel Jurusan', path: '/jurusan/guru-mapel', role: ['Guru'], jabatan: ['Ketua urusan'] },
  { title: 'Kelas Jurusan', path: '/jurusan/kelas', role: ['Guru'], jabatan: ['KetuaJurusan'] },

  // --- KHUSUS WALI KELAS ---
  { title: 'Siswa Kelas Saya', path: '/walikelas/siswa', role: ['Guru'], jabatan: ['WaliKelas'] },
  { title: 'Orang Tua Siswa', path: '/walikelas/orangtua', role: ['Guru'], jabatan: ['WaliKelas'] },
  { title: 'Presensi Harian Kelas', path: '/walikelas/presensi', role: ['Guru'], jabatan: ['WaliKelas'] },

  // --- KHUSUS GURU MATA PELAJARAN ---
  { title: 'Jadwal Mengajar', path: '/mapel/jadwal', role: ['Guru'] },
  { title: 'Presensi Mapel', path: '/mapel/presensi', role: ['Guru'] },
  { title: 'Input Poin Pelanggaran', path: '/guru/poin-siswa', role: ['Guru'] },

  // --- SISWA ---
  { title: 'Jadwal Saya', path: '/siswa/jadwal', role: ['Siswa'] },
  { title: 'Presensi Saya', path: '/siswa/presensi', role: ['Siswa'] },
  { title: 'Poin Pelanggaran', path: '/siswa/poin', role: ['Siswa'] },

  // --- ORANG TUA ---
  { title: 'Data Anak', path: '/ortu/anak', role: ['Orangtua'] },
  { title: 'Presensi Anak', path: '/ortu/presensi', role: ['Orangtua'] },
  { title: 'Poin Pelanggaran Anak', path: '/ortu/poin', role: ['OrangTua'] },

  // --- GLOBAL SETTINGS ---
  { title: 'Profil Sekolah', path: '/admin/profil-sekolah', role: ['Admin', 'Guru'], jabatan: ['KepalaSekolah'] },
  { title: 'Keamanan Akun', path: '/setting/keamanan', role: ['Admin', 'Guru', 'Siswa', 'Orangtua'] }
];
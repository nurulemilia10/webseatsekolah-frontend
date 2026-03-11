export interface MenuItem {
  title: string;
  path: string;
  role: string[];
  jabatan?: string[];
}

export const MENU_LIST: MenuItem[] = [
  { title: 'Dashboard', path: '/admin/dashboard', role: ['Admin', 'Guru', 'Siswa', 'Orangtua'] },

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

  { title: 'Siswa Jurusan', path: '/admin/jurusan/siswa', role: ['Guru'], jabatan: ['KetuaJurusan'] },
  { title: 'Mapel Jurusan', path: '/admin/jurusan/mapel', role: ['Guru'], jabatan: ['KetuaJurusan'] },
  { title: 'Guru Mapel Jurusan', path: '/admin/jurusan/guru-mapel', role: ['Guru'], jabatan: ['Ketua urusan'] },
  { title: 'Kelas Jurusan', path: '/admin/jurusan/kelas', role: ['Guru'], jabatan: ['KetuaJurusan'] },

  { title: 'Siswa Kelas Saya', path: '/admin/walikelas/siswa', role: ['Guru'], jabatan: ['WaliKelas'] },
  { title: 'Orang Tua Siswa', path: '/admin/walikelas/orangtua', role: ['Guru'], jabatan: ['WaliKelas'] },
  { title: 'Presensi Harian Kelas', path: '/admin/walikelas/presensi', role: ['Guru'], jabatan: ['WaliKelas'] },

  { title: 'Jadwal Mengajar', path: '/admin/mapel/jadwal', role: ['Guru'] },
  { title: 'Presensi Mapel', path: '/admin/mapel/presensi', role: ['Guru'] },
  { title: 'Input Poin Pelanggaran', path: '/admin/guru/poin-siswa', role: ['Guru'] },

  { title: 'Jadwal Saya', path: '/admin/siswa/jadwal', role: ['Siswa'] },
  { title: 'Presensi Saya', path: '/admin/siswa/presensi', role: ['Siswa'] },
  { title: 'Poin Pelanggaran', path: '/admin/siswa/poin', role: ['Siswa'] },

  { title: 'Data Anak', path: '/admin/ortu/anak', role: ['Orangtua'] },
  { title: 'Presensi Anak', path: '/admin/ortu/presensi', role: ['Orangtua'] },
  { title: 'Poin Pelanggaran Anak', path: '/admin/ortu/poin', role: ['OrangTua'] },

  { title: 'Profil Sekolah', path: '/admin/profil-sekolah', role: ['Admin', 'Guru'], jabatan: ['KepalaSekolah'] },
  { title: 'Keamanan Akun', path: '/admin/setting/keamanan', role: ['Admin', 'Guru', 'Siswa', 'Orangtua'] }
];
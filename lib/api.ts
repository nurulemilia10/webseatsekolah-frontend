import axios from 'axios';

const Api = axios.create({
    baseURL: 'http://webseatsekolah13.test',
    headers: {
        'Accept': 'application/json',
    }
});

Api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let isRedirecting = false;

Api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            if (!isRedirecting) {
                isRedirecting = true;
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

const createResource = (path: string) => ({
    getAll: (params?: any) => Api.get(path, { params }),
    getDetail: (id: any) => Api.get(`${path}/${id}`),
    create: (data: any) => Api.post(path, data),
    update: (id: any, data: any) => Api.put(`${path}/${id}`, data),
    delete: (id: any) => Api.delete(`${path}/${id}`),
    import: (formData: any) => Api.post(`${path}/import`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    export: (params?: any) => Api.get(`${path}/export`, { params, responseType: 'blob' }),
});

const api = {
    public: {
        login: (data: any) => Api.post('/api/public/login', data),
        loginApi: (data: any) => Api.post('/api/public/login-api', data),
        getJamSekolah: () => Api.get('/api/public/jamsekolah'),
        getBerita: () => Api.get('/api/public/berita'),
        getPengumuman: () => Api.get('/api/public/pengumuman'),
        getGuru: () => Api.get('/api/public/guru'),
        getJurusan: () => Api.get('/api/public/jurusan'),
        getKurikulum: () => Api.get('/api/public/kurikulum'),
        getKalender: () => Api.get('/api/public/kalender'),
        getFasilitas: () => Api.get('/api/public/fasilitas'),
        getEkstrakurikuler: () => Api.get('/api/public/ekstrakurikuler'),
        getBanner: () => Api.get('/api/public/banner'),
        getMediaDetail: (id: any) => Api.get(`/api/public/media/${id}`),
        getAlbum: () => Api.get('/api/public/album'),
        getPrestasi: () => Api.get('/api/public/prestasi'),
        getPortal: () => Api.get('/api/public/portal'),
        getPpdbLink: () => Api.get('/api/public/ppdb-link'),
        getKontak: () => Api.get('/api/public/kontak'),
        getProfilSekolah: () => Api.get('/api/public/profil-sekolah'),
        getStruktur: () => Api.get('/api/public/struktur'),
        getSetting: () => Api.get('/api/public/setting'),
        kirimPesan: (data: any) => Api.post('/api/public/pesan', data),
    },

    auth: {
        logout: () => Api.post('/api/logout'),
        me: () => Api.get('/api/me'),
        updateFoto: (data: any, config?: any) => Api.post('/api/update-foto', data, config),
        changePassword: (data: any) => Api.post('/api/change-password', data),
        switchRole: (data: any) => Api.post('/api/switch-role', data),
    },

    admin: {
        getDashboard: () => Api.get('/api/admin/dashboard'),
        getLogAktivitas: (params: any) => Api.get('/api/admin/log', { params }),
        updateSettingGeneral: (data: any) => Api.put('/api/admin/setting/general', data),
        updateProfilSekolah: (data: any) => Api.put('/api/admin/profil-sekolah', data),

        getKenaikanKelas: () => Api.get('/api/admin/kenaikan-kelas'),
        generateKelas: (data: any) => Api.post('/api/admin/kelas/generate', data),
        prosesKenaikanMassal: (data: any) => Api.post('/api/admin/kenaikan-kelas/proses', data),
        cloneWaliKelas: (data: any) => Api.post('/api/admin/walikelas/kelas-copy', data),
        bulkUpdateTingkat: (data: any) => Api.post('/api/admin/walikelas/naik-tingkat-kelas', data),
        prepareNewYear: (data: any) => Api.post('/api/admin/walikelas/kelas-create', data),

        kelaswalikelas: createResource('/api/admin/kelaswalikelas'),
        tingkatan: createResource('/api/admin/tingkatan'),
        user: createResource('/api/admin/user'),
        role: createResource('/api/admin/role'),
        jurusan: createResource('/api/admin/jurusan'),
        kurikulum: createResource('/api/admin/kurikulum'),
        kalender: createResource('/api/admin/kalender'),
        tahunAjaran: createResource('/api/admin/tahun_ajaran'),
        semester: createResource('/api/admin/semester'),
        portal: createResource('/api/admin/portal'),
        berita: createResource('/api/admin/berita'),
        pengumuman: createResource('/api/admin/pengumuman'),
        prestasi: createResource('/api/admin/prestasi'),
        fasilitas: createResource('/api/admin/fasilitas'),
        ekstrakurikuler: createResource('/api/admin/ekstrakurikuler'),
        banner: createResource('/api/admin/banner'),
        album: createResource('/api/admin/album'),
        jabatan: createResource('/api/admin/jabatan'),
        struktur_jabatan: createResource('/api/admin/struktur_jabatan'),
        
        Setting: {
            get: () => Api.get('/api/admin/setting/general'),
            update: (data: any) => Api.post('/api/admin/setting/general', data),
        },
        ProfilSekolah: {
            get: () => Api.get('/api/admin/profil-sekolah'),
            update: (data: any) => Api.post('/api/admin/profil-sekolah', data),
        },
        Datakontak: {
           get: () => Api.get('/api/admin/data-kontak'),
           update: (data: any) => Api.put('/api/admin/data-kontak', data),
        },
        ppdb: {
           get: () => Api.get('/api/admin/ppdb-link'), 
           update: (data: any) => Api.put('/api/admin/ppdb-link', data),
        },
        media: {
             ...createResource('/api/admin/media'),
             massDelete: (data: any) => Api.post('/api/admin/media/mass-destroy', data), 
        },
        siswa: {
            ...createResource('/api/admin/siswa'),
            import: (data: any) => Api.post('/api/admin/siswa/import', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
            export: (params?: any) => Api.get('/api/admin/siswa/export', { params, responseType: 'blob' }),
            importPreview: (data: any) => Api.post('/api/admin/siswa/import-preview', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
            bulkDelete: (ids: string[]) => Api.post('/api/admin/siswa/bulk-delete', { ids }),
        },
        orangtua: {
            ...createResource('/api/admin/orangtua'),
            import: (data: any) => Api.post('/api/admin/orangtua/import', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
            importPreview: (data: any) => Api.post('/api/admin/orangtua/import-preview', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
            export: (params?: any) => Api.get('/api/admin/orangtua/export', { params, responseType: 'blob' }),
            bulkDelete: (ids: string[]) => Api.post('/api/admin/orangtua/bulk-delete', { ids }),
        },
        guruStaf: {
            ...createResource('/api/admin/guru'),
            import: (data: any) => Api.post('/api/admin/guru/import', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
            export: (params?: any) => Api.get('/api/admin/guru/export', { responseType: 'blob', params }),
            bulkDelete: (ids: any[]) => Api.post('/api/admin/guru/bulk-delete', { ids }),
            importPreview: (data: any) => Api.post('/api/admin/guru/import-preview', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
},
        guruMapel: {
           ...createResource('/api/admin/guru_mapel'),
           import: (data: any) => Api.post('/api/admin/guru-mapel/import', data, { headers: { 'Content-Type': 'multipart/form-data' }  }),
           importPreview: (data: any) => Api.post('/api/admin/guru-mapel/import-preview', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
           export: (params?: any) => Api.get('/api/admin/guru-mapel/export', { params,responseType: 'blob' }),
           getJamByHari: (hari: string) => Api.get('/api/admin/guru-mapel/jam-by-hari', { params: { hari } }),
           bulkDelete: (ids: number[]) => Api.delete('/api/admin/guru-mapel/bulk-delete', { data: { ids } }),
       },
        jamSekolah: {
            ...createResource('/api/admin/jam_sekolah'),
            importPreview: (data: any) => Api.post('/api/admin/jam-sekolah/import-preview', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
            import: (data: any) => Api.post('/api/admin/jam-sekolah/import', data, {  headers: { 'Content-Type': 'multipart/form-data' }}),
            bulkDelete: (ids: string[]) => Api.post('/api/admin/jam-sekolah/bulk-delete', { ids }),
            export: (params?: any) => Api.get('/api/admin/jam-sekolah/export', { responseType: 'blob',  params  }),
       },
       kelas: {
           ...createResource('/api/admin/kelas'),
           import: (data: any) => Api.post('/api/admin/kelas/import', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
           importPreview: (data: any) => Api.post('/api/admin/kelas/import-preview', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
           export: (params?: any) => Api.get('/api/admin/kelas/export', { responseType: 'blob', params }),
           bulkDelete: (ids: string[]) => Api.post('/api/admin/kelas/bulk-delete', { ids }),
       },
        mapel: {
           ...createResource('/api/admin/mapel'),
           import: (data: any) => Api.post('/api/admin/mapel/import', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
           importPreview: (data: any) => Api.post('/api/admin/mapel/import-preview', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
           export: (params?: any) => Api.get('/api/admin/mapel/export', { responseType: 'blob', params }),
           bulkDelete: (ids: string[]) => Api.delete('/api/admin/mapel/bulk-delete', { data: { ids } }),
        },
        presensi: {
            ...createResource('/api/admin/presensi'),
            export: () => Api.get('/api/admin/presensi/export', { responseType: 'blob' }),
            listKelas: () => Api.get('/api/admin/list-kelas'),
            listSiswa: (id: any) => Api.get(`/api/admin/list-siswa/${id}`),
        },
        presensiGuruMapel: {
            ...createResource('/api/admin/presensi-guru-mapel'),
            export: () => Api.get('/api/admin/presensi-guru-mapel/export', { responseType: 'blob' }),
            jadwalHariIni: () => Api.get('/api/admin/jadwal-hari-ini'),
            siswaByJadwal: (id: any) => Api.get(`/api/admin/siswa-by-jadwal/${id}`),
        },
        poin_siswa: {
            ...createResource('/api/admin/poin_siswa'),
            export: () => Api.get('/api/admin/poin-siswa/export', { responseType: 'blob' }),
        },
       pesan: {
    ...createResource('/api/admin/pesan'),
    show: (id: any) => Api.get(`/api/admin/pesan/${id}`),
    updateStatus: (id: any, data: any = {}) => Api.patch(`/api/admin/pesan/${id}/status`, data),
    markAllRead: () => Api.patch('/api/admin/pesan/mark-all-read'),
     }
    },

    guru: {
        getDashboard: () => Api.get('/api/guru/dashboard'),
        getPoinSiswa: () => Api.get('/api/guru/poin-siswa'),
        jamSekolah: {
            ...createResource('/api/guru/jam_sekolah'),
            export: () => Api.get('/api/guru/jam-sekolah/export', { responseType: 'blob' }),
        },
        poin_siswa: createResource('/api/guru/poin_siswa'),

        kurikulum: {
            mapel: {
                ...createResource('/api/guru/kurikulum/mapel'),
                import: (data: any) => Api.post('/api/guru/kurikulum/mapel/import', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
                export: () => Api.get('/api/guru/kurikulum/mapel/export', { responseType: 'blob' }),
            },
            jamSekolah: {
            ...createResource('/api/guru/kurikulum/jam_sekolah'),
            importPreview: (data: any) => Api.post('/api/guru/kurikulum/jam-sekolah/import-preview', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
            import: (data: any) => Api.post('/api/guru/kurikulum/jam-sekolah/import', data, {  headers: { 'Content-Type': 'multipart/form-data' }}),
            bulkDelete: (ids: string[]) => Api.post('/api/guru/kurikulum/jam-sekolah/bulk-delete', { ids }),
            export: (params?: any) => Api.get('/api/guru/kurikulum/jam-sekolah/export', { responseType: 'blob',  params  }),
            },
            guru_mapel: {
                ...createResource('/api/guru/kurikulum/guru_mapel'),
                import: (data: any) => Api.post('/api/guru/kurikulum/guru-mapel/import', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
                export: () => Api.get('/api/guru/kurikulum/guru-mapel/export', { responseType: 'blob' }),
            },
            kurikulum: createResource('/api/guru/kurikulum/kurikulum'),
            kalender: createResource('/api/guru/kurikulum/kalender'),
        },

        kesiswaan: {
            siswa: {
                ...createResource('/api/guru/kesiswaan/siswa'),
                export: () => Api.get('/api/guru/kesiswaan/siswa/export', { responseType: 'blob' }),
            },
            orangtua: {
                ...createResource('/api/guru/kesiswaan/orangtua'),
                export: () => Api.get('/api/guru/kesiswaan/orangtua/export', { responseType: 'blob' }),
            },
            ekstrakurikuler: createResource('/api/guru/kesiswaan/ekstrakurikuler'),
            presensi: {
                ...createResource('/api/guru/kesiswaan/presensi'),
                export: () => Api.get('/api/guru/kesiswaan/presensi/export', { responseType: 'blob' }),
                listKelas: () => Api.get('/api/guru/kesiswaan/list-kelas'),
                listSiswa: () => Api.get('/api/guru/kesiswaan/list-siswa'),
            },
            presensiMapel: {
                ...createResource('/api/guru/kesiswaan/presensi-mapel'),
                export: () => Api.get('/api/guru/kesiswaan/presensi-mapel/export', { responseType: 'blob' }),
                jadwalHariIni: () => Api.get('/api/guru/kesiswaan/presensi-mapel/jadwal-hari-ini'),
                siswaByJadwal: (id: any) => Api.get(`/api/guru/kesiswaan/siswa-by-jadwal/${id}`),
            },
            poin_siswa: {
                ...createResource('/api/guru/kesiswaan/poin_siswa'),
                export: () => Api.get('/api/guru/kesiswaan/poin-siswa/export', { responseType: 'blob' }),
            },
            getKenaikanKelas: () => Api.get('/api/guru/kesiswaan/kenaikan-kelas'),
            generateKelas: (data: any) => Api.post('/api/guru/kesiswaan/kelas/generate', data),
            prosesKenaikan: (data: any) => Api.post('/api/guru/kesiswaan/kenaikan-kelas/proses', data),
        },

        sarpras: {
            fasilitas: createResource('/api/guru/sarpras/fasilitas'),
            album: createResource('/api/guru/sarpras/album'),
            media: {
        ...createResource('/api/guru/sarpras/media'),
        massDelete: (data: any) => Api.post('/api/guru/sarpras/media/mass-destroy', data),
    },
        },

        humas: {
            berita: createResource('/api/guru/humas/berita'),
            pengumuman: createResource('/api/guru/humas/pengumuman'),
            prestasi: createResource('/api/guru/humas/prestasi'),
            banner: createResource('/api/guru/humas/banner'),
            portal: createResource('/api/guru/humas/portal'),

            ppdb: {
                  get: () => Api.get('/api/guru/humas/ppdb-link'), 
                  update: (data: any) => Api.put('/api/guru/humas/ppdb-link', data),
         },
            pesan: {
                ...createResource('/api/guru/humas/pesan'),
                updateStatus: (id: any, data: any = {}) => Api.patch(`/api/guru/humas/pesan/${id}/status`, data),
                markAllRead: () => Api.post('/api/guru/humas/pesan/mark-all-read'),
            }
        },

        kepsek: {
            getLogs: () => Api.get('/api/guru/kepsek/log'),
            listKelas: () => Api.get('/api/guru/kepsek/list-kelas'),
            listSiswa: () => Api.get('/api/guru/kepsek/list-siswa'),
            jadwalHariIni: () => Api.get('/api/guru/kepsek/jadwal-hari-ini'),
            siswaByJadwal: (id: any) => Api.get(`/api/guru/kepsek/siswa-by-jadwal/${id}`),
            monitoringPoinSiswa: () => Api.get('/api/guru/kepsek/monitoring-poin-siswa'),

             Setting: {
               get: () => Api.get('/api/guru/kepsek/setting/general'),
               update: (data: any) => Api.post('/api/guru/kepsek/setting/general', data),
            },
            ProfilSekolah: {
               get: () => Api.get('/api/guru/kepsek/profil-sekolah'),
               update: (data: any) => Api.post('/api/guru/kepsek/profil-sekolah', data),
            },
            poin_siswa: {
                ...createResource('/api/guru/kepsek/poin_siswa'),
                export: () => Api.get('/api/guru/kepsek/poin-siswa/export', { responseType: 'blob' }),
            },
            monitoringPresensiHarian: {
                ...createResource('/api/guru/kepsek/monitoring-presensi-harian'),
                export: () => Api.get('/api/guru/kepsek/presensi/export', { responseType: 'blob' }),
            },
            monitoringPresensiMapel: {
                ...createResource('/api/guru/kepsek/monitoring-presensi-mapel'),
                export: () => Api.get('/api/guru/kepsek/presensi-mapel/export', { responseType: 'blob' }),
            },
        },

        jurusan: {
            siswa: {
                getAll: () => Api.get('/api/guru/jurusan/siswa'),
                export: () => Api.get('/api/guru/jurusan/siswa/export', { responseType: 'blob' }),
            },
            mapel: {
                getAll: () => Api.get('/api/guru/jurusan/mapel'),
                getDetail: (id: any) => Api.get(`/api/guru/jurusan/mapel/${id}`),
                export: () => Api.get('/api/guru/jurusan/mapel/export', { responseType: 'blob' }),
            },
            guru_mapel: {
                getAll: () => Api.get('/api/guru/jurusan/guru_mapel'),
                export: () => Api.get('/api/guru/jurusan/guru-mapel/export', { responseType: 'blob' }),
            },
            kelas: {
                ...createResource('/api/guru/jurusan/kelas'),
                export: () => Api.get('/api/guru/jurusan/kelas/export', { responseType: 'blob' }),
            },
        },

        walikelas: {
            siswa: {
                ...createResource('/api/guru/walikelas/siswa'),
                export: () => Api.get('/api/guru/walikelas/siswa/export', { responseType: 'blob' }),
            },
            orangtua: {
                ...createResource('/api/guru/walikelas/orangtua'),
                export: () => Api.get('/api/guru/walikelas/orangtua/export', { responseType: 'blob' }),
            },
            presensi: {
                ...createResource('/api/guru/walikelas/presensi'),
                export: () => Api.get('/api/guru/walikelas/presensi/export', { responseType: 'blob' }),
                listSiswa: (id: any) => Api.get(`/api/guru/walikelas/list-siswa/${id}`),
            },
        },

        mapel: {
            jadwalHariIni: () => Api.get('/api/guru/mapel/jadwal-hari-ini'),
            siswaByJadwal: (id: any) => Api.get(`/api/guru/mapel/siswa-by-jadwal/${id}`),
            presensi: {
                ...createResource('/api/guru/mapel/presensi'),
                export: () => Api.get('/api/guru/mapel/presensi/export', { responseType: 'blob' }),
            }
        }
    },

    siswa: {
        getDashboard: () => Api.get('/api/siswa/dashboard'),
        getPresensiSaya: () => Api.get('/api/siswa/presensi-saya'),
        getPoinSaya: () => Api.get('/api/siswa/poin-saya'),
        jamSekolah: {
            ...createResource('/api/siswa/jam_sekolah'),
            export: () => Api.get('/api/siswa/jam-sekolah/export', { responseType: 'blob' }),
        },
        jadwal_mapel: {
            ...createResource('/api/siswa/jadwal-mapel'),
            exportPdf: () => Api.get('/api/siswa/jadwal-mapel/export-pdf', { responseType: 'blob' }),
        },
    },

    ortu: {
        getDashboard: () => Api.get('/api/ortu/dashboard'),
        getListAnak: () => Api.get('/api/ortu/list-anak'),
        getPresensiAnak: () => Api.get('/api/ortu/presensi-anak'),
        getPoinAnak: () => Api.get('/api/ortu/poin-anak'),
        jamSekolah: {
            ...createResource('/api/ortu/jam_sekolah'),
            export: () => Api.get('/api/ortu/jam-sekolah/export', { responseType: 'blob' }),
        },
    }
};

export default api;
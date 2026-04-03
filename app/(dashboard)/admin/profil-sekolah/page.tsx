"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Save, Loader2, School, Settings, Image as ImageIcon, 
  FileText, Phone, FileUp, Globe
} from 'lucide-react';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilDanSetting() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [profilData, setProfilData] = useState<any>({});
  const [settingData, setSettingData] = useState<any>({});
  const [previews, setPreviews] = useState({ logo: '', logo_provinsi: '', buku_poin: '' });
  const [files, setFiles] = useState<{logo: File|null, logo_provinsi: File|null, buku_poin: File|null}>({
    logo: null, logo_provinsi: null, buku_poin: null
  });

  const Toast = useMemo(() => Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  }), []);

  const fetchData = useCallback(async () => {
    if (authLoading || !user) return;
    setLoading(true);
    try {
      const [resProfil, resSetting] = await Promise.all([
        api.admin.ProfilSekolah.get(),
        api.admin.Setting.get()
      ]);
      
      if (resProfil?.data?.data) {
        setProfilData(resProfil.data.data);
        setPreviews(prev => ({ 
          ...prev, 
          logo: resProfil.data.data.logo || '', 
          logo_provinsi: resProfil.data.data.logo_provinsi || '' 
        }));
      }

      if (resSetting?.data?.general_settings) {
        setSettingData(resSetting.data.general_settings);
        setPreviews(prev => ({ 
            ...prev, 
            buku_poin: resSetting.data.general_settings.buku_poin_url || '' 
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [authLoading, user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'logo_provinsi') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const newUrl = URL.createObjectURL(file);
        setFiles(prev => ({ ...prev, [type]: file }));
        setPreviews(prev => ({ ...prev, [type]: newUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfil = async () => {
    setIsSubmitting(true);
    const fd = new FormData();
    fd.append('nama_sekolah', profilData.nama_sekolah || '');
    fd.append('cadis', profilData.cadis || '');
    fd.append('npsn', profilData.npsn || '');
    fd.append('akreditasi', profilData.akreditasi || '');
    fd.append('visi', profilData.visi || '');
    fd.append('misi', profilData.misi || '');
    fd.append('sejarah', profilData.sejarah || '');
    fd.append('sambutan_kepsek', profilData.sambutan_kepsek || '');
    if (files.logo) fd.append('logo', files.logo);
    if (files.logo_provinsi) fd.append('logo_provinsi', files.logo_provinsi);

    try {
      const res = await api.admin.ProfilSekolah.update(fd);
      if (res.data?.success) Toast.fire({ icon: 'success', title: 'Profil diperbarui' });
    } catch (e) { 
      Toast.fire({ icon: 'error', title: 'Gagal memperbarui profil' }); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const saveSetting = async () => {
    setIsSubmitting(true);
    const fd = new FormData();
    fd.append('tagline', settingData.tagline || '');
    fd.append('pesan_selamat_datang', settingData.pesan_selamat_datang || '');
    fd.append('no_wa_kesiswaan', settingData.no_wa_kesiswaan || '');
    if (files.buku_poin) fd.append('buku_poin_path', files.buku_poin);

    try {
      const res = await api.admin.Setting.update(fd);
      if (res.data?.success) {
        Toast.fire({ icon: 'success', title: 'Pengaturan diperbarui' });
        fetchData();
      }
    } catch (e) { 
      Toast.fire({ icon: 'error', title: 'Gagal memperbarui pengaturan' }); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  if (authLoading || loading) return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100">
      <Loader2 className="text-warning animate-spin mb-2" size={30} />
      <span className="text-muted text-[12px]">Memuat...</span>
    </div>
  );

  return (
    <div className="container-fluid py-4 px-3">
      <div className="d-flex align-items-center mb-4">
        <div className="bg-warning/10 p-2 rounded-3 me-3">
          <School size={20} className="text-warning" />
        </div>
        <div>
          <h5 className="mb-0 fw-bold text-dark text-uppercase tracking-tight text-[14px]">Pengaturan Sekolah</h5>
          <p className="text-muted mb-0 text-[11px]">Kelola identitas visual dan informasi operasional</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center border-bottom">
              <div className="d-flex align-items-center">
                <FileText size={16} className="text-warning me-2" />
                <span className="fw-bold text-[12px] text-dark">Profil Utama</span>
              </div>
              <button onClick={saveProfil} disabled={isSubmitting} className="btn btn-warning btn-sm px-4 rounded-3 text-[11px] fw-bold">
                {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <><Save size={12} className="me-1"/> Simpan</>}
              </button>
            </div>
            <div className="card-body p-4 bg-light/20">
              <div className="row g-3">
                <div className="col-md-8">
                  <label htmlFor="nama_sekolah" className="form-label text-[10px] fw-bold text-muted text-uppercase mb-1">Nama Sekolah</label>
                  <input id="nama_sekolah" type="text" className="form-control border-0 shadow-sm text-[11px] py-2 px-3 rounded-3" value={profilData.nama_sekolah || ''} onChange={e => setProfilData({...profilData, nama_sekolah: e.target.value})} />
                </div>
                <div className="col-md-4">
                  <label htmlFor="npsn" className="form-label text-[10px] fw-bold text-muted text-uppercase mb-1">NPSN</label>
                  <input id="npsn" type="text" className="form-control border-0 shadow-sm text-[11px] py-2 px-3 rounded-3" value={profilData.npsn || ''} onChange={e => setProfilData({...profilData, npsn: e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label htmlFor="cadis" className="form-label text-[10px] fw-bold text-muted text-uppercase mb-1">CADIS</label>
                  <input id="cadis" type="text" className="form-control border-0 shadow-sm text-[11px] py-2 px-3 rounded-3" value={profilData.cadis || ''} onChange={e => setProfilData({...profilData, cadis: e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label htmlFor="akreditasi" className="form-label text-[10px] fw-bold text-muted text-uppercase mb-1">Akreditasi</label>
                  <input id="akreditasi" type="text" className="form-control border-0 shadow-sm text-[11px] py-2 px-3 rounded-3" value={profilData.akreditasi || ''} onChange={e => setProfilData({...profilData, akreditasi: e.target.value})} />
                </div>
                <div className="col-12">
                  <label htmlFor="visi" className="form-label text-[10px] fw-bold text-muted text-uppercase mb-1">Visi</label>
                  <textarea id="visi" rows={2} className="form-control border-0 shadow-sm text-[11px] py-2 px-3 rounded-3" value={profilData.visi || ''} onChange={e => setProfilData({...profilData, visi: e.target.value})} />
                </div>
                <div className="col-12">
                  <label htmlFor="misi" className="form-label text-[10px] fw-bold text-muted text-uppercase mb-1">Misi</label>
                  <textarea id="misi" rows={4} className="form-control border-0 shadow-sm text-[11px] py-2 px-3 rounded-3" value={profilData.misi || ''} onChange={e => setProfilData({...profilData, misi: e.target.value})} />
                </div>
                <div className="col-12">
                  <label htmlFor="sejarah" className="form-label text-[10px] fw-bold text-muted text-uppercase mb-1">Sejarah</label>
                  <textarea id="sejarah" rows={4} className="form-control border-0 shadow-sm text-[11px] py-2 px-3 rounded-3" value={profilData.sejarah || ''} onChange={e => setProfilData({...profilData, sejarah: e.target.value})} />
                </div>
                <div className="col-12">
                  <label htmlFor="sambutan_kepsek" className="form-label text-[10px] fw-bold text-muted text-uppercase mb-1">Sambutan Kepsek</label>
                  <textarea id="sambutan_kepsek" rows={4} className="form-control border-0 shadow-sm text-[11px] py-2 px-3 rounded-3" value={profilData.sambutan_kepsek || ''} onChange={e => setProfilData({...profilData, sambutan_kepsek: e.target.value})} />
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center border-bottom">
              <div className="d-flex align-items-center">
                <Settings size={16} className="text-warning me-2" />
                <span className="fw-bold text-[12px] text-dark">Konfigurasi Sistem</span>
              </div>
              <button onClick={saveSetting} disabled={isSubmitting} className="btn btn-warning btn-sm px-4 rounded-3 text-[11px] fw-bold">
                {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <><Save size={12} className="me-1"/> Simpan</>}
              </button>
            </div>
            <div className="card-body p-4">
               <div className="row g-3">
                  <div className="col-md-12">
                    <label htmlFor="tagline" className="text-[10px] text-muted fw-bold text-uppercase mb-1">Tagline</label>
                    <input id="tagline" type="text" className="form-control border-0 bg-light shadow-none text-[11px] py-2 px-3 rounded-3" value={settingData.tagline || ''} onChange={e => setSettingData({...settingData, tagline: e.target.value})} />
                  </div>
                  <div className="col-md-12">
                    <label htmlFor="pesan_selamat" className="text-[10px] text-muted fw-bold text-uppercase mb-1">Pesan Selamat Datang</label>
                    <textarea id="pesan_selamat" rows={2} className="form-control border-0 bg-light shadow-none text-[11px] py-2 px-3 rounded-3" value={settingData.pesan_selamat_datang || ''} onChange={e => setSettingData({...settingData, pesan_selamat_datang: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="wa_kesiswaan" className="text-[10px] text-muted fw-bold text-uppercase mb-1">WA Kesiswaan</label>
                    <div className="d-flex align-items-center bg-light rounded-3 px-3">
                      <Phone size={12} className="text-muted me-2"/>
                      <input id="wa_kesiswaan" type="text" className="form-control border-0 bg-transparent shadow-none text-[11px] py-2 px-0" value={settingData.no_wa_kesiswaan || ''} onChange={e => setSettingData({...settingData, no_wa_kesiswaan: e.target.value})} />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="buku_poin_file" className="text-[10px] text-muted fw-bold text-uppercase mb-1">Buku Poin (PDF)</label>
                    <div className="d-flex align-items-center bg-light rounded-3 px-2">
                      <input id="buku_poin_file" type="file" accept=".pdf" className="form-control form-control-sm border-0 bg-transparent shadow-none text-[10px]" onChange={e => setFiles({...files, buku_poin: e.target.files?.[0] || null})} />
                      {previews.buku_poin && (
                        <a href={previews.buku_poin} target="_blank" rel="noreferrer" className="btn btn-link btn-sm text-warning p-1" title="Lihat Buku Poin">
                          <Globe size={14}/>
                        </a>
                      )}
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <div className="d-flex align-items-center mb-3">
              <ImageIcon size={16} className="text-warning me-2" />
              <span className="fw-bold text-[12px] text-dark">Identitas Visual</span>
            </div>
            
            <div className="mb-4">
              <label className="form-label text-[10px] fw-bold text-muted text-uppercase mb-2">Logo Sekolah</label>
              <div 
                className="position-relative group cursor-pointer border-2 border-dashed border-light rounded-4 overflow-hidden bg-light d-flex align-items-center justify-content-center h-[180px] w-full" 
                onClick={() => document.getElementById('logo-input')?.click()}
              >
                {previews.logo ? (
                  <img src={previews.logo} className="h-full w-full object-contain p-3" alt="Logo" />
                ) : (
                  <ImageIcon size={30} className="text-muted opacity-20" />
                )}
                <div className="position-absolute inset-0 bg-warning/60 opacity-0 group-hover:opacity-100 transition-all d-flex align-items-center justify-content-center">
                  <FileUp className="text-white" size={24} />
                </div>
              </div>
              <input type="file" id="logo-input" hidden accept="image/*" onChange={e => handleFileChange(e, 'logo')} />
            </div>

            <div>
              <label className="form-label text-[10px] fw-bold text-muted text-uppercase mb-2">Logo Provinsi</label>
              <div 
                className="position-relative group cursor-pointer border-2 border-dashed border-light rounded-4 overflow-hidden bg-light d-flex align-items-center justify-content-center h-[180px] w-full" 
                onClick={() => document.getElementById('prov-input')?.click()}
              >
                {previews.logo_provinsi ? (
                  <img src={previews.logo_provinsi} className="h-full w-full object-contain p-3" alt="Prov" />
                ) : (
                  <ImageIcon size={30} className="text-muted opacity-20" />
                )}
                <div className="position-absolute inset-0 bg-warning/60 opacity-0 group-hover:opacity-100 transition-all d-flex align-items-center justify-content-center">
                  <FileUp className="text-white" size={24} />
                </div>
              </div>
              <input type="file" id="prov-input" hidden accept="image/*" onChange={e => handleFileChange(e, 'logo_provinsi')} />
            </div>
            <p className="text-[9px] text-muted mt-3 mb-0 text-center italic">* Gunakan rasio 1:1 untuk hasil terbaik</p>
          </div>
        </div>
      </div>
    </div>
  );
}
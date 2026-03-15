"use client";

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { 
  Globe, Save, Loader2, Link as LinkIcon, Activity, ExternalLink,
  Plus, Edit2, Trash2, Smartphone, Instagram, Facebook, Twitter, 
  Youtube, Linkedin
} from 'lucide-react';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/useAuth';

const PLATFORM_OPTIONS = [
  'Instagram', 'Facebook', 'Twitter / X', 'TikTok', 'YouTube', 'LinkedIn', 'Website',
];

const TIPE_OPTIONS = ['Sosial Media', 'Portal Khusus'];

const getPlatformIcon = (name: string) => {
  switch (name) {
    case 'Instagram': return <Instagram size={14} />;
    case 'Facebook': return <Facebook size={14} />;
    case 'Twitter / X': return <Twitter size={14} />;
    case 'YouTube': return <Youtube size={14} />;
    case 'LinkedIn': return <Linkedin size={14} />;
    case 'TikTok': return <Activity size={14} />;
    case 'Website': return <Globe size={14} />;
    default: return <LinkIcon size={14} />;
  }
};

const SosmedRow = memo(({ item, onEdit, onDelete }: { item: any, onEdit: (i: any) => void, onDelete: (id: string) => void }) => (
  <tr className="border-bottom">
    <td className="ps-2 ps-md-4 py-3">
      <div className="d-flex align-items-center">
        <div className="bg-primary bg-opacity-10 p-1.5 p-md-2 rounded-3 me-2 me-md-3 text-primary flex-shrink-0">
          {getPlatformIcon(item.nama_platform)}
        </div>
        <div className="d-flex flex-column min-w-0">
          <span className="text-dark fw-bold text-[10px] md:text-[11px] mb-0 text-truncate">
            {item.nama_platform}
          </span>
          <span className="text-muted text-[8px] md:text-[9px] text-truncate">
            {item.tipe}
          </span>
        </div>
      </div>
    </td>
    <td className="py-3">
      <div className="d-flex align-items-center">
        <LinkIcon size={10} className="text-muted me-2 flex-shrink-0 d-none d-sm-block" />
        <span className="text-muted text-[9px] md:text-[10px] text-break d-inline-block max-w-[100px] md:max-w-none">
          {item.url_link || '-'}
        </span>
      </div>
    </td>
    <td className="py-3 text-end pe-2 pe-md-4">
      <div className="d-flex justify-content-end gap-1 gap-md-2">
        <button 
          onClick={() => onEdit(item)} 
          className="btn btn-sm p-0 border-0 shadow-none text-primary"
          title="Edit Data"
          aria-label="Edit Data"
        >
          <div className="bg-primary bg-opacity-10 p-1.5 rounded-2">
            <Edit2 size={12}/>
          </div>
        </button>
        <button 
          onClick={() => onDelete(item.id)} 
          className="btn btn-sm p-0 border-0 shadow-none text-danger"
          title="Hapus Data"
          aria-label="Hapus Data"
        >
          <div className="bg-danger bg-opacity-10 p-1.5 rounded-2">
            <Trash2 size={12}/>
          </div>
        </button>
      </div>
    </td>
  </tr>
));

SosmedRow.displayName = 'SosmedRow';

export default function PengaturanPortal() {
  const { user, loading: authLoading } = useAuth();
  const [loadingSosmed, setLoadingSosmed] = useState(true);
  const [isSubmittingPPDB, setIsSubmittingPPDB] = useState(false);
  const [isSubmittingSosmed, setIsSubmittingSosmed] = useState(false);
  
  const [ppdbData, setPpdbData] = useState({ id: null, url_link: '', status_ppdb: 'Tutup' });
  const [sosmedData, setSosmedData] = useState<any[]>([]);
  
  const [showSosmedForm, setShowSosmedForm] = useState(false);
  const [isEditSosmed, setIsEditSosmed] = useState(false);
  const [currentSosmedId, setCurrentSosmedId] = useState<string | null>(null);
  
  const [sosmedForm, setSosmedForm] = useState({ 
    nama_platform: '', 
    url_link: '', 
    tipe: 'Sosial Media'
  });
  const [errors, setErrors] = useState<any>({});

  const Toast = useMemo(() => Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  }), []);

  const fetchPpdbData = useCallback(async () => {
    try {
      const res = await api.admin.ppdb.get();
      if (res?.data?.data) {
        const item = res.data.data;
        setPpdbData({
          id: item.id,
          url_link: item.url_link || '',
          status_ppdb: item.status_ppdb || 'Tutup'
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchSosmedData = useCallback(async () => {
    setLoadingSosmed(true);
    try {
      const res = await (api.admin as any).portal.getAll();
      if (res?.data?.data) {
        setSosmedData(res.data.data);
      } else if (Array.isArray(res?.data)) {
        setSosmedData(res.data);
      } else {
        setSosmedData([]);
      }
    } catch (e) {
      setSosmedData([]);
    } finally {
      setLoadingSosmed(false);
    }
  }, []);

  useEffect(() => { 
    if (!authLoading && user) {
      fetchPpdbData();
      fetchSosmedData();
    }
  }, [authLoading, user, fetchPpdbData, fetchSosmedData]);

  const handleUpdatePPDB = async () => {
    if (isSubmittingPPDB) return;
    setIsSubmittingPPDB(true);
    try {
      const res = await api.admin.ppdb.update({
        url_link: ppdbData.url_link,
        status_ppdb: ppdbData.status_ppdb
      });

      if (res.status === 200 || res.data?.success) {
        Toast.fire({ icon: 'success', title: 'Pengaturan PPDB diperbarui' });
        fetchPpdbData();
      }
    } catch (e: any) {
      Toast.fire({ icon: 'error', title: 'Gagal memperbarui PPDB' });
    } finally { 
      setIsSubmittingPPDB(false); 
    }
  };

  const handleSaveSosmed = async () => {
    if (isSubmittingSosmed) return;
    setErrors({});
    setIsSubmittingSosmed(true);
    try {
      let res;
      if (isEditSosmed && currentSosmedId) {
        res = await (api.admin as any).portal.update(currentSosmedId, sosmedForm);
      } else {
        res = await (api.admin as any).portal.create(sosmedForm);
      }
      
      if (res.status === 200 || res.status === 201 || res.data?.success) {
        Toast.fire({ icon: 'success', title: res.data?.message || 'Data berhasil disimpan' });
        setShowSosmedForm(false);
        setIsEditSosmed(false);
        setSosmedForm({ nama_platform: '', url_link: '', tipe: 'Sosial Media' });
        fetchSosmedData();
      }
    } catch (e: any) {
      if (e.response?.status === 422) {
        setErrors(e.response.data.errors);
      } else {
        Toast.fire({ icon: 'error', title: 'Terjadi kesalahan' });
      }
    } finally { 
      setIsSubmittingSosmed(false); 
    }
  };

  const handleDeleteSosmed = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus data?',
      text: 'Data ini akan dihapus secara permanen',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#f3f4f6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      const prev = [...sosmedData];
      setSosmedData(sosmedData.filter(i => i.id !== id));

      try {
        const res = await (api.admin as any).portal.delete(id);
        if (res.status === 200 || res.data?.success) {
          Toast.fire({ icon: 'success', title: 'Data dihapus' });
        } else {
          throw new Error();
        }
      } catch (e) { 
        setSosmedData(prev);
        Toast.fire({ icon: 'error', title: 'Gagal menghapus' }); 
      }
    }
  };

  if (authLoading) return null;

  return (
    <div className="container-fluid py-3 px-2 px-md-4">
      <div className="d-flex flex-column flex-sm-row align-items-sm-center mb-4 gap-3">
        <div className="d-flex align-items-center">
          <div className="bg-primary p-2 rounded-3 me-3 shadow-sm">
            <Globe size={18} className="text-white" />
          </div>
          <div>
            <h6 className="mb-0 fw-bold text-dark text-uppercase text-[12px] md:text-[14px] tracking-wider">Pengaturan Portal</h6>
            <p className="text-muted mb-0 text-[9px] md:text-[10px]">Kelola tautan dan media sosial instansi</p>
          </div>
        </div>
      </div>

      <div className="row g-3 g-md-4">
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                  <Smartphone size={16} className="text-primary" />
                </div>
                <h6 className="mb-0 fw-bold text-dark text-[11px] md:text-[12px]">KONFIGURASI PPDB</h6>
              </div>
            </div>
            <div className="card-body p-4">
              <div className="mb-4">
                <label htmlFor="url_ppdb" className="form-label text-dark mb-2 fw-bold text-[10px] md:text-[11px]">Tautan Pendaftaran</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0 text-muted px-3">
                    <LinkIcon size={14} />
                  </span>
                  <input 
                    id="url_ppdb"
                    type="url" 
                    className="form-control bg-light border-0 shadow-none py-2.5 px-3 text-[10px] md:text-[11px] fw-medium" 
                    placeholder="https://link-ppdb.com"
                    value={ppdbData.url_link}
                    onChange={(e) => setPpdbData({...ppdbData, url_link: e.target.value})}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label text-dark mb-2 fw-bold text-[10px] md:text-[11px]">Status Pendaftaran</label>
                <div className="d-flex flex-column gap-2 p-1 bg-light rounded-3">
                  {['Buka', 'Tutup', 'Segera'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setPpdbData({...ppdbData, status_ppdb: status})}
                      className={`btn btn-sm py-2 text-[9px] md:text-[10px] fw-bold rounded-3 border-0 transition-all ${
                        ppdbData.status_ppdb === status 
                        ? (status === 'Buka' ? 'btn-success shadow-sm text-white' : status === 'Tutup' ? 'btn-danger shadow-sm text-white' : 'btn-warning shadow-sm text-white') 
                        : 'text-muted hover-bg-white'
                      }`}
                    >
                      <Activity size={12} className="me-1" />
                      {status.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                type="button"
                onClick={handleUpdatePPDB}
                disabled={isSubmittingPPDB}
                className="btn btn-primary w-100 py-2.5 fw-bold rounded-3 shadow-sm text-[11px] md:text-[12px] mt-2 d-flex align-items-center justify-content-center"
              >
                {isSubmittingPPDB ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} className="me-2"/> Simpan Perubahan</>}
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white border-0 pt-4 pb-3 px-3 px-md-4 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center min-w-0">
                <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-2 me-md-3 flex-shrink-0">
                  <ExternalLink size={16} className="text-primary" />
                </div>
                <h6 className="mb-0 fw-bold text-dark text-[10px] md:text-[12px] text-truncate">SOSIAL MEDIA & PORTAL</h6>
              </div>
              <button 
                type="button"
                onClick={() => { 
                  setIsEditSosmed(false); 
                  setSosmedForm({ nama_platform: '', url_link: '', tipe: 'Sosial Media' }); 
                  setErrors({});
                  setShowSosmedForm(true); 
                }} 
                className="btn btn-primary btn-sm rounded-3 py-2 px-2 px-md-3 text-[9px] md:text-[10px] fw-bold shadow-sm flex-shrink-0"
              >
                <Plus size={14} className="me-1" /> TAMBAH
              </button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light bg-opacity-50">
                  <tr className="text-[9px] md:text-[10px]">
                    <th className="ps-3 ps-md-4 border-0 py-3 fw-bold text-muted text-uppercase tracking-wider">Platform</th>
                    <th className="border-0 py-3 fw-bold text-muted text-uppercase tracking-wider">Tautan</th>
                    <th className="border-0 py-3 text-end pe-3 pe-md-4 fw-bold text-muted text-uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {loadingSosmed ? (
                    <tr>
                      <td colSpan={3} className="text-center py-5">
                        <Loader2 className="text-primary animate-spin mb-2 mx-auto" size={20} />
                        <div className="text-muted text-[10px]">Memuat data...</div>
                      </td>
                    </tr>
                  ) : sosmedData.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-5">
                        <div className="d-flex flex-column align-items-center opacity-50">
                          <LinkIcon size={32} className="text-muted mb-2" />
                          <span className="text-muted text-[10px] md:text-[11px] fw-medium">Data kosong</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sosmedData.map((item) => (
                      <SosmedRow 
                        key={item.id} 
                        item={item} 
                        onDelete={handleDeleteSosmed} 
                        onEdit={(i) => {
                          setIsEditSosmed(true);
                          setCurrentSosmedId(i.id);
                          setSosmedForm({ 
                            nama_platform: i.nama_platform || '', 
                            url_link: i.url_link || '', 
                            tipe: i.tipe || 'Sosial Media'
                          });
                          setErrors({});
                          setShowSosmedForm(true);
                        }} 
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showSosmedForm && (
        <div className="modal fade show d-block bg-black/50 backdrop-blur-sm z-[1050]" role="dialog" aria-modal="true">
          <div className="modal-dialog modal-dialog-centered px-3 max-w-[420px] mx-auto">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header border-0 pb-0 px-4 pt-4 d-flex justify-content-between align-items-center">
                <h6 className="modal-title fw-bold text-dark text-[13px] md:text-[14px]">
                  {isEditSosmed ? "Sunting Data" : "Tambah Data"}
                </h6>
                <button type="button" onClick={() => setShowSosmedForm(false)} className="btn-close shadow-none scale-75" aria-label="Close"></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="platform_select" className="form-label text-[10px] md:text-[11px] fw-bold mb-2">Platform</label>
                    <div className="d-flex gap-2">
                       <div className="bg-light p-2.5 rounded-3 d-flex align-items-center text-primary border flex-shrink-0" aria-hidden="true">
                          {getPlatformIcon(sosmedForm.nama_platform)}
                       </div>
                       <select 
                        id="platform_select"
                        title="Pilih Platform"
                        className={`form-select bg-light border-0 text-[10px] md:text-[11px] py-2.5 shadow-none fw-medium ${errors.nama_platform ? 'is-invalid' : ''}`}
                        value={sosmedForm.nama_platform} 
                        onChange={(e) => setSosmedForm({...sosmedForm, nama_platform: e.target.value})}
                      >
                        <option value="">-- Pilih --</option>
                        {PLATFORM_OPTIONS.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    {errors.nama_platform && <div className="text-danger text-[9px] mt-1 fw-medium">{errors.nama_platform[0]}</div>}
                  </div>

                  <div className="col-12">
                    <label htmlFor="tipe_select" className="form-label text-[10px] md:text-[11px] fw-bold mb-2">Tipe</label>
                    <select 
                      id="tipe_select"
                      title="Pilih Tipe"
                      className="form-select bg-light border-0 text-[10px] md:text-[11px] py-2.5 shadow-none fw-medium" 
                      value={sosmedForm.tipe} 
                      onChange={(e) => setSosmedForm({...sosmedForm, tipe: e.target.value})}
                    >
                      {TIPE_OPTIONS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12">
                    <label htmlFor="url_sosmed" className="form-label text-[10px] md:text-[11px] fw-bold mb-2">Alamat Tautan (URL)</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0 text-muted px-3">
                        <LinkIcon size={12} />
                      </span>
                      <input 
                        id="url_sosmed"
                        type="text" 
                        className={`form-control bg-light border-0 text-[10px] md:text-[11px] py-2.5 shadow-none fw-medium ${errors.url_link ? 'is-invalid' : ''}`}
                        value={sosmedForm.url_link} 
                        onChange={(e) => setSosmedForm({...sosmedForm, url_link: e.target.value})} 
                        placeholder="https://..." 
                      />
                    </div>
                    {errors.url_link && <div className="text-danger text-[9px] mt-1 fw-medium">{errors.url_link[0]}</div>}
                  </div>

                  <div className="col-12 mt-4">
                    <button 
                      type="button"
                      onClick={handleSaveSosmed} 
                      disabled={isSubmittingSosmed} 
                      className="btn btn-primary w-100 py-2.5 fw-bold text-[11px] md:text-[12px] rounded-3 shadow-sm d-flex align-items-center justify-content-center"
                    >
                      {isSubmittingSosmed ? <Loader2 size={16} className="animate-spin" /> : "SIMPAN DATA"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
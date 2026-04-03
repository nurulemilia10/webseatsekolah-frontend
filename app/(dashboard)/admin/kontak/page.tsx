"use client";

import React, { useState, useEffect, useCallback, useMemo, useId } from 'react';
import { Loader2, MapPin, Phone, Mail, Map } from 'lucide-react';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/useAuth';

export default function ManajemenDataKontak() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    alamat_jalan: '',
    desa_kelurahan: '',
    kecamatan: '',
    kabupaten_kota: '',
    provinsi: '',
    telepon: '',
    email_resmi: '',
    peta_embed_code: ''
  });
  const [errors, setErrors] = useState<any>({});

  const jalanId = useId();
  const desaId = useId();
  const kecId = useId();
  const kabId = useId();
  const provId = useId();
  const telpId = useId();
  const emailId = useId();
  const mapsId = useId();

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
      const res = await api.admin.Datakontak.get();
      if (res?.data?.success) {
        const d = res.data.data;
        setFormData({
          alamat_jalan: d.alamat_jalan || '',
          desa_kelurahan: d.desa_kelurahan || '',
          kecamatan: d.kecamatan || '',
          kabupaten_kota: d.kabupaten_kota || '',
          provinsi: d.provinsi || '',
          telepon: d.telepon || '',
          email_resmi: d.email || d.email_resmi || '',
          peta_embed_code: d.maps_embed_code || d.peta_embed_code || ''
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [authLoading, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setErrors({});
    setIsSubmitting(true);
    try {
      const res = await api.admin.Datakontak.update(formData);
      if (res.data?.success) {
        Toast.fire({ icon: 'success', title: res.data?.message || 'Data berhasil diperbarui' });
        fetchData();
      }
    } catch (e: any) {
      if (e.response?.status === 422) {
        setErrors(e.response.data.errors);
      } else {
        Toast.fire({ icon: 'error', title: e.response?.data?.message || 'Terjadi kesalahan' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <Loader2 className="text-warning animate-spin mb-2" size={24} />
        <div className="text-muted text-[10px]">Memuat data kontak...</div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3 px-2 px-md-3">
      <div className="d-flex align-items-center mb-3">
        <MapPin size={16} className="text-warning me-2" />
        <h6 className="mb-0 fw-bold text-dark text-uppercase text-[12px] tracking-wider">Informasi Kontak Instansi</h6>
      </div>

      <div className="row g-3">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <div className="row g-3">
              <div className="col-12">
                <label htmlFor={jalanId} className="form-label text-dark mb-1 fw-bold text-[11px]">Alamat Jalan</label>
                <input id={jalanId} type="text" className="form-control bg-light border-0 shadow-none py-2.5 px-3 text-[11px] rounded-3" value={formData.alamat_jalan} onChange={(e) => setFormData({...formData, alamat_jalan: e.target.value})} placeholder="Masukkan alamat jalan" />
                {errors.alamat_jalan && <div className="text-danger mt-1 text-[9px]">{errors.alamat_jalan[0]}</div>}
              </div>

              <div className="col-md-6">
                <label htmlFor={desaId} className="form-label text-dark mb-1 fw-bold text-[11px]">Desa / Kelurahan</label>
                <input id={desaId} type="text" className="form-control bg-light border-0 shadow-none py-2.5 px-3 text-[11px] rounded-3" value={formData.desa_kelurahan} onChange={(e) => setFormData({...formData, desa_kelurahan: e.target.value})} placeholder="Masukkan desa/kelurahan" />
              </div>

              <div className="col-md-6">
                <label htmlFor={kecId} className="form-label text-dark mb-1 fw-bold text-[11px]">Kecamatan</label>
                <input id={kecId} type="text" className="form-control bg-light border-0 shadow-none py-2.5 px-3 text-[11px] rounded-3" value={formData.kecamatan} onChange={(e) => setFormData({...formData, kecamatan: e.target.value})} placeholder="Masukkan kecamatan" />
              </div>

              <div className="col-md-6">
                <label htmlFor={kabId} className="form-label text-dark mb-1 fw-bold text-[11px]">Kabupaten / Kota</label>
                <input id={kabId} type="text" className="form-control bg-light border-0 shadow-none py-2.5 px-3 text-[11px] rounded-3" value={formData.kabupaten_kota} onChange={(e) => setFormData({...formData, kabupaten_kota: e.target.value})} placeholder="Masukkan kabupaten/kota" />
              </div>

              <div className="col-md-6">
                <label htmlFor={provId} className="form-label text-dark mb-1 fw-bold text-[11px]">Provinsi</label>
                <input id={provId} type="text" className="form-control bg-light border-0 shadow-none py-2.5 px-3 text-[11px] rounded-3" value={formData.provinsi} onChange={(e) => setFormData({...formData, provinsi: e.target.value})} placeholder="Masukkan provinsi" />
              </div>

              <div className="col-md-6">
                <div className="d-flex align-items-center mb-1">
                  <Phone size={12} className="me-1 text-muted"/>
                  <label htmlFor={telpId} className="form-label text-dark mb-0 fw-bold text-[11px]">Telepon</label>
                </div>
                <input id={telpId} type="text" className="form-control bg-light border-0 shadow-none py-2.5 px-3 text-[11px] rounded-3" value={formData.telepon} onChange={(e) => setFormData({...formData, telepon: e.target.value})} placeholder="0xxx-xxxx-xxxx" />
              </div>

              <div className="col-md-6">
                <div className="d-flex align-items-center mb-1">
                  <Mail size={12} className="me-1 text-muted"/>
                  <label htmlFor={emailId} className="form-label text-dark mb-0 fw-bold text-[11px]">Email Resmi</label>
                </div>
                <input id={emailId} type="email" className="form-control bg-light border-0 shadow-none py-2.5 px-3 text-[11px] rounded-3" value={formData.email_resmi} onChange={(e) => setFormData({...formData, email_resmi: e.target.value})} placeholder="info@sekolah.sch.id" />
              </div>

              <div className="col-12 mt-2">
                <button onClick={handleSave} className="btn btn-warning w-100 fw-bold shadow-sm py-2.5 text-[12px] rounded-3" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 size={14} className="animate-spin me-2" /> : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <div className="d-flex align-items-center mb-2">
              <Map size={16} className="text-warning me-2" />
              <label htmlFor={mapsId} className="form-label text-dark mb-0 fw-bold text-[11px]">Google Maps Embed Code</label>
            </div>
            <textarea id={mapsId} rows={5} className="form-control bg-light border-0 shadow-none py-2 px-3 text-[10px] rounded-3 mb-3 font-monospace" value={formData.peta_embed_code} onChange={(e) => setFormData({...formData, peta_embed_code: e.target.value})} placeholder='Masukkan <iframe> tag dari Google Maps' />
            <div className="bg-light rounded-4 p-2 flex-grow-1 d-flex align-items-center justify-content-center border border-dashed border-2 overflow-hidden mh-100">
              {formData.peta_embed_code ? (
                <div className="w-100 h-100 rounded-3 overflow-hidden ratio ratio-4x3" dangerouslySetInnerHTML={{ __html: formData.peta_embed_code }} />
              ) : (
                <div className="text-center p-4">
                  <MapPin size={32} className="text-muted mb-2 opacity-20" />
                  <div className="text-muted text-[10px] fw-medium">Preview Peta</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect, useCallback, useId, memo, useMemo } from 'react';
import { 
  Plus, Edit2, Loader2, Building2, Trash2, Image as ImageIcon, Info, Crop, ChevronLeft
} from 'lucide-react';
import Cropper from 'react-easy-crop';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/useAuth';
import { getCroppedImg, getBase64FromUrl } from '@/app/utils/imageUtils';

const FasilitasRow = memo(({ fasilitas, onEdit, onDelete }: { fasilitas: any, onEdit: (f: any) => void, onDelete: (id: string) => void }) => (
  <tr>
    <td className="ps-3 py-2">
      <div className="d-flex align-items-center">
        <div className="ui-thumb-container flex-shrink-0">
          {fasilitas.foto_url ? (
            <img src={`${fasilitas.foto_url}?t=${fasilitas.updated_at || Date.now()}`} alt="thumb" className="w-100 h-100 object-cover block" />
          ) : (
            <div className="d-flex align-items-center justify-content-center w-100 h-100">
              <ImageIcon size={10} className="text-muted" />
            </div>
          )}
        </div>
        <div className="ms-2 text-dark fw-medium text-[11px] text-wrap-custom max-w-title">
          {fasilitas.nama_fasilitas}
        </div>
      </div>
    </td>
    <td className="py-2 text-muted text-[10px] d-none d-md-table-cell">
      <div className="d-flex align-items-center">
        <span className="text-truncate max-w-description">{fasilitas.keterangan || '-'}</span>
      </div>
    </td>
    <td className="py-2 text-end pe-3">
      <div className="d-flex justify-content-end gap-1">
        <button onClick={() => onEdit(fasilitas)} className="btn btn-sm p-1 text-warning border-0 shadow-none" title="Edit Fasilitas" aria-label="Edit Fasilitas">
          <span className="bg-light p-1 rounded-3 d-inline-flex"><Edit2 size={11}/></span>
        </button>
        <button onClick={() => onDelete(fasilitas.id)} className="btn btn-sm p-1 text-danger border-0 shadow-none" title="Hapus Fasilitas" aria-label="Hapus Fasilitas">
          <span className="bg-danger bg-opacity-10 p-1 rounded-3 d-inline-flex"><Trash2 size={11}/></span>
        </button>
      </div>
    </td>
  </tr>
));

FasilitasRow.displayName = 'FasilitasRow';

export default function ManajemenFasilitas() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [tempImage, setTempImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ nama_fasilitas: '', keterangan: '', foto: null as File | null });
  const [errors, setErrors] = useState<any>({});

  const namaId = useId();
  const ketId = useId();
  const fotoId = useId();

  const Toast = useMemo(() => Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  }), []);

  const fetchData = useCallback(async (page = 1) => {
    if (authLoading || !user) return;
    setLoading(true);
    try {
      const res = await api.admin.fasilitas.getAll({ page });
      if (res?.data) {
        setData(res.data.data || []);
        setMeta(res.data.meta || null);
        setCurrentPage(page);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [authLoading, user]);

  useEffect(() => { fetchData(1); }, [fetchData]);

  const onCropComplete = useCallback((_: any, clippedPixels: any) => { setCroppedAreaPixels(clippedPixels); }, []);

  const handleApplyCrop = async () => {
    if (tempImage && croppedAreaPixels) {
      try {
        const croppedBlob = await getCroppedImg(tempImage, croppedAreaPixels);
        const file = new File([croppedBlob], "fasilitas_foto.jpg", { type: "image/jpeg" });
        if (photoPreview && photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
        const newUrl = URL.createObjectURL(croppedBlob);
        setFormData(prev => ({ ...prev, foto: file }));
        setPhotoPreview(newUrl);
        setTempImage(null);
      } catch (e) { Toast.fire({ icon: 'error', title: 'Gagal memotong gambar' }); }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImage(reader.result as string);
        setTempImage(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCloseForm = useCallback(() => {
    if (photoPreview && photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
    setShowForm(false); setIsEdit(false); setCurrentId(null); setTempImage(null);
    setOriginalImage(null); setPhotoPreview(null); setErrors({});
    setFormData({ nama_fasilitas: '', keterangan: '', foto: null });
  }, [photoPreview]);

  const handleEditClick = useCallback(async (f: any) => {
    setIsEdit(true); setCurrentId(f.id);
    setFormData({ nama_fasilitas: f.nama_fasilitas || '', keterangan: f.keterangan || '', foto: null });
    setPhotoPreview(f.foto_url || null);
    setShowForm(true);
    if (f.foto_url) {
      try { const base64 = await getBase64FromUrl(f.foto_url); setOriginalImage(base64); } catch (e) { console.error(e); }
    }
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Fasilitas?',
      text: "Data akan langsung dihapus dari daftar.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      const previousData = [...data];
      setData(prev => prev.filter(item => item.id !== id));
      try {
        const res = await api.admin.fasilitas.delete(id);
        if (res.status === 200 || res.data?.success) {
          Toast.fire({ icon: 'success', title: res.data?.message || 'Fasilitas dihapus' });
          if (meta) setMeta({ ...meta, total: meta.total - 1 });
        } else { throw new Error(); }
      } catch (e: any) {
        setData(previousData);
        Toast.fire({ icon: 'error', title: e.response?.data?.message || 'Gagal menghapus data' });
      }
    }
  };

  const handleSave = async () => {
    setErrors({});
    setIsSubmitting(true);
    const payload = new FormData();
    payload.append('nama_fasilitas', formData.nama_fasilitas);
    payload.append('keterangan', formData.keterangan);
    if (formData.foto) payload.append('foto', formData.foto);

    try {
      let res;
      if (isEdit && currentId) {
        payload.append('_method', 'PUT');
        res = await api.admin.fasilitas.update(currentId, payload);
      } else {
        res = await api.admin.fasilitas.create(payload);
      }

      if (res.status === 200 || res.status === 201 || res.data?.success) { 
        Toast.fire({ icon: 'success', title: res.data?.message || 'Data berhasil disimpan' });
        handleCloseForm(); 
        fetchData(isEdit ? currentPage : 1); 
      }
    } catch (e: any) { 
      if (e.response?.status === 422) {
        setErrors(e.response.data.errors);
      } else {
        Toast.fire({ icon: 'error', title: e.response?.data?.message || 'Terjadi kesalahan' });
      }
    } finally { setIsSubmitting(false); }
  };

  if (authLoading) return null;

  return (
    <div className="container-fluid py-3 px-2 px-md-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <Building2 size={16} className="text-warning me-2" />
          <h6 className="mb-0 fw-bold text-dark text-uppercase text-[12px] tracking-wider">Sarana & Fasilitas</h6>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-warning btn-sm px-2 px-md-3 shadow-sm rounded-3 py-1.5 text-[10px]">
          <Plus size={13} className="me-1"/> <span>Tambah Fasilitas</span>
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="text-[9px]">
                <th className="ps-3 border-0 py-2.5 fw-bold text-muted text-uppercase">Nama Fasilitas</th>
                <th className="border-0 py-2.5 fw-bold text-muted text-uppercase d-none d-md-table-cell">Keterangan</th>
                <th className="border-0 py-2.5 text-end pe-3 fw-bold text-muted text-uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center py-5">
                    <Loader2 className="text-warning animate-spin mb-2 mx-auto" size={20} />
                    <div className="text-muted text-[10px]">Memuat data...</div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-5 text-muted text-[10px]">Tidak ada data fasilitas.</td>
                </tr>
              ) : data.map((f) => (
                <FasilitasRow key={f.id} fasilitas={f} onEdit={handleEditClick} onDelete={handleDelete} />
              ))}
            </tbody>
          </table>
        </div>

        {!loading && data.length > 0 && meta && (
          <div className="d-flex justify-content-between align-items-center px-3 py-2 border-top bg-white">
            <div className="text-muted text-[9px] fw-medium">
              Menampilkan {data.length} dari {meta.total} data
            </div>
            <nav className="d-flex align-items-center gap-1">
              <button
                className="btn btn-light btn-sm border shadow-none p-1 rounded-2"
                disabled={meta.current_page === 1}
                onClick={() => fetchData(meta.current_page - 1)}
                title="Previous"
                aria-label="Previous"
              >
                <ChevronLeft size={12} />
              </button>
              <div className="d-flex gap-1">
                {(() => {
                  const pages = [];
                  const cp = meta.current_page;
                  const lp = Math.max(1, meta.last_page);
                  pages.push(1);
                  if (cp > 3) pages.push('ellipsis-1');
                  for (let i = Math.max(2, cp - 1); i <= Math.min(lp - 1, cp + 1); i++) {
                    pages.push(i);
                  }
                  if (cp < lp - 2) pages.push('ellipsis-2');
                  if (lp > 1) pages.push(lp);
                  return pages.map((p, idx) => {
                    if (typeof p === 'string') return <span key={`e-${idx}`} className="px-1 text-muted text-[10px]">...</span>;
                    return (
                      <button
                        key={p}
                        onClick={() => fetchData(p)}
                        className={`btn btn-sm px-2 py-1 rounded-2 fw-bold text-[10px] border-0 ${cp === p ? 'btn-warning text-white' : 'btn-light text-dark'}`}
                      >
                        {p}
                      </button>
                    );
                  });
                })()}
              </div>
              <button
                className="btn btn-light btn-sm border shadow-none p-1 rounded-2"
                disabled={meta.current_page === meta.last_page}
                onClick={() => fetchData(meta.current_page + 1)}
                title="Next"
                aria-label="Next"
              >
                <ChevronLeft size={12} className="rotate-180" />
              </button>
            </nav>
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal fade show d-block bg-black/40 z-[1050]">
          <div className="modal-dialog modal-dialog-centered px-3 modal-max-width mx-auto">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="modal-header border-0 pb-0 px-3 pt-3">
                <h6 className="modal-title fw-bold text-dark text-[12px]">
                  {tempImage ? "Potong Foto" : (isEdit ? "Edit Fasilitas" : "Input Fasilitas")}
                </h6>
                <button onClick={handleCloseForm} className="btn-close shadow-none scale-75" aria-label="Close"></button>
              </div>
              <div className="modal-body p-3 pt-2">
                {tempImage ? (
                  <div className="ui-cropper-wrapper">
                    <Cropper image={tempImage} crop={crop} zoom={zoom} aspect={16 / 9} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
                    <div className="position-absolute bottom-0 start-0 w-100 p-2 d-flex gap-2 z-index-10">
                       <button onClick={handleApplyCrop} className="btn btn-warning btn-sm flex-grow-1 fw-bold text-[10px] py-1.5 rounded-3 shadow">
                         <Crop size={11} className="me-1"/> Selesai
                       </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-2">
                      <label className="form-label text-dark mb-1 fw-semibold text-[10px]" htmlFor={namaId}>Nama Fasilitas</label>
                      <input id={namaId} type="text" className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" value={formData.nama_fasilitas} onChange={(e) => setFormData({...formData, nama_fasilitas: e.target.value})} />
                      {errors.nama_fasilitas && <div className="text-danger mt-1 text-[8px]">{errors.nama_fasilitas[0]}</div>}
                    </div>
                    <div className="mb-2">
                      <label className="form-label text-dark mb-1 fw-semibold text-[10px]" htmlFor={ketId}>Keterangan</label>
                      <textarea id={ketId} rows={3} className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" value={formData.keterangan} onChange={(e) => setFormData({...formData, keterangan: e.target.value})} />
                      {errors.keterangan && <div className="text-danger mt-1 text-[8px]">{errors.keterangan[0]}</div>}
                    </div>
                    <div className="mb-2">
                      <label className="form-label text-dark mb-1 fw-semibold text-[10px]" htmlFor={fotoId}>Foto</label>
                      <input id={fotoId} type="file" accept="image/*" className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" onChange={handleFileChange} />
                      {photoPreview && (
                        <div className="ui-preview-foto" onClick={() => originalImage && setTempImage(originalImage)}>
                          <img src={photoPreview} alt="Preview" />
                          <div className="ui-preview-overlay"><span>Klik untuk potong ulang</span></div>
                          <button type="button" className="btn-close ui-btn-delete-preview shadow-none" aria-label="Hapus Foto" onClick={(e) => { e.stopPropagation(); setFormData({...formData, foto: null}); setPhotoPreview(null); setOriginalImage(null); }}></button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              {!tempImage && (
                <div className="modal-footer border-0 p-3 pt-0">
                  <button onClick={handleSave} className="btn btn-warning btn-sm w-100 fw-bold shadow-sm py-2 text-[11px] rounded-3" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : (isEdit ? "Update Fasilitas" : "Simpan Fasilitas")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
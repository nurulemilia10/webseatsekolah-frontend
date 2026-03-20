"use client";

import React, { useState, useEffect, useCallback, useId, memo, useMemo } from 'react';
import { 
  Plus, Edit2, Loader2, Library, Trash2, Image as ImageIcon, CheckCircle2, XCircle, Crop
} from 'lucide-react';
import Cropper from 'react-easy-crop';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/useAuth';
import { getCroppedImg, getBase64FromUrl } from '@/app/utils/imageUtils';

const JurusanRow = memo(({ jurusan, onEdit, onDelete }: { jurusan: any, onEdit: (j: any) => void, onDelete: (id: string) => void }) => (
  <tr>
    <td className="ps-3 py-2">
      <div className="d-flex align-items-center">
        <div className="ui-thumb-container flex-shrink-0">
          {jurusan.foto_url ? (
            <img src={`${jurusan.foto_url}?t=${jurusan.updated_at || Date.now()}`} alt="thumb" className="w-100 h-100 object-cover block" />
          ) : (
            <div className="d-flex align-items-center justify-content-center w-100 h-100">
              <ImageIcon size={10} className="text-muted" />
            </div>
          )}
        </div>
        <div className="ms-2 text-dark fw-medium text-[11px] text-wrap-custom max-w-title">
          {jurusan.nama_jurusan}
        </div>
      </div>
    </td>
    <td className="py-2 text-muted text-[10px] d-none d-md-table-cell">
      <div className="d-flex align-items-center">
        {jurusan.is_active ? (
          <span className="badge bg-success-subtle text-success border-0 fw-medium px-2 py-1 rounded-pill d-flex align-items-center gap-1">
            <CheckCircle2 size={10} /> Aktif
          </span>
        ) : (
          <span className="badge bg-danger-subtle text-danger border-0 fw-medium px-2 py-1 rounded-pill d-flex align-items-center gap-1">
            <XCircle size={10} /> Nonaktif
          </span>
        )}
      </div>
    </td>
    <td className="py-2 text-end pe-3">
      <div className="d-flex justify-content-end gap-1">
        <button onClick={() => onEdit(jurusan)} className="btn btn-sm p-1 text-primary border-0 shadow-none" title="Edit Jurusan" aria-label="Edit Jurusan">
          <span className="bg-light p-1 rounded-3 d-inline-flex"><Edit2 size={11}/></span>
        </button>
        <button onClick={() => onDelete(jurusan.id)} className="btn btn-sm p-1 text-danger border-0 shadow-none" title="Hapus Jurusan" aria-label="Hapus Jurusan">
          <span className="bg-danger bg-opacity-10 p-1 rounded-3 d-inline-flex"><Trash2 size={11}/></span>
        </button>
      </div>
    </td>
  </tr>
));

JurusanRow.displayName = 'JurusanRow';

export default function ManajemenJurusan() {
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
  
  const [formData, setFormData] = useState({ nama_jurusan: '', deskripsi: '', is_active: true, foto: null as File | null });
  const [errors, setErrors] = useState<any>({});

  const namaId = useId();
  const descId = useId();
  const activeId = useId();
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
      const res = await api.admin.jurusan.getAll({ page });
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
        const file = new File([croppedBlob], "jurusan_foto.jpg", { type: "image/jpeg" });
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
    setFormData({ nama_jurusan: '', deskripsi: '', is_active: true, foto: null });
  }, [photoPreview]);

  const handleEditClick = useCallback(async (j: any) => {
    setIsEdit(true); setCurrentId(j.id);
    setFormData({ 
      nama_jurusan: j.nama_jurusan || '', 
      deskripsi: j.deskripsi || '', 
      is_active: !!j.is_active, 
      foto: null 
    });
    setPhotoPreview(j.foto_url || null);
    setShowForm(true);
    if (j.foto_url) {
      try { const base64 = await getBase64FromUrl(j.foto_url); setOriginalImage(base64); } catch (e) { console.error(e); }
    }
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Jurusan?',
      text: "Seluruh data terkait jurusan ini akan ikut terhapus.",
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
        const res = await api.admin.jurusan.delete(id);
        if (res.status === 200 || res.data?.success) {
          Toast.fire({ icon: 'success', title: res.data?.message || 'Jurusan dihapus' });
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
    payload.append('nama_jurusan', formData.nama_jurusan);
    payload.append('deskripsi', formData.deskripsi);
    payload.append('is_active', formData.is_active ? '1' : '0');
    if (formData.foto) payload.append('foto', formData.foto);

    try {
      let res;
      if (isEdit && currentId) {
        payload.append('_method', 'PUT');
        res = await api.admin.jurusan.update(currentId, payload);
      } else {
        res = await api.admin.jurusan.create(payload);
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
          <Library size={16} className="text-primary me-2" />
          <h6 className="mb-0 fw-bold text-dark text-uppercase text-[12px] tracking-wider">Data Jurusan</h6>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm px-2 px-md-3 shadow-sm rounded-3 py-1.5 text-[10px]">
          <Plus size={13} className="me-1"/> <span>Tambah Jurusan</span>
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="text-[9px]">
                <th className="ps-3 border-0 py-2.5 fw-bold text-muted text-uppercase">Nama Jurusan</th>
                <th className="border-0 py-2.5 fw-bold text-muted text-uppercase d-none d-md-table-cell">Status</th>
                <th className="border-0 py-2.5 text-end pe-3 fw-bold text-muted text-uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center py-5">
                    <Loader2 className="text-primary animate-spin mb-2 mx-auto" size={20} />
                    <div className="text-muted text-[10px]">Memuat data...</div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-5 text-muted text-[10px]">Tidak ada data jurusan.</td>
                </tr>
              ) : data.map((j) => (
                <JurusanRow key={j.id} jurusan={j} onEdit={handleEditClick} onDelete={handleDelete} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-white border-top py-2 rounded-bottom-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted text-[9px] fw-medium">Total: {meta?.total || 0}</div>
            {meta && meta.last_page > 1 && (
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${meta.current_page === 1 ? 'disabled' : ''}`}>
                    <button className="page-link border rounded-3 mx-1 ui-pagination-square shadow-none" onClick={() => fetchData(meta.current_page - 1)} aria-label="Previous Page">&lt;</button>
                  </li>
                  <li className="page-item active">
                    <span className="page-link border rounded-3 mx-1 ui-pagination-square bg-primary text-white border-primary shadow-none">{meta.current_page}</span>
                  </li>
                  <li className={`page-item ${meta.current_page === meta.last_page ? 'disabled' : ''}`}>
                    <button className="page-link border rounded-3 mx-1 ui-pagination-square shadow-none" onClick={() => fetchData(meta.current_page + 1)} aria-label="Next Page">&gt;</button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="modal fade show d-block bg-black/40 z-[1050]">
          <div className="modal-dialog modal-dialog-centered px-3 modal-max-width mx-auto">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="modal-header border-0 pb-0 px-3 pt-3">
                <h6 className="modal-title fw-bold text-dark text-[12px]">
                  {tempImage ? "Potong Foto" : (isEdit ? "Edit Jurusan" : "Tambah Jurusan")}
                </h6>
                <button onClick={handleCloseForm} className="btn-close shadow-none scale-75" aria-label="Close" title="Tutup Modal"></button>
              </div>
              <div className="modal-body p-3 pt-2">
                {tempImage ? (
                  <div className="ui-cropper-wrapper">
                    <Cropper image={tempImage} crop={crop} zoom={zoom} aspect={1 / 1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
                    <div className="position-absolute bottom-0 start-0 w-100 p-2 d-flex gap-2 z-index-10">
                       <button onClick={handleApplyCrop} className="btn btn-primary btn-sm flex-grow-1 fw-bold text-[10px] py-1.5 rounded-3 shadow">
                         <Crop size={11} className="me-1"/> Terapkan
                       </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-2">
                      <label className="form-label text-dark mb-1 fw-semibold text-[10px]" htmlFor={namaId}>Nama Jurusan</label>
                      <input id={namaId} type="text" className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" value={formData.nama_jurusan} onChange={(e) => setFormData({...formData, nama_jurusan: e.target.value})} />
                      {errors.nama_jurusan && <div className="text-danger mt-1 text-[8px]">{errors.nama_jurusan[0]}</div>}
                    </div>
                    <div className="mb-2">
                      <label className="form-label text-dark mb-1 fw-semibold text-[10px]" htmlFor={descId}>Deskripsi</label>
                      <textarea id={descId} rows={3} className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" value={formData.deskripsi} onChange={(e) => setFormData({...formData, deskripsi: e.target.value})} />
                    </div>

                    <div className="mb-2 d-flex align-items-center mt-3">
                      <div className="form-check form-switch p-0 m-0 d-flex align-items-center">
                        <input className="form-check-input ms-0 me-2 shadow-none cursor-pointer" type="checkbox" id={activeId} checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} />
                        <label className="form-check-label text-dark fw-semibold text-[10px] cursor-pointer" htmlFor={activeId}>Aktifkan Jurusan</label>
                      </div>
                    </div>

                    <div className="mb-2">
                      <label className="form-label text-dark mb-1 fw-semibold text-[10px]" htmlFor={fotoId}>Foto Jurusan</label>
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
                  <button onClick={handleSave} className="btn btn-primary btn-sm w-100 fw-bold shadow-sm py-2 text-[11px] rounded-3" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : (isEdit ? "Perbarui Data" : "Simpan Data")}
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
"use client";

import React, { useState, useEffect, useCallback, useId, memo, useMemo } from 'react';
import { 
  Plus, Edit2, Loader2, BookOpen, Trash2, ChevronLeft
} from 'lucide-react';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/useAuth';

const KurikulumRow = memo(({ kurikulum, onEdit, onDelete }: { kurikulum: any, onEdit: (k: any) => void, onDelete: (id: string) => void }) => (
  <tr>
    <td className="ps-3 py-2">
      <div className="d-flex align-items-center">
        <div className="ui-thumb-container flex-shrink-0">
          <div className="d-flex align-items-center justify-content-center w-100 h-100 bg-light rounded">
            <BookOpen size={14} className="text-warning" />
          </div>
        </div>
        <div className="ms-2 text-dark fw-medium text-[11px] text-wrap-custom max-w-title">
          {kurikulum.judul}
        </div>
      </div>
    </td>
    <td className="py-2 text-muted text-[10px] d-none d-md-table-cell">
      <div className="d-flex align-items-center">
        <span className={`badge ${kurikulum.is_active ? 'bg-success' : 'bg-secondary'} bg-opacity-10 text-${kurikulum.is_active ? 'success' : 'secondary'} border-0 text-[9px]`}>
          {kurikulum.is_active ? 'Aktif' : 'Non-Aktif'}
        </span>
      </div>
    </td>
    <td className="py-2 text-end pe-3">
      <div className="d-flex justify-content-end gap-1">
        <button onClick={() => onEdit(kurikulum)} className="btn btn-sm p-1 text-warning border-0 shadow-none" title="Edit Kurikulum" aria-label="Edit Kurikulum">
          <span className="bg-light p-1 rounded-3 d-inline-flex"><Edit2 size={11}/></span>
        </button>
        <button onClick={() => onDelete(kurikulum.id)} className="btn btn-sm p-1 text-danger border-0 shadow-none" title="Hapus Kurikulum" aria-label="Hapus Kurikulum">
          <span className="bg-danger bg-opacity-10 p-1 rounded-3 d-inline-flex"><Trash2 size={11}/></span>
        </button>
      </div>
    </td>
  </tr>
));

KurikulumRow.displayName = 'KurikulumRow';

export default function ManajemenKurikulum() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ 
    judul: '', 
    penjelasan_kurikulum: '', 
    is_active: true, 
    file_jadwal: null as File | null 
  });
  const [errors, setErrors] = useState<any>({});

  const judulId = useId();
  const isiId = useId();
  const fileId = useId();
  const activeId = useId();

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
      const res = await api.admin.kurikulum.getAll({ page });
      if (res?.data) {
        setData(res.data.data || []);
        setMeta(res.data.meta || null);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [authLoading, user]);

  useEffect(() => { fetchData(1); }, [fetchData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, file_jadwal: e.target.files![0] }));
    }
  };

  const handleCloseForm = useCallback(() => {
    setShowForm(false); setIsEdit(false); setCurrentId(null); setErrors({});
    setFormData({ judul: '', penjelasan_kurikulum: '', is_active: true, file_jadwal: null });
  }, []);

  const handleEditClick = useCallback(async (k: any) => {
    setIsEdit(true); setCurrentId(k.id);
    setFormData({ 
      judul: k.judul || '', 
      penjelasan_kurikulum: k.penjelasan_kurikulum || '', 
      is_active: !!k.is_active, 
      file_jadwal: null 
    });
    setShowForm(true);
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Kurikulum?',
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
        const res = await api.admin.kurikulum.delete(id);
        if (res.status === 200 || res.data?.success) {
          Toast.fire({ icon: 'success', title: res.data?.message || 'Kurikulum dihapus' });
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
    payload.append('judul', formData.judul);
    payload.append('penjelasan_kurikulum', formData.penjelasan_kurikulum);
    payload.append('is_active', formData.is_active ? '1' : '0');
    if (formData.file_jadwal) payload.append('file_jadwal', formData.file_jadwal);

    try {
      let res;
      if (isEdit && currentId) {
        payload.append('_method', 'PUT');
        res = await api.admin.kurikulum.update(currentId, payload);
      } else {
        res = await api.admin.kurikulum.create(payload);
      }

      if (res.status === 200 || res.status === 201 || res.data?.success) { 
        Toast.fire({ icon: 'success', title: res.data?.message || 'Data berhasil disimpan' });
        handleCloseForm(); 
        fetchData(meta?.current_page || 1); 
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
          <BookOpen size={16} className="text-warning me-2" />
          <h6 className="mb-0 fw-bold text-dark text-uppercase text-[12px] tracking-wider">Manajemen Kurikulum</h6>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-warning btn-sm px-2 px-md-3 shadow-sm rounded-3 py-1.5 text-[10px]" title="Tambah Kurikulum Baru" aria-label="Tambah Kurikulum Baru">
          <Plus size={13} className="me-1"/> <span>Tambah Kurikulum</span>
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="text-[9px]">
                <th className="ps-3 border-0 py-2.5 fw-bold text-muted text-uppercase">Nama Kurikulum</th>
                <th className="border-0 py-2.5 fw-bold text-muted text-uppercase d-none d-md-table-cell">Status</th>
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
                  <td colSpan={3} className="text-center py-5 text-muted text-[10px]">Tidak ada data kurikulum.</td>
                </tr>
              ) : data.map((k) => (
                <KurikulumRow key={k.id} kurikulum={k} onEdit={handleEditClick} onDelete={handleDelete} />
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
                  {isEdit ? "Edit Kurikulum" : "Input Kurikulum"}
                </h6>
                <button onClick={handleCloseForm} className="btn-close shadow-none scale-75" title="Tutup" aria-label="Tutup"></button>
              </div>
              <div className="modal-body p-3 pt-2">
                <div className="mb-2">
                  <label className="form-label text-dark mb-1 fw-semibold text-[10px]" htmlFor={judulId}>Judul Kurikulum</label>
                  <input id={judulId} type="text" className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" value={formData.judul} onChange={(e) => setFormData({...formData, judul: e.target.value})} />
                  {errors.judul && <div className="text-danger mt-1 text-[8px]">{errors.judul[0]}</div>}
                </div>
                <div className="mb-2">
                  <label className="form-label text-dark mb-1 fw-semibold text-[10px]" htmlFor={isiId}>Penjelasan Kurikulum</label>
                  <textarea id={isiId} rows={3} className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" value={formData.penjelasan_kurikulum} onChange={(e) => setFormData({...formData, penjelasan_kurikulum: e.target.value})} />
                  {errors.penjelasan_kurikulum && <div className="text-danger mt-1 text-[8px]">{errors.penjelasan_kurikulum[0]}</div>}
                </div>
                <div className="mb-2">
                  <label className="form-label text-dark mb-1 fw-semibold text-[10px]" htmlFor={fileId}>File Jadwal (PDF/Gambar)</label>
                  <input id={fileId} type="file" className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" onChange={handleFileChange} />
                  {errors.file_jadwal && <div className="text-danger mt-1 text-[8px]">{errors.file_jadwal[0]}</div>}
                </div>
                <div className="mb-2 d-flex align-items-center mt-3">
                  <div className="form-check form-switch p-0 m-0 d-flex align-items-center">
                    <input className="form-check-input ms-0 me-2 shadow-none cursor-pointer" type="checkbox" id={activeId} checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} />
                    <label className="form-check-label text-dark fw-semibold text-[10px] cursor-pointer" htmlFor={activeId}>Aktifkan Kurikulum</label>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-3 pt-0">
                <button onClick={handleSave} className="btn btn-warning btn-sm w-100 fw-bold shadow-sm py-2 text-[11px] rounded-3" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : (isEdit ? "Update Kurikulum" : "Simpan Kurikulum")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
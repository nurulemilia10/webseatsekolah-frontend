"use client";

import React, { useState, useEffect, useCallback, useId, memo, useMemo } from 'react';
import { 
  Plus, Edit2, Loader2, Newspaper, Trash2, Image as ImageIcon, Calendar
} from 'lucide-react';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/useAuth';

const BeritaRow = memo(({ berita, onEdit, onDelete }: { berita: any, onEdit: (b: any) => void, onDelete: (id: string) => void }) => (
  <tr>
    <td className="ps-3 py-2">
      <div className="d-flex align-items-center">
        <div className="flex-shrink-0" style={{ width: '28px', height: '21px' }}>
          {berita.foto_url ? (
            <img 
              src={berita.foto_url} 
              alt="thumb" 
              className="rounded-sm object-cover w-100 h-100 block" 
            />
          ) : (
            <div className="bg-light rounded-sm d-flex align-items-center justify-content-center w-100 h-100">
              <ImageIcon size={10} className="text-muted" />
            </div>
          )}
        </div>
        <div className="ms-2 text-truncate max-w-[180px] text-dark fw-medium text-[11px]">
          {berita.judul}
        </div>
      </div>
    </td>
    <td className="py-2 text-muted text-[10px]">
      <div className="d-flex align-items-center">
        <Calendar size={11} className="me-1" />
        {berita.tanggal_human || berita.tanggal_publikasi || '-'}
      </div>
    </td>
    <td className="py-2 text-end pe-3">
      <div className="d-flex justify-content-end gap-1">
        <button 
          onClick={() => onEdit(berita)} 
          className="btn btn-sm p-1 text-primary border-0 shadow-none"
          title="Edit Berita"
        >
          <span className="bg-light p-1 rounded-3 d-inline-flex">
             <Edit2 size={11}/>
          </span>
        </button>
        <button 
          onClick={() => onDelete(berita.id)} 
          className="btn btn-sm p-1 text-danger border-0 shadow-none"
          title="Hapus Berita"
        >
          <span className="bg-danger bg-opacity-10 p-1 rounded-3 d-inline-flex">
             <Trash2 size={11}/>
          </span>
        </button>
      </div>
    </td>
  </tr>
));

BeritaRow.displayName = 'BeritaRow';

export default function ManajemenBerita() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ 
    judul: '', 
    isi_berita: '', 
    tanggal_publikasi: '',
    foto: null as File | null
  });
  const [errors, setErrors] = useState<any>({});

  const judulId = useId();
  const tglId = useId();
  const isiId = useId();
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
      const res = await api.admin.berita.getAll({ page });
      if (res?.data) {
        setData(res.data.data || []);
        setMeta(res.data.meta || null);
        setCurrentPage(page);
      }
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  }, [authLoading, user]);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setIsEdit(false);
    setCurrentId(null);
    setFormData({ judul: '', isi_berita: '', tanggal_publikasi: '', foto: null });
    setErrors({});
  }, []);

  const handleEditClick = useCallback((b: any) => {
    setIsEdit(true);
    setCurrentId(b.id);
    setFormData({ 
      judul: b.judul || '', 
      isi_berita: b.isi_berita || '', 
      tanggal_publikasi: b.tanggal_publikasi || '',
      foto: null 
    });
    setShowForm(true);
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Apakah anda yakin?',
      text: "Data berita ini akan dihapus permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        const res = await api.admin.berita.delete(id);
        if (res.status === 200 || res.data?.success) {
          Toast.fire({
            icon: 'success',
            title: res.data?.message || 'Berita berhasil dihapus'
          });
          fetchData(currentPage);
        }
      } catch (e) {
        Toast.fire({
          icon: 'error',
          title: 'Gagal menghapus berita'
        });
      }
    }
  };

  const handleSave = async () => {
    setErrors({});
    setIsSubmitting(true);
    
    const payload = new FormData();
    payload.append('judul', formData.judul);
    payload.append('isi_berita', formData.isi_berita);
    if (formData.tanggal_publikasi) payload.append('tanggal_publikasi', formData.tanggal_publikasi);
    if (formData.foto) payload.append('foto', formData.foto);

    try {
      let res;
      if (isEdit && currentId) {
        payload.append('_method', 'PUT');
        res = await api.admin.berita.update(currentId, payload);
      } else {
        res = await api.admin.berita.create(payload);
      }

      if (res.status === 200 || res.status === 201 || res.data?.success) { 
        Toast.fire({
          icon: 'success',
          title: res.data?.message || (isEdit ? 'Berita diperbarui' : 'Berita ditambahkan')
        });
        handleCloseForm(); 
        fetchData(isEdit ? currentPage : 1); 
      }
    } catch (e: any) { 
      if (e.response?.status === 422) {
        setErrors(e.response.data.errors);
      } else {
        Toast.fire({
          icon: 'error',
          title: 'Terjadi kesalahan sistem'
        });
      }
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const renderPagination = () => {
    if (!meta || meta.last_page <= 1) return null;
    return (
      <nav>
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${meta.current_page === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link border rounded-3 mx-1 w-[24px] h-[24px] d-flex align-items-center justify-content-center text-dark shadow-none" 
              onClick={() => fetchData(meta.current_page - 1)}
              title="Previous"
            >
              &lt;
            </button>
          </li>
          <li className="page-item active">
             <span className="page-link border rounded-3 mx-1 d-flex align-items-center justify-content-center w-[24px] h-[24px] text-[10px] bg-primary text-white border-primary shadow-none">
                {meta.current_page}
             </span>
          </li>
          <li className={`page-item ${meta.current_page === meta.last_page ? 'disabled' : ''}`}>
            <button 
              className="page-link border rounded-3 mx-1 w-[24px] h-[24px] d-flex align-items-center justify-content-center text-dark shadow-none" 
              onClick={() => fetchData(meta.current_page + 1)}
              title="Next"
            >
              &gt;
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  if (authLoading) return null;

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <Newspaper size={16} className="text-primary me-2" />
          <h6 className="mb-0 fw-bold text-dark text-uppercase text-[12px] tracking-wider">Berita & Informasi</h6>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm px-3 shadow-sm rounded-3 py-1.5 text-[11px]">
          <Plus size={13} className="me-1"/> Tambah Berita
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="text-[9px]">
                <th className="ps-3 border-0 py-2.5 fw-bold text-muted text-uppercase">Judul Berita</th>
                <th className="border-0 py-2.5 fw-bold text-muted text-uppercase">Tgl Publikasi</th>
                <th className="border-0 py-2.5 text-end pe-3 fw-bold text-muted text-uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center py-5">
                    <Loader2 className="text-primary animate-spin mb-2 mx-auto" size={20} />
                    <div className="text-muted text-[10px]">Memuat berita...</div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-5 text-muted text-[10px]">Belum ada berita.</td>
                </tr>
              ) : data.map((b) => (
                <BeritaRow key={b.id} berita={b} onEdit={handleEditClick} onDelete={handleDelete} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="card-footer bg-white border-top py-2 rounded-bottom-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted text-[9px] fw-medium">
              Total: {meta ? meta.total : '0'}
            </div>
            {renderPagination()}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="modal fade show d-block bg-black/40" style={{ zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered max-w-[320px]">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-0 pb-0 px-3 pt-3">
                <h6 className="modal-title fw-bold text-dark text-[12px]">
                  {isEdit ? "Edit Berita" : "Input Berita"}
                </h6>
                <button onClick={handleCloseForm} className="btn-close shadow-none scale-75" title="Close"></button>
              </div>
              
              <div className="modal-body p-3 pt-2">
                <div className="mb-2">
                  <label className="form-label text-dark mb-1 fw-semibold text-[10px]" htmlFor={judulId}>Judul</label>
                  <input id={judulId} type="text" className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" placeholder="Masukkan judul..." value={formData.judul} onChange={(e) => setFormData({...formData, judul: e.target.value})} />
                  {errors.judul && <div className="text-danger mt-1 text-[8px]">{errors.judul[0]}</div>}
                </div>

                <div className="mb-2">
                  <label className="form-label text-dark mb-1 fw-semibold text-[10px]" htmlFor={tglId}>Tanggal</label>
                  <input id={tglId} type="date" className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" value={formData.tanggal_publikasi} onChange={(e) => setFormData({...formData, tanggal_publikasi: e.target.value})} />
                </div>

                <div className="mb-2">
                  <label className="form-label text-dark mb-1 fw-semibold text-[10px]" htmlFor={isiId}>Isi</label>
                  <textarea id={isiId} rows={3} className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" placeholder="Isi berita..." value={formData.isi_berita} onChange={(e) => setFormData({...formData, isi_berita: e.target.value})} />
                  {errors.isi_berita && <div className="text-danger mt-1 text-[8px]">{errors.isi_berita[0]}</div>}
                </div>

                <div className="mb-2">
                  <label className="form-label text-dark mb-1 fw-semibold text-[10px]" htmlFor={fotoId}>Foto</label>
                  <input id={fotoId} type="file" className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" onChange={(e) => setFormData({...formData, foto: e.target.files ? e.target.files[0] : null})} />
                </div>
              </div>

              <div className="modal-footer border-0 p-3 pt-0">
                <button onClick={handleSave} className="btn btn-primary btn-sm w-100 fw-bold shadow-sm py-2 text-[11px] rounded-3" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : "Simpan Berita"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
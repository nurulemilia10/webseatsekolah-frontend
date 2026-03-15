"use client";

import React, { useState, useEffect, useCallback, useId, memo, useMemo } from 'react';
import { 
  Plus, Edit2, Loader2, Megaphone, Trash2, Calendar
} from 'lucide-react';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/useAuth';

const PengumumanRow = memo(({ pengumuman, onEdit, onDelete }: { pengumuman: any, onEdit: (p: any) => void, onDelete: (id: string) => void }) => (
  <tr>
    <td className="ps-3 py-2">
      <div className="d-flex align-items-center">
        <div className={`p-1.5 rounded-2 me-2 ${pengumuman.penting ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'}`}>
          <Megaphone size={12} />
        </div>
        <div className="text-dark fw-medium text-[11px] text-wrap-custom max-w-title">
          {pengumuman.judul}
          {pengumuman.penting && <span className="ms-1 badge bg-warning text-dark text-[8px] px-1 py-0.5 fw-bold">PENTING</span>}
        </div>
      </div>
    </td>
    <td className="py-2 text-muted text-[10px] d-none d-md-table-cell">
      <div className="d-flex align-items-center">
        <Calendar size={11} className="me-1" />
        {pengumuman.tanggal_human || pengumuman.tanggal_publikasi || '-'}
      </div>
    </td>
    <td className="py-2 text-end pe-3">
      <div className="d-flex justify-content-end gap-1">
        <button onClick={() => onEdit(pengumuman)} className="btn btn-sm p-1 text-primary border-0 shadow-none" title="Edit Pengumuman">
          <span className="bg-light p-1 rounded-3 d-inline-flex"><Edit2 size={11}/></span>
        </button>
        <button onClick={() => onDelete(pengumuman.id)} className="btn btn-sm p-1 text-danger border-0 shadow-none" title="Hapus Pengumuman">
          <span className="bg-danger bg-opacity-10 p-1 rounded-3 d-inline-flex"><Trash2 size={11}/></span>
        </button>
      </div>
    </td>
  </tr>
));

PengumumanRow.displayName = 'PengumumanRow';

export default function ManajemenPengumuman() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ judul: '', isi_pengumuman: '', tanggal_publikasi: '', penting: false });
  const [errors, setErrors] = useState<any>({});

  const judulId = useId();
  const tglId = useId();
  const isiId = useId();
  const pentingId = useId();

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
      const res = await api.admin.pengumuman.getAll({ page });
      if (res?.data) {
        setData(res.data.data || []);
        setMeta(res.data.meta || null);
        setCurrentPage(page);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [authLoading, user]);

  useEffect(() => { fetchData(1); }, [fetchData]);

  const handleCloseForm = useCallback(() => {
    setShowForm(false); setIsEdit(false); setCurrentId(null); setErrors({});
    setFormData({ judul: '', isi_pengumuman: '', tanggal_publikasi: '', penting: false });
  }, []);

  const handleEditClick = useCallback((p: any) => {
    setIsEdit(true); setCurrentId(p.id);
    setFormData({ 
      judul: p.judul || '', 
      isi_pengumuman: p.isi_pengumuman || '', 
      tanggal_publikasi: p.tanggal_publikasi || '', 
      penting: !!p.penting 
    });
    setShowForm(true);
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Pengumuman?',
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
        const res = await api.admin.pengumuman.delete(id);
        if (res.status === 200 || res.data?.success) {
          Toast.fire({ icon: 'success', title: res.data?.message || 'Pengumuman dihapus' });
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
    
    try {
      let res;
      if (isEdit && currentId) {
        res = await api.admin.pengumuman.update(currentId, formData);
      } else {
        res = await api.admin.pengumuman.create(formData);
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
          <Megaphone size={16} className="text-primary me-2" />
          <h6 className="mb-0 fw-bold text-dark text-uppercase text-[12px] tracking-wider">Pengumuman Sekolah</h6>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm px-2 px-md-3 shadow-sm rounded-3 py-1.5 text-[10px]">
          <Plus size={13} className="me-1"/> <span>Tambah Pengumuman</span>
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="text-[9px]">
                <th className="ps-3 border-0 py-2.5 fw-bold text-muted text-uppercase">Judul Pengumuman</th>
                <th className="border-0 py-2.5 fw-bold text-muted text-uppercase d-none d-md-table-cell">Tgl Publikasi</th>
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
                  <td colSpan={3} className="text-center py-5 text-muted text-[10px]">Tidak ada pengumuman.</td>
                </tr>
              ) : data.map((p) => (
                <PengumumanRow key={p.id} pengumuman={p} onEdit={handleEditClick} onDelete={handleDelete} />
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
                    <button className="page-link border rounded-3 mx-1 ui-pagination-square shadow-none" onClick={() => fetchData(meta.current_page - 1)}>&lt;</button>
                  </li>
                  <li className="page-item active">
                    <span className="page-link border rounded-3 mx-1 ui-pagination-square bg-primary text-white border-primary shadow-none">{meta.current_page}</span>
                  </li>
                  <li className={`page-item ${meta.current_page === meta.last_page ? 'disabled' : ''}`}>
                    <button className="page-link border rounded-3 mx-1 ui-pagination-square shadow-none" onClick={() => fetchData(meta.current_page + 1)}>&gt;</button>
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
                  {isEdit ? "Edit Pengumuman" : "Input Pengumuman"}
                </h6>
                <button onClick={handleCloseForm} className="btn-close shadow-none scale-75" aria-label="Close"></button>
              </div>
              <div className="modal-body p-3 pt-2">
                <div className="mb-2">
                  <label className="form-label text-dark mb-1 fw-semibold text-[10px]" htmlFor={judulId}>Judul</label>
                  <input id={judulId} type="text" className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" value={formData.judul} onChange={(e) => setFormData({...formData, judul: e.target.value})} />
                  {errors.judul && <div className="text-danger mt-1 text-[8px]">{errors.judul[0]}</div>}
                </div>
                <div className="mb-2">
                  <label className="form-label text-dark mb-1 fw-semibold text-[10px]" htmlFor={tglId}>Tanggal Publikasi</label>
                  <input id={tglId} type="date" className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" value={formData.tanggal_publikasi} onChange={(e) => setFormData({...formData, tanggal_publikasi: e.target.value})} />
                </div>
                <div className="mb-2">
                  <label className="form-label text-dark mb-1 fw-semibold text-[10px]" htmlFor={isiId}>Isi Pengumuman</label>
                  <textarea id={isiId} rows={4} className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" value={formData.isi_pengumuman} onChange={(e) => setFormData({...formData, isi_pengumuman: e.target.value})} />
                  {errors.isi_pengumuman && <div className="text-danger mt-1 text-[8px]">{errors.isi_pengumuman[0]}</div>}
                </div>
                <div className="mb-2 d-flex align-items-center">
                  <input id={pentingId} type="checkbox" className="form-check-input shadow-none me-2 accent-warning" checked={formData.penting} onChange={(e) => setFormData({...formData, penting: e.target.checked})} />
                  <label className="form-check-label text-dark fw-semibold text-[10px]" htmlFor={pentingId}>Tandai sebagai Penting</label>
                </div>
              </div>
              <div className="modal-footer border-0 p-3 pt-0">
                <button onClick={handleSave} className="btn btn-primary btn-sm w-100 fw-bold shadow-sm py-2 text-[11px] rounded-3" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : (isEdit ? "Update Pengumuman" : "Simpan Pengumuman")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
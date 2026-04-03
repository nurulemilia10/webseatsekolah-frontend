"use client";

import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { 
  Mail, Loader2, Trash2, Eye, Calendar, CheckCircle, MailWarning, ChevronLeft
} from 'lucide-react';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/useAuth';

const PesanRow = memo(({ pesan, onView, onDelete }: { pesan: any, onView: (p: any) => void, onDelete: (id: string) => void }) => (
  <tr>
    <td className="ps-3 py-2">
      <div className="d-flex flex-column">
        <span className="text-dark fw-medium text-[11px]">{pesan.nama_lengkap}</span>
        <span className="text-muted text-[9px]">{pesan.email}</span>
      </div>
    </td>
    <td className="py-2 text-dark text-[11px] d-none d-md-table-cell">
      <div className="text-wrap-custom max-w-title">{pesan.subjek || '-'}</div>
    </td>
    <td className="py-2 d-none d-lg-table-cell">
      {pesan.status === 'sudah_dibaca' ? (
        <span className="badge bg-success bg-opacity-10 text-success fw-medium text-[8px] rounded-pill px-2">Sudah Dibaca</span>
      ) : (
        <span className="badge bg-warning bg-opacity-10 text-warning fw-medium text-[8px] rounded-pill px-2">Belum Dibaca</span>
      )}
    </td>
    <td className="py-2 text-muted text-[10px] d-none d-md-table-cell text-end">
      <div className="d-flex align-items-center justify-content-end">
        <Calendar size={11} className="me-1" />
        {pesan.tanggal_masuk || '-'}
      </div>
    </td>
    <td className="py-2 text-end pe-3">
      <div className="d-flex justify-content-end gap-1">
        <button 
          onClick={() => onView(pesan)} 
          className="btn btn-sm p-1 text-warning border-0 shadow-none" 
          title="Lihat Detail Pesan"
          aria-label="Lihat Detail Pesan"
        >
          <span className="bg-light p-1 rounded-3 d-inline-flex"><Eye size={11}/></span>
        </button>
        <button 
          onClick={() => onDelete(pesan.id)} 
          className="btn btn-sm p-1 text-danger border-0 shadow-none" 
          title="Hapus Pesan"
          aria-label="Hapus Pesan"
        >
          <span className="bg-danger bg-opacity-10 p-1 rounded-3 d-inline-flex"><Trash2 size={11}/></span>
        </button>
      </div>
    </td>
  </tr>
));

PesanRow.displayName = 'PesanRow';

export default function ManajemenPesan() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedPesan, setSelectedPesan] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const res = await api.admin.pesan.getAll({ page });
      if (res?.data) {
        setData(res.data.data || []);
        setMeta(res.data.meta || null);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [authLoading, user]);

  useEffect(() => { fetchData(1); }, [fetchData]);

  const handlePageChange = (page: number) => fetchData(page);

  const handleViewPesan = useCallback(async (p: any) => {
    setSelectedPesan(p);
    setShowDetail(true);

    if (p.status === 'belum_dibaca') {
      setData(prev => prev.map(item => 
        item.id === p.id ? { ...item, status: 'sudah_dibaca' } : item
      ));

      try {
        await api.admin.pesan.show(p.id);
      } catch (e) { 
        console.error(e);
      }
    }
  }, [setData]);

  const handleMarkAllRead = async () => {
    if (data.every(p => p.status === 'sudah_dibaca')) return;
    
    setIsSubmitting(true);
    try {
      const res = await api.admin.pesan.markAllRead();
      if (res.data?.success) {
        Toast.fire({ icon: 'success', title: res.data.message });
        fetchData(meta?.current_page || 1);
      }
    } catch (e) {
      Toast.fire({ icon: 'error', title: 'Gagal memperbarui status' });
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Pesan?',
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
        const res = await api.admin.pesan.delete(id);
        if (res.data?.success) {
          Toast.fire({ icon: 'success', title: res.data.message });
          if (meta) setMeta({ ...meta, total: meta.total - 1 });
        } else { throw new Error(); }
      } catch (e: any) {
        setData(previousData);
        Toast.fire({ icon: 'error', title: e.response?.data?.message || 'Gagal menghapus data' });
      }
    }
  };

  if (authLoading) return null;

  return (
    <div className="container-fluid py-3 px-2 px-md-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <Mail size={16} className="text-warning me-2" />
          <h6 className="mb-0 fw-bold text-dark text-uppercase text-[12px] tracking-wider">Pesan Masuk</h6>
        </div>
        <button 
          onClick={handleMarkAllRead} 
          disabled={isSubmitting || data.length === 0}
          className="btn btn-light btn-sm px-2 px-md-3 shadow-sm rounded-3 py-1.5 text-[10px] text-warning fw-semibold"
        >
          {isSubmitting ? <Loader2 size={13} className="animate-spin"/> : <CheckCircle size={13} className="me-1"/>}
          <span>Tandai Semua Terbaca</span>
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="text-[9px]">
                <th className="ps-3 border-0 py-2.5 fw-bold text-muted text-uppercase">Pengirim</th>
                <th className="border-0 py-2.5 fw-bold text-muted text-uppercase d-none d-md-table-cell">Subjek</th>
                <th className="border-0 py-2.5 fw-bold text-muted text-uppercase d-none d-lg-table-cell">Status</th>
                <th className="border-0 py-2.5 text-end fw-bold text-muted text-uppercase d-none d-md-table-cell">Tanggal</th>
                <th className="border-0 py-2.5 text-end pe-3 fw-bold text-muted text-uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-5">
                    <Loader2 className="text-warning animate-spin mb-2 mx-auto" size={20} />
                    <div className="text-muted text-[10px]">Memuat pesan...</div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-muted text-[10px]">Tidak ada pesan masuk.</td>
                </tr>
              ) : data.map((p) => (
                <PesanRow key={p.id} pesan={p} onView={handleViewPesan} onDelete={handleDelete} />
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
                onClick={() => handlePageChange(meta.current_page - 1)}
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
                        onClick={() => handlePageChange(p)}
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
                onClick={() => handlePageChange(meta.current_page + 1)}
                title="Next"
                aria-label="Next"
              >
                <ChevronLeft size={12} className="rotate-180" />
              </button>
            </nav>
          </div>
        )}
      </div>

      {showDetail && selectedPesan && (
        <div className="modal fade show d-block bg-black/40 z-[1050]">
          <div className="modal-dialog modal-dialog-centered px-3 modal-max-width mx-auto">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="modal-header border-0 pb-0 px-3 pt-3">
                <h6 className="modal-title fw-bold text-dark text-[12px] d-flex align-items-center">
                  <MailWarning size={14} className="me-2 text-warning"/> Detail Pesan
                </h6>
                <button onClick={() => setShowDetail(false)} className="btn-close shadow-none scale-75" title="Tutup" aria-label="Tutup"></button>
              </div>
              <div className="modal-body p-3 pt-2">
                <div className="bg-light p-3 rounded-3 mb-3">
                  <div className="row g-2">
                    <div className="col-4 text-muted text-[10px] fw-semibold text-uppercase">Dari</div>
                    <div className="col-8 text-dark text-[10px] fw-bold">{selectedPesan.nama_lengkap}</div>
                    <div className="col-4 text-muted text-[10px] fw-semibold text-uppercase">Email</div>
                    <div className="col-8 text-dark text-[10px]">{selectedPesan.email}</div>
                    <div className="col-4 text-muted text-[10px] fw-semibold text-uppercase">Subjek</div>
                    <div className="col-8 text-dark text-[10px] fw-bold">{selectedPesan.subjek || '-'}</div>
                    <div className="col-4 text-muted text-[10px] fw-semibold text-uppercase">Waktu</div>
                    <div className="col-8 text-dark text-[10px]">{selectedPesan.tanggal_masuk}</div>
                  </div>
                </div>
                <div className="mb-1 text-muted text-[9px] fw-bold text-uppercase px-1">Isi Pesan:</div>
                <div className="bg-white border rounded-3 p-3 text-[11px] text-dark leading-relaxed min-h-[100px] whitespace-pre-wrap">
                  {selectedPesan.isi_pesan || selectedPesan.pesan}
                </div>
              </div>
              <div className="modal-footer border-0 p-3 pt-0">
                <button onClick={() => setShowDetail(false)} className="btn btn-warning btn-sm w-100 fw-bold shadow-sm py-2 text-[11px] rounded-3">
                  Tutup Pesan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
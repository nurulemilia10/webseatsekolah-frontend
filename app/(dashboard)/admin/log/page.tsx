"use client";

import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  Activity, Loader2, User, Info, Eye, RefreshCw, Search, X
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

const LogDetailModal = ({ log, onClose }: { log: any, onClose: () => void }) => {
  if (!log) return null;
  return (
    <div className="modal fade show d-block bg-black/40 z-[1060]">
      <div className="modal-dialog modal-dialog-centered px-3 modal-md">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header border-0 pb-0 px-4 pt-4 d-flex justify-content-between align-items-center">
            <h6 className="modal-title fw-bold text-dark text-[13px] d-flex align-items-center">
              <span className="me-2 text-primary d-flex align-items-center"><Info size={14} /></span> Rincian Aktivitas
            </h6>
            <button onClick={onClose} className="btn-close shadow-none scale-75" title="Tutup"></button>
          </div>
          <div className="modal-body p-4 pt-3">
            <div className="bg-light rounded-3 p-3 mb-3 border">
              <label className="text-muted text-[9px] text-uppercase fw-bold mb-1 d-block tracking-wider">Aksi / Endpoint</label>
              <div className="text-dark text-[11px] fw-medium break-words leading-relaxed">
                {log.aksi}
              </div>
            </div>
            <div className="row g-3">
              <div className="col-6">
                <label className="text-muted text-[9px] text-uppercase fw-bold mb-1 d-block tracking-wider">IP Address</label>
                <div className="text-dark text-[11px] fw-medium">{log.ip_address}</div>
              </div>
              <div className="col-6">
                <label className="text-muted text-[9px] text-uppercase fw-bold mb-1 d-block tracking-wider">Waktu Kejadian</label>
                <div className="text-dark text-[11px] fw-medium">{log.created_at}</div>
              </div>
              <div className="col-12">
                <label className="text-muted text-[9px] text-uppercase fw-bold mb-1 d-block tracking-wider">Perangkat (User Agent)</label>
                <div className="text-muted text-[10px] break-words bg-white border border-dashed p-2 rounded-2 italic">
                  {log.user_agent}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer border-0 p-3 pt-0">
             <button onClick={onClose} className="btn btn-primary btn-sm w-100 fw-bold rounded-3 text-[11px] py-2 shadow-sm">Tutup Detail</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LogRow = memo(({ log, onShowDetail }: { log: any, onShowDetail: (l: any) => void }) => {
  const formatTanggal = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <tr onClick={() => onShowDetail(log)} className="cursor-pointer border-bottom">
      <td className="ps-3 py-3">
        <div className="d-flex align-items-start">
          <div className="flex-shrink-0 bg-primary bg-opacity-10 d-flex align-items-center justify-content-center rounded-circle border border-primary border-opacity-10 mt-1 w-[32px] h-[32px]">
             <User size={14} className="text-primary" />
          </div>
          <div className="ms-3 flex-grow-1">
            <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-dark fw-bold text-[11px]">
                  {log.user?.guru?.nama || log.user?.username || 'System'}
                </span>
                <span className="text-muted text-[9px] d-md-none bg-light px-2 py-0.5 rounded border">
                   {formatTanggal(log.created_at)}
                </span>
            </div>
            
            <div className="text-muted text-[10px] mb-2 d-md-none fw-medium text-uppercase tracking-tight opacity-75">
                {log.user?.current_role || '-'}
            </div>

            <div className="text-dark text-[10px] leading-normal pe-2 break-words whitespace-normal overflow-visible">
              {log.aksi}
            </div>
          </div>
        </div>
      </td>
      <td className="py-3 d-none d-md-table-cell">
        <div className="text-muted text-[10px] fw-medium uppercase">
          {log.user?.current_role || '-'}
        </div>
      </td>
      <td className="py-3 d-none d-md-table-cell text-nowrap">
        <div className="text-dark text-[10px] fw-medium">
          {formatTanggal(log.created_at)}
        </div>
      </td>
      <td className="py-3 text-end pe-3 align-middle">
         <button className="btn btn-sm p-2 text-primary border-0 shadow-none bg-primary bg-opacity-10 rounded-circle" title="Lihat Detail">
            <Eye size={14} />
         </button>
      </td>
    </tr>
  );
});

LogRow.displayName = 'LogRow';

export default function LogAktivitas() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchData = useCallback(async (page = 1, search = '', date = '') => {
    if (authLoading || !user) return;
    setLoading(true);
    try {
      const res = await api.admin.getLogAktivitas({ page, search, date });
      if (res?.data) {
        setData(res.data.data || []);
        setMeta(res.data.meta || null);
      }
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  }, [authLoading, user]);

  useEffect(() => {
    fetchData(1, debouncedSearch, filterDate);
  }, [debouncedSearch, filterDate, fetchData]);

  const handleReset = () => {
    setSearchTerm('');
    setFilterDate('');
  };

  if (authLoading) return null;

  return (
    <div className="container-fluid py-3 px-2 px-md-3">
      <div className="d-flex flex-column mb-3 gap-2">
        <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
                <Activity size={16} className="text-primary me-2" />
                <h6 className="mb-0 fw-bold text-dark text-uppercase text-[11px] tracking-wider">Riwayat Sistem</h6>
            </div>
            <button onClick={() => fetchData(1, searchTerm, filterDate)} className="btn btn-white btn-sm border shadow-none rounded-3 py-1 px-3 d-flex align-items-center text-[10px]" title="Muat Ulang">
                <RefreshCw size={10} className={`me-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
        </div>
        
        <div className="row g-2">
            <div className="col-12 col-sm">
                <div className="position-relative">
                    <Search className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" size={10} />
                    <input 
                      type="text" 
                      className="form-control form-control-sm ps-4 shadow-none border rounded-3 text-[10px] py-1.5" 
                      placeholder="Cari kata kunci..."
                      title="Cari kata kunci"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="col col-sm-auto">
                <div className="position-relative">
                    <input 
                      type="date" 
                      className="form-control form-control-sm px-2 shadow-none border rounded-3 text-[10px] py-1.5 w-full min-w-[105px]" 
                      title="Filter berdasarkan tanggal"
                      placeholder="Pilih tanggal"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                    />
                </div>
            </div>
            <div className="col-auto">
                <button onClick={handleReset} className="btn btn-light btn-sm border shadow-none rounded-3 py-1.5 px-2 h-full d-flex align-items-center" title="Reset Filter">
                    <X size={12} />
                </button>
            </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive max-h-[calc(100vh-250px)]">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light sticky-top z-10 d-none d-md-table-header-group">
              <tr className="text-[9px]">
                <th className="ps-3 border-0 py-2.5 fw-bold text-muted text-uppercase">Aktivitas & Pengguna</th>
                <th className="border-0 py-2.5 fw-bold text-muted text-uppercase">Role</th>
                <th className="border-0 py-2.5 fw-bold text-muted text-uppercase">Tanggal</th>
                <th className="border-0 py-2.5 text-end pe-3 fw-bold text-muted text-uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-5">
                    <Loader2 className="text-primary animate-spin mb-2 mx-auto" size={20} />
                    <div className="text-muted text-[10px]">Memuat log...</div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-5 text-muted text-[10px]">
                    Tidak ada riwayat aktivitas ditemukan.
                  </td>
                </tr>
              ) : data.map((log) => (
                <LogRow key={log.id} log={log} onShowDetail={setSelectedLog} />
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="card-footer bg-white border-top py-2 px-3 rounded-bottom-4">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted text-[9px] fw-bold">
              {meta?.total || 0} TOTAL DATA
            </div>
            {meta && meta.last_page > 1 && (
              <div className="d-flex gap-1 align-items-center">
                  <button className="btn btn-xs btn-light border py-1 px-2 rounded-2" 
                          disabled={meta.current_page === 1} 
                          title="Halaman Sebelumnya"
                          onClick={() => fetchData(meta.current_page - 1, debouncedSearch, filterDate)}>&lt;</button>
                  <span className="text-[9px] fw-bold mx-1">{meta.current_page} / {meta.last_page}</span>
                  <button className="btn btn-xs btn-light border py-1 px-2 rounded-2" 
                          disabled={meta.current_page === meta.last_page} 
                          title="Halaman Berikutnya"
                          onClick={() => fetchData(meta.current_page + 1, debouncedSearch, filterDate)}>&gt;</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedLog && <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  );
}
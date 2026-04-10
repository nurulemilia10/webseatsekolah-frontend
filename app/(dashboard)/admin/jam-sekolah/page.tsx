"use client";

import React, { useState, useEffect, useCallback, useId, memo, useMemo } from 'react';
import { 
  Plus, Edit2, Loader2, Clock, Trash2, FileDown, FileUp, Filter, ChevronLeft, Calendar, Eye, XCircle, AlertCircle, CheckCircle2
} from 'lucide-react';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/useAuth';
import { fileHelper } from '@/lib/file-helper';

const JamSekolahRow = memo(({ 
  item, 
  onEdit, 
  onDelete, 
  isSelected, 
  onSelect 
}: { 
  item: any, 
  onEdit: (i: any) => void, 
  onDelete: (id: string) => void,
  isSelected: boolean,
  onSelect: (id: string) => void 
}) => (
  <tr>
    <td className="ps-3 py-2">
      <input 
        type="checkbox" 
        className="form-check-input border-secondary shadow-none cursor-pointer" 
        checked={isSelected}
        onChange={() => onSelect(item.id)}
        aria-label={`Pilih jam ke-${item.jam_ke} hari ${item.hari}`}
      />
    </td>
    <td className="py-2">
      <div className="d-flex align-items-center">
        <div className="flex-shrink-0 bg-light rounded p-1.5 d-flex align-items-center justify-content-center">
          <Clock size={13} className="text-warning" />
        </div>
        <div className="ms-2">
          <div className="text-dark fw-bold text-sm-custom mb-0">{item.hari}</div>
          <div className="text-muted text-xxs d-flex align-items-center">
            <Calendar size={10} className="me-1" />
            {item.semester?.tahun_ajaran?.nama || '-'}
          </div>
        </div>
      </div>
    </td>
    <td className="py-2 text-dark fw-bold text-xs-custom text-center">
      {item.jam_ke || '-'}
    </td>
    <td className="py-2 text-muted text-xs-custom d-none d-md-table-cell">
      <div className="d-flex align-items-center gap-1">
        <span className="badge bg-light text-dark border fw-normal">{item.waktu_mulai}</span>
        <span>-</span>
        <span className="badge bg-light text-dark border fw-normal">{item.waktu_selesai}</span>
      </div>
    </td>
    <td className="py-2 text-muted text-xs-custom d-none d-md-table-cell">
      <span className={`badge ${item.jenis === 'Pelajaran' ? 'bg-warning text-dark' : 'bg-warning text-dark'} bg-opacity-10 border-0 text-xxs`}>
        {item.jenis}
      </span>
    </td>
    <td className="py-2 text-muted text-xs-custom d-none d-md-table-cell italic">
      {item.keterangan || '-'}
    </td>
    <td className="py-2 text-end pe-3">
      <div className="d-flex justify-content-end gap-1">
        <button 
          onClick={() => onEdit(item)} 
          className="btn btn-sm p-1 text-warning border-0 shadow-none"
          title="Edit Data"
          aria-label="Edit Data"
        >
          <span className="bg-light p-1 rounded-3 d-inline-flex"><Edit2 size={11}/></span>
        </button>
        <button 
          onClick={() => onDelete(item.id)} 
          className="btn btn-sm p-1 text-danger border-0 shadow-none"
          title="Hapus Data"
          aria-label="Hapus Data"
        >
          <span className="bg-danger bg-opacity-10 p-1 rounded-3 d-inline-flex"><Trash2 size={11}/></span>
        </button>
      </div>
    </td>
  </tr>
));

JamSekolahRow.displayName = 'JamSekolahRow';

export default function ManajemenJamSekolah() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [filterTahunAjaranId, setFilterTahunAjaranId] = useState<string>('');
  const [filterSemesterId, setFilterSemesterId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [importFile, setImportFile] = useState<FormData | null>(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10
  });

  const [formData, setFormData] = useState({ 
    hari: 'Senin', 
    jam_ke: '', 
    waktu_mulai: '', 
    waktu_selesai: '',
    jenis: 'Pelajaran',
    keterangan: ''
  });

  const hariId = useId();
  const jamKeId = useId();
  const mulaiId = useId();
  const selesaiId = useId();
  const jenisId = useId();
  const ketId = useId();
  const taFilterId = useId();
  const semFilterId = useId();

  const Toast = useMemo(() => Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  }), []);

  const hasError = useMemo(() => {
    if (!previewData) return false;
    return previewData.some(p => !p.is_valid);
  }, [previewData]);

  const tahunAjarans = useMemo(() => {
    const map = new Map();
    semesters.forEach(s => {
      if (s.tahun_ajaran) map.set(s.tahun_ajaran.id, s.tahun_ajaran);
    });
    return Array.from(map.values());
  }, [semesters]);

  const filteredSemesterOptions = useMemo(() => {
    if (!filterTahunAjaranId) return [];
    return semesters.filter(s => s.tahun_ajaran_id.toString() === filterTahunAjaranId);
  }, [semesters, filterTahunAjaranId]);

  const fetchData = useCallback(async (sId = filterSemesterId, page = 1) => {
    if (authLoading || !user) return;
    setLoading(true);
    try {
      const res = await api.admin.jamSekolah.getAll({ 
        semester_id: sId,
        page: page,
        per_page: pagination.perPage
      });
      if (res?.data) {
        setData(res.data.data || []);
        setSelectedIds([]);
        if (res.data.meta) {
          setPagination(prev => ({
            ...prev,
            currentPage: res.data.meta.current_page,
            lastPage: res.data.meta.last_page,
            total: res.data.meta.total,
          }));
          
          if (res.data.meta.filter_semester_id && !sId && !filterTahunAjaranId) {
            const activeSem = semesters.find(s => s.id == res.data.meta.filter_semester_id);
            if (activeSem) {
              setFilterTahunAjaranId(activeSem.tahun_ajaran_id.toString());
              setFilterSemesterId(activeSem.id.toString());
            }
          }
        }
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [authLoading, user, filterSemesterId, filterTahunAjaranId, pagination.perPage, semesters]);

  useEffect(() => {
    const init = async () => {
      const res = await api.admin.semester.getAll();
      if (res?.data?.data) setSemesters(res.data.data);
    };
    init();
  }, []);

  useEffect(() => {
    if (semesters.length > 0) {
      if (!filterTahunAjaranId && !filterSemesterId) {
        fetchData();
      } else if (filterTahunAjaranId && filterSemesterId) {
        fetchData();
      }
    }
  }, [semesters.length, fetchData, filterSemesterId, filterTahunAjaranId]);

  const handlePageChange = (page: number) => {
    fetchData(filterSemesterId, page);
  };

  const handleSelectOne = useCallback((id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  const handleSelectAll = useCallback(() => {
    if (data.length > 0 && selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map(i => i.id));
    }
  }, [data, selectedIds]);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const result = await Swal.fire({
      title: `Hapus ${selectedIds.length} Data?`,
      text: "Data yang dipilih akan dihapus secara permanen.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus Semua!',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      Swal.fire({ title: 'Menghapus...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        await api.admin.jamSekolah.bulkDelete(selectedIds);
        Toast.fire({ icon: 'success', title: 'Berhasil menghapus massal' });
        fetchData(filterSemesterId, 1);
      } catch (e: any) {
        Toast.fire({ icon: 'error', title: 'Gagal hapus massal' });
      } finally {
        Swal.close();
      }
    }
  };

  const handleCloseForm = useCallback(() => {
    setShowForm(false); 
    setIsEdit(false); 
    setCurrentId(null); 
    setFormData({ 
      hari: 'Senin', 
      jam_ke: '', 
      waktu_mulai: '', 
      waktu_selesai: '', 
      jenis: 'Pelajaran', 
      keterangan: '' 
    });
  }, []);

  const handleEditClick = useCallback((item: any) => {
    setIsEdit(true); 
    setCurrentId(item.id);
    setFormData({ 
      hari: item.hari || 'Senin', 
      jam_ke: item.jam_ke?.toString() || '', 
      waktu_mulai: item.waktu_mulai || '', 
      waktu_selesai: item.waktu_selesai || '',
      jenis: item.jenis || 'Pelajaran',
      keterangan: item.keterangan || ''
    });
    setShowForm(true);
  }, []);

  const handleExport = async () => {
    if (!filterSemesterId) {
      Toast.fire({ icon: 'warning', title: 'Pilih semester terlebih dahulu' });
      return;
    }
    try {
      const res = await api.admin.jamSekolah.export({ semester_id: filterSemesterId });
      const activeSem = semesters.find(s => s.id.toString() === filterSemesterId);
      const semLabel = activeSem ? activeSem.nama.replace(/\s+/g, '_').toUpperCase() : filterSemesterId;
      fileHelper.download(res, `JAM_SEKOLAH_${semLabel}.xlsx`);
      Toast.fire({ icon: 'success', title: 'Berhasil diekspor' });
    } catch (e) { Toast.fire({ icon: 'error', title: 'Gagal ekspor' }); }
  };

  const handleImportRequest = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fData = fileHelper.prepareImport(e);
    if (!fData) return;
    Swal.fire({ title: 'Membaca File...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await api.admin.jamSekolah.importPreview(fData);
      if (res.data?.data) {
        setPreviewData(res.data.data);
        setImportFile(fData);
        Swal.close();
      }
    } catch (e: any) {
      Swal.close();
      Toast.fire({ icon: 'error', title: e.response?.data?.message || 'Gagal membaca file' });
    } finally { e.target.value = ''; }
  };

  const confirmImport = async () => {
    if (!importFile || hasError) return;
    setIsSubmitting(true);
    Swal.fire({ title: 'Mengimpor Data...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await api.admin.jamSekolah.import(importFile);
      if (res.data?.success) {
        Swal.close();
        Toast.fire({ icon: 'success', title: 'Berhasil diimpor' });
        setPreviewData(null);
        setImportFile(null);
        fetchData(filterSemesterId, 1);
      }
    } catch (e: any) {
      Swal.close();
      Toast.fire({ icon: 'error', title: e.response?.data?.message || 'Gagal impor' });
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Jam?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });
    if (result.isConfirmed) {
      try {
        await api.admin.jamSekolah.delete(id);
        fetchData(filterSemesterId, pagination.currentPage);
        Toast.fire({ icon: 'success', title: 'Berhasil dihapus' });
      } catch (e: any) {
        Toast.fire({ icon: 'error', title: 'Gagal menghapus' });
      }
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        ...(filterSemesterId && !isEdit ? { semester_id: filterSemesterId } : {})
      };
      const res = isEdit && currentId ? await api.admin.jamSekolah.update(currentId, payload) : await api.admin.jamSekolah.create(payload);
      if (res.status < 300 || res.data?.success) { 
        Toast.fire({ icon: 'success', title: 'Berhasil disimpan' });
        handleCloseForm(); 
        fetchData(filterSemesterId, 1); 
      }
    } catch (e: any) { 
      Toast.fire({ icon: 'error', title: e.response?.data?.message || 'Kesalahan sistem' });
    } finally { setIsSubmitting(false); }
  };

  const handleTahunAjaranChange = (newTaId: string) => {
    setFilterTahunAjaranId(newTaId);
    const semsForTa = semesters.filter(s => String(s.tahun_ajaran_id) === newTaId);
    if (semsForTa.length > 0) {
      const newSemId = String(semsForTa[0].id);
      setFilterSemesterId(newSemId);
      fetchData(newSemId, 1);
    } else {
      setFilterSemesterId('');
    }
  };

  if (authLoading) return null;

  return (
    <div className="container-fluid py-3 px-2 px-md-3">
      <style jsx global>{`
        .max-h-300 { max-height: 300px; }
        .z-modal-preview { z-index: 1070; }
        .z-modal-form { z-index: 1100; }
        .w-40px { width: 40px; }
        .badge-pelajaran { background-color: rgba(255, 193, 7, 0.15); color: #856404; }
        .badge-istirahat { background-color: rgba(255, 193, 7, 0.15); color: #856404; }
        .badge-kegiatan { background-color: rgba(25, 135, 84, 0.1); color: #198754; }
        .text-9px { font-size: 9px; }
        .text-11px { font-size: 11px; }
      `}</style>
      <div className="card border-0 shadow-sm rounded-3 mb-3">
        <div className="card-body p-2 p-md-3">
          <div className="d-flex flex-column flex-md-row align-items-md-center gap-3">
            <div className="d-flex align-items-center">
              <Clock size={16} className="text-warning me-2" />
              <h6 className="mb-0 fw-bold text-dark text-uppercase text-md-custom">Jam Sekolah</h6>
            </div>
            
            <div className="d-flex flex-wrap align-items-center gap-2 ms-auto justify-content-end w-100 w-md-auto">
              <div className="d-flex align-items-center gap-2">
                <div className="position-relative">
                  <Calendar size={12} className="position-absolute top-50 start-0 ms-2 translate-middle-y text-muted" />
                  <select 
                    id={taFilterId}
                    className="form-select form-select-sm ps-4 border-0 bg-light text-xs-custom rounded-3 fw-medium w-[120px] w-md-[150px] shadow-none"
                    value={filterTahunAjaranId}
                    onChange={(e) => handleTahunAjaranChange(e.target.value)}
                    aria-label="Filter Tahun Ajaran"
                    title="Pilih Tahun Ajaran"
                  >
                    {tahunAjarans.map(ta => <option key={ta.id} value={ta.id}>{ta.nama}</option>)}
                  </select>
                </div>

                <div className="position-relative">
                  <Filter size={12} className="position-absolute top-50 start-0 ms-2 translate-middle-y text-muted" />
                  <select 
                    id={semFilterId}
                    className="form-select form-select-sm ps-4 border-0 bg-light text-xs-custom rounded-3 fw-medium w-[110px] w-md-[130px] shadow-none"
                    value={filterSemesterId}
                    disabled={!filterTahunAjaranId || filteredSemesterOptions.length === 0}
                    onChange={(e) => {
                      const newId = e.target.value;
                      setFilterSemesterId(newId);
                      if (newId) fetchData(newId, 1);
                    }}
                    aria-label="Filter Semester"
                    title="Pilih Semester"
                  >
                    {filteredSemesterOptions.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                  </select>
                </div>
              </div>

              <div className="vr d-none d-md-block mx-1"></div>

              <div className="d-flex gap-1">
                <button onClick={handleExport} className="btn btn-success btn-sm px-2 shadow-sm rounded-3 py-1.5 border-0 d-flex align-items-center gap-1 text-xs-custom" title="Export Excel" aria-label="Export Data ke Excel">
                  <FileDown size={13}/>
                  <span className="d-none d-lg-inline">Export</span>
                </button>
                <label className="btn btn-light btn-sm px-2 shadow-sm rounded-3 py-1.5 cursor-pointer mb-0 border d-flex align-items-center gap-1 text-xs-custom" title="Import Excel" aria-label="Import Data dari Excel">
                  <FileUp size={13}/>
                  <span className="d-none d-lg-inline">Import</span>
                  <input type="file" className="d-none" accept=".xlsx, .xls, .csv" onChange={handleImportRequest} />
                </label>
                <button onClick={() => setShowForm(true)} className="btn btn-warning btn-sm px-2 shadow-sm rounded-3 py-1.5 d-flex align-items-center gap-1 text-xs-custom" title="Tambah Data Baru" aria-label="Tambah Data Baru">
                  <Plus size={13}/>
                  <span>Tambah</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <button 
            onClick={handleBulkDelete}
            className="btn btn-danger btn-sm px-3 py-2 rounded-3 shadow-sm border-0 d-flex align-items-center gap-2 text-xs-custom fw-bold"
            title={`Hapus ${selectedIds.length} data terpilih`}
            aria-label={`Hapus ${selectedIds.length} data terpilih`}
          >
            <Trash2 size={14} />
            Hapus ({selectedIds.length})
          </button>
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="text-xxs">
                <th className="ps-3 border-0 py-2.5 w-40px">
                  <input 
                    type="checkbox" 
                    className="form-check-input border-secondary shadow-none m-0 cursor-pointer" 
                    checked={data.length > 0 && selectedIds.length === data.length}
                    onChange={handleSelectAll}
                    aria-label="Pilih semua data di halaman ini"
                    title="Pilih Semua"
                  />
                </th>
                <th className="border-0 py-2.5 fw-bold text-muted text-uppercase">Hari</th>
                <th className="border-0 py-2.5 fw-bold text-muted text-uppercase text-center">Ke-</th>
                <th className="border-0 py-2.5 fw-bold text-muted text-uppercase d-none d-md-table-cell">Waktu</th>
                <th className="border-0 py-2.5 fw-bold text-muted text-uppercase d-none d-md-table-cell">Jenis</th>
                <th className="border-0 py-2.5 fw-bold text-muted text-uppercase d-none d-md-table-cell">Keterangan</th>
                <th className="border-0 py-2.5 text-end pe-3 fw-bold text-muted text-uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-5"><Loader2 className="text-warning animate-spin mx-auto" size={20} /></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-5 text-muted text-xs-custom">Tidak ada data.</td></tr>
              ) : data.map((item) => (
                <JamSekolahRow 
                  key={item.id} 
                  item={item} 
                  onEdit={handleEditClick} 
                  onDelete={handleDelete}
                  isSelected={selectedIds.includes(item.id)}
                  onSelect={handleSelectOne}
                />
              ))}
            </tbody>
          </table>
        </div>
        
        {!loading && data.length > 0 && (
          <div className="d-flex justify-content-between align-items-center px-3 py-2 border-top bg-white">
            <div className="text-muted text-[9px] fw-medium">
              Menampilkan {data.length} dari {pagination.total} data
            </div>
            <nav className="d-flex align-items-center gap-1">
              <button
                className="btn btn-light btn-sm border shadow-none p-1 rounded-2"
                disabled={pagination.currentPage === 1}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                title="Previous"
                aria-label="Previous"
              >
                <ChevronLeft size={12} />
              </button>
              <div className="d-flex gap-1">
                {(() => {
                  const pages = [];
                  const cp = pagination.currentPage;
                  const lp = Math.max(1, pagination.lastPage);
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
                disabled={pagination.currentPage === pagination.lastPage}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                title="Next"
                aria-label="Next"
              >
                <ChevronLeft size={12} className="rotate-180" />
              </button>
            </nav>
          </div>
        )}
      </div>

      {previewData && previewData.length > 0 && (
        <div className="modal fade show d-block bg-transparent z-modal-preview">
          <div className="modal-dialog modal-lg modal-dialog-centered px-3">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-0 pb-0 px-3 pt-3">
                <div className="d-flex align-items-center">
                  <Eye size={16} className="text-warning me-2" />
                  <h6 className="modal-title fw-bold text-dark text-md-custom">Preview Import Jam Sekolah</h6>
                </div>
                <button onClick={() => setPreviewData(null)} className="btn-close scale-75 shadow-none" aria-label="Tutup preview" title="Tutup"></button>
              </div>
              <div className="modal-body p-3">
                <div className={`alert ${hasError ? 'alert-danger' : 'alert-light bg-light'} border-0 rounded-3 py-2 px-3 mb-3`}>
                  <div className="d-flex align-items-center gap-2">
                    {hasError ? <XCircle size={14} className="text-danger" /> : <AlertCircle size={14} className="text-muted" />}
                    <span className={`text-xxs fw-bold ${hasError ? 'text-danger' : 'text-muted'}`}>
                      {hasError 
                        ? 'Terdapat data error. Mohon perbaiki file Anda.' 
                        : `${previewData.length} baris data siap diimpor.`}
                    </span>
                  </div>
                </div>
                
                <div className="table-responsive border rounded-3 max-h-300">
                  <table className="table table-sm table-hover mb-0">
                    <thead className="bg-light sticky-top">
                      <tr className="text-xxs">
                        <th className="py-2 ps-3 border-0">Hari</th>
                        <th className="py-2 text-center border-0">Ke-</th>
                        <th className="py-2 border-0">Waktu</th>
                        <th className="py-2 border-0">Jenis</th>
                        <th className="py-2 border-0">Keterangan</th>
                        <th className="py-2 pe-3 border-0">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="text-11px">
                      {previewData.map((p, idx) => {
                        const rowErrors = p.errors || [];
                        const isInvalid = !p.is_valid;
                        const hasHariError = rowErrors.some((e: string) => e.toLowerCase().includes('hari'));
                        const hasJamError = rowErrors.some((e: string) => e.toLowerCase().includes('jam ke') || e.toLowerCase().includes('duplikat') || e.toLowerCase().includes('sudah ada'));
                        const hasWaktuError = rowErrors.some((e: string) => e.toLowerCase().includes('waktu'));
                        const hasJenisError = rowErrors.some((e: string) => e.toLowerCase().includes('jenis'));
                        
                        return (
                           <tr key={idx} className={isInvalid ? 'bg-danger bg-opacity-10' : ''}>
                              <td className={`ps-3 py-[6px] ${hasHariError ? 'bg-danger bg-opacity-25 text-danger fw-bold' : ''}`}>
                                  <div className="d-flex align-items-center gap-1">
                                      {p.hari || '-'}
                                      {hasHariError && <XCircle size={10} className="text-danger" />}
                                  </div>
                              </td>
                              <td className={`py-[6px] text-center ${hasJamError ? 'bg-danger bg-opacity-25 text-danger fw-bold' : ''}`}>
                                  {p.jam_ke || '-'}
                              </td>
                              <td className={`py-[6px] ${hasWaktuError ? 'bg-danger bg-opacity-25 text-danger fw-bold' : 'text-muted'}`}>
                                  {p.waktu_mulai || '-'} - {p.waktu_selesai || '-'}
                              </td>
                              <td className={`py-[6px] ${hasJenisError ? 'bg-danger bg-opacity-25' : ''}`}>
                                  <span className={`badge ${p.jenis === 'Pelajaran' ? 'badge-pelajaran' : p.jenis === 'Istirahat' ? 'badge-istirahat' : 'badge-kegiatan'} ${hasJenisError ? 'border border-danger' : ''}`}>
                                      {p.jenis || '-'}
                                  </span>
                              </td>
                              <td className="py-[6px] text-muted italic">
                                  {p.keterangan || '-'}
                              </td>
                               <td className="py-[6px] pe-3 text-9px">
                                  {rowErrors.length > 0 && (
                                    <div className="text-danger">
                                        {rowErrors.map((err: string, ei: number) => (
                                          <div key={ei}>{err}</div>
                                        ))}
                                    </div>
                                  )}
                               </td>
                            </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer border-0 p-3 pt-0">
                  <div className="row w-100 g-2">
                  <div className="col-6">
                    <button onClick={() => setPreviewData(null)} className="btn btn-light btn-sm w-100 py-2 rounded-3 fw-bold text-muted border text-11px" aria-label="Batal impor" title="Batal">Batal</button>
                  </div>
                  <div className="col-6">
                    <button 
                      onClick={confirmImport} 
                      className={`btn btn-warning btn-sm w-100 py-2 rounded-3 shadow-none fw-bold d-flex align-items-center justify-content-center gap-2 text-11px ${hasError ? 'opacity-50 cursor-not-allowed' : ''}`} 
                      disabled={isSubmitting || hasError}
                      aria-label="Konfirmasi impor"
                      title="Konfirmasi"
                    >
                      {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <><CheckCircle2 size={12} /> Konfirmasi</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal fade show d-block bg-transparent z-modal-form">
          <div className="modal-dialog modal-dialog-centered px-3">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-0 pb-0 px-3 pt-3">
                <h6 className="modal-title fw-bold text-dark text-md-custom">{isEdit ? "Edit Jam" : "Tambah Jam"}</h6>
                <button onClick={handleCloseForm} className="btn-close scale-75 shadow-none" aria-label="Tutup Form" title="Tutup"></button>
              </div>
              <div className="modal-body p-3">
                <div className="row g-2">
                  <div className="col-8">
                    <label className="form-label text-xs-custom fw-semibold" htmlFor={hariId}>Hari</label>
                    <select id={hariId} className="form-select bg-light border-0 py-1.5 text-xs-custom rounded-3 shadow-none" value={formData.hari} onChange={(e) => setFormData({...formData, hari: e.target.value})} aria-label="Pilih Hari" title="Pilih Hari">
                      {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div className="col-4">
                    <label className="form-label text-xs-custom fw-semibold" htmlFor={jamKeId}>Jam Ke-</label>
                    <input id={jamKeId} type="number" className="form-control bg-light border-0 py-1.5 text-xs-custom rounded-3 shadow-none" value={formData.jam_ke} onChange={(e) => setFormData({...formData, jam_ke: e.target.value})} aria-label="Masukkan Jam Ke" title="Jam Ke" />
                  </div>
                </div>
                <div className="row g-2 mt-1">
                  <div className="col-6">
                    <label className="form-label text-xs-custom fw-semibold" htmlFor={mulaiId}>Mulai</label>
                    <input id={mulaiId} type="time" className="form-control bg-light border-0 py-1.5 text-xs-custom rounded-3 shadow-none" value={formData.waktu_mulai} onChange={(e) => setFormData({...formData, waktu_mulai: e.target.value})} aria-label="Waktu Mulai" title="Waktu Mulai" />
                  </div>
                  <div className="col-6">
                    <label className="form-label text-xs-custom fw-semibold" htmlFor={selesaiId}>Selesai</label>
                    <input id={selesaiId} type="time" className="form-control bg-light border-0 py-1.5 text-xs-custom rounded-3 shadow-none" value={formData.waktu_selesai} onChange={(e) => setFormData({...formData, waktu_selesai: e.target.value})} aria-label="Waktu Selesai" title="Waktu Selesai" />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="form-label text-xs-custom fw-semibold" htmlFor={jenisId}>Jenis</label>
                  <select id={jenisId} className="form-select bg-light border-0 py-1.5 text-xs-custom rounded-3 shadow-none" value={formData.jenis} onChange={(e) => setFormData({...formData, jenis: e.target.value})} aria-label="Pilih Jenis" title="Pilih Jenis">
                    <option value="Pelajaran">Pelajaran</option>
                    <option value="Istirahat">Istirahat</option>
                    <option value="Upacara">Upacara</option>
                    <option value="Kegiatan">Kegiatan</option>
                  </select>
                </div>
                <div className="mt-2">
                  <label className="form-label text-xs-custom fw-semibold" htmlFor={ketId}>Keterangan</label>
                  <input id={ketId} type="text" className="form-control bg-light border-0 py-1.5 text-xs-custom rounded-3 shadow-none" value={formData.keterangan} onChange={(e) => setFormData({...formData, keterangan: e.target.value})} placeholder="Opsional" aria-label="Masukkan Keterangan" title="Keterangan" />
                </div>
              </div>
              <div className="modal-footer border-0 p-3 pt-0">
                <button onClick={handleSave} className="btn btn-warning btn-sm w-100 py-2 text-sm-custom rounded-3 shadow-none" disabled={isSubmitting} aria-label={isEdit ? "Perbarui data jam" : "Simpan data jam"} title={isEdit ? "Perbarui" : "Simpan"}>
                  {isSubmitting ? <Loader2 size={12} className="animate-spin mx-auto" /> : (isEdit ? "Update" : "Simpan")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
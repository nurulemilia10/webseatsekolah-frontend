"use client";

import React, { useState, useEffect, useCallback, useId, memo, useMemo } from 'react';
import { 
  Plus, Edit2, Loader2, BookOpen, Trash2, FileDown, FileUp, ChevronLeft, ChevronRight, Eye, Search, Filter, RefreshCw, CheckCircle2, AlertCircle, XCircle
} from 'lucide-react';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/useAuth';
import { fileHelper } from '@/lib/file-helper';

const MapelRow = memo(({ 
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
    <td className="ps-3 py-2 text-center w-[40px]">
      <input 
        type="checkbox" 
        className="form-check-input border-secondary shadow-none cursor-pointer" 
        checked={isSelected}
        onChange={() => onSelect(item.id)}
        aria-label={`Pilih ${item.nama_mapel}`}
      />
    </td>
    <td className="py-2">
      <div className="d-flex align-items-center">
        <div className="flex-shrink-0 bg-light rounded p-[6px] d-flex align-items-center justify-content-center">
          <BookOpen size={13} className="text-primary" />
        </div>
        <div className="ms-2">
          <div className="text-dark fw-bold text-sm-custom mb-0">{item.nama_mapel}</div>
          <div className="text-muted text-xxs italic">
            {item.jurusan?.nama_jurusan || item.jurusan || 'Semua Jurusan'}
          </div>
        </div>
      </div>
    </td>
    <td className="py-2 text-muted text-xs-custom d-none d-md-table-cell text-center text-capitalize">
      {item.kategori_mapel || '-'}
    </td>
    <td className="py-2 text-center">
      {item.is_active ? (
        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 fw-medium text-xxs px-2 py-1 rounded-pill">
          Aktif
        </span>
      ) : (
        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 fw-medium text-xxs px-2 py-1 rounded-pill">
          Non-Aktif
        </span>
      )}
    </td>
    <td className="py-2 text-end pe-3">
      <div className="d-flex justify-content-end gap-1">
        <button onClick={() => onEdit(item)} className="btn btn-sm p-1 text-primary border-0 shadow-none" title="Edit Data">
          <span className="bg-light p-1 rounded-3 d-inline-flex"><Edit2 size={11}/></span>
        </button>
        <button onClick={() => onDelete(item.id)} className="btn btn-sm p-1 text-danger border-0 shadow-none" title="Hapus Data">
          <span className="bg-danger bg-opacity-10 p-1 rounded-3 d-inline-flex"><Trash2 size={11}/></span>
        </button>
      </div>
    </td>
  </tr>
));

MapelRow.displayName = 'MapelRow';

export default function ManajemenMataPelajaran() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [jurusans, setJurusans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [importFile, setImportFile] = useState<FormData | null>(null);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    jurusan_id: '',
    kategori_mapel: '',
    is_active: '1'
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10
  });

  const [formData, setFormData] = useState({ 
    nama_mapel: '', 
    jurusan_id: '', 
    kategori_mapel: 'adaptif',
    tipe_mapel: 'umum',
    is_active: true
  });

  const namaId = useId();
  const jurusanId = useId();
  const kategoriId = useId();
  const tipeId = useId();
  
  const filterJurusanId = useId();
  const filterKategoriId = useId();
  const filterStatusId = useId();

  const processedPreviewData = useMemo(() => {
    if (!previewData) return [];
    return previewData.map(item => {
      const hasConflict = !item.jurusan_found || item.is_duplicate_internal || item.is_duplicate_database;
      return { ...item, hasConflict };
    });
  }, [previewData]);

  const hasImportConflict = useMemo(() => {
    return processedPreviewData.some(item => item.hasConflict);
  }, [processedPreviewData]);

  const Toast = useMemo(() => Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  }), []);

  const fetchJurusans = useCallback(async () => {
    try {
      const res = await api.admin.jurusan.getAll({ paginate: 0 });
      setJurusans(res.data?.data || res.data || []);
    } catch (e) { console.error(e); }
  }, []);

  const fetchData = useCallback(async (page = 1) => {
    if (authLoading || !user) return;
    setLoading(true);
    try {
      const params = {
        page,
        per_page: pagination.perPage,
        search: search,
        ...filters
      };
      const res = await api.admin.mapel.getAll(params);
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
        }
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [authLoading, user, search, pagination.perPage, filters]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData(1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, filters, fetchData]);

  useEffect(() => {
    fetchJurusans();
  }, [fetchJurusans]);

  const handlePageChange = (page: number) => fetchData(page);

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
      title: `Hapus ${selectedIds.length} Mata Pelajaran?`,
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      Swal.fire({ title: 'Menghapus...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        await api.admin.mapel.bulkDelete(selectedIds);
        Toast.fire({ icon: 'success', title: 'Berhasil hapus massal' });
        fetchData(1);
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
      nama_mapel: '', 
      jurusan_id: '', 
      kategori_mapel: 'adaptif', 
      tipe_mapel: 'umum',
      is_active: true 
    });
  }, []);

  const handleEditClick = useCallback((item: any) => {
    setIsEdit(true); 
    setCurrentId(item.id);
    setFormData({ 
      nama_mapel: item.nama_mapel || '', 
      jurusan_id: item.jurusan_id || '', 
      kategori_mapel: item.kategori_mapel || 'adaptif',
      tipe_mapel: item.tipe_mapel || 'umum',
      is_active: !!item.is_active
    });
    setShowForm(true);
  }, []);

  const handleExport = async () => {
    try {
      const res = await api.admin.mapel.export({ search, ...filters });
      fileHelper.download(res);
      Toast.fire({ icon: 'success', title: 'Berhasil diekspor' });
    } catch (e) { Toast.fire({ icon: 'error', title: 'Gagal ekspor' }); }
  };

  const handleImportRequest = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fData = fileHelper.prepareImport(e);
    if (!fData) return;
    Swal.fire({ title: 'Membaca File...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await api.admin.mapel.importPreview(fData);
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
    if (!importFile || hasImportConflict) return;
    setIsSubmitting(true);
    Swal.fire({ title: 'Mengimpor Data...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await api.admin.mapel.import(importFile);
      if (res.data?.success) {
        Swal.close();
        Toast.fire({ icon: 'success', title: 'Berhasil diimpor' });
        setPreviewData(null);
        setImportFile(null);
        fetchData(1);
      }
    } catch (e: any) {
      Swal.close();
      Toast.fire({ icon: 'error', title: e.response?.data?.message || 'Gagal impor' });
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Mata Pelajaran?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
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
        await api.admin.mapel.delete(id);
        fetchData(pagination.currentPage);
        Toast.fire({ icon: 'success', title: 'Berhasil dihapus' });
      } catch (e: any) {
        Toast.fire({ icon: 'error', title: 'Gagal menghapus' });
      }
    }
  };

  const handleSave = async () => {
    if (!formData.nama_mapel) {
      return Toast.fire({ icon: 'warning', title: 'Nama mapel wajib diisi' });
    }
    setIsSubmitting(true);
    try {
      const res = isEdit && currentId ? await api.admin.mapel.update(currentId, formData) : await api.admin.mapel.create(formData);
      if (res.status < 300 || res.data?.success) { 
        Toast.fire({ icon: 'success', title: 'Berhasil disimpan' });
        handleCloseForm(); 
        fetchData(1); 
      }
    } catch (e: any) { 
      Toast.fire({ icon: 'error', title: e.response?.data?.message || 'Kesalahan sistem' });
    } finally { setIsSubmitting(false); }
  };

  const resetFilters = () => {
    setFilters({ jurusan_id: '', kategori_mapel: '', is_active: '1' });
    setSearch('');
  };

  const activeFilterCount = [filters.jurusan_id, filters.kategori_mapel].filter(v => v !== '').length + (search ? 1 : 0);

  if (authLoading) return null;

  return (
    <div className="container-fluid py-3 px-2 px-md-3 text-xs-custom">
      <div className="card border-0 shadow-sm rounded-3 mb-3">
        <div className="card-body p-2 p-md-3">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div className="d-flex align-items-center">
              <BookOpen size={16} className="text-primary me-2" />
              <h6 className="mb-0 fw-bold text-dark text-uppercase text-md-custom">Mata Pelajaran</h6>
            </div>
            
            <div className="d-flex flex-wrap align-items-center gap-2 justify-content-end">
              <div className="position-relative flex-grow-1 flex-md-grow-0">
                <Search size={12} className="position-absolute top-50 start-0 ms-2 translate-middle-y text-muted" />
                <input 
                  type="text" 
                  className="form-control form-control-sm ps-4 border-0 bg-light rounded-3 shadow-none w-100 w-md-[200px]"
                  placeholder="Cari mapel..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Cari mata pelajaran"
                />
              </div>

              <button 
                onClick={() => setShowFilters(!showFilters)} 
                className={`btn btn-sm px-2 py-[6px] rounded-3 border d-flex align-items-center gap-1 transition-all ${showFilters || activeFilterCount > 0 ? 'btn-primary border-primary' : 'btn-light'}`}
                title="Tampilkan Filter"
              >
                <Filter size={13}/>
                <span className="d-none d-lg-inline">Filter</span>
                {activeFilterCount > 0 && <span className="badge bg-white text-primary rounded-circle ms-1 p-1 text-[8px]">{activeFilterCount}</span>}
              </button>

              <div className="vr d-none d-md-block mx-1"></div>

              <div className="d-flex gap-1">
                <button onClick={handleExport} className="btn btn-success btn-sm px-2 shadow-sm rounded-3 py-[6px] border-0 d-flex align-items-center gap-1" title="Ekspor Data">
                  <FileDown size={13}/>
                  <span className="d-none d-lg-inline">Ekspor</span>
                </button>
                <label className="btn btn-light btn-sm px-2 shadow-sm rounded-3 py-[6px] cursor-pointer mb-0 border d-flex align-items-center gap-1" title="Impor Data">
                  <FileUp size={13}/>
                  <span className="d-none d-lg-inline">Impor</span>
                  <input type="file" className="d-none" accept=".xlsx, .xls, .csv" onChange={handleImportRequest} aria-label="Upload file impor" />
                </label>
                <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm px-2 shadow-sm rounded-3 py-[6px] d-flex align-items-center gap-1" title="Tambah Data">
                  <Plus size={13}/>
                  <span>Tambah</span>
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="mt-3 pt-3 border-top">
              <div className="row g-2 align-items-end">
                <div className="col-12 col-md-4">
                  <label htmlFor={filterJurusanId} className="text-xxs fw-bold text-muted text-uppercase mb-1">Jurusan</label>
                  <select 
                    id={filterJurusanId}
                    className="form-select form-select-sm bg-light border-0 rounded-3 shadow-none"
                    value={filters.jurusan_id}
                    onChange={(e) => setFilters({...filters, jurusan_id: e.target.value})}
                  >
                    <option value="">Semua Jurusan</option>
                    {jurusans.map((j: any) => <option key={j.id} value={j.id}>{j.nama_jurusan}</option>)}
                  </select>
                </div>
                <div className="col-6 col-md-3">
                  <label htmlFor={filterKategoriId} className="text-xxs fw-bold text-muted text-uppercase mb-1">Kategori</label>
                  <select 
                    id={filterKategoriId}
                    className="form-select form-select-sm bg-light border-0 rounded-3 shadow-none text-capitalize"
                    value={filters.kategori_mapel}
                    onChange={(e) => setFilters({...filters, kategori_mapel: e.target.value})}
                  >
                    <option value="">Semua Kategori</option>
                    <option value="normatif">Normatif</option>
                    <option value="adaptif">Adaptif</option>
                    <option value="produktif">Produktif</option>
                  </select>
                </div>
                <div className="col-6 col-md-3">
                  <label htmlFor={filterStatusId} className="text-xxs fw-bold text-muted text-uppercase mb-1">Status</label>
                  <select 
                    id={filterStatusId}
                    className="form-select form-select-sm bg-light border-0 rounded-3 shadow-none"
                    value={filters.is_active}
                    onChange={(e) => setFilters({...filters, is_active: e.target.value})}
                  >
                    <option value="1">Aktif</option>
                    <option value="0">Non-Aktif</option>
                  </select>
                </div>
                <div className="col-12 col-md-2 d-flex gap-1">
                  <button onClick={resetFilters} className="btn btn-sm btn-outline-secondary border-0 rounded-3 w-100 d-flex align-items-center justify-content-center gap-1 shadow-none text-dark bg-light py-2 py-md-1" title="Reset Filter">
                    <RefreshCw size={13}/> <span>Reset</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-3 animate-in fade-in slide-in-from-top-1">
          <button onClick={handleBulkDelete} className="btn btn-danger btn-sm px-3 py-2 rounded-3 shadow-sm border-0 d-flex align-items-center gap-2 fw-bold">
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
                    aria-label="Pilih semua mata pelajaran"
                  />
                </th>
                <th className="border-0 py-[10px] fw-bold text-muted text-uppercase">Mata Pelajaran</th>
                <th className="border-0 py-[10px] fw-bold text-muted text-uppercase d-none d-md-table-cell text-center">Kategori</th>
                <th className="border-0 py-[10px] fw-bold text-muted text-uppercase text-center">Status</th>
                <th className="border-0 py-[10px] text-end pe-3 fw-bold text-muted text-uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-5"><Loader2 className="text-primary animate-spin mx-auto" size={20} /></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-5 text-muted">Tidak ada data ditemukan.</td></tr>
              ) : data.map((item) => (
                <MapelRow 
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
          <div className="d-flex justify-content-between align-items-center p-3 border-top bg-white">
            <div className="text-muted text-xxs fw-medium">
              Menampilkan {data.length} dari {pagination.total} data
            </div>
            <nav className="d-flex align-items-center gap-1" aria-label="Navigasi halaman">
              <button 
                className="btn btn-light btn-sm border-0 shadow-none p-[6px] rounded-3" 
                disabled={pagination.currentPage === 1} 
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                title="Halaman Sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="d-flex gap-1 mx-1">
                {[...Array(pagination.lastPage)].map((_, i) => {
                  const pageNum = i + 1;
                  if (pageNum > pagination.currentPage + 1 || pageNum < pagination.currentPage - 1) {
                    if (pageNum === 1 || pageNum === pagination.lastPage) {
                         return (
                            <button key={pageNum} onClick={() => handlePageChange(pageNum)} className={`btn btn-sm px-[10px] py-1 rounded-3 fw-bold transition-all ${pagination.currentPage === pageNum ? 'btn-primary shadow-sm' : 'btn-light border-0'}`}>{pageNum}</button>
                         )
                    }
                    return null;
                  }
                  return (
                    <button 
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`btn btn-sm px-[10px] py-1 rounded-3 fw-bold transition-all ${pagination.currentPage === pageNum ? 'btn-primary shadow-sm' : 'btn-light border-0'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button 
                className="btn btn-light btn-sm border-0 shadow-none p-[6px] rounded-3" 
                disabled={pagination.currentPage === pagination.lastPage} 
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                title="Halaman Selanjutnya"
              >
                <ChevronRight size={16} />
              </button>
            </nav>
          </div>
        )}
      </div>

      {processedPreviewData && processedPreviewData.length > 0 && (
         <div className="modal fade show d-block bg-transparent z-modal-preview">
          <div className="modal-dialog modal-lg modal-dialog-centered px-3">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-0 pb-0 px-3 pt-3">
                <div className="d-flex align-items-center">
                  <Eye size={16} className="text-primary me-2" />
                  <h6 className="modal-title fw-bold text-dark text-md-custom">Preview Import Data</h6>
                </div>
                <button onClick={() => setPreviewData(null)} className="btn-close scale-75 shadow-none" aria-label="Tutup Preview"></button>
              </div>

              <div className="modal-body p-3">
                <div className={`alert border-0 rounded-3 d-flex flex-column gap-1 mb-3 py-2 px-3 ${hasImportConflict ? 'alert-danger bg-danger bg-opacity-10' : 'alert-light bg-light'}`}>
                  <div className="d-flex align-items-center gap-2">
                    {hasImportConflict ? <XCircle size={14} className="text-danger" /> : <AlertCircle size={14} className="text-muted" />}
                    <span className={`text-xxs fw-medium ${hasImportConflict ? 'text-danger' : 'text-muted'}`}>
                      {hasImportConflict 
                        ? 'Terdapat konflik data (Duplikat file/database atau Jurusan tidak ditemukan).' 
                        : `${processedPreviewData.length} baris data siap diimpor.`}
                    </span>
                  </div>
                </div>

                <div className="table-responsive border rounded-3 max-h-300">
                  <table className="table table-sm table-hover mb-0">
                    <thead className="bg-light sticky-top">
                      <tr className="text-xxs">
                        <th className="ps-3 py-2 border-0">Mapel</th>
                        <th className="py-2 border-0">Jurusan</th>
                        <th className="py-2 border-0 text-center">Kategori</th>
                        <th className="py-2 border-0 text-center">Tipe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedPreviewData.map((item, idx) => (
                        <tr key={idx} className={item.hasConflict ? 'bg-danger bg-opacity-10' : ''}>
                          <td className={`ps-3 py-[6px] fw-medium ${item.is_duplicate_internal || item.is_duplicate_database ? 'text-danger' : ''}`}>
                            <div className="d-flex align-items-center gap-1">
                              {item.nama_mata_pelajaran || '-'}
                              {item.is_duplicate_internal && <span title="Duplikat dalam file"><XCircle size={10} className="text-danger" /></span>}
                              {item.is_duplicate_database && <span title="Sudah ada di database"><AlertCircle size={10} className="text-danger" /></span>}
                            </div>
                          </td>
                          <td className={`py-[6px] ${!item.jurusan_found ? 'bg-danger bg-opacity-25 text-danger fw-bold' : 'text-muted'}`}>
                            <div className="d-flex align-items-center gap-1">
                              {item.jurusan || 'Semua Jurusan'}
                              {!item.jurusan_found && <span title="Jurusan tidak ditemukan"><XCircle size={10} className="text-danger" /></span>}
                            </div>
                          </td>
                          <td className="py-[6px] text-center text-capitalize">
                            <span className={`badge fw-medium border text-xxs px-2 py-[2px] ${item.hasConflict ? 'bg-danger text-white border-danger' : 'bg-light text-dark'}`}>
                              {item.kategori_mapel || item.kategori || 'adaptif'}
                            </span>
                          </td>
                          <td className="py-[6px] text-center text-capitalize">
                             <span className={`badge fw-medium border text-xxs px-2 py-[2px] ${item.hasConflict ? 'bg-danger text-white border-danger' : 'bg-light text-dark'}`}>
                              {item.tipe_mapel || 'umum'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="modal-footer border-0 p-3 pt-0">
                <div className="row w-100 g-2">
                  <div className="col-6">
                    <button onClick={() => setPreviewData(null)} className="btn btn-light btn-sm w-100 py-2 rounded-3 fw-bold text-muted border text-xxs">
                      Batal
                    </button>
                  </div>
                  <div className="col-6">
                    <button 
                      onClick={confirmImport} 
                      className={`btn btn-primary btn-sm w-100 py-2 rounded-3 shadow-none fw-bold d-flex align-items-center justify-content-center gap-2 text-xxs ${hasImportConflict ? 'opacity-50 cursor-not-allowed' : ''}`} 
                      disabled={isSubmitting || hasImportConflict}
                    >
                      {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : (
                        <>
                          <CheckCircle2 size={12} />
                          Konfirmasi Import
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal fade show d-block bg-transparent z-[1060]">
          <div className="modal-dialog modal-dialog-centered px-3">
            <div className="modal-content border-0 shadow-lg rounded-4 border">
              <div className="modal-header border-0 pb-0 px-4 pt-4">
                <h6 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <div className="bg-primary bg-opacity-10 p-[6px] rounded-3">
                    {isEdit ? <Edit2 size={15} className="text-primary"/> : <Plus size={15} className="text-primary"/>}
                  </div>
                  {isEdit ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran Baru"}
                </h6>
                <button onClick={handleCloseForm} className="btn-close scale-75 shadow-none" aria-label="Tutup"></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-bold text-xxs text-muted text-uppercase mb-1" htmlFor={namaId}>Nama Mata Pelajaran</label>
                  <input id={namaId} type="text" className="form-control form-control-sm bg-light border-0 py-2 rounded-3 shadow-none" placeholder="Contoh: Matematika" value={formData.nama_mapel} onChange={(e) => setFormData({...formData, nama_mapel: e.target.value})} />
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-xxs text-muted text-uppercase mb-1" htmlFor={kategoriId}>Kategori</label>
                    <select id={kategoriId} className="form-select form-select-sm bg-light border-0 py-2 rounded-3 shadow-none text-capitalize" value={formData.kategori_mapel} onChange={(e) => setFormData({...formData, kategori_mapel: e.target.value})}>
                      <option value="normatif">Normatif</option>
                      <option value="adaptif">Adaptif</option>
                      <option value="produktif">Produktif</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-xxs text-muted text-uppercase mb-1" htmlFor={tipeId}>Tipe Mapel</label>
                    <select id={tipeId} className="form-select form-select-sm bg-light border-0 py-2 rounded-3 shadow-none text-capitalize" value={formData.tipe_mapel} onChange={(e) => setFormData({...formData, tipe_mapel: e.target.value})}>
                      <option value="umum">Umum</option>
                      <option value="khusus">Khusus</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="form-label fw-bold text-xxs text-muted text-uppercase mb-1" htmlFor={jurusanId}>Jurusan</label>
                  <select id={jurusanId} className="form-select form-select-sm bg-light border-0 py-2 rounded-3 shadow-none" value={formData.jurusan_id} onChange={(e) => setFormData({...formData, jurusan_id: e.target.value})}>
                    <option value="">Berlaku untuk Semua Jurusan</option>
                    {jurusans.map((j: any) => <option key={j.id} value={j.id}>{j.nama_jurusan}</option>)}
                  </select>
                </div>
                <div className="mt-4 pt-3 border-top">
                  <div className="form-check form-switch d-flex align-items-center gap-2 ps-0">
                    <input 
                      className="form-check-input shadow-none cursor-pointer ms-0 me-2" 
                      type="checkbox" 
                      id="statusSwitch" 
                      checked={formData.is_active} 
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})} 
                    />
                    <label className="form-check-label fw-medium text-dark cursor-pointer" htmlFor="statusSwitch">
                      Status Mata Pelajaran {formData.is_active ? 'Aktif' : 'Non-Aktif'}
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-4 pt-0">
                <button onClick={handleSave} className="btn btn-primary btn-sm w-100 py-[10px] rounded-3 shadow-sm fw-bold d-flex align-items-center justify-content-center gap-2" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : (isEdit ? "Perbarui Data" : "Simpan Mata Pelajaran")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
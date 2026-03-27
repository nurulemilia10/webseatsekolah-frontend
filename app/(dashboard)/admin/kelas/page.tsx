"use client";

import React, { useState, useEffect, useCallback, useId, memo, useMemo } from 'react';
import { 
  Plus, Edit2, Loader2, Users, Trash2, FileDown, FileUp, ChevronLeft, ChevronRight, Eye, Search, Filter, RefreshCw, CheckCircle2, AlertCircle, UserCheck, User, XCircle, Layers
} from 'lucide-react';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/useAuth';
import { fileHelper } from '@/lib/file-helper';

const KelasRow = memo(({ 
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
        aria-label={`Pilih kelas ${item.nama_kelas}`}
      />
    </td>
    <td className="py-2">
      <div className="d-flex align-items-center">
        <div className="flex-shrink-0 bg-light rounded p-[6px] d-flex align-items-center justify-content-center">
          <Users size={13} className="text-primary" />
        </div>
        <div className="ms-2">
          <div className="text-dark fw-bold text-sm-custom mb-0">{item.nama_kelas}</div>
          <div className="text-muted text-xxs italic">
            {item.jurusan?.nama || 'Semua Jurusan'}
          </div>
        </div>
      </div>
    </td>
    <td className="py-2 text-muted text-xs-custom d-none d-md-table-cell text-center">
      {item.tingkatan?.nama || '-'}
    </td>
    <td className="py-2 d-none d-lg-table-cell">
      <div className="d-flex align-items-center gap-2">
        <div className="bg-light rounded-circle p-1">
          <User size={10} className="text-secondary" />
        </div>
        <div>
          <div className="text-xs-custom text-dark fw-medium">{item.wali_kelas?.nama || 'Belum Ditentukan'}</div>
          {item.wali_kelas?.nip && (
            <div className="text-muted text-xxs">{item.wali_kelas.nip}</div>
          )}
        </div>
      </div>
    </td>
    <td className="py-2 text-center d-none d-lg-table-cell">
      <div className="d-flex align-items-center justify-content-center gap-1 text-muted">
        <UserCheck size={12} className="text-info" />
        <span className="fw-bold text-dark">{item.total_siswa ?? 0}</span>
        <span className="text-xxs text-muted">Siswa</span>
      </div>
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
        <button onClick={() => onEdit(item)} className="btn btn-sm p-1 text-primary border-0 shadow-none" aria-label="Edit data">
          <span className="bg-light p-1 rounded-3 d-inline-flex"><Edit2 size={11}/></span>
        </button>
        <button onClick={() => onDelete(item.id)} className="btn btn-sm p-1 text-danger border-0 shadow-none" aria-label="Hapus data">
          <span className="bg-danger bg-opacity-10 p-1 rounded-3 d-inline-flex"><Trash2 size={11}/></span>
        </button>
      </div>
    </td>
  </tr>
));

KelasRow.displayName = 'KelasRow';

const TingkatanRow = memo(({ 
  item, 
  onEdit, 
  onDelete 
}: { 
  item: any, 
  onEdit: (i: any) => void, 
  onDelete: (id: string) => void
}) => (
  <tr>
    <td className="ps-3 py-2">
      <div className="d-flex align-items-center">
        <div className="flex-shrink-0 bg-light rounded p-[6px] d-flex align-items-center justify-content-center">
          <Layers size={13} className="text-primary" />
        </div>
        <div className="ms-2">
          <div className="text-dark fw-bold text-sm-custom mb-0">{item.nama_tingkatan}</div>
        </div>
      </div>
    </td>
    <td className="py-2 text-end pe-3">
      <div className="d-flex justify-content-end gap-1">
        <button onClick={() => onEdit(item)} className="btn btn-sm p-1 text-primary border-0 shadow-none" aria-label="Edit data">
          <span className="bg-light p-1 rounded-3 d-inline-flex"><Edit2 size={11}/></span>
        </button>
        <button onClick={() => onDelete(item.id)} className="btn btn-sm p-1 text-danger border-0 shadow-none" aria-label="Hapus data">
          <span className="bg-danger bg-opacity-10 p-1 rounded-3 d-inline-flex"><Trash2 size={11}/></span>
        </button>
      </div>
    </td>
  </tr>
));

TingkatanRow.displayName = 'TingkatanRow';

export default function ManajemenKelas() {
  const { user, loading: authLoading } = useAuth();
  const [activePage, setActivePage] = useState('kelas');

  const [data, setData] = useState<any[]>([]);
  const [jurusans, setJurusans] = useState<any[]>([]);
  const [tingkatans, setTingkatans] = useState<any[]>([]);
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
    tingkatan_id: '',
    is_active: ''
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10
  });

  const [formData, setFormData] = useState({ 
    nama_kelas: '', 
    jurusan_id: '', 
    tingkatan_id: '',
    is_active: true
  });

  const [tingkatanData, setTingkatanData] = useState<any[]>([]);
  const [tingkatanLoading, setTingkatanLoading] = useState(true);
  const [tingkatanShowForm, setTingkatanShowForm] = useState(false);
  const [tingkatanIsEdit, setTingkatanIsEdit] = useState(false);
  const [tingkatanCurrentId, setTingkatanCurrentId] = useState<string | null>(null);
  const [tingkatanIsSubmitting, setTingkatanIsSubmitting] = useState(false);
  const [tingkatanPagination, setTingkatanPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10
  });
  const [tingkatanFormData, setTingkatanFormData] = useState({ 
    nama_tingkatan: ''
  });

  const namaId = useId();
  const jurusanId = useId();
  const tingkatanId = useId();
  const filterJurusanId = useId();
  const filterTingkatanId = useId();
  const filterStatusId = useId();
  const tingkatanNamaId = useId();

  const hasImportConflict = useMemo(() => {
    return previewData?.some(item => item.is_duplicate || !item.jurusan_exists || !item.tingkatan_exists);
  }, [previewData]);

  const Toast = useMemo(() => Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  }), []);

  const fetchDependencies = useCallback(async () => {
    try {
      const [resJurusan, resTingkatan] = await Promise.all([
        api.admin.jurusan.getAll({ paginate: 0 }),
        api.admin.tingkatan.getAll({ paginate: 0 })
      ]);
      
      const rawJurusan = resJurusan.data?.success ? resJurusan.data.data : (resJurusan.data?.data || resJurusan.data || []);
      const rawTingkatan = resTingkatan.data?.success ? resTingkatan.data.data : (resTingkatan.data?.data || resTingkatan.data || []);
      
      setJurusans(Array.isArray(rawJurusan) ? rawJurusan : []);
      setTingkatans(Array.isArray(rawTingkatan) ? rawTingkatan : []);
    } catch (e) { 
      console.error(e); 
    }
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
      const res = await api.admin.kelas.getAll(params);
      if (res?.data?.success) {
        setData(res.data.data || []);
        setSelectedIds([]);
        if (res.data.meta) {
          setPagination({
            perPage: res.data.meta.per_page,
            currentPage: res.data.meta.current_page,
            lastPage: res.data.meta.last_page,
            total: res.data.meta.total,
          });
        }
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [authLoading, user, search, pagination.perPage, filters]);

  const fetchTingkatanData = useCallback(async (page = 1) => {
    if (authLoading || !user) return;
    setTingkatanLoading(true);
    try {
      const params = {
        page,
        per_page: tingkatanPagination.perPage
      };
      const res = await api.admin.tingkatan.getAll(params);
      
      // PERBAIKAN DI SINI: Menggunakan logika ekstraksi data yang fleksibel
      const rawData = res.data?.success ? res.data.data : (res.data?.data || res.data || []);
      
      if (Array.isArray(rawData)) {
        setTingkatanData(rawData);
        
        // Cek apakah ada meta pagination, jika tidak set manual
        if (res.data?.meta) {
          setTingkatanPagination({
            perPage: res.data.meta.per_page,
            currentPage: res.data.meta.current_page,
            lastPage: res.data.meta.last_page,
            total: res.data.meta.total,
          });
        } else {
           setTingkatanPagination(prev => ({
            ...prev,
            total: rawData.length,
            lastPage: 1,
            currentPage: 1
          }));
        }
      } else {
        setTingkatanData([]);
      }
    } catch (e) { 
      console.error(e); 
      setTingkatanData([]);
    } finally { 
      setTingkatanLoading(false); 
    }
  }, [authLoading, user, tingkatanPagination.perPage]);

  useEffect(() => {
    if (activePage === 'kelas') {
      const delayDebounceFn = setTimeout(() => {
        fetchData(1);
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [search, filters, fetchData, activePage]);

  useEffect(() => {
    if (activePage === 'tingkatan') {
      fetchTingkatanData(1);
    }
  }, [fetchTingkatanData, activePage]);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  const handlePageChange = (page: number) => fetchData(page);
  const handleTingkatanPageChange = (page: number) => fetchTingkatanData(page);

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
      title: `Hapus ${selectedIds.length} Kelas?`,
      text: "Data tidak dapat dikembalikan!",
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
        await api.admin.kelas.bulkDelete(selectedIds);
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
      nama_kelas: '', 
      jurusan_id: '', 
      tingkatan_id: '',
      is_active: true 
    });
  }, []);

  const handleEditClick = useCallback((item: any) => {
    setIsEdit(true); 
    setCurrentId(item.id);
    setFormData({ 
      nama_kelas: item.nama_kelas || '', 
      jurusan_id: item.jurusan?.id || item.jurusan_id || '', 
      tingkatan_id: item.tingkatan?.id || item.tingkatan_id || '',
      is_active: !!item.is_active
    });
    setShowForm(true);
  }, []);

  const handleCloseTingkatanForm = useCallback(() => {
    setTingkatanShowForm(false); 
    setTingkatanIsEdit(false); 
    setTingkatanCurrentId(null); 
    setTingkatanFormData({ 
      nama_tingkatan: ''
    });
  }, []);

  const handleTingkatanEditClick = useCallback((item: any) => {
    setTingkatanIsEdit(true); 
    setTingkatanCurrentId(item.id);
    setTingkatanFormData({ 
      nama_tingkatan: item.nama_tingkatan || ''
    });
    setTingkatanShowForm(true);
  }, []);

  const handleExport = async () => {
    try {
      const res = await api.admin.kelas.export({ search, ...filters });
      fileHelper.download(res);
      Toast.fire({ icon: 'success', title: 'Berhasil diekspor' });
    } catch (e) { Toast.fire({ icon: 'error', title: 'Gagal ekspor' }); }
  };

  const handleImportRequest = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fData = fileHelper.prepareImport(e);
    if (!fData) return;
    Swal.fire({ title: 'Membaca File...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await api.admin.kelas.importPreview(fData);
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
      const res = await api.admin.kelas.import(importFile);
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
      title: 'Hapus Kelas?',
      text: "Data tidak dapat dikembalikan!",
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
        await api.admin.kelas.delete(id);
        fetchData(pagination.currentPage);
        Toast.fire({ icon: 'success', title: 'Berhasil dihapus' });
      } catch (e: any) {
        Toast.fire({ icon: 'error', title: 'Gagal menghapus' });
      }
    }
  };

  const handleTingkatanDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Tingkatan?',
      text: "Data tidak dapat dikembalikan!",
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
        await api.admin.tingkatan.delete(id);
        fetchTingkatanData(tingkatanPagination.currentPage);
        Toast.fire({ icon: 'success', title: 'Berhasil dihapus' });
      } catch (e: any) {
        Toast.fire({ icon: 'error', title: 'Gagal menghapus' });
      }
    }
  };

  const handleSave = async () => {
    if (!formData.nama_kelas) {
      return Toast.fire({ icon: 'warning', title: 'Nama kelas wajib diisi' });
    }
    setIsSubmitting(true);
    try {
      const res = isEdit && currentId ? await api.admin.kelas.update(currentId, formData) : await api.admin.kelas.create(formData);
      if (res.status < 300 || res.data?.success) { 
        Toast.fire({ icon: 'success', title: 'Berhasil disimpan' });
        handleCloseForm(); 
        fetchData(1); 
      }
    } catch (e: any) { 
      Toast.fire({ icon: 'error', title: e.response?.data?.message || 'Kesalahan sistem' });
    } finally { setIsSubmitting(false); }
  };

  const handleTingkatanSave = async () => {
    if (!tingkatanFormData.nama_tingkatan) {
      return Toast.fire({ icon: 'warning', title: 'Nama tingkatan wajib diisi' });
    }
    setTingkatanIsSubmitting(true);
    try {
      const res = tingkatanIsEdit && tingkatanCurrentId ? await api.admin.tingkatan.update(tingkatanCurrentId, tingkatanFormData) : await api.admin.tingkatan.create(tingkatanFormData);
      if (res.status < 300 || res.data?.success) { 
        Toast.fire({ icon: 'success', title: 'Berhasil disimpan' });
        handleCloseTingkatanForm(); 
        fetchTingkatanData(1); 
      }
    } catch (e: any) { 
      Toast.fire({ icon: 'error', title: e.response?.data?.message || 'Kesalahan sistem' });
    } finally { setTingkatanIsSubmitting(false); }
  };

  const resetFilters = () => {
    setFilters({ jurusan_id: '', tingkatan_id: '', is_active: '' });
    setSearch('');
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length + (search ? 1 : 0);

  if (authLoading) return null;

  return (
    <div className="container-fluid py-3 px-2 px-md-3 text-xs-custom">
      <div className="card border-0 shadow-sm rounded-3 mb-3">
        <div className="card-body p-2 p-md-3">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-2">
                <button 
                    onClick={() => setActivePage('kelas')} 
                    className={`btn btn-sm d-flex align-items-center gap-1 ${activePage === 'kelas' ? 'btn-primary' : 'btn-light'}`}
                >
                    <Users size={14} />
                    <span className="fw-bold">Kelas</span>
                </button>
                <button 
                    onClick={() => setActivePage('tingkatan')} 
                    className={`btn btn-sm d-flex align-items-center gap-1 ${activePage === 'tingkatan' ? 'btn-primary' : 'btn-light'}`}
                >
                    <Layers size={14} />
                    <span className="fw-bold">Tingkatan</span>
                </button>
            </div>
            
            {activePage === 'kelas' && (
            <div className="d-flex flex-wrap align-items-center gap-2 justify-content-end">
              <div className="position-relative flex-grow-1 flex-md-grow-0">
                <Search size={12} className="position-absolute top-50 start-0 ms-2 translate-middle-y text-muted" />
                <input 
                  type="text" 
                  className="form-control form-control-sm ps-4 border-0 bg-light rounded-3 shadow-none w-100 w-md-[200px]"
                  placeholder="Cari kelas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Cari kelas"
                />
              </div>

              <button 
                onClick={() => setShowFilters(!showFilters)} 
                className={`btn btn-sm px-2 py-[6px] rounded-3 border d-flex align-items-center gap-1 transition-all ${showFilters || activeFilterCount > 0 ? 'btn-primary border-primary' : 'btn-light'}`}
                aria-label="Tampilkan filter"
              >
                <Filter size={13}/>
                <span className="d-none d-lg-inline">Filter</span>
                {activeFilterCount > 0 && <span className="badge bg-white text-primary rounded-circle ms-1 p-1 text-[8px]">{activeFilterCount}</span>}
              </button>

              <div className="vr d-none d-md-block mx-1"></div>

              <div className="d-flex gap-1">
                <button onClick={handleExport} className="btn btn-success btn-sm px-2 shadow-sm rounded-3 py-[6px] border-0 d-flex align-items-center gap-1" aria-label="Ekspor data">
                  <FileDown size={13}/>
                  <span className="d-none d-lg-inline">Ekspor</span>
                </button>
                <label className="btn btn-light btn-sm px-2 shadow-sm rounded-3 py-[6px] cursor-pointer mb-0 border d-flex align-items-center gap-1" aria-label="Impor data">
                  <FileUp size={13}/>
                  <span className="d-none d-lg-inline">Impor</span>
                  <input type="file" className="d-none" accept=".xlsx, .xls, .csv" onChange={handleImportRequest} />
                </label>
                <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm px-2 shadow-sm rounded-3 py-[6px] d-flex align-items-center gap-1">
                  <Plus size={13}/>
                  <span>Tambah</span>
                </button>
              </div>
            </div>
            )}

            {activePage === 'tingkatan' && (
            <div className="d-flex flex-wrap align-items-center gap-2 justify-content-end">
              <div className="d-flex gap-1">
                <button onClick={() => setTingkatanShowForm(true)} className="btn btn-primary btn-sm px-2 shadow-sm rounded-3 py-[6px] d-flex align-items-center gap-1">
                  <Plus size={13}/>
                  <span>Tambah</span>
                </button>
              </div>
            </div>
            )}
          </div>

          {showFilters && activePage === 'kelas' && (
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
                    {jurusans.map((j: any) => <option key={j.id} value={j.id}>{j.nama || j.nama_jurusan}</option>)}
                  </select>
                </div>
                <div className="col-6 col-md-3">
                  <label htmlFor={filterTingkatanId} className="text-xxs fw-bold text-muted text-uppercase mb-1">Tingkatan</label>
                  <select 
                    id={filterTingkatanId}
                    className="form-select form-select-sm bg-light border-0 rounded-3 shadow-none"
                    value={filters.tingkatan_id}
                    onChange={(e) => setFilters({...filters, tingkatan_id: e.target.value})}
                  >
                    <option value="">Semua Tingkatan</option>
                    {tingkatans.map((t: any) => <option key={t.id} value={t.id}>{t.nama || t.nama_tingkatan}</option>)}
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
                    <option value="">Semua Status</option>
                    <option value="1">Aktif</option>
                    <option value="0">Non-Aktif</option>
                  </select>
                </div>
                <div className="col-12 col-md-2">
                  <button onClick={resetFilters} className="btn btn-sm btn-outline-secondary border-0 rounded-3 w-100 d-flex align-items-center justify-content-center gap-1 shadow-none text-dark bg-light py-2 py-md-1">
                    <RefreshCw size={13}/> <span>Reset</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {activePage === 'kelas' && selectedIds.length > 0 && (
        <div className="mb-3">
          <button onClick={handleBulkDelete} className="btn btn-danger btn-sm px-3 py-2 rounded-3 shadow-sm border-0 d-flex align-items-center gap-2 fw-bold">
            <Trash2 size={14} />
            Hapus ({selectedIds.length})
          </button>
        </div>
      )}

      {activePage === 'kelas' && (
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
                    aria-label="Pilih semua data"
                  />
                </th>
                <th className="border-0 py-[10px] fw-bold text-muted text-uppercase">Nama Kelas</th>
                <th className="border-0 py-[10px] fw-bold text-muted text-uppercase d-none d-md-table-cell text-center">Tingkatan</th>
                <th className="border-0 py-[10px] fw-bold text-muted text-uppercase d-none d-lg-table-cell">Wali Kelas</th>
                <th className="border-0 py-[10px] fw-bold text-muted text-uppercase d-none d-lg-table-cell text-center">Siswa</th>
                <th className="border-0 py-[10px] fw-bold text-muted text-uppercase text-center">Status</th>
                <th className="border-0 py-[10px] text-end pe-3 fw-bold text-muted text-uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-5"><Loader2 className="text-primary animate-spin mx-auto" size={20} /></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-5 text-muted">Tidak ada data ditemukan.</td></tr>
              ) : data.map((item) => (
                <KelasRow 
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
            <nav className="d-flex align-items-center gap-1">
              <button 
                className="btn btn-light btn-sm border-0 shadow-none p-[6px] rounded-3" 
                disabled={pagination.currentPage === 1} 
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="d-flex gap-1 mx-1">
                {[...Array(pagination.lastPage)].map((_, i) => {
                  const pageNumber = i + 1;
                  if (
                    pageNumber === 1 || 
                    pageNumber === pagination.lastPage || 
                    (pageNumber >= pagination.currentPage - 1 && pageNumber <= pagination.currentPage + 1)
                  ) {
                    return (
                      <button 
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`btn btn-sm px-[10px] py-1 rounded-3 fw-bold ${pagination.currentPage === pageNumber ? 'btn-primary' : 'btn-light'}`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                  if (pageNumber === pagination.currentPage - 2 || pageNumber === pagination.currentPage + 2) {
                    return <span key={pageNumber} className="px-1 text-muted">...</span>;
                  }
                  return null;
                })}
              </div>

              <button 
                className="btn btn-light btn-sm border-0 shadow-none p-[6px] rounded-3" 
                disabled={pagination.currentPage === pagination.lastPage} 
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                aria-label="Halaman selanjutnya"
              >
                <ChevronRight size={16} />
              </button>
            </nav>
          </div>
        )}
      </div>
      )}

      {activePage === 'tingkatan' && (
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="text-xxs">
                <th className="border-0 py-[10px] fw-bold text-muted text-uppercase ps-3">Nama Tingkatan</th>
                <th className="border-0 py-[10px] text-end pe-3 fw-bold text-muted text-uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {tingkatanLoading ? (
                <tr><td colSpan={2} className="text-center py-5"><Loader2 className="text-primary animate-spin mx-auto" size={20} /></td></tr>
              ) : tingkatanData.length === 0 ? (
                <tr><td colSpan={2} className="text-center py-5 text-muted">Tidak ada data ditemukan.</td></tr>
              ) : tingkatanData.map((item) => (
                <TingkatanRow 
                  key={item.id} 
                  item={item} 
                  onEdit={handleTingkatanEditClick} 
                  onDelete={handleTingkatanDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
        
        {!tingkatanLoading && tingkatanData.length > 0 && (
          <div className="d-flex justify-content-between align-items-center p-3 border-top bg-white">
            <div className="text-muted text-xxs fw-medium">
              Menampilkan {tingkatanData.length} dari {tingkatanPagination.total} data
            </div>
            <nav className="d-flex align-items-center gap-1">
              <button 
                className="btn btn-light btn-sm border-0 shadow-none p-[6px] rounded-3" 
                disabled={tingkatanPagination.currentPage === 1} 
                onClick={() => handleTingkatanPageChange(tingkatanPagination.currentPage - 1)}
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="d-flex gap-1 mx-1">
                {[...Array(tingkatanPagination.lastPage)].map((_, i) => {
                  const pageNumber = i + 1;
                  if (
                    pageNumber === 1 || 
                    pageNumber === tingkatanPagination.lastPage || 
                    (pageNumber >= tingkatanPagination.currentPage - 1 && pageNumber <= tingkatanPagination.currentPage + 1)
                  ) {
                    return (
                      <button 
                        key={pageNumber}
                        onClick={() => handleTingkatanPageChange(pageNumber)}
                        className={`btn btn-sm px-[10px] py-1 rounded-3 fw-bold ${tingkatanPagination.currentPage === pageNumber ? 'btn-primary' : 'btn-light'}`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                  if (pageNumber === tingkatanPagination.currentPage - 2 || pageNumber === tingkatanPagination.currentPage + 2) {
                    return <span key={pageNumber} className="px-1 text-muted">...</span>;
                  }
                  return null;
                })}
              </div>

              <button 
                className="btn btn-light btn-sm border-0 shadow-none p-[6px] rounded-3" 
                disabled={tingkatanPagination.currentPage === tingkatanPagination.lastPage} 
                onClick={() => handleTingkatanPageChange(tingkatanPagination.currentPage + 1)}
                aria-label="Halaman selanjutnya"
              >
                <ChevronRight size={16} />
              </button>
            </nav>
          </div>
        )}
      </div>
      )}

      {previewData && activePage === 'kelas' && (
          <div className="modal fade show d-block bg-transparent z-[1070]">
            <div className="modal-dialog modal-lg modal-dialog-centered px-3">
              <div className="modal-content border-0 shadow-lg rounded-3">
                <div className="modal-header border-0 pb-0 px-3 pt-3">
                  <div className="d-flex align-items-center">
                    <Eye size={16} className="text-primary me-2" />
                    <h6 className="modal-title fw-bold text-dark text-md-custom">Preview Import Kelas</h6>
                  </div>
                  <button onClick={() => setPreviewData(null)} className="btn-close scale-75 shadow-none" aria-label="Tutup"></button>
                </div>
                <div className="modal-body p-3">
                  <div className={`alert ${hasImportConflict ? 'alert-danger' : 'alert-light bg-light'} border-0 rounded-3 py-2 px-3 mb-3`}>
                    <div className="d-flex align-items-center justify-content-between gap-2">
                      <div className="d-flex align-items-center gap-2">
                        {hasImportConflict ? <XCircle size={14} className="text-danger" /> : <AlertCircle size={14} className="text-muted" />}
                        <span className={`text-xxs fw-bold ${hasImportConflict ? 'text-danger' : 'text-muted'}`}>
                          {hasImportConflict ? 'Terdapat data duplikat atau jurusan/tingkatan tidak ditemukan. Mohon perbaiki file Anda.' : `${previewData.length} baris data ditemukan.`}
                        </span>
                      </div>
                      {hasImportConflict && (
                        <div className="d-none d-md-flex align-items-center gap-2 border-start ps-2">
                           <AlertCircle size={12} className="text-danger" />
                           <span className="text-[10px] text-danger fw-medium">{previewData.length} baris total</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="table-responsive border rounded-3 max-h-300">
                    <table className="table table-sm table-hover mb-0">
                      <thead className="bg-light sticky-top">
                        <tr className="text-xxs">
                          <th className="ps-3 py-2 border-0">Nama Kelas</th>
                          <th className="py-2 border-0">Jurusan</th>
                          <th className="py-2 border-0 text-center">Tingkatan</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs-custom">
                        {previewData.map((item, idx) => (
                          <tr key={idx} className={item.is_duplicate || !item.jurusan_exists || !item.tingkatan_exists ? 'bg-danger bg-opacity-10' : ''}>
                            <td className={`ps-3 py-[6px] fw-medium ${item.is_duplicate ? 'text-danger' : ''}`}>
                                <div className="d-flex align-items-center gap-1">
                                    {item.nama_kelas || '-'}
                                    {item.is_duplicate && <span title="Sudah terdaftar"><XCircle size={10} className="text-danger" /></span>}
                                </div>
                            </td>
                            <td className={`py-[6px] ${!item.jurusan_exists ? 'text-danger fw-bold' : 'text-muted'}`}>
                                <div className="d-flex align-items-center gap-1">
                                    {item.jurusan || 'Umum'}
                                    {!item.jurusan_exists && <span title="Jurusan tidak ditemukan"><XCircle size={10} className="text-danger" /></span>}
                                </div>
                            </td>
                            <td className="py-[6px] text-center text-capitalize">
                              <span className={`badge fw-medium border text-xxs px-2 py-[2px] ${!item.tingkatan_exists ? 'bg-danger text-white border-danger' : 'bg-light text-dark'}`}>
                                {item.tingkatan || '-'}
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
                      <button onClick={() => setPreviewData(null)} className="btn btn-light btn-sm w-100 py-2 rounded-3 fw-bold text-muted border text-xxs">Batal</button>
                    </div>
                    <div className="col-6">
                      <button 
                        onClick={confirmImport} 
                        className={`btn btn-primary btn-sm w-100 py-2 rounded-3 shadow-none fw-bold d-flex align-items-center justify-content-center gap-2 text-xxs ${hasImportConflict ? 'opacity-50 cursor-not-allowed' : ''}`} 
                        disabled={isSubmitting || hasImportConflict}
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

      {showForm && activePage === 'kelas' && (
        <div className="modal fade show d-block bg-transparent z-[1060]">
          <div className="modal-dialog modal-dialog-centered px-3">
            <div className="modal-content border-0 shadow-lg rounded-4 border">
              <div className="modal-header border-0 pb-0 px-4 pt-4">
                <h6 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <div className="bg-primary bg-opacity-10 p-[6px] rounded-3">
                    {isEdit ? <Edit2 size={15} className="text-primary"/> : <Plus size={15} className="text-primary"/>}
                  </div>
                  {isEdit ? "Edit Data Kelas" : "Tambah Kelas Baru"}
                </h6>
                <button onClick={handleCloseForm} className="btn-close scale-75 shadow-none" aria-label="Tutup"></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-bold text-xxs text-muted text-uppercase mb-1" htmlFor={namaId}>Nama Kelas</label>
                  <input id={namaId} type="text" className="form-control form-control-sm bg-light border-0 py-2 rounded-3 shadow-none" placeholder="Contoh: X RPL 1" value={formData.nama_kelas} onChange={(e) => setFormData({...formData, nama_kelas: e.target.value})} />
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-xxs text-muted text-uppercase mb-1" htmlFor={tingkatanId}>Tingkatan</label>
                    <select id={tingkatanId} className="form-select form-select-sm bg-light border-0 py-2 rounded-3 shadow-none" value={formData.tingkatan_id} onChange={(e) => setFormData({...formData, tingkatan_id: e.target.value})}>
                      <option value="">Pilih Tingkatan</option>
                      {tingkatans.map((t: any) => <option key={t.id} value={t.id}>{t.nama || t.nama_tingkatan}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-xxs text-muted text-uppercase mb-1" htmlFor={jurusanId}>Jurusan</label>
                    <select id={jurusanId} className="form-select form-select-sm bg-light border-0 py-2 rounded-3 shadow-none" value={formData.jurusan_id} onChange={(e) => setFormData({...formData, jurusan_id: e.target.value})}>
                      <option value="">Pilih Jurusan</option>
                      {jurusans.map((j: any) => <option key={j.id} value={j.id}>{j.nama || j.nama_jurusan}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-top">
                  <div className="form-check form-switch d-flex align-items-center gap-2 ps-0">
                    <input className="form-check-input shadow-none cursor-pointer ms-0 me-2" type="checkbox" id="statusSwitch" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} />
                    <label className="form-check-label fw-medium text-dark cursor-pointer" htmlFor="statusSwitch">
                      Status Kelas {formData.is_active ? 'Aktif' : 'Non-Aktif'}
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-4 pt-0">
                <button onClick={handleSave} className="btn btn-primary btn-sm w-100 py-[10px] rounded-3 shadow-sm fw-bold d-flex align-items-center justify-content-center gap-2" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : (isEdit ? "Perbarui Data" : "Simpan Data Kelas")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tingkatanShowForm && activePage === 'tingkatan' && (
        <div className="modal fade show d-block bg-transparent z-[1060]">
          <div className="modal-dialog modal-dialog-centered px-3">
            <div className="modal-content border-0 shadow-lg rounded-4 border">
              <div className="modal-header border-0 pb-0 px-4 pt-4">
                <h6 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <div className="bg-primary bg-opacity-10 p-[6px] rounded-3">
                    {tingkatanIsEdit ? <Edit2 size={15} className="text-primary"/> : <Plus size={15} className="text-primary"/>}
                  </div>
                  {tingkatanIsEdit ? "Edit Data Tingkatan" : "Tambah Tingkatan Baru"}
                </h6>
                <button onClick={handleCloseTingkatanForm} className="btn-close scale-75 shadow-none" aria-label="Tutup"></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-bold text-xxs text-muted text-uppercase mb-1" htmlFor={tingkatanNamaId}>Nama Tingkatan</label>
                  <input id={tingkatanNamaId} type="text" className="form-control form-control-sm bg-light border-0 py-2 rounded-3 shadow-none" placeholder="Contoh: X, XI, XII" value={tingkatanFormData.nama_tingkatan} onChange={(e) => setTingkatanFormData({...tingkatanFormData, nama_tingkatan: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer border-0 p-4 pt-0">
                <button onClick={handleTingkatanSave} className="btn btn-primary btn-sm w-100 py-[10px] rounded-3 shadow-sm fw-bold d-flex align-items-center justify-content-center gap-2" disabled={tingkatanIsSubmitting}>
                  {tingkatanIsSubmitting ? <Loader2 size={14} className="animate-spin" /> : (tingkatanIsEdit ? "Perbarui Data" : "Simpan Data Tingkatan")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
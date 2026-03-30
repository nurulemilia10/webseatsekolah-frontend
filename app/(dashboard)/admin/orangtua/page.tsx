"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useId,
  memo,
  useMemo,
  useRef
} from 'react';

import { 
  Plus,
  Edit2,
  Loader2,
  Users,
  Trash2,
  FileDown,
  FileUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Phone,
  XCircle,
  UserPlus,
  MinusCircle
} from 'lucide-react';

import api from '@/lib/api';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/useAuth';
import { fileHelper } from '@/lib/file-helper';

const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";

interface AnakItem {
  siswa_id: string;
  nis: string;
  nama_lengkap: string;
  hubungan: 'ayah' | 'ibu' | 'wali';
}

interface OrangtuaFormData {
  nama_lengkap: string;
  telepon: string;
  is_active: boolean;
  anak: AnakItem[];
}

const OrangtuaRow = memo(({ 
  item, 
  onEdit, 
  onDelete, 
  isSelected, 
  onSelect,
  activeFilters
}: { 
  item: any; 
  onEdit: (i: any) => void; 
  onDelete: (id: string) => void; 
  isSelected: boolean; 
  onSelect: (id: string) => void;
  activeFilters: any;
}) => {
  const avatarSrc = item.foto_url || DEFAULT_AVATAR;

  const filteredAnak = useMemo(() => {
    if (!item.anak || item.anak.length === 0) return [];
    let result = item.anak;
    if (activeFilters.kelas_id) {
      result = result.filter((a: any) => String(a.kelas?.id) === String(activeFilters.kelas_id));
    }
    if (activeFilters.jurusan_id) {
      result = result.filter((a: any) => String(a.kelas?.jurusan?.id || a.kelas?.jurusan_id) === String(activeFilters.jurusan_id));
    }
    if (activeFilters.tingkatan_id) {
      result = result.filter((a: any) => String(a.kelas?.tingkatan?.id || a.kelas?.tingkatan_id) === String(activeFilters.tingkatan_id));
    }
    return result;
  }, [item.anak, activeFilters]);

  return (
    <tr>
      <td className="ps-2 py-1 text-center w-30px">
        <input 
          type="checkbox" 
          className="form-check-input border-secondary shadow-none cursor-pointer m-0" 
          checked={isSelected} 
          onChange={() => onSelect(item.id)}
          aria-label="Pilih baris"
        />
      </td>
      <td className="py-1">
        <div className="d-flex align-items-center">
          <div className="symbol symbol-circle overflow-hidden bg-light me-2 flex-shrink-0 avatar-sm">
            <img 
              src={avatarSrc}
              alt={item.nama_lengkap}
              className="w-100 h-100 object-cover"
              onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
            />
          </div>
          <div className="text-dark fw-bold text-xxs text-truncate">
            {item.nama_lengkap}
          </div>
        </div>
      </td>
      <td className="py-1 text-xxs text-muted">
        <div className="d-flex align-items-center gap-1">
            <Phone size={10} />
            {item.telepon || '-'}
        </div>
      </td>
      <td className="py-1 text-xxs d-none d-md-table-cell">
        <div className="d-flex flex-column gap-0.5">
            {filteredAnak.length > 0 ? (
                filteredAnak.map((a: any, idx: number) => (
                    <div key={idx} className="d-flex flex-column">
                        <span className="text-xxs fw-medium text-dark">{a.nama_lengkap || a.nama || '-'}</span>
                        <span className="text-muted text-9px">
                            {a.hubungan ? `(${a.hubungan})` : ''} {a.nis || a.siswa?.nis || ''}
                        </span>
                        <span className="text-muted text-9px">
                            {a.kelas?.nama || '-'} {a.kelas?.jurusan?.nama ? `- ${a.kelas.jurusan.nama}` : ''}
                        </span>
                    </div>
                ))
            ) : (
                <span className="text-muted text-xxs">-</span>
            )}
        </div>
      </td>
      <td className="py-1 text-center">
        {item.is_active 
          ? <span className="badge bg-success bg-opacity-10 text-success px-1.5 py-0.5 text-9px">Aktif</span> 
          : <span className="badge bg-danger bg-opacity-10 text-danger px-1.5 py-0.5 text-9px">Non-Aktif</span>
        }
      </td>
      <td className="py-1 text-end pe-2">
        <div className="d-flex justify-content-end gap-0.5">
          <button 
            onClick={() => onEdit(item)} 
            className="btn btn-sm p-0.5 text-primary border-0 shadow-none"
            aria-label="Edit data"
            title="Edit data"
          >
            <span className="bg-light p-0.5 rounded-1 d-inline-flex">
              <Edit2 size={10}/>
            </span>
          </button>
          <button 
            onClick={() => onDelete(item.id)} 
            className="btn btn-sm p-0.5 text-danger border-0 shadow-none"
            aria-label="Hapus data"
            title="Hapus data"
          >
            <span className="bg-danger bg-opacity-10 p-0.5 rounded-1 d-inline-flex">
              <Trash2 size={10}/>
            </span>
          </button>
        </div>
      </td>
    </tr>
  );
});

OrangtuaRow.displayName = 'OrangtuaRow';

export default function ManajemenOrangtua() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any[]>([]);
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [searchSiswa, setSearchSiswa] = useState('');
  const [foundSiswa, setFoundSiswa] = useState<any[]>([]);
  const siswaCacheRef = useRef<Map<string, any[]>>(new Map());
  const abortRef = useRef<AbortController | null>(null);

  const [filters, setFilters] = useState({
    is_active: '',
    tingkatan_id: '',
    jurusan_id: '',
    kelas_id: ''
  });

  const [listTingkat, setListTingkat] = useState<any[]>([]);
  const [listJurusan, setListJurusan] = useState<any[]>([]);
  const [listKelas, setListKelas] = useState<any[]>([]);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10
  });

  const [formData, setFormData] = useState<OrangtuaFormData>({
    nama_lengkap: '',
    telepon: '',
    is_active: true,
    anak: []
  });

  const filterIds = {
    status: useId(),
    tingkatan: useId(),
    jurusan: useId(),
    kelas: useId()
  };

  const formIds = {
    nama: useId(),
    telepon: useId()
  };

  const processedPreviewData = useMemo(() => {
    if (!previewData) return [];
    return previewData.map(item => {
      const errors = item.errors || [];
      const warnings = item.warnings || [];
      const is_nama_error = errors.some((e: string) => 
        e.toLowerCase().includes('nama lengkap')
      );
      const is_telepon_error = errors.some((e: string) => 
        e.toLowerCase().includes('telepon')
      );
      const is_anak_error = errors.some((e: string) => 
        e.toLowerCase().includes('siswa') || e.toLowerCase().includes('nis')
      );
      const is_telepon_warning = warnings.some((w: string) => 
        w.toLowerCase().includes('telepon')
      );
      return {
        ...item,
        is_nama_error,
        is_telepon_error,
        is_anak_error,
        is_telepon_warning,
        hasConflict: !item.is_valid
      };
    });
  }, [previewData]);

  const hasImportConflict = useMemo(
    () => processedPreviewData.some(item => item.hasConflict),
    [processedPreviewData]
  );

  const Toast = useMemo(
    () => Swal.mixin({
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    }),
    []
  );

  const fetchDependencies = useCallback(async () => {
    try {
      const resTingkat = await api.admin.tingkatan.getAll({ paginate: 0 });
      const rawTingkat = resTingkat.data?.success
        ? resTingkat.data.data
        : (resTingkat.data?.data || resTingkat.data || []);
      const formattedTingkat = Array.isArray(rawTingkat)
        ? rawTingkat.map((item: any) => ({
            id: item.id,
            nama: item.nama_tingkatan || item.nama_tingkat || item.nama || item.name || item.tingkat || '-'
          }))
        : [];
      setListTingkat(formattedTingkat);

      const resKelas = await api.admin.kelas.getAll({ paginate: 0 });
      const rawKelas = resKelas.data?.success
        ? resKelas.data.data
        : (resKelas.data?.data || resKelas.data || []);
      const formattedKelas = Array.isArray(rawKelas)
        ? rawKelas.map((item: any) => ({
            id: item.id,
            nama: item.nama_kelas || item.nama || item.name || '-'
          }))
        : [];
      setListKelas(formattedKelas);

      const resJurusan = await api.admin.jurusan.getAll({ paginate: 0 });
      const rawJurusan = resJurusan.data?.success
        ? resJurusan.data.data
        : (resJurusan.data?.data || resJurusan.data || []);
      setListJurusan(Array.isArray(rawJurusan) ? rawJurusan : []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  const fetchData = useCallback(async (page = 1) => {
    if (authLoading || !user) return;
    setLoading(true);
    try {
      const params: any = { page, per_page: pagination.perPage, q: search };
      if (filters.is_active !== '') params.is_active = filters.is_active;
      if (filters.tingkatan_id) params.tingkatan_id = filters.tingkatan_id;
      if (filters.jurusan_id) params.jurusan_id = filters.jurusan_id;
      if (filters.kelas_id) params.kelas_id = filters.kelas_id;
      const res = await api.admin.orangtua.getAll(params);
      if (res?.data?.success) {
        setData(res.data.data || []);
        setSelectedIds([]);
        if (res.data.meta) {
          setPagination({
            perPage: res.data.meta.per_page,
            currentPage: res.data.meta.current_page,
            lastPage: res.data.meta.last_page,
            total: res.data.meta.total
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [authLoading, user, search, pagination.perPage, filters]);

  const searchSiswaApi = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setFoundSiswa([]);
      return;
    }
    const cached = siswaCacheRef.current.get(query);
    if (cached) {
      setFoundSiswa(cached);
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await api.admin.siswa.getAll({ search: query, per_page: 10, signal: controller.signal });
      if (controller.signal.aborted) return;
      const result = res.data?.data || [];
      siswaCacheRef.current.set(query, result);
      if (siswaCacheRef.current.size > 30) {
        const firstKey = siswaCacheRef.current.keys().next().value;
        if (firstKey) siswaCacheRef.current.delete(firstKey);
      }
      setFoundSiswa(result);
    } catch (e: any) {
      if (e.name !== 'AbortError' && e.code !== 'ERR_CANCELED') {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    const d = setTimeout(() => fetchData(1), 400);
    return () => clearTimeout(d);
  }, [search, filters, fetchData]);

  useEffect(() => {
    if (searchSiswa.length >= 2) {
      const d = setTimeout(() => searchSiswaApi(searchSiswa), 120);
      return () => clearTimeout(d);
    } else {
      setFoundSiswa([]);
    }
  }, [searchSiswa, searchSiswaApi]);

  const handlePageChange = (page: number) => fetchData(page);

  const handleSelectOne = useCallback(
    (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]),
    []
  );

  const handleSelectAll = useCallback(
    () => selectedIds.length === data.length ? setSelectedIds([]) : setSelectedIds(data.map(i => i.id)),
    [data, selectedIds]
  );

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const result = await Swal.fire({
      title: `Hapus ${selectedIds.length} Orang Tua?`,
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
        await api.admin.orangtua.bulkDelete(selectedIds);
        Toast.fire({ icon: 'success', title: 'Berhasil hapus massal' });
        fetchData(1);
      } catch (e) {
        Toast.fire({ icon: 'error', title: 'Gagal hapus massal' });
      } finally {
        Swal.close();
      }
    }
  };

  const resetForm = useCallback(() => {
    setFormData({
      nama_lengkap: '',
      telepon: '',
      is_active: true,
      anak: []
    });
    setFormErrors({});
    setSearchSiswa('');
    setFoundSiswa([]);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setIsEdit(false);
    setCurrentId(null);
    resetForm();
  }, [resetForm]);

  const handleEditClick = useCallback(async (item: any) => {
    setIsEdit(true);
    setCurrentId(item.id);
    setFormData({
      nama_lengkap: item.nama_lengkap || '',
      telepon: item.telepon || '',
      is_active: !!item.is_active,
      anak: item.anak?.map((a: any) => ({
          siswa_id: a.siswa_id || a.id,
          nis: a.nis || a.siswa?.nis,
          nama_lengkap: a.nama_lengkap || a.nama || a.siswa?.nama_lengkap,
          hubungan: a.hubungan || 'ayah'
      })) || []
    });
    setFormErrors({});
    setShowForm(true);
  }, []);

  const handleExport = async () => {
    try {
      const params: any = { q: search };
      if (filters.is_active !== '') params.is_active = filters.is_active;
      if (filters.tingkatan_id) params.tingkatan_id = filters.tingkatan_id;
      if (filters.jurusan_id) params.jurusan_id = filters.jurusan_id;
      if (filters.kelas_id) params.kelas_id = filters.kelas_id;
      const res = await api.admin.orangtua.export(params);
      fileHelper.download(res);
      Toast.fire({ icon: 'success', title: 'Berhasil diekspor' });
    } catch (e) {
      Toast.fire({ icon: 'error', title: 'Gagal ekspor' });
    }
  };

  const handleImportRequest = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fData = fileHelper.prepareImport(e);
    if (!fData) return;
    Swal.fire({ title: 'Membaca File...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await api.admin.orangtua.importPreview(fData);
      if (res.data?.data) {
        setPreviewData(res.data.data);
        setImportFile(fData);
        Swal.close();
      }
    } catch (e: any) {
      Swal.close();
      Toast.fire({ icon: 'error', title: e.response?.data?.message || 'Gagal membaca file' });
    } finally {
      e.target.value = '';
    }
  };

  const confirmImport = async () => {
    if (!importFile || hasImportConflict) return;
    setIsSubmitting(true);
    Swal.fire({ title: 'Mengimpor Data...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await api.admin.orangtua.import(importFile);
      if (res.data?.success) {
        Swal.close();
        Toast.fire({ icon: 'success', title: 'Berhasil diimpor' });
        setPreviewData(null);
        setImportFile(null);
        fetchData(1);
      }
    } catch (e) {
      Swal.close();
      Toast.fire({ icon: 'error', title: 'Gagal impor' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Orang Tua?',
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
        await api.admin.orangtua.delete(id);
        fetchData(pagination.currentPage);
        Toast.fire({ icon: 'success', title: 'Berhasil dihapus' });
      } catch (e) {
        Toast.fire({ icon: 'error', title: 'Gagal menghapus' });
      }
    }
  };

  const handleAddAnak = (siswa: any) => {
    if (formData.anak.find(a => a.siswa_id === siswa.id)) {
        Toast.fire({ icon: 'warning', title: 'Siswa sudah ditambahkan' });
        return;
    }
    setFormData(prev => ({
        ...prev,
        anak: [...prev.anak, {
            siswa_id: siswa.id,
            nis: siswa.nis,
            nama_lengkap: siswa.nama_lengkap,
            hubungan: 'ayah'
        }]
    }));
    setSearchSiswa('');
    setFoundSiswa([]);
  };

  const handleRemoveAnak = (siswaId: string) => {
    setFormData(prev => ({
        ...prev,
        anak: prev.anak.filter(a => a.siswa_id !== siswaId)
    }));
  };

  const handleAnakHubunganChange = (siswaId: string, hubungan: string) => {
    setFormData(prev => ({
        ...prev,
        anak: prev.anak.map(a => a.siswa_id === siswaId ? {...a, hubungan: hubungan as any} : a)
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const dataToSubmit = {
      nama_lengkap: formData.nama_lengkap,
      telepon: formData.telepon,
      is_active: formData.is_active,
      anak: formData.anak.map(a => ({
        nis: a.nis,
        hubungan: a.hubungan
      }))
    };
    try {
      const res = isEdit && currentId
        ? await api.admin.orangtua.update(currentId, dataToSubmit)
        : await api.admin.orangtua.create(dataToSubmit);
      if (res.status < 300 || res.data?.success) {
        Toast.fire({ icon: 'success', title: 'Berhasil disimpan' });
        handleCloseForm();
        fetchData(1);
      }
    } catch (err: any) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        Toast.fire({ icon: 'error', title: 'Kesalahan sistem' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFilters = () => {
    setFilters({ is_active: '', tingkatan_id: '', jurusan_id: '', kelas_id: '' });
    setSearch('');
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length + (search ? 1 : 0);

  if (authLoading) return null;

  return (
    <>
      <style jsx global>{`
        .w-30px { width: 30px; }
        .avatar-sm { width: 28px; height: 28px; min-width: 28px; border-radius: 50%; }
        .text-9px { font-size: 9px; }
        .text-10px { font-size: 10px; }
        .text-11px { font-size: 11px; }
        .text-12px { font-size: 12px; }
        .text-13px { font-size: 13px; }
        .badge-filter-count { font-size: 8px; width: 14px; height: 14px; }
        .min-w-120px { min-width: 120px; }
        .modal-backdrop-custom { position: fixed; inset: 0; background-color: transparent; z-index: 1100; display: flex; align-items: center; justify-content: center; }
        .modal-dialog-centered-custom { max-width: 500px; width: 100%; padding: 0 1rem; pointer-events: auto; }
        .modal-content-custom { display: flex; flex-direction: column; width: 100%; max-height: 90vh; background-color: #fff; border-radius: 1rem; overflow: hidden; box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15); }
        .modal-body-scrollable { flex: 1 1 auto; overflow-y: auto; min-height: 0; -webkit-overflow-scrolling: touch; }
        .modal-footer-sticky { position: relative; z-index: 10; border-top: 1px solid #f8f9fa; }
        .max-h-300 { max-height: 300px; }
        .max-h-150 { max-height: 150px; }
      `}</style>
      <div className="container-fluid py-2 px-2 px-md-3">
        <div className="card border-0 shadow-sm rounded-3 mb-2">
          <div className="card-body p-2">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-primary bg-opacity-10 p-1.5 rounded-2">
                  <Users size={16} className="text-primary" />
                </div>
                <div>
                  <h5 className="fw-bold text-dark mb-0 fs-6">Manajemen Orang Tua</h5>
                  <p className="text-muted mb-0 text-10px">Kelola data orang tua/wali</p>
                </div>
              </div>

              <div className="d-flex flex-wrap align-items-center gap-1 justify-content-end">
                <div className="position-relative min-w-120px">
                  <Search size={10} className="position-absolute top-50 start-0 ms-2 translate-middle-y text-muted" />
                  <input
                    type="text"
                    className="form-control form-control-sm ps-4 border-0 bg-light rounded-2 shadow-none"
                    placeholder="Cari nama, telepon, NIS..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn btn-sm px-1.5 py-0.5 rounded-2 border d-flex align-items-center gap-1 ${showFilters || activeFilterCount > 0 ? 'btn-primary border-primary' : 'btn-light'}`}
                  aria-label="Tampilkan filter"
                  title="Filter"
                >
                  <Filter size={10}/>
                  <span className="d-none d-sm-inline text-10px">Filter</span>
                  {activeFilterCount > 0 && (
                    <span className="badge bg-white text-primary rounded-circle p-0.5 badge-filter-count">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <div className="vr d-none d-sm-block mx-0.5"></div>

                <button
                  onClick={handleExport}
                  className="btn btn-success btn-sm px-1.5 py-0.5 rounded-2 border-0 d-flex align-items-center gap-1"
                  aria-label="Ekspor data"
                  title="Ekspor"
                >
                  <FileDown size={10}/>
                  <span className="d-none d-sm-inline text-10px">Ekspor</span>
                </button>

                <label className="btn btn-light btn-sm px-1.5 py-0.5 rounded-2 cursor-pointer mb-0 border d-flex align-items-center gap-1" aria-label="Impor data" title="Impor">
                  <FileUp size={10}/>
                  <span className="d-none d-sm-inline text-10px">Impor</span>
                  <input type="file" className="d-none" accept=".xlsx, .xls, .csv" onChange={handleImportRequest} />
                </label>

                <button
                  onClick={() => { resetForm(); setShowForm(true); }}
                  className="btn btn-primary btn-sm px-1.5 py-0.5 rounded-2 d-flex align-items-center gap-1"
                  aria-label="Tambah data baru"
                  title="Tambah"
                >
                  <Plus size={10}/>
                  <span className="text-10px">Tambah</span>
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-2 pt-2 border-top">
                <div className="row g-1 align-items-end">
                  <div className="col-6 col-md-4 col-lg col-xl-2">
                    <label htmlFor={filterIds.jurusan} className="text-xxs fw-bold text-muted text-uppercase mb-0.5">Jurusan</label>
                    <select
                      id={filterIds.jurusan}
                      className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none"
                      value={filters.jurusan_id}
                      onChange={(e) => setFilters({...filters, jurusan_id: e.target.value})}
                    >
                      <option value="">Semua</option>
                      {listJurusan.map((j: any) => (
                        <option key={j.id} value={j.id}>{j.nama || j.nama_jurusan}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-6 col-md-4 col-lg col-xl-2">
                    <label htmlFor={filterIds.tingkatan} className="text-xxs fw-bold text-muted text-uppercase mb-0.5">Tingkat</label>
                    <select
                      id={filterIds.tingkatan}
                      className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none"
                      value={filters.tingkatan_id}
                      onChange={(e) => setFilters({...filters, tingkatan_id: e.target.value})}
                    >
                      <option value="">Semua</option>
                      {listTingkat.map((t: any) => (
                        <option key={t.id} value={t.id}>{t.nama}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-6 col-md-4 col-lg col-xl-2">
                    <label htmlFor={filterIds.kelas} className="text-xxs fw-bold text-muted text-uppercase mb-0.5">Kelas</label>
                    <select
                      id={filterIds.kelas}
                      className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none"
                      value={filters.kelas_id}
                      onChange={(e) => setFilters({...filters, kelas_id: e.target.value})}
                    >
                      <option value="">Semua</option>
                      {listKelas.map((k: any) => (
                        <option key={k.id} value={k.id}>{k.nama}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-6 col-md-4 col-lg col-xl-2">
                    <label htmlFor={filterIds.status} className="text-xxs fw-bold text-muted text-uppercase mb-0.5">Status Aktif</label>
                    <select
                      id={filterIds.status}
                      className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none"
                      value={filters.is_active}
                      onChange={(e) => setFilters({...filters, is_active: e.target.value})}
                    >
                      <option value="">Semua</option>
                      <option value="1">Aktif</option>
                      <option value="0">Non-Aktif</option>
                    </select>
                  </div>

                  <div className="col-6 col-md-4 col-lg col-xl-2 ms-auto">
                    <button
                      onClick={resetFilters}
                      className="btn btn-sm btn-outline-secondary border-0 rounded-2 d-flex align-items-center gap-1 shadow-none text-dark bg-light py-1 px-1.5 w-100 justify-content-center"
                      aria-label="Reset filter"
                      title="Reset"
                    >
                      <RefreshCw size={9}/>
                      <span className="text-10px">Reset</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="mb-2">
            <button
              onClick={handleBulkDelete}
              className="btn btn-danger btn-sm px-2 py-0.5 rounded-2 shadow-sm border-0 d-flex align-items-center gap-1 fw-bold"
              aria-label={`Hapus ${selectedIds.length} data terpilih`}
              title="Hapus terpilih"
            >
              <Trash2 size={10} /> Hapus ({selectedIds.length})
            </button>
          </div>
        )}

        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 text-11px">
              <thead className="bg-light">
                <tr className="text-xxs fw-bold text-muted text-uppercase">
                  <th className="ps-2 border-0 py-1.5 w-30px">
                    <input
                      type="checkbox"
                      className="form-check-input border-secondary shadow-none m-0 cursor-pointer"
                      checked={data.length > 0 && selectedIds.length === data.length}
                      onChange={handleSelectAll}
                      aria-label="Pilih semua"
                    />
                  </th>
                  <th className="border-0 py-1.5">Nama</th>
                  <th className="border-0 py-1.5">Telepon</th>
                  <th className="border-0 py-1.5 d-none d-md-table-cell">Anak</th>
                  <th className="border-0 py-1.5 text-center">Status</th>
                  <th className="border-0 py-1.5 text-end pe-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <Loader2 className="text-primary animate-spin mx-auto" size={16} />
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      Tidak ada data ditemukan.
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <OrangtuaRow
                      key={item.id}
                      item={item}
                      onEdit={handleEditClick}
                      onDelete={handleDelete}
                      isSelected={selectedIds.includes(item.id)}
                      onSelect={handleSelectOne}
                      activeFilters={filters}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {!loading && data.length > 0 && (
            <div className="d-flex flex-row justify-content-between align-items-center px-2 py-1 border-top bg-white">
              <div className="text-muted text-10px text-truncate me-2">
                Menampilkan {data.length} dari {pagination.total} data
              </div>
              <nav className="d-flex align-items-center gap-0.5 flex-shrink-0">
                <button
                  className="btn btn-light btn-sm border-0 shadow-none p-0.5 rounded-2"
                  disabled={pagination.currentPage === 1}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  aria-label="Halaman sebelumnya"
                  title="Sebelumnya"
                >
                  <ChevronLeft size={12} />
                </button>
                <div className="d-flex gap-0.5">
                  {[...Array(pagination.lastPage)].map((_, i) => {
                    const p = i + 1;
                    if (p === 1 || p === pagination.lastPage || (p >= pagination.currentPage - 1 && p <= pagination.currentPage + 1)) {
                      return (
                        <button
                          key={p}
                          onClick={() => handlePageChange(p)}
                          className={`btn btn-sm px-1.5 py-0.5 rounded-2 fw-bold ${pagination.currentPage === p ? 'btn-primary' : 'btn-light'} text-10px`}
                          aria-label={`Halaman ${p}`}
                          title={`Halaman ${p}`}
                        >
                          {p}
                        </button>
                      );
                    }
                    if (p === pagination.currentPage - 2 || p === pagination.currentPage + 2) {
                      return <span key={p} className="px-0.5 text-muted">...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  className="btn btn-light btn-sm border-0 shadow-none p-0.5 rounded-2"
                  disabled={pagination.currentPage === pagination.lastPage}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  aria-label="Halaman berikutnya"
                  title="Berikutnya"
                >
                  <ChevronRight size={12} />
                </button>
              </nav>
            </div>
          )}
        </div>

        {processedPreviewData && processedPreviewData.length > 0 && (
          <div className="modal fade show d-block bg-transparent z-[1070]">
            <div className="modal-dialog modal-lg modal-dialog-centered px-3">
              <div className="modal-content border-0 shadow-lg rounded-3">
                <div className="modal-header border-0 pb-0 px-3 pt-3">
                  <div className="d-flex align-items-center">
                    <Eye size={16} className="text-primary me-2" />
                    <h6 className="modal-title fw-bold text-dark">Preview Import Orang Tua</h6>
                  </div>
                  <button onClick={() => setPreviewData(null)} className="btn-close scale-75 shadow-none" aria-label="Tutup preview" title="Tutup"></button>
                </div>
                <div className="modal-body p-3">
                  <div className={`alert ${hasImportConflict ? 'alert-danger' : 'alert-light bg-light'} border-0 rounded-3 py-2 px-3 mb-3`}>
                    <div className="d-flex align-items-center gap-2">
                      {hasImportConflict ? <XCircle size={14} className="text-danger" /> : <AlertCircle size={14} className="text-muted" />}
                      <span className={`text-xxs fw-bold ${hasImportConflict ? 'text-danger' : 'text-muted'}`}>
                        {hasImportConflict 
                          ? 'Terdapat data error. Mohon perbaiki file Anda.' 
                          : `${processedPreviewData.length} baris data siap diimpor.`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="table-responsive border rounded-3 max-h-300">
                    <table className="table table-sm table-hover mb-0">
                      <thead className="bg-light sticky-top">
                        <tr className="text-xxs">
                          <th className="ps-3 py-2 border-0">Nama Lengkap</th>
                          <th className="py-2 border-0">Telepon</th>
                          <th className="py-2 border-0">NIS Anak</th>
                          <th className="py-2 border-0">Catatan</th>
                        </tr>
                      </thead>
                      <tbody className="text-11px">
                        {processedPreviewData.map((item, idx) => (
                           <tr key={idx} className={item.hasConflict ? 'bg-danger bg-opacity-10' : ''}>
                              <td className={`ps-3 py-[6px] ${item.is_nama_error ? 'bg-danger bg-opacity-25 text-danger fw-bold' : ''}`}>
                                  <div className="d-flex align-items-center gap-1">
                                      {item.data?.nama_lengkap || '-'}
                                      {item.is_nama_error && <XCircle size={10} className="text-danger" />}
                                  </div>
                              </td>
                              <td className={`py-[6px] ${item.is_telepon_error ? 'bg-danger bg-opacity-25 text-danger fw-bold' : item.is_telepon_warning ? 'bg-warning bg-opacity-15 text-warning fw-medium' : 'text-muted'}`}>
                                  <div className="d-flex align-items-center gap-1">
                                      {item.data?.telepon || '-'}
                                      {item.is_telepon_error && <XCircle size={10} className="text-danger" />}
                                      {item.is_telepon_warning && <AlertCircle size={10} className="text-warning" />}
                                  </div>
                              </td>
                              <td className={`py-[6px] ${item.is_anak_error ? 'bg-danger bg-opacity-25 text-danger fw-bold' : 'text-muted'}`}>
                                  <div className="d-flex align-items-center gap-1">
                                      {item.data?.nis_anak || '-'}
                                      {item.is_anak_error && <XCircle size={10} className="text-danger" />}
                                  </div>
                              </td>
                               <td className="py-[6px] text-9px">
                                  {item.errors?.length > 0 && (
                                    <div className="text-danger">
                                        {item.errors.map((e: string, ei: number) => (
                                          <div key={ei}>{e}</div>
                                        ))}
                                    </div>
                                  )}
                                  {item.warnings?.length > 0 && (
                                    <div className="text-warning">
                                        {item.warnings.map((w: string, wi: number) => (
                                          <div key={wi}>{w}</div>
                                        ))}
                                    </div>
                                  )}
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
                      <button onClick={() => setPreviewData(null)} className="btn btn-light btn-sm w-100 py-2 rounded-3 fw-bold text-muted border text-11px" aria-label="Batal impor" title="Batal">Batal</button>
                    </div>
                    <div className="col-6">
                      <button 
                        onClick={confirmImport} 
                        className={`btn btn-primary btn-sm w-100 py-2 rounded-3 shadow-none fw-bold d-flex align-items-center justify-content-center gap-2 text-11px ${hasImportConflict ? 'opacity-50 cursor-not-allowed' : ''}`} 
                        disabled={isSubmitting || hasImportConflict}
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
          <div className="modal-backdrop-custom">
            <div className="modal-dialog-centered-custom">
              <div className="modal-content-custom">
                <div className="d-flex justify-content-between align-items-center p-3 pb-0">
                  <h6 className="fw-bold text-dark d-flex align-items-center gap-2 m-0 text-13px">
                    <div className="bg-primary bg-opacity-10 p-1 rounded-2">
                      {isEdit ? <Edit2 size={12} className="text-primary"/> : <Plus size={12} className="text-primary"/>}
                    </div>
                    {isEdit ? "Edit Data" : "Tambah Orang Tua"}
                  </h6>
                  <button onClick={handleCloseForm} className="btn-close shadow-none" aria-label="Tutup form" title="Tutup"></button>
                </div>

                <div className="px-3 py-2 modal-body-scrollable">
                  <div className="row g-2 pb-3">
                    <div className="col-12">
                      <label htmlFor={formIds.nama} className="fw-bold text-10px text-muted mb-0">Nama Lengkap <span className="text-danger">*</span></label>
                      <input type="text" id={formIds.nama} className="form-control form-control-sm bg-light border-0 py-1 text-11px rounded-2 shadow-none" value={formData.nama_lengkap} onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})} />
                      {formErrors.nama_lengkap && <div className="text-danger text-9px mt-0.5">{formErrors.nama_lengkap}</div>}
                    </div>

                    <div className="col-12">
                      <label htmlFor={formIds.telepon} className="fw-bold text-10px text-muted mb-0">No. Telepon <span className="text-danger">*</span></label>
                      <input type="text" id={formIds.telepon} className="form-control form-control-sm bg-light border-0 py-1 text-11px rounded-2 shadow-none" value={formData.telepon} onChange={(e) => setFormData({...formData, telepon: e.target.value})} />
                      {formErrors.telepon && <div className="text-danger text-9px mt-0.5">{formErrors.telepon}</div>}
                    </div>

                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input className="form-check-input shadow-none cursor-pointer" type="checkbox" id="statusSwitch" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} />
                        <label className="form-check-label fw-bold text-10px cursor-pointer" htmlFor="statusSwitch">
                          {formData.is_active ? 'Status Aktif' : 'Status Non-Aktif'}
                        </label>
                      </div>
                    </div>

                    <div className="col-12 pt-2 border-top mt-2">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-10px fw-bold text-primary text-uppercase">Daftar Anak</span>
                        </div>
                        
                        <div className="mb-2">
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-light border-0"><Search size={10}/></span>
                                <input 
                                    type="text" 
                                    className="form-control form-control-sm bg-light border-0 shadow-none" 
                                    placeholder="Cari siswa (NIS/Nama)..."
                                    value={searchSiswa}
                                    onChange={(e) => setSearchSiswa(e.target.value)}
                                />
                            </div>
                            {foundSiswa.length > 0 && (
                                <div className="list-group list-group-flush border rounded-2 mt-1 max-h-150 overflow-auto">
                                    {foundSiswa.map((s: any) => (
                                        <button 
                                            key={s.id} 
                                            type="button"
                                            className="list-group-item list-group-item-action text-xxs py-1 px-2 d-flex justify-content-between align-items-center"
                                            onClick={() => handleAddAnak(s)}
                                            aria-label={`Tambah ${s.nama_lengkap}`}
                                            title={`Tambah ${s.nama_lengkap}`}
                                        >
                                            <div>
                                                <div className="fw-bold text-dark">{s.nama_lengkap}</div>
                                                <div className="text-muted">{s.nis} - {s.kelas?.nama || '-'}</div>
                                            </div>
                                            <UserPlus size={12} className="text-primary"/>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {formData.anak.length > 0 && (
                            <div className="d-flex flex-column gap-1">
                                {formData.anak.map((a, idx) => (
                                    <div key={idx} className="d-flex align-items-center gap-1 p-1 bg-light rounded-2">
                                        <div className="flex-grow-1">
                                            <div className="fw-bold text-dark text-10px">{a.nama_lengkap}</div>
                                            <div className="text-muted text-9px">{a.nis}</div>
                                        </div>
                                        <select 
                                            className="form-select form-select-sm w-auto bg-white border-0 shadow-none text-9px py-0"
                                            value={a.hubungan}
                                            onChange={(e) => handleAnakHubunganChange(a.siswa_id, e.target.value)}
                                            aria-label={`Hubungan dengan ${a.nama_lengkap}`}
                                        >
                                            <option value="ayah">Ayah</option>
                                            <option value="ibu">Ibu</option>
                                            <option value="wali">Wali</option>
                                        </select>
                                        <button type="button" className="btn btn-sm p-0 text-danger" onClick={() => handleRemoveAnak(a.siswa_id)} aria-label={`Hapus ${a.nama_lengkap}`} title={`Hapus ${a.nama_lengkap}`}>
                                            <MinusCircle size={14}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                  </div>
                </div>

                <div className="p-3 pt-1 flex-shrink-0 bg-white modal-footer-sticky">
                  <button
                    onClick={handleSave}
                    className="btn btn-primary btn-sm w-100 py-2 rounded-3 shadow-sm fw-bold d-flex align-items-center justify-content-center gap-2 text-12px"
                    disabled={isSubmitting}
                    aria-label={isEdit ? "Perbarui data orang tua" : "Simpan data orang tua"}
                    title={isEdit ? "Perbarui" : "Simpan"}
                  >
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : (isEdit ? "Perbarui Data" : "Simpan Data")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
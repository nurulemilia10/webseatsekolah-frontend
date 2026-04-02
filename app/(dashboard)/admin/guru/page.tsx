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
  User,
  X,
  Phone,
  Mail,
  Crop,
  XCircle
} from 'lucide-react';

import Cropper from 'react-easy-crop';

import api from '@/lib/api';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/useAuth';
import { fileHelper } from '@/lib/file-helper';
import { getCroppedImg, getBase64FromUrl } from '@/app/utils/imageUtils';

const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";

interface GuruFormData {
  nip: string;
  nuptk: string;
  nama: string;
  no_hp: string;
  email: string;
  alamat_lengkap: string;
  jenis_kelamin: 'L' | 'P' | '';
  tempat_lahir: string;
  tanggal_lahir: string;
  agama: string;
  pendidikan_terakhir: string;
  jabatan_fungsional: string;
  status_kepegawaian: string;
  jurusan_id: string;
  is_active: boolean;
  foto: File | null;
}

const GuruRow = memo(({ 
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
}) => {
  const avatarSrc = item.foto_url || DEFAULT_AVATAR;
  const jkValue = item.jenis_kelamin;
  const displayJK = (jkValue === 'L' || jkValue === 'Laki-laki') 
    ? 'Laki-laki' 
    : (jkValue === 'P' || jkValue === 'Perempuan') 
      ? 'Perempuan' 
      : '-';

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
              alt={item.nama}
              className="w-100 h-100 object-cover"
              onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
            />
          </div>
          <div className="text-dark fw-bold text-xxs text-truncate">
            {item.nama}
          </div>
        </div>
      </td>
      <td className="py-1 text-xxs text-muted">
        {item.nip || '-'}
      </td>
      <td className="py-1 text-xxs text-muted d-none d-md-table-cell">
        {item.nuptk || '-'}
      </td>
      <td className="py-1 text-xxs d-none d-md-table-cell">
        {displayJK}
      </td>
      <td className="py-1 text-xxs d-none d-xl-table-cell">
        <div className="text-truncate mw-100px">
          {item.tempat_lahir || '-'}
        </div>
        <div className="text-muted text-9px">
          {item.tanggal_lahir || '-'}
        </div>
      </td>
      <td className="py-1 text-xxs d-none d-xxl-table-cell">
        {item.agama || '-'}
      </td>
      <td className="py-1 text-xxs text-truncate d-none d-xxl-table-cell mw-120px">
        {item.alamat_lengkap || '-'}
      </td>
      <td className="py-1 text-xxs d-none d-xl-table-cell">
        {item.pendidikan_terakhir || '-'}
      </td>
      <td className="py-1 d-none d-md-table-cell">
        <div className="text-xxs fw-medium text-dark">
          {item.jabatan_fungsional || '-'}
        </div>
        <div className="text-muted text-9px">
          {item.jurusan?.nama_jurusan || 'Umum'} {item.status_kepegawaian ? `| ${item.status_kepegawaian}` : ''}
        </div>
      </td>
      <td className="py-1 d-none d-lg-table-cell">
        <div className="d-flex flex-column gap-0.5">
          {item.email && (
            <div className="d-flex align-items-center gap-1 text-muted text-9px">
              <Mail size={9} /> 
              <span className="text-truncate mw-100px">{item.email}</span>
            </div>
          )}
          {item.no_hp && (
            <div className="d-flex align-items-center gap-1 text-muted text-9px">
              <Phone size={9} /> 
              <span>{item.no_hp}</span>
            </div>
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

GuruRow.displayName = 'GuruRow';

export default function ManajemenGuru() {
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [tempImage, setTempImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const [filters, setFilters] = useState({
    jabatan_fungsional: '',
    status_kepegawaian: '',
    jurusan_id: '',
    jenis_kelamin: '',
    agama: '',
    is_active: '1'
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10
  });

  const [formData, setFormData] = useState<GuruFormData>({
    nip: '',
    nuptk: '',
    nama: '',
    no_hp: '',
    email: '',
    alamat_lengkap: '',
    jenis_kelamin: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    agama: '',
    pendidikan_terakhir: '',
    jabatan_fungsional: '',
    status_kepegawaian: '',
    jurusan_id: '',
    is_active: true,
    foto: null
  });

  const filterIds = {
    jurusan: useId(),
    status: useId(),
    jenis_kelamin: useId(),
    jabatan: useId(),
    statusKepeg: useId(),
    agama: useId()
  };

  const formIds = {
    foto: useId(),
    nama: useId(),
    nip: useId(),
    nuptk: useId(),
    email: useId(),
    no_hp: useId(),
    jenis_kelamin: useId(),
    agama: useId(),
    tempat_lahir: useId(),
    tanggal_lahir: useId(),
    pendidikan_terakhir: useId(),
    alamat_lengkap: useId(),
    jabatan_fungsional: useId(),
    status_kepegawaian: useId(),
    jurusan_id: useId()
  };

  const processedPreviewData = useMemo(() => {
    if (!previewData) return [];

    return previewData.map(item => {
      const notes = (item.import_notes || '').toLowerCase();
      const isNipError = notes.includes('nip');
      const isNuptkError = notes.includes('nuptk');
      const isEmailError = notes.includes('email');
      const isJurusanError = notes.includes('jurusan');
      const isNamaError = notes.includes('nama');

      const hasConflict = !item.is_valid;

      return {
        ...item,
        isNipError,
        isNuptkError,
        isEmailError,
        isJurusanError,
        isNamaError,
        hasConflict
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
      const resJurusan = await api.admin.jurusan.getAll({ paginate: 0 });
      const rawJurusan = resJurusan.data?.success
        ? resJurusan.data.data
        : (resJurusan.data?.data || resJurusan.data || []);
      setJurusans(Array.isArray(rawJurusan) ? rawJurusan : []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchData = useCallback(async (page = 1) => {
    if (authLoading || !user) return;
    setLoading(true);
    try {
      const params: Record<string, any> = { page, per_page: pagination.perPage, q: search };
      if (filters.jabatan_fungsional) params.jabatan_fungsional = filters.jabatan_fungsional;
      if (filters.status_kepegawaian) params.status_kepegawaian = filters.status_kepegawaian;
      if (filters.jurusan_id) params.jurusan_id = filters.jurusan_id;
      if (filters.jenis_kelamin) params.jenis_kelamin = filters.jenis_kelamin;
      if (filters.agama) params.agama = filters.agama;
      if (filters.is_active) params.is_active = filters.is_active;
      const res = await api.admin.guruStaf.getAll(params);
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

  useEffect(() => {
    const d = setTimeout(() => fetchData(1), 500);
    return () => clearTimeout(d);
  }, [search, filters, fetchData]);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

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
      title: `Hapus ${selectedIds.length} Guru?`,
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
        await api.admin.guruStaf.bulkDelete(selectedIds);
        Toast.fire({ icon: 'success', title: 'Berhasil hapus massal' });
        fetchData(1);
      } catch (e) {
        Toast.fire({ icon: 'error', title: 'Gagal hapus massal' });
      } finally {
        Swal.close();
      }
    }
  };

  const onCropComplete = useCallback((_: any, croppedArea: any) => {
    setCroppedAreaPixels(croppedArea);
  }, []);

  const handleApplyCrop = async () => {
    if (tempImage && croppedAreaPixels) {
      try {
        const croppedBlob = await getCroppedImg(tempImage, croppedAreaPixels);
        const file = new File([croppedBlob], "foto.jpg", { type: "image/jpeg" });
        
        if (photoPreview && photoPreview.startsWith('blob:')) {
          URL.revokeObjectURL(photoPreview);
        }
        
        const newUrl = URL.createObjectURL(croppedBlob);
        setFormData(prev => ({ ...prev, foto: file }));
        setPhotoPreview(newUrl);
        setTempImage(null);
      } catch (e) {
        Toast.fire({ icon: 'error', title: 'Gagal memotong gambar' });
      }
    }
  };

  const resetForm = useCallback(() => {
    setFormData({
      nip: '',
      nuptk: '',
      nama: '',
      no_hp: '',
      email: '',
      alamat_lengkap: '',
      jenis_kelamin: '',
      tempat_lahir: '',
      tanggal_lahir: '',
      agama: '',
      pendidikan_terakhir: '',
      jabatan_fungsional: '',
      status_kepegawaian: '',
      jurusan_id: '',
      is_active: true,
      foto: null
    });
    setFormErrors({});
    setPhotoPreview(null);
    setTempImage(null);
    setOriginalImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleCloseForm = useCallback(() => {
    if (photoPreview && photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview);
    }
    setShowForm(false);
    setIsEdit(false);
    setCurrentId(null);
    resetForm();
  }, [resetForm, photoPreview]);

  const handleEditClick = useCallback(async (item: any) => {
    setIsEdit(true);
    setCurrentId(item.id);
    setFormData({
      nip: item.nip || '',
      nuptk: item.nuptk || '',
      nama: item.nama || '',
      no_hp: item.no_hp || '',
      email: item.email || '',
      alamat_lengkap: item.alamat_lengkap || '',
      jenis_kelamin: item.jenis_kelamin || '',
      tempat_lahir: item.tempat_lahir || '',
      tanggal_lahir: item.tanggal_lahir || '',
      agama: item.agama || '',
      pendidikan_terakhir: item.pendidikan_terakhir || '',
      jabatan_fungsional: item.jabatan_fungsional || '',
      status_kepegawaian: item.status_kepegawaian || '',
      jurusan_id: item.jurusan?.id || '',
      is_active: !!item.is_active,
      foto: null
    });
    setFormErrors({});
    setPhotoPreview(item.foto_url || null);
    setShowForm(true);

    if (item.foto_url) {
      try {
        const base64 = await getBase64FromUrl(item.foto_url);
        setOriginalImage(base64);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImage(reader.result as string);
        setTempImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.admin.guruStaf.export({ q: search, ...filters });
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
      const res = await api.admin.guruStaf.importPreview(fData);
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
      const res = await api.admin.guruStaf.import(importFile);
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
      title: 'Hapus Guru?',
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
        await api.admin.guruStaf.delete(id);
        fetchData(pagination.currentPage);
        Toast.fire({ icon: 'success', title: 'Berhasil dihapus' });
      } catch (e) {
        Toast.fire({ icon: 'error', title: 'Gagal menghapus' });
      }
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const dataToSubmit = new FormData();
    Object.keys(formData).forEach((key) => {
      const value = formData[key as keyof GuruFormData];
      if (key === 'foto' && value instanceof File) {
        dataToSubmit.append(key, value);
      } else if (key === 'is_active') {
        dataToSubmit.append(key, value ? '1' : '0');
      } else if (value !== null && value !== '') {
        dataToSubmit.append(key, value as string);
      }
    });

    try {
      const res = isEdit && currentId
        ? await api.admin.guruStaf.update(currentId, dataToSubmit)
        : await api.admin.guruStaf.create(dataToSubmit);

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
    setFilters({
      jabatan_fungsional: '',
      status_kepegawaian: '',
      jurusan_id: '',
      jenis_kelamin: '',
      agama: '',
      is_active: '1'
    });
    setSearch('');
  };

  const activeFilterCount = Object.entries(filters).filter(([key, v]) => v !== '' && key !== 'is_active').length + (search ? 1 : 0) + (filters.is_active !== '1' ? 1 : 0);

  if (authLoading) return null;

  return (
    <>
      <style jsx global>{`
        .w-30px { width: 30px; }
        .avatar-sm { width: 28px; height: 28px; min-width: 28px; border-radius: 50%; }
        .text-9px { font-size: 9px; }
        .mw-100px { max-width: 100px; }
        .text-10px { font-size: 10px; }
        .badge-filter-count { font-size: 8px; width: 14px; height: 14px; }
        .min-w-120px { min-width: 120px; }
        .text-11px { font-size: 11px; }
        .mw-120px { max-width: 120px; }
        .symbol-70px { width: 70px; height: 70px; }
        .btn-close-xs { width: 14px; height: 14px; }
        .bg-none { background-image: none; }
        .modal-overlay { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .modal-dialog-custom { max-width: 500px; pointer-events: auto; width: 100%; }
        .modal-content-custom { display: flex; flex-direction: column; width: 100%; max-height: 90vh; background-color: #fff; overflow: hidden; }
        .text-13px { font-size: 13px; }
        .modal-body-scrollable { flex: 1 1 auto; overflow-y: auto; min-height: 0; -webkit-overflow-scrolling: touch; }
        .cropper-container { height: 250px; width: 100%; background: #333; }
        .z-index-10 { z-index: 10; }
        .pos-rel-z10 { position: relative; z-index: 10; }
        .modal-footer-sticky { position: relative; z-index: 10; border-top: 1px solid #f8f9fa; }
        .text-12px { font-size: 12px; }
        .max-h-300 { max-height: 300px; }
      `}</style>
      <div className="container-fluid py-2 px-2 px-md-3 text-xs-custom">
        <div className="card border-0 shadow-sm rounded-3 mb-2">
          <div className="card-body p-2">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-primary bg-opacity-10 p-1.5 rounded-2">
                  <Users size={16} className="text-primary" />
                </div>
                <div>
                  <h5 className="fw-bold text-dark mb-0 fs-6">Manajemen Guru</h5>
                  <p className="text-muted mb-0 text-10px">Kelola data guru dan staf pengajar</p>
                </div>
              </div>

              <div className="d-flex flex-wrap align-items-center gap-1 justify-content-end">
                <div className="position-relative min-w-120px">
                  <Search size={10} className="position-absolute top-50 start-0 ms-2 translate-middle-y text-muted" />
                  <input
                    type="text"
                    className="form-control form-control-sm ps-4 border-0 bg-light rounded-2 shadow-none"
                    placeholder="Cari Nama/NIP..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn btn-sm px-1.5 py-0.5 rounded-2 border d-flex align-items-center gap-1 ${showFilters || activeFilterCount > 0 ? 'btn-primary border-primary' : 'btn-light'}`}
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
                >
                  <FileDown size={10}/>
                  <span className="d-none d-sm-inline text-10px">Ekspor</span>
                </button>

                <label className="btn btn-light btn-sm px-1.5 py-0.5 rounded-2 cursor-pointer mb-0 border d-flex align-items-center gap-1">
                  <FileUp size={10}/>
                  <span className="d-none d-sm-inline text-10px">Impor</span>
                  <input type="file" className="d-none" accept=".xlsx, .xls, .csv" onChange={handleImportRequest} />
                </label>

                <button
                  onClick={() => { resetForm(); setShowForm(true); }}
                  className="btn btn-primary btn-sm px-1.5 py-0.5 rounded-2 d-flex align-items-center gap-1"
                >
                  <Plus size={10}/>
                  <span className="text-10px">Tambah</span>
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-2 pt-2 border-top">
                <div className="row g-1">
                  <div className="col-6 col-md-4 col-lg-2">
                    <label htmlFor={filterIds.jabatan} className="text-xxs fw-bold text-muted text-uppercase mb-0.5">Jabatan</label>
                    <select
                      id={filterIds.jabatan}
                      className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none"
                      value={filters.jabatan_fungsional}
                      onChange={(e) => setFilters({...filters, jabatan_fungsional: e.target.value})}
                    >
                      <option value="">Pilih</option>
                      <option value="Guru">Guru</option>
                      <option value="Guru Mata Pelajaran">Guru Mata Pelajaran</option>
                      <option value="Guru Produktif">Guru Produktif</option>
                      <option value="Guru BK">Guru BK</option>
                      <option value="Tenaga Administrasi">Tenaga Administrasi</option>
                      <option value="Teknisi/Toolman">Teknisi/Toolman</option>
                      <option value="Laboran">Laboran</option>
                      <option value="Pustakawan">Pustakawan</option>
                    </select>
                  </div>

                  <div className="col-6 col-md-4 col-lg-2">
                    <label htmlFor={filterIds.statusKepeg} className="text-xxs fw-bold text-muted text-uppercase mb-0.5">Status Pegawai</label>
                    <select
                      id={filterIds.statusKepeg}
                      className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none"
                      value={filters.status_kepegawaian}
                      onChange={(e) => setFilters({...filters, status_kepegawaian: e.target.value})}
                    >
                      <option value="">Pilih</option>
                      <option value="PNS">PNS</option>
                      <option value="PPPK">PPPK</option>
                      <option value="Honorer">Honorer</option>
                      <option value="GTT">GTT</option>
                    </select>
                  </div>

                  <div className="col-6 col-md-4 col-lg-2">
                    <label htmlFor={filterIds.jurusan} className="text-xxs fw-bold text-muted text-uppercase mb-0.5">Jurusan</label>
                    <select
                      id={filterIds.jurusan}
                      className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none"
                      value={filters.jurusan_id}
                      onChange={(e) => setFilters({...filters, jurusan_id: e.target.value})}
                    >
                      <option value="">Pilih</option>
                      {jurusans.map((j: any) => (
                        <option key={j.id} value={j.id}>{j.nama || j.nama_jurusan}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-6 col-md-4 col-lg-2">
                    <label htmlFor={filterIds.jenis_kelamin} className="text-xxs fw-bold text-muted text-uppercase mb-0.5">Jenis-Kelamin</label>
                    <select
                      id={filterIds.jenis_kelamin}
                      className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none"
                      value={filters.jenis_kelamin}
                      onChange={(e) => setFilters({...filters, jenis_kelamin: e.target.value})}
                    >
                      <option value="">Pilih</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div className="col-6 col-md-4 col-lg-2">
                    <label htmlFor={filterIds.agama} className="text-xxs fw-bold text-muted text-uppercase mb-0.5">Agama</label>
                    <select
                      id={filterIds.agama}
                      className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none"
                      value={filters.agama}
                      onChange={(e) => setFilters({...filters, agama: e.target.value})}
                    >
                      <option value="">Pilih</option>
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Konghucu">Konghucu</option>
                    </select>
                  </div>

                  <div className="col-6 col-md-4 col-lg-2">
                    <label htmlFor={filterIds.status} className="text-xxs fw-bold text-muted text-uppercase mb-0.5">Status</label>
                    <select
                      id={filterIds.status}
                      className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none"
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
        <div className="mb-2">
          <button
            onClick={handleBulkDelete}
            className="btn btn-danger btn-sm px-2 py-0.5 rounded-2 shadow-sm border-0 d-flex align-items-center gap-1 fw-bold"
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
                <th className="border-0 py-1.5">NIP</th>
                <th className="border-0 py-1.5 d-none d-md-table-cell">NUPTK</th>
                <th className="border-0 py-1.5 d-none d-md-table-cell">JK</th>
                <th className="border-0 py-1.5 d-none d-xl-table-cell">TTL</th>
                <th className="border-0 py-1.5 d-none d-xxl-table-cell">Agama</th>
                <th className="border-0 py-1.5 d-none d-xxl-table-cell">Alamat</th>
                <th className="border-0 py-1.5 d-none d-xl-table-cell">Pendidikan</th>
                <th className="border-0 py-1.5 d-none d-md-table-cell">Kepegawaian</th>
                <th className="border-0 py-1.5 d-none d-lg-table-cell">Kontak</th>
                <th className="border-0 py-1.5 text-center">Status</th>
                <th className="border-0 py-1.5 text-end pe-2">Aksi</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {loading ? (
                <tr>
                  <td colSpan={13} className="text-center py-5">
                    <Loader2 className="text-primary animate-spin mx-auto" size={16} />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={13} className="text-center py-5 text-muted">
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <GuruRow
                    key={item.id}
                    item={item}
                    onEdit={handleEditClick}
                    onDelete={handleDelete}
                    isSelected={selectedIds.includes(item.id)}
                    onSelect={handleSelectOne}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && data.length > 0 && (
          <div className="d-flex justify-content-between align-items-center px-2 py-1 border-top bg-white">
            <div className="text-muted text-10px">
              Menampilkan {data.length} dari {pagination.total} data
            </div>
            <nav className="d-flex align-items-center gap-0.5">
              <button
                className="btn btn-light btn-sm border-0 shadow-none p-0.5 rounded-2"
                disabled={pagination.currentPage === 1}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                aria-label="Halaman sebelumnya"
                title="Halaman sebelumnya"
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
                aria-label="Halaman selanjutnya"
                title="Halaman selanjutnya"
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
                  <h6 className="modal-title fw-bold text-dark text-md-custom">Preview Import Guru</h6>
                </div>
                <button onClick={() => setPreviewData(null)} className="btn-close scale-75 shadow-none" aria-label="Tutup"></button>
              </div>
              <div className="modal-body p-3">
                <div className={`alert ${hasImportConflict ? 'alert-danger' : 'alert-light bg-light'} border-0 rounded-3 py-2 px-3 mb-3`}>
                  <div className="d-flex align-items-center justify-content-between gap-2">
                    <div className="d-flex align-items-center gap-2">
                      {hasImportConflict ? <XCircle size={14} className="text-danger" /> : <AlertCircle size={14} className="text-muted" />}
                      <span className={`text-xxs fw-bold ${hasImportConflict ? 'text-danger' : 'text-muted'}`}>
                        {hasImportConflict 
                          ? 'Terdapat data duplikat atau format tidak sesuai. Mohon perbaiki file Anda.' 
                          : `${processedPreviewData.length} baris data siap diimpor.`}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="table-responsive border rounded-3 max-h-300">
                  <table className="table table-sm table-hover mb-0">
                    <thead className="bg-light sticky-top">
                      <tr className="text-xxs">
                        <th className="ps-3 py-2 border-0">NIP</th>
                        <th className="py-2 border-0">NUPTK</th>
                        <th className="py-2 border-0">Nama</th>
                        <th className="py-2 border-0">Jabatan</th>
                        <th className="py-2 border-0">Status</th>
                        <th className="py-2 border-0">Jurusan</th>
                        <th className="py-2 border-0">No HP</th>
                        <th className="py-2 border-0">Email</th>
                        <th className="py-2 border-0">Alamat</th>
                        <th className="py-2 border-0">JK</th>
                        <th className="py-2 border-0">Tmpt Lahir</th>
                        <th className="py-2 border-0">Tgl Lahir</th>
                        <th className="py-2 border-0">Pendidikan</th>
                        <th className="py-2 border-0">Agama</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs-custom">
                      {processedPreviewData.map((item, idx) => {
                         const jkVal = item.jenis_kelamin;
                         const displayJKPreview = (jkVal === 'L' || jkVal === 'Laki-laki') 
                           ? 'Laki-laki' 
                           : (jkVal === 'P' || jkVal === 'Perempuan') 
                             ? 'Perempuan' 
                             : (jkVal || '-');

                         return (
                          <tr key={idx} className={item.hasConflict ? 'bg-danger bg-opacity-10' : ''} title={item.import_notes || undefined}>
                            <td className={`ps-3 py-[6px] ${item.isNipError ? 'bg-danger bg-opacity-25 text-danger fw-bold' : ''}`}>
                                <div className="d-flex align-items-center gap-1">
                                    {item.nip || '-'}
                                    {item.isNipError && <XCircle size={10} className="text-danger" />}
                                </div>
                            </td>
                            <td className={`py-[6px] ${item.isNuptkError ? 'bg-danger bg-opacity-25 text-danger fw-bold' : 'text-muted'}`}>
                                <div className="d-flex align-items-center gap-1">
                                    {item.nuptk || '-'}
                                    {item.isNuptkError && <XCircle size={10} className="text-danger" />}
                                </div>
                            </td>
                            <td className={`py-[6px] ${item.isNamaError ? 'bg-danger bg-opacity-25 text-danger fw-bold' : 'text-dark'}`}>
                                <div className="d-flex align-items-center gap-1">
                                    {item.nama || '-'}
                                    {item.isNamaError && <XCircle size={10} className="text-danger" />}
                                </div>
                            </td>
                            <td className="py-[6px] text-muted">{item.jabatan_fungsional || '-'}</td>
                            <td className="py-[6px] text-muted">{item.status_kepegawaian || '-'}</td>
                            <td className={`py-[6px] ${item.isJurusanError ? 'bg-danger bg-opacity-25 text-danger fw-bold' : 'text-muted'}`}>
                                <div className="d-flex align-items-center gap-1">
                                    {item.jurusan || 'Umum'}
                                    {item.isJurusanError && <XCircle size={10} className="text-danger" />}
                                </div>
                            </td>
                            <td className="py-[6px] text-muted">{item.no_hp || '-'}</td>
                            <td className={`py-[6px] ${item.isEmailError ? 'bg-danger bg-opacity-25 text-danger fw-bold' : 'text-muted'}`}>
                                <div className="d-flex align-items-center gap-1">
                                    {item.email || '-'}
                                    {item.isEmailError && <XCircle size={10} className="text-danger" />}
                                </div>
                            </td>
                            <td className="py-[6px] text-muted">{item.alamat_lengkap || '-'}</td>
                            <td className="py-[6px] text-muted">{displayJKPreview}</td>
                            <td className="py-[6px] text-muted">{item.tempat_lahir || '-'}</td>
                            <td className="py-[6px] text-muted">{item.tanggal_lahir || '-'}</td>
                            <td className="py-[6px] text-muted">{item.pendidikan_terakhir || '-'}</td>
                            <td className="py-[6px] text-muted">{item.agama || '-'}</td>
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

      {showForm && (
        <div className="modal fade show d-block bg-black/40 z-[1100] modal-overlay">
          <div className="modal-dialog modal-dialog-scrollable modal-md mx-auto modal-dialog-custom">
            <div className="modal-content border-0 shadow-lg rounded-4 modal-content-custom">
              <div className="modal-header border-0 pb-0 px-3 pt-3 flex-shrink-0 pos-rel-z10">
                <h6 className="fw-bold text-dark d-flex align-items-center gap-2 m-0 text-13px">
                  <div className="bg-primary bg-opacity-10 p-1 rounded-2">
                    {tempImage ? <Crop size={12} className="text-primary"/> : (isEdit ? <Edit2 size={12} className="text-primary"/> : <Plus size={12} className="text-primary"/>)}
                  </div>
                  {tempImage ? "Potong Foto" : (isEdit ? "Edit Data" : "Tambah Guru")}
                </h6>
                <button onClick={handleCloseForm} className="btn-close scale-75 shadow-none" aria-label="Tutup"></button>
              </div>

              <div className="modal-body px-3 py-2 modal-body-scrollable">
                {tempImage ? (
                  <div className="position-relative cropper-container">
                    <Cropper
                      image={tempImage}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                    />
                    <div className="position-absolute bottom-0 start-0 w-100 p-2 d-flex gap-2 z-index-10">
                      <button
                        onClick={handleApplyCrop}
                        className="btn btn-primary btn-sm flex-grow-1 fw-bold text-10px py-1.5 rounded-3 shadow"
                        aria-label="Selesai potong foto"
                        title="Selesai potong foto"
                      >
                        <Crop size={11} className="me-1"/> Selesai
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="row g-2 pb-3 mx-0">
                    <div className="col-12 mb-2">
                      {photoPreview && (
                        <div className="symbol symbol-circle mb-1 overflow-hidden bg-light border cursor-pointer position-relative symbol-70px"
                          onClick={() => originalImage && setTempImage(originalImage)}
                        >
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="w-100 h-100 object-cover"
                            onError={(e) => { e.currentTarget.onerror = null; setPhotoPreview(null); }}
                          />
                          <button 
                            className="btn btn-danger btn-sm p-0 position-absolute top-0 end-0 m-1 rounded-circle d-flex align-items-center justify-content-center btn-close-xs"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if (photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview); 
                              setPhotoPreview(null); 
                              setOriginalImage(null); 
                              setFormData({...formData, foto: null}); 
                            }}
                            aria-label="Hapus foto"
                            title="Hapus foto"
                          >
                            <X size={8}/>
                          </button>
                        </div>
                      )}
                      <label htmlFor={formIds.foto} className="fw-bold text-10px text-muted mb-0">Unggah Foto</label>
                      <input 
                        type="file" 
                        id={formIds.foto}
                        ref={fileInputRef} 
                        className="form-control form-control-sm bg-light border-0 rounded-2 shadow-none mt-1" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                      />
                    </div>

                    <div className="col-12">
                      <label htmlFor={formIds.nama} className="fw-bold text-10px text-muted mb-0">Nama Lengkap <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        id={formIds.nama}
                        className="form-control form-control-sm bg-light border-0 py-1 text-11px rounded-2 shadow-none"
                        value={formData.nama} 
                        onChange={(e) => setFormData({...formData, nama: e.target.value})} 
                      />
                      {formErrors.nama && <div className="text-danger text-9px mt-0.5">{formErrors.nama}</div>}
                    </div>

                    <div className="col-6">
                      <label htmlFor={formIds.nip} className="fw-bold text-10px text-muted mb-0">NIP</label>
                      <input 
                        type="text" 
                        id={formIds.nip}
                        className="form-control form-control-sm bg-light border-0 py-1 text-11px rounded-2 shadow-none"
                        value={formData.nip} 
                        onChange={(e) => setFormData({...formData, nip: e.target.value})} 
                      />
                      {formErrors.nip && <div className="text-danger text-9px mt-0.5">{formErrors.nip}</div>}
                    </div>

                    <div className="col-6">
                      <label htmlFor={formIds.nuptk} className="fw-bold text-10px text-muted mb-0">NUPTK</label>
                      <input 
                        type="text" 
                        id={formIds.nuptk}
                        className="form-control form-control-sm bg-light border-0 py-1 text-11px rounded-2 shadow-none"
                        value={formData.nuptk} 
                        onChange={(e) => setFormData({...formData, nuptk: e.target.value})} 
                      />
                      {formErrors.nuptk && <div className="text-danger text-9px mt-0.5">{formErrors.nuptk}</div>}
                    </div>

                    <div className="col-7">
                      <label htmlFor={formIds.email} className="fw-bold text-10px text-muted mb-0">Email</label>
                      <input 
                        type="email" 
                        id={formIds.email}
                        className="form-control form-control-sm bg-light border-0 py-1 text-11px rounded-2 shadow-none"
                        value={formData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      />
                      {formErrors.email && <div className="text-danger text-9px mt-0.5">{formErrors.email}</div>}
                    </div>

                    <div className="col-5">
                      <label htmlFor={formIds.no_hp} className="fw-bold text-10px text-muted mb-0">No. HP <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        id={formIds.no_hp}
                        className="form-control form-control-sm bg-light border-0 py-1 text-11px rounded-2 shadow-none"
                        value={formData.no_hp} 
                        onChange={(e) => setFormData({...formData, no_hp: e.target.value})} 
                      />
                      {formErrors.no_hp && <div className="text-danger text-9px mt-0.5">{formErrors.no_hp}</div>}
                    </div>

                    <div className="col-6">
                      <label htmlFor={formIds.jenis_kelamin} className="fw-bold text-10px text-muted mb-0">Jenis Kelamin <span className="text-danger">*</span></label>
                      <select 
                        id={formIds.jenis_kelamin}
                        className="form-select form-select-sm bg-light border-0 py-1 text-11px rounded-2 shadow-none"
                        value={formData.jenis_kelamin} 
                        onChange={(e) => setFormData({...formData, jenis_kelamin: e.target.value as any})} 
                      >
                        <option value="">Pilih</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                      {formErrors.jenis_kelamin && <div className="text-danger text-9px mt-0.5">{formErrors.jenis_kelamin}</div>}
                    </div>

                    <div className="col-6">
                      <label htmlFor={formIds.agama} className="fw-bold text-10px text-muted mb-0">Agama <span className="text-danger">*</span></label>
                      <select 
                        id={formIds.agama}
                        className="form-select form-select-sm bg-light border-0 py-1 text-11px rounded-2 shadow-none"
                        value={formData.agama} 
                        onChange={(e) => setFormData({...formData, agama: e.target.value})} 
                      >
                        <option value="">Pilih</option>
                        <option value="Islam">Islam</option>
                        <option value="Kristen">Kristen</option>
                        <option value="Katolik">Katolik</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Buddha">Buddha</option>
                        <option value="Konghucu">Konghucu</option>
                      </select>
                      {formErrors.agama && <div className="text-danger text-9px mt-0.5">{formErrors.agama}</div>}
                    </div>

                    <div className="col-6">
                      <label htmlFor={formIds.tempat_lahir} className="fw-bold text-10px text-muted mb-0">Tempat Lahir <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        id={formIds.tempat_lahir}
                        className="form-control form-control-sm bg-light border-0 py-1 text-11px rounded-2 shadow-none"
                        value={formData.tempat_lahir} 
                        onChange={(e) => setFormData({...formData, tempat_lahir: e.target.value})} 
                      />
                      {formErrors.tempat_lahir && <div className="text-danger text-9px mt-0.5">{formErrors.tempat_lahir}</div>}
                    </div>

                    <div className="col-6">
                      <label htmlFor={formIds.tanggal_lahir} className="fw-bold text-10px text-muted mb-0">Tanggal Lahir <span className="text-danger">*</span></label>
                      <input 
                        type="date" 
                        id={formIds.tanggal_lahir}
                        className="form-control form-control-sm bg-light border-0 py-1 text-11px rounded-2 shadow-none"
                        value={formData.tanggal_lahir} 
                        onChange={(e) => setFormData({...formData, tanggal_lahir: e.target.value})} 
                      />
                      {formErrors.tanggal_lahir && <div className="text-danger text-9px mt-0.5">{formErrors.tanggal_lahir}</div>}
                    </div>

                    <div className="col-12">
                      <label htmlFor={formIds.pendidikan_terakhir} className="fw-bold text-10px text-muted mb-0">Pendidikan Terakhir <span className="text-danger">*</span></label>
                      <select 
                        id={formIds.pendidikan_terakhir}
                        className="form-select form-select-sm bg-light border-0 py-1 text-11px rounded-2 shadow-none"
                        value={formData.pendidikan_terakhir} 
                        onChange={(e) => setFormData({...formData, pendidikan_terakhir: e.target.value})} 
                      >
                        <option value="">Pilih</option>
                        <option value="S1">S1</option>
                        <option value="S2">S2</option>
                        <option value="S3">S3</option>
                        <option value="D3">D3</option>
                        <option value="SMA/SMK">SMA/SMK</option>
                      </select>
                      {formErrors.pendidikan_terakhir && <div className="text-danger text-9px mt-0.5">{formErrors.pendidikan_terakhir}</div>}
                    </div>

                    <div className="col-12">
                      <label htmlFor={formIds.alamat_lengkap} className="fw-bold text-10px text-muted mb-0">Alamat Lengkap <span className="text-danger">*</span></label>
                      <textarea 
                        id={formIds.alamat_lengkap}
                        className="form-control form-control-sm bg-light border-0 py-1 text-11px rounded-2 shadow-none"
                        rows={2} 
                        value={formData.alamat_lengkap} 
                        onChange={(e) => setFormData({...formData, alamat_lengkap: e.target.value})}
                      ></textarea>
                      {formErrors.alamat_lengkap && <div className="text-danger text-9px mt-0.5">{formErrors.alamat_lengkap}</div>}
                    </div>

                    <div className="col-12 pt-2">
                      <div className="text-10px fw-bold text-primary text-uppercase border-bottom pb-1 mb-2">Kepegawaian</div>
                    </div>

                    <div className="col-6">
                      <label htmlFor={formIds.jabatan_fungsional} className="fw-bold text-10px text-muted mb-0">Jabatan <span className="text-danger">*</span></label>
                      <select 
                        id={formIds.jabatan_fungsional}
                        className="form-select form-select-sm bg-light border-0 py-1 text-11px rounded-2 shadow-none"
                        value={formData.jabatan_fungsional} 
                        onChange={(e) => setFormData({...formData, jabatan_fungsional: e.target.value})} 
                      >
                        <option value="">Pilih</option>
                        <option value="Guru">Guru</option>
                        <option value="Guru Mata Pelajaran">Guru Mata Pelajaran</option>
                        <option value="Guru Produktif">Guru Produktif</option>
                        <option value="Guru BK">Guru BK</option>
                        <option value="Tenaga Administrasi">Tenaga Administrasi</option>
                        <option value="Teknisi/Toolman">Teknisi/Toolman</option>
                        <option value="Laboran">Laboran</option>
                        <option value="Pustakawan">Pustakawan</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label htmlFor={formIds.status_kepegawaian} className="fw-bold text-10px text-muted mb-0">Status <span className="text-danger">*</span></label>
                      <select 
                        id={formIds.status_kepegawaian}
                        className="form-select form-select-sm bg-light border-0 py-1 text-11px rounded-2 shadow-none"
                        value={formData.status_kepegawaian} 
                        onChange={(e) => setFormData({...formData, status_kepegawaian: e.target.value})} 
                      >
                        <option value="">Pilih</option>
                        <option value="PNS">PNS</option>
                        <option value="PPPK">PPPK</option>
                        <option value="Honorer">Honorer</option>
                        <option value="GTT">GTT</option>
                      </select>
                      {formErrors.status_kepegawaian && <div className="text-danger text-9px mt-0.5">{formErrors.status_kepegawaian}</div>}
                    </div>

                    <div className="col-12">
                      <label htmlFor={formIds.jurusan_id} className="fw-bold text-10px text-muted mb-0">Jurusan / Bidang</label>
                      <select 
                        id={formIds.jurusan_id}
                        className="form-select form-select-sm bg-light border-0 py-1 text-11px rounded-2 shadow-none" 
                        value={formData.jurusan_id} 
                        onChange={(e) => setFormData({...formData, jurusan_id: e.target.value})} 
                      >
                        <option value="">Pilih Jurusan</option>
                        {jurusans.map((j: any) => (
                          <option key={j.id} value={j.id}>{j.nama || j.nama_jurusan}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 mb-2">
                      <div className="form-check form-switch pt-1">
                        <input className="form-check-input shadow-none cursor-pointer" type="checkbox" id="statusSwitch" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} />
                        <label className="form-check-label fw-bold text-10px cursor-pointer" htmlFor="statusSwitch">
                          {formData.is_active ? 'Status Aktif' : 'Status Non-Aktif'}
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {!tempImage && (
                <div className="modal-footer border-0 p-3 pt-1 flex-shrink-0 bg-white modal-footer-sticky">
                  <button
                    onClick={handleSave}
                    className="btn btn-primary btn-sm w-100 py-2 rounded-3 shadow-sm fw-bold d-flex align-items-center justify-content-center gap-2 text-12px"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : (isEdit ? "Perbarui Data" : "Simpan Data")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
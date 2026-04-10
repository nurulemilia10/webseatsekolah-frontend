"use client";

import React, { useState, useEffect, useCallback, useId, memo, useMemo, useRef } from 'react';
import { 
  Plus, Edit2, Loader2, Trash2, FileDown, FileUp, Filter, ChevronLeft, Eye, CheckCircle2, XCircle, AlertCircle, Search, BookOpen, Users, RefreshCw
} from 'lucide-react';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/useAuth';
import { fileHelper } from '@/lib/file-helper';

const GuruMapelRow = memo(({ item, onEdit, onDelete, isSelected, onSelect }: { 
  item: any; 
  onEdit: (i: any) => void; 
  onDelete: (id: number) => void; 
  isSelected: boolean; 
  onSelect: (id: number) => void;
}) => (
  <tr>
    <td className="ps-2 py-1 text-center w-30px">
      <input 
        type="checkbox" 
        className="form-check-input border-secondary shadow-none cursor-pointer m-0" 
        checked={isSelected} 
        onChange={() => onSelect(item.id)} 
        aria-label={`Pilih jadwal ${item.guru?.display}`} 
      />
    </td>
    <td className="py-1">
      <div className="d-flex align-items-center">
        <div className="flex-shrink-0 bg-light rounded p-1.5 d-flex align-items-center justify-content-center">
          <Users size={13} className="text-warning" />
        </div>
        <div className="ms-2">
          <div className="text-dark fw-bold text-truncate mb-0 text-11px">{item.guru?.display || '-'}</div>
        </div>
      </div>
    </td>
    <td className="py-1 text-muted text-11px">
      <div className="d-flex align-items-center gap-1">
        <BookOpen size={10} className="text-warning flex-shrink-0" />
        <span className="text-truncate mw-120px">{item.mapel?.display || '-'}</span>
      </div>
    </td>
    <td className="py-1 text-muted text-11px d-none d-lg-table-cell">
      <span className="badge bg-light text-dark border fw-normal">{item.kelas?.nama || '-'}</span>
    </td>
    <td className="py-1 text-dark fw-bold text-11px text-center">{item.hari || '-'}</td>
    <td className="py-1 text-muted text-11px d-none d-xl-table-cell">
      <div className="d-flex align-items-center gap-1">
        <span className="badge bg-light text-dark border fw-normal">{item.waktu?.mulai || '-'}</span>
        <span>-</span>
        <span className="badge bg-light text-dark border fw-normal">{item.waktu?.selesai || '-'}</span>
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
          className="btn btn-sm p-0.5 text-warning border-0 shadow-none" 
          title="Edit Data" 
          aria-label="Edit Data"
        >
          <span className="bg-light p-0.5 rounded-1 d-inline-flex"><Edit2 size={10}/></span>
        </button>
        <button 
          onClick={() => onDelete(item.id)} 
          className="btn btn-sm p-0.5 text-danger border-0 shadow-none" 
          title="Hapus Data" 
          aria-label="Hapus Data"
        >
          <span className="bg-danger bg-opacity-10 p-0.5 rounded-1 d-inline-flex"><Trash2 size={10}/></span>
        </button>
      </div>
    </td>
  </tr>
));
GuruMapelRow.displayName = 'GuruMapelRow';

const GuruMapelCard = memo(({ item, onEdit, onDelete, isSelected, onSelect }: { 
  item: any; 
  onEdit: (i: any) => void; 
  onDelete: (id: number) => void; 
  isSelected: boolean; 
  onSelect: (id: number) => void;
}) => (
  <div className="card border shadow-sm rounded-3 mb-2">
    <div className="card-body p-2">
      <div className="d-flex align-items-start justify-content-between mb-2">
        <div className="d-flex align-items-center flex-grow-1 me-2">
          <input 
            type="checkbox" 
            className="form-check-input border-secondary shadow-none cursor-pointer m-0 me-2 flex-shrink-0" 
            checked={isSelected} 
            onChange={() => onSelect(item.id)} 
            aria-label={`Pilih jadwal ${item.guru?.display}`} 
          />
          <div className="bg-warning bg-opacity-10 p-1.5 rounded-2 d-flex align-items-center justify-content-center flex-shrink-0">
            <Users size={14} className="text-warning" />
          </div>
          <div className="ms-2 flex-grow-1 min-w-0">
            <div className="text-dark fw-bold text-truncate text-12px">{item.guru?.display || '-'}</div>
            <div className="text-muted text-truncate text-10px">{item.guru?.nip || '-'}</div>
          </div>
        </div>
        <div className="d-flex gap-1 flex-shrink-0">
          <button 
            onClick={() => onEdit(item)} 
            className="btn btn-sm p-1 text-warning border-0 shadow-none bg-light rounded-2" 
            title="Edit" 
            aria-label="Edit"
          >
            <Edit2 size={12}/>
          </button>
          <button 
            onClick={() => onDelete(item.id)} 
            className="btn btn-sm p-1 text-danger border-0 shadow-none bg-danger bg-opacity-10 rounded-2" 
            title="Hapus" 
            aria-label="Hapus"
          >
            <Trash2 size={12}/>
          </button>
        </div>
      </div>
      <div className="row g-1 text-11px">
        <div className="col-6">
          <div className="text-muted text-9px">MAPEL</div>
          <div className="text-dark fw-semibold text-truncate">{item.mapel?.display || '-'}</div>
        </div>
        <div className="col-6">
          <div className="text-muted text-9px">KELAS</div>
          <div className="text-dark fw-semibold text-truncate">{item.kelas?.nama || '-'}</div>
        </div>
        <div className="col-6">
          <div className="text-muted text-9px">HARI</div>
          <div className="text-dark fw-semibold">{item.hari || '-'}</div>
        </div>
        <div className="col-6">
          <div className="text-muted text-9px">WAKTU</div>
          <div className="text-dark fw-semibold">{item.waktu?.mulai || '-'} - {item.waktu?.selesai || '-'}</div>
        </div>
      </div>
      <div className="mt-2 pt-2 border-top d-flex justify-content-between align-items-center">
        <span className="text-muted text-10px">Status</span>
        {item.is_active 
          ? <span className="badge bg-success bg-opacity-10 text-success px-2 py-0.5 text-9px">Aktif</span> 
          : <span className="badge bg-danger bg-opacity-10 text-danger px-2 py-0.5 text-9px">Non-Aktif</span>
        }
      </div>
    </div>
  </div>
));
GuruMapelCard.displayName = 'GuruMapelCard';

const GuruSearch = memo(({ value, onChange, placeholder, inputId, gurus }: { 
  value: string; 
  onChange: (id: string) => void; 
  placeholder: string; 
  inputId: string;
  gurus: any[];
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedGuru = useMemo(() => {
    return gurus.find((g: any) => String(g.id) === value);
  }, [value, gurus]);

  const filteredGurus = useMemo(() => {
    if (!query) return gurus;
    const q = query.toLowerCase();
    return gurus.filter((g: any) => 
      (g.nama?.toLowerCase().includes(q) || g.nip?.toLowerCase().includes(q))
    );
  }, [query, gurus]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayValue = useMemo(() => {
    if (!selectedGuru) return '';
    if (selectedGuru.nip) return `${selectedGuru.nama} - ${selectedGuru.nip}`;
    return selectedGuru.nama;
  }, [selectedGuru]);

  return (
    <div ref={wrapperRef} className="position-relative">
      <input
        id={inputId}
        type="text"
        className="form-control form-control-sm bg-light border-0 py-1 rounded-2 shadow-none text-11px"
        placeholder={placeholder}
        value={isOpen ? query : displayValue}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          if (!e.target.value) onChange('');
        }}
        onFocus={() => setIsOpen(true)}
        aria-label={placeholder}
        title={placeholder}
      />
      {isOpen && (
        <div className="position-absolute start-0 end-0 bg-white border rounded-2 shadow-sm overflow-auto guru-search-dropdown">
          {filteredGurus.length > 0 ? filteredGurus.map((g: any) => (
            <div 
              key={g.id} 
              className={`px-2 py-1 cursor-pointer guru-search-item text-11px ${String(g.id) === value ? 'guru-search-item-active' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(String(g.id));
                setIsOpen(false);
                setQuery('');
              }}
              onMouseEnter={(e) => {
                if(String(g.id) !== value) (e.target as HTMLElement).classList.add('guru-search-item-hover');
              }}
              onMouseLeave={(e) => {
                if(String(g.id) !== value) (e.target as HTMLElement).classList.remove('guru-search-item-hover');
              }}
            >
              <div className="fw-bold">{g.nama}</div>
              <div className="text-muted text-9px">{g.nip || '-'}</div>
            </div>
          )) : (
            <div className="px-2 py-1 text-muted text-11px">Tidak ditemukan</div>
          )}
        </div>
      )}
    </div>
  );
});
GuruSearch.displayName = 'GuruSearch';

function formatPreviewWaktu(waktuStr: string | number | undefined): string {
  if (!waktuStr && waktuStr !== 0) return '-';
  const str = String(waktuStr);
  const dateTimes = str.match(/\d{4}-\d{2}-\d{2} (\d{2}:\d{2}):\d{2}/g);
  if (dateTimes && dateTimes.length >= 2) {
    const start = dateTimes[0].match(/(\d{2}:\d{2}):\d{2}/)?.[1];
    const end = dateTimes[dateTimes.length - 1].match(/(\d{2}:\d{2}):\d{2}/)?.[1];
    if (start && end) return `${start} - ${end}`;
  }
  if (str.toLowerCase().includes('jam ke')) return str;
  if (/^\d+\s*-\s*\d+$/.test(str.trim())) return `Jam Ke ${str.trim()}`;
  return '-';
}

export default function ManajemenGuruMapel() {
  const { user, loading: authLoading } = useAuth();
  
  const [data, setData] = useState<any[]>([]);
  const [gurus, setGurus] = useState<any[]>([]);
  const [mapels, setMapels] = useState<any[]>([]);
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [jurusans, setJurusans] = useState<any[]>([]);
  const [jamOptions, setJamOptions] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const initialSemIdRef = useRef<string | null>(null);
  const lastFetchedFilterRef = useRef<string>('');

  const [filterTahunAjaranId, setFilterTahunAjaranId] = useState<string>('');
  const [filterSemesterId, setFilterSemesterId] = useState<string>('');
  const [filterGuruId, setFilterGuruId] = useState<string>('');
  const [filterMapelId, setFilterMapelId] = useState<string>('');
  const [filterKelasId, setFilterKelasId] = useState<string>('');
  const [filterJurusanId, setFilterJurusanId] = useState<string>('');
  const [filterHari, setFilterHari] = useState<string>('');
  const [filterKategori, setFilterKategori] = useState<string>('');
  const [filterIsActive, setFilterIsActive] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilter, setShowFilter] = useState<boolean>(false);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [importFile, setImportFile] = useState<FormData | null>(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10
  });

  const [formData, setFormData] = useState({ 
    guru_staf_id: '', 
    mata_pelajaran_id: '', 
    kelas_id: '', 
    hari: 'Senin', 
    jam_mulai_id: '', 
    jam_selesai_id: '',
    is_active: true
  });

  const mapelFormId = useId();
  const kelasFormId = useId();
  const hariFormId = useId();
  const mulaiFormId = useId();
  const selesaiFormId = useId();
  const searchId = useId();
  const taFilterId = useId();
  const semFilterId = useId();
  const guruFilterId = useId();
  const mapelFilterId = useId();
  const kelasFilterId = useId();
  const jurusanFilterId = useId();
  const hariFilterId = useId();
  const kategoriFilterId = useId();
  const statusFilterId = useId();
  const guruFormId = useId();

  const Toast = useMemo(() => Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  }), []);

  const hasError = useMemo(() => {
    if (!previewData) return false;
    return previewData.some(p => String(p.is_conflict) === "true" || p.is_conflict === true || (p.errors && p.errors.length > 0));
  }, [previewData]);

  const { tahunAjaranList, filteredSemesterOptions } = useMemo(() => {
    const taMap = new Map<string, any>();
    semesters.forEach(s => {
      const ta = s.tahun_ajaran;
      const taId = String(s.tahun_ajaran_id ?? ta?.id ?? '');
      if (ta && taId && !taMap.has(taId)) {
        taMap.set(taId, { _key: taId, ...ta });
      }
    });
    const list = Array.from(taMap.values());
    const filtered = filterTahunAjaranId 
      ? semesters.filter(s => String(s.tahun_ajaran_id ?? s.tahun_ajaran?.id ?? '') === filterTahunAjaranId)
      : [];
    return { tahunAjaranList: list, filteredSemesterOptions: filtered };
  }, [semesters, filterTahunAjaranId]);

  const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const kategoriOptions = ['Normatif', 'Adaptif', 'Produktif'];

  const fetchSemesters = useCallback(async () => {
    try {
      const resSemester = await api.admin.semester?.getAll() || Promise.resolve({ data: { data: [] } });
      const sems = resSemester?.data?.data || [];
      setSemesters(sems);
      
      const activeSem = sems.find((s: any) => s.is_active === 1 || s.is_active === true);
      if (activeSem) {
        const taId = String(activeSem.tahun_ajaran_id ?? activeSem.tahun_ajaran?.id ?? '');
        const semId = String(activeSem.id);
        initialSemIdRef.current = semId;
        setFilterTahunAjaranId(taId);
        setFilterSemesterId(semId);
      }
    } catch (e) { console.error(e); }
  }, []);

  const fetchDropdowns = useCallback(async () => {
    try {
      const [resGuru, resMapel, resKelas, resJurusan] = await Promise.all([
        api.admin.guruStaf?.getAll({ is_active: 1, per_page: 1000 }) || Promise.resolve({ data: { data: [] } }),
        api.admin.mapel?.getAll({ is_active: 1, per_page: 1000 }) || Promise.resolve({ data: { data: [] } }),
        api.admin.kelas?.getAll({ is_active: 1, per_page: 1000 }) || Promise.resolve({ data: { data: [] } }),
        api.admin.jurusan?.getAll({ paginate: 0 }) || Promise.resolve({ data: { data: [] } })
      ]);
      setGurus(resGuru?.data?.data || []);
      setMapels(resMapel?.data?.data || []);
      setKelasList(resKelas?.data?.data || []);
      setJurusans(resJurusan?.data?.data || resJurusan?.data || []);
    } catch (e) { console.error(e); }
  }, []);

  const fetchData = useCallback(async (page = 1) => {
    if (authLoading || !user) return;
    
    const semId = filterSemesterId || initialSemIdRef.current || '';
    const currentFilterKey = `${semId}-${searchQuery}-${filterGuruId}-${filterMapelId}-${filterKelasId}-${filterJurusanId}-${filterHari}-${filterKategori}-${filterIsActive}-${page}`;
    
    if (lastFetchedFilterRef.current === currentFilterKey) return;
    lastFetchedFilterRef.current = currentFilterKey;

    setLoading(true);
    try {
      const params: any = { 
        page: page,
        per_page: pagination.perPage
      };
      if (searchQuery) params.q = searchQuery;
      if (semId) params.semester_id = semId;
      if (filterGuruId) params.guru_staf_id = filterGuruId;
      if (filterMapelId) params.mata_pelajaran_id = filterMapelId;
      if (filterKelasId) params.kelas_id = filterKelasId;
      if (filterJurusanId) params.jurusan_id = filterJurusanId;
      if (filterHari) params.hari = filterHari;
      if (filterKategori) params.kategori_mapel = filterKategori;
      if (filterIsActive) params.is_active = filterIsActive;

      const res = await api.admin.guruMapel.getAll(params);
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
  }, [authLoading, user, searchQuery, filterSemesterId, filterGuruId, filterMapelId, filterKelasId, filterJurusanId, filterHari, filterKategori, filterIsActive, pagination.perPage]);

  const fetchJamByHari = useCallback(async (hari: string) => {
    if (!hari) {
      setJamOptions([]);
      return;
    }
    try {
      const res = await api.admin.guruMapel.getJamByHari(hari);
      if (res?.data?.data) {
        setJamOptions(res.data.data);
      }
    } catch (e) {
      setJamOptions([]);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchSemesters();
      fetchDropdowns();
    }
  }, [authLoading, user, fetchSemesters, fetchDropdowns]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchData(1);
    }
  }, [fetchData, authLoading, user]);

  useEffect(() => {
    if (formData.hari) {
      fetchJamByHari(formData.hari);
      setFormData(prev => ({ ...prev, jam_mulai_id: '', jam_selesai_id: '' }));
    }
  }, [formData.hari, fetchJamByHari]);

  const handlePageChange = (page: number) => {
    fetchData(page);
  };

  const handleSelectOne = useCallback((id: number) => {
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
        await api.admin.guruMapel.bulkDelete(selectedIds);
        Toast.fire({ icon: 'success', title: 'Berhasil menghapus massal' });
        lastFetchedFilterRef.current = '';
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
      guru_staf_id: '', 
      mata_pelajaran_id: '', 
      kelas_id: '', 
      hari: 'Senin', 
      jam_mulai_id: '', 
      jam_selesai_id: '',
      is_active: true
    });
    setJamOptions([]);
  }, []);

  const handleEditClick = useCallback((item: any) => {
    setIsEdit(true); 
    setCurrentId(item.id);
    setFormData({ 
      guru_staf_id: item.guru?.id?.toString() || '', 
      mata_pelajaran_id: item.mapel?.id?.toString() || '', 
      kelas_id: item.kelas?.id?.toString() || '', 
      hari: item.hari || 'Senin', 
      jam_mulai_id: item.jam_mulai_id?.toString() || '', 
      jam_selesai_id: item.jam_selesai_id?.toString() || '',
      is_active: !!item.is_active
    });
    setShowForm(true);
  }, []);

  const handleExport = async () => {
    try {
      const params: any = {};
      if (searchQuery) params.q = searchQuery;
      if (filterSemesterId) params.semester_id = filterSemesterId;
      if (filterGuruId) params.guru_staf_id = filterGuruId;
      if (filterMapelId) params.mata_pelajaran_id = filterMapelId;
      if (filterKelasId) params.kelas_id = filterKelasId;
      if (filterJurusanId) params.jurusan_id = filterJurusanId;
      if (filterHari) params.hari = filterHari;
      if (filterKategori) params.kategori_mapel = filterKategori;
      if (filterIsActive) params.is_active = filterIsActive;

      const res = await api.admin.guruMapel.export(params);
      fileHelper.download(res, `JADWAL_GURU_MAPEL.xlsx`);
      Toast.fire({ icon: 'success', title: 'Berhasil diekspor' });
    } catch (e) { Toast.fire({ icon: 'error', title: 'Gagal ekspor' }); }
  };

  const handleImportRequest = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fData = fileHelper.prepareImport(e);
    if (!fData) return;
    Swal.fire({ title: 'Membaca File...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await api.admin.guruMapel.importPreview(fData);
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
      const res = await api.admin.guruMapel.import(importFile);
      if (res.data?.success) {
        Swal.close();
        Toast.fire({ icon: 'success', title: res.data.message || 'Berhasil diimpor' });
        setPreviewData(null);
        setImportFile(null);
        lastFetchedFilterRef.current = '';
        fetchData(1);
      }
    } catch (e: any) {
      Swal.close();
      Toast.fire({ icon: 'error', title: e.response?.data?.message || 'Gagal impor' });
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Hapus Jadwal?',
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
        await api.admin.guruMapel.delete(id);
        lastFetchedFilterRef.current = '';
        fetchData(pagination.currentPage);
        Toast.fire({ icon: 'success', title: 'Berhasil dihapus' });
      } catch (e: any) {
        Toast.fire({ icon: 'error', title: 'Gagal menghapus' });
      }
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      const res = isEdit && currentId ? await api.admin.guruMapel.update(currentId, payload) : await api.admin.guruMapel.create(payload);
      if (res.status < 300 || res.data?.success) { 
        Toast.fire({ icon: 'success', title: 'Berhasil disimpan' });
        handleCloseForm(); 
        lastFetchedFilterRef.current = '';
        fetchData(1); 
      }
    } catch (e: any) { 
      Toast.fire({ icon: 'error', title: e.response?.data?.message || 'Kesalahan sistem' });
    } finally { setIsSubmitting(false); }
  };

  const handleResetFilter = () => {
    const activeSem = semesters.find((s: any) => s.is_active === 1 || s.is_active === true);
    if (activeSem) {
      const taId = String(activeSem.tahun_ajaran_id ?? activeSem.tahun_ajaran?.id ?? '');
      setFilterTahunAjaranId(taId);
      setFilterSemesterId(String(activeSem.id));
    }
    setFilterGuruId('');
    setFilterMapelId('');
    setFilterKelasId('');
    setFilterJurusanId('');
    setFilterHari('');
    setFilterKategori('');
    setFilterIsActive('1');
    setSearchQuery('');
  };

  const handleTahunAjaranChange = (newTaId: string) => {
    setFilterTahunAjaranId(newTaId);
    const semsForTa = semesters.filter(s => String(s.tahun_ajaran_id ?? s.tahun_ajaran?.id ?? '') === newTaId);
    if (semsForTa.length > 0) {
      setFilterSemesterId(String(semsForTa[0].id));
    } else {
      setFilterSemesterId('');
    }
  };

  const activeFilterCount = [filterGuruId, filterMapelId, filterKelasId, filterJurusanId, filterHari, filterKategori].filter(v => v !== '').length + (searchQuery ? 1 : 0) + (filterIsActive !== '1' ? 1 : 0);

  if (authLoading) return null;

  return (
    <>
      <div className="container-fluid py-2 px-2 px-md-3">
        <div className="card border-0 shadow-sm rounded-3 mb-2">
          <div className="card-body p-2 p-md-3">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-warning bg-opacity-10 p-1.5 p-md-2 rounded-2">
                  <BookOpen size={16} className="text-warning" />
                </div>
                <div>
                  <h5 className="fw-bold text-dark mb-0 fs-6">Penugasan Guru Mapel</h5>
                  <p className="text-muted mb-0 d-none d-sm-block text-10px">Kelola jadwal dan penugasan mengajar</p>
                </div>
              </div>

              <div className="d-flex flex-wrap align-items-center gap-1 justify-content-end">
                <div className="position-relative search-input-wrapper">
                  <Search size={12} className="position-absolute top-50 start-0 ms-2 translate-middle-y text-muted" />
                  <input
                    id={searchId}
                    type="text"
                    className="form-control form-control-sm ps-5 border-0 bg-light rounded-2 shadow-none text-11px h-34px"
                    placeholder="Cari guru, mapel..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Pencarian"
                    title="Pencarian"
                  />
                </div>

                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className={`btn btn-sm px-2 py-[6px] rounded-3 border d-flex align-items-center gap-1 transition-all ${showFilter || activeFilterCount > 0 ? 'btn-warning border-warning' : 'btn-light'}`}
                  title="Filter Data"
                  aria-label="Filter Data"
                >
                  <Filter size={12}/>
                  <span className="d-none d-sm-inline">Filter</span>
                  {activeFilterCount > 0 && (
                    <span className="badge bg-white text-warning rounded-circle p-0 d-flex align-items-center justify-content-center badge-filter-count-lg">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <div className="vr d-none d-md-block mx-1"></div>

                <button onClick={handleExport} className="btn btn-success btn-sm px-2 shadow-sm rounded-3 py-[6px] border-0 d-flex align-items-center gap-1" title="Export Excel" aria-label="Export Data ke Excel">
                  <FileDown size={12}/>
                  <span className="d-none d-sm-inline">Ekspor</span>
                </button>
                <label className="btn btn-light btn-sm px-2 shadow-sm rounded-3 py-[6px] cursor-pointer mb-0 border d-flex align-items-center gap-1" title="Import Excel" aria-label="Import Data dari Excel">
                  <FileUp size={12}/>
                  <span className="d-none d-sm-inline">Impor</span>
                  <input type="file" className="d-none" accept=".xlsx, .xls, .csv" onChange={handleImportRequest} />
                </label>
                <button onClick={() => setShowForm(true)} className="btn btn-warning btn-sm px-2 py-[6px] rounded-3 d-flex align-items-center gap-1" title="Tambah Data Baru" aria-label="Tambah Data Baru">
                  <Plus size={12}/>
                  <span>Tambah</span>
                </button>
              </div>
            </div>

            {showFilter && (
              <div className="mt-2 pt-2 border-top">
                <div className="row g-2 g-md-3">
                  <div className="col-6 col-sm-4 col-md-3 col-lg-2">
                    <label className="fw-bold text-muted text-uppercase mb-1 d-block text-9px" htmlFor={taFilterId}>Tahun Ajaran</label>
                    <select
                      id={taFilterId}
                      className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none text-11px h-36px"
                      value={filterTahunAjaranId}
                      onChange={(e) => handleTahunAjaranChange(e.target.value)}
                      aria-label="Filter Tahun Ajaran"
                    >
                      {tahunAjaranList.map(ta => <option key={ta._key} value={ta._key}>{ta.nama}</option>)}
                    </select>
                  </div>
                  <div className="col-6 col-sm-4 col-md-3 col-lg-2">
                    <label className="fw-bold text-muted text-uppercase mb-1 d-block text-9px" htmlFor={semFilterId}>Semester</label>
                    <select
                      id={semFilterId}
                      className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none text-11px h-36px"
                      value={filterSemesterId}
                      onChange={(e) => setFilterSemesterId(e.target.value)}
                      disabled={!filterTahunAjaranId || filteredSemesterOptions.length === 0}
                      aria-label="Filter Semester"
                    >
                      {filteredSemesterOptions.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                    </select>
                  </div>
                  <div className="col-6 col-sm-4 col-md-3 col-lg-2">
                    <label className="fw-bold text-muted text-uppercase mb-1 d-block text-9px" htmlFor={guruFilterId}>Guru</label>
                    <GuruSearch 
                      inputId={guruFilterId} 
                      value={filterGuruId} 
                      onChange={setFilterGuruId} 
                      placeholder="Cari Guru..." 
                      gurus={gurus}
                    />
                  </div>
                  <div className="col-6 col-sm-4 col-md-3 col-lg-2">
                    <label className="fw-bold text-muted text-uppercase mb-1 d-block text-9px" htmlFor={mapelFilterId}>Mata Pelajaran</label>
                    <select
                      id={mapelFilterId}
                      className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none text-11px h-36px"
                      value={filterMapelId}
                      onChange={(e) => setFilterMapelId(e.target.value)}
                      aria-label="Filter Mata Pelajaran"
                    >
                      <option value="">Semua Mapel</option>
                      {mapels.map(m => <option key={m.id} value={m.id}>{m.nama_mapel}</option>)}
                    </select>
                  </div>
                  <div className="col-6 col-sm-4 col-md-3 col-lg-2">
                    <label className="fw-bold text-muted text-uppercase mb-1 d-block text-9px" htmlFor={kelasFilterId}>Kelas</label>
                    <select
                      id={kelasFilterId}
                      className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none text-11px h-36px"
                      value={filterKelasId}
                      onChange={(e) => setFilterKelasId(e.target.value)}
                      aria-label="Filter Kelas"
                    >
                      <option value="">Semua Kelas</option>
                      {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                    </select>
                  </div>
                  <div className="col-6 col-sm-4 col-md-3 col-lg-2">
                    <label className="fw-bold text-muted text-uppercase mb-1 d-block text-9px" htmlFor={jurusanFilterId}>Jurusan</label>
                    <select
                      id={jurusanFilterId}
                      className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none text-11px h-36px"
                      value={filterJurusanId}
                      onChange={(e) => setFilterJurusanId(e.target.value)}
                      aria-label="Filter Jurusan"
                    >
                      <option value="">Semua Jurusan</option>
                      {jurusans.map(j => <option key={j.id} value={j.id}>{j.nama_jurusan}</option>)}
                    </select>
                  </div>
                  <div className="col-6 col-sm-4 col-md-3 col-lg-2">
                    <label className="fw-bold text-muted text-uppercase mb-1 d-block text-9px" htmlFor={hariFilterId}>Hari</label>
                    <select
                      id={hariFilterId}
                      className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none text-11px h-36px"
                      value={filterHari}
                      onChange={(e) => setFilterHari(e.target.value)}
                      aria-label="Filter Hari"
                    >
                      <option value="">Semua Hari</option>
                      {hariOptions.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div className="col-6 col-sm-4 col-md-3 col-lg-2">
                    <label className="fw-bold text-muted text-uppercase mb-1 d-block text-9px" htmlFor={kategoriFilterId}>Kategori</label>
                    <select
                      id={kategoriFilterId}
                      className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none text-11px h-36px text-capitalize"
                      value={filterKategori}
                      onChange={(e) => setFilterKategori(e.target.value)}
                      aria-label="Filter Kategori"
                    >
                      <option value="">Semua Kategori</option>
                      {kategoriOptions.map(k => <option key={k} value={k.toLowerCase()}>{k}</option>)}
                    </select>
                  </div>
                  <div className="col-6 col-sm-4 col-md-3 col-lg-2">
                    <label className="fw-bold text-muted text-uppercase mb-1 d-block text-9px" htmlFor={statusFilterId}>Status</label>
                    <select
                      id={statusFilterId}
                      className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none text-11px h-36px"
                      value={filterIsActive}
                      onChange={(e) => setFilterIsActive(e.target.value)}
                      aria-label="Filter Status"
                    >
                      <option value="1">Aktif</option>
                      <option value="0">Non-Aktif</option>
                    </select>
                  </div>
                  <div className="col-6 col-sm-4 col-md-3 col-lg-2 d-flex align-items-end">
                    <button onClick={handleResetFilter} className="btn btn-sm btn-outline-secondary border-0 rounded-2 w-100 d-flex align-items-center justify-content-center gap-1 shadow-none text-dark bg-light text-11px h-36px" title="Reset Filter">
                      <RefreshCw size={11}/> <span>Reset</span>
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
              className="btn btn-danger btn-sm px-2 py-1 rounded-2 shadow-sm border-0 d-flex align-items-center gap-1 fw-bold text-11px"
              title={`Hapus ${selectedIds.length} data terpilih`}
              aria-label={`Hapus ${selectedIds.length} data terpilih`}
            >
              <Trash2 size={12} /> Hapus ({selectedIds.length})
            </button>
          </div>
        )}

        <div className="d-none d-lg-block">
          <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 text-11px">
                <thead className="bg-light">
                  <tr className="fw-bold text-muted text-uppercase text-10px">
                    <th className="ps-2 border-0 py-2 w-30px">
                      <input 
                        type="checkbox" 
                        className="form-check-input border-secondary shadow-none m-0 cursor-pointer" 
                        checked={data.length > 0 && selectedIds.length === data.length} 
                        onChange={handleSelectAll} 
                        aria-label="Pilih semua data" 
                        title="Pilih Semua" 
                      />
                    </th>
                    <th className="border-0 py-2">Guru</th>
                    <th className="border-0 py-2">Mata Pelajaran</th>
                    <th className="border-0 py-2">Kelas</th>
                    <th className="border-0 py-2 text-center">Hari</th>
                    <th className="border-0 py-2">Waktu</th>
                    <th className="border-0 py-2 text-center">Status</th>
                    <th className="border-0 py-2 text-end pe-2">Aksi</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {loading ? (
                    <tr><td colSpan={8} className="text-center py-5"><Loader2 className="text-warning animate-spin mx-auto" size={20} /></td></tr>
                  ) : data.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-5 text-muted text-12px">Tidak ada data ditemukan.</td></tr>
                  ) : data.map((item) => (
                    <GuruMapelRow
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
        </div>

        <div className="d-lg-none">
          {loading ? (
            <div className="text-center py-5">
              <Loader2 className="text-warning animate-spin mx-auto" size={24} />
            </div>
          ) : data.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-body py-5 text-center">
                <BookOpen size={32} className="text-muted mx-auto mb-2 opacity-50" />
                <p className="text-muted mb-0 text-12px">Tidak ada data ditemukan.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="d-flex align-items-center justify-content-between mb-2 px-1">
                <div className="d-flex align-items-center gap-2">
                  <input 
                    type="checkbox" 
                    className="form-check-input border-secondary shadow-none cursor-pointer" 
                    checked={data.length > 0 && selectedIds.length === data.length} 
                    onChange={handleSelectAll} 
                    aria-label="Pilih semua data" 
                    title="Pilih Semua" 
                  />
                  <span className="text-muted text-10px">
                    {selectedIds.length > 0 ? `${selectedIds.length} dipilih` : `Pilih semua (${data.length})`}
                  </span>
                </div>
                <span className="text-muted text-10px">
                  {pagination.total} total
                </span>
              </div>
              <div>
                {data.map((item) => (
                  <GuruMapelCard
                    key={item.id}
                    item={item}
                    onEdit={handleEditClick}
                    onDelete={handleDelete}
                    isSelected={selectedIds.includes(item.id)}
                    onSelect={handleSelectOne}
                  />
                ))}
              </div>
              {data.length > 0 && (
                <div className="d-flex justify-content-between align-items-center px-3 py-2 border-top bg-white mt-1">
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
            </>
          )}
        </div>

        {previewData && previewData.length > 0 && (
          <div className="modal fade show d-block bg-transparent modal-zindex-1070">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable px-2 px-md-3">
              <div className="modal-content border-0 shadow-lg rounded-3">
                <div className="modal-header border-0 pb-0 px-3 pt-3">
                  <div className="d-flex align-items-center">
                    <Eye size={16} className="text-warning me-2 flex-shrink-0" />
                    <h6 className="modal-title fw-bold text-dark mb-0 text-13px">Preview Import Penugasan</h6>
                  </div>
                  <button onClick={() => setPreviewData(null)} className="btn-close shadow-none flex-shrink-0" aria-label="Tutup preview" title="Tutup"></button>
                </div>
                <div className="modal-body p-3">
                  <div className={`alert ${hasError ? 'alert-danger' : 'alert-light bg-light'} border-0 rounded-3 py-2 px-3 mb-3`}>
                    <div className="d-flex align-items-center gap-2">
                      {hasError ? <XCircle size={14} className="text-danger flex-shrink-0" /> : <AlertCircle size={14} className="text-muted flex-shrink-0" />}
                      <span className={`fw-bold ${hasError ? 'text-danger' : 'text-muted'} text-10px`}>
                        {hasError ? 'Terdapat data error. Mohon perbaiki file Anda.' : `${previewData.length} baris data siap diimpor.`}
                      </span>
                    </div>
                  </div>

                  <div className="table-responsive border rounded-3 max-h-300">
                    <table className="table table-sm table-hover mb-0 text-11px">
                      <thead className="bg-light sticky-top">
                        <tr className="text-10px">
                          <th className="py-2 ps-3 border-0 text-center w-50px">Baris</th>
                          <th className="py-2 border-0">Guru</th>
                          <th className="py-2 border-0">Mapel</th>
                          <th className="py-2 border-0">Kelas</th>
                          <th className="py-2 border-0">Hari</th>
                          <th className="py-2 border-0">Waktu</th>
                          <th className="py-2 pe-3 border-0">Catatan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((p, idx) => {
                          const rowErrors = p.errors || [];
                          const isInvalid = String(p.is_conflict) === "true" || p.is_conflict === true || rowErrors.length > 0;
                          return (
                            <tr key={idx} className={isInvalid ? 'bg-danger bg-opacity-10' : ''}>
                              <td className="ps-3 py-1 text-center text-muted">{p.row || '-'}</td>
                              <td className="py-1">{p.guru || '-'}</td>
                              <td className="py-1">{p.mapel || '-'}</td>
                              <td className="py-1">{p.kelas || '-'}</td>
                              <td className="py-1">{p.hari || '-'}</td>
                              <td className="py-1 text-muted">{formatPreviewWaktu(p.waktu)}</td>
                              <td className="py-1 pe-3 text-9px">
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
                        className={`btn btn-warning btn-sm w-100 py-2 rounded-3 shadow-none fw-bold d-flex align-items-center justify-content-center gap-2 text-11px ${hasError ? 'opacity-50' : ''}`}
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
          <div className="form-modal-overlay">
            <div className="form-modal-backdrop" onClick={handleCloseForm}></div>
            <div className="form-modal-dialog">
              <div className="form-modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header border-0 pb-0 px-3 pt-3 form-modal-header">
                  <h6 className="fw-bold text-dark d-flex align-items-center gap-2 m-0 text-13px">
                    <div className="bg-warning bg-opacity-10 p-1 rounded-2">
                      {isEdit ? <Edit2 size={12} className="text-warning"/> : <Plus size={12} className="text-warning"/>}
                    </div>
                    {isEdit ? "Edit Penugasan" : "Tambah Penugasan"}
                  </h6>
                  <button onClick={handleCloseForm} className="btn-close shadow-none flex-shrink-0" aria-label="Tutup Form" title="Tutup"></button>
                </div>
                <div className="modal-body px-3 py-2 form-modal-body-scrollable">
                  <div className="row g-2 pb-3 mx-0">
                    <div className="col-12">
                      <label className="fw-bold text-muted mb-1 d-block text-10px" htmlFor={guruFormId}>Guru <span className="text-danger">*</span></label>
                      <GuruSearch 
                        inputId={guruFormId} 
                        value={formData.guru_staf_id} 
                        onChange={(val) => setFormData({...formData, guru_staf_id: val})} 
                        placeholder="Cari Nama / NIP Guru..." 
                        gurus={gurus}
                      />
                    </div>
                    <div className="col-12">
                      <label className="fw-bold text-muted mb-1 d-block text-10px" htmlFor={mapelFormId}>Mata Pelajaran <span className="text-danger">*</span></label>
                      <select 
                        id={mapelFormId} 
                        className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none text-11px h-38px"
                        value={formData.mata_pelajaran_id} 
                        onChange={(e) => setFormData({...formData, mata_pelajaran_id: e.target.value})} 
                        aria-label="Pilih Mata Pelajaran" 
                        title="Pilih Mata Pelajaran"
                      >
                        <option value="">Pilih Mapel</option>
                        {mapels.map(m => <option key={m.id} value={m.id}>{m.nama_mapel}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="fw-bold text-muted mb-1 d-block text-10px" htmlFor={kelasFormId}>Kelas <span className="text-danger">*</span></label>
                      <select 
                        id={kelasFormId} 
                        className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none text-11px h-38px"
                        value={formData.kelas_id} 
                        onChange={(e) => setFormData({...formData, kelas_id: e.target.value})} 
                        aria-label="Pilih Kelas" 
                        title="Pilih Kelas"
                      >
                        <option value="">Pilih Kelas</option>
                        {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                      </select>
                    </div>
                    <div className="col-12 pt-1">
                      <div className="fw-bold text-warning text-uppercase border-bottom pb-1 mb-2 text-10px">Jadwal</div>
                    </div>
                    <div className="col-12">
                      <label className="fw-bold text-muted mb-1 d-block text-10px" htmlFor={hariFormId}>Hari <span className="text-danger">*</span></label>
                      <select 
                        id={hariFormId} 
                        className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none text-11px h-38px"
                        value={formData.hari} 
                        onChange={(e) => setFormData({...formData, hari: e.target.value})} 
                        aria-label="Pilih Hari" 
                        title="Pilih Hari"
                      >
                        {hariOptions.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="fw-bold text-muted mb-1 d-block text-10px" htmlFor={mulaiFormId}>Jam Mulai <span className="text-danger">*</span></label>
                      <select 
                        id={mulaiFormId} 
                        className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none text-11px h-38px"
                        value={formData.jam_mulai_id} 
                        onChange={(e) => setFormData({...formData, jam_mulai_id: e.target.value})} 
                        aria-label="Pilih Jam Mulai" 
                        title="Pilih Jam Mulai" 
                        disabled={!formData.hari}
                      >
                        <option value="">Pilih Jam</option>
                        {jamOptions.map(j => <option key={j.id} value={j.id}>Ke-{j.jam_ke} ({j.waktu_mulai})</option>)}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="fw-bold text-muted mb-1 d-block text-10px" htmlFor={selesaiFormId}>Jam Selesai <span className="text-danger">*</span></label>
                      <select 
                        id={selesaiFormId} 
                        className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none text-11px h-38px"
                        value={formData.jam_selesai_id} 
                        onChange={(e) => setFormData({...formData, jam_selesai_id: e.target.value})} 
                        aria-label="Pilih Jam Selesai" 
                        title="Pilih Jam Selesai" 
                        disabled={!formData.hari}
                      >
                        <option value="">Pilih Jam</option>
                        {jamOptions.map(j => <option key={j.id} value={j.id}>Ke-{j.jam_ke} ({j.waktu_selesai})</option>)}
                      </select>
                    </div>
                    <div className="col-12 mt-2">
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input shadow-none cursor-pointer" 
                          type="checkbox" 
                          id="statusSwitch" 
                          checked={formData.is_active} 
                          onChange={(e) => setFormData({...formData, is_active: e.target.checked})} 
                        />
                        <label className="form-check-label fw-bold cursor-pointer text-10px" htmlFor="statusSwitch">
                          {formData.is_active ? 'Status Aktif' : 'Status Non-Aktif'}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 p-3 pt-1 form-modal-footer">
                  <button 
                    onClick={handleSave} 
                    className="btn btn-warning btn-sm w-100 py-2 rounded-3 shadow-sm fw-bold d-flex align-items-center justify-content-center gap-2 text-12px" 
                    disabled={isSubmitting} 
                    aria-label={isEdit ? "Perbarui data" : "Simpan data"} 
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
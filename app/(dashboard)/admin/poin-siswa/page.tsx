"use client";

import React, { useState, useEffect, useCallback, useId, memo, useMemo, useRef } from 'react';
import { 
  Plus, Edit2, Loader2, Trash2, FileDown, Filter, ChevronLeft, Search, Award, Users, RefreshCw
} from 'lucide-react';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/useAuth';
import { fileHelper } from '@/lib/file-helper';

const PoinSiswaRow = memo(({ item, no, onEdit, onDelete }: { 
  item: any; 
  no: number;
  onEdit: (i: any) => void; 
  onDelete: (id: number) => void; 
}) => (
  <tr>
    <td className="ps-2 py-1 text-center w-30px text-muted text-11px">{no}</td>
    <td className="py-1">
      <div className="d-flex align-items-center">
        <div className="flex-shrink-0 bg-light rounded p-1.5 d-flex align-items-center justify-content-center">
          <Users size={13} className="text-warning" />
        </div>
        <div className="ms-2">
          <div className="text-dark fw-bold text-truncate mb-0 text-11px">{item.siswa?.nama_lengkap || item.siswa?.nama || '-'}</div>
          <div className="text-muted text-9px">{item.siswa?.nis || item.siswa?.nisn || '-'}</div>
        </div>
      </div>
    </td>
    <td className="py-1 text-muted text-11px">
      <div className="text-truncate mw-150px" title={item.indikator}>{item.indikator || '-'}</div>
    </td>
    <td className="py-1 text-center">
      <div className="d-flex flex-column gap-0.5">
        {item.poin_positif > 0 && (
          <span className="badge bg-success bg-opacity-10 text-success px-1.5 py-0 text-9px d-inline-block">+{item.poin_positif}</span>
        )}
        {item.poin_negatif > 0 && (
          <span className="badge bg-danger bg-opacity-10 text-danger px-1.5 py-0 text-9px d-inline-block">-{item.poin_negatif}</span>
        )}
        {item.poin_positif === 0 && item.poin_negatif === 0 && (
          <span className="text-muted text-9px">0</span>
        )}
      </div>
    </td>
    <td className="py-1 text-muted text-11px text-center">{item.tanggal || '-'}</td>
    <td className="py-1 text-muted text-11px text-center">{item.guru_pelapor?.nama || '-'}</td>
    <td className="py-1 text-muted text-11px text-center d-none d-lg-table-cell">
      <div className="d-flex flex-column align-items-center">
        <span className="text-success text-9px">+{item.total_kumulatif_positif || 0}</span>
        <span className="text-danger text-9px">-{item.total_kumulatif_negatif || 0}</span>
      </div>
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
PoinSiswaRow.displayName = 'PoinSiswaRow';

const PoinSiswaCard = memo(({ item, no, onEdit, onDelete }: { 
  item: any; 
  no: number;
  onEdit: (i: any) => void; 
  onDelete: (id: number) => void; 
}) => (
  <div className="card border shadow-sm rounded-3 mb-2">
    <div className="card-body p-2">
      <div className="d-flex align-items-start justify-content-between mb-2">
        <div className="d-flex align-items-center flex-grow-1 me-2">
          <div className="bg-warning bg-opacity-10 p-1.5 rounded-2 d-flex align-items-center justify-content-center flex-shrink-0">
            <span className="text-warning fw-bold text-11px">{no}</span>
          </div>
          <div className="bg-warning bg-opacity-10 p-1.5 rounded-2 d-flex align-items-center justify-content-center flex-shrink-0 ms-1">
            <Users size={14} className="text-warning" />
          </div>
          <div className="ms-2 flex-grow-1 min-w-0">
            <div className="text-dark fw-bold text-truncate text-12px">{item.siswa?.nama_lengkap || item.siswa?.nama || '-'}</div>
            <div className="text-muted text-truncate text-10px">{item.siswa?.nis || item.siswa?.nisn || '-'}</div>
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
        <div className="col-12">
          <div className="text-muted text-9px">INDIKATOR</div>
          <div className="text-dark fw-semibold text-truncate">{item.indikator || '-'}</div>
        </div>
        <div className="col-6">
          <div className="text-muted text-9px">POIN</div>
          <div className="d-flex gap-1">
            {item.poin_positif > 0 && <span className="badge bg-success bg-opacity-10 text-success">+{item.poin_positif}</span>}
            {item.poin_negatif > 0 && <span className="badge bg-danger bg-opacity-10 text-danger">-{item.poin_negatif}</span>}
            {item.poin_positif === 0 && item.poin_negatif === 0 && <span className="text-muted">0</span>}
          </div>
        </div>
        <div className="col-6">
          <div className="text-muted text-9px">TANGGAL</div>
          <div className="text-dark fw-semibold">{item.tanggal || '-'}</div>
        </div>
        <div className="col-6">
          <div className="text-muted text-9px">GURU PELAPOR</div>
          <div className="text-dark fw-semibold text-truncate text-center">{item.guru_pelapor?.nama || '-'}</div>
        </div>
        <div className="col-6">
          <div className="text-muted text-9px">KUMULATIF</div>
          <div className="d-flex gap-2">
            <span className="text-success text-9px fw-bold">+{item.total_kumulatif_positif || 0}</span>
            <span className="text-danger text-9px fw-bold">-{item.total_kumulatif_negatif || 0}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
));
PoinSiswaCard.displayName = 'PoinSiswaCard';

const SiswaSearch = memo(({ value, onChange, placeholder, inputId, siswas }: { 
  value: string; 
  onChange: (id: string) => void; 
  placeholder: string; 
  inputId: string;
  siswas: any[];
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedSiswa = useMemo(() => {
    return siswas.find((g: any) => String(g.id) === value);
  }, [value, siswas]);

  const filteredSiswas = useMemo(() => {
    if (!query) return siswas;
    const q = query.toLowerCase();
    return siswas.filter((g: any) => 
      (g.nama_lengkap?.toLowerCase().includes(q) || g.nama?.toLowerCase().includes(q) || g.nis?.toLowerCase().includes(q) || g.nisn?.toLowerCase().includes(q))
    );
  }, [query, siswas]);

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
    if (!selectedSiswa) return '';
    const details = [selectedSiswa.nama_lengkap || selectedSiswa.nama, selectedSiswa.nis, selectedSiswa.nisn].filter(Boolean).join(' - ');
    return details;
  }, [selectedSiswa]);

  return (
    <div ref={wrapperRef} className="position-relative">
      <input
        id={inputId}
        type="text"
        className="form-control form-control-sm bg-light border-0 py-1 rounded-2 shadow-none text-11px text-truncate whitespace-nowrap overflow-hidden"
        placeholder={placeholder}
        value={isOpen ? query : displayValue}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          if (!e.target.value) onChange('');
        }}
        onFocus={() => setIsOpen(true)}
        aria-label={placeholder}
        title={displayValue || placeholder}
      />
      {isOpen && (
        <div className="position-absolute start-0 end-0 bg-white border rounded-2 shadow-sm overflow-auto guru-search-dropdown z-[1050]">
          {filteredSiswas.length > 0 ? filteredSiswas.map((g: any) => (
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
              <div className="fw-bold text-truncate">{g.nama_lengkap || g.nama}</div>
              <div className="text-muted text-9px">{g.nis || g.nisn || '-'}</div>
            </div>
          )) : (
            <div className="px-2 py-1 text-muted text-11px">Tidak ditemukan</div>
          )}
        </div>
      )}
    </div>
  );
});
SiswaSearch.displayName = 'SiswaSearch';

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
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight;
      if (rect.bottom > viewportH - 10) {
        dropdownRef.current.style.top = 'auto';
        dropdownRef.current.style.bottom = '100%';
        dropdownRef.current.style.marginBottom = '4px';
      } else {
        dropdownRef.current.style.top = '100%';
        dropdownRef.current.style.bottom = 'auto';
        dropdownRef.current.style.marginBottom = '0';
      }
    }
  }, [isOpen, filteredGurus]);

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
        className="form-control form-control-sm bg-light border-0 py-1 rounded-2 shadow-none text-11px text-truncate whitespace-nowrap overflow-hidden"
        placeholder={placeholder}
        value={isOpen ? query : displayValue}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          if (!e.target.value) onChange('');
        }}
        onFocus={() => setIsOpen(true)}
        aria-label={placeholder}
        title={displayValue || placeholder}
      />
      {isOpen && (
  <div 
    ref={dropdownRef} 
    className="position-absolute start-0 end-0 bg-white border rounded-2 shadow-sm overflow-auto guru-search-dropdown"
  >
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
              <div className="fw-bold text-truncate">{g.nama}</div>
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

export default function InputPoinSiswa() {
  const { user, loading: authLoading } = useAuth();
  
  const [data, setData] = useState<any[]>([]);
  const [siswas, setSiswas] = useState<any[]>([]);
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [gurus, setGurus] = useState<any[]>([]);
  const initialSemIdRef = useRef<string | null>(null);
  const lastFetchedFilterRef = useRef<string>('');

  const [filterTahunAjaranId, setFilterTahunAjaranId] = useState<string>('');
  const [filterSemesterId, setFilterSemesterId] = useState<string>('');
  const [filterKelasId, setFilterKelasId] = useState<string>('');
  const [filterSiswaId, setFilterSiswaId] = useState<string>('');
  const [filterBulan, setFilterBulan] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilter, setShowFilter] = useState<boolean>(false);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10
  });

  const [formData, setFormData] = useState({ 
    siswa_id: '', 
    indikator: '', 
    poin_positif: '', 
    poin_negatif: '',
    tanggal: new Date().toISOString().split('T')[0],
    guru_staf_id: ''
  });

  const siswaFormId = useId();
  const indikatorFormId = useId();
  const poinPositifFormId = useId();
  const poinNegatifFormId = useId();
  const tanggalFormId = useId();
  const guruFormId = useId();
  const searchId = useId();
  const taFilterId = useId();
  const semFilterId = useId();
  const kelasFilterId = useId();
  const siswaFilterId = useId();

  const Toast = useMemo(() => Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  }), []);

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

  const monthOptions = useMemo(() => {
    if (!filterSemesterId || semesters.length === 0) return [];
    const selectedSem = semesters.find((s: any) => String(s.id) === filterSemesterId);
    if (!selectedSem) return [];
    const nama = String(selectedSem.nama || '').toLowerCase();
    let startMonth = 1;
    let endMonth = 12;
    if (nama.includes('ganjil')) {
      startMonth = 7;
      endMonth = 12;
    } else if (nama.includes('genap')) {
      startMonth = 1;
      endMonth = 6;
    }
    const bulanNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const options = [];
    for (let m = startMonth; m <= endMonth; m++) {
      const monthStr = String(m).padStart(2, '0');
      options.push({ value: monthStr, label: bulanNames[m - 1] });
    }
    return options;
  }, [filterSemesterId, semesters]);

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
      const [resSiswa, resKelas, resGuru] = await Promise.all([
        api.admin.siswa?.getAll({ is_active: 1, per_page: 1000 }) || Promise.resolve({ data: { data: [] } }),
        api.admin.kelas?.getAll({ is_active: 1, per_page: 1000 }) || Promise.resolve({ data: { data: [] } }),
        api.admin.guruStaf?.getAll({ is_active: 1, per_page: 1000 }) || Promise.resolve({ data: { data: [] } })
      ]);
      setSiswas(resSiswa?.data?.data || []);
      setKelasList(resKelas?.data?.data || []);
      setGurus(resGuru?.data?.data || []);
      if (user?.id) {
        setFormData(prev => ({ ...prev, guru_staf_id: String(user.id) }));
      }
    } catch (e) { console.error(e); }
  }, [user]);

  const fetchData = useCallback(async (page = 1) => {
    if (authLoading || !user) return;
    
    const currentFilterKey = `${filterSemesterId}-${searchQuery}-${filterKelasId}-${filterSiswaId}-${filterBulan}-${page}`;
    
    if (lastFetchedFilterRef.current === currentFilterKey) return;
    lastFetchedFilterRef.current = currentFilterKey;

    setLoading(true);
    try {
      const params: any = { 
        page: page,
        per_page: pagination.perPage
      };
      if (searchQuery) params.search = searchQuery;
      if (filterSemesterId) params.semester_id = filterSemesterId;
      if (filterKelasId) params.kelas_id = filterKelasId;
      if (filterSiswaId) params.siswa_id = filterSiswaId;
      if (filterBulan) params.bulan = filterBulan;

      const res = await api.admin.poinSiswa.getAll(params);
      if (res?.data) {
        setData(res.data.data || []);
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
  }, [authLoading, user, searchQuery, filterSemesterId, filterKelasId, filterSiswaId, filterBulan, pagination.perPage]);

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

  const handlePageChange = (page: number) => {
    fetchData(page);
  };

  const handleCloseForm = useCallback(() => {
    setShowForm(false); 
    setIsEdit(false); 
    setCurrentId(null); 
    setFormData({ 
      siswa_id: '', 
      indikator: '', 
      poin_positif: '', 
      poin_negatif: '',
      tanggal: new Date().toISOString().split('T')[0],
      guru_staf_id: user?.id ? String(user.id) : ''
    });
  }, [user]);

  const handleEditClick = useCallback((item: any) => {
    setIsEdit(true); 
    setCurrentId(item.id);
    setFormData({ 
      siswa_id: item.siswa?.id?.toString() || '', 
      indikator: item.indikator || '', 
      poin_positif: item.poin_positif?.toString() || '', 
      poin_negatif: item.poin_negatif?.toString() || '',
      tanggal: item.tanggal || new Date().toISOString().split('T')[0],
      guru_staf_id: item.guru_pelapor?.id?.toString() || (user?.id ? String(user.id) : '')
    });
    setShowForm(true);
  }, [user]);

  const handleExport = async () => {
    try {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (filterSemesterId) params.semester_id = filterSemesterId;
      if (filterKelasId) params.kelas_id = filterKelasId;
      if (filterSiswaId) params.siswa_id = filterSiswaId;
      if (filterBulan) params.bulan = filterBulan;

      const res = await api.admin.poinSiswa.export(params);
      fileHelper.download(res, `DATA_POIN_SISWA.xlsx`);
      Toast.fire({ icon: 'success', title: 'Berhasil diekspor' });
    } catch (e) { Toast.fire({ icon: 'error', title: 'Gagal ekspor' }); }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Hapus Poin Siswa?',
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
        await api.admin.poinSiswa.delete(id);
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
      const payload = { 
        ...formData,
        poin_positif: formData.poin_positif ? parseInt(formData.poin_positif) : null,
        poin_negatif: formData.poin_negatif ? parseInt(formData.poin_negatif) : null
      };
      const res = isEdit && currentId ? await api.admin.poinSiswa.update(currentId, payload) : await api.admin.poinSiswa.create(payload);
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
    } else {
      setFilterTahunAjaranId('');
      setFilterSemesterId('');
    }
    setFilterKelasId('');
    setFilterSiswaId('');
    setFilterBulan('');
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
    setFilterBulan('');
  };

  const activeFilterCount = [filterKelasId, filterSiswaId, filterBulan].filter(v => v !== '').length + (searchQuery ? 1 : 0);

  const rowStartNo = (pagination.currentPage - 1) * pagination.perPage;

  if (authLoading) return null;

  return (
    <>
      <div className="container-fluid py-2 px-2 px-md-3">
        <div className="card border-0 shadow-sm rounded-3 mb-2">
          <div className="card-body p-2 p-md-3">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-warning bg-opacity-10 p-1.5 p-md-2 rounded-2">
                  <Award size={16} className="text-warning" />
                </div>
                <div>
                  <h5 className="fw-bold text-dark mb-0 fs-6">Input Poin Siswa</h5>
                  <p className="text-muted mb-0 d-none d-sm-block text-10px">Kelola poin positif dan negatif siswa</p>
                </div>
              </div>

              <div className="d-flex flex-wrap align-items-center gap-1 justify-content-end">
                <div className="position-relative search-input-wrapper">
                  <Search size={12} className="position-absolute top-50 start-0 ms-2 translate-middle-y text-muted" />
                  <input
                    id={searchId}
                    type="text"
                    className="form-control form-control-sm ps-5 border-0 bg-light rounded-2 shadow-none text-11px h-34px"
                    placeholder="Cari siswa (Nama/NIS)..."
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
                      onChange={(e) => {
                        setFilterSemesterId(e.target.value);
                        setFilterBulan('');
                      }}
                      disabled={!filterTahunAjaranId || filteredSemesterOptions.length === 0}
                      aria-label="Filter Semester"
                    >
                      {filteredSemesterOptions.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
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
                    <label className="fw-bold text-muted text-uppercase mb-1 d-block text-9px" htmlFor={siswaFilterId}>Siswa</label>
                    <SiswaSearch 
                      inputId={siswaFilterId} 
                      value={filterSiswaId} 
                      onChange={setFilterSiswaId} 
                      placeholder="Cari Siswa..." 
                      siswas={siswas}
                    />
                  </div>
                  <div className="col-6 col-sm-4 col-md-3 col-lg-2">
                    <label className="fw-bold text-muted text-uppercase mb-1 d-block text-9px">Bulan</label>
                    <select
                      className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none text-11px h-36px"
                      value={filterBulan}
                      onChange={(e) => setFilterBulan(e.target.value)}
                      disabled={monthOptions.length === 0}
                      aria-label="Filter Bulan"
                    >
                      <option value="">Semua Bulan</option>
                      {monthOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
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

        <div className="d-none d-lg-block">
          <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 text-11px">
                <thead className="bg-light">
                  <tr className="fw-bold text-muted text-uppercase text-10px">
                    <th className="ps-2 border-0 py-2 w-30px text-center">No</th>
                    <th className="border-0 py-2">Siswa</th>
                    <th className="border-0 py-2">Indikator</th>
                    <th className="border-0 py-2 text-center">Poin</th>
                    <th className="border-0 py-2 text-center">Tanggal</th>
                    <th className="border-0 py-2 text-center">Guru Pelapor</th>
                    <th className="border-0 py-2 text-center">Total Kumulatif</th>
                    <th className="border-0 py-2 text-end pe-2">Aksi</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {loading ? (
                    <tr><td colSpan={8} className="text-center py-5"><Loader2 className="text-warning animate-spin mx-auto" size={20} /></td></tr>
                  ) : data.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-5 text-muted text-12px">Tidak ada data ditemukan.</td></tr>
                  ) : data.map((item, idx) => (
                    <PoinSiswaRow
                      key={item.id}
                      item={item}
                      no={rowStartNo + idx + 1}
                      onEdit={handleEditClick}
                      onDelete={handleDelete}
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
                <Award size={32} className="text-muted mx-auto mb-2 opacity-50" />
                <p className="text-muted mb-0 text-12px">Tidak ada data ditemukan.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="d-flex align-items-center justify-content-end mb-2 px-1">
                <span className="text-muted text-10px">
                  {pagination.total} total
                </span>
              </div>
              <div>
                {data.map((item, idx) => (
                  <PoinSiswaCard
                    key={item.id}
                    item={item}
                    no={rowStartNo + idx + 1}
                    onEdit={handleEditClick}
                    onDelete={handleDelete}
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
            {isEdit ? "Edit Poin Siswa" : "Input Poin Siswa"}
          </h6>
          <button onClick={handleCloseForm} className="btn-close shadow-none flex-shrink-0" aria-label="Tutup Form" title="Tutup"></button>
        </div>
        <div className="modal-body px-3 py-2">
          <div className="row g-2 pb-3 mx-0">
            <div className="col-12">
              <label className="fw-bold text-muted mb-1 d-block text-10px" htmlFor={siswaFormId}>Siswa <span className="text-danger">*</span></label>
              <SiswaSearch 
                inputId={siswaFormId} 
                value={formData.siswa_id} 
                onChange={(val) => setFormData({...formData, siswa_id: val})} 
                placeholder="Cari Nama / NIS / NISN..." 
                siswas={siswas}
              />
            </div>
            <div className="col-12">
              <label className="fw-bold text-muted mb-1 d-block text-10px" htmlFor={indikatorFormId}>Indikator Perilaku <span className="text-danger">*</span></label>
              <input 
                id={indikatorFormId}
                type="text" 
                className="form-control form-control-sm bg-light border-0 rounded-2 shadow-none text-11px h-38px"
                placeholder="Contoh: Terlambat masuk sekolah"
                value={formData.indikator} 
                onChange={(e) => setFormData({...formData, indikator: e.target.value})} 
              />
            </div>
            <div className="col-12">
              <div className="fw-bold text-warning text-uppercase border-bottom pb-1 mb-2 text-10px">Poin</div>
            </div>
            <div className="col-6">
              <label className="fw-bold text-muted mb-1 d-block text-10px" htmlFor={poinPositifFormId}>Poin Positif</label>
              <input 
                id={poinPositifFormId}
                type="number" 
                min="0"
                className="form-control form-control-sm bg-light border-0 rounded-2 shadow-none text-11px h-38px"
                placeholder="0"
                value={formData.poin_positif} 
                onChange={(e) => setFormData({...formData, poin_positif: e.target.value})} 
              />
            </div>
            <div className="col-6">
              <label className="fw-bold text-muted mb-1 d-block text-10px" htmlFor={poinNegatifFormId}>Poin Negatif</label>
              <input 
                id={poinNegatifFormId}
                type="number" 
                min="0"
                className="form-control form-control-sm bg-light border-0 rounded-2 shadow-none text-11px h-38px"
                placeholder="0"
                value={formData.poin_negatif} 
                onChange={(e) => setFormData({...formData, poin_negatif: e.target.value})} 
              />
            </div>
            <div className="col-12">
              <label className="fw-bold text-muted mb-1 d-block text-10px" htmlFor={tanggalFormId}>Tanggal <span className="text-danger">*</span></label>
              <input 
                id={tanggalFormId}
                type="date" 
                className="form-control form-control-sm bg-light border-0 rounded-2 shadow-none text-11px h-38px"
                value={formData.tanggal} 
                onChange={(e) => setFormData({...formData, tanggal: e.target.value})} 
              />
            </div>
            <div className="col-12">
              <label className="fw-bold text-muted mb-1 d-block text-10px" htmlFor={guruFormId}>Guru Pelapor</label>
              <GuruSearch 
                inputId={guruFormId} 
                value={formData.guru_staf_id} 
                onChange={(val) => setFormData({...formData, guru_staf_id: val})} 
                placeholder="Cari Nama / NIP Guru..." 
                gurus={gurus}
              />
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
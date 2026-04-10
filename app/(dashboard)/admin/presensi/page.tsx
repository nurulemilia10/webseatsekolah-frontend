"use client";

import React, { useState, useEffect, useCallback, useId, memo, useMemo, useRef } from 'react';
import { 
  Plus, Edit2, Loader2, Trash2, FileDown, Filter, ChevronLeft, Search, Award, Users, RefreshCw, ChevronRight, Save, Eye, ClipboardList, CalendarX, UserCheck, UserX, BedDouble, AlertTriangle
} from 'lucide-react';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/useAuth';
import { fileHelper } from '@/lib/file-helper';

const statusConfig: Record<string, { color: string; bg: string }> = {
  Hadir: { color: 'text-success', bg: 'bg-success bg-opacity-10' },
  Izin: { color: 'text-info', bg: 'bg-info bg-opacity-10' },
  Sakit: { color: 'text-warning', bg: 'bg-warning bg-opacity-10' },
  Alpa: { color: 'text-danger', bg: 'bg-danger bg-opacity-10' }
};

const statusColorMap: Record<string, string> = {
  Hadir: '#198754',
  Izin: '#0dcaf0',
  Sakit: '#ffc107',
  Alpa: '#dc3545'
};

const statusOpts = [
  { key: 'Hadir', label: 'H' },
  { key: 'Izin', label: 'I' },
  { key: 'Sakit', label: 'S' },
  { key: 'Alpa', label: 'A' },
];

const PresensiJurnalRow = memo(({ item, no, onView, onDelete }: { 
  item: any; 
  no: number;
  onView: (i: any) => void; 
  onDelete: (i: any) => void;
}) => {
  const rekap = item.rekap_harian || {};
  return (
    <tr className="cursor-pointer" onClick={() => onView(item)}>
      <td className="ps-2 py-1 text-center w-30px text-muted text-11px">{no}</td>
      <td className="py-1">
        <div className="d-flex align-items-center">
          <div className="flex-shrink-0 bg-light rounded p-1.5 d-flex align-items-center justify-content-center">
            <ClipboardList size={13} className="text-warning" />
          </div>
          <div className="ms-2">
            <div className="text-dark fw-bold text-truncate mb-0 text-11px">{item.nama_kelas || '-'}</div>
            <div className="text-muted text-9px">{item.nama_guru || '-'}</div>
          </div>
        </div>
      </td>
      <td className="py-1 text-muted text-11px text-center">{item.hari || '-'}</td>
      <td className="py-1 text-muted text-11px text-center">{item.tanggal || '-'}</td>
      <td className="py-1 text-center">
        <div className="d-flex flex-column gap-0.5">
          <div className="d-flex align-items-center justify-content-center gap-1">
            <UserCheck size={9} className="text-success" />
            <span className="text-success text-9px fw-bold">{rekap.hadir || 0}</span>
            <UserX size={9} className="text-info ms-1" />
            <span className="text-info text-9px fw-bold">{rekap.izin || 0}</span>
            <BedDouble size={9} className="text-warning ms-1" />
            <span className="text-warning text-9px fw-bold">{rekap.sakit || 0}</span>
            <AlertTriangle size={9} className="text-danger ms-1" />
            <span className="text-danger text-9px fw-bold">{rekap.alpa || 0}</span>
          </div>
          <span className="text-muted text-8px">Total: {rekap.total || 0}</span>
        </div>
      </td>
      <td className="py-1 text-center d-none d-lg-table-cell">
        <span className="badge bg-success bg-opacity-10 text-success px-1.5 py-0 text-9px">{item.status_jurnal || '-'}</span>
      </td>
      <td className="py-1 text-end pe-2">
        <button className="btn btn-sm p-0.5 text-warning border-0 shadow-none" title="Lihat Detail" aria-label="Lihat Detail" onClick={(e) => { e.stopPropagation(); onView(item); }}>
          <span className="bg-light p-0.5 rounded-1 d-inline-flex"><Eye size={10}/></span>
        </button>
        <button className="btn btn-sm p-0.5 text-danger border-0 shadow-none ms-1" title="Hapus" aria-label="Hapus" onClick={(e) => { e.stopPropagation(); onDelete(item); }}>
          <span className="bg-light p-0.5 rounded-1 d-inline-flex"><Trash2 size={10}/></span>
        </button>
      </td>
    </tr>
  );
});
PresensiJurnalRow.displayName = 'PresensiJurnalRow';

const PresensiJurnalCard = memo(({ item, no, onView, onDelete }: { 
  item: any; 
  no: number;
  onView: (i: any) => void;
  onDelete: (i: any) => void;
}) => {
  const rekap = item.rekap_harian || {};
  return (
    <div className="card border shadow-sm rounded-3 mb-2">
      <div className="card-body p-2">
        <div className="d-flex align-items-start justify-content-between mb-2">
          <div className="d-flex align-items-center flex-grow-1 me-2 cursor-pointer" onClick={() => onView(item)}>
            <div className="bg-warning bg-opacity-10 p-1.5 rounded-2 d-flex align-items-center justify-content-center flex-shrink-0">
              <span className="text-warning fw-bold text-11px">{no}</span>
            </div>
            <div className="bg-warning bg-opacity-10 p-1.5 rounded-2 d-flex align-items-center justify-content-center flex-shrink-0 ms-1">
              <ClipboardList size={14} className="text-warning" />
            </div>
            <div className="ms-2 flex-grow-1 min-w-0">
              <div className="text-dark fw-bold text-truncate text-12px">{item.nama_kelas || '-'}</div>
              <div className="text-muted text-truncate text-10px">{item.nama_guru || '-'}</div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-1 flex-shrink-0">
            <span className="badge bg-success bg-opacity-10 text-success px-1.5 py-0 text-8px">{item.status_jurnal || '-'}</span>
            <button className="btn btn-sm p-0.5 text-danger border-0 shadow-none" title="Hapus" aria-label="Hapus" onClick={() => onDelete(item)}>
              <span className="bg-light p-0.5 rounded-1 d-inline-flex"><Trash2 size={10}/></span>
            </button>
          </div>
        </div>
        <div className="row g-1 text-11px mb-2">
          <div className="col-6">
            <div className="text-muted text-9px">HARI</div>
            <div className="text-dark fw-semibold">{item.hari || '-'}</div>
          </div>
          <div className="col-6">
            <div className="text-muted text-9px">TANGGAL</div>
            <div className="text-dark fw-semibold">{item.tanggal || '-'}</div>
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-between bg-light rounded-2 p-1.5 cursor-pointer" onClick={() => onView(item)}>
          <div className="d-flex align-items-center gap-1">
            <UserCheck size={10} className="text-success" />
            <span className="text-success text-10px fw-bold">{rekap.hadir || 0}</span>
          </div>
          <div className="d-flex align-items-center gap-1">
            <UserX size={10} className="text-info" />
            <span className="text-info text-10px fw-bold">{rekap.izin || 0}</span>
          </div>
          <div className="d-flex align-items-center gap-1">
            <BedDouble size={10} className="text-warning" />
            <span className="text-warning text-10px fw-bold">{rekap.sakit || 0}</span>
          </div>
          <div className="d-flex align-items-center gap-1">
            <AlertTriangle size={10} className="text-danger" />
            <span className="text-danger text-10px fw-bold">{rekap.alpa || 0}</span>
          </div>
          <div className="border-start ps-1 ms-1">
            <span className="text-muted text-9px fw-bold">{rekap.total || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
});
PresensiJurnalCard.displayName = 'PresensiJurnalCard';

const KelasCard = memo(({ item, onClick }: { 
  item: any; 
  onClick: (i: any) => void; 
}) => (
  <div className="card border shadow-sm rounded-3 mb-2 cursor-pointer" onClick={() => onClick(item)}>
    <div className="card-body p-2">
      <div className="d-flex align-items-center gap-2">
        <div className="bg-warning bg-opacity-10 p-2 rounded-2 d-flex align-items-center justify-content-center flex-shrink-0">
          <ClipboardList size={16} className="text-warning" />
        </div>
        <div className="flex-grow-1 min-w-0">
          <div className="text-dark fw-bold text-truncate text-12px">{item.nama_kelas || '-'}</div>
          <div className="text-muted text-truncate text-10px">{item.siswa_count || 0} siswa</div>
        </div>
        <div className="d-flex flex-column align-items-end flex-shrink-0">
          {item.status_presensi === 'Sudah Absen' ? (
            <span className="badge bg-success bg-opacity-10 text-success px-1.5 py-0 text-8px">Sudah Absen</span>
          ) : (
            <span className="badge bg-warning bg-opacity-10 text-warning px-1.5 py-0 text-8px">Belum Absen</span>
          )}
        </div>
        <ChevronRight size={14} className="text-muted flex-shrink-0" />
      </div>
    </div>
  </div>
));
KelasCard.displayName = 'KelasCard';

const DetailSiswaRow = ({ item, no, form, onFormChange }: { 
  item: any; 
  no: number;
  form: { status: string; keterangan: string };
  onFormChange: (val: { status: string; keterangan: string }) => void;
}) => {
  return (
    <tr>
      <td className="ps-2 py-1 text-center w-30px text-muted text-11px align-middle">{no}</td>
      <td className="py-1 align-middle" style={{ width: '35%' }}>
        <div className="d-flex align-items-center">
          <div className="flex-shrink-0 bg-light rounded p-1.5 d-flex align-items-center justify-content-center">
            <Users size={13} className="text-warning" />
          </div>
          <div className="ms-2">
            <div className="text-dark fw-bold text-11px" style={{ lineHeight: '1.2' }}>{item.nama || '-'}</div>
            <div className="text-muted text-9px">{item.nis || item.nisn || '-'}</div>
          </div>
        </div>
      </td>
      <td className="py-1 text-center align-middle" style={{ width: '35%' }}>
        <textarea
          className="form-control form-control-sm border-0 bg-light rounded-1 shadow-none text-11px text-start p-1"
          style={{ width: '100%', minHeight: '40px', resize: 'none' }}
          value={form.keterangan || ''}
          onChange={(e) => onFormChange({ ...form, keterangan: e.target.value })}
          placeholder="-"
          aria-label="Keterangan"
          rows={2}
        />
      </td>
      <td className="py-1 text-center align-middle" style={{ width: '30%' }}>
        <div className="d-flex align-items-center justify-content-center" style={{ gap: '3px' }}>
          {statusOpts.map(opt => {
            const isActive = form.status === opt.key;
            return (
              <div key={opt.key} style={{ width: '15px', minWidth: '15px' }} className="d-flex align-items-center justify-content-center" title={opt.key}>
                <input
                  type="checkbox"
                  className="form-check-input m-0 p-0"
                  style={{ width: '15px', height: '15px', fontSize: '10px', ...(isActive ? { backgroundColor: statusColorMap[opt.key], borderColor: statusColorMap[opt.key] } : {}) }}
                  checked={isActive}
                  onChange={() => onFormChange({ ...form, status: opt.key })}
                  aria-label={opt.key}
                />
              </div>
            );
          })}
        </div>
      </td>
    </tr>
  );
};

export default function PresensiSiswa() {
  const { user, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'listKelas' | 'jurnal' | 'detail'>('listKelas');
  const [detailMode, setDetailMode] = useState<'input' | 'readonly'>('input');

  const [kelasList, setKelasList] = useState<any[]>([]);
  const [kelasFilterList, setKelasFilterList] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [jurnalData, setJurnalData] = useState<any[]>([]);
  const [detailSiswa, setDetailSiswa] = useState<any[]>([]);
  const [detailInfo, setDetailInfo] = useState<any>(null);
  const [selectedKelas, setSelectedKelas] = useState<any>(null);

  const lastFetchedJurnalRef = useRef<string>('');
  const initialSemIdRef = useRef<string | null>(null);
  const kelasFetchedRef = useRef<string>('');
  const kelasFilterFetchedRef = useRef<string>('');

  const [filterTanggal, setFilterTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterTahunAjaranId, setFilterTahunAjaranId] = useState<string>('');
  const [filterSemesterId, setFilterSemesterId] = useState<string>('');
  const [filterKelasId, setFilterKelasId] = useState<string>('');
  const [filterBulan, setFilterBulan] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilter, setShowFilter] = useState<boolean>(false);

  const [loadingKelas, setLoadingKelas] = useState(true);
  const [loadingJurnal, setLoadingJurnal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [jurnalPagination, setJurnalPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10
  });

  const [presensiForm, setPresensiForm] = useState<Record<string, { status: string; keterangan: string }>>({});

  const tanggalId = useId();
  const taFilterId = useId();
  const semFilterId = useId();
  const kelasFilterId = useId();
  const searchId = useId();

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

  const allHadir = useMemo(() => {
    if (detailSiswa.length === 0) return false;
    return detailSiswa.every(s => presensiForm[String(s.siswa_id)]?.status === 'Hadir');
  }, [detailSiswa, presensiForm]);

  const fetchSemesters = useCallback(async () => {
    try {
      const resSemester = await api.admin.semester?.getAll() || Promise.resolve({ data: { data: [] } });
      const sems = resSemester?.data?.data || [];
      setSemesters(sems);
      const activeSem = sems.find((s: any) => s.is_active === 1 || s.is_active === true);
      if (activeSem) {
        const taId = String(activeSem.tahun_ajaran_id ?? activeSem.tahun_ajaran?.id ?? '');
        initialSemIdRef.current = String(activeSem.id);
        setFilterTahunAjaranId(taId);
        setFilterSemesterId(String(activeSem.id));
      }
    } catch (e) { console.error(e); }
  }, []);

  const fetchKelas = useCallback(async () => {
    const kelasKey = `${filterSemesterId}`;
    if (kelasFetchedRef.current === kelasKey) return;
    kelasFetchedRef.current = kelasKey;
    setLoadingKelas(true);
    try {
      const params: any = { per_page: 1000 };
      if (filterSemesterId) params.semester_id = filterSemesterId;
      const res = await api.admin.presensi?.listKelas(params);
      if (res?.data?.success) {
        setKelasList(res.data.data || []);
      } else {
        setKelasList([]);
      }
    } catch (e) {
      console.error(e);
      setKelasList([]);
    } finally { setLoadingKelas(false); }
  }, [filterSemesterId]);

  const fetchKelasForFilter = useCallback(async () => {
    if (!filterSemesterId) return;
    const kelasKey = `filter-${filterSemesterId}`;
    if (kelasFilterFetchedRef.current === kelasKey) return;
    kelasFilterFetchedRef.current = kelasKey;
    try {
      const params: any = { per_page: 1000 };
      if (filterSemesterId) params.semester_id = filterSemesterId;
      const res = await api.admin.presensi?.listKelas(params);
      if (res?.data?.success) {
        setKelasFilterList(res.data.data || []);
      } else {
        setKelasFilterList([]);
      }
    } catch (e) {
      console.error(e);
      setKelasFilterList([]);
    }
  }, [filterSemesterId]);

  const fetchJurnal = useCallback(async (page = 1) => {
    if (authLoading || !user) return;
    const currentKey = `${filterSemesterId}-${searchQuery}-${filterKelasId}-${filterBulan}-${page}`;
    if (lastFetchedJurnalRef.current === currentKey) return;
    lastFetchedJurnalRef.current = currentKey;
    setLoadingJurnal(true);
    try {
      const params: any = { page, per_page: jurnalPagination.perPage };
      if (filterSemesterId) params.semester_id = filterSemesterId;
      if (filterKelasId) params.kelas_id = filterKelasId;
      if (filterBulan) params.bulan = filterBulan;
      if (searchQuery) params.search = searchQuery;
      const res = await api.admin.presensi?.getAll(params);
      if (res?.data) {
        setJurnalData(res.data.data || []);
        if (res.data.meta) {
          setJurnalPagination(prev => ({
            ...prev,
            currentPage: res.data.meta.current_page,
            lastPage: res.data.meta.last_page,
            total: res.data.meta.total,
          }));
        }
      }
    } catch (e) { console.error(e); } finally { setLoadingJurnal(false); }
  }, [authLoading, user, filterSemesterId, searchQuery, filterKelasId, filterBulan, jurnalPagination.perPage]);

  const fetchDetail = useCallback(async (kelasId: string, tanggal: string, mode: 'input' | 'readonly', semesterId?: string) => {
    setLoadingDetail(true);
    setDetailMode(mode);
    try {
      const params: any = { tanggal };
      const semId = semesterId || filterSemesterId;
      if (semId) params.semester_id = semId;
      const res = await api.admin.presensi?.listSiswa(kelasId, params);
      if (res?.data) {
        setDetailInfo(res.data.info || null);
        setDetailSiswa(res.data.data || []);
        const formInit: Record<string, { status: string; keterangan: string }> = {};
        (res.data.data || []).forEach((s: any) => {
          formInit[String(s.siswa_id)] = { status: s.status || '', keterangan: s.keterangan || '' };
        });
        setPresensiForm(formInit);
      }
    } catch (e: any) {
      console.error(e);
    } finally { setLoadingDetail(false); }
  }, [filterSemesterId, selectedKelas]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchSemesters();
    }
  }, [authLoading, user, fetchSemesters]);

  useEffect(() => {
    if (!authLoading && user && filterSemesterId) {
      fetchKelas();
      fetchKelasForFilter();
    }
  }, [fetchKelas, fetchKelasForFilter, authLoading, user, filterSemesterId]);

  useEffect(() => {
    if (!authLoading && user && activeTab === 'jurnal') {
      fetchJurnal(1);
    }
  }, [fetchJurnal, authLoading, user, activeTab]);

  const handleKelasClick = (kelas: any) => {
    setSelectedKelas(kelas);
    setDetailMode('input');
    setActiveTab('detail');
    fetchDetail(String(kelas.id), filterTanggal, 'input');
  };

  const handleJurnalView = (item: any) => {
    setSelectedKelas({ id: item.kelas_id, nama_kelas: item.nama_kelas });
    setFilterTanggal(item.tanggal);
    setDetailMode('readonly');
    setActiveTab('detail');
    fetchDetail(String(item.kelas_id), item.tanggal, 'readonly');
  };

  const handleDeleteJurnal = async (item: any) => {
    const result = await Swal.fire({
      title: 'Hapus Presensi?',
      text: `Presensi kelas ${item.nama_kelas} tanggal ${item.tanggal} akan dihapus permanen.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    setIsDeleting(String(item.presensi_id));
    try {
      const res = await api.admin.presensi?.delete(String(item.presensi_id));
      if (res?.status < 300 || res?.data?.success) {
        Toast.fire({ icon: 'success', title: 'Presensi berhasil dihapus' });
        lastFetchedJurnalRef.current = '';
        fetchJurnal(jurnalPagination.currentPage);
      }
    } catch (e: any) {
      const errData = e.response?.data;
      let errMsg = 'Gagal menghapus';
      if (errData?.errors) {
        const firstKey = Object.keys(errData.errors)[0];
        if (firstKey) errMsg = errData.errors[firstKey][0];
      } else if (errData?.message) {
        errMsg = errData.message;
      }
      Toast.fire({ icon: 'error', title: errMsg });
    } finally { setIsDeleting(null); }
  };

  const handleBackFromDetail = () => {
    if (detailMode === 'readonly') {
      setActiveTab('jurnal');
    } else {
      setActiveTab('listKelas');
    }
  };

  const handleCheckAllHadir = (checked: boolean) => {
    const newForm: Record<string, { status: string; keterangan: string }> = {};
    detailSiswa.forEach(s => {
      const sid = String(s.siswa_id);
      newForm[sid] = { status: checked ? 'Hadir' : '', keterangan: presensiForm[sid]?.keterangan || '' };
    });
    setPresensiForm(newForm);
  };

  const handleSavePresensi = async () => {
    if (!selectedKelas) return;
    const entries = Object.entries(presensiForm);
    const unfillCount = entries.filter(([, val]) => !val.status).length;
    if (unfillCount > 0) {
      Toast.fire({ icon: 'warning', title: `${unfillCount} siswa belum diisi status presensi` });
      return;
    }

    const isUpdate = detailMode === 'readonly' && detailInfo?.presensi_id;
    
    const dataPresensi = entries.map(([siswaId, val]) => ({
      siswa_id: siswaId,
      status: val.status,
      keterangan: val.keterangan || null
    }));

    setIsSubmitting(true);
    try {
      if (isUpdate) {
        const res = await api.admin.presensi?.update(String(detailInfo.presensi_id), { 
          data_presensi: dataPresensi 
        });
        if (res?.status < 300 || res?.data?.success) {
          Toast.fire({ icon: 'success', title: 'Presensi berhasil diperbarui' });
          fetchDetail(String(selectedKelas.id), filterTanggal, 'readonly');
        }
      } else {
        const payload = {
          kelas_id: selectedKelas.id,
          tanggal: filterTanggal,
          data_presensi: dataPresensi
        };
        const res = await api.admin.presensi?.create(payload);
        if (res?.status < 300 || res?.data?.success) {
          Toast.fire({ icon: 'success', title: 'Presensi berhasil disimpan' });
          fetchDetail(String(selectedKelas.id), filterTanggal, 'readonly');
        }
      }
    } catch (e: any) {
      const errData = e.response?.data;
      let errMsg = 'Gagal menyimpan';
      if (errData?.errors) {
        const firstKey = Object.keys(errData.errors)[0];
        if (firstKey) errMsg = errData.errors[firstKey][0];
      } else if (errData?.message) {
        errMsg = errData.message;
      }
      Toast.fire({ icon: 'error', title: errMsg });
    } finally { setIsSubmitting(false); }
  };

  const handleExport = async () => {
    if (!filterKelasId) {
      Toast.fire({ icon: 'warning', title: 'Pilih kelas terlebih dahulu' });
      return;
    }
    if (!filterBulan) {
      Toast.fire({ icon: 'warning', title: 'Pilih bulan terlebih dahulu' });
      return;
    }
    try {
      const params: any = { kelas_id: filterKelasId, bulan: filterBulan };
      if (filterSemesterId) params.semester_id = filterSemesterId;
      const res = await api.admin.presensi?.export(params);
      fileHelper.download(res, `REKAP_PRESENSI.xlsx`);
      Toast.fire({ icon: 'success', title: 'Berhasil diekspor' });
    } catch (e: any) {
      const errData = e.response?.data;
      let errMsg = 'Gagal ekspor';
      if (errData?.errors) {
        const firstKey = Object.keys(errData.errors)[0];
        if (firstKey) errMsg = errData.errors[firstKey][0];
      } else if (errData?.message) {
        errMsg = errData.message;
      }
      Toast.fire({ icon: 'error', title: errMsg });
    }
  };

  const handleResetFilter = () => {
    const activeSem = semesters.find((s: any) => s.is_active === 1 || s.is_active === true);
    if (activeSem) {
      setFilterTahunAjaranId(String(activeSem.tahun_ajaran_id ?? activeSem.tahun_ajaran?.id ?? ''));
      setFilterSemesterId(String(activeSem.id));
    } else {
      setFilterTahunAjaranId('');
      setFilterSemesterId('');
    }
    setFilterKelasId('');
    setFilterBulan('');
    setSearchQuery('');
  };

  const handleTahunAjaranChange = (val: string) => {
    setFilterTahunAjaranId(val);
    const sems = semesters.filter(s => String(s.tahun_ajaran_id ?? s.tahun_ajaran?.id ?? '') === val);
    setFilterSemesterId(sems.length > 0 ? String(sems[0].id) : '');
    setFilterBulan('');
    kelasFilterFetchedRef.current = '';
  };

  const handleSemesterChange = (val: string) => {
    setFilterSemesterId(val);
    setFilterBulan('');
    kelasFilterFetchedRef.current = '';
  };

  const handleFormChange = (siswaId: string, val: { status: string; keterangan: string }) => {
    setPresensiForm(prev => ({ ...prev, [siswaId]: val }));
  };

  const activeFilterCount = [filterKelasId, filterBulan].filter(v => v !== '').length + (searchQuery ? 1 : 0);
  const jurnalRowStart = (jurnalPagination.currentPage - 1) * jurnalPagination.perPage;

  if (authLoading) return null;

  return (
    <>
      <div className="container-fluid py-2 px-2 px-md-3">
        <div className="card border-0 shadow-sm rounded-3 mb-2">
          <div className="card-body p-2 p-md-3">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-warning bg-opacity-10 p-1.5 p-md-2 rounded-2">
                  <ClipboardList size={16} className="text-warning" />
                </div>
                <div>
                  <h5 className="fw-bold text-dark mb-0 fs-6">Presensi Siswa</h5>
                  <p className="text-muted mb-0 d-none d-sm-block text-10px">Kelola presensi harian siswa</p>
                </div>
              </div>
              <div className="d-flex flex-wrap align-items-center gap-1 justify-content-end">
                {activeTab === 'jurnal' && (
                  <>
                    <div className="position-relative search-input-wrapper">
                      <Search size={12} className="position-absolute top-50 start-0 ms-2 translate-middle-y text-muted" />
                      <input
                        id={searchId}
                        type="text"
                        className="form-control form-control-sm ps-5 border-0 bg-light rounded-2 shadow-none text-11px h-34px"
                        placeholder="Cari kelas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Pencarian"
                      />
                    </div>
                    <button
                      onClick={() => setShowFilter(!showFilter)}
                      className={`btn btn-sm px-2 py-[6px] rounded-3 border d-flex align-items-center gap-1 transition-all ${showFilter || activeFilterCount > 0 ? 'btn-warning border-warning' : 'btn-light'}`}
                      title="Filter"
                      aria-label="Filter"
                    >
                      <Filter size={12}/>
                      <span className="d-none d-sm-inline">Filter</span>
                      {activeFilterCount > 0 && (
                        <span className="badge bg-white text-warning rounded-circle p-0 d-flex align-items-center justify-content-center badge-filter-count-lg">{activeFilterCount}</span>
                      )}
                    </button>
                    <div className="vr d-none d-md-block mx-1"></div>
                    <button onClick={handleExport} className="btn btn-success btn-sm px-2 shadow-sm rounded-3 py-[6px] border-0 d-flex align-items-center gap-1" title="Export" aria-label="Export">
                      <FileDown size={12}/>
                      <span className="d-none d-sm-inline">Ekspor</span>
                    </button>
                  </>
                )}
                {activeTab === 'listKelas' && (
                  <div className="d-flex align-items-center gap-1">
                    <input
                      id={tanggalId}
                      type="date"
                      className="form-control form-control-sm bg-light border-0 rounded-2 shadow-none text-11px h-34px"
                      value={filterTanggal}
                      onChange={(e) => setFilterTanggal(e.target.value)}
                      aria-label="Tanggal"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="d-flex align-items-center gap-1 mt-2 border-top pt-2">
              <button
                onClick={() => { setActiveTab('listKelas'); lastFetchedJurnalRef.current = ''; }}
                className={`btn btn-sm px-2 py-1 rounded-2 border-0 text-11px fw-bold ${activeTab === 'listKelas' ? 'btn-warning text-white' : 'btn-light text-dark'}`}
              >
                <ClipboardList size={11} className="me-1"/> List Kelas
              </button>
              <ChevronRight size={10} className="text-muted" />
              <button
                onClick={() => setActiveTab('jurnal')}
                className={`btn btn-sm px-2 py-1 rounded-2 border-0 text-11px fw-bold ${activeTab === 'jurnal' ? 'btn-warning text-white' : 'btn-light text-dark'}`}
              >
                <Award size={11} className="me-1"/> Jurnal
              </button>
              {activeTab === 'detail' && (
                <>
                  <ChevronRight size={10} className="text-muted" />
                  <button
                    onClick={handleBackFromDetail}
                    className="btn btn-sm px-2 py-1 rounded-2 border-0 text-11px fw-bold btn-warning text-white"
                  >
                    <Eye size={11} className="me-1"/> Detail {detailInfo?.kelas || selectedKelas?.nama_kelas || ''}
                  </button>
                </>
              )}
            </div>

            {activeTab === 'jurnal' && showFilter && (
              <div className="mt-2 pt-2 border-top">
                <div className="row g-2 g-md-3">
                  <div className="col-6 col-sm-4 col-md-3 col-lg-2">
                    <label className="fw-bold text-muted text-uppercase mb-1 d-block text-9px" htmlFor={taFilterId}>Tahun Ajaran</label>
                    <select id={taFilterId} className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none text-11px h-36px" value={filterTahunAjaranId} onChange={(e) => handleTahunAjaranChange(e.target.value)}>
                      {tahunAjaranList.map(ta => <option key={ta._key} value={ta._key}>{ta.nama}</option>)}
                    </select>
                  </div>
                  <div className="col-6 col-sm-4 col-md-3 col-lg-2">
                    <label className="fw-bold text-muted text-uppercase mb-1 d-block text-9px" htmlFor={semFilterId}>Semester</label>
                    <select id={semFilterId} className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none text-11px h-36px" value={filterSemesterId} onChange={(e) => handleSemesterChange(e.target.value)} disabled={!filterTahunAjaranId || filteredSemesterOptions.length === 0}>
                      {filteredSemesterOptions.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                    </select>
                  </div>
                  <div className="col-6 col-sm-4 col-md-3 col-lg-2">
                    <label className="fw-bold text-muted text-uppercase mb-1 d-block text-9px" htmlFor={kelasFilterId}>Kelas</label>
                    <select id={kelasFilterId} className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none text-11px h-36px" value={filterKelasId} onChange={(e) => setFilterKelasId(e.target.value)}>
                      <option value="">Semua Kelas</option>
                      {kelasFilterList.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                    </select>
                  </div>
                  <div className="col-6 col-sm-4 col-md-3 col-lg-2">
                    <label className="fw-bold text-muted text-uppercase mb-1 d-block text-9px">Bulan</label>
                    <select className="form-select form-select-sm bg-light border-0 rounded-2 shadow-none text-11px h-36px" value={filterBulan} onChange={(e) => setFilterBulan(e.target.value)} disabled={monthOptions.length === 0} aria-label="Bulan">
                      <option value="">Semua Bulan</option>
                      {monthOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div className="col-6 col-sm-4 col-md-3 col-lg-2 d-flex align-items-end">
                    <button onClick={handleResetFilter} className="btn btn-sm btn-outline-secondary border-0 rounded-2 w-100 d-flex align-items-center justify-content-center gap-1 shadow-none text-dark bg-light text-11px h-36px" title="Reset" aria-label="Reset Filter">
                      <RefreshCw size={11}/> <span>Reset</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {activeTab === 'listKelas' && (
          <div className="d-none d-lg-block">
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 text-11px">
                  <thead className="bg-light">
                    <tr className="fw-bold text-muted text-uppercase text-10px">
                      <th className="ps-2 border-0 py-2 w-30px text-center">No</th>
                      <th className="border-0 py-2">Nama Kelas</th>
                      <th className="border-0 py-2 text-center">Siswa</th>
                      <th className="border-0 py-2 text-center">Status</th>
                      <th className="border-0 py-2 text-end pe-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="border-top-0">
                    {loadingKelas ? (
                      <tr><td colSpan={5} className="text-center py-5"><Loader2 className="text-warning animate-spin mx-auto" size={20} /></td></tr>
                    ) : kelasList.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-5 text-muted text-12px">Tidak ada data.</td></tr>
                    ) : kelasList.map((k, idx) => (
                      <tr key={k.id} className="cursor-pointer" onClick={() => handleKelasClick(k)}>
                        <td className="ps-2 py-1 text-center text-muted text-11px">{idx + 1}</td>
                        <td className="py-1 text-dark fw-bold text-11px">{k.nama_kelas}</td>
                        <td className="py-1 text-muted text-11px text-center">{k.siswa_count || 0}</td>
                        <td className="py-1 text-center">
                          {k.status_presensi === 'Sudah Absen' ? (
                            <span className="badge bg-success bg-opacity-10 text-success px-1.5 py-0 text-9px">Sudah Absen</span>
                          ) : (
                            <span className="badge bg-warning bg-opacity-10 text-warning px-1.5 py-0 text-9px">Belum Absen</span>
                          )}
                        </td>
                        <td className="py-1 text-end pe-2">
                          <button className="btn btn-sm p-0.5 text-warning border-0 shadow-none" title="Lihat Presensi" aria-label="Lihat Presensi">
                            <span className="bg-light p-0.5 rounded-1 d-inline-flex"><Eye size={10}/></span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'listKelas' && (
          <div className="d-lg-none">
            {loadingKelas ? (
              <div className="text-center py-5"><Loader2 className="text-warning animate-spin mx-auto" size={24} /></div>
            ) : kelasList.length === 0 ? (
              <div className="card border-0 shadow-sm rounded-3"><div className="card-body py-5 text-center"><ClipboardList size={32} className="text-muted mx-auto mb-2 opacity-50" /><p className="text-muted mb-0 text-12px">Tidak ada data.</p></div></div>
            ) : kelasList.map((k) => <KelasCard key={k.id} item={k} onClick={handleKelasClick} />)}
          </div>
        )}

        {activeTab === 'jurnal' && (
          <div className="d-none d-lg-block">
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 text-11px">
                  <thead className="bg-light">
                    <tr className="fw-bold text-muted text-uppercase text-10px">
                      <th className="ps-2 border-0 py-2 w-30px text-center">No</th>
                      <th className="border-0 py-2">Kelas / Guru</th>
                      <th className="border-0 py-2 text-center">Hari</th>
                      <th className="border-0 py-2 text-center">Tanggal</th>
                      <th className="border-0 py-2 text-center">Rekap Harian</th>
                      <th className="border-0 py-2 text-center d-none d-lg-table-cell">Status</th>
                      <th className="border-0 py-2 text-end pe-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="border-top-0">
                    {loadingJurnal ? (
                      <tr><td colSpan={7} className="text-center py-5"><Loader2 className="text-warning animate-spin mx-auto" size={20} /></td></tr>
                    ) : jurnalData.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-5 text-muted text-12px">Tidak ada data ditemukan.</td></tr>
                    ) : jurnalData.map((item, idx) => (
                      <PresensiJurnalRow key={item.presensi_id} item={item} no={jurnalRowStart + idx + 1} onView={handleJurnalView} onDelete={handleDeleteJurnal} />
                    ))}
                  </tbody>
                </table>
              </div>
              {!loadingJurnal && jurnalData.length > 0 && (
                <div className="d-flex justify-content-between align-items-center px-3 py-2 border-top bg-white">
                  <div className="text-muted text-[9px] fw-medium">Menampilkan {jurnalData.length} dari {jurnalPagination.total} data</div>
                  <nav className="d-flex align-items-center gap-1">
                    <button className="btn btn-light btn-sm border shadow-none p-1 rounded-2" disabled={jurnalPagination.currentPage === 1} onClick={() => { lastFetchedJurnalRef.current = ''; fetchJurnal(jurnalPagination.currentPage - 1); }} aria-label="Halaman sebelumnya"><ChevronLeft size={12} /></button>
                    <div className="d-flex gap-1">
                      {(() => {
                        const pages = []; const cp = jurnalPagination.currentPage; const lp = Math.max(1, jurnalPagination.lastPage);
                        pages.push(1); if (cp > 3) pages.push('e1');
                        for (let i = Math.max(2, cp - 1); i <= Math.min(lp - 1, cp + 1); i++) pages.push(i);
                        if (cp < lp - 2) pages.push('e2'); if (lp > 1) pages.push(lp);
                        return pages.map((p, idx) => {
                          if (typeof p === 'string') return <span key={idx} className="px-1 text-muted text-[10px]">...</span>;
                          return <button key={p} onClick={() => { lastFetchedJurnalRef.current = ''; fetchJurnal(p); }} className={`btn btn-sm px-2 py-1 rounded-2 fw-bold text-[10px] border-0 ${cp === p ? 'btn-warning text-white' : 'btn-light text-dark'}`} aria-label={`Halaman ${p}`}>{p}</button>;
                        });
                      })()}
                    </div>
                    <button className="btn btn-light btn-sm border shadow-none p-1 rounded-2" disabled={jurnalPagination.currentPage === jurnalPagination.lastPage} onClick={() => { lastFetchedJurnalRef.current = ''; fetchJurnal(jurnalPagination.currentPage + 1); }} aria-label="Halaman berikutnya"><ChevronLeft size={12} className="rotate-180" /></button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'jurnal' && (
          <div className="d-lg-none">
            {loadingJurnal ? (
              <div className="text-center py-5"><Loader2 className="text-warning animate-spin mx-auto" size={24} /></div>
            ) : jurnalData.length === 0 ? (
              <div className="card border-0 shadow-sm rounded-3"><div className="card-body py-5 text-center"><Award size={32} className="text-muted mx-auto mb-2 opacity-50" /><p className="text-muted mb-0 text-12px">Tidak ada data.</p></div></div>
            ) : (
              <div className="d-flex align-items-center justify-content-end mb-2 px-1"><span className="text-muted text-10px">{jurnalPagination.total} total</span></div>
            )}
            {!loadingJurnal && jurnalData.map((item, idx) => (
              <PresensiJurnalCard key={item.presensi_id} item={item} no={jurnalRowStart + idx + 1} onView={handleJurnalView} onDelete={handleDeleteJurnal} />
            ))}
          </div>
        )}

        {activeTab === 'detail' && (
          <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
            {detailInfo && (
              <div className="px-3 pt-2 pb-1 bg-light border-bottom">
                <div className="row g-1 text-11px align-items-end">
                  <div className="col-6 col-md-2"><span className="text-muted text-9px d-block">KELAS</span><span className="fw-bold d-block">{detailInfo.kelas}</span></div>
                  <div className="col-6 col-md-2"><span className="text-muted text-9px d-block">TANGGAL</span><span className="fw-bold d-block">{detailInfo.tanggal}</span></div>
                  <div className="col-6 col-md-2"><span className="text-muted text-9px d-block">HARI</span><span className="fw-bold d-block">{detailInfo.hari}</span></div>
                  <div className="col-6 col-md-2"><span className="text-muted text-9px d-block">SEMESTER</span><span className="fw-bold d-block">{detailInfo.semester || '-'}</span></div>
                  <div className="col-6 col-md-4">
                    <span className="text-muted text-9px d-block">STATUS</span>
                    <div className="d-flex align-items-center gap-1">
                      <span className="fw-bold text-9px">{detailInfo.mode}</span>
                      {detailInfo.sudah_isi_absen && <span className="badge bg-success bg-opacity-10 text-success px-1 py-0 text-8px align-baseline">Sudah Absen</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 text-11px" style={{ tableLayout: 'fixed' }}>
                <thead className="bg-light">
                  <tr className="fw-bold text-muted text-uppercase text-10px">
                    <th className="ps-2 border-0 py-2 text-center" style={{ width: '40px' }}>No</th>
                    <th className="border-0 py-2" style={{ width: '35%' }}>Siswa</th>
                    <th className="border-0 py-2 text-center" style={{ width: '35%' }}>Keterangan</th>
                    <th className="border-0 py-2 text-center" style={{ width: '30%' }}>
                      <div className="d-flex align-items-center justify-content-center" style={{ gap: '3px' }}>
                        {statusOpts.map((opt, idx) => (
                          <div key={opt.key} style={{ width: '15px', minWidth: '15px' }} className="d-flex align-items-center justify-content-center position-relative">
                            {idx === 0 && (
                              <div className="position-absolute" style={{ left: '-18px', top: '50%', transform: 'translateY(-50%)' }}>
                                <input
                                  type="checkbox"
                                  className="form-check-input m-0 p-0"
                                  style={{ width: '15px', height: '15px', fontSize: '10px', ...(allHadir ? { backgroundColor: '#198754', borderColor: '#198754' } : {}) }}
                                  checked={allHadir}
                                  onChange={(e) => handleCheckAllHadir(e.target.checked)}
                                  aria-label="Centang semua Hadir"
                                />
                              </div>
                            )}
                            <span className="text-8px text-muted fw-bold">{opt.label}</span>
                          </div>
                        ))}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {loadingDetail ? (
                    <tr><td colSpan={4} className="text-center py-5"><Loader2 className="text-warning animate-spin mx-auto" size={20} /></td></tr>
                  ) : detailSiswa.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-5 text-muted text-12px">Tidak ada siswa.</td></tr>
                  ) : detailSiswa.map((s, idx) => (
                    <DetailSiswaRow
                      key={s.siswa_id}
                      item={s}
                      no={idx + 1}
                      form={presensiForm[String(s.siswa_id)] || { status: '', keterangan: '' }}
                      onFormChange={(val) => handleFormChange(String(s.siswa_id), val)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            {!loadingDetail && detailSiswa.length > 0 && (
              <div className="px-3 py-2 border-top bg-white">
                <button onClick={handleSavePresensi} className="btn btn-warning btn-sm w-100 py-2 rounded-3 shadow-sm fw-bold d-flex align-items-center justify-content-center gap-2 text-12px" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <><Save size={12}/> {detailMode === 'readonly' ? 'Update Presensi' : 'Simpan Presensi'}</>}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
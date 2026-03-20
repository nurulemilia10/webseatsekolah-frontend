"use client";

import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { 
  Plus, Edit2, Loader2, BookOpen, Trash2, FileDown, FileUp, Filter, ChevronLeft, ChevronRight, Calendar, Eye, Check, X, AlertTriangle, User, Users
} from 'lucide-react';
import Select from 'react-select';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/useAuth';
import { fileHelper } from '@/lib/file-helper';

const customSelectStyles = {
  control: (base: any) => ({
    ...base,
    border: 0,
    backgroundColor: '#f8f9fa',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    minHeight: '35px',
    boxShadow: 'none',
  }),
  option: (base: any, state: any) => ({
    ...base,
    fontSize: '0.75rem',
    backgroundColor: state.isSelected ? '#0d6efd' : state.isFocused ? '#e9ecef' : 'white',
    color: state.isSelected ? 'white' : '#333',
  }),
  placeholder: (base: any) => ({
    ...base,
    color: '#6c757d'
  })
};

const GuruMapelRow = memo(({ 
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
      />
    </td>
    <td className="py-2">
      <div className="d-flex align-items-center">
        <div className="flex-shrink-0 bg-light rounded p-1.5 d-flex align-items-center justify-content-center">
          <User size={13} className="text-primary" />
        </div>
        <div className="ms-2">
          <div className="text-dark fw-bold text-sm-custom mb-0">{item.guru_staf?.nama || '-'}</div>
          <div className="text-muted text-xxs d-flex align-items-center">
            NIP: {item.guru_staf?.nip || '-'}
          </div>
        </div>
      </div>
    </td>
    <td className="py-2">
      <div className="d-flex align-items-center">
        <div className="flex-shrink-0 bg-light rounded p-1.5 d-flex align-items-center justify-content-center">
          <BookOpen size={13} className="text-success" />
        </div>
        <div className="ms-2">
          <div className="text-dark fw-bold text-sm-custom mb-0">{item.mapel?.nama_mapel || '-'}</div>
          <div className="text-muted text-xxs italic">Kelompok {item.mapel?.kelompok || '-'}</div>
        </div>
      </div>
    </td>
    <td className="py-2 d-none d-md-table-cell">
      <div className="d-flex align-items-center">
        <div className="flex-shrink-0 bg-light rounded p-1.5 d-flex align-items-center justify-content-center me-2">
          <Users size={12} className="text-muted" />
        </div>
        <span className="text-dark text-xs-custom fw-medium">{item.kelas?.nama_kelas || '-'}</span>
      </div>
    </td>
    <td className="py-2 text-center d-none d-md-table-cell">
      <span className="badge bg-light text-primary border fw-bold text-xs-custom">
        {item.beban_jam || 0} JP
      </span>
    </td>
    <td className="py-2 text-end pe-3">
      <div className="d-flex justify-content-end gap-1">
        <button 
          onClick={() => onEdit(item)} 
          className="btn btn-sm p-1 text-primary border-0 shadow-none"
        >
          <span className="bg-light p-1 rounded-3 d-inline-flex"><Edit2 size={11}/></span>
        </button>
        <button 
          onClick={() => onDelete(item.id)} 
          className="btn btn-sm p-1 text-danger border-0 shadow-none"
        >
          <span className="bg-danger bg-opacity-10 p-1 rounded-3 d-inline-flex"><Trash2 size={11}/></span>
        </button>
      </div>
    </td>
  </tr>
));

GuruMapelRow.displayName = 'GuruMapelRow';

export default function PenugasanGuruMapel() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [gurus, setGurus] = useState<any[]>([]);
  const [mapels, setMapels] = useState<any[]>([]);
  const [kelases, setKelases] = useState<any[]>([]);
  
  const [filterTahunAjaranId, setFilterTahunAjaranId] = useState<string>('');
  const [filterSemesterId, setFilterSemesterId] = useState<string>('');
  const [filterGuruId, setFilterGuruId] = useState<string>('');
  const [filterMapelId, setFilterMapelId] = useState<string>('');
  const [filterKelasId, setFilterKelasId] = useState<string>('');

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
    guru_staf_id: '', 
    mapel_id: '', 
    kelas_id: '', 
    beban_jam: '',
    keterangan: ''
  });

  const guruOptions = useMemo(() => 
    gurus.map(g => ({ 
      value: g.id.toString(), 
      label: g.nama,
      display: `${g.nama} - ${g.nip || 'No NIP'}`
    })), [gurus]
  );

  const mapelOptions = useMemo(() => 
    mapels.map(m => ({ 
      value: m.id.toString(), 
      label: `${m.nama_mapel} (${m.kelompok})` 
    })), [mapels]
  );

  const kelasOptions = useMemo(() => 
    kelases.map(k => ({ 
      value: k.id.toString(), 
      label: k.nama_kelas 
    })), [kelases]
  );

  const Toast = useMemo(() => Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  }), []);

  const hasConflict = useMemo(() => {
    if (!previewData) return false;
    return previewData.some((p) => p.is_conflict === true);
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
      const res = await api.admin.guruMapel.getAll({ 
        semester_id: sId,
        guru_staf_id: filterGuruId,
        mapel_id: filterMapelId,
        kelas_id: filterKelasId,
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
  }, [authLoading, user, filterSemesterId, filterTahunAjaranId, filterGuruId, filterMapelId, filterKelasId, pagination.perPage, semesters]);

  useEffect(() => {
    const init = async () => {
      const [resSem, resGuru, resMapel, resKelas] = await Promise.all([
        api.admin.semester.getAll(),
        api.admin.guruStaf.getAll({ per_page: 1000 }),
        api.admin.mapel.getAll({ per_page: 1000 }),
        api.admin.kelas.getAll({ per_page: 1000 })
      ]);
      if (resSem?.data?.data) setSemesters(resSem.data.data);
      if (resGuru?.data?.data) setGurus(resGuru.data.data);
      if (resMapel?.data?.data) setMapels(resMapel.data.data);
      if (resKelas?.data?.data) setKelases(resKelas.data.data);
    };
    init();
  }, []);

  useEffect(() => {
    if (semesters.length > 0) {
      fetchData(filterSemesterId, 1);
    }
  }, [fetchData, filterSemesterId, filterTahunAjaranId, filterGuruId, filterMapelId, filterKelasId]);

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
      text: "Data penugasan yang dipilih akan dihapus.",
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
        await api.admin.guruMapel.bulkDestroy(selectedIds.map(id => parseInt(id)));
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
      guru_staf_id: '', 
      mapel_id: '', 
      kelas_id: '', 
      beban_jam: '', 
      keterangan: '' 
    });
  }, []);

  const handleEditClick = useCallback((item: any) => {
    setIsEdit(true); 
    setCurrentId(item.id);
    setFormData({ 
      guru_staf_id: item.guru_staf_id?.toString() || '', 
      mapel_id: item.mapel_id?.toString() || '', 
      kelas_id: item.kelas_id?.toString() || '', 
      beban_jam: item.beban_jam?.toString() || '',
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
      const res = await api.admin.guruMapel.export({ 
        semester_id: filterSemesterId,
        guru_staf_id: filterGuruId,
        mapel_id: filterMapelId,
        kelas_id: filterKelasId 
      });
      const activeSem = semesters.find(s => s.id.toString() === filterSemesterId);
      const semLabel = activeSem ? activeSem.nama.replace(/\s+/g, '_').toUpperCase() : filterSemesterId;
      fileHelper.download(res, `PENUGASAN_GURU_${semLabel}.xlsx`);
      Toast.fire({ icon: 'success', title: 'Berhasil diekspor' });
    } catch (e) { Toast.fire({ icon: 'error', title: 'Gagal ekspor' }); }
  };

  const handleImportRequest = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fData = fileHelper.prepareImport(e);
    if (!fData) return;
    if (filterSemesterId) fData.append('semester_id', filterSemesterId);

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
    if (!importFile || hasConflict) return;
    setIsSubmitting(true);
    Swal.fire({ title: 'Mengimpor Data...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await api.admin.guruMapel.import(importFile);
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
      title: 'Hapus Penugasan?',
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
        fetchData(filterSemesterId, pagination.currentPage);
        Toast.fire({ icon: 'success', title: 'Berhasil dihapus' });
      } catch (e: any) {
        Toast.fire({ icon: 'error', title: 'Gagal menghapus' });
      }
    }
  };

  const handleSave = async () => {
    if (!formData.guru_staf_id || !formData.mapel_id || !formData.kelas_id) {
      Toast.fire({ icon: 'warning', title: 'Lengkapi data wajib' });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        ...(filterSemesterId && !isEdit ? { semester_id: filterSemesterId } : {})
      };
      const res = isEdit && currentId ? await api.admin.guruMapel.update(currentId, payload) : await api.admin.guruMapel.create(payload);
      if (res.status < 300 || res.data?.success) { 
        Toast.fire({ icon: 'success', title: 'Berhasil disimpan' });
        handleCloseForm(); 
        fetchData(filterSemesterId, 1); 
      }
    } catch (e: any) { 
      Toast.fire({ icon: 'error', title: e.response?.data?.message || 'Kesalahan sistem' });
    } finally { setIsSubmitting(false); }
  };

  if (authLoading) return null;

  return (
    <div className="container-fluid py-3 px-2 px-md-3">
      <div className="card border-0 shadow-sm rounded-3 mb-3">
        <div className="card-body p-2 p-md-3">
          <div className="d-flex flex-column gap-3">
            <div className="d-flex flex-column flex-md-row align-items-md-center gap-3">
              <div className="d-flex align-items-center">
                <BookOpen size={16} className="text-primary me-2" />
                <h6 className="mb-0 fw-bold text-dark text-uppercase text-md-custom">Penugasan Guru Mapel</h6>
              </div>
              
              <div className="d-flex flex-wrap align-items-center gap-2 ms-auto justify-content-end w-100 w-md-auto">
                <div className="d-flex align-items-center gap-2">
                  <div className="position-relative">
                    <Calendar size={12} className="position-absolute top-50 start-0 ms-2 translate-middle-y text-muted z-1" />
                    <select 
                      className="form-select form-select-sm ps-4 border-0 bg-light text-xs-custom rounded-3 fw-medium w-[120px] w-md-[150px] shadow-none"
                      value={filterTahunAjaranId}
                      onChange={(e) => {
                        setFilterTahunAjaranId(e.target.value);
                        setFilterSemesterId('');
                      }}
                    >
                      <option value="">Tahun Ajaran</option>
                      {tahunAjarans.map(ta => <option key={ta.id} value={ta.id}>{ta.nama}</option>)}
                    </select>
                  </div>

                  <div className="position-relative">
                    <Filter size={12} className="position-absolute top-50 start-0 ms-2 translate-middle-y text-muted z-1" />
                    <select 
                      className="form-select form-select-sm ps-4 border-0 bg-light text-xs-custom rounded-3 fw-medium w-[110px] w-md-[130px] shadow-none"
                      value={filterSemesterId}
                      disabled={!filterTahunAjaranId}
                      onChange={(e) => setFilterSemesterId(e.target.value)}
                    >
                      <option value="">Semester</option>
                      {filteredSemesterOptions.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                    </select>
                  </div>
                </div>

                <div className="vr d-none d-md-block mx-1"></div>

                <div className="d-flex gap-1">
                  <button onClick={handleExport} className="btn btn-success btn-sm px-2 shadow-sm rounded-3 py-1.5 border-0 d-flex align-items-center gap-1 text-xs-custom">
                    <FileDown size={13}/>
                    <span className="d-none d-lg-inline">Export</span>
                  </button>
                  <label className="btn btn-light btn-sm px-2 shadow-sm rounded-3 py-1.5 cursor-pointer mb-0 border d-flex align-items-center gap-1 text-xs-custom">
                    <FileUp size={13}/>
                    <span className="d-none d-lg-inline">Import</span>
                    <input type="file" className="d-none" accept=".xlsx, .xls" onChange={handleImportRequest} />
                  </label>
                  <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm px-2 shadow-sm rounded-3 py-1.5 d-flex align-items-center gap-1 text-xs-custom">
                    <Plus size={13}/>
                    <span>Tambah</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-light p-2 rounded-3">
              <div className="row g-2">
                <div className="col-12 col-md-4">
                  <Select
                    instanceId="filter-guru"
                    placeholder="Semua Guru / NIP"
                    options={guruOptions}
                    styles={customSelectStyles}
                    isClearable
                    getOptionLabel={(o: any) => o.display}
                    value={guruOptions.find(o => o.value === filterGuruId) || null}
                    onChange={(val: any) => setFilterGuruId(val?.value || '')}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <Select
                    instanceId="filter-mapel"
                    placeholder="Semua Mapel"
                    options={mapelOptions}
                    styles={customSelectStyles}
                    isClearable
                    value={mapelOptions.find(o => o.value === filterMapelId) || null}
                    onChange={(val: any) => setFilterMapelId(val?.value || '')}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <Select
                    instanceId="filter-kelas"
                    placeholder="Semua Kelas"
                    options={kelasOptions}
                    styles={customSelectStyles}
                    isClearable
                    value={kelasOptions.find(o => o.value === filterKelasId) || null}
                    onChange={(val: any) => setFilterKelasId(val?.value || '')}
                  />
                </div>
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
                  />
                </th>
                <th className="border-0 py-2.5 fw-bold text-muted text-uppercase">Guru Pengajar</th>
                <th className="border-0 py-2.5 fw-bold text-muted text-uppercase">Mata Pelajaran</th>
                <th className="border-0 py-2.5 fw-bold text-muted text-uppercase d-none d-md-table-cell">Kelas</th>
                <th className="border-0 py-2.5 fw-bold text-muted text-uppercase text-center d-none d-md-table-cell">Beban</th>
                <th className="border-0 py-2.5 text-end pe-3 fw-bold text-muted text-uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-5"><Loader2 className="text-primary animate-spin mx-auto" size={20} /></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-5 text-muted text-xs-custom">Tidak ada penugasan guru yang ditemukan.</td></tr>
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
          <div className="d-flex justify-content-between align-items-center p-3 border-top bg-white">
            <div className="text-xs-custom text-muted">Total: {pagination.total} penugasan</div>
            <div className="d-flex gap-1">
              <button 
                className="btn btn-light btn-sm p-1" 
                disabled={pagination.currentPage === 1} 
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                <ChevronLeft size={14} />
              </button>
              <button className="btn btn-primary btn-sm px-2 text-xs-custom">
                {pagination.currentPage}
              </button>
              <button 
                className="btn btn-light btn-sm p-1" 
                disabled={pagination.currentPage === pagination.lastPage} 
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {previewData && (
        <div className="modal fade show d-block bg-black-40 z-modal-preview">
          <div className="modal-dialog modal-xl modal-dialog-centered px-3">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-0 pb-0 px-3 pt-3">
                <div className="d-flex align-items-center">
                  <Eye size={16} className="text-primary me-2" />
                  <h6 className="modal-title fw-bold text-dark text-md-custom">Preview Import Penugasan</h6>
                </div>
                <button onClick={() => setPreviewData(null)} className="btn-close scale-75 shadow-none"></button>
              </div>
              <div className="modal-body p-3">
                <div className={`alert ${hasConflict ? 'alert-danger' : 'alert-info'} py-2 px-3 border-0 rounded-3 mb-3 d-flex align-items-center gap-2`}>
                  <AlertTriangle size={14} />
                  <p className="text-xs-custom mb-0">
                    {hasConflict 
                      ? "Beberapa data memiliki masalah (Guru/Mapel/Kelas tidak ditemukan). Silakan cek baris merah." 
                      : `Ditemukan ${previewData.length} data valid yang siap diunggah.`}
                  </p>
                </div>
                <div className="table-responsive border rounded-3 max-h-400">
                  <table className="table table-sm table-hover mb-0">
                    <thead className="bg-light sticky-top">
                      <tr className="text-xxs">
                        <th className="py-2 px-3">Guru</th>
                        <th className="py-2">Mata Pelajaran</th>
                        <th className="py-2">Kelas</th>
                        <th className="py-2 text-center">Beban</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((p, idx) => (
                        <tr key={idx} className={`text-xs-custom ${p.is_conflict ? 'table-danger' : ''}`}>
                          <td className="py-2 px-3 fw-medium">{p.guru_nama || '-'}</td>
                          <td className="py-2">{p.mapel_nama || '-'}</td>
                          <td className="py-2">{p.kelas_nama || '-'}</td>
                          <td className="py-2 text-center">{p.beban_jam}</td>
                          <td className="py-2">
                            {p.is_conflict ? (
                              <span className="text-danger fw-bold d-flex align-items-center gap-1">
                                <X size={10} /> {p.message}
                              </span>
                            ) : (
                              <span className="text-success d-flex align-items-center gap-1">
                                <Check size={10} /> Valid
                              </span>
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
                    <button onClick={() => setPreviewData(null)} className="btn btn-light btn-sm w-100 py-2 text-sm-custom rounded-3 d-flex align-items-center justify-content-center gap-2 border">
                      <X size={14}/> Batal
                    </button>
                  </div>
                  <div className="col-6">
                    <button 
                      onClick={confirmImport} 
                      className="btn btn-primary btn-sm w-100 py-2 text-sm-custom rounded-3 d-flex align-items-center justify-content-center gap-2" 
                      disabled={isSubmitting || hasConflict}
                    >
                      {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14}/> Konfirmasi</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal fade show d-block bg-black-40 z-modal-form">
          <div className="modal-dialog modal-dialog-centered px-3">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-0 pb-0 px-3 pt-3">
                <h6 className="modal-title fw-bold text-dark text-md-custom">{isEdit ? "Edit Penugasan" : "Tambah Penugasan"}</h6>
                <button onClick={handleCloseForm} className="btn-close scale-75 shadow-none"></button>
              </div>
              <div className="modal-body p-3">
                <div className="mb-3">
                  <label className="form-label text-xs-custom fw-semibold">Guru Pengajar</label>
                  <Select
                    instanceId="form-guru"
                    placeholder="Pilih Guru..."
                    options={guruOptions}
                    styles={customSelectStyles}
                    getOptionLabel={(o: any) => o.display}
                    value={guruOptions.find(o => o.value === formData.guru_staf_id) || null}
                    onChange={(val: any) => setFormData({...formData, guru_staf_id: val?.value || ''})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-xs-custom fw-semibold">Mata Pelajaran</label>
                  <Select
                    instanceId="form-mapel"
                    placeholder="Pilih Mata Pelajaran..."
                    options={mapelOptions}
                    styles={customSelectStyles}
                    value={mapelOptions.find(o => o.value === formData.mapel_id) || null}
                    onChange={(val: any) => setFormData({...formData, mapel_id: val?.value || ''})}
                  />
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-8">
                    <label className="form-label text-xs-custom fw-semibold">Kelas</label>
                    <Select
                      instanceId="form-kelas"
                      placeholder="Pilih Kelas..."
                      options={kelasOptions}
                      styles={customSelectStyles}
                      value={kelasOptions.find(o => o.value === formData.kelas_id) || null}
                      onChange={(val: any) => setFormData({...formData, kelas_id: val?.value || ''})}
                    />
                  </div>
                  <div className="col-4">
                    <label className="form-label text-xs-custom fw-semibold">Beban (JP)</label>
                    <input 
                      type="number" 
                      className="form-control bg-light border-0 py-1.5 text-xs-custom rounded-3 shadow-none" 
                      style={{ height: '35px' }}
                      value={formData.beban_jam} 
                      onChange={(e) => setFormData({...formData, beban_jam: e.target.value})} 
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label text-xs-custom fw-semibold">Keterangan</label>
                  <input 
                    type="text" 
                    className="form-control bg-light border-0 py-1.5 text-xs-custom rounded-3 shadow-none" 
                    style={{ height: '35px' }}
                    value={formData.keterangan} 
                    onChange={(e) => setFormData({...formData, keterangan: e.target.value})} 
                    placeholder="Opsional" 
                  />
                </div>
              </div>
              <div className="modal-footer border-0 p-3 pt-0">
                <button onClick={handleSave} className="btn btn-primary btn-sm w-100 py-2 text-sm-custom rounded-3 shadow-none" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 size={12} className="animate-spin mx-auto" /> : (isEdit ? "Update Penugasan" : "Simpan Penugasan")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import React, { useState, useEffect, useCallback, useId, memo, useMemo } from 'react';
import { 
  Plus, Edit2, Loader2, Clock, Trash2, FileDown, FileUp, Filter, ChevronLeft, ChevronRight, Calendar
} from 'lucide-react';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/useAuth';
import { fileHelper } from '@/lib/file-helper';

const JamSekolahRow = memo(({ item, onEdit, onDelete }: { item: any, onEdit: (i: any) => void, onDelete: (id: string) => void }) => (
  <tr>
    <td className="ps-3 py-2">
      <div className="d-flex align-items-center">
        <div className="flex-shrink-0 bg-light rounded p-1.5 d-flex align-items-center justify-content-center">
          <Clock size={13} className="text-primary" />
        </div>
        <div className="ms-2">
          <div className="text-dark fw-bold text-[11px] mb-0">{item.hari}</div>
          <div className="text-muted text-[9px] d-flex align-items-center">
            <Calendar size={10} className="me-1" />
            {item.semester?.tahun_ajaran?.nama || '-'}
          </div>
        </div>
      </div>
    </td>
    <td className="py-2 text-dark fw-bold text-[10px] text-center">
      {item.jam_ke || '-'}
    </td>
    <td className="py-2 text-muted text-[10px] d-none d-md-table-cell">
      <div className="d-flex align-items-center gap-1">
        <span className="badge bg-light text-dark border fw-normal">{item.waktu_mulai}</span>
        <span>-</span>
        <span className="badge bg-light text-dark border fw-normal">{item.waktu_selesai}</span>
      </div>
    </td>
    <td className="py-2 text-muted text-[10px] d-none d-md-table-cell">
      <span className={`badge ${item.jenis === 'Pelajaran' ? 'bg-primary' : 'bg-warning text-dark'} bg-opacity-10 border-0 text-[9px]`}>
        {item.jenis}
      </span>
    </td>
    <td className="py-2 text-muted text-[10px] d-none d-md-table-cell italic">
      {item.keterangan || '-'}
    </td>
    <td className="py-2 text-end pe-3">
      <div className="d-flex justify-content-end gap-1">
        <button onClick={() => onEdit(item)} className="btn btn-sm p-1 text-primary border-0 shadow-none" title="Edit">
          <span className="bg-light p-1 rounded-3 d-inline-flex"><Edit2 size={11}/></span>
        </button>
        <button onClick={() => onDelete(item.id)} className="btn btn-sm p-1 text-danger border-0 shadow-none" title="Hapus">
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
  const [filterSemesterId, setFilterSemesterId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10
  });

  const [formData, setFormData] = useState({ 
    semester_id: '',
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
  const semId = useId();

  const Toast = useMemo(() => Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  }), []);

  const fetchSemesters = useCallback(async () => {
    try {
      const res = await api.admin.semester.getAll();
      if (res?.data?.data) setSemesters(res.data.data);
    } catch (e) { console.error(e); }
  }, []);

  const fetchData = useCallback(async (sId = filterSemesterId, page = pagination.currentPage) => {
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
        if (res.data.meta) {
          setPagination({
            currentPage: res.data.meta.current_page,
            lastPage: res.data.meta.last_page,
            total: res.data.meta.total,
            perPage: res.data.meta.per_page
          });
          if (res.data.meta.filter_semester_id && !sId) {
            setFilterSemesterId(res.data.meta.filter_semester_id);
          }
        }
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [authLoading, user, filterSemesterId, pagination.currentPage, pagination.perPage]);

  useEffect(() => { 
    fetchSemesters();
    fetchData();
  }, [fetchData, fetchSemesters]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.lastPage) {
      fetchData(filterSemesterId, page);
    }
  };

  const handleCloseForm = useCallback(() => {
    setShowForm(false); 
    setIsEdit(false); 
    setCurrentId(null); 
    setFormData({ 
      semester_id: filterSemesterId,
      hari: 'Senin', 
      jam_ke: '', 
      waktu_mulai: '', 
      waktu_selesai: '', 
      jenis: 'Pelajaran', 
      keterangan: '' 
    });
  }, [filterSemesterId]);

  const handleEditClick = useCallback((item: any) => {
    setIsEdit(true); 
    setCurrentId(item.id);
    setFormData({ 
      semester_id: item.semester_id?.toString() || '',
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
    try {
      // @ts-ignore
      const res = await api.admin.jamSekolah.export({ 
        semester_id: filterSemesterId 
      });
      fileHelper.download(res, 'JAM_SEKOLAH.xlsx');
    } catch (e) { 
      Toast.fire({ icon: 'error', title: 'Gagal ekspor data' }); 
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fData = fileHelper.prepareImport(e);
    if (!fData) return;
    
    Swal.showLoading();
    try {
      const res = await api.admin.jamSekolah.import(fData);
      if (res.data?.success) {
        Toast.fire({ icon: 'success', title: res.data.message });
        fetchData();
      }
    } catch (e: any) {
      Toast.fire({ icon: 'error', title: e.response?.data?.message || 'Gagal impor data' });
    } finally {
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Jam?',
      text: "Data akan dihapus permanen.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      Swal.showLoading();
      try {
        const res = await api.admin.jamSekolah.delete(id);
        if (res.status === 200 || res.data?.success) {
          fetchData();
          Toast.fire({ icon: 'success', title: 'Berhasil dihapus' });
        }
      } catch (e: any) {
        Toast.fire({ icon: 'error', title: e.response?.data?.message || 'Gagal menghapus data.' });
      }
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      let res;
      if (isEdit && currentId) {
        res = await api.admin.jamSekolah.update(currentId, formData);
      } else {
        res = await api.admin.jamSekolah.create(formData);
      }
      if (res.status === 200 || res.status === 201 || res.data?.success) { 
        Toast.fire({ icon: 'success', title: 'Berhasil disimpan' });
        handleCloseForm(); 
        fetchData(); 
      }
    } catch (e: any) { 
      Toast.fire({ icon: 'error', title: e.response?.data?.message || 'Terjadi kesalahan' });
    } finally { setIsSubmitting(false); }
  };

  if (authLoading) return null;

  return (
    <div className="container-fluid py-3 px-2 px-md-3">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
        <div className="d-flex align-items-center">
          <Clock size={16} className="text-primary me-2" />
          <h6 className="mb-0 fw-bold text-dark text-uppercase text-[12px] tracking-wider">Jam Sekolah</h6>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="position-relative">
            <Filter size={12} className="position-absolute top-50 start-0 ms-2 translate-middle-y text-muted" />
            <select 
              className="form-select form-select-sm ps-4 shadow-none border-0 bg-white text-[10px] rounded-3 fw-medium w-[180px]"
              value={filterSemesterId}
              onChange={(e) => {
                setFilterSemesterId(e.target.value);
                fetchData(e.target.value, 1);
              }}
            >
              {semesters.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nama} ({s.tahun_ajaran?.nama || '-'})
                </option>
              ))}
            </select>
          </div>
          <label className="btn btn-light btn-sm px-2 shadow-sm rounded-3 py-1.5 text-[10px] mb-0 cursor-pointer">
            <FileUp size={13} className="me-1"/> <span>Import</span>
            <input type="file" className="d-none" onChange={handleImport} accept=".xlsx,.xls,.csv" />
          </label>
          <button onClick={handleExport} className="btn btn-light btn-sm px-2 shadow-sm rounded-3 py-1.5 text-[10px]">
            <FileDown size={13} className="me-1"/> <span>Export</span>
          </button>
          <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm px-2 shadow-sm rounded-3 py-1.5 text-[10px]">
            <Plus size={13} className="me-1"/> <span>Tambah</span>
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="text-[9px]">
                <th className="ps-3 border-0 py-2.5 fw-bold text-muted text-uppercase">Hari / Tahun Ajaran</th>
                <th className="border-0 py-2.5 fw-bold text-muted text-uppercase text-center">Ke-</th>
                <th className="border-0 py-2.5 fw-bold text-muted text-uppercase d-none d-md-table-cell">Waktu</th>
                <th className="border-0 py-2.5 fw-bold text-muted text-uppercase d-none d-md-table-cell">Jenis</th>
                <th className="border-0 py-2.5 fw-bold text-muted text-uppercase d-none d-md-table-cell">Keterangan</th>
                <th className="border-0 py-2.5 text-end pe-3 fw-bold text-muted text-uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <Loader2 className="text-primary animate-spin mb-2 mx-auto" size={20} />
                    <div className="text-muted text-[10px]">Memuat data...</div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted text-[10px]">Tidak ada data.</td>
                </tr>
              ) : data.map((item) => (
                <JamSekolahRow key={item.id} item={item} onEdit={handleEditClick} onDelete={handleDelete} />
              ))}
            </tbody>
          </table>
        </div>
        
        {!loading && data.length > 0 && (
          <div className="d-flex justify-content-between align-items-center p-3 border-top bg-white">
            <div className="text-[10px] text-muted">
              Menampilkan {((pagination.currentPage - 1) * pagination.perPage) + 1} - {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} dari {pagination.total} data
            </div>
            <div className="d-flex gap-1">
              <button 
                className="btn btn-light btn-sm p-1 rounded-2 shadow-none border-0" 
                disabled={pagination.currentPage === 1}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                <ChevronLeft size={14} />
              </button>
              {[...Array(pagination.lastPage)].map((_, i) => (
                <button 
                  key={i} 
                  className={`btn btn-sm px-2 py-1 rounded-2 border-0 text-[10px] ${pagination.currentPage === i + 1 ? 'btn-primary' : 'btn-light'}`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                className="btn btn-light btn-sm p-1 rounded-2 shadow-none border-0" 
                disabled={pagination.currentPage === pagination.lastPage}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal fade show d-block bg-black/40 z-[1050]">
          <div className="modal-dialog modal-dialog-centered px-3 modal-max-width mx-auto">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-0 pb-0 px-3 pt-3">
                <h6 className="modal-title fw-bold text-dark text-[12px]">{isEdit ? "Edit Jam" : "Tambah Jam"}</h6>
                <button onClick={handleCloseForm} className="btn-close shadow-none scale-75"></button>
              </div>
              <div className="modal-body p-3 pt-2">
                <div className="mb-2">
                  <label className="form-label text-dark mb-1 fw-semibold text-[10px]" htmlFor={semId}>Semester / Tahun Ajaran</label>
                  <select id={semId} className="form-select bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" value={formData.semester_id} onChange={(e) => setFormData({...formData, semester_id: e.target.value})}>
                    <option value="">Pilih Semester</option>
                    {semesters.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nama} ({s.tahun_ajaran?.nama || '-'})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="row g-2">
                  <div className="col-8">
                    <div className="mb-2">
                      <label className="form-label text-dark mb-1 fw-semibold text-[10px]" htmlFor={hariId}>Hari</label>
                      <select id={hariId} className="form-select bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" value={formData.hari} onChange={(e) => setFormData({...formData, hari: e.target.value})}>
                        {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="mb-2">
                      <label className="form-label text-dark mb-1 fw-semibold text-[10px]" htmlFor={jamKeId}>Jam Ke-</label>
                      <input id={jamKeId} type="number" className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" value={formData.jam_ke} onChange={(e) => setFormData({...formData, jam_ke: e.target.value})} placeholder="0" />
                    </div>
                  </div>
                </div>
                <div className="row g-2">
                  <div className="col-6">
                    <div className="mb-2">
                      <label className="form-label text-dark mb-1 fw-semibold text-[10px]" htmlFor={mulaiId}>Mulai</label>
                      <input id={mulaiId} type="time" className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" value={formData.waktu_mulai} onChange={(e) => setFormData({...formData, waktu_mulai: e.target.value})} />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="mb-2">
                      <label className="form-label text-dark mb-1 fw-semibold text-[10px]" htmlFor={selesaiId}>Selesai</label>
                      <input id={selesaiId} type="time" className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" value={formData.waktu_selesai} onChange={(e) => setFormData({...formData, waktu_selesai: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="mb-2">
                  <label className="form-label text-dark mb-1 fw-semibold text-[10px]" htmlFor={jenisId}>Jenis</label>
                  <select id={jenisId} className="form-select bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" value={formData.jenis} onChange={(e) => setFormData({...formData, jenis: e.target.value})}>
                    <option value="Pelajaran">Pelajaran</option>
                    <option value="Istirahat">Istirahat</option>
                    <option value="Upacara">Upacara</option>
                    <option value="Kegiatan">Kegiatan</option>
                  </select>
                </div>
                <div className="mb-0">
                  <label className="form-label text-dark mb-1 fw-semibold text-[10px]" htmlFor={ketId}>Keterangan</label>
                  <input id={ketId} type="text" className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" value={formData.keterangan} onChange={(e) => setFormData({...formData, keterangan: e.target.value})} placeholder="Opsional..." />
                </div>
              </div>
              <div className="modal-footer border-0 p-3 pt-0">
                <button onClick={handleSave} className="btn btn-primary btn-sm w-100 fw-bold shadow-sm py-2 text-[11px] rounded-3" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : (isEdit ? "Update Jam" : "Simpan Jam")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import React, { useState, useEffect, useCallback, memo, useMemo, useId } from 'react';
import { 
  Plus, Edit2, Loader2, Trash2, Image as ImageIcon, Briefcase, Users, ChevronRight, Search
} from 'lucide-react';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/useAuth';

const JabatanRow = memo(({ data, onEdit, onDelete }: { data: any, onEdit: (d: any) => void, onDelete: (id: string) => void }) => (
  <tr>
    <td className="ps-3 py-2">
      <div className="fw-medium text-dark text-[10px] leading-tight mb-0.5 break-words whitespace-normal">
        {data.nama_jabatan}
      </div>
      <div className="text-muted text-[8px] leading-tight whitespace-normal">
        {data.keterangan || '-'}
      </div>
      <div className="mt-1">
        <span className="badge bg-light text-muted fw-normal text-[7px] border py-0 px-1">Slug: {data.slug || '-'}</span>
      </div>
    </td>
    <td className="py-2 text-end pe-3">
      <div className="d-flex justify-content-end gap-1">
        <button onClick={() => onEdit(data)} className="btn btn-sm p-1 text-warning border-0 shadow-none" title="Edit Jabatan">
          <span className="bg-light p-1 rounded-2 d-inline-flex"><Edit2 size={10}/></span>
        </button>
        <button onClick={() => onDelete(data.id)} className="btn btn-sm p-1 text-danger border-0 shadow-none" title="Hapus Jabatan">
          <span className="bg-danger bg-opacity-10 p-1 rounded-2 d-inline-flex"><Trash2 size={10}/></span>
        </button>
      </div>
    </td>
  </tr>
));

const StrukturRow = memo(({ data, onEdit, onDelete }: { data: any, onEdit: (d: any) => void, onDelete: (id: string) => void }) => (
  <tr className="align-top">
    <td className="ps-2 ps-md-3 py-2">
      <div className="d-flex align-items-start">
        <div className="ui-thumb-container flex-shrink-0 w-[24px] h-[24px] mt-0.5">
          {data.pejabat?.foto_url ? (
            <img src={data.pejabat.foto_url} alt="foto" className="w-100 h-100 object-cover block rounded-1" />
          ) : (
            <div className="d-flex align-items-center justify-content-center w-100 h-100 bg-light rounded-1">
              <ImageIcon size={9} className="text-muted" />
            </div>
          )}
        </div>
        <div className="ms-2">
          <div className="text-dark fw-bold text-[9px] leading-tight mb-0.5 whitespace-normal min-w-[60px] max-w-[120px]">
            {data.pejabat?.nama || '-'}
          </div>
          <div className="text-warning fw-medium text-[8px] mb-0.5">
            {data.jabatan?.nama_jabatan || data.jabatan?.nama || '-'}
          </div>
          <div className="text-muted text-[7px]">NIP. {data.pejabat?.nip || '-'}</div>
        </div>
      </div>
    </td>
    <td className="py-2 text-muted text-[8px] d-none d-sm-table-cell text-center align-middle">
      {data.periode || data.periode_mulai || '-'}
    </td>
    <td className="py-2 text-center align-middle">
      <div className="ui-ttd-container">
        {data.url_ttd ? (
          <img 
            src={data.url_ttd} 
            alt="ttd" 
            className="ui-ttd-image" 
          />
        ) : (
          <span className="text-muted text-[7px] italic">No TTD</span>
        )}
      </div>
    </td>
    <td className="py-2 text-end pe-2 pe-md-3 align-middle">
      <div className="d-flex justify-content-end gap-1">
        <button onClick={() => onEdit(data)} className="btn btn-sm p-1 text-warning border-0 shadow-none" title="Edit Struktur">
          <span className="bg-light p-1 rounded-2 d-inline-flex"><Edit2 size={9}/></span>
        </button>
        <button onClick={() => onDelete(data.id)} className="btn btn-sm p-1 text-danger border-0 shadow-none" title="Hapus Struktur">
          <span className="bg-danger bg-opacity-10 p-1 rounded-2 d-inline-flex"><Trash2 size={9}/></span>
        </button>
      </div>
    </td>
  </tr>
));

export default function ManajemenOrganisasi() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'jabatan' | 'struktur'>('jabatan');
  const [data, setData] = useState<any[]>([]);
  const [listJabatan, setListJabatan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guruOptions, setGuruOptions] = useState<any[]>([]);
  const [searchGuru, setSearchGuru] = useState('');
  const [loadingGuru, setLoadingGuru] = useState(false);
  const [showDropdownGuru, setShowDropdownGuru] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<any>({
    nama_jabatan: '', keterangan: '', slug: '',
    guru_staf_id: '', jabatan_id: '', urutan_tampil: 0,
    periode_mulai: '', file_ttd: null
  });

  const [errors, setErrors] = useState<any>({});
  const fotoId = useId();

  const Toast = useMemo(() => Swal.mixin({
    toast: true, position: 'top', showConfirmButton: false, timer: 3000, timerProgressBar: true,
  }), []);

  const fetchData = useCallback(async () => {
    if (authLoading || !user) return;
    setLoading(true);
    try {
      if (activeTab === 'jabatan') {
        const res = await api.admin.jabatan.getAll();
        setData(res.data?.data || []);
      } else {
        const [resStruktur, resJabatan] = await Promise.all([
          api.admin.struktur_jabatan.getAll(),
          api.admin.jabatan.getAll()
        ]);
        setData(resStruktur.data?.data || []);
        setListJabatan(resJabatan.data?.data || []);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [authLoading, user, activeTab]);

  const fetchGuru = useCallback(async (q = '') => {
    setLoadingGuru(true);
    try {
      const res = await api.admin.guruStaf.getAll({ q, per_page: 10 });
      setGuruOptions(res.data?.data || []);
    } catch (e) { console.error(e); } finally { setLoadingGuru(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (showForm && searchGuru && showDropdownGuru && activeTab === 'struktur') {
      const delayDebounceFn = setTimeout(() => { fetchGuru(searchGuru); }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchGuru, showForm, fetchGuru, showDropdownGuru, activeTab]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData((prev: any) => ({ ...prev, file_ttd: file }));
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleCloseForm = useCallback(() => {
    if (photoPreview && photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
    setShowForm(false); setIsEdit(false); setCurrentId(null);
    setPhotoPreview(null); setErrors({});
    setFormData({
      nama_jabatan: '', keterangan: '', slug: '',
      guru_staf_id: '', jabatan_id: '', urutan_tampil: 0,
      periode_mulai: '', file_ttd: null
    });
    setSearchGuru(''); setShowDropdownGuru(false);
  }, [photoPreview]);

  const handleEditClick = useCallback((item: any) => {
    setIsEdit(true); setCurrentId(item.id);
    if (activeTab === 'jabatan') {
      setFormData({ 
        nama_jabatan: item.nama_jabatan, 
        keterangan: item.keterangan, 
        slug: item.slug 
      });
    } else {
      setFormData({ 
        guru_staf_id: item.pejabat?.id, 
        jabatan_id: item.jabatan?.id, 
        urutan_tampil: item.urutan || 0,
        periode_mulai: item.periode || item.periode_mulai || '',
        file_ttd: null
      });
      setSearchGuru(item.pejabat?.nama || '');
      setPhotoPreview(item.url_ttd || null);
    }
    setShowForm(true);
  }, [activeTab]);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Data?', icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#d33', confirmButtonText: 'Ya, Hapus!', reverseButtons: true
    });
    if (result.isConfirmed) {
      try {
        const res = activeTab === 'jabatan' 
          ? await api.admin.jabatan.delete(id)
          : await api.admin.struktur_jabatan.delete(id);
        if (res.data?.success) {
          Toast.fire({ icon: 'success', title: res.data?.message });
          fetchData();
        }
      } catch (e: any) {
        Toast.fire({ icon: 'error', title: e.response?.data?.message || 'Gagal menghapus' });
      }
    }
  };

  const handleSave = async () => {
    setErrors({}); setIsSubmitting(true);
    try {
      let res;
      if (activeTab === 'jabatan') {
        res = isEdit ? await api.admin.jabatan.update(currentId!, formData) : await api.admin.jabatan.create(formData);
      } else {
        const payload = new FormData();
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== undefined) payload.append(key, formData[key]);
        });
        if (isEdit) { payload.append('_method', 'PUT'); res = await api.admin.struktur_jabatan.update(currentId!, payload); }
        else { res = await api.admin.struktur_jabatan.create(payload); }
      }
      if (res.data?.success) {
        Toast.fire({ icon: 'success', title: res.data?.message });
        handleCloseForm(); fetchData();
      }
    } catch (e: any) {
      if (e.response?.status === 422) setErrors(e.response.data.errors);
      else Toast.fire({ icon: 'error', title: 'Terjadi kesalahan' });
    } finally { setIsSubmitting(false); }
  };

  if (authLoading) return null;

  return (
    <div className="container-fluid py-2 py-md-3 px-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          <div className={`d-flex align-items-center cursor-pointer ${activeTab === 'jabatan' ? 'text-warning' : 'text-muted'}`} onClick={() => setActiveTab('jabatan')}>
            <Briefcase size={12} className="me-1" />
            <h6 className="mb-0 fw-bold text-uppercase text-[9px] tracking-wider">Master</h6>
          </div>
          <ChevronRight size={10} className="text-muted" />
          <div className={`d-flex align-items-center cursor-pointer ${activeTab === 'struktur' ? 'text-warning' : 'text-muted'}`} onClick={() => setActiveTab('struktur')}>
            <Users size={12} className="me-1" />
            <h6 className="mb-0 fw-bold text-uppercase text-[9px] tracking-wider">Struktur</h6>
          </div>
        </div>
        <div>
          <button onClick={() => { 
            setFormData({ nama_jabatan: '', keterangan: '', slug: '', guru_staf_id: '', jabatan_id: '', urutan_tampil: 0, periode_mulai: '', file_ttd: null }); 
            setShowForm(true); 
          }} className="btn btn-warning btn-sm px-2 shadow-sm rounded-3 py-1.5 text-[9px]">
            <Plus size={10} className="me-1"/> <span>Tambah</span>
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0 min-w-[300px]">
            <thead className="bg-light">
              <tr className="text-[7px] md:text-[8px]">
                <th className="ps-3 border-0 py-2 fw-bold text-muted text-uppercase">{activeTab === 'jabatan' ? 'Nama Jabatan' : 'Pejabat'}</th>
                {activeTab === 'struktur' && <th className="border-0 py-2 fw-bold text-muted text-uppercase d-none d-sm-table-cell text-center">Periode</th>}
                {activeTab === 'struktur' && <th className="border-0 py-2 fw-bold text-muted text-uppercase text-center">TTD</th>}
                <th className="border-0 py-2 text-end pe-3 fw-bold text-muted text-uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-5">
                    <Loader2 className="text-warning animate-spin mb-2 mx-auto" size={14} />
                    <div className="text-muted text-[8px]">Memuat...</div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-5 text-muted text-[8px]">Data kosong.</td>
                </tr>
              ) : data.map((item) => (
                activeTab === 'jabatan' 
                  ? <JabatanRow key={item.id} data={item} onEdit={handleEditClick} onDelete={handleDelete} />
                  : <StrukturRow key={item.id} data={item} onEdit={handleEditClick} onDelete={handleDelete} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="modal fade show d-block bg-black/40 z-[1050]">
          <div className="modal-dialog modal-dialog-centered px-3 modal-sm mx-auto max-w-[400px]">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header border-0 pb-0 px-3 pt-3">
                <h6 className="modal-title fw-bold text-dark text-[10px]">
                  {isEdit ? "Edit Data" : "Tambah Data"}
                </h6>
                <button onClick={handleCloseForm} className="btn-close shadow-none scale-75" aria-label="Close"></button>
              </div>
              <div className="modal-body p-3 pt-2">
                <div className="d-flex flex-column gap-2.5">
                  {activeTab === 'jabatan' ? (
                    <>
                      <div>
                        <label htmlFor="nama_jabatan" className="form-label text-dark mb-1 fw-semibold text-[9px]">Nama Jabatan</label>
                        <input id="nama_jabatan" type="text" className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" value={formData.nama_jabatan || ''} onChange={(e) => setFormData({...formData, nama_jabatan: e.target.value})} />
                        {errors.nama_jabatan && <div className="text-danger mt-1 text-[7px]">{errors.nama_jabatan[0]}</div>}
                      </div>
                      <div>
                        <label htmlFor="slug_jabatan" className="form-label text-dark mb-1 fw-semibold text-[9px]">Slug</label>
                        <input id="slug_jabatan" type="text" className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3 font-monospace" placeholder="contoh: kepala-sekolah" value={formData.slug || ''} onChange={(e) => setFormData({...formData, slug: e.target.value})} />
                      </div>
                      <div>
                        <label htmlFor="ket_jabatan" className="form-label text-dark mb-1 fw-semibold text-[9px]">Keterangan</label>
                        <textarea id="ket_jabatan" rows={2} className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" value={formData.keterangan || ''} onChange={(e) => setFormData({...formData, keterangan: e.target.value})} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="ui-search-select-container position-relative">
                        <label htmlFor="cari_pejabat" className="form-label text-dark mb-1 fw-semibold text-[9px]">Cari Pejabat</label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-light border-0"><Search size={10}/></span>
                          <input 
                            id="cari_pejabat"
                            type="text" 
                            className="form-control bg-light border-0 shadow-none py-1.5 text-[10px]" 
                            placeholder="Ketik nama..." 
                            value={searchGuru} 
                            onFocus={() => setShowDropdownGuru(true)}
                            onChange={(e) => {
                              setSearchGuru(e.target.value);
                              setShowDropdownGuru(true);
                              if(!e.target.value) setFormData({...formData, guru_staf_id: ''});
                            }} 
                          />
                        </div>
                        {showDropdownGuru && (searchGuru) && (
                          <div className="ui-search-select-dropdown shadow-lg w-100 position-absolute z-[1100] bg-white border rounded-3 mt-1 overflow-hidden max-h-[150px] overflow-y-auto">
                            {loadingGuru ? (
                              <div className="p-2 text-center text-[9px] text-muted"><Loader2 size={10} className="animate-spin d-inline me-1"/></div>
                            ) : guruOptions.length > 0 ? (
                              <ul className="list-unstyled mb-0">
                                {guruOptions.map((g: any) => (
                                  <li key={g.id} className="p-2 border-bottom cursor-pointer hover:bg-light" onClick={() => {
                                    setFormData({...formData, guru_staf_id: g.id});
                                    setSearchGuru(g.nama);
                                    setShowDropdownGuru(false);
                                  }}>
                                    <div className="fw-bold text-[10px] text-dark">{g.nama}</div>
                                    <div className="text-[8px] text-muted">{g.nip || '-'}</div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="p-2 text-center text-[9px] text-muted">Tidak ada hasil</div>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label htmlFor="select_jabatan" className="form-label text-dark mb-1 fw-semibold text-[9px]">Jabatan</label>
                        <select id="select_jabatan" className="form-select bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" value={formData.jabatan_id || ''} onChange={(e) => setFormData({...formData, jabatan_id: e.target.value})}>
                          <option value="">-- Pilih --</option>
                          {listJabatan.map(j => <option key={j.id} value={j.id}>{j.nama_jabatan}</option>)}
                        </select>
                      </div>

                      <div className="row g-2">
                        <div className="col-7">
                          <label htmlFor="tgl_mulai" className="form-label text-dark mb-1 fw-semibold text-[9px]">Mulai</label>
                          <input id="tgl_mulai" type="date" className="form-control bg-light border-0 shadow-none py-1.5 px-2 text-[10px] rounded-3" value={formData.periode_mulai || ''} onChange={(e) => setFormData({...formData, periode_mulai: e.target.value})} />
                        </div>
                        <div className="col-5">
                          <label htmlFor="urutan_tampil" className="form-label text-dark mb-1 fw-semibold text-[9px]">Urutan</label>
                          <input id="urutan_tampil" type="number" className="form-control bg-light border-0 shadow-none py-1.5 px-2 text-[10px] rounded-3" value={formData.urutan_tampil || ''} onChange={(e) => setFormData({...formData, urutan_tampil: e.target.value})} />
                        </div>
                      </div>

                      <div>
                        <label className="form-label text-dark mb-1 fw-semibold text-[9px]" htmlFor={fotoId}>TTD (Gambar)</label>
                        <input 
                          id={fotoId} 
                          type="file" 
                          accept="image/*" 
                          className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" 
                          onChange={handleFileChange} 
                          title="Upload Gambar Tanda Tangan"
                        />
                        {photoPreview && (
                          <div className="ui-preview-foto mt-2">
                            <div className="d-flex justify-content-center p-2 bg-light rounded-3 border border-dashed">
                              <img src={photoPreview} alt="TTD" className="h-[35px] w-auto object-contain" />
                            </div>
                            <button type="button" className="btn-close ui-btn-delete-preview shadow-none scale-75 position-absolute top-0 end-0 m-2" aria-label="Hapus Gambar" onClick={(e) => { e.preventDefault(); setFormData({...formData, file_ttd: null}); setPhotoPreview(null); }}></button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="modal-footer border-0 p-3 pt-0">
                <button onClick={handleSave} className="btn btn-warning btn-sm w-100 fw-bold shadow-sm py-2 text-[10px] rounded-3" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : (isEdit ? "Update" : "Simpan")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
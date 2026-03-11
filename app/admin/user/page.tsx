"use client";

import React, { useState, useEffect, useCallback, useId, memo } from 'react';
import { 
  Search, Plus, Edit2, Loader2, Users, CheckSquare, Square
} from 'lucide-react';
import api from '@/lib/api';

const UserRow = memo(({ user, onEdit }: { user: any, onEdit: (u: any) => void }) => (
  <tr>
    <td className="ps-3 py-2 text-dark fw-medium text-[12px]">{user.username}</td>
    <td className="py-2">
      <div className="d-flex flex-wrap gap-1">
        {user.roles && user.roles.map((r: any) => (
          <span key={r.id} className="badge bg-primary bg-opacity-10 text-primary border-0 text-capitalize fw-normal text-[10px]">
            {r.nama}
          </span>
        ))}
      </div>
    </td>
    <td className="py-2 text-center">
      <span className={`badge rounded-pill border-0 px-3 text-[10px] ${user.is_active ? 'bg-success text-white' : 'bg-light text-muted fw-normal'}`}>
        {user.is_active ? 'Aktif' : 'Nonaktif'}
      </span>
    </td>
    <td className="py-2 text-end pe-3">
      <button 
        onClick={() => onEdit(user)} 
        className="btn btn-sm p-1 text-primary border-0 shadow-none hover-zoom"
        title="Edit Pengguna"
        aria-label="Edit Pengguna"
      >
        <span className="bg-light p-1 rounded-circle d-inline-flex">
           <Edit2 size={12}/>
        </span>
      </button>
    </td>
  </tr>
));

UserRow.displayName = 'UserRow';

export default function ManajemenUserTerpadu() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]); 
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '', 
    is_active: 1, 
    role_ids: [] as string[]
  });
  const [errors, setErrors] = useState<any>({});

  const searchInputId = useId();
  const usernameId = useId();
  const passwordId = useId();
  const statusSelectId = useId();

  const fetchData = useCallback(async (page = 1, search = '') => {
    if (search) setIsSearching(true);
    else setLoading(true);

    try {
      const [uR, rR] = await Promise.allSettled([
        api.admin.user.getAll({ page, search }), 
        api.admin.role.getAll()
      ]);

      if (uR.status === 'fulfilled' && uR.value?.data) {
        setUsers(uR.value.data.data || []);
        setMeta(uR.value.data.meta || null);
        setCurrentPage(page);
      }
      
      if (rR.status === 'fulfilled' && rR.value?.data) {
        const resData = rR.value.data.data || rR.value.data || [];
        setRoles(Array.isArray(resData) ? resData : []);
      }
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
      setIsSearching(false); 
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchData(1, searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm, fetchData]);

  const handleToggleRole = (id: string) => {
    setFormData(prev => {
      const exist = prev.role_ids.includes(id);
      if (exist) return { ...prev, role_ids: prev.role_ids.filter(i => i !== id) };
      return { ...prev, role_ids: [...prev.role_ids, id] };
    });
  };

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setIsEdit(false);
    setCurrentId(null);
    setFormData({ username: '', password: '', is_active: 1, role_ids: [] });
    setErrors({});
  }, []);

  const handleEditClick = useCallback((u: any) => {
    setIsEdit(true);
    setCurrentId(u.id);
    setFormData({ 
      username: u.username || '', 
      password: '', 
      is_active: u.is_active ? 1 : 0, 
      role_ids: u.roles ? u.roles.map((r: any) => String(r.id)) : []
    });
    setShowForm(true);
  }, []);

  const handleSaveUser = async () => {
    setErrors({});
    setIsSubmitting(true);
    try {
      const p = { 
        ...formData, 
        is_active: String(formData.is_active), 
        password_confirmation: formData.password 
      };
      
      if (isEdit && !formData.password) { 
        delete (p as any).password; 
        delete (p as any).password_confirmation; 
      }

      const res = isEdit && currentId 
        ? await api.admin.user.update(currentId, p) 
        : await api.admin.user.create(p);

      if (res.status === 200 || res.status === 201) { 
        handleCloseForm(); 
        fetchData(currentPage, searchTerm); 
      }
    } catch (e: any) { 
      if (e.response?.status === 422) setErrors(e.response.data.errors);
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const renderPagination = () => {
    if (!meta || meta.last_page <= 1) return null;
    
    const pages = [];
    for (let i = 1; i <= meta.last_page; i++) {
      pages.push(
        <li key={i} className="page-item">
          <button 
            className={`page-link border rounded mx-1 d-flex align-items-center justify-content-center w-[30px] h-[30px] text-[11px] shadow-none ${meta.current_page === i ? 'bg-primary text-white border-primary' : 'bg-white text-dark'}`}
            onClick={() => fetchData(i, searchTerm)}
          >
            {i}
          </button>
        </li>
      );
    }

    return (
      <nav>
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${meta.current_page === 1 ? 'disabled' : ''}`}>
            <button className="page-link border rounded mx-1 w-[30px] h-[30px] d-flex align-items-center justify-content-center text-dark shadow-none" onClick={() => fetchData(meta.current_page - 1, searchTerm)}>
              &lt;
            </button>
          </li>
          {pages}
          <li className={`page-item ${meta.current_page === meta.last_page ? 'disabled' : ''}`}>
            <button className="page-link border rounded mx-1 w-[30px] h-[30px] d-flex align-items-center justify-content-center text-dark shadow-none" onClick={() => fetchData(meta.current_page + 1, searchTerm)}>
              &gt;
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <Users size={18} className="text-primary me-2" />
          <h6 className="mb-0 fw-bold text-dark text-uppercase text-[13px] tracking-wider">Manajemen Pengguna</h6>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm px-4 shadow-sm rounded-pill py-2 text-[12px]">
          <Plus size={14} className="me-1"/> Tambah User
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 border-0">
          <div className="input-group w-[250px]">
            <span className="input-group-text bg-light border-0 pe-1">
              {isSearching ? <Loader2 size={14} className="animate-spin text-primary" /> : <Search size={14} className="text-muted" />}
            </span>
            <input 
              id={searchInputId} 
              type="text" 
              className="form-control bg-light border-0 shadow-none ps-2 text-[12px]" 
              placeholder="Cari pengguna..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="text-[10px]">
                <th className="ps-3 border-0 py-3 fw-bold text-muted text-uppercase">Username</th>
                <th className="border-0 py-3 fw-bold text-muted text-uppercase">Hak Akses</th>
                <th className="border-0 py-3 text-center fw-bold text-muted text-uppercase">Status</th>
                <th className="border-0 py-3 text-end pe-3 fw-bold text-muted text-uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {loading && !isSearching ? (
                <tr>
                  <td colSpan={4} className="text-center py-5">
                    <Loader2 className="text-primary animate-spin mb-2 mx-auto" size={24} />
                    <div className="text-muted small">Memuat data...</div>
                  </td>
                </tr>
              ) : users.map((u) => (
                <UserRow key={u.id} user={u} onEdit={handleEditClick} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="card-footer bg-white border-top py-2">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted text-[10px] fw-medium">
              Total Data: {meta ? meta.total : '0'}
            </div>
            {renderPagination()}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="modal fade show d-block bg-black/40">
          <div className="modal-dialog modal-dialog-centered max-w-[320px]">
            <div className="modal-content border-0 shadow-lg rounded-[0.8rem]">
              <div className="modal-header border-0 pb-0 px-3 pt-3">
                <h6 className="modal-title fw-bold text-dark text-[13px]">
                  {isEdit ? "Edit Pengguna" : "Input Pengguna Baru"}
                </h6>
                <button onClick={handleCloseForm} className="btn-close shadow-none scale-75" aria-label="Tutup"></button>
              </div>
              
              <div className="modal-body p-3 pt-2">
                <div className="mb-2">
                  <label className="form-label text-dark mb-1 fw-semibold text-[11px]" htmlFor={usernameId}>Username / ID Login</label>
                  <input 
                    id={usernameId} 
                    type="text" 
                    className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[11px]"
                    placeholder="Masukkan username"
                    value={formData.username} 
                    onChange={(e) => setFormData({...formData, username: e.target.value})} 
                  />
                  {errors.username && <div className="text-danger mt-1 text-[9px]">{errors.username[0]}</div>}
                </div>

                <div className="mb-2">
                  <label className="form-label text-dark mb-1 fw-semibold d-block text-[11px]">Pilih Hak Akses (Multi-Role)</label>
                  <div className="d-flex flex-column gap-1 bg-light p-1 rounded-2">
                    {roles.map(r => (
                      <div 
                        key={r.id}
                        className={`d-flex align-items-center p-1.5 px-2 rounded-2 cursor-pointer border transition-all text-[10px] ${formData.role_ids.includes(String(r.id)) ? 'bg-white border-primary text-primary shadow-sm' : 'border-transparent text-muted'}`}
                        onClick={() => handleToggleRole(String(r.id))}
                      >
                        {formData.role_ids.includes(String(r.id)) ? <CheckSquare size={12} className="me-2"/> : <Square size={12} className="me-2"/>}
                        <span className="fw-medium text-capitalize">{r.nama || r.role_name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label text-dark mb-1 fw-semibold text-[11px]" htmlFor={statusSelectId}>Status Akun</label>
                  <select id={statusSelectId} className="form-select bg-light border-0 shadow-none py-1.5 px-2 text-[11px]" value={formData.is_active} onChange={(e) => setFormData({...formData, is_active: parseInt(e.target.value)})}>
                    <option value={1}>Aktif (Bisa Login)</option>
                    <option value={0}>Nonaktif</option>
                  </select>
                </div>

                <div className="mb-2">
                  <label className="form-label text-dark mb-1 fw-semibold text-[11px]" htmlFor={passwordId}>Kata Sandi</label>
                  <input 
                    id={passwordId} 
                    type="password" 
                    className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[11px]"
                    placeholder="••••••••" 
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  />
                  {isEdit && <div className="text-muted mt-1 text-[9px]">Kosongkan jika tidak diubah</div>}
                </div>
              </div>

              <div className="modal-footer border-0 p-3 pt-0">
                <button 
                  onClick={handleSaveUser} 
                  className="btn btn-primary btn-sm w-100 fw-bold shadow-sm py-2 text-[12px] rounded-3" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : (isEdit ? "Simpan Perubahan" : "Simpan Akun Pengguna")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
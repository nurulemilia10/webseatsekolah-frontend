"use client";

import React, { useState, useEffect, useCallback, useId, memo, useMemo } from 'react';
import { 
  Search, Plus, Edit2, Loader2, Users, CheckSquare, Square,
  ChevronLeft, Trash2
} from 'lucide-react';
import api from '@/lib/api';
import Swal from 'sweetalert2';

const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";

const UserRow = memo(({ user, onEdit, onDelete, isSelected, onSelect }: { user: any, onEdit: (u: any) => void, onDelete: (id: string) => void, isSelected: boolean, onSelect: (id: string) => void }) => {
  const avatarSrc = user.foto || DEFAULT_AVATAR;
  const realName = user.guru?.nama || user.siswa?.nama || null;

  return (
    <tr>
      <td className="ps-2 py-1 text-center w-30px">
        <input 
          type="checkbox" 
          className="form-check-input border-secondary shadow-none cursor-pointer m-0" 
          checked={isSelected} 
          onChange={() => onSelect(user.id)}
          aria-label="Pilih baris"
        />
      </td>
      <td className="py-1 ps-3">
        <div className="d-flex align-items-center">
          <div className="symbol symbol-circle overflow-hidden bg-light me-2 flex-shrink-0 avatar-sm">
            <img 
              src={avatarSrc}
              alt={user.username}
              className="w-100 h-100 object-cover"
              onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
            />
          </div>
          <div>
            <div className="text-dark fw-bold text-xxs">{user.username}</div>
            {realName && <div className="text-muted text-9px">{realName}</div>}
          </div>
        </div>
      </td>
      <td className="py-1">
        <div className="d-flex flex-wrap gap-1">
          {user.roles && user.roles.map((r: any) => (
            <span key={r.id} className="badge bg-warning bg-opacity-10 text-warning border-0 text-capitalize fw-normal text-9px">
              {r.nama}
            </span>
          ))}
        </div>
      </td>
      <td className="py-1 text-center">
        <span className={`badge rounded-pill border-0 px-1.5 py-0.5 text-9px ${user.is_active ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
          {user.is_active ? 'Aktif' : 'Non-Aktif'}
        </span>
      </td>
      <td className="py-1 text-end pe-2">
        <div className="d-flex justify-content-end gap-0.5">
          <button 
            onClick={() => onEdit(user)} 
            className="btn btn-sm p-0.5 text-warning border-0 shadow-none"
            aria-label="Edit data"
            title="Edit data"
          >
            <span className="bg-light p-0.5 rounded-1 d-inline-flex">
               <Edit2 size={10}/>
            </span>
          </button>
          <button 
            onClick={() => onDelete(user.id)} 
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

UserRow.displayName = 'UserRow';

const RoleRow = memo(({ role, onEdit, onDelete }: { role: any, onEdit: (r: any) => void, onDelete: (id: string) => void }) => (
  <tr>
    <td className="py-1 ps-3">
      <div className="text-dark fw-bold text-xxs text-capitalize">{role.role_name || role.nama || '-'}</div>
    </td>
    <td className="py-1 text-xxs text-muted">
      <div className="text-truncate mw-200px">{role.description || '-'}</div>
    </td>
    <td className="py-1 text-end pe-2">
      <div className="d-flex justify-content-end gap-0.5">
        <button 
          onClick={() => onEdit(role)} 
          className="btn btn-sm p-0.5 text-warning border-0 shadow-none"
          aria-label="Edit data"
          title="Edit data"
        >
          <span className="bg-light p-0.5 rounded-1 d-inline-flex">
             <Edit2 size={10}/>
          </span>
        </button>
        <button 
          onClick={() => onDelete(role.id)} 
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
));

RoleRow.displayName = 'RoleRow';

export default function ManajemenUserTerpadu() {
  const [activeTab, setActiveTab] = useState<'user' | 'role'>('user');
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '', 
    is_active: 1, 
    role_ids: [] as string[]
  });
  const [errors, setErrors] = useState<any>({});

  const [rolesData, setRolesData] = useState<any[]>([]);
  const [roleMeta, setRoleMeta] = useState<any>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [isEditRole, setIsEditRole] = useState(false);
  const [currentRoleId, setCurrentRoleId] = useState<string | null>(null);
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);
  const [roleForm, setRoleForm] = useState({ role_name: '', description: '' });
  const [roleErrors, setRoleErrors] = useState<any>({});

  const searchInputId = useId();
  const usernameId = useId();
  const passwordId = useId();
  const roleNameId = useId();
  const roleDescId = useId();

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
        setSelectedIds([]);
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

  const fetchRoles = useCallback(async (page = 1) => {
    setRoleLoading(true);
    try {
      const res = await api.admin.role.getAll({ page });
      if (res?.data) {
        const resData = res.data.data || res.data || [];
        setRolesData(Array.isArray(resData) ? resData : []);
        setRoleMeta(res.data.meta || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRoleLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchData(1, searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm, fetchData]);

  useEffect(() => {
    fetchRoles(1);
  }, [fetchRoles]);

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

  const handleSelectOne = useCallback(
    (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]),
    []
  );

  const handleSelectAll = useCallback(
    () => selectedIds.length === users.length ? setSelectedIds([]) : setSelectedIds(users.map(i => i.id)),
    [users, selectedIds]
  );

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Pengguna?',
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
        await api.admin.user.delete(id);
        fetchData(currentPage, searchTerm);
        Toast.fire({ icon: 'success', title: 'Berhasil dihapus' });
      } catch (e) {
        Toast.fire({ icon: 'error', title: 'Gagal menghapus' });
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const result = await Swal.fire({
      title: `Hapus ${selectedIds.length} Pengguna?`,
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
        await api.admin.user.bulkDelete(selectedIds);
        Swal.close();
        Toast.fire({ icon: 'success', title: 'Berhasil dihapus' });
        fetchData(1);
      } catch (e) {
        Swal.close();
        Toast.fire({ icon: 'error', title: 'Gagal menghapus' });
      }
    }
  };

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
        Toast.fire({ icon: 'success', title: 'Berhasil disimpan' });
        handleCloseForm(); 
        fetchData(currentPage, searchTerm); 
      }
    } catch (e: any) { 
      if (e.response?.status === 422) setErrors(e.response.data.errors);
      else Toast.fire({ icon: 'error', title: 'Kesalahan sistem' });
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handlePageChange = (page: number) => fetchData(page, searchTerm);

  const handleCloseRoleForm = useCallback(() => {
    setShowRoleForm(false);
    setIsEditRole(false);
    setCurrentRoleId(null);
    setRoleForm({ role_name: '', description: '' });
    setRoleErrors({});
  }, []);

  const handleEditRole = useCallback((r: any) => {
    setIsEditRole(true);
    setCurrentRoleId(r.id);
    setRoleForm({ role_name: r.role_name || r.nama || '', description: r.description || '' });
    setShowRoleForm(true);
  }, []);

  const handleDeleteRole = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Hak Akses?',
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
        await api.admin.role.delete(id);
        fetchRoles(roleMeta?.current_page || 1);
        Toast.fire({ icon: 'success', title: 'Berhasil dihapus' });
      } catch (e) {
        Toast.fire({ icon: 'error', title: 'Gagal menghapus' });
      }
    }
  };

  const handleSaveRole = async () => {
    setRoleErrors({});
    setIsSubmittingRole(true);
    try {
      const res = isEditRole && currentRoleId 
        ? await api.admin.role.update(currentRoleId, roleForm) 
        : await api.admin.role.create(roleForm);

      if (res.status === 200 || res.status === 201) { 
        Toast.fire({ icon: 'success', title: 'Berhasil disimpan' });
        handleCloseRoleForm(); 
        fetchRoles(roleMeta?.current_page || 1); 
      }
    } catch (e: any) { 
      if (e.response?.status === 422) setRoleErrors(e.response.data.errors);
      else Toast.fire({ icon: 'error', title: 'Kesalahan sistem' });
    } finally { 
      setIsSubmittingRole(false); 
    }
  };

  const handlePageChangeRole = (page: number) => fetchRoles(page);

  return (
    <div className="container-fluid py-2 px-2 px-md-3 text-xs-custom">
      <div className="card border-0 shadow-sm rounded-3 mb-2">
        <div className="card-body p-2">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="bg-warning bg-opacity-10 p-1.5 rounded-2">
                <Users size={16} className="text-warning" />
              </div>
              <div className="me-2">
                <h5 className="fw-bold text-dark mb-0 fs-6">Manajemen Pengguna</h5>
                <p className="text-muted mb-0 text-10px">Kelola akun dan hak akses sistem</p>
              </div>
              <div className="d-flex gap-1">
                <button 
                  onClick={() => setActiveTab('user')} 
                  className={`btn btn-sm px-3 py-1 rounded-2 fw-bold text-10px border-0 ${activeTab === 'user' ? 'btn-warning text-white' : 'btn-light text-dark'}`}
                >
                  Pengguna
                </button>
                <button 
                  onClick={() => setActiveTab('role')} 
                  className={`btn btn-sm px-3 py-1 rounded-2 fw-bold text-10px border-0 ${activeTab === 'role' ? 'btn-warning text-white' : 'btn-light text-dark'}`}
                >
                  Hak Akses
                </button>
              </div>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-1 justify-content-end">
              {activeTab === 'user' && (
                <div className="position-relative min-w-120px">
                  <Search size={10} className="position-absolute top-50 start-0 ms-2 translate-middle-y text-muted" />
                  <input
                    id={searchInputId} 
                    type="text" 
                    className="form-control form-control-sm ps-4 border-0 bg-light rounded-2 shadow-none text-11px" 
                    placeholder="Cari pengguna..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                </div>
              )}
              <button 
                onClick={() => activeTab === 'user' ? setShowForm(true) : setShowRoleForm(true)} 
                className="btn btn-warning btn-sm px-1.5 py-0.5 rounded-2 d-flex align-items-center gap-1"
              >
                <Plus size={10}/>
                <span className="text-10px">Tambah</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'user' && (
        <>
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
                        checked={users.length > 0 && selectedIds.length === users.length}
                        onChange={handleSelectAll}
                        aria-label="Pilih semua"
                      />
                    </th>
                    <th className="border-0 py-1.5 ps-3">Pengguna</th>
                    <th className="border-0 py-1.5">Hak Akses</th>
                    <th className="border-0 py-1.5 text-center">Status</th>
                    <th className="border-0 py-1.5 text-end pe-2">Aksi</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {loading && !isSearching ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5">
                        <Loader2 className="text-warning animate-spin mx-auto" size={16} />
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-muted">
                        Tidak ada data ditemukan.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <UserRow 
                        key={u.id} 
                        user={u} 
                        onEdit={handleEditClick} 
                        onDelete={handleDelete}
                        isSelected={selectedIds.includes(u.id)}
                        onSelect={handleSelectOne}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {meta && meta.last_page > 1 && (
              <div className="d-flex justify-content-between align-items-center px-2 py-1 border-top bg-white">
                <div className="text-muted text-10px fw-medium">
                  Menampilkan {users.length} dari {meta.total} data
                </div>
                <nav className="d-flex align-items-center gap-0.5">
                  <button
                    className="btn btn-light btn-sm border shadow-none p-0.5 rounded-2"
                    disabled={meta.current_page === 1}
                    onClick={() => handlePageChange(meta.current_page - 1)}
                    title="Halaman sebelumnya"
                    aria-label="Halaman sebelumnya"
                  >
                    <ChevronLeft size={12} />
                  </button>
                  <div className="d-flex gap-0.5">
                    {(() => {
                      const pages = [];
                      const cp = meta.current_page;
                      const lp = Math.max(1, meta.last_page);
                      pages.push(1);
                      if (cp > 3) pages.push('ellipsis-1');
                      for (let i = Math.max(2, cp - 1); i <= Math.min(lp - 1, cp + 1); i++) {
                        pages.push(i);
                      }
                      if (cp < lp - 2) pages.push('ellipsis-2');
                      if (lp > 1) pages.push(lp);
                      return pages.map((p, idx) => {
                        if (typeof p === 'string') return <span key={`e-${idx}`} className="px-0.5 text-muted text-10px">...</span>;
                        return (
                          <button
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`btn btn-sm px-1.5 py-0.5 rounded-2 fw-bold border-0 text-10px ${cp === p ? 'btn-warning text-white' : 'btn-light text-dark'}`}
                          >
                            {p}
                          </button>
                        );
                      });
                    })()}
                  </div>
                  <button
                    className="btn btn-light btn-sm border shadow-none p-0.5 rounded-2"
                    disabled={meta.current_page === meta.last_page}
                    onClick={() => handlePageChange(meta.current_page + 1)}
                    title="Halaman selanjutnya"
                    aria-label="Halaman selanjutnya"
                  >
                    <ChevronLeft size={12} className="rotate-180" />
                  </button>
                </nav>
              </div>
            )}
          </div>

          {showForm && (
            <div className="modal fade show d-block bg-black/40 z-[1100] modal-overlay">
              <div className="modal-dialog modal-dialog-centered modal-md mx-auto modal-dialog-custom">
                <div className="modal-content border-0 shadow-lg rounded-4 modal-content-custom">
                  <div className="modal-header border-0 pb-0 px-3 pt-3 flex-shrink-0 pos-rel-z10">
                    <h6 className="fw-bold text-dark d-flex align-items-center gap-2 m-0 text-13px">
                      <div className="bg-warning bg-opacity-10 p-1 rounded-2">
                        <Edit2 size={12} className="text-warning"/>
                      </div>
                      {isEdit ? "Edit Pengguna" : "Tambah Pengguna"}
                    </h6>
                    <button onClick={handleCloseForm} className="btn-close scale-75 shadow-none" aria-label="Tutup"></button>
                  </div>
                  
                  <div className="modal-body px-3 py-2 modal-body-scrollable">
                    <div className="row g-2 pb-3 mx-0">
                      <div className="col-12">
                        <label className="fw-bold text-10px text-muted mb-0" htmlFor={usernameId}>Username / ID Login <span className="text-danger">*</span></label>
                        <input 
                          id={usernameId} 
                          type="text" 
                          className="form-control form-control-sm bg-light border-0 py-1 text-11px rounded-2 shadow-none mt-1"
                          placeholder="Masukkan username"
                          value={formData.username} 
                          onChange={(e) => setFormData({...formData, username: e.target.value})} 
                        />
                        {errors.username && <div className="text-danger text-9px mt-0.5">{errors.username[0]}</div>}
                      </div>

                      <div className="col-12">
                        <label className="fw-bold text-10px text-muted mb-0">Pilih Hak Akses (Multi-Role) <span className="text-danger">*</span></label>
                        <div className="d-flex flex-column gap-1 bg-light p-1 rounded-2 mt-1">
                          {roles.map(r => (
                            <div 
                              key={r.id}
                              className={`d-flex align-items-center p-1.5 px-2 rounded-2 cursor-pointer border transition-all text-10px ${formData.role_ids.includes(String(r.id)) ? 'bg-white border-warning text-warning shadow-sm' : 'border-transparent text-muted'}`}
                              onClick={() => handleToggleRole(String(r.id))}
                            >
                              {formData.role_ids.includes(String(r.id)) ? <CheckSquare size={12} className="me-2"/> : <Square size={12} className="me-2"/>}
                              <span className="fw-medium text-capitalize">{r.nama || r.role_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="col-12">
                        <label className="fw-bold text-10px text-muted mb-0" htmlFor={passwordId}>Kata Sandi <span className="text-danger">*</span></label>
                        <input 
                          id={passwordId} 
                          type="password" 
                          className="form-control form-control-sm bg-light border-0 py-1 text-11px rounded-2 shadow-none mt-1"
                          placeholder="••••••••" 
                          value={formData.password} 
                          onChange={(e) => setFormData({...formData, password: e.target.value})} 
                        />
                        {isEdit && <div className="text-muted mt-0.5 text-9px">Kosongkan jika tidak diubah</div>}
                        {errors.password && <div className="text-danger text-9px mt-0.5">{errors.password[0]}</div>}
                      </div>

                      <div className="col-12 mb-2">
                        <div className="form-check form-switch pt-1">
                          <input className="form-check-input shadow-none cursor-pointer" type="checkbox" id="statusSwitch" checked={formData.is_active === 1} onChange={(e) => setFormData({...formData, is_active: e.target.checked ? 1 : 0})} />
                          <label className="form-check-label fw-bold text-10px cursor-pointer" htmlFor="statusSwitch">
                            {formData.is_active === 1 ? 'Status Aktif' : 'Status Non-Aktif'}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer border-0 p-3 pt-1 flex-shrink-0 bg-white modal-footer-sticky">
                    <button 
                      onClick={handleSaveUser} 
                      className="btn btn-warning btn-sm w-100 py-2 rounded-3 shadow-sm fw-bold d-flex align-items-center justify-content-center gap-2 text-12px" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : (isEdit ? "Perbarui Data" : "Simpan Data")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'role' && (
        <>
          <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 text-11px">
                <thead className="bg-light">
                  <tr className="text-xxs fw-bold text-muted text-uppercase">
                    <th className="border-0 py-1.5 ps-3">Nama Hak Akses</th>
                    <th className="border-0 py-1.5">Deskripsi</th>
                    <th className="border-0 py-1.5 text-end pe-2">Aksi</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {roleLoading ? (
                    <tr>
                      <td colSpan={3} className="text-center py-5">
                        <Loader2 className="text-warning animate-spin mx-auto" size={16} />
                      </td>
                    </tr>
                  ) : rolesData.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-5 text-muted">
                        Tidak ada data ditemukan.
                      </td>
                    </tr>
                  ) : (
                    rolesData.map((r) => (
                      <RoleRow 
                        key={r.id} 
                        role={r} 
                        onEdit={handleEditRole} 
                        onDelete={handleDeleteRole}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {roleMeta && roleMeta.last_page > 1 && (
              <div className="d-flex justify-content-between align-items-center px-2 py-1 border-top bg-white">
                <div className="text-muted text-10px fw-medium">
                  Menampilkan {rolesData.length} dari {roleMeta.total} data
                </div>
                <nav className="d-flex align-items-center gap-0.5">
                  <button
                    className="btn btn-light btn-sm border shadow-none p-0.5 rounded-2"
                    disabled={roleMeta.current_page === 1}
                    onClick={() => handlePageChangeRole(roleMeta.current_page - 1)}
                    title="Halaman sebelumnya"
                    aria-label="Halaman sebelumnya"
                  >
                    <ChevronLeft size={12} />
                  </button>
                  <div className="d-flex gap-0.5">
                    {(() => {
                      const pages = [];
                      const cp = roleMeta.current_page;
                      const lp = Math.max(1, roleMeta.last_page);
                      pages.push(1);
                      if (cp > 3) pages.push('ellipsis-1');
                      for (let i = Math.max(2, cp - 1); i <= Math.min(lp - 1, cp + 1); i++) {
                        pages.push(i);
                      }
                      if (cp < lp - 2) pages.push('ellipsis-2');
                      if (lp > 1) pages.push(lp);
                      return pages.map((p, idx) => {
                        if (typeof p === 'string') return <span key={`e-${idx}`} className="px-0.5 text-muted text-10px">...</span>;
                        return (
                          <button
                            key={p}
                            onClick={() => handlePageChangeRole(p)}
                            className={`btn btn-sm px-1.5 py-0.5 rounded-2 fw-bold border-0 text-10px ${cp === p ? 'btn-warning text-white' : 'btn-light text-dark'}`}
                          >
                            {p}
                          </button>
                        );
                      });
                    })()}
                  </div>
                  <button
                    className="btn btn-light btn-sm border shadow-none p-0.5 rounded-2"
                    disabled={roleMeta.current_page === roleMeta.last_page}
                    onClick={() => handlePageChangeRole(roleMeta.current_page + 1)}
                    title="Halaman selanjutnya"
                    aria-label="Halaman selanjutnya"
                  >
                    <ChevronLeft size={12} className="rotate-180" />
                  </button>
                </nav>
              </div>
            )}
          </div>

          {showRoleForm && (
            <div className="modal fade show d-block bg-black/40 z-[1100] modal-overlay">
              <div className="modal-dialog modal-dialog-centered modal-md mx-auto modal-dialog-custom">
                <div className="modal-content border-0 shadow-lg rounded-4 modal-content-custom">
                  <div className="modal-header border-0 pb-0 px-3 pt-3 flex-shrink-0 pos-rel-z10">
                    <h6 className="fw-bold text-dark d-flex align-items-center gap-2 m-0 text-13px">
                      <div className="bg-warning bg-opacity-10 p-1 rounded-2">
                        <Edit2 size={12} className="text-warning"/>
                      </div>
                      {isEditRole ? "Edit Hak Akses" : "Tambah Hak Akses"}
                    </h6>
                    <button onClick={handleCloseRoleForm} className="btn-close scale-75 shadow-none" aria-label="Tutup"></button>
                  </div>
                  
                  <div className="modal-body px-3 py-2 modal-body-scrollable">
                    <div className="row g-2 pb-3 mx-0">
                      <div className="col-12">
                        <label className="fw-bold text-10px text-muted mb-0" htmlFor={roleNameId}>Nama Hak Akses <span className="text-danger">*</span></label>
                        <input 
                          id={roleNameId} 
                          type="text" 
                          className="form-control form-control-sm bg-light border-0 py-1 text-11px rounded-2 shadow-none mt-1"
                          placeholder="Contoh: Admin"
                          value={roleForm.role_name} 
                          onChange={(e) => setRoleForm({...roleForm, role_name: e.target.value})} 
                        />
                        {roleErrors.role_name && <div className="text-danger text-9px mt-0.5">{roleErrors.role_name[0]}</div>}
                      </div>

                      <div className="col-12">
                        <label className="fw-bold text-10px text-muted mb-0" htmlFor={roleDescId}>Deskripsi</label>
                        <textarea 
                          id={roleDescId} 
                          className="form-control form-control-sm bg-light border-0 py-1 text-11px rounded-2 shadow-none mt-1"
                          rows={3}
                          placeholder="Deskripsi hak akses..."
                          value={roleForm.description} 
                          onChange={(e) => setRoleForm({...roleForm, description: e.target.value})} 
                        ></textarea>
                        {roleErrors.description && <div className="text-danger text-9px mt-0.5">{roleErrors.description[0]}</div>}
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer border-0 p-3 pt-1 flex-shrink-0 bg-white modal-footer-sticky">
                    <button 
                      onClick={handleSaveRole} 
                      className="btn btn-warning btn-sm w-100 py-2 rounded-3 shadow-sm fw-bold d-flex align-items-center justify-content-center gap-2 text-12px" 
                      disabled={isSubmittingRole}
                    >
                      {isSubmittingRole ? <Loader2 size={14} className="animate-spin" /> : (isEditRole ? "Perbarui Data" : "Simpan Data")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
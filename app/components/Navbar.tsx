"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import api from '@/lib/api';
import { User, LogOut, Key, Menu, ChevronDown, ShieldCheck, RefreshCw, X, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [passData, setPassData] = useState({ old: '', new: '', confirm: '' });
  const [passError, setPassError] = useState('');
  const [showRoleList, setShowRoleList] = useState(false);

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  const CenterTopToast = Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });

  const fetchUserData = useCallback(async () => {
    try {
      const res = await api.auth.me();
      setUser(res.data?.data || null);
    } catch (err) {
      console.error("Gagal mengambil data user");
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleUpdateFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('foto', file);
    try {
      setLoading(true);
      const res = await api.auth.updateFoto(formData);
      Toast.fire({ icon: 'success', title: res.data?.message || "Foto berhasil diperbarui" });
      await fetchUserData();
    } catch (err: any) {
      Toast.fire({ icon: 'error', title: err.response?.data?.message || "Gagal memperbarui foto" });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    if (passData.new !== passData.confirm) {
      setPassError("Konfirmasi password tidak cocok");
      return;
    }
    try {
      setLoading(true);
      const res = await api.auth.changePassword({ 
        current_password: passData.old, 
        new_password: passData.new,
        new_password_confirmation: passData.confirm 
      });
      Swal.fire({ icon: 'success', title: 'Berhasil', text: res.data?.message || "Password berhasil diubah!", confirmButtonColor: '#0d6efd' });
      setShowPassModal(false);
      setPassData({ old: '', new: '', confirm: '' });
    } catch (err: any) {
      setPassError(err.response?.data?.message || "Gagal mengubah password");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchRole = async (targetRole: string) => {
    const normalizedTarget = (targetRole || "").toLowerCase();
    const normalizedCurrent = (user?.current_role || "").toLowerCase();
    
    if (normalizedTarget === normalizedCurrent) return;

    try {
      setLoading(true);
      const res = await api.auth.switchRole({ role: targetRole });
      CenterTopToast.fire({ icon: 'success', title: res.data?.message || `Berhasil pindah ke role ${targetRole}` });
      setIsOpen(false);
      window.location.reload();
    } catch (err: any) {
      CenterTopToast.fire({ icon: 'error', title: err.response?.data?.message || "Gagal berpindah role" });
    } finally {
      setLoading(false);
    }
  };

  const availableRoles = useMemo(() => {
    const rolesData = user?.roles; 
    if (!rolesData) return [];
    if (Array.isArray(rolesData)) {
      return rolesData.map((r: any) => typeof r === 'object' ? r.nama : r).filter(Boolean);
    }
    if (typeof rolesData === 'string') {
      return rolesData.split(',').map((r: string) => r.trim()).filter(Boolean);
    }
    return [];
  }, [user]);

  const currentRole = user?.current_role || "";
  const displayName = user?.guru?.nama || user?.siswa?.nama || user?.username || "Pengguna";

  return (
    <>
      <nav className="navbar navbar-expand-md navbar-light bg-white border-bottom py-2 px-4 shadow-sm custom-navbar">
        <div className="container-fluid p-0">
          <div className="d-flex align-items-center">
            <button 
              type="button" 
              className="btn btn-link p-0 me-3 d-lg-none text-dark border-0 shadow-none" 
              onClick={onMenuClick}
              aria-label="Buka Menu"
              title="Buka Menu"
            >
              <Menu size={24} />
            </button>
            <div className="d-flex flex-column">
              <span className="navbar-subtitle text-uppercase fw-black text-muted nav-subtitle-text">Management System</span>
              <h5 className="mb-0 fw-bold text-dark small">Sistem Informasi Sekolah</h5>
            </div>
          </div>

          <div className="ms-auto d-flex align-items-center gap-2 gap-md-3">
            <div
              role="button"
              tabIndex={0}
              className="avatar-wrapper rounded-3 border border-2 border-white shadow-sm overflow-hidden bg-light d-flex align-items-center justify-content-center nav-avatar-box cursor-pointer-custom"
              onClick={() => !loading && fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && !loading && fileInputRef.current?.click()}
              title="Klik untuk ubah foto profil"
            >
              {user?.foto ? (
                <img src={user.foto} alt="Profil" className="w-100 h-100 object-fit-cover" />
              ) : (
                <User size={18} className="text-muted" />
              )}
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              className="d-none" 
              accept="image/*" 
              onChange={handleUpdateFoto}
              title="Unggah Foto Profil"
              aria-label="Unggah Foto Profil"
            />

            <div className="dropdown position-relative">
              <div
                role="button"
                className="d-flex align-items-center gap-2 text-decoration-none cursor-pointer-custom user-select-none-custom"
                onClick={() => { setIsOpen(!isOpen); setShowRoleList(false); }}
              >
                <div className="text-end d-none d-md-block">
                  <span className="mb-0 fw-black text-dark small d-block">{displayName}</span>
                  <div className="d-flex align-items-center justify-content-end gap-1">
                    <span className="online-indicator rounded-circle bg-success online-dot-mini"></span>
                    <span className="text-muted text-online-kecil">online</span>
                  </div>
                </div>
                <ChevronDown size={14} className={`text-muted transition-all ${isOpen ? 'rotate-180' : ''}`} />
              </div>

              {isOpen && (
                <>
                  <div className="dropdown-overlay position-fixed top-0 start-0 w-100 h-100 z-index-1000" onClick={() => setIsOpen(false)} />
                  <div className="dropdown-menu dropdown-menu-end show border-0 shadow-lg p-2 rounded-4 mt-2 nav-dropdown-menu z-index-1001 w-custom-200">
                    <div className="px-3 py-2 mb-2 bg-light rounded-3">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <ShieldCheck size={12} className="text-primary" />
                        <span className="fw-black text-muted text-uppercase nav-login-status-label">Status Login</span>
                      </div>
                      <p className="mb-0 small fw-bold text-truncate text-primary text-uppercase">
                        {currentRole || "PENGGUNA"}
                      </p>
                    </div>

                    {availableRoles.length > 1 && (
                      <div className="position-relative">
                        <button
                          type="button"
                          onClick={() => setShowRoleList(!showRoleList)}
                          className="dropdown-item d-flex align-items-center justify-content-between py-2 rounded-3 border-0 bg-transparent w-100 transition-all hover-bg-light text-start"
                        >
                          <div className="d-flex align-items-center gap-3">
                            <div className="p-1 bg-light rounded text-muted">
                              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            </div>
                            <span className="small fw-bold text-dark">Ganti Role</span>
                          </div>
                          <ChevronRight size={14} className={`text-muted transition-all ${showRoleList ? 'rotate-90' : ''}`} />
                        </button>

                        {showRoleList && (
                          <div className="mt-1 mb-1 ms-2 border-start ps-2 animation-fadeIn">
                            {availableRoles.map((roleName: string, idx: number) => {
                              const isSelected = (roleName || "").toLowerCase() === (currentRole || "").toLowerCase();
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  disabled={loading || isSelected}
                                  onClick={() => handleSwitchRole(roleName)}
                                  className={`dropdown-item small py-1 px-3 rounded-2 border-0 w-100 text-start ${isSelected ? 'bg-primary text-white fw-bold' : 'text-muted'}`}
                                >
                                  {(roleName || "").toUpperCase()}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    <button type="button" onClick={() => { setShowPassModal(true); setIsOpen(false); }} className="dropdown-item d-flex align-items-center gap-3 py-2 rounded-3 border-0 bg-transparent w-100 transition-all hover-bg-light text-start">
                      <div className="p-1 bg-light rounded text-muted"><Key size={14} /></div>
                      <span className="small fw-bold text-dark">Ubah Sandi</span>
                    </button>

                    <div className="mt-2 pt-2 border-top">
                      <button
                        type="button"
                        onClick={async () => { await api.auth.logout(); localStorage.clear(); window.location.href = '/login'; }}
                        className="dropdown-item d-flex align-items-center gap-3 py-2 rounded-3 text-white bg-dark border-0 w-100 text-start"
                      >
                        <div className="p-1 text-white"><LogOut size={14} /></div>
                        <span className="small fw-black text-uppercase">Keluar Sesi</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showPassModal && (
        <div className="modal-backdrop-custom position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
          <div className="bg-white p-4 rounded-4 shadow-lg mx-3 w-100 max-w-400">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0 text-dark">Ubah Kata Sandi</h6>
              <button type="button" className="btn btn-link p-0 text-muted shadow-none" onClick={() => setShowPassModal(false)} aria-label="Tutup"><X size={20} /></button>
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-3">
                <input type="password" required placeholder="Sandi lama" title="Sandi lama" className="form-control form-control-sm" value={passData.old} onChange={e => setPassData({ ...passData, old: e.target.value })} />
              </div>
              <div className="mb-3">
                <input type="password" required placeholder="Sandi baru" title="Sandi baru" className="form-control form-control-sm" value={passData.new} onChange={e => setPassData({ ...passData, new: e.target.value })} />
              </div>
              <div className="mb-2">
                <input type="password" required placeholder="Ulangi sandi baru" title="Ulangi sandi baru" className="form-control form-control-sm" value={passData.confirm} onChange={e => setPassData({ ...passData, confirm: e.target.value })} />
              </div>
              {passError && <div className="mb-3"><span className="text-danger small">* {passError}</span></div>}
              <button type="submit" disabled={loading} className="btn btn-primary w-100 rounded-3 fw-bold small">{loading ? 'Memproses...' : 'Simpan Perubahan'}</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
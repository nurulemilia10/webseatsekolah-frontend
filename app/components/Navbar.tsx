"use client";

import React, { useState, useRef, useMemo } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Key, Menu, ChevronDown, ShieldCheck, RefreshCw, X, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { 
    user, 
    loading: isLoading, 
    displayName,
    currentRole, 
    isAdmin, 
    isOrangTua 
  } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [passData, setPassData] = useState({ old: '', new: '', confirm: '' });
  const [passError, setPassError] = useState('');
  const [showRoleList, setShowRoleList] = useState(false);

  const Toast = useMemo(() => Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  }), []);

  const CenterTopToast = useMemo(() => Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  }), []);

  const handleUpdateFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('foto', file);

    try {
      setLoadingAction(true);
      const resUpload = await api.auth.updateFoto(formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const resMe = await api.auth.me();
      const updatedUser = resMe.data.data || resMe.data;
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('user-updated'));

      Toast.fire({ 
        icon: 'success', 
        title: resUpload.data?.message || "Foto berhasil diperbarui" 
      });
    } catch (err: any) {
      const errorMsg = err.response?.data?.errors?.foto?.[0] || err.response?.data?.message || "Gagal memperbarui foto";
      Toast.fire({ icon: 'error', title: errorMsg });
    } finally {
      setLoadingAction(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
      setLoadingAction(true);
      const res = await api.auth.changePassword({ 
        current_password: passData.old, 
        new_password: passData.new,
        new_password_confirmation: passData.confirm 
      });
      Swal.fire({ 
        icon: 'success', 
        title: 'Berhasil', 
        text: res.data?.message || "Password berhasil diubah!", 
        confirmButtonColor: '#0d6efd' 
      });
      setShowPassModal(false);
      setPassData({ old: '', new: '', confirm: '' });
    } catch (err: any) {
      setPassError(err.response?.data?.message || "Gagal mengubah password");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSwitchRole = async (targetRole: string) => {
    const normalizedTarget = (targetRole || "").toLowerCase().trim();
    const normalizedCurrent = (currentRole || "").toLowerCase().trim();
    if (normalizedTarget === normalizedCurrent) return;

    try {
      setLoadingAction(true);
      await api.auth.switchRole({ role: targetRole });
      
      const resMe = await api.auth.me();
      const updatedUser = resMe.data.data || resMe.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('user-updated'));

      CenterTopToast.fire({ 
        icon: 'success', 
        title: `Berhasil pindah ke role ${targetRole}` 
      });
      setIsOpen(false);
      
      setTimeout(() => {
        const roleSlug = targetRole.toLowerCase();
        if (roleSlug.includes('admin')) window.location.href = '/admin/dashboard';
        else if (roleSlug.includes('guru')) window.location.href = '/guru/dashboard';
        else if (roleSlug.includes('siswa')) window.location.href = '/siswa/dashboard';
        else if (roleSlug.includes('orangtua') || roleSlug.includes('ortu')) window.location.href = '/ortu/dashboard';
        else window.location.reload();
      }, 200);

    } catch (err: any) {
      CenterTopToast.fire({ 
        icon: 'error', 
        title: err.response?.data?.message || "Gagal berpindah role" 
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const availableRoles = useMemo(() => {
    const rolesData = user?.roles; 
    if (!rolesData) return [];
    if (Array.isArray(rolesData)) {
      return rolesData.map((r: any) => typeof r === 'object' ? r.name || r.nama : r).filter(Boolean);
    }
    if (typeof rolesData === 'string') {
      return rolesData.split(',').map((r: string) => r.trim()).filter(Boolean);
    }
    return [];
  }, [user]);

  const handleAvatarClick = () => {
    if (loadingAction || isAdmin || isOrangTua) return;
    fileInputRef.current?.click();
  };

  const renderUserPhoto = () => {
    const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&background=FFD700&color=000&bold=true`;
    const photoSrc = user?.foto || user?.data?.foto || avatarFallback;
    return (
      <img 
        src={photoSrc} 
        alt="Profil" 
        className="w-100 h-100 object-fit-cover" 
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== avatarFallback) target.src = avatarFallback;
        }}
      />
    );
  };

  return (
    <>
      <nav className="navbar navbar-expand-md navbar-light bg-white border-bottom py-2 px-4 shadow-sm custom-navbar">
        <div className="container-fluid p-0">
          <div className="d-flex align-items-center">
            <button type="button" className="btn btn-link p-0 me-3 d-lg-none text-dark border-0 shadow-none" onClick={onMenuClick} title="Buka Menu" aria-label="Buka Menu">
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
              className={`avatar-wrapper rounded-3 border border-2 border-white shadow-sm overflow-hidden bg-light d-flex align-items-center justify-content-center nav-avatar-box ${(isAdmin || isOrangTua) || isLoading ? 'pe-none opacity-100' : 'cursor-pointer-custom'}`}
              onClick={handleAvatarClick}
              onKeyDown={(e) => e.key === 'Enter' && handleAvatarClick()}
              title={(isAdmin || isOrangTua) ? "" : "Klik untuk ubah foto profil"}
            >
              {isLoading ? <div className="spinner-border spinner-border-sm text-primary" role="status" /> : renderUserPhoto()}
            </div>

            <input type="file" ref={fileInputRef} className="d-none" accept="image/*" onChange={handleUpdateFoto} title="Unggah Foto Profil" aria-label="Unggah Foto Profil" />

            <div className="dropdown position-relative">
              <div
                role="button"
                className="d-flex align-items-center gap-2 text-decoration-none cursor-pointer-custom user-select-none-custom"
                onClick={() => { setIsOpen(!isOpen); setShowRoleList(false); }}
              >
                <div className="text-end d-none d-md-block">
                  <span className="mb-0 fw-black text-dark small d-block">{isLoading ? 'Loading...' : displayName}</span>
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
                      <p className="mb-0 small fw-bold text-truncate text-primary text-uppercase">{currentRole || "PENGGUNA"}</p>
                    </div>

                    {availableRoles.length > 1 && (
                      <div className="position-relative">
                        <button type="button" onClick={() => setShowRoleList(!showRoleList)} className="dropdown-item d-flex align-items-center justify-content-between py-2 rounded-3 border-0 bg-transparent w-100 transition-all hover-bg-light text-start">
                          <div className="d-flex align-items-center gap-3">
                            <div className="p-1 bg-light rounded text-muted">
                              <RefreshCw size={14} className={loadingAction ? 'animate-spin' : ''} />
                            </div>
                            <span className="small fw-bold text-dark">Ganti Role</span>
                          </div>
                          <ChevronRight size={14} className={`text-muted transition-all ${showRoleList ? 'rotate-90' : ''}`} />
                        </button>

                        {showRoleList && (
                          <div className="mt-1 mb-1 ms-2 border-start ps-2 animation-fadeIn">
                            {availableRoles.map((roleName: string, idx: number) => {
                              const isSelected = (roleName || "").toLowerCase().trim() === (currentRole || "").toLowerCase().trim();
                              return (
                                <button key={idx} type="button" disabled={loadingAction || isSelected} onClick={() => handleSwitchRole(roleName)}
                                  className={`dropdown-item small py-1 px-3 rounded-2 border-0 w-100 text-start ${isSelected ? 'bg-primary text-white fw-bold' : 'text-muted'}`}>
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
                      <button type="button" disabled={loadingAction} className="dropdown-item d-flex align-items-center gap-3 py-2 rounded-3 text-white bg-dark border-0 w-100 text-start"
                        onClick={async () => {
                          try { setLoadingAction(true); await api.auth.logout(); } catch (err) { console.error(err); } 
                          finally { localStorage.clear(); window.location.href = '/login'; }
                        }}>
                        <div className="p-1 text-white"><LogOut size={14} /></div>
                        <span className="small fw-black text-uppercase">{loadingAction ? 'Processing...' : 'Keluar Sesi'}</span>
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
              <button type="submit" disabled={loadingAction} className="btn btn-primary w-100 rounded-3 fw-bold small">{loadingAction ? 'Memproses...' : 'Simpan Perubahan'}</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
"use client";

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Key, Menu, ChevronDown, ShieldCheck, RefreshCw, X, ChevronRight, Loader2, Crop } from 'lucide-react';
import Swal from 'sweetalert2';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/app/utils/imageUtils';

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
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [passData, setPassData] = useState({ old: '', new: '', confirm: '' });
  const [passError, setPassError] = useState('');
  const [showRoleList, setShowRoleList] = useState(false);
  const [localUser, setLocalUser] = useState<any>(null);
  
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFormData, setPhotoFormData] = useState({ foto: null as File | null });

  const fetchLocal = useCallback(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setLocalUser(parsed.data || parsed);
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
        }
      }
    }
  }, []);

  const syncUserData = useCallback(async () => {
    try {
      const resMe = await api.auth.me();
      const updatedUser = resMe.data.data || resMe.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('user-updated'));
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchLocal();
    syncUserData();
    window.addEventListener('user-updated', fetchLocal);
    window.addEventListener('storage', fetchLocal);
    return () => {
      window.removeEventListener('user-updated', fetchLocal);
      window.removeEventListener('storage', fetchLocal);
    };
  }, [fetchLocal, syncUserData]);

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

  const onCropComplete = useCallback((_: any, clippedPixels: any) => { setCroppedAreaPixels(clippedPixels); }, []);

  const handleApplyCrop = async () => {
    if (tempImage && croppedAreaPixels) {
      try {
        const croppedBlob = await getCroppedImg(tempImage, croppedAreaPixels);
        const file = new File([croppedBlob], "profile_photo.jpg", { type: "image/jpeg" });
        if (photoPreview && photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
        const newUrl = URL.createObjectURL(croppedBlob);
        setPhotoFormData(prev => ({ ...prev, foto: file }));
        setPhotoPreview(newUrl);
        setTempImage(null);
      } catch (e) { Toast.fire({ icon: 'error', title: 'Gagal memotong gambar' }); }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempImage(reader.result as string);
        setPhotoPreview(null);
        setShowPhotoModal(true);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleClosePhotoForm = useCallback(() => {
    if (photoPreview && photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
    setShowPhotoModal(false); 
    setTempImage(null);
    setPhotoPreview(null); 
    setPhotoFormData({ foto: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [photoPreview]);

  const handleUpdateFoto = async () => {
    if (!photoFormData.foto) return;
    const formData = new FormData();
    formData.append('foto', photoFormData.foto);
    try {
      setLoadingAction(true);
      const resUpload = await api.auth.updateFoto(formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      handleClosePhotoForm();
      Toast.fire({ icon: 'success', title: resUpload.data?.message || "Foto berhasil diperbarui" });
      syncUserData();
    } catch (err: any) {
      const errorMsg = err.response?.data?.errors?.foto?.[0] || err.response?.data?.message || "Gagal memperbarui foto";
      Toast.fire({ icon: 'error', title: errorMsg });
    } finally {
      setLoadingAction(false);
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
        confirmButtonColor: '#ffc107' 
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
    const activeData = localUser || user;
    const nameToUse = activeData?.name || activeData?.nama || activeData?.guru?.nama || displayName || 'User';
    const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameToUse)}&background=FFD700&color=000&bold=true`;
    const rawFoto = activeData?.foto || activeData?.data?.foto || activeData?.user?.foto;
    const baseUrl = 'http://webseatsekolah13.test/storage/';
    if (!rawFoto || rawFoto === "" || rawFoto === "null") {
      return <img src={avatarFallback} alt="Profil" className="w-100 h-100 object-fit-cover" />;
    }
    let photoSrc = rawFoto.includes('http') 
      ? rawFoto 
      : `${baseUrl}${rawFoto.replace(/^public\//, '')}`;
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
              className={`avatar-wrapper rounded-3 border border-2 border-white shadow-sm overflow-hidden bg-light d-flex align-items-center justify-content-center nav-avatar-box ${(isAdmin || isOrangTua) || (isLoading && !localUser) ? 'pe-none opacity-100' : 'cursor-pointer-custom'}`}
              onClick={handleAvatarClick}
              onKeyDown={(e) => e.key === 'Enter' && handleAvatarClick()}
              title={(isAdmin || isOrangTua) ? "" : "Klik untuk ubah foto profil"}
            >
              {isLoading && !localUser ? <div className="spinner-border spinner-border-sm text-warning" role="status" /> : renderUserPhoto()}
            </div>

            <input type="file" ref={fileInputRef} className="d-none" accept="image/*" onChange={handleFileChange} title="Unggah Foto Profil" aria-label="Unggah Foto Profil" />

            <div className="dropdown position-relative">
              <div
                role="button"
                className="d-flex align-items-center gap-2 text-decoration-none cursor-pointer-custom user-select-none-custom"
                onClick={() => { setIsOpen(!isOpen); setShowRoleList(false); }}
              >
                <div className="text-end d-none d-md-block">
                  <span className="mb-0 fw-black text-dark small d-block">{(isLoading && !localUser) ? 'Loading...' : (localUser?.nama || localUser?.name || localUser?.guru?.nama || displayName)}</span>
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
                        <ShieldCheck size={12} className="text-warning" />
                        <span className="fw-black text-muted text-uppercase nav-login-status-label">Status Login</span>
                      </div>
                      <p className="mb-0 small fw-bold text-truncate text-warning text-uppercase">{currentRole || localUser?.current_role || "PENGGUNA"}</p>
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
                                  className={`dropdown-item small py-1 px-3 rounded-2 border-0 w-100 text-start ${isSelected ? 'bg-warning text-dark fw-bold' : 'text-muted'}`}>
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

      {showPhotoModal && (
        <div className="modal-backdrop-custom position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-index-2000">
          <div className="bg-white p-4 rounded-4 shadow-lg mx-3 w-100 max-w-400">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0 text-dark small">Update Foto Profil</h6>
              <button type="button" className="btn btn-link p-0 text-muted shadow-none" onClick={handleClosePhotoForm} aria-label="Tutup"><X size={20} /></button>
            </div>
            
            <div className="mb-3 position-relative">
                {tempImage ? (
                    <div className="ui-cropper-wrapper position-relative overflow-hidden rounded-3 bg-light" >
                        <Cropper 
                          image={tempImage} 
                          crop={crop} 
                          zoom={zoom} 
                          aspect={1 / 1} 
                          onCropChange={setCrop} 
                          onCropComplete={onCropComplete} 
                          onZoomChange={setZoom} 
                        />
                    </div>
                ) : photoPreview ? (
                    <div className="text-center p-2 bg-light rounded-3 overflow-hidden" >
                        <img src={photoPreview} alt="Preview" className="w-100 h-100 object-fit-contain" />
                    </div>
                ) : (
                    <div className="text-center py-5 bg-light rounded-3" >
                        <div className="d-flex flex-column align-items-center justify-content-center h-100">
                          <Loader2 size={24} className="text-warning animate-spin mb-2" />
                          <div className="text-muted text-[10px]">Memuat gambar...</div>
                        </div>
                    </div>
                )}
            </div>

            <div className="d-flex gap-2">
              {tempImage && (
                <>
                  <div className="flex-grow-1 d-flex align-items-center bg-light px-2 rounded-3">
                    <input 
                      type="range" 
                      className="form-range" 
                      min={1} 
                      max={3} 
                      step={0.1} 
                      value={zoom} 
                      onChange={(e) => setZoom(Number(e.target.value))} 
                      title="Atur Perbesaran Gambar"
                      aria-label="Atur Perbesaran Gambar"
                    />
                  </div>
                  <button onClick={handleApplyCrop} className="btn btn-warning btn-sm fw-bold px-3 py-2 rounded-3 shadow-sm border-0">
                    <Crop size={16} className="me-1"/> Selesai
                  </button>
                </>
              )}
              
              {!tempImage && photoPreview && (
                <button onClick={handleUpdateFoto} className="btn btn-warning btn-sm w-100 fw-bold shadow-sm py-2 rounded-3 border-0" disabled={loadingAction}>
                    {loadingAction ? <Loader2 size={14} className="animate-spin me-2" /> : null}
                    Simpan Foto Profil
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showPassModal && (
        <div className="modal-backdrop-custom position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-index-2000">
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
              <button type="submit" disabled={loadingAction} className="btn btn-warning w-100 rounded-3 fw-bold small">{loadingAction ? 'Memproses...' : 'Simpan Perubahan'}</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
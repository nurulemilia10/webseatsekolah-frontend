"use client";

import React, { useState, useEffect, useCallback, useId, memo, useMemo } from 'react';
import { 
  Plus, Edit2, Loader2, FolderOpen, Trash2, Calendar, Crop, ArrowLeft, Image as ImageIcon, Video, X, Maximize2, CheckSquare, Square 
} from 'lucide-react';
import Cropper from 'react-easy-crop';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { useAuth } from '@/hooks/useAuth';
import { getCroppedImg, getBase64FromUrl } from '@/app/utils/imageUtils';

const AlbumRow = memo(({ album, onEdit, onDelete, onOpen }: { album: any, onEdit: (a: any) => void, onDelete: (id: string) => void, onOpen: (a: any) => void }) => (
  <tr className="cursor-pointer" onClick={() => onOpen(album)}>
    <td className="ps-3 py-2">
      <div className="d-flex align-items-center">
        <div className="ui-thumb-container flex-shrink-0 ratio ratio-4x3 w-42px">
          {album.cover_url ? (
            <img 
              src={album.cover_url} 
              alt="cover" 
              className="w-100 h-100 object-cover block rounded-2 border"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=No+Image';
              }}
            />
          ) : (
            <div className="d-flex align-items-center justify-content-center w-100 h-100 bg-light rounded-2 border">
              <FolderOpen size={10} className="text-muted" />
            </div>
          )}
        </div>
        <div className="ms-2 text-dark fw-medium text-[11px] text-wrap-custom max-w-title">
          {album.nama_album}
        </div>
      </div>
    </td>
    <td className="py-2 text-muted text-[10px] d-none d-md-table-cell">
      <div className="d-flex align-items-center">
        <Calendar size={11} className="me-1" />
        {album.tanggal_kegiatan || '-'}
      </div>
    </td>
    <td className="py-2 text-muted text-[10px] d-none d-md-table-cell text-center">
      <span className="badge bg-light text-dark fw-normal border">{album.jumlah_media || 0} Media</span>
    </td>
    <td className="py-2 text-end pe-3">
      <div className="d-flex justify-content-end gap-1" onClick={(e) => e.stopPropagation()}>
        <button title="Edit Album" onClick={() => onEdit(album)} className="btn btn-sm p-1 text-primary border-0 shadow-none">
          <span className="bg-light p-1 rounded-3 d-inline-flex"><Edit2 size={11}/></span>
        </button>
        <button title="Hapus Album" onClick={() => onDelete(album.id)} className="btn btn-sm p-1 text-danger border-0 shadow-none">
          <span className="bg-danger bg-opacity-10 p-1 rounded-3 d-inline-flex"><Trash2 size={11}/></span>
        </button>
      </div>
    </td>
  </tr>
));

AlbumRow.displayName = 'AlbumRow';

export default function ManajemenAlbum() {
  const { user, loading: authLoading } = useAuth();
  const [view, setView] = useState<'album' | 'media'>('album');
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [mediaData, setMediaData] = useState<any[]>([]);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [tempImage, setTempImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ nama_album: '', tanggal_kegiatan: '', cover: null as File | null });
  const [mediaForm, setMediaForm] = useState({ jenis_media: 'foto', keterangan: '', media_path: '' });
  const [mediaFiles, setMediaFiles] = useState<FileList | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [previewMedia, setPreviewMedia] = useState<any>(null);

  const nameId = useId();
  const tglId = useId();
  const coverId = useId();
  const mediaInputId = useId();

  const Toast = useMemo(() => Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  }), []);

  const fetchData = useCallback(async (page = 1) => {
    if (authLoading || !user) return;
    setLoading(true);
    try {
      const res = await api.admin.album.getAll({ page });
      if (res?.data) {
        setData(res.data.data || []);
        setMeta(res.data.meta || null);
        setCurrentPage(page);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [authLoading, user]);

  const fetchMedia = useCallback(async (albumId: string) => {
    setLoading(true);
    setSelectedMediaIds([]);
    try {
      const res = await api.admin.media.getAll({ album_id: albumId });
      if (res?.data) {
        setMediaData(res.data.data || []);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { 
    if (view === 'album') fetchData(1); 
  }, [fetchData, view]);

  const onCropComplete = useCallback((_: any, clippedPixels: any) => { 
    setCroppedAreaPixels(clippedPixels); 
  }, []);

  const handleApplyCrop = async () => {
    if (tempImage && croppedAreaPixels) {
      try {
        const croppedBlob = await getCroppedImg(tempImage, croppedAreaPixels);
        const file = new File([croppedBlob], "album_cover.jpg", { type: "image/jpeg" });
        if (photoPreview && photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
        const newUrl = URL.createObjectURL(croppedBlob);
        setFormData(prev => ({ ...prev, cover: file }));
        setPhotoPreview(newUrl);
        setTempImage(null);
      } catch (e) { 
        Toast.fire({ icon: 'error', title: 'Gagal memotong gambar' }); 
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImage(reader.result as string);
        setTempImage(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCloseForm = useCallback(() => {
    if (photoPreview && photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
    setShowForm(false); setIsEdit(false); setCurrentId(null); setTempImage(null);
    setOriginalImage(null); setPhotoPreview(null); setErrors({});
    setFormData({ nama_album: '', tanggal_kegiatan: '', cover: null });
    setMediaForm({ jenis_media: 'foto', keterangan: '', media_path: '' });
    setMediaFiles(null);
  }, [photoPreview]);

  const handleEditClick = useCallback(async (a: any) => {
    setIsEdit(true); setCurrentId(a.id);
    setFormData({ 
      nama_album: a.nama_album || '', 
      tanggal_kegiatan: a.tanggal_kegiatan || '', 
      cover: null 
    });
    setPhotoPreview(a.cover_url || null);
    setShowForm(true);
    if (a.cover_url) {
      try { 
        const base64 = await getBase64FromUrl(a.cover_url); 
        setOriginalImage(base64); 
      } catch (e) { console.error(e); }
    }
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Album?',
      text: "Seluruh media di dalam album ini juga akan terhapus.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!',
      reverseButtons: true
    });
    if (result.isConfirmed) {
      try {
        const res = await api.admin.album.delete(id);
        if (res.status === 200 || res.data?.success) {
          Toast.fire({ icon: 'success', title: 'Album berhasil dihapus' });
          fetchData(currentPage);
        }
      } catch (e: any) {
        Toast.fire({ icon: 'error', title: 'Gagal menghapus album' });
      }
    }
  };

  const handleDeleteMedia = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Media?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!',
      reverseButtons: true
    });
    if (result.isConfirmed) {
      try {
        await api.admin.media.delete(id);
        Toast.fire({ icon: 'success', title: 'Media berhasil dihapus' });
        fetchMedia(selectedAlbum.id);
      } catch (e) { console.error(e); }
    }
  };

  const handleBulkDeleteMedia = async () => {
    if (selectedMediaIds.length === 0) return;
    const result = await Swal.fire({
      title: `Hapus ${selectedMediaIds.length} Media?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus Semua!',
      reverseButtons: true
    });
    if (result.isConfirmed) {
      try {
        setLoading(true);
        await api.admin.media.massDelete({
          ids: selectedMediaIds
        });
        Toast.fire({ icon: 'success', title: 'Media terpilih berhasil dihapus' });
        fetchMedia(selectedAlbum.id);
      } catch (e) {
        Toast.fire({ icon: 'error', title: 'Gagal menghapus beberapa media' });
      } finally { setLoading(false); }
    }
  };

  const toggleSelectMedia = (id: string) => {
    setSelectedMediaIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedMediaIds.length === mediaData.length) setSelectedMediaIds([]);
    else setSelectedMediaIds(mediaData.map(m => m.id));
  };

  const handleSave = async () => {
    setErrors({});
    setIsSubmitting(true);
    const payload = new FormData();
    payload.append('nama_album', formData.nama_album);
    if (formData.tanggal_kegiatan) payload.append('tanggal_kegiatan', formData.tanggal_kegiatan);
    if (formData.cover) payload.append('cover', formData.cover);
    
    try {
      let res;
      if (isEdit && currentId) {
        payload.append('_method', 'PUT');
        res = await api.admin.album.update(currentId, payload);
      } else {
        res = await api.admin.album.create(payload);
      }
      
      if (res.status === 200 || res.status === 201 || res.data?.success) { 
        Toast.fire({ icon: 'success', title: 'Data berhasil disimpan' });
        handleCloseForm(); 
        fetchData(isEdit ? currentPage : 1); 
      }
    } catch (e: any) { 
      if (e.response?.status === 422) setErrors(e.response.data.errors);
      else Toast.fire({ icon: 'error', title: 'Terjadi kesalahan sistem' });
    } finally { setIsSubmitting(false); }
  };

  const handleSaveMedia = async () => {
    setErrors({});
    setIsSubmitting(true);
    const payload = new FormData();
    payload.append('album_id', selectedAlbum.id);
    payload.append('jenis_media', mediaForm.jenis_media);
    payload.append('keterangan', mediaForm.keterangan);
    
    if (mediaForm.jenis_media === 'foto' && mediaFiles) {
      Array.from(mediaFiles).forEach((f) => payload.append('media[]', f));
    } else if (mediaForm.jenis_media === 'video') {
      payload.append('media_path', mediaForm.media_path);
    }

    try {
      const res = await api.admin.media.create(payload);
      if (res.status === 200 || res.status === 201 || res.data?.success) {
        Toast.fire({ icon: 'success', title: 'Media berhasil disimpan' });
        handleCloseForm();
        fetchMedia(selectedAlbum.id);
      }
    } catch (e: any) {
      if (e.response?.status === 422) setErrors(e.response.data.errors);
      else Toast.fire({ icon: 'error', title: 'Gagal menyimpan media' });
    } finally { setIsSubmitting(false); }
  };

  const openAlbum = (album: any) => {
    setSelectedAlbum(album);
    setView('media');
    fetchMedia(album.id);
  };

  if (authLoading) return null;

  if (view === 'media') {
    return (
      <div className="container-fluid py-3 px-2 px-md-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
            <button title="Kembali" onClick={() => setView('album')} className="btn btn-light btn-sm rounded-3 me-2 p-1 border shadow-none">
              <ArrowLeft size={16} />
            </button>
            <div>
              <h6 className="mb-0 fw-bold text-dark text-uppercase text-[12px] tracking-wider">{selectedAlbum?.nama_album}</h6>
              <span className="text-muted text-[10px]">{selectedAlbum?.tanggal_kegiatan || '-'}</span>
            </div>
          </div>
          <div className="d-flex gap-2">
            {mediaData.length > 0 && (
              <button title="Pilih Semua" onClick={toggleSelectAll} className="btn btn-light btn-sm px-2 border shadow-none rounded-3 text-[10px]">
                {selectedMediaIds.length === mediaData.length ? <CheckSquare size={13} className="text-primary" /> : <Square size={13} />}
              </button>
            )}
            {selectedMediaIds.length > 0 && (
              <button onClick={handleBulkDeleteMedia} className="btn btn-danger btn-sm px-2 shadow-sm rounded-3 text-[10px]">
                <Trash2 size={13} className="me-1"/> Hapus ({selectedMediaIds.length})
              </button>
            )}
            <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm px-3 shadow-sm rounded-3 py-1.5 text-[10px]">
              <Plus size={13} className="me-1"/> <span>Tambah Media</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Loader2 className="text-primary animate-spin mb-2 mx-auto" size={20} />
            <div className="text-muted text-[10px]">Memuat media...</div>
          </div>
        ) : (
          <div className="row row-cols-4 row-cols-sm-6 row-cols-md-8 row-cols-lg-10 g-2">
            {mediaData.length === 0 ? (
              <div className="col-12 text-center py-5 text-muted text-[10px]">Belum ada media di album ini.</div>
            ) : mediaData.map((m) => (
              <div key={m.id} className="col">
                <div 
                  className={`card border-0 shadow-sm rounded-2 overflow-hidden h-100 group position-relative border cursor-pointer ${selectedMediaIds.includes(m.id) ? 'ring-2 ring-primary border-primary' : 'bg-light'}`}
                  onClick={() => toggleSelectMedia(m.id)}
                >
                  <div className="ratio ratio-1x1 position-relative">
                    {m.jenis_media === 'Video' || m.jenis_media === 'video' ? (
                      <div className="d-flex flex-column align-items-center justify-content-center bg-dark text-white h-100 w-100">
                        <Video size={14} className="mb-1" />
                        <span className="text-[5px] text-center px-1 text-truncate w-100">{m.media_path}</span>
                      </div>
                    ) : (
                      <img 
                        src={m.media_url || m.media_path} 
                        alt="media" 
                        className="w-100 h-100 object-cover transition-transform duration-300 group-hover:scale-110" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Error';
                        }}
                      />
                    )}

                    {/* Overlay Lihat Selengkapnya saat Hover */}
                    <div 
                      className="position-absolute bottom-0 start-0 w-100 p-1 bg-dark bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity d-flex align-items-center justify-content-center gap-1 z-10" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setPreviewMedia(m); 
                      }}
                    >
                      <Maximize2 size={8} className="text-white" />
                      <span className="text-white text-[7px] fw-medium">Lihat</span>
                    </div>
                  </div>

                  {/* Bagian Aksi & Checkbox (Di luar Card/Area Foto) */}
                  <div className="card-body p-1 bg-white border-top">
                    <div className="d-flex justify-content-center gap-1">
                      {/* Checkbox Button */}
                      <button 
                        type="button"
                        title="Pilih"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectMedia(m.id);
                        }}
                        className={`btn btn-sm p-0 rounded-1 border-0 d-flex align-items-center justify-content-center w-[22px] h-[22px] ${selectedMediaIds.includes(m.id) ? 'btn-primary' : 'btn-light border'}`}
                      >
                        {selectedMediaIds.includes(m.id) ? <CheckSquare size={15}/> : <Square size={15} className="text-muted"/>}
                      </button>

                      {/* Delete Button */}
                      <button 
                        type="button"
                        title="Hapus Media"
                        onClick={(e) => { 
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteMedia(m.id); 
                        }} 
                        className="btn btn-danger btn-sm p-0 rounded-1 shadow-sm border-0 d-flex align-items-center justify-content-center w-[22px] h-[22px]"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Preview Media Tetap Sama */}
        {previewMedia && (
          <div className="modal fade show d-block bg-black-80 z-2000" onClick={() => setPreviewMedia(null)}>
            <div className="modal-dialog modal-dialog-centered modal-lg p-3" onClick={e => e.stopPropagation()}>
              <div className="modal-content border-0 bg-transparent shadow-none position-relative">
                <button title="Tutup Preview" onClick={() => setPreviewMedia(null)} className="btn btn-dark btn-sm rounded-circle position-absolute top-0 end-0 m-n2 z-index-10 border-0 shadow">
                  <X size={16} />
                </button>
                <div className="text-center">
                  {previewMedia.jenis_media === 'Video' || previewMedia.jenis_media === 'video' ? (
                    <div className="bg-dark rounded-4 p-4 p-md-5">
                       <Video size={64} className="text-white opacity-20 mb-3" />
                       <h6 className="text-white text-[12px] mb-3">{previewMedia.media_path}</h6>
                       <a href={previewMedia.media_path} target="_blank" className="btn btn-primary btn-sm rounded-3 px-4">Buka Video</a>
                    </div>
                  ) : (
                    <img 
                      src={previewMedia.media_url || previewMedia.media_path} 
                      alt="Full View" 
                      className="img-fluid rounded-3 shadow-lg max-h-80vh" 
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/800x600?text=Error'; }}
                    />
                  )}
                  {previewMedia.keterangan && (
                    <div className="bg-white p-3 rounded-3 mt-3 shadow mx-auto max-w-lg">
                      <p className="mb-0 text-[11px] text-dark text-center">{previewMedia.keterangan}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Form Tambah Media Tetap Sama */}
        {showForm && (
          <div className="modal fade show d-block bg-black-40 z-1050">
            <div className="modal-dialog modal-dialog-centered px-3 modal-max-width mx-auto">
              <div className="modal-content border-0 shadow-lg rounded-3">
                <div className="modal-header border-0 pb-0 px-3 pt-3">
                  <h6 className="modal-title fw-bold text-dark text-[12px]">Tambah Media Baru</h6>
                  <button title="Tutup Modal" onClick={handleCloseForm} className="btn-close shadow-none scale-75"></button>
                </div>
                <div className="modal-body p-3">
                  <div className="mb-2">
                    <label className="form-label text-dark mb-1 fw-semibold text-[10px]">Jenis Media</label>
                    <div className="d-flex gap-2">
                      <button type="button" onClick={() => setMediaForm({...mediaForm, jenis_media: 'foto'})} className={`btn btn-sm flex-grow-1 text-[10px] rounded-3 py-1.5 ${mediaForm.jenis_media === 'foto' ? 'btn-primary shadow-sm' : 'btn-light border'}`}>
                        <ImageIcon size={12} className="me-1" /> Foto
                      </button>
                      <button type="button" onClick={() => setMediaForm({...mediaForm, jenis_media: 'video'})} className={`btn btn-sm flex-grow-1 text-[10px] rounded-3 py-1.5 ${mediaForm.jenis_media === 'video' ? 'btn-primary shadow-sm' : 'btn-light border'}`}>
                        <Video size={12} className="me-1" /> Video
                      </button>
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="form-label text-dark mb-1 fw-semibold text-[10px]">Keterangan (Opsional)</label>
                    <textarea className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" rows={2} value={mediaForm.keterangan || ''} onChange={(e) => setMediaForm({...mediaForm, keterangan: e.target.value})} placeholder="Deskripsi media..." />
                  </div>
                  {mediaForm.jenis_media === 'foto' ? (
                    <div className="mb-2">
                      <label htmlFor={mediaInputId} className="form-label text-dark mb-1 fw-semibold text-[10px]">Pilih Foto</label>
                      <input 
                        id={mediaInputId}
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" 
                        onChange={(e) => {
                          if (e.target.files) {
                            setMediaFiles(e.target.files);
                          }
                        }} 
                      />
                      {errors.media && <div className="text-danger mt-1 text-[8px]">{errors.media[0]}</div>}
                    </div>
                  ) : (
                    <div className="mb-2">
                      <label className="form-label text-dark mb-1 fw-semibold text-[10px]">URL Video</label>
                      <input type="text" className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" placeholder="https://..." value={mediaForm.media_path || ''} onChange={(e) => setMediaForm({...mediaForm, media_path: e.target.value})} />
                      {errors.media_path && <div className="text-danger mt-1 text-[8px]">{errors.media_path[0]}</div>}
                    </div>
                  )}
                </div>
                <div className="modal-footer border-0 p-3 pt-0">
                  <button onClick={handleSaveMedia} className="btn btn-primary btn-sm w-100 fw-bold shadow-sm py-2 text-[11px] rounded-3" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : "Simpan Media"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Manajemen Album (view: album) tetap sama seperti kode awal kamu
  return (
    <div className="container-fluid py-3 px-2 px-md-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <FolderOpen size={16} className="text-primary me-2" />
          <h6 className="mb-0 fw-bold text-dark text-uppercase text-[12px] tracking-wider">Manajemen Album Galeri</h6>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm px-2 px-md-3 shadow-sm rounded-3 py-1.5 text-[10px]">
          <Plus size={13} className="me-1"/> <span>Tambah Album</span>
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="text-[9px]">
                <th className="ps-3 border-0 py-2.5 fw-bold text-muted text-uppercase">Nama Album</th>
                <th className="border-0 py-2.5 fw-bold text-muted text-uppercase d-none d-md-table-cell">Tanggal</th>
                <th className="border-0 py-2.5 fw-bold text-muted text-uppercase d-none d-md-table-cell text-center">Jumlah</th>
                <th className="border-0 py-2.5 text-end pe-3 fw-bold text-muted text-uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-5">
                    <Loader2 className="text-primary animate-spin mb-2 mx-auto" size={20} />
                    <div className="text-muted text-[10px]">Memuat data album...</div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-5 text-muted text-[10px]">Belum ada album galeri.</td>
                </tr>
              ) : data.map((a) => (
                <AlbumRow key={a.id} album={a} onEdit={handleEditClick} onDelete={handleDelete} onOpen={openAlbum} />
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="card-footer bg-white border-top py-2 rounded-bottom-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted text-[9px] fw-medium">Total: {meta?.total || 0}</div>
            {meta && meta.last_page > 1 && (
              <nav aria-label="Navigasi Halaman">
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${meta.current_page === 1 ? 'disabled' : ''}`}>
                    <button title="Halaman Sebelumnya" aria-label="Halaman Sebelumnya" className="page-link border rounded-3 mx-1 ui-pagination-square shadow-none" onClick={() => fetchData(meta.current_page - 1)}>&lt;</button>
                  </li>
                  <li className="page-item active">
                    <span className="page-link border rounded-3 mx-1 ui-pagination-square bg-primary text-white border-primary shadow-none" aria-current="page">{meta.current_page}</span>
                  </li>
                  <li className={`page-item ${meta.current_page === meta.last_page ? 'disabled' : ''}`}>
                    <button title="Halaman Selanjutnya" aria-label="Halaman Selanjutnya" className="page-link border rounded-3 mx-1 ui-pagination-square shadow-none" onClick={() => fetchData(meta.current_page + 1)}>&gt;</button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="modal fade show d-block bg-black-40 z-1050">
          <div className="modal-dialog modal-dialog-centered px-3 modal-max-width mx-auto">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="modal-header border-0 pb-0 px-3 pt-3">
                <h6 className="modal-title fw-bold text-dark text-[12px]">
                  {tempImage ? "Potong Cover" : (isEdit ? "Edit Album" : "Tambah Album")}
                </h6>
                <button title="Tutup Modal" onClick={handleCloseForm} className="btn-close shadow-none scale-75"></button>
              </div>
              <div className="modal-body p-3 pt-2">
                {tempImage ? (
                  <div className="ui-cropper-wrapper">
                    <Cropper image={tempImage} crop={crop} zoom={zoom} aspect={4 / 3} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
                    <div className="position-absolute bottom-0 start-0 w-100 p-2 d-flex gap-2 z-index-10">
                      <button onClick={handleApplyCrop} className="btn btn-primary btn-sm flex-grow-1 fw-bold text-[10px] py-1.5 rounded-3 shadow">
                        <Crop size={11} className="me-1"/> Selesai
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-2">
                      <label className="form-label text-dark mb-1 fw-semibold text-[10px]" htmlFor={nameId}>Nama Album</label>
                      <input id={nameId} type="text" className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" value={formData.nama_album || ''} onChange={(e) => setFormData({...formData, nama_album: e.target.value})} />
                      {errors.nama_album && <div className="text-danger mt-1 text-[8px]">{errors.nama_album[0]}</div>}
                    </div>
                    <div className="mb-2">
                      <label className="form-label text-dark mb-1 fw-semibold text-[10px]" htmlFor={tglId}>Tanggal Kegiatan</label>
                      <input id={tglId} type="date" className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" value={formData.tanggal_kegiatan || ''} onChange={(e) => setFormData({...formData, tanggal_kegiatan: e.target.value})} />
                    </div>
                    <div className="mb-2">
                      <label className="form-label text-dark mb-1 fw-semibold text-[10px]" htmlFor={coverId}>Cover Album</label>
                      <input id={coverId} type="file" accept="image/*" className="form-control bg-light border-0 shadow-none py-1.5 px-3 text-[10px] rounded-3" onChange={handleFileChange} />
                      {photoPreview && (
                        <div className="ui-preview-foto ratio ratio-4x3 mt-2" onClick={() => originalImage && setTempImage(originalImage)}>
                          <img 
                            src={photoPreview} 
                            alt="Preview" 
                            className="object-cover rounded-3 border" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Error';
                            }}
                          />
                          <div className="ui-preview-overlay"><span>Klik untuk potong ulang</span></div>
                          <button title="Hapus Preview" type="button" className="btn-close ui-btn-delete-preview shadow-none" onClick={(e) => { e.stopPropagation(); setFormData({...formData, cover: null}); setPhotoPreview(null); setOriginalImage(null); }}></button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              {!tempImage && (
                <div className="modal-footer border-0 p-3 pt-0">
                  <button onClick={handleSave} className="btn btn-primary btn-sm w-100 fw-bold shadow-sm py-2 text-[11px] rounded-3" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : (isEdit ? "Update Album" : "Simpan Album")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
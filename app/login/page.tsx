'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const styles = {
    container: "d-flex align-items-center justify-content-center bg-light min-vh-100",
    wrapper: "login-wrapper px-3 w-100 max-w-420",
    card: "card shadow-sm border-0 rounded-4",
    cardBody: "p-4 p-md-5",
    headerSection: "text-center mb-5",
    logoFlex: "d-flex align-items-center justify-content-center gap-3",
    logoImg: "img-fluid school-logo login-school-logo",
    verticalDivider: "text-start border-start ps-3 border-2 border-secondary",
    schoolName: "fw-bold mb-0 text-dark tracking-tighter school-title",
    subName: "text-muted small fw-semibold tracking-wide",
    inputGroup: "mb-3",
    label: "form-label small fw-bold text-muted",
    inputField: "form-control form-control-lg fs-6 shadow-none border-0 py-3 rounded-3 custom-input",
    loginBtn: "btn btn-lg w-100 fw-bold fs-6 py-3 rounded-3 shadow-sm mt-2 text-white custom-btn",
    footerText: "text-center mt-5 text-muted opacity-50 fw-medium footer-copy",
    errorAlert: "alert alert-danger small py-2 text-center mb-4 border-0 rounded-3 custom-error"
};

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // 1. Tambahkan state mounted untuk mencegah Hydration Error
    const [isMounted, setIsMounted] = useState(false);
    
    const [schoolProfile, setSchoolProfile] = useState({ 
        nama_sekolah: 'SIP SEKO', 
        logo: '/logo.png' 
    });

    const router = useRouter();

    useEffect(() => {
        // Set mounted jadi true agar browser tahu sekarang aman untuk render data lokal
        setIsMounted(true);

        // Ambil data cache
        const saved = localStorage.getItem('cached_school_profile');
        if (saved) {
            const parsed = JSON.parse(saved);
            setSchoolProfile(parsed);
        }

        router.prefetch('/admin/dashboard');
        router.prefetch('/guru/dashboard');
        router.prefetch('/siswa/dashboard');
        router.prefetch('/orangtua/dashboard');

        // Update data terbaru dari API
        api.public.getProfilSekolah().then(res => {
            if (res.data?.data) {
                const newData = {
                    nama_sekolah: res.data.data.nama_sekolah || 'SIP SEKO',
                    logo: res.data.data.logo || '/logo.png'
                };
                setSchoolProfile(newData);
                localStorage.setItem('cached_school_profile', JSON.stringify(newData));
            }
        }).catch(() => null);
    }, [router]);

    // Update title hanya di client
    useEffect(() => {
        if (isMounted) {
            document.title = `Login | ${schoolProfile.nama_sekolah}`;
        }
    }, [isMounted, schoolProfile.nama_sekolah]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError('');

        try {
            const response = await api.public.loginApi({ username, password });
            if (response.data.access_token) {
                const { access_token, user } = response.data;
                localStorage.setItem('token', access_token);
                const storageData = response.data.data || response.data.user || response.data;
                localStorage.setItem('user', JSON.stringify(storageData));
                window.dispatchEvent(new Event('user-updated'));

                const userRole = (
                    user.roles?.[0]?.name || 
                    user.role?.name || 
                    user.current_role || 
                    user.role ||
                    ''
                ).toLowerCase();

                let targetPath = '/dashboard';
                if (userRole.includes('admin')) targetPath = '/admin/dashboard';
                else if (userRole.includes('guru')) targetPath = '/guru/dashboard';
                else if (userRole.includes('siswa')) targetPath = '/siswa/dashboard';
                else if (userRole.includes('orangtua') || userRole.includes('ortu')) targetPath = '/orangtua/dashboard';

                router.push(targetPath);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Terjadi kesalahan sistem.');
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <div className={styles.card}>
                    <div className={styles.cardBody}>
                        <div className={styles.headerSection}>
                            <div className={styles.logoFlex}>
                                <img 
                                    // 2. Kuncinya di sini: Gunakan nilai default JIKA belum mounted
                                    src={isMounted ? schoolProfile.logo : '/logo.png'} 
                                    className={styles.logoImg}
                                    alt="Logo" 
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png' }} 
                                />
                                <div className={styles.verticalDivider}>
                                    <h5 className={styles.schoolName}>
                                        {/* 3. Nama sekolah juga sama */}
                                        {isMounted ? schoolProfile.nama_sekolah : 'nama sekolah'}
                                    </h5>
                                    <span className={styles.subName}>Sistem Informasi Sekolah</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-center mb-4">
                            <p className="text-muted small fw-medium">Silakan masuk dengan akun Anda</p>
                        </div>

                        {error && <div className={styles.errorAlert}>{error}</div>}

                        <form onSubmit={handleLogin}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Username</label>
                                <input
                                    type="text"
                                    className={styles.inputField}
                                    placeholder="Masukkan username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className={styles.label}>Password</label>
                                <input
                                    type="password"
                                    className={styles.inputField}
                                    placeholder="Masukkan password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className={styles.loginBtn} disabled={loading}>
                                {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Login'}
                            </button>
                        </form>

                        <div className={styles.footerText}>
                            &copy; {new Date().getFullYear()} {isMounted ? schoolProfile.nama_sekolah : 'SIP SEKO'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
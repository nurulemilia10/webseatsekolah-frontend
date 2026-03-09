export default function Dashboard() {
  return (
    <>
      {/* Sidebar Minimalis */}
      <aside className="navbar navbar-vertical navbar-expand-lg border-end bg-white">
        <div className="container-fluid">
          <div className="navbar-brand mt-4 px-2">
             <div className="d-flex align-items-center">
                <div className="bg-primary text-white rounded-2 p-2 d-flex align-items-center justify-content-center" style={{ width: '35px', height: '35px' }}>
                   <i className="bi bi-book-half"></i>
                </div>
                <div className="ms-3">
                   <div className="fw-bold text-dark tracking-tight">SIP SEKO</div>
                   <div className="text-muted" style={{ fontSize: '10px' }}>Admin Panel</div>
                </div>
             </div>
          </div>
          
          <div className="collapse navbar-collapse show mt-4">
            <ul className="navbar-nav">
              <li className="nav-item px-3 mb-1">
                <a className="nav-link fw-semibold text-primary bg-primary-lt rounded-2 px-3" href="/">
                  <i className="bi bi-house-door me-2"></i> Dashboard
                </a>
              </li>
              <li className="nav-item px-3 mb-1">
                <a className="nav-link text-secondary px-3" href="/siswa">
                  <i className="bi bi-people me-2"></i> Data Siswa
                </a>
              </li>
              <li className="nav-item px-3 mb-1">
                <a className="nav-link text-secondary px-3" href="/guru">
                  <i className="bi bi-person-badge me-2"></i> Data Guru
                </a>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Konten Utama */}
      <div className="page-wrapper bg-white">
        <div className="page-header d-print-none">
          <div className="container-xl pt-5">
            <div className="row align-items-center">
              <div className="col">
                <h2 className="fw-bold text-dark mb-1">Ringkasan Data</h2>
                <p className="text-muted small">Halo Nurul, selamat memantau perkembangan sekolah.</p>
              </div>
              <div className="col-auto">
                 <button className="btn btn-dark btn-sm rounded-2 shadow-sm">
                    <i className="bi bi-download me-2"></i> Cetak Laporan
                 </button>
              </div>
            </div>
          </div>
        </div>

        <div className="page-body">
          <div className="container-xl">
            <div className="row g-4">
              
              {/* Card Siswa */}
              <div className="col-md-4">
                <div className="card border-0 shadow-sm bg-light-subtle rounded-3">
                  <div className="card-body p-4 text-center">
                    <div className="text-muted small fw-bold text-uppercase mb-2 tracking-wider">Total Siswa</div>
                    <div className="h1 fw-bold text-dark mb-0">1,250</div>
                  </div>
                </div>
              </div>

              {/* Card Guru */}
              <div className="col-md-4">
                <div className="card border-0 shadow-sm bg-light-subtle rounded-3">
                  <div className="card-body p-4 text-center">
                    <div className="text-muted small fw-bold text-uppercase mb-2 tracking-wider">Guru Aktif</div>
                    <div className="h1 fw-bold text-dark mb-0">85</div>
                  </div>
                </div>
              </div>

              {/* Card Kelas */}
              <div className="col-md-4">
                <div className="card border-0 shadow-sm bg-light-subtle rounded-3">
                  <div className="card-body p-4 text-center">
                    <div className="text-muted small fw-bold text-uppercase mb-2 tracking-wider">Ruang Kelas</div>
                    <div className="h1 fw-bold text-dark mb-0">32</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
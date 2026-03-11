'use client';

export default function Dashboard() {
  return (
    <>
      {/* Sidebar Minimalis */}
      <aside className="navbar navbar-vertical navbar-expand-lg border-end bg-white">
        <div className="container-fluid">
          <div className="navbar-brand mt-4 px-2">
            <div className="d-flex align-items-center">
              {/* Gunakan class 'brand-icon-box' */}
              <div className="bg-primary text-white rounded-2 p-2 d-flex align-items-center justify-content-center brand-icon-box">
                <i className="bi bi-book-half"></i>
              </div>
              <div className="ms-3">
                <div className="fw-bold text-dark tracking-tight">SIP SEKO</div>
                {/* Gunakan class 'admin-panel-text' */}
                <div className="text-muted admin-panel-text">Admin Panel</div>
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

      {/* Konten Utama tetap sama ... */}
      <div className="page-wrapper bg-white">
        {/* ... bagian konten lainnya ... */}
      </div>
    </>
  );
}
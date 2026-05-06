'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiMenu, FiX, FiHome, FiList, FiCheckSquare, FiLogOut, FiBell, FiBarChart2 } from 'react-icons/fi';
import './dashboard_shared.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();

  const closeSidebar = () => setIsSidebarOpen(false);

  const getInitial = (name: string) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    router.push('/');
  };

  // useEffect ini HANYA jalan di Client setelah render pertama
  useEffect(() => {
    setMounted(true);
    
    const session = localStorage.getItem('userSession');
    if (session) {
      setUserData(JSON.parse(session));
    }
  }, []);

return (
    <>
      {!mounted ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      ) : (
        <div className="dashboard-wrapper">
          {/* Overlay untuk Mobile */}
          {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

          {/* SIDEBAR */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/images/logo_tkp.png" alt="Logo" />
            <span>E-Monitoring</span>
          </div>
          <button className="close-menu" onClick={closeSidebar}><FiX /></button>
        </div>
        
        <nav className="sidebar-nav">
          <Link href="/dashboard_g" className={`nav-item ${pathname === '/dashboard' ? 'active' : ''}`} onClick={closeSidebar}>
            <FiHome /> Dashboard
          </Link>
          <Link href="/dashboard_g/daftarKelas" className={`nav-item ${pathname === '/dashboard_g/daftarKelas' ? 'active' : ''}`} onClick={closeSidebar}>
            <FiList /> Daftar Kelas
          </Link>
          <Link href="/dashboard_g/absensi" className={`nav-item ${pathname === '/dashboard_g/absensi' ? 'active' : ''}`} onClick={closeSidebar}>
            <FiCheckSquare /> Absensi Murid
          </Link>
          <Link href="/dashboard_g/mapel" className={`nav-item ${pathname === '/dashboard_g/mapel' ? 'active' : ''}`} onClick={closeSidebar}>
            <FiList /> Mata Pelajaran
          </Link>
          <Link href="/dashboard_g/presentasi" className={`nav-item ${pathname === '/dashboard_g/presentasi' ? 'active' : ''}`} onClick={closeSidebar}>
            <FiBarChart2 /> Presentasi
          </Link>
        </nav>

        <div className="sidebar-footer">
          <Link href="/login" className="logout-btn">
            <FiLogOut /> Keluar
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        <header className="navbar">
          <div className="navbar-left">
            <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <FiMenu />
            </button>
            <span className="navbar-title">Portal Guru</span>
          </div>
          <div className="nav-right">
            <div className="profile-wrapper" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <span className="profile-name">{userData?.nama || 'Guru'}</span>
              
              {/* Logika Inisial Nama */}
              {userData?.foto_url ? (
                <img src={userData.foto_url} className="profile-avatar" alt="User" />
              ) : (
                <div className="profile-initial">
                  {getInitial(userData?.nama)}
                </div>
              )}
              
              {isDropdownOpen && (
                <div className="profile-dropdown-box">
                  <Link 
                    href="/dashboard_g/profile"
                    className="profile-brief-info" 
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <p><strong>{userData?.nama}</strong></p>
                    <p className="role-text">{userData?.role}</p>
                    <span style={{ fontSize: '10px', color: '#4f46e5' }}>Edit Profil →</span>
                  </Link>
                  <hr />
                  <button onClick={handleLogout} className="logout-btn">Keluar</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="content-container">
          {children}
        </section>
      </main>
    </div>
      )}
    </>
  );
}

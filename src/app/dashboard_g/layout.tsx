'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  FiMenu, FiX, FiHome, FiList, FiCheckSquare, 
  FiLogOut, FiBarChart2, FiUser, FiBookOpen 
} from 'react-icons/fi';
import './dashboard_shared.css'; 

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeSidebar = () => setIsSidebarOpen(false);

 // Fungsi Logout
  const handleLogout = () => {
    const confirmLogout = window.confirm("Apakah anda yakin ingin keluar?");
    
    if (confirmLogout) {
      localStorage.removeItem('userSession'); // Hapus data session
      // Pindah ke halaman utama dengan tambahan query string ?auth=required
      router.push('/?auth=required'); 
    }
  };

  const syncUserData = async (sessionData: any) => {
    try {
      const role = sessionData.role?.toLowerCase();
      const isWalas = role === 'walas';
      const tableTarget = isWalas ? 'walas' : 'guru';
      const idColumn = isWalas ? 'walasId' : 'guruId';

      const { data, error } = await supabase
        .from(tableTarget)
        .select('foto_url, nama, nip, email')
        .eq(idColumn, sessionData.id)
        .single();

      if (error) throw error;

      if (data) {
        const updatedData = { ...sessionData, ...data };
        if (JSON.stringify(updatedData) !== JSON.stringify(sessionData)) {
          setUserData(updatedData);
          localStorage.setItem('userSession', JSON.stringify(updatedData));
        }
      }
    } catch (err) {
      console.error("Sync Error:", err);
    }
  };

  useEffect(() => {
    setMounted(true);
    const session = localStorage.getItem('userSession');
    if (session) {
      const parsedUser = JSON.parse(session);
      setUserData(parsedUser);
      syncUserData(parsedUser);
    } else {
      router.push('/');
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [router]);

  const renderNavigation = () => {
    const role = userData?.role?.toLowerCase();
    if (role === 'walas') {
      return (
        <>
          <Link href="/dashboard_w" className={`nav-item ${pathname === '/dashboard_w' ? 'active' : ''}`} onClick={closeSidebar}>
            <FiHome /> Dashboard Walas
          </Link>
          <Link href="/dashboard_w/daftarSiswa" className={`nav-item ${pathname.includes('daftarSiswa') ? 'active' : ''}`} onClick={closeSidebar}>
            <FiUser /> Daftar Siswa
          </Link>
          <Link href="/dashboard_w/rekapAbsensi" className={`nav-item ${pathname.includes('rekapAbsensi') ? 'active' : ''}`} onClick={closeSidebar}>
            <FiBarChart2 /> Rekap Kelas
          </Link>
        </>
      );
    } else {
      return (
        <>
          <Link href="/dashboard_g" className={`nav-item ${pathname === '/dashboard_g' ? 'active' : ''}`} onClick={closeSidebar}>
            <FiHome /> Dashboard Guru
          </Link>
          
          <Link href="/dashboard_g/daftarKelas" className={`nav-item ${pathname.includes('daftarKelas') ? 'active' : ''}`} onClick={closeSidebar}>
            <FiList /> Daftar Sesi
          </Link>
          <Link href="/dashboard_g/absensi" className={`nav-item ${pathname.includes('absensi') ? 'active' : ''}`} onClick={closeSidebar}>
            <FiCheckSquare /> Absensi Murid
          </Link>
          
          <Link href="/dashboard_g/presentasi" className={`nav-item ${pathname.includes('presentasi') ? 'active' : ''}`} onClick={closeSidebar}>
            <FiBarChart2 /> Presentasi 
          </Link>
        </>
      );
    }
  };

  if (!mounted) return null;

  return (
    <div className="dashboard-wrapper">
      {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/images/logo_tkp.png" alt="Logo" />
            <span>E-Monitoring</span>
          </div>
          <button className="close-menu" onClick={closeSidebar}><FiX /></button>
        </div>
        
        <nav className="sidebar-nav">
          {renderNavigation()}
        </nav>

        <div className="sidebar-footer">
          <div className="logout-container-sidebar">
            {/* Memanggil handleLogout yang sudah ada alert-nya */}
            <button onClick={handleLogout} className="logout-btn-sidebar">
              <FiLogOut /> <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="navbar">
          <div className="navbar-left">
            <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <FiMenu />
            </button>
            <span className="navbar-title">
              {userData?.role === 'Walas' ? 'Portal Wali Kelas' : 'Portal Guru'}
            </span>
          </div>

          <div className="nav-right">
            <div className="header-right">
              <div className="user-profile" onClick={() => setShowPopup(!showPopup)}>
                <span className="user-name">{userData?.nama}</span>
                <div className="user-avatar">
                  {userData?.foto_url && userData?.foto_url !== 'EMPTY' ? (
                    <img src={userData.foto_url} alt="PP" />
                  ) : (
                    <div className="initials">{userData?.nama?.charAt(0)}</div>
                  )}
                </div>

                {/* POP UP MENU - TAMBAHKAN LINK DI SINI */}
                {showPopup && (
                  <div className="profile-popup">
                    <div className="popup-body">
                      <div className="popup-user-detail">
                        <strong>{userData?.nama}</strong>
                        <p>{userData?.role}</p>
                      </div>
                      <hr />
                      
                      {/* LINK MENU PROFILE YANG KAMU MINTA */}
                      <Link href="/dashboard_g/profile" className="popup-item" onClick={() => setShowPopup(false)}>
                         👤 Edit Profil
                      </Link>
                      
                      <button onClick={handleLogout} className="popup-item btn-keluar">
                        <span className="icon-exit">🚪</span> Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <section className="content-container">
          {children}
        </section>
      </main>
    </div>
  );
}
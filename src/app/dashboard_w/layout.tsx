'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  FiMenu, FiX, FiHome, FiList, FiCheckSquare, 
  FiLogOut, FiBarChart2, FiUser 
} from 'react-icons/fi';
import './walas.css'; 

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    if (window.confirm("Apakah anda yakin ingin keluar?")) {
      localStorage.removeItem('userSession');
      router.push('/?auth=required'); 
    }
  };

  // FUNGSI SYNC YANG DIPERBAIKI
  const syncUserData = async (sessionData: any) => {
    // Validasi: Jangan jalankan jika sessionData kosong atau tidak punya ID
    if (!sessionData || !sessionData.id) {
      console.warn("Sync dibatalkan: Data sesi tidak valid.");
      return;
    }

    try {
      const role = sessionData.role?.toLowerCase();
      const tableTarget = role === 'walas' ? 'walas' : 'guru';
      const idColumn = role === 'walas' ? 'walasId' : 'guruId';

      const { data, error } = await supabase
        .from(tableTarget)
        .select('foto_url, nama, nip, email')
        .eq(idColumn, sessionData.id)
        .maybeSingle(); // Menggunakan maybeSingle agar tidak throw error jika data 0

      if (error) {
        console.error("Supabase Sync Error:", error.message);
        return;
      }

      if (data) {
        const updatedData = { ...sessionData, ...data };
        // Hanya update localStorage jika ada perubahan nyata
        if (JSON.stringify(updatedData) !== JSON.stringify(sessionData)) {
          setUserData(updatedData);
          localStorage.setItem('userSession', JSON.stringify(updatedData));
          console.log("Data user berhasil disinkronisasi.");
        }
      }
    } catch (err) {
      // Ini yang menyebabkan pesan "Gagal sinkronisasi data: {}"
      console.error("Gagal sinkronisasi data:", err);
    }
  };

  useEffect(() => {
    setMounted(true);
    const session = localStorage.getItem('userSession');
    
    if (session) {
      try {
        const parsedUser = JSON.parse(session);
        setUserData(parsedUser);
        // Jalankan sinkronisasi data terbaru dari DB
        syncUserData(parsedUser);
      } catch (e) {
        console.error("Gagal membaca session:", e);
        router.push('/');
      }
    } else {
      router.push('/');
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []); // Dependensi kosong agar hanya jalan sekali saat mount

  if (!mounted) return null;

  // Path dinamis untuk Edit Profil
  const profilePath = userData?.role?.toLowerCase() === 'walas' ? '/dashboard_w/profile' : '/dashboard_g/profile';

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
          {userData?.role?.toLowerCase() === 'walas' ? (
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
          ) : (
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
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn-sidebar">
            <FiLogOut /> <span>Keluar</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="navbar">
          <div className="navbar-left">
            <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <FiMenu />
            </button>
            <span className="navbar-title">
              {userData?.role?.toLowerCase() === 'walas' ? 'Portal Wali Kelas' : 'Portal Guru'}
            </span>
          </div>

          <div className="nav-right" ref={profileRef}>
            <div className="user-profile" onClick={() => setShowPopup(!showPopup)}>
              <span className="user-name">{userData?.nama || 'User'}</span>
              <div className="user-avatar">
                {userData?.foto_url && userData?.foto_url !== 'EMPTY' ? (
                  <img src={userData.foto_url} alt="PP" />
                ) : (
                  <div className="initials">{userData?.nama?.charAt(0) || 'U'}</div>
                )}
              </div>

              {showPopup && (
                <div className="profile-popup">
                  <div className="popup-body">
                    <div className="popup-user-detail">
                      <strong>{userData?.nama}</strong>
                      <p>{userData?.role}</p>
                    </div>
                    <hr />
                    <Link href={profilePath} className="popup-item" onClick={() => setShowPopup(false)}>
                      👤 Profil
                    </Link>
                    <button onClick={handleLogout} className="popup-item btn-keluar">
                      🚪 Keluar
                    </button>
                  </div>
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
  );
}
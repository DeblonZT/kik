'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FiMenu, 
  FiX, 
  FiHome, 
  FiList, 
  FiCheckSquare, 
  FiLogOut, 
  FiBell 
} from 'react-icons/fi'; // Install dulu: npm install react-icons
import './dashboard_g.css';

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fungsi untuk menutup sidebar saat menu di HP diklik
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="dashboard-wrapper">
      
      {/* 1. SIDEBAR OVERLAY (Untuk HP) */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      {/* 2. SIDEBAR */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/images/logo_tkp.png" alt="Logo" />
            <span>E-Monitoring</span>
          </div>
          <button className="close-menu" onClick={closeSidebar}><FiX /></button>
        </div>
        
        <nav className="sidebar-nav">
          <Link href="/dashboard" className="nav-item active" onClick={closeSidebar}><FiHome /> Dashboard</Link>
          <Link href="/daftarKelas" className="nav-item" onClick={closeSidebar}><FiList /> Daftar Kelas</Link>
          <Link href="/dashboard/absensi" className="nav-item" onClick={closeSidebar}><FiCheckSquare /> Absensi Murid</Link>
        </nav>

        <div className="sidebar-footer">
          <Link href="/login" className="logout-btn">
            <FiLogOut /> Keluar
          </Link>
        </div>
      </aside>

      {/* 3. MAIN CONTENT */}
      <main className="main-content">
        
        {/* TOP NAVBAR */}
        <header className="navbar">
          <div className="navbar-left">
            {/* Tombol Hamburger (Muncul hanya di HP) */}
            <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <FiMenu />
            </button>
            <span className="navbar-title">Portal Guru</span>
          </div>
          <div className="user-info">
            <div className="icon-badge"><FiBell /></div>
            <div className="profile">
              <div className="avatar">AD</div>
            </div>
          </div>
        </header>

        {/* CONTENT AREA (Hanya Welcome & Shortcut) */}
        <div className="content-inner minimal-content">
          
          <div className="welcome-section">
            <h1 className="welcome-heading">Selamat Datang, Bapak/Ibu Guru!</h1>
            <p className="welcome-subheading">Silakan pilih menu di bawah untuk memulai aktivitas.</p>
          </div>

          {/* SHORTCUT GRID (Bumbu CSS Modern) */}
          <div className="shortcut-grid">
            <Link href="/daftarKelas" className="shortcut-card card-blue">
              <div className="card-icon"><FiList /></div>
              <div className="card-info">
                <h3>Daftar Kelas</h3>
                <p>Lihat dan kelola data kelas Anda</p>
              </div>
            </Link>

            <Link href="/dashboard/absensi" className="shortcut-card card-green">
              <div className="card-icon"><FiCheckSquare /></div>
              <div className="card-info">
                <h3>Absensi Murid</h3>
                <p>Mulai mengabsensi murid hari ini</p>
              </div>
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
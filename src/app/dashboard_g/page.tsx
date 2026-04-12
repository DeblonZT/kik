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
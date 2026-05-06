'use client';
import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import './walas.css';

export default function WalasLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [walasName, setWalasName] = useState('');

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (session) {
      const user = JSON.parse(session);
      setWalasName(user.nama);
    } else {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="dashboard-container">
      <aside className="sidebar-main">
        <div className="brand-section">
          <img src="/images/logo_tkp.png" alt="Logo" width={35} />
          <span className="brand-name">E-Monitoring</span>
        </div>
        
        <nav className="nav-menu">
          <Link href="/dashboard_w" className={`nav-link ${pathname === '/dashboard_w' ? 'active' : ''}`}>Dashboard</Link>
          <Link href="/dashboard_w/rekapAbsensi" className={`nav-link ${pathname === '/dashboard_w/rekapAbsensi' ? 'active' : ''}`}>Rekap Absensi</Link>
          <Link href="/dashboard_w/daftarSiswa" className={`nav-link ${pathname === '/dashboard_w/daftarSiswa' ? 'active' : ''}`}>Daftar Siswa</Link>
          
         
        </nav>

        <div className="logout-area">
          <button onClick={() => {localStorage.clear(); router.push('/')}} className="btn-logout">Keluar</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-nav">
          <span style={{fontWeight: 600, color: '#64748b'}}>Portal Wali Kelas</span>
          <div className="user-box">
            <span style={{fontSize: '0.9rem', color: '#64748b'}}>{walasName}</span>
            <div className="avatar">{walasName?.charAt(0).toUpperCase()}</div>
          </div>
        </header>
        
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  );
}
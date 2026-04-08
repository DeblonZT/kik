'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import './admin.css'; // Pastikan nama file CSS sesuai

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentImg, setCurrentImg] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const images = [
    "https://images.pexels.com/videos/6790697/artisan-arts-and-crafts-at-work-business-6790697.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    "https://images.pexels.com/photos/5691639/pexels-photo-5691639.jpeg?_gl=1*1e9nxk2*_ga*MTUxODg4NTIwNi4xNzcxOTkxMjg1*_ga_8JE65Q40S6*czE3NzE5OTEyODQkbzEkZzEkdDE3NzE5OTEzMjIkajIyJGwwJGgw",
    "https://images.pexels.com/photos/5493654/pexels-photo-5493654.jpeg?_gl=1*1g67tsb*_ga*MTUxODg4NTIwNi4xNzcxOTkxMjg1*_ga_8JE65Q40S6*czE3NzE5OTEyODQkbzEkZzEkdDE3NzE5OTEzMjIkajIyJGwwJGgw"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % images.length);
    }, 1000); // Ganti tiap 1 detik sesuai permintaan
    return () => clearInterval(timer);
  }, [images.length]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/dashboard');
      } else {
        setError('Username atau Password Admin salah!');
      }
    } catch (err) {
      setError('Gagal terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <div className="split-container">
        
        {/* SISI KIRI: FORM */}
        <div className="form-side">
          <div className="form-content">
            <h2 className="login-title">Admin Login</h2>
            
            {error && <p style={{color: 'red', fontSize: '13px', marginBottom: '15px'}}>{error}</p>}

            <form className="login-form" onSubmit={handleLogin}>
              <div className="input-group">
                <label className="input-label">Username Admin</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="form-input"
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="form-input"
                  required
                />
              </div>

              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Continue'}
              </button>
            </form>

            <p className="footer-link">
              Bukan Admin? <Link href="/login">Login Guru</Link>
            </p>
          </div>
        </div>

        {/* SISI KANAN: SLIDESHOW (Logo di luar map agar stabil) */}
        <div className="image-side">
          {images.map((img, index) => (
            <div
              key={index}
              className={`slide-img ${index === currentImg ? 'active' : ''}`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
          
          {/* OVERLAY & LOGO (Diletakkan di luar loop gambar) */}
           <div className="overlay">
                <div className="logo-container">
                  <img src="/images/logo_tkp.png" alt="Logo TKPK" style={{width: '150px'}} />
                </div>
                <p className="trusted-text">SMK Negeri 1 Cibinong</p>
              </div>
            </div>
        </div>
    </div>
  );
}
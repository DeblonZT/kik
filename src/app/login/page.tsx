'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import './login.css';

interface UserData {
  guruId?: number;
  walasId?: number;
  kelasId?: number;
  nama: string;
  pw: string;
}

export default function Home() {
  const router = useRouter();
  const [role, setRole] = useState<'produktif' | 'walas'>('produktif');
  const [selectedGuru, setSelectedGuru] = useState('');
  const [password, setPassword] = useState('');
  const [currentImg, setCurrentImg] = useState(0);

  const [listGuruDB, setListGuruDB] = useState<UserData[]>([]);
  const [listWalasDB, setListWalasDB] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const images = [
    "https://images.pexels.com/videos/6790697/artisan-arts-and-crafts-at-work-business-6790697.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    "https://images.pexels.com/photos/5691639/pexels-photo-5691639.jpeg",
    "https://images.pexels.com/photos/5493654/pexels-photo-5493654.jpeg"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [resGuru, resWalas] = await Promise.all([
          supabase.from('guru').select('guruId, nama, pw'),
          supabase.from('walas').select('walasId, nama, pw, kelasId')
        ]);
        setListGuruDB(resGuru.data || []);
        setListWalasDB(resWalas.data || []);
      } catch (error) {
        console.error("Gagal memuat data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const targetList = role === 'produktif' ? listGuruDB : listWalasDB;
    const user = targetList.find((u) => u.nama === selectedGuru);

    if (user && String(user.pw) === password) {
      alert(`Login Berhasil sebagai ${role}!`);
      localStorage.setItem('userSession', JSON.stringify({
        id: user.guruId || user.walasId,
        nama: user.nama,
        role: role,
        kelasId: user.kelasId
      }));
      router.push(role === 'produktif' ? '/dashboard_g' : '/dashboard_w');
    } else {
      alert('Nama atau Password salah!');
    }
  };

  return (
    <div className="main-wrapper">
      <div className="split-container">
        <div className="form-side">
          <div className="form-content">
            <h2 className="login-title">Log in</h2>
            <div className="tab-container">
              <button type="button" className={`tab-button ${role === 'produktif' ? 'active' : ''}`} onClick={() => setRole('produktif')}>
                Guru Produktif
              </button>
              <button type="button" className={`tab-button ${role === 'walas' ? 'active' : ''}`} onClick={() => setRole('walas')}>
                Walas
              </button>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
              <div className="input-group">
                <label className="input-label">Nama {role === 'produktif' ? 'Guru' : 'Walas'}</label>
                <select value={selectedGuru} onChange={(e) => setSelectedGuru(e.target.value)} className="form-input" required>
                  <option value="">{isLoading ? 'Memuat...' : `Pilih Nama`}</option>
                  {(role === 'produktif' ? listGuruDB : listWalasDB).map((item, i) => (
                    <option key={i} value={item.nama}>{item.nama}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" placeholder="Masukkan password" required />
              </div>

              <button type="submit" className="submit-button">Continue</button>
            </form>

            <p className="footer-link">
              Bukan Walas / Guru Produktif? <Link href="/admin" className="admin-nav-link">Login Admin</Link>
            </p>
          </div>
        </div>

        <div className="image-side">
          {images.map((img, index) => (
            <div key={index} className={`slide-img ${index === currentImg ? 'active' : ''}`} style={{ backgroundImage: `url(${img})` }}>
              <div className="overlay">
                <img src="/images/logo_tkp.png" alt="Logo" style={{ width: '150px' }} />
                <p className="trusted-text">SMK Negeri 1 Cibinong</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
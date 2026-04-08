'use client';
// Tambahkan baris ini di bagian atas impor
import {supabase} from '@/lib/supabase'; // Sesuaikan path-nya dengan folder lib Anda
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import './login.css';

interface UserData {
  id: number;
  nama: string;
  pw: string;
}

export default function Home() {
  const router = useRouter();
  const [role, setRole] = useState<'produktif' | 'walas'>('produktif');
  const [selectedGuru, setSelectedGuru] = useState('');
  const [password, setPassword] = useState('');
  const [currentImg, setCurrentImg] = useState(0);
  
  // State untuk data dari database
  const [listGuruDB, setListGuruDB] = useState<UserData[]>([]);
  const [listWalasDB, setListWalasDB] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const images = [
    "https://images.pexels.com/videos/6790697/artisan-arts-and-crafts-at-work-business-6790697.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    "https://images.pexels.com/photos/5691639/pexels-photo-5691639.jpeg?_gl=1*1e9nxk2*_ga*MTUxODg4NTIwNi4xNzcxOTkxMjg1*_ga_8JE65Q40S6*czE3NzE5OTEyODQkbzEkZzEkdDE3NzE5OTEzMjIkajIyJGwwJGgw",
    "https://images.pexels.com/photos/5493654/pexels-photo-5493654.jpeg?_gl=1*1g67tsb*_ga*MTUxODg4NTIwNi4xNzcxOTkxMjg1*_ga_8JE65Q40S6*czE3NzE5OTEyODQkbzEkZzEkdDE3NzE5OTEzMjIkajIyJGwwJGgw"
  ];

  useEffect(() => {
  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Kita ambil data dari dua tabel berbeda secara paralel
      const [resGuru, resWalas] = await Promise.all([
        supabase.from('guru').select('id, nama, pw'),
        supabase.from('walas').select('id, nama, pw')
      ]);

      // Cek apakah ada error di salah satu request
      if (resGuru.error) throw resGuru.error;
      if (resWalas.error) throw resWalas.error;

      // Masukkan ke state masing-masing
      setListGuruDB(resGuru.data || []);
      setListWalasDB(resWalas.data || []);

    } catch (error: any) {
      console.error("Gagal mengambil data dari Supabase:", error.message || error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();

  // Logic slideshow tetap sama...
  const timer = setInterval(() => {
    setCurrentImg((prev) => (prev + 1) % images.length);
  }, 3000);
  return () => clearInterval(timer);
}, [images.length]);

  // Logic Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Tentukan list mana yang dicari berdasarkan role yang aktif
    const targetList = role === 'produktif' ? listGuruDB : listWalasDB;
    const user = targetList.find((u) => u.nama === selectedGuru);

    if (user) {
      if (user.pw === password) {
        alert(`Login Berhasil sebagai ${role}!`);
        router.push('/dashboard_g');
      } else {
        alert('Password salah!');
      }
    } else {
      alert('Nama tidak ditemukan di database!');
    }
  };

  const handleTabChange = (newRole: 'produktif' | 'walas') => {
    setRole(newRole);
    setSelectedGuru('');
    setPassword('');
  };

  return (
    <div className="main-wrapper">
      <div className="split-container">
        <div className="form-side">
          <div className="form-content">
            <h2 className="login-title">Log in</h2>

            <div className="tab-container">
              <button 
                type="button"
                className={`tab-button ${role === 'produktif' ? 'active' : ''}`}
                onClick={() => handleTabChange('produktif')}
              >
                Guru Produktif
              </button>
              <button 
                type="button"
                className={`tab-button ${role === 'walas' ? 'active' : ''}`}
                onClick={() => handleTabChange('walas')}
              >
                Walas
              </button>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
              <div className="input-group">
                <label className="input-label">Nama {role === 'produktif' ? 'Guru' : 'Walas'}</label>
                <select
                  value={selectedGuru}
                  onChange={(e) => setSelectedGuru(e.target.value)}
                  className="form-input"
                  required
                  disabled={isLoading}
                >
                  <option value="" disabled hidden>
                    {isLoading ? 'Memuat data...' : `Pilih Nama ${role === 'produktif' ? 'Guru' : 'Walas'}`}
                  </option>
                  
                  {/* Menampilkan list sesuai role yang dipilih */}
                  {(role === 'produktif' ? listGuruDB : listWalasDB).map((item) => (
                    <option key={item.id} value={item.nama}>
                      {item.nama}
                    </option>
                  ))}
                </select>
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

              <button type="submit" className="submit-button">Continue</button>
            </form>

           
          </div>
        </div>

        <div className="image-side">
          {images.map((img, index) => (
            <div
              key={index}
              className={`slide-img ${index === currentImg ? 'active' : ''}`}
              style={{ backgroundImage: `url(${img})` }}
            >
              <div className="overlay">
                <div className="logo-container">
                  <img src="/images/logo_tkp.png" alt="Logo TKPK" style={{width: '150px'}} />
                </div>
                <p className="trusted-text">SMK Negeri 1 Cibinong</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import './mapel.css';

export default function KelolaMapel() {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [mapelList, setMapelList] = useState<any[]>([]);
  const [newMapel, setNewMapel] = useState('');

  // useEffect ini HANYA jalan di browser (Client-side)
  useEffect(() => {
    setHasMounted(true);
    
    // Pindahkan logika pembacaan localStorage ke sini
    const session = localStorage.getItem('userSession');
    if (!session) {
      alert("Sesi habis atau Anda belum login!");
      router.push('/');
      return;
    }
    
    const parsedUser = JSON.parse(session);
    setUserData(parsedUser);
    
    // Panggil fetch setelah userData berhasil didapatkan
    if (parsedUser.id) {
      fetchMyMapel(parsedUser.id);
    }
  }, [router]);

  // 1. Fungsi untuk mengambil data (dengan parameter idGuru)
  const fetchMyMapel = async (idGuru: number) => {
    const { data, error } = await supabase
      .from('mapel')
      .select('*')
      .eq('guruId', idGuru); // Filter agar hanya mapel milik guru ini yang muncul

    if (error) {
      console.error("Gagal ambil mapel:", error.message);
    } else {
      setMapelList(data || []);
    }
  };

  // 2. Fungsi Tombol Tambah
  const handleAddMapel = async () => {
    // Validasi: input tidak boleh kosong dan user harus sudah login
    if (!newMapel.trim() || !userData?.id) {
      alert("Masukkan nama mata pelajaran terlebih dahulu!");
      return;
    }

    const { error } = await supabase
      .from('mapel')
      .insert([
        { 
          nama_mapel: newMapel, 
          guruId: userData.id // Hubungkan mapel dengan guru yang sedang login
        }
      ]);
    
    if (error) {
      alert("Gagal tambah mapel: " + error.message);
    } else {
      setNewMapel(''); // Kosongkan input setelah berhasil
      fetchMyMapel(userData.id); // Refresh daftar secara otomatis
    }
  };

  // Jika belum mounted (masih proses server-side), tampilkan loading atau null
  if (!hasMounted) {
    return <div className="page-content-inner">Loading...</div>;
  }

  return (
    <div className="page-content-inner">
      <h2 className="section-heading">Mata Pelajaran Saya</h2>
      <div className="table-card">
        <div className="mapel-input-section">
          <input 
            type="text" 
            placeholder="Contoh: Dasar-Dasar TKP"
            value={newMapel}
            onChange={(e) => setNewMapel(e.target.value)}
            className="filter-select"
          />
          <button className="btn-primary" onClick={handleAddMapel}>Tambah</button>
        </div>

        <div className="mapel-container">
          {mapelList.length === 0 ? (
            <div className="empty-state">
              <p>Belum ada mata pelajaran. Silakan tambah di atas.</p>
            </div>
          ) : (
            <div className="mapel-grid">
              {mapelList.map((m) => (
                <div key={m.mapelId} className="stat-card">
                  <span className="stat-label">{m.nama_mapel}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
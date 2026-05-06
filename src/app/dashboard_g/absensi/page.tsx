'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FiCheckCircle, FiSave } from 'react-icons/fi';
import './absensi.css';

export default function AbsensiMurid() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [listSesi, setListSesi] = useState<any[]>([]);
  const [selectedSesi, setSelectedSesi] = useState('');
  const [dataAbsensi, setDataAbsensi] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);

    const session = localStorage.getItem('userSession');
    if (!session) {
      alert("Sesi habis atau Anda belum login!");
      router.push('/');
      return;
    }
    
    const parsedUser = JSON.parse(session);
    setUserData(parsedUser);

    // Jalankan fetchSesi dengan ID dari user yang login
    if (parsedUser.id) {
      fetchSesi(parsedUser.id);
    }
  }, [router]);

  // Ambil daftar sesi yang tersedia hanya untuk guru yang sedang login
  async function fetchSesi(idGuru: number) {
    const { data, error } = await supabase
      .from('sesi')
      .select('*, kelas(nama_kelas), mapel(nama_mapel)')
      .eq('guruId', idGuru) // Filter agar hanya muncul sesi milik guru ini
      .order('tanggal', { ascending: false });
      
    if (error) {
      console.error("Error fetch sesi:", error.message);
    } else {
      setListSesi(data || []);
    }
  }

  // Fungsi Snapshot: Terpanggil saat Sesi dipilih
 async function handleSesiChange(id: string) {
  setSelectedSesi(id);
  if (!id) {
    setDataAbsensi([]); // Kosongkan tabel jika tidak ada sesi dipilih
    return;
  }

  setLoading(true);

  // 1. Ambil data absensi yang sudah ada
  let { data: existingAbsensi } = await supabase
    .from('absensi')
    .select('*, siswa(nama_siswa)')
    .eq('sesiId', id);

  if (existingAbsensi && existingAbsensi.length > 0) {
    setDataAbsensi(existingAbsensi);
  } else {
    // 2. Jika KOSONG, lakukan SNAPSHOT
    // Cari detail sesi dari list yang sudah di-load di awal
   const sesiAktif = listSesi.find(s => String(s.sesiId).trim() === String(id).trim());

    // CEK DISINI: Pastikan sesiAktif tidak undefined
    if (!sesiAktif) {
      console.error("Sesi tidak ditemukan di listSesi");
      setLoading(false);
      return;
    }

    const { data: daftarSiswa } = await supabase
      .from('siswa')
      .select('*')
      .eq('kelasId', sesiAktif.kelasId); // Sekarang aman mengakses kelasId

    if (daftarSiswa && daftarSiswa.length > 0) {
      const payload = daftarSiswa.map(s => ({
        sesiId: id,
        siswaId: s.siswaId,
        status: 'Tanpa Keterangan'
      }));

      const { data: newAbsensi, error: insertError } = await supabase
        .from('absensi')
        .insert(payload)
        .select('*, siswa(nama_siswa)');
      
      if (newAbsensi) setDataAbsensi(newAbsensi);
      if (insertError) console.error("Gagal Snapshot:", insertError.message);
    } else {
      alert("Tidak ada siswa terdaftar di kelas ini.");
      setDataAbsensi([]);
    }
  }
  setLoading(false);
}

  // Update status di state lokal sebelum disimpan ke database
  const updateStatusLokal = (absensiId: string, statusBaru: string) => {
    setDataAbsensi(prev => prev.map(item => 
      item.absensiId === absensiId ? { ...item, status: statusBaru } : item
    ));
  };

  // Simpan semua perubahan ke Supabase
  const handleSimpanAbsensi = async () => {
    const promises = dataAbsensi.map(item => 
      supabase.from('absensi').update({ status: item.status }).eq('absensiId', item.absensiId)
    );
    
    await Promise.all(promises);
    alert("Absensi berhasil disimpan!");
  };

  // Jika belum mounted, tampilkan loading
  if (!mounted) {
    return <div className="page-content-inner"><p>Loading...</p></div>;
  }

  return (
    <>
      {!mounted ? (
        <div className="page-content-inner"><p>Loading...</p></div>
      ) : (
        <div className="page-content-inner">
          <h1 className="section-heading">Pelaksanaan Absensi</h1>

          {/* PILIH SESI */}
          <div className="table-card" style={{ marginBottom: '1.5rem' }}>
            <label>Pilih Sesi Pertemuan:</label>
            <select   
              className="filter-select" 
              style={{ width: '100%', marginTop: '8px' }}
              value={selectedSesi}
              onChange={(e) => handleSesiChange(e.target.value)}
            >
              <option value="">-- Pilih Sesi (Kelas - Tanggal - Keterangan) --</option>
              {listSesi.map(s => (
                <option key={s.sesiId} value={s.sesiId}>
                  {s.kelas?.nama_kelas || 'Tanpa Kelas'} | {s.tanggal} | {s.keterangan}
                </option>
              ))}
            </select>
          </div>

          {selectedSesi && (
            <>
              {/* RINGKASAN STATISTIK */}
              <div className="stat-grid">
                <div className="stat-card">
                  <p className="stat-label">Hadir</p>
                  <p className="stat-value">{dataAbsensi.filter(a => a.status === 'Hadir').length}</p>
                </div>
                <div className="stat-card">
                  <p className="stat-label">Izin/Sakit</p>
                  <p className="stat-value">{dataAbsensi.filter(a => ['Izin', 'Sakit'].includes(a.status)).length}</p>
                </div>
                <div className="stat-card">
                  <p className="stat-label">Tanpa Keterangan</p>
                  <p className="stat-value text-red">{dataAbsensi.filter(a => a.status === 'Tanpa Keterangan').length}</p>
                </div>
              </div>

              {/* TABEL ABSENSI */}
              <div className="table-card">
                <div className="header-with-btn">
                  <h3>Daftar Siswa</h3>
                  <button className="btn-primary" onClick={handleSimpanAbsensi}>
                    <FiSave /> Simpan Absensi
                  </button>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nama Siswa</th>
                      <th>Status Kehadiran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataAbsensi.map((item) => (
                      <tr key={item.absensiId}>
                        <td>{item.siswa?.nama_siswa}</td>
                        <td>
                          <select 
                            className={`status-select ${item.status.replace(' ', '-').toLowerCase()}`}
                            value={item.status}
                            onChange={(e) => updateStatusLokal(item.absensiId, e.target.value)}
                          >
                            <option value="Tanpa Keterangan">Tanpa Keterangan</option>
                            <option value="Hadir">Hadir</option>
                            <option value="Izin">Izin</option>
                            <option value="Sakit">Sakit</option>
                            <option value="Alpa">Alpa</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
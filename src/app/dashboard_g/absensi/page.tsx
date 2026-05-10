'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FiSave } from 'react-icons/fi';
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
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(session);
    setUserData(parsedUser);
    if (parsedUser.id) fetchSesi(parsedUser.id);
  }, [router]);

  async function fetchSesi(idGuru: number) {
    const { data } = await supabase
      .from('sesi')
      .select('*, kelas(nama_kelas), mapel(nama_mapel)')
      .eq('guruId', idGuru)
      .order('tanggal', { ascending: false });
    setListSesi(data || []);
  }

  // FUNGSI SORTING MANDIRI
  const sortDataSiswa = (array: any[]) => {
    return [...array].sort((a, b) => {
      const namaA = a.siswa?.nama_siswa?.toLowerCase() || "";
      const namaB = b.siswa?.nama_siswa?.toLowerCase() || "";
      return namaA.localeCompare(namaB);
    });
  };

  async function handleSesiChange(id: string) {
    setSelectedSesi(id);
    if (!id) {
      setDataAbsensi([]);
      return;
    }

    setLoading(true);

    // 1. Ambil data absensi yang sudah ada
    let { data: existingAbsensi } = await supabase
      .from('absensi')
      .select('*, siswa(nama_siswa)')
      .eq('sesiId', id);

    if (existingAbsensi && existingAbsensi.length > 0) {
      // PAKSA SORTING A-Z
      setDataAbsensi(sortDataSiswa(existingAbsensi));
    } else {
      // 2. Jika KOSONG, lakukan SNAPSHOT
      const sesiAktif = listSesi.find(s => String(s.sesiId) === String(id));
      if (!sesiAktif) {
        setLoading(false);
        return;
      }

      const { data: daftarSiswa } = await supabase
        .from('siswa')
        .select('*')
        .eq('kelasId', sesiAktif.kelasId);

      if (daftarSiswa && daftarSiswa.length > 0) {
        const payload = daftarSiswa.map(s => ({
          sesiId: id,
          siswaId: s.siswaId,
          status: 'Tanpa Keterangan'
        }));

        const { error: insertError } = await supabase.from('absensi').insert(payload);
        
        if (!insertError) {
          // Ambil ulang agar mendapatkan join nama_siswa untuk di-sort
          const { data: freshData } = await supabase
            .from('absensi')
            .select('*, siswa(nama_siswa)')
            .eq('sesiId', id);
          
          if (freshData) setDataAbsensi(sortDataSiswa(freshData));
        }
      }
    }
    setLoading(false);
  }

  const updateStatusLokal = (absensiId: string, statusBaru: string) => {
    setDataAbsensi(prev => prev.map(item => 
      item.absensiId === absensiId ? { ...item, status: statusBaru } : item
    ));
  };

  const handleSimpanAbsensi = async () => {
    const promises = dataAbsensi.map(item => 
      supabase.from('absensi').update({ status: item.status }).eq('absensiId', item.absensiId)
    );
    await Promise.all(promises);
    alert("Absensi berhasil disimpan!");
  };

  if (!mounted) return null;

  return (
    <div className="page-content-inner">
      <h1 className="section-heading">Portal Guru - Input Absensi</h1>

      <div className="table-card" style={{ marginBottom: '1.5rem' }}>
        <label>Pilih Sesi Pertemuan:</label>
        <select 
          className="filter-select" 
          style={{ width: '100%', marginTop: '8px' }}
          value={selectedSesi}
          onChange={(e) => handleSesiChange(e.target.value)}
        >
          <option value="">-- Pilih Sesi --</option>
          {listSesi.map(s => (
            <option key={s.sesiId} value={s.sesiId}>
              {s.kelas?.nama_kelas} | {s.tanggal} | {s.keterangan}
            </option>
          ))}
        </select>
      </div>

      {selectedSesi && (
        <div className="table-card">
          <div className="header-with-btn">
            <h3>Daftar Siswa</h3>
            <button className="btn-primary" onClick={handleSimpanAbsensi}>
              <FiSave /> Simpan Perubahan
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>NAMA SISWA</th>
                <th style={{ textAlign: 'center' }}>STATUS KEHADIRAN</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={2}>Mengambil data...</td></tr>
              ) : (
                dataAbsensi.map((item) => (
                  <tr key={item.absensiId}>
                    <td style={{ fontWeight: '500', textTransform: 'uppercase' }}>
                      {item.siswa?.nama_siswa}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <select 
                        className={`status-select ${item.status.replace(/\s+/g, '-').toLowerCase()}`}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
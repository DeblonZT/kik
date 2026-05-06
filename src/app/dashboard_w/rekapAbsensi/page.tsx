'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FiCalendar, FiFileText, FiDownload } from 'react-icons/fi';
import './rekapWalas.css';

export default function RekapAbsensiWalas() {
  const [rekapData, setRekapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [walasData, setWalasData] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

 useEffect(() => {
  const storedSession = localStorage.getItem('userSession');
  if (storedSession) {
    const parsedSession = JSON.parse(storedSession);
    // Simpan data dasar walas
    setWalasData(parsedSession);
    
    if (parsedSession.kelasId) {
      // Panggil fungsi untuk ambil nama kelas dan data rekap
      fetchNamaKelas(parsedSession.kelasId);
      fetchRekap(parsedSession.kelasId);
    }
  }
}, []);

// Fungsi baru untuk mengambil Nama Kelas
const fetchNamaKelas = async (idKelas: number) => {
  const { data, error } = await supabase
    .from('kelas')
    .select('nama_kelas')
    .eq('kelasId', idKelas)
    .single();

  if (data && !error) {
    // Update walasData dengan nama kelas yang baru didapat
    setWalasData((prev: any) => ({ ...prev, nama_kelas: data.nama_kelas }));
  }
};

 const fetchRekap = async (idKelas: number) => {
  setLoading(true);
  try {
    const { data, error } = await supabase
      .from('absensi')
      .select(`
        absensiId,
        status,
        created_at, 
        siswa!inner (
          nama_siswa,
          NIS,
          kelasId
        )
      `)
      .eq('siswa.kelasId', idKelas); 

    if (error) {
      console.error("Error fetching rekap:", error.message);
    } else {
      setRekapData(data || []);
    }
  } catch (err) {
    console.error("System Error:", err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="rekap-container">
      <div className="rekap-header">
        <div>
          <h1 className="rekap-title">Rekap Absensi Kelas</h1>
          <p className="rekap-subtitle">Memantau kehadiran siswa kelas binaan Anda.</p>
        </div>
        <button className="btn-export">
          <FiDownload /> Export PDF
        </button>
      </div>

      <div className="filter-card">
        <div className="filter-group">
          <label><FiCalendar /> Pilih Bulan</label>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="select-custom"
          >
            <option value={1}>Januari</option>
            <option value={2}>Februari</option>
            <option value={3}>Maret</option>
            <option value={4}>April</option>
            <option value={5}>Mei</option>
            {/* ... tambahkan bulan lainnya */}
          </select>
        </div>
        <div className="info-kelas-badge">
          Kelas: <strong>{walasData?.nama_kelas || 'Memuat...'}</strong>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-box hadir">
          <span>Hadir</span>
          <h3>{rekapData.filter(d => d.status === 'Hadir').length}</h3>
        </div>
        <div className="stat-box izin">
          <span>Izin/Sakit</span>
          <h3>{rekapData.filter(d => d.status === 'Izin' || d.status === 'Sakit').length}</h3>
        </div>
        <div className="stat-box alpa">
          <span>Alpa</span>
          <h3>{rekapData.filter(d => d.status === 'Alpa').length}</h3>
        </div>
      </div>

      <div className="table-card">
        <table className="rekap-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Siswa</th>
              <th>Tanggal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center">Memuat data rekap...</td></tr>
            ) : rekapData.length > 0 ? (
              rekapData.map((item, index) => (
                <tr key={item.absensiId}>
                  <td>{index + 1}</td>
                  <td className="font-bold">{item.siswa?.nama_siswa}</td>
                  <td>{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                  <td>
                    <span className={`status-tag ${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="text-center">Belum ada data absensi bulan ini.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
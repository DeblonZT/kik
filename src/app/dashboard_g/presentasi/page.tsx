'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import './presentasi.css';

export default function PresentasiPage() {
  const [userData, setUserData] = useState<any>(null);
  const [listKelas, setListKelas] = useState<any[]>([]);
  const [listMapel, setListMapel] = useState<any[]>([]); // State baru untuk Mapel
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedMapel, setSelectedMapel] = useState(''); // State untuk filter Mapel
  const [rekapData, setRekapData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (session) {
      const parsedUser = JSON.parse(session);
      setUserData(parsedUser);
      fetchInitialData(parsedUser.id);
    }
  }, []);

  const fetchInitialData = async (guruId: number) => {
    // 1. Ambil list kelas
    const { data: kelasData } = await supabase.from('kelas').select('*');
    if (kelasData) setListKelas(kelasData);

    // 2. Ambil list mapel yang diajar oleh guru ini melalui tabel sesi
    const { data: mapelData } = await supabase
      .from('sesi')
      .select('mapelId, mapel(nama_mapel)')
      .eq('guruId', guruId);

    if (mapelData) {
      // Hilangkan duplikasi mapel jika guru mengajar mapel yang sama di banyak sesi
      const uniqueMapel = Array.from(new Set(mapelData.map(m => m.mapelId)))
        .map(id => mapelData.find(m => m.mapelId === id));
      setListMapel(uniqueMapel);
    }
  };

  const fetchRekap = async () => {
    if (!selectedKelas || !selectedMapel || !userData) {
        alert("Pilih Kelas dan Mata Pelajaran terlebih dahulu!");
        return;
    }
    
    const { data } = await supabase
      .from('absensi')
      .select(`
        status,
        siswa (nama_siswa),
        sesi!inner (kelasId, guruId, mapelId)
      `)
      .eq('sesi.guruId', userData.id)
      .eq('sesi.kelasId', selectedKelas)
      .eq('sesi.mapelId', selectedMapel);

    if (data) {
      const ringkasan = data.reduce((acc: any, curr: any) => {
        const nama = curr.siswa.nama_siswa;
        if (!acc[nama]) {
          acc[nama] = { nama, Hadir: 0, Izin: 0, Sakit: 0, Alpa: 0, Total: 0 };
        }
        acc[nama][curr.status]++;
        acc[nama].Total++;
        return acc;
      }, {});

      // --- TAMBAHKAN LOGIKA SORT DI SINI ---
      const sortedData = Object.values(ringkasan).sort((a: any, b: any) => 
        a.nama.localeCompare(b.nama)
      );

      setRekapData(sortedData);
    }
  };

  const handleDownloadCSV = () => {
    if (rekapData.length === 0) return;
    const headers = ["Nama Siswa", "Hadir", "Izin", "Sakit", "Alpa", "Persentase"];
    const rows = rekapData.map(r => [
      r.nama, r.Hadir, r.Izin, r.Sakit, r.Alpa, 
      ((r.Hadir / r.Total) * 100).toFixed(0) + "%"
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "rekap_absensi.csv";
    link.click();
  };

  return (
    <div className="presentasi-container">
      <div className="header-flex">
        <h2 style={{fontSize: '1.5rem'}}>Dashboard Monitoring Presensi</h2>
        <button className="btn-csv" onClick={handleDownloadCSV}>📥 Export ke CSV</button>
      </div>

      <div className="filter-row">
        <input 
          type="text" 
          placeholder="Cari nama siswa..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        {/* Combobox Kelas */}
        <select 
          className="light-select" 
          onChange={(e) => setSelectedKelas(e.target.value)}
        >
          <option value="">-- Pilih Kelas --</option>
          {listKelas.map(k => (
            <option key={k.kelasId} value={k.kelasId}>{k.nama_kelas}</option>
          ))}
        </select>

        {/* Combobox Mata Pelajaran Baru */}
        <select 
          className="light-select" 
          onChange={(e) => setSelectedMapel(e.target.value)}
        >
          <option value="">-- Pilih Mata Pelajaran --</option>
          {listMapel.map(m => (
            <option key={m.mapelId} value={m.mapelId}>{m.mapel.nama_mapel}</option>
          ))}
        </select>

        <button className="btn-blue" onClick={fetchRekap}>Tampilkan Data</button>
      </div>

      <div className="table-container">
        <table className="light-table">
          <thead>
            <tr>
              <th style={{width: '50px'}}>No.</th>
              <th>Nama Siswa</th>
              <th>Persentase Hadir</th>
              <th>Hadir</th>
              <th>Izin / Sakit</th>
              <th>Alpa</th>
            </tr>
          </thead>
          <tbody>
            {rekapData
              .filter(i => i.nama.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((r, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td style={{fontWeight: '700'}}>{r.nama}</td>
                  <td style={{fontWeight: '600', color: '#059669'}}>
                     {((r.Hadir / r.Total) * 100).toFixed(0)}%
                  </td>
                  <td>{r.Hadir}</td>
                  <td>{r.Izin + r.Sakit}</td>
                  <td className={r.Alpa > 0 ? 'text-red' : ''}>{r.Alpa}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
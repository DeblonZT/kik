'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { FiCalendar, FiDownload, FiUser, FiBookOpen, FiActivity } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './rekapWalas.css';

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function RekapAbsensiWalas() {
  const [rekapData, setRekapData] = useState<any[]>([]);
  const [listGuru, setListGuru] = useState<any[]>([]);
  const [listMapel, setListMapel] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [walasData, setWalasData] = useState<any>(null);
  
  // Filter States
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedGuru, setSelectedGuru] = useState('all');
  const [selectedMapel, setSelectedMapel] = useState('all');

  useEffect(() => {
    const storedSession = localStorage.getItem('userSession');
    if (storedSession) {
      const parsedSession = JSON.parse(storedSession);
      setWalasData(parsedSession);
      fetchInitialData(parsedSession.kelasId);
    }
  }, []);

  // Ambil Mapel ketika Guru berubah
  useEffect(() => {
    if (selectedGuru !== 'all') {
      fetchMapelByGuru(selectedGuru);
    } else {
      setListMapel([]);
      setSelectedMapel('all');
    }
  }, [selectedGuru]);

  // Fetch data utama saat filter berubah
  useEffect(() => {
    if (walasData?.kelasId) {
      fetchRekap(walasData.kelasId);
    }
  }, [selectedMonth, selectedYear, selectedGuru, selectedMapel]);

  const fetchInitialData = async (idKelas: number) => {
    const { data: kelas } = await supabase
      .from('kelas')
      .select('nama_kelas')
      .eq('kelasId', idKelas)
      .single();
    if (kelas) setWalasData((prev: any) => ({ ...prev, nama_kelas: kelas.nama_kelas }));

    const { data: guru } = await supabase.from('guru').select('guruId, nama');
    if (guru) setListGuru(guru);
  };

  const fetchMapelByGuru = async (guruId: string) => {
    const { data: mapel, error } = await supabase
      .from('mapel')
      .select('mapelId, nama_mapel')
      .eq('guruId', Number(guruId)); // Konversi string ke integer
    
    if (!error && mapel) {
      setListMapel(mapel);
      setSelectedMapel('all');
    }
  };

  const fetchRekap = async (idKelas: number) => {
    setLoading(true);
    try {
      // Melakukan join ke tabel sesi untuk mendapatkan tanggal, guruId, dan mapelId
      let query = supabase
        .from('absensi')
        .select(`
          status,
          siswa!inner (nama_siswa, NIS, kelasId),
          sesi!inner (tanggal, guruId, mapelId)
        `)
        .eq('siswa.kelasId', idKelas);

      if (selectedGuru !== 'all') query = query.eq('sesi.guruId', Number(selectedGuru));
      if (selectedMapel !== 'all') query = query.eq('sesi.mapelId', Number(selectedMapel));

      const { data, error } = await query;
      if (error) throw error;

      if (data) {
        // Filter di client berdasarkan bulan dan tahun dari tabel sesi
        const filtered = data.filter(item => {
          const tglSesi = (item as any).sesi?.tanggal;
          if (!tglSesi) return false;
          const d = new Date(tglSesi);
          return (d.getMonth() + 1 === selectedMonth) && (d.getFullYear() === selectedYear);
        });
        setRekapData(filtered);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // LOGIKA STATISTIK, PEWARNAAN, & SORTING ALFABET
  const stats = useMemo(() => {
    const hadir = rekapData.filter(d => d.status === 'Hadir').length;
    const izinSakit = rekapData.filter(d => d.status === 'Izin' || d.status === 'Sakit').length;
    const alpa = rekapData.filter(d => d.status === 'Alpa').length;

    const chartData = [
      { name: 'Hadir', value: hadir, color: '#10b981' },
      { name: 'Izin/Sakit', value: izinSakit, color: '#f59e0b' },
      { name: 'Alpa', value: alpa, color: '#ef4444' },
    ];

    // Grouping data per siswa
    const perSiswa = rekapData.reduce((acc: any, curr) => {
      const nama = curr.siswa.nama_siswa;
      if (!acc[nama]) acc[nama] = { nama, nis: curr.siswa.NIS, hadir: 0, total: 0 };
      acc[nama].total++;
      if (curr.status === 'Hadir') acc[nama].hadir++;
      return acc;
    }, {});

    // Sorting Alfabetis A-Z
    const sortedList = Object.values(perSiswa).sort((a: any, b: any) => 
      a.nama.localeCompare(b.nama)
    );

    return { 
      chartData, 
      total: rekapData.length, 
      listTabel: sortedList,
      summary: { hadir, izinSakit, alpa }
    };
  }, [rekapData]);

  return (
    <div className="rekap-container">
      <div className="rekap-header">
        <div>
          <h1 className="rekap-title">Monitoring Rekap Kelas</h1>
          <p className="rekap-subtitle">Kelas: <strong>{walasData?.nama_kelas || '...'}</strong></p>
        </div>
        <button className="btn-export" onClick={() => window.print()}>
          <FiDownload /> Cetak Laporan
        </button>
      </div>

      {/* FILTER SECTION */}
      <div className="filter-card-grid">
        <div className="filter-item">
          <label><FiCalendar /> Bulan & Tahun</label>
          <div className="input-group-row">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
              {BULAN.map((name, i) => <option key={i} value={i + 1}>{name}</option>)}
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        
        <div className="filter-item">
          <label><FiUser /> Guru Pengajar</label>
          <select value={selectedGuru} onChange={(e) => setSelectedGuru(e.target.value)}>
            <option value="all">Semua Guru</option>
            {listGuru.map(g => <option key={g.guruId} value={g.guruId}>{g.nama}</option>)}
          </select>
        </div>

        <div className={`filter-item ${selectedGuru === 'all' ? 'disabled' : ''}`}>
          <label><FiBookOpen /> Mata Pelajaran</label>
          <select 
            value={selectedMapel} 
            onChange={(e) => setSelectedMapel(e.target.value)}
            disabled={selectedGuru === 'all'}
          >
            <option value="all">Semua Mapel</option>
            {listMapel.map(m => <option key={m.mapelId} value={m.mapelId}>{m.nama_mapel}</option>)}
          </select>
        </div>
      </div>

      <div className="rekap-main-layout">
        {/* CHART SECTION */}
        <div className="chart-card">
          <h3 className="card-title"><FiActivity /> Ringkasan Kehadiran</h3>
          <div className="chart-wrapper">
            {stats.total > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={stats.chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {stats.chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="no-data-msg">Tidak ada data absensi</div>}
          </div>
          <div className="quick-stats">
             <div className="q-item"><span>Hadir</span> <strong style={{color: '#10b981'}}>{stats.summary.hadir}</strong></div>
             <div className="q-item"><span>Izin</span> <strong style={{color: '#f59e0b'}}>{stats.summary.izinSakit}</strong></div>
             <div className="q-item"><span>Alpa</span> <strong style={{color: '#ef4444'}}>{stats.summary.alpa}</strong></div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="table-card-full">
          <table className="rekap-table-modern">
            <thead>
              <tr>
                <th>Nama Siswa</th>
                <th>Total Sesi</th>
                <th>Kehadiran (%)</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="loading-text">Memproses data...</td></tr>
              ) : stats.listTabel.length > 0 ? (
                stats.listTabel.map((siswa: any, i) => {
                  const persen = Math.round((siswa.hadir / siswa.total) * 100);
                  
                  // Warna dinamis: Hijau (>=80), Kuning (>=30), Merah (<30)
                  let colorClass = "danger";
                  let barColor = "#ef4444";
                  if (persen >= 80) { colorClass = "success"; barColor = "#10b981"; }
                  else if (persen >= 30) { colorClass = "warning"; barColor = "#f59e0b"; }

                  return (
                    <tr key={i}>
                      <td className="name-cell">{siswa.nama}</td>
                      <td>{siswa.total} Sesi</td>
                      <td className={`percent-cell ${colorClass}`}>{persen}%</td>
                      <td>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${persen}%`, backgroundColor: barColor }}></div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={4} className="no-data">Data absensi tidak ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
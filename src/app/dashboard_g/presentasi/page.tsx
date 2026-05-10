'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { FiCalendar, FiBookOpen, FiActivity, FiFilter } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './presentasi.css';

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function PresentasiAbsensi() {
  const [rekapData, setRekapData] = useState<any[]>([]);
  const [listMapel, setListMapel] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  // Filter States
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMapel, setSelectedMapel] = useState('all');

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (session) {
      const parsed = JSON.parse(session);
      setUserData(parsed);
      fetchMapel(parsed.id);
    }
  }, []);

  // Otomatis fetch data setiap kali filter berubah
  useEffect(() => {
    if (userData?.id) {
      fetchDataPresentasi();
    }
  }, [selectedMonth, selectedYear, selectedMapel, userData]);

  const fetchMapel = async (guruId: number) => {
    const { data } = await supabase.from('mapel').select('mapelId, nama_mapel').eq('guruId', guruId);
    if (data) setListMapel(data);
  };

  const fetchDataPresentasi = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('absensi')
        .select(`
          status,
          siswa!inner (nama_siswa, NIS),
          sesi!inner (tanggal, guruId, mapelId)
        `)
        .eq('sesi.guruId', userData.id);

      if (selectedMapel !== 'all') {
        query = query.eq('sesi.mapelId', Number(selectedMapel));
      }

      const { data, error } = await query;
      if (!error && data) {
        const filtered = data.filter(item => {
          const d = new Date((item as any).sesi?.tanggal);
          return (d.getMonth() + 1 === selectedMonth) && (d.getFullYear() === selectedYear);
        });
        setRekapData(filtered);
      }
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const hadir = rekapData.filter(d => d.status === 'Hadir').length;
    const izinSakit = rekapData.filter(d => d.status === 'Izin' || d.status === 'Sakit').length;
    const alpa = rekapData.filter(d => d.status === 'Alpa').length;

    const chartData = [
      { name: 'Hadir', value: hadir, color: '#10b981' },
      { name: 'Izin/Sakit', value: izinSakit, color: '#f59e0b' },
      { name: 'Alpa', value: alpa, color: '#ef4444' },
    ];

    const perSiswa = rekapData.reduce((acc: any, curr) => {
      const nama = curr.siswa.nama_siswa;
      if (!acc[nama]) acc[nama] = { nama, hadir: 0, total: 0 };
      acc[nama].total++;
      if (curr.status === 'Hadir') acc[nama].hadir++;
      return acc;
    }, {});

    const sortedList = Object.values(perSiswa).sort((a: any, b: any) => a.nama.localeCompare(b.nama));

    return { chartData, total: rekapData.length, listTabel: sortedList, summary: { hadir, izinSakit, alpa } };
  }, [rekapData]);

  return (
    <div className="presentasi-container">
      <div className="presentasi-header">
        <h1 className="title">Presentasi Kehadiran Siswa</h1>
        <p className="subtitle">Laporan performa kehadiran per mata pelajaran Anda.</p>
      </div>

      <div className="filter-section">
        <div className="filter-item">
          <label><FiCalendar /> Bulan & Tahun</label>
          <div className="input-group-row">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
              {BULAN.map((name, i) => <option key={i} value={i + 1}>{name}</option>)}
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
              {[2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="filter-item">
          <label><FiBookOpen /> Pilih Mata Pelajaran</label>
          <select value={selectedMapel} onChange={(e) => setSelectedMapel(e.target.value)}>
            <option value="all">Semua Mata Pelajaran</option>
            {listMapel.map(m => <option key={m.mapelId} value={m.mapelId}>{m.nama_mapel}</option>)}
          </select>
        </div>
      </div>

      <div className="presentasi-layout">
        {/* BAGIAN KIRI: CHART */}
        <div className="card chart-card">
          <h3 className="card-title"><FiActivity /> Komposisi Kehadiran</h3>
          {stats.total > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={stats.chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {stats.chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state">Tidak ada data absensi</div>}
          <div className="mini-stats">
            <div className="m-box"><span>Hadir</span> <b style={{color:'#10b981'}}>{stats.summary.hadir}</b></div>
            <div className="m-box"><span>Izin</span> <b style={{color:'#f59e0b'}}>{stats.summary.izinSakit}</b></div>
            <div className="m-box"><span>Alpa</span> <b style={{color:'#ef4444'}}>{stats.summary.alpa}</b></div>
          </div>
        </div>

        {/* BAGIAN KANAN: TABEL */}
        <div className="card table-card">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Nama Siswa</th>
                <th style={{textAlign:'center'}}>Sesi</th>
                <th style={{textAlign:'center'}}>%</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="center">Menganalisis data...</td></tr>
              ) : stats.listTabel.length > 0 ? (
                stats.listTabel.map((siswa: any, i) => {
                  const persen = Math.round((siswa.hadir / siswa.total) * 100);
                  const color = persen >= 80 ? "#10b981" : persen >= 30 ? "#f59e0b" : "#ef4444";
                  return (
                    <tr key={i}>
                      <td data-label="Nama" className="name-cell">{siswa.nama}</td>
                      <td data-label="Sesi" style={{textAlign:'center'}}>{siswa.total}</td>
                      <td data-label="Hadir %" style={{textAlign:'center', fontWeight: 800, color: color}}>{persen}%</td>
                      <td data-label="Visual">
                        <div className="progress-bg">
                          <div className="progress-bar" style={{width: `${persen}%`, backgroundColor: color}}></div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : <tr><td colSpan={4} className="center">Data belum tersedia</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
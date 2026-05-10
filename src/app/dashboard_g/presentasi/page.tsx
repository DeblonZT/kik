'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import './presentasi.css';

export default function PresentasiPage() {
  const [userData, setUserData] = useState<any>(null);
  const [listKelas, setListKelas] = useState<any[]>([]);
  const [listMapel, setListMapel] = useState<any[]>([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');
  
  // State Baru untuk Filter Waktu
  const [selectedMonth, setSelectedMonth] = useState('all'); // 'all' atau 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  
  const [rekapData, setRekapData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Daftar Bulan untuk Dropdown
  const months = [
    { id: '1', name: 'Januari' }, { id: '2', name: 'Februari' }, { id: '3', name: 'Maret' },
    { id: '4', name: 'April' }, { id: '5', name: 'Mei' }, { id: '6', name: 'Juni' },
    { id: '7', name: 'Juli' }, { id: '8', name: 'Agustus' }, { id: '9', name: 'September' },
    { id: '10', name: 'Oktober' }, { id: '11', name: 'November' }, { id: '12', name: 'Desember' },
  ];

  // Daftar Tahun (3 tahun terakhir)
  const currentYear = new Date().getFullYear();
  const years = [currentYear.toString(), (currentYear - 1).toString(), (currentYear - 2).toString()];

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (session) {
      const parsedUser = JSON.parse(session);
      setUserData(parsedUser);
      fetchInitialData(parsedUser.id);
    }
  }, []);

  const fetchInitialData = async (guruId: number) => {
    const { data: kelasData } = await supabase.from('kelas').select('*');
    if (kelasData) setListKelas(kelasData);

    const { data: mapelData } = await supabase
      .from('sesi')
      .select('mapelId, mapel(nama_mapel)')
      .eq('guruId', guruId);

    if (mapelData) {
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

    let query = supabase
      .from('absensi')
      .select(`
        status,
        created_at,
        siswa (nama_siswa),
        sesi!inner (kelasId, guruId, mapelId)
      `)
      .eq('sesi.guruId', userData.id)
      .eq('sesi.kelasId', selectedKelas)
      .eq('sesi.mapelId', selectedMapel);

    // --- LOGIKA FILTER BULAN & TAHUN ---
    if (selectedMonth !== 'all') {
      // Jika pilih bulan tertentu
      const startDate = `${selectedYear}-${selectedMonth.padStart(2, '0')}-01`;
      const nextMonth = parseInt(selectedMonth) === 12 ? 1 : parseInt(selectedMonth) + 1;
      const nextYear = parseInt(selectedMonth) === 12 ? parseInt(selectedYear) + 1 : selectedYear;
      const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;

      query = query.gte('created_at', startDate).lt('created_at', endDate);
    } else {
      // Jika pilih 'Kesemuanya', tapi tetap filter berdasarkan tahun yang dipilih
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${parseInt(selectedYear) + 1}-01-01`;
      query = query.gte('created_at', startDate).lt('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      return;
    }

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
    link.download = `rekap_absensi_${selectedMonth}_${selectedYear}.csv`;
    link.click();
  };

  return (
    <div className="presentasi-container">
      <div className="header-flex">
        <h2 style={{ fontSize: '1.5rem' }}>Dashboard Monitoring Presensi</h2>
        <button className="btn-csv" onClick={handleDownloadCSV}>📥 Export ke CSV</button>
      </div>

      <div className="filter-row" style={{ flexWrap: 'wrap', gap: '10px' }}>
        <input
          type="text"
          placeholder="Cari nama siswa..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select className="light-select" onChange={(e) => setSelectedKelas(e.target.value)}>
          <option value="">-- Pilih Kelas --</option>
          {listKelas.map(k => (
            <option key={k.kelasId} value={k.kelasId}>{k.nama_kelas}</option>
          ))}
        </select>

        <select className="light-select" onChange={(e) => setSelectedMapel(e.target.value)}>
          <option value="">-- Pilih Mata Pelajaran --</option>
          {listMapel.map(m => (
            <option key={m.mapelId} value={m.mapelId}>{m.mapel.nama_mapel}</option>
          ))}
        </select>

        {/* Combobox Bulan */}
        <select 
          className="light-select" 
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="all">Kesemuanya (1 Tahun)</option>
          {months.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        {/* Combobox Tahun */}
        <select 
          className="light-select" 
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <button className="btn-blue" onClick={fetchRekap}>Tampilkan Data</button>
      </div>

      <div className="table-container">
        <table className="light-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>No.</th>
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
                  <td style={{ fontWeight: '700' }}>{r.nama}</td>
                  <td style={{ fontWeight: '600', color: '#059669' }}>
                    {((r.Hadir / r.Total) * 100).toFixed(0)}%
                  </td>
                  <td>{r.Hadir}</td>
                  <td>{r.Izin + r.Sakit}</td>
                  <td className={r.Alpa > 0 ? 'text-red' : ''}>{r.Alpa}</td>
                </tr>
              ))
            }
            {rekapData.length === 0 && (
                <tr>
                    <td colSpan={6} style={{textAlign: 'center', padding: '20px', color: '#667085'}}>
                        Tidak ada data untuk periode ini.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
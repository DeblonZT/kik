'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FiPlus, FiTrash2, FiSearch, FiX, FiEdit3 } from 'react-icons/fi'; // Tambah ikon Edit
import './daftarKelas.css';

export default function DaftarSesi() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [listSesi, setListSesi] = useState<any[]>([]);
  const [listKelas, setListKelas] = useState<any[]>([]);
  const [listMapel, setListMapel] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- STATE UNTUK EDIT ---
  const [editId, setEditId] = useState<number | null>(null);

  // --- STATE UNTUK FILTER ---
  const [filterKelas, setFilterKelas] = useState('');
  const [filterBulan, setFilterBulan] = useState('');
  const [filterTahun, setFilterTahun] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // --- STATE UNTUK FORM MODAL ---
  const [formKelas, setFormKelas] = useState('');
  const [formTanggal, setFormTanggal] = useState('');
  const [formKeterangan, setFormKeterangan] = useState('');
  const [formMapel, setFormMapel] = useState('');

  useEffect(() => {
    setMounted(true);
    const session = localStorage.getItem('userSession');
    if (!session) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(session);
    setUserData(parsedUser);
    
    fetchInitialData(parsedUser.id);
  }, [router]);

  const fetchInitialData = async (guruId: number) => {
    setLoading(true);
    // Ambil data Kelas
    const { data: kelasData } = await supabase.from('kelas').select('*');
    if (kelasData) setListKelas(kelasData);
    
    // Ambil data Mapel khusus Guru ini
    const { data: mapelData } = await supabase
      .from('mapel')
      .select('*')
      .eq('guruId', guruId);
    if (mapelData) setListMapel(mapelData);
    
    await fetchSesiData(guruId);
  };

  const fetchSesiData = async (guruId?: number) => {
    const idGuru = guruId || userData?.id;
    if (!idGuru) return;

    const { data, error } = await supabase
      .from('sesi')
      .select(`
        *,
        kelas (nama_kelas),
        mapel (nama_mapel)
      `)
      .eq('guruId', idGuru)
      .order('tanggal', { ascending: false });

    if (!error) setListSesi(data || []);
    setLoading(false);
  };

  const handleHapusSesi = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus sesi ini? Semua data absensi terkait mungkin akan ikut terhapus.")) return;

    const { error } = await supabase.from('sesi').delete().eq('sesiId', id);

    if (error) {
      alert("Gagal hapus: " + error.message);
    } else {
      alert("Sesi berhasil dihapus");
      fetchSesiData();
    }
  };

  const openEditModal = (sesi: any) => {
    setEditId(sesi.sesiId);
    setFormKelas(sesi.kelasId.toString());
    setFormMapel(sesi.mapelId.toString());
    setFormTanggal(sesi.tanggal);
    setFormKeterangan(sesi.keterangan || '');
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditId(null);
    setFormKelas('');
    setFormMapel('');
    setFormTanggal('');
    setFormKeterangan('');
    setIsModalOpen(false);
  };

  const handleSimpanSesi = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { 
      kelasId: parseInt(formKelas),
      mapelId: parseInt(formMapel),
      tanggal: formTanggal, 
      keterangan: formKeterangan,
      guruId: userData.id
    };

    let error;
    if (editId) {
      // Logika Update
      const { error: err } = await supabase.from('sesi').update(payload).eq('sesiId', editId);
      error = err;
    } else {
      // Logika Insert
      const { error: err } = await supabase.from('sesi').insert([payload]);
      error = err;
    }

    if (error) {
      alert("Gagal menyimpan: " + error.message);
    } else {
      alert(editId ? "Sesi berhasil diperbarui!" : "Sesi berhasil dibuat!");
      resetForm();
      fetchSesiData();
    }
  };

  const dataFiltered = listSesi.filter((item) => {
    const tgl = new Date(item.tanggal);
    const matchKelas = filterKelas ? item.kelasId.toString() === filterKelas : true;
    const matchBulan = filterBulan ? (tgl.getMonth() + 1).toString() === filterBulan : true;
    const matchTahun = filterTahun ? tgl.getFullYear().toString() === filterTahun : true;
    const matchSearch = item.keterangan?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchKelas && matchBulan && matchTahun && matchSearch;
  });

  if (!mounted) return <div className="page-content-inner"><p>Loading...</p></div>;

  return (
    <div className="page-content-inner">
      <h1 className="section-heading">Daftar Sesi Absensi</h1>

      <div className="toolbar-container">
        <div className="filters-group">
          <select className="filter-select" value={filterKelas} onChange={(e) => setFilterKelas(e.target.value)}>
            <option value="">Semua Kelas</option>
            {listKelas.map(k => <option key={k.kelasId} value={k.kelasId}>{k.nama_kelas}</option>)}
          </select>

          <select className="filter-select" value={filterBulan} onChange={(e) => setFilterBulan(e.target.value)}>
            <option value="">Semua Bulan</option>
            {["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"].map((m, i) => (
              <option key={i} value={(i + 1).toString()}>{m}</option>
            ))}
          </select>

          <select className="filter-select" value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)}>
            <option value="">Semua Tahun</option>
            {[2024, 2025, 2026].map(y => <option key={y} value={y.toString()}>{y}</option>)}
          </select>

          <div className="search-wrapper">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Cari keterangan..." 
              className="search-box"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <button className="btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <FiPlus /> Buat Sesi
        </button>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Kelas</th>
              <th>Mata Pelajaran</th>
              <th>Tanggal</th>
              <th>Keterangan</th>
              <th style={{textAlign: 'center'}}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{textAlign: 'center', padding: '2rem'}}>Memuat data...</td></tr>
            ) : dataFiltered.map((s) => (
              <tr key={s.sesiId}>
                <td className="col-kelas" style={{fontWeight: 'bold'}}>{s.kelas?.nama_kelas || 'N/A'}</td>
                <td>{s.mapel?.nama_mapel || '-'}</td>
                <td>{new Date(s.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                <td>{s.keterangan || '-'}</td>
                <td>
                  <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
                    <button className="btn-edit" onClick={() => openEditModal(s)} title="Edit Sesi">
                      <FiEdit3 />
                    </button>
                    <button className="btn-delete" onClick={() => handleHapusSesi(s.sesiId)} title="Hapus Sesi">
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editId ? 'Edit Sesi Absensi' : 'Tambah Sesi Baru'}</h2>
              <button onClick={resetForm}><FiX /></button>
            </div>
            <form onSubmit={handleSimpanSesi}>
              <div className="form-group">
                <label>Pilih Kelas</label>
                <select value={formKelas} onChange={(e) => setFormKelas(e.target.value)} required>
                  <option value="">-- Pilih --</option>
                  {listKelas.map(k => <option key={k.kelasId} value={k.kelasId}>{k.nama_kelas}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Pilih Mata Pelajaran</label>
                <select value={formMapel} onChange={(e) => setFormMapel(e.target.value)} required>
                  <option value="">-- Pilih Mapel --</option>
                  {listMapel.map(m => (
                    <option key={m.mapelId} value={m.mapelId}>{m.nama_mapel}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tanggal</label>
                <input type="date" value={formTanggal} onChange={(e) => setFormTanggal(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Keterangan</label>
                <input type="text" value={formKeterangan} onChange={(e) => setFormKeterangan(e.target.value)} placeholder="Contoh: Pertemuan 1" />
              </div>
              <button type="submit" className="btn-primary w-full">
                {editId ? 'Simpan Perubahan' : 'Simpan Sesi'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
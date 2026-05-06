'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FiSearch, FiUser, FiPlus, FiX, FiEdit2, FiTrash2 } from 'react-icons/fi';
import './daftarSiswa.css';

export default function DaftarSiswa() {
  const [listSiswa, setListSiswa] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [walasData, setWalasData] = useState<any>(null);

  // State Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nama_siswa: '', NIS: '' });

  useEffect(() => {
    const storedSession = localStorage.getItem('userSession');
    if (storedSession) {
      const parsedSession = JSON.parse(storedSession);
      setWalasData(parsedSession);
      if (parsedSession.kelasId) {
        fetchSiswa(parsedSession.kelasId);
      }
    }
  }, []);

  const fetchSiswa = async (idKelas: number) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('siswa')
      .select(`siswaId, nama_siswa, NIS, kelasId, kelas (nama_kelas)`)
      .eq('kelasId', idKelas)
      .order('nama_siswa', { ascending: true });

    if (!error) setListSiswa(data || []);
    setLoading(false);
  };

  // Fungsi Simpan (Tambah atau Edit)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walasData?.kelasId) return;

    if (isEditMode && selectedId) {
      // Logika Update
      const { error } = await supabase
        .from('siswa')
        .update({ nama_siswa: formData.nama_siswa, NIS: formData.NIS || null })
        .eq('siswaId', selectedId);

      if (error) alert("Gagal update: " + error.message);
      else alert("Data berhasil diperbarui!");
    } else {
      // Logika Insert
      const { error } = await supabase
        .from('siswa')
        .insert([{ ...formData, kelasId: walasData.kelasId }]);

      if (error) alert("Gagal tambah: " + error.message);
      else alert("Siswa berhasil ditambahkan!");
    }

    closeModal();
    fetchSiswa(walasData.kelasId);
  };

  // Fungsi Hapus
  const handleHapus = async (id: number, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus siswa "${nama}"?`)) {
      const { error } = await supabase.from('siswa').delete().eq('siswaId', id);
      if (error) alert("Gagal hapus: " + error.message);
      else fetchSiswa(walasData.kelasId);
    }
  };

  const openEditModal = (siswa: any) => {
    setIsEditMode(true);
    setSelectedId(siswa.siswaId);
    setFormData({ nama_siswa: siswa.nama_siswa, NIS: siswa.NIS || '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedId(null);
    setFormData({ nama_siswa: '', NIS: '' });
  };

  const filteredSiswa = listSiswa.filter((s) =>
    s.nama_siswa?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-content-inner">
      <div className="page-header">
        <div className="header-flex">
          <div>
            <h1 className="section-heading">Daftar Siswa Kelas {listSiswa[0]?.kelas?.nama_kelas || ''}</h1>
            <p className="section-subheading">Kelola data siswa binaan Anda.</p>
          </div>
          <button className="btn-tambah" onClick={() => setIsModalOpen(true)}>
            <FiPlus /> Tambah Siswa
          </button>
        </div>
      </div>

      <div className="toolbar-container">
        <div className="search-wrapper">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Cari nama siswa..." 
            className="search-box"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="stats-badge"><FiUser /> Total: {filteredSiswa.length} Siswa</div>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>No.</th>
              <th>Nama Siswa</th>
              <th>NIS</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center">Memuat...</td></tr>
            ) : filteredSiswa.map((s, index) => (
              <tr key={s.siswaId}>
                <td>{index + 1}</td>
                <td className="font-bold">{s.nama_siswa}</td>
                <td className="text-mono">{s.NIS || '-'}</td>
                <td className="action-cell">
                  <button className="btn-icon edit" onClick={() => openEditModal(s)}><FiEdit2 /></button>
                  <button className="btn-icon delete" onClick={() => handleHapus(s.siswaId, s.nama_siswa)}><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL (Tetap sama, hanya judul & tombol dinamis) */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditMode ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</h2>
              <button onClick={closeModal} className="close-btn"><FiX /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input 
                  type="text" required value={formData.nama_siswa}
                  onChange={(e) => setFormData({...formData, nama_siswa: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>NIS</label>
                <input 
                  type="number" value={formData.NIS}
                  onChange={(e) => setFormData({...formData, NIS: e.target.value})}
                />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn-batal">Batal</button>
                <button type="submit" className="btn-simpan">
                  {isEditMode ? 'Simpan Perubahan' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
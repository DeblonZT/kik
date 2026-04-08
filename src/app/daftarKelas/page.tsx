'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FiBell, FiSearch, FiPlus, FiDownload, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './daftarKelas.css';
// Juga tetap import dashboard_g.css untuk sidebar/navbar global
// import '../dashboard_g.css';

export default function DaftarKelas() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Semua Kelas');

  // Contoh data — ganti dengan fetch dari API/database kamu
  const data = [
    { id: 1, kelas: '10 TKP 2', tanggal: '2026-04-02', keterangan: '' },
    { id: 2, kelas: '10 TKP 2', tanggal: '2026-04-02', keterangan: '' },
  ];

  const filtered = data.filter(row =>
    row.kelas.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">

      {/* --- HEADER BAR (judul + ikon) --- */}
      <div className="page-header-bar">
        <span className="page-header-title">Daftar Kelas Absensi</span>
        <div className="page-header-actions">
          <button className="icon-btn"><FiBell /></button>
          <div className="avatar" style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#4f46e5', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.85rem'
          }}>AD</div>
        </div>
      </div>

      {/* --- SECTION TITLE --- */}
      <h1 className="section-heading">Daftar Kelas Absensi</h1>

      <div className="stat-grid">
  <div className="stat-card">
    <div className="stat-icon icon-blue">📋</div>
    <p className="stat-label">Total Sesi</p>
    <p className="stat-value">{data.length}</p>
  </div>
  <div className="stat-card">
    <div className="stat-icon icon-green">✅</div>
    <p className="stat-label">Sesi Terisi</p>
    <p className="stat-value">{data.filter(d => d.keterangan).length}</p>
  </div>
  <div className="stat-card">
    <div className="stat-icon icon-red">⚠️</div>
    <p className="stat-label">Sesi Kosong</p>
    <p className="stat-value">{data.filter(d => !d.keterangan).length}</p>
  </div>
</div>

      {/* --- TOOLBAR --- */}
      <div className="toolbar">
        <div className="search-box">
          <FiSearch color="#94a3b8" />
          <input
            type="text"
            placeholder="Cari nama kelas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option>Semua Kelas</option>
          <option>10 TKP 1</option>
          <option>10 TKP 2</option>
          <option>11 TKP 1</option>
        </select>

        <button className="btn btn-primary">
          <FiPlus /> Tambah Sesi
        </button>

        <button className="btn btn-dark">
          <FiDownload /> Export CSV
        </button>
      </div>

      {/* --- TABLE CARD --- */}
      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Kelas</th>
                <th>Tanggal</th>
                <th>Keterangan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((row, i) => (
                  <tr key={row.id}>
                    <td style={{ textAlign: 'center' }}>{i + 1}</td>
                    <td className="col-kelas">{row.kelas}</td>
                    <td>{row.tanggal}</td>
                    <td>
                      <span className={row.keterangan ? 'badge badge-info' : 'badge badge-empty'}>
                        {row.keterangan || '—'}
                      </span>
                    </td>
                    <td>
                      <Link href={`/absensi/${row.id}`} className="action-btn">
                        Isi Absen →
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📋</div>
                      <p>Tidak ada data kelas ditemukan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="pagination">
          <span className="pagination-info">Halaman 1 dari 1</span>
          <div className="pagination-controls">
            <button className="page-btn" disabled>
              <FiChevronLeft /> Prev
            </button>
            <span className="page-info">1</span>
            <button className="page-btn" disabled>
              Next <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
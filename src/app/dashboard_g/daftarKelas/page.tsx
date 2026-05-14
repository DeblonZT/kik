'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './daftarKelas.css';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DaftarSesi() {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentSesiId, setCurrentSesiId] = useState<number | null>(null);
  
  const [sesiList, setSesiList] = useState<any[]>([]);
  const [mapelList, setMapelList] = useState<any[]>([]);
  const [kelasList, setKelasList] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    kelasId: '',
    mapelId: '',
    keterangan: '',
    tanggal: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchSesiData();
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    const { data: mapel } = await supabase.from('mapel').select('*');
    const { data: kelas } = await supabase.from('kelas').select('*');
    setMapelList(mapel || []);
    setKelasList(kelas || []);
  };

  const fetchSesiData = async () => {
    try {
      const teacherSession = JSON.parse(localStorage.getItem('userSession') || '{}');
      const { data, error } = await supabase
        .from('sesi')
        .select(`
          *,
          kelas:kelasId (nama_kelas),
          mapel:mapelId (nama_mapel)
        `)
        .eq('guruId', teacherSession.id) 
        .order('sesiId', { ascending: false });

      if (error) throw error;
      setSesiList(data || []);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const handleOpenEdit = (sesi: any) => {
    setIsEdit(true);
    setCurrentSesiId(sesi.sesiId);
    setFormData({
      kelasId: sesi.kelasId.toString(),
      mapelId: sesi.mapelId.toString(),
      keterangan: sesi.keterangan,
      tanggal: sesi.tanggal
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus sesi ini? Data absensi terkait juga akan terhapus.")) return;
    
    try {
      // Karena ada foreign key, pastikan delete cascade aktif di supabase 
      // atau hapus absensi dulu secara manual jika perlu.
      const { error } = await supabase.from('sesi').delete().eq('sesiId', id);
      if (error) throw error;
      alert("Sesi dihapus!");
      fetchSesiData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const teacherSession = JSON.parse(localStorage.getItem('userSession') || '{}');

    try {
      if (isEdit && currentSesiId) {
        // LOGIKA EDIT
        const { error } = await supabase
          .from('sesi')
          .update({
            kelasId: parseInt(formData.kelasId),
            mapelId: parseInt(formData.mapelId),
            keterangan: formData.keterangan,
            tanggal: formData.tanggal
          })
          .eq('sesiId', currentSesiId);
        if (error) throw error;
        alert("Sesi diperbarui!");
      } else {
        // LOGIKA TAMBAH BARU (Plus Snapshot)
        const { data: newSesi, error: sesiError } = await supabase
          .from('sesi')
          .insert([{
            kelasId: parseInt(formData.kelasId),
            mapelId: parseInt(formData.mapelId),
            keterangan: formData.keterangan || '-',
            tanggal: formData.tanggal,
            guruId: teacherSession.id 
          }])
          .select().single();

        if (sesiError) throw sesiError;

        const { data: siswaList } = await supabase.from('siswa').select('siswaId').eq('kelasId', formData.kelasId);
        if (siswaList && siswaList.length > 0) {
          const payload = siswaList.map(s => ({
            sesiId: newSesi.sesiId,
            siswaId: s.siswaId,
            status: 'Tanpa Keterangan'
          }));
          await supabase.from('absensi').insert(payload);
        }
        alert("Sesi & Snapshot Berhasil!");
      }

      setShowModal(false);
      resetForm();
      fetchSesiData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsEdit(false);
    setCurrentSesiId(null);
    setFormData({
      kelasId: '',
      mapelId: '',
      keterangan: '',
      tanggal: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="container">
      <div className="header-page">
        <h2 className="section-heading"><b>Daftar Sesi Pembelajaran</b></h2>
        <button className="btn-add" onClick={() => { resetForm(); setShowModal(true); }}>+ Tambah Sesi</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Kelas</th>
              <th>Mapel</th>
              <th>Keterangan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {sesiList.map((s) => (
              <tr key={s.sesiId}>
                <td>{s.tanggal}</td>
                <td>{s.kelas?.nama_kelas}</td>
                <td>{s.mapel?.nama_mapel}</td>
                <td>{s.keterangan}</td>
                <td className="action-btns">
                  <button className="btn-edit" onClick={() => handleOpenEdit(s)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(s.sesiId)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{isEdit ? 'Edit Sesi' : 'Buat Sesi Baru'}</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Kelas</label>
                <select required value={formData.kelasId} onChange={(e) => setFormData({...formData, kelasId: e.target.value})}>
                  <option value="">Pilih Kelas</option>
                  {kelasList.map(k => <option key={k.kelasId} value={k.kelasId}>{k.nama_kelas}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Mapel</label>
                <select required value={formData.mapelId} onChange={(e) => setFormData({...formData, mapelId: e.target.value})}>
                  <option value="">Pilih Mapel</option>
                  {mapelList.map(m => <option key={m.mapelId} value={m.mapelId}>{m.nama_mapel}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Tanggal</label>
                <input type="date" required value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Keterangan</label>
                <input type="text" value={formData.keterangan} onChange={(e) => setFormData({...formData, keterangan: e.target.value})} />
              </div>
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? 'Proses...' : isEdit ? 'Simpan Perubahan' : 'Tambah Sesi'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
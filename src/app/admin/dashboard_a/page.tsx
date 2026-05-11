'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import styles from './dashboard_a.module.css';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const router = useRouter();
  const [role, setRole] = useState<'guru' | 'walas'>('guru');
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState<any[]>([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [formData, setFormData] = useState({
    nama: '',
    nip: '',
    email: '',
    pw: '',
    kelasId: '',
  });

  const handleLogout = async () => {
    await fetch('/api/admin', { method: 'DELETE' });
    router.push('/admin');
  };

  const fetchData = async () => {
    const tableName = role === 'guru' ? 'guru' : 'walas';
    try {
      // Mengambil semua data termasuk kolom foto_url
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('nama', { ascending: true });

      if (error) throw error;
      setDataList(data || []);
    } catch (err: any) {
      console.error("Fetch Error:", err.message);
      setDataList([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (item: any) => {
    setFormData({
      nama: item.nama || '',
      nip: item.nip || '',
      email: item.email || '',
      pw: item.pw || '',
      kelasId: item.kelasId?.toString() || '',
    });
    setEditingId(role === 'guru' ? item.guruId : item.walasId);
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditingId(null);
    setFormData({ nama: '', nip: '', email: '', pw: '', kelasId: '' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus akun ini? Data terkait juga akan hilang.')) return;
    const tableName = role === 'guru' ? 'guru' : 'walas';
    const idColumn = role === 'guru' ? 'guruId' : 'walasId';

    try {
      if (role === 'guru') {
        await supabase.from('sesi').delete().eq('guruId', id);
      }
      const { error } = await supabase.from(tableName).delete().eq(idColumn, id);
      if (error) throw error;
      setMessage({ text: `Berhasil menghapus ${role}`, type: 'success' });
      fetchData();
    } catch (err: any) {
      setMessage({ text: 'Gagal menghapus: ' + err.message, type: 'error' });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setLoading(true);
    const tableName = role === 'guru' ? 'guru' : 'walas';
    const idColumn = role === 'guru' ? 'guruId' : 'walasId';

    const dataToUpdate: any = {
      nama: formData.nama,
      nip: formData.nip,
      email: formData.email,
      pw: formData.pw,
    };

    if (role === 'walas') {
      dataToUpdate.kelasId = parseInt(formData.kelasId);
    }

    try {
      const { error } = await supabase
        .from(tableName)
        .update(dataToUpdate)
        .eq(idColumn, editingId);

      if (error) throw error;
      setMessage({ text: `Berhasil update ${role}`, type: 'success' });
      handleCloseEdit();
      fetchData();
    } catch (err: any) {
      setMessage({ text: 'Gagal update: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tableName = role === 'guru' ? 'guru' : 'walas';

    const dataToInsert: any = {
      nama: formData.nama,
      nip: formData.nip,
      email: formData.email,
      pw: formData.pw,
      foto_url: 'EMPTY' // Default value sesuai screenshot database
    };

    if (role === 'walas') {
      dataToInsert.kelasId = parseInt(formData.kelasId);
    }

    try {
      const { error } = await supabase.from(tableName).insert([dataToInsert]);
      if (error) throw error;

      setMessage({ text: `Berhasil mendaftarkan ${role}`, type: 'success' });
      setFormData({ nama: '', nip: '', email: '', pw: '', kelasId: '' });
      fetchData();
    } catch (err: any) {
      setMessage({ text: 'Gagal: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.topBarTitle}>
          <span className={styles.topBarBadge}>Admin Portal</span>
          <h1 className={styles.topBarHeading}>Manajemen Akun</h1>
          <p className={styles.topBarSub}>SMK Negeri 1 Cibinong</p>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>⎋ Logout</button>
      </div>

      <div className={styles.card}>
        <div className={styles.tabSelector}>
          <button className={role === 'guru' ? styles.activeTab : ''} onClick={() => setRole('guru')}>Guru Produktif</button>
          <button className={role === 'walas' ? styles.activeTab : ''} onClick={() => setRole('walas')}>Wali Kelas</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <h3 className={styles.formTitle}>Tambah Akun {role === 'guru' ? 'Guru' : 'Walas'}</h3>
          <div className={styles.grid}>
            <div className={styles.inputGroup}><label>Nama Lengkap</label><input name="nama" value={formData.nama} onChange={handleChange} required /></div>
            <div className={styles.inputGroup}><label>NIP</label><input name="nip" value={formData.nip} onChange={handleChange} required /></div>
            <div className={styles.inputGroup}><label>Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} required /></div>
            <div className={styles.inputGroup}><label>Password</label><input type="password" name="pw" value={formData.pw} onChange={handleChange} required /></div>
            {role === 'walas' && (
              <div className={styles.inputGroup}>
                <label>Pilih Kelas</label>
                <select name="kelasId" value={formData.kelasId} onChange={handleChange as any} required className={styles.selectInput}>
                  <option value="">-- Pilih Kelas --</option>
                  <option value="1">10 TKP 1</option><option value="2">10 TKP 2</option>
                  <option value="3">11 TKP 1</option><option value="4">11 TKP 2</option>
                </select>
              </div>
            )}
          </div>
          <button type="submit" className={styles.saveButton} disabled={loading}>{loading ? 'Memproses...' : 'Simpan Akun'}</button>
          {message.text && <p className={message.type === 'success' ? styles.successMsg : styles.errorMsg}>{message.text}</p>}
        </form>

        <hr className={styles.divider} />

        <div className={styles.tableWrapper}>
          <h3 className={styles.formTitle}>Daftar Akun {role === 'guru' ? 'Guru' : 'Walas'}</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>PP</th>
                <th>Nama</th>
                <th>NIP</th>
                <th>Kredensial</th>
                {role === 'walas' && <th>Kelas</th>}
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataList.length > 0 ? (
                dataList.map((item) => (
                  <tr key={item.guruId || item.walasId}>
                    <td>
                      <div className={styles.ppCircle}>
                        {/* LOGIKA FOTO PROFILE: Cek foto_url */}
                        {item.foto_url && item.foto_url !== 'EMPTY' ? (
                          <img src={item.foto_url} alt="Profile" className={styles.ppImage} />
                        ) : (
                          <div className={styles.ppFallback}>
                            {item.nama?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={styles.boldText}>{item.nama}</td>
                    <td>{item.nip}</td>
                    <td>
                        <div className={styles.subInfo}>{item.email}</div>
                        <div className={styles.subInfo}>PW: {item.pw}</div>
                    </td>
                    {role === 'walas' && <td><span className={styles.kelasBadge}>{item.kelasId}</span></td>}
                    <td>
                      <div className={styles.actionButtons}>
                        <button className={styles.editBtn} onClick={() => handleEditClick(item)}>Edit</button>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(role === 'guru' ? item.guruId : item.walasId)}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className={styles.emptyRow}>Belum ada data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDIT (Tetap Ada) */}
      {showEditModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Edit Akun {role.toUpperCase()}</h3>
              <button className={styles.closeBtn} onClick={handleCloseEdit}>✕</button>
            </div>
            <form onSubmit={handleUpdate} className={styles.form}>
                <div className={styles.grid}>
                    <div className={styles.inputGroup}><label>Nama</label><input name="nama" value={formData.nama} onChange={handleChange} required /></div>
                    <div className={styles.inputGroup}><label>NIP</label><input name="nip" value={formData.nip} onChange={handleChange} required /></div>
                    <div className={styles.inputGroup}><label>Email</label><input name="email" value={formData.email} onChange={handleChange} required /></div>
                    <div className={styles.inputGroup}><label>Password</label><input name="pw" value={formData.pw} onChange={handleChange} required /></div>
                </div>
                <div className={styles.modalActions}>
                    <button type="submit" className={styles.saveButton} disabled={loading}>Update</button>
                    <button type="button" className={styles.cancelButton} onClick={handleCloseEdit}>Batal</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
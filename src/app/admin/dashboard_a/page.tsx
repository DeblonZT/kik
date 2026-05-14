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
      let query = supabase.from(tableName).select('*');
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        const { data: dataFallback, error: errorFallback } = await supabase
          .from(tableName)
          .select('*');

        if (errorFallback) {
          setDataList([]);
        } else {
          setDataList(dataFallback || []);
        }
      } else {
        setDataList(data || []);
      }
    } catch (err: any) {
      setDataList([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getInitials = (nama: string) => {
    return nama
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
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
    if (!confirm('Apakah Anda yakin? Data di tabel Sesi yang terkait juga akan terhapus.')) return;
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

    // Filter data agar tidak mengirim kolom yang tidak ada
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

      setMessage({ text: `Berhasil mengupdate ${role}`, type: 'success' });
      handleCloseEdit();
      fetchData();
    } catch (err: any) {
      setMessage({ text: 'Gagal mengupdate: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    const tableName = role === 'guru' ? 'guru' : 'walas';

    // 1. Buat objek data dasar yang ada di kedua tabel
    const dataToInsert: any = {
      nama: formData.nama,
      nip: formData.nip,
      email: formData.email,
      pw: formData.pw,
    };

    // 2. HANYA tambahkan kelasId jika role-nya adalah walas
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
      // Error "Could not find kelasId" tidak akan muncul lagi di sini
      setMessage({ text: 'Gagal: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* TOP BAR — di luar card */}
      <div className={styles.topBar}>
        <div className={styles.topBarTitle}>
          <span className={styles.topBarBadge}>Admin Portal</span>
          <h1 className={styles.topBarHeading}>Manajemen Akun</h1>
          <p className={styles.topBarSub}>SMK Negeri 1 Cibinong</p>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          ⎋ Logout
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.tabSelector}>
          <button className={role === 'guru' ? styles.activeTab : ''} onClick={() => setRole('guru')}>
            Guru Produktif
          </button>
          <button className={role === 'walas' ? styles.activeTab : ''} onClick={() => setRole('walas')}>
            Wali Kelas
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <h3 className={styles.formTitle}>Tambah Akun {role === 'guru' ? 'Guru' : 'Walas'}</h3>
          <div className={styles.grid}>
            <div className={styles.inputGroup}>
              <label>Nama Lengkap</label>
              <input name="nama" value={formData.nama} onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label>NIP</label>
              <input name="nip" value={formData.nip} onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Password</label>
              <input type="password" name="pw" value={formData.pw} onChange={handleChange} required />
            </div>
            {role === 'walas' && (
              <div className={styles.inputGroup}>
                <label>Pilih Kelas</label>
                <select name="kelasId" value={formData.kelasId} onChange={handleChange as any} required className={styles.selectInput}>
                  <option value="">-- Pilih Kelas --</option>
                  <option value="1">10 TKP 1</option>
                  <option value="2">10 TKP 2</option>
                  <option value="3">11 TKP 1</option>
                  <option value="4">11 TKP 2</option>
                </select>
              </div>
            )}
          </div>
          <button type="submit" className={styles.saveButton} disabled={loading}>
            {loading ? 'Memproses...' : 'Simpan Akun'}
          </button>
          {message.text && <p className={message.type === 'success' ? styles.successMsg : styles.errorMsg}>{message.text}</p>}
        </form>

        <hr className={styles.divider} />

        <div className={styles.tableWrapper}>
          <h3 className={styles.formTitle}>Daftar Akun {role === 'guru' ? 'Guru' : 'Walas'}</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nama</th>
                <th>NIP</th>
                <th>Email</th>
                {role === 'walas' && <th>ID Kelas</th>}
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataList.length > 0 ? (
                dataList.map((item, index) => {
                  const dbId = role === 'guru' ? item.guruId : item.walasId;
                  const uniqueKey = dbId ?? `row-${role}-${index}`;

                  return (
                    <tr key={uniqueKey}>
                      <td>
                        <div className={styles.avatarInitials}>{getInitials(item.nama || 'User')}</div>
                      </td>
                      <td>{item.nama}</td>
                      <td>{item.nip}</td>
                      <td>{item.email}</td>
                      {role === 'walas' && <td>{item.kelasId}</td>}
                      <td>
                        <div className={styles.actionButtons}>
                          <button className={styles.editBtn} onClick={() => handleEditClick(item)}>Edit</button>
                          <button className={styles.deleteBtn} onClick={() => handleDelete(dbId)}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr key="empty-row">
                  <td colSpan={role === 'walas' ? 5 : 4} className={styles.emptyRow}>Belum ada data.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showEditModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3>Edit Akun {role === 'guru' ? 'Guru' : 'Walas'}</h3>
                <button className={styles.closeBtn} onClick={handleCloseEdit}>✕</button>
              </div>
              <form onSubmit={handleUpdate} className={styles.form}>
                <div className={styles.grid}>
                  <div className={styles.inputGroup}>
                    <label>Nama Lengkap</label>
                    <input name="nama" value={formData.nama} onChange={handleChange} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>NIP</label>
                    <input name="nip" value={formData.nip} onChange={handleChange} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Password</label>
                    <input type="password" name="pw" value={formData.pw} onChange={handleChange} required />
                  </div>
                  {role === 'walas' && (
                    <div className={styles.inputGroup}>
                      <label>Pilih Kelas</label>
                      <select name="kelasId" value={formData.kelasId} onChange={handleChange as any} required className={styles.selectInput}>
                        <option value="">-- Pilih Kelas --</option>
                        <option value="1">X TKP 1</option>
                        <option value="2">X TKP 2</option>
                        <option value="3">XI TKP 1</option>
                        <option value="4">XI TKP 2</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className={styles.modalActions}>
                  <button type="submit" className={styles.saveButton} disabled={loading}>
                    {loading ? 'Memproses...' : 'Simpan Perubahan'}
                  </button>
                  <button type="button" className={styles.cancelButton} onClick={handleCloseEdit}>
                    Batal
                  </button>
                </div>
              </form>
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
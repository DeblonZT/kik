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
  const [admin, setAdmin] = useState<any>(null);

  // State Modal Edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nama: '',
    nip: '',
    email: '',
    pw: '',
    kelasId: '',
    foto_profile: '' // Nama kolom disamakan dengan database kamu
  });

  useEffect(() => {
    const session = localStorage.getItem("adminSession");
    if (!session) {
      router.push('/admin');
    } else {
      setAdmin(JSON.parse(session));
    }
  }, [router]);

  const fetchData = async () => {
    const tableName = role === 'guru' ? 'guru' : 'walas';
    try {
      const { data, error } = await supabase.from(tableName).select('*');
      if (error) throw error;
      const idCol = role === 'guru' ? 'guruId' : 'walasId';
      setDataList((data || []).sort((a, b) => b[idCol] - a[idCol]));
    } catch (err) {
      setDataList([]);
    }
  };

  useEffect(() => { if (admin) fetchData(); }, [role, admin]);

  // FUNGSI FOTO: Mengambil Public URL dari bucket 'guru-photos'
  const getPhotoUrl = (fileName: string) => {
    if (!fileName || fileName === '') return null;

    const { data } = supabase.storage
      .from('guru-photos')
      .getPublicUrl(fileName);

    return `${data.publicUrl}?t=${new Date().getTime()}`;
  };

  const getInitials = (nama: string) => nama ? nama.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '??';
  
  const getAvatarColor = (nama: string) => {
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
    return colors[nama ? nama.length % colors.length : 0];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // CRUD: TAMBAH DATA
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tableName = role === 'guru' ? 'guru' : 'walas';
    const dataToInsert: any = {
        nama: formData.nama,
        nip: formData.nip,
        email: formData.email,
        pw: formData.pw,
        foto_profile: formData.foto_profile
    };
    if (role === 'walas') dataToInsert.kelasId = parseInt(formData.kelasId);

    try {
      const { error } = await supabase.from(tableName).insert([dataToInsert]);
      if (error) throw error;
      setMessage({ text: `Berhasil menambah ${role}`, type: 'success' });
      setFormData({ nama: '', nip: '', email: '', pw: '', kelasId: '', foto_profile: '' });
      fetchData();
    } catch (err: any) {
      setMessage({ text: 'Gagal: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // CRUD: EDIT (Buka Modal)
  const handleEditOpen = (item: any) => {
    setEditingId(role === 'guru' ? item.guruId : item.walasId);
    setFormData({
      nama: item.nama || '',
      nip: item.nip || '',
      email: item.email || '',
      pw: item.pw || '',
      kelasId: item.kelasId?.toString() || '',
      foto_profile: item.foto_profile || ''
    });
    setShowEditModal(true);
  };

  // CRUD: UPDATE
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const idCol = role === 'guru' ? 'guruId' : 'walasId';
    try {
      const { error } = await supabase.from(role).update(formData).eq(idCol, editingId);
      if (error) throw error;
      alert("Update Berhasil!");
      setShowEditModal(false);
      fetchData();
    } catch (err: any) {
      alert("Gagal update: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // CRUD: HAPUS
  const handleDelete = async (item: any) => {
    const idCol = role === 'guru' ? 'guruId' : 'walasId';
    if (!confirm(`Hapus akun ${item.nama}?`)) return;
    try {
      const { error } = await supabase.from(role).delete().eq(idCol, item[idCol]);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert("Gagal hapus: " + err.message);
    }
  };

  if (!admin) return null;

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.topBarTitle}>
          <h1 className={styles.topBarHeading}>Admin Portal</h1>
          <p className={styles.topBarSub}>Login as: {admin.nama}</p>
        </div>
        <button onClick={() => {localStorage.removeItem("adminSession"); router.push('/admin');}} className={styles.logoutBtn}>Logout</button>
      </div>

      <div className={styles.card}>
        <div className={styles.tabSelector}>
          <button className={role === 'guru' ? styles.activeTab : ''} onClick={() => setRole('guru')}>Guru</button>
          <button className={role === 'walas' ? styles.activeTab : ''} onClick={() => setRole('walas')}>Wali Kelas</button>
        </div>

        {/* FORM TAMBAH */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <h3 className={styles.formTitle}>Tambah {role} Baru</h3>
          <div className={styles.grid}>
            <div className={styles.inputGroup}><label>Nama</label><input name="nama" value={formData.nama} onChange={handleChange} required /></div>
            <div className={styles.inputGroup}><label>NIP</label><input name="nip" value={formData.nip} onChange={handleChange} required /></div>
            <div className={styles.inputGroup}><label>Email</label><input name="email" value={formData.email} onChange={handleChange} required /></div>
            <div className={styles.inputGroup}><label>Password</label><input name="pw" value={formData.pw} onChange={handleChange} required /></div>
            <div className={styles.inputGroup}><label>File Foto (di Storage)</label><input name="foto_profile" value={formData.foto_profile} onChange={handleChange} placeholder="Contoh: guru1.jpg" /></div>
            {role === 'walas' && (
              <div className={styles.inputGroup}>
                <label>Kelas</label>
                <select name="kelasId" value={formData.kelasId} onChange={handleChange} required>
                   <option value="">-- Pilih --</option>
                   <option value="1">10 TKP 1</option>
                   <option value="2">10 TKP 2</option>
                </select>
              </div>
            )}
          </div>
          <button type="submit" className={styles.saveButton} disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Akun'}</button>
          {message.text && <p className={message.type === 'success' ? styles.successMsg : styles.errorMsg}>{message.text}</p>}
        </form>

        <hr className={styles.divider} />

        {/* TABEL DATA */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nama / NIP</th>
                <th>Kredensial</th>
                {role === 'walas' && <th>Kelas</th>}
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataList.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <div 
                      className={styles.avatarCircle} 
                      style={{ backgroundColor: getAvatarColor(item.nama) }}
                    >
                      {item.foto_profile ? (
                        <img 
                          src={getPhotoUrl(item.foto_profile)!} 
                          alt="Profile"
                          className={styles.avatarImg}
                          onLoad={(e) => {
                            (e.target as HTMLImageElement).parentElement!.style.backgroundColor = 'transparent';
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerText = getInitials(item.nama);
                          }}
                        />
                      ) : (
                        getInitials(item.nama)
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.nameText}>{item.nama}</div>
                    <div className={styles.subText}>{item.nip}</div>
                  </td>
                  <td>
                    <div className={styles.subText}>{item.email}</div>
                    <div className={styles.subText}>PW: {item.pw}</div>
                  </td>
                  {role === 'walas' && <td><span className={styles.badgeKelas}>{item.kelasId}</span></td>}
                  <td>
                    <div className={styles.actionButtons}>
                      <button className={styles.editBtn} onClick={() => handleEditOpen(item)}>Edit</button>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(item)}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDIT */}
      {showEditModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Edit Akun {role}</h3>
            <form onSubmit={handleUpdate} className={styles.formEdit}>
              <div className={styles.inputGroup}><label>Nama</label><input name="nama" value={formData.nama} onChange={handleChange} /></div>
              <div className={styles.inputGroup}><label>NIP</label><input name="nip" value={formData.nip} onChange={handleChange} /></div>
              <div className={styles.inputGroup}><label>Email</label><input name="email" value={formData.email} onChange={handleChange} /></div>
              <div className={styles.inputGroup}><label>Password</label><input name="pw" value={formData.pw} onChange={handleChange} /></div>
              <div className={styles.inputGroup}><label>Nama File Foto</label><input name="foto_profile" value={formData.foto_profile} onChange={handleChange} /></div>
              <div className={styles.modalActions}>
                <button type="submit" disabled={loading}>Update</button>
                <button type="button" onClick={() => setShowEditModal(false)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
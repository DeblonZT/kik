'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import './profile.css';

export default function ProfileGuru() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const session = localStorage.getItem('userSession');
    
    if (!session) {
      router.push('/');
    } else {
      const parsedUser = JSON.parse(session);
      // Panggil fungsi untuk ambil data terbaru dari DB
      fetchLatestUserData(parsedUser);
    }
  }, []);

  // FUNGSI BARU: Ambil data terbaru dari Supabase agar sinkron
  const fetchLatestUserData = async (sessionData: any) => {
    try {
      const tableTarget = sessionData.role === 'Walas' ? 'walas' : 'guru';
      const idColumn = sessionData.role === 'Walas' ? 'walasId' : 'guruId';

      const { data, error } = await supabase
        .from(tableTarget)
        .select('*')
        .eq(idColumn, sessionData.id)
        .single();

      if (error) throw error;

      if (data) {
        // Gabungkan data sesi lama (role, id) dengan data terbaru dari DB (nip, email, foto_url)
        const updatedData = {
          ...sessionData,
          nama: data.nama,
          nip: data.nip,
          email: data.email,
          foto_url: data.foto_url
        };
        setUserData(updatedData);
        // Update localStorage agar sinkron untuk penggunaan selanjutnya
        localStorage.setItem('userSession', JSON.stringify(updatedData));
      }
    } catch (err) {
      console.error("Gagal sinkronisasi data:", err);
      // Jika gagal fetch, tetap tampilkan data dari session sebagai fallback
      setUserData(sessionData);
    }
  };

  const deleteOldPhoto = async (photoUrl: string) => {
    if (!photoUrl || !photoUrl.includes('guru-photos')) return; 
    try {
      const pathParts = photoUrl.split('/guru-photos/');
      const filePath = pathParts[1];
      if (filePath) {
        await supabase.storage.from('guru-photos').remove([filePath]);
      }
    } catch (error) {
      console.error("Gagal hapus foto lama:", error);
    }
  };

  const handleUploadFoto = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert("Hanya file gambar yang diperbolehkan!");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file terlalu besar! Maksimal 5MB.");
      return;
    }

    setLoading(true);
    try {
      if (userData.foto_url) {
        await deleteOldPhoto(userData.foto_url);
      }

      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${userData.id}-${timestamp}.${fileExt}`;
      const filePath = `guru/${userData.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('guru-photos')
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('guru-photos')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl;
      const tableTarget = userData.role === 'Walas' ? 'walas' : 'guru';
      const idColumn = userData.role === 'Walas' ? 'walasId' : 'guruId';

      const { error: updateError } = await supabase
        .from(tableTarget)
        .update({ foto_url: publicUrl })
        .eq(idColumn, userData.id);

      if (updateError) throw updateError;

      const updated = { ...userData, foto_url: publicUrl };
      setUserData(updated);
      localStorage.setItem('userSession', JSON.stringify(updated));
      alert("Foto profil berhasil diperbarui!");
      window.location.reload();
      
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !userData) return <div className="profile-page-container"><p>Loading...</p></div>;

  return (
    <div className="profile-page-container">
      <button onClick={() => router.back()} className="btn-back">← Kembali</button>
      
      <div className="profile-card-large">
        <div className="profile-header-section">
          <div className="avatar-upload-group">
            {userData.foto_url ? (
              <img src={userData.foto_url} alt="Profile" className="large-avatar" />
            ) : (
              <div className="large-initial">{userData.nama?.charAt(0) || '?'}</div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadFoto(file);
              }}
              disabled={loading}
            />
            <button 
              className="btn-change-photo"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              {loading ? 'Mengunggah...' : 'Ganti Foto'}
            </button>
          </div>

          <div className="profile-main-info">
            <h1>{userData.nama}</h1>
            <span className="badge-role">{userData.role}</span>
          </div>
        </div>

        <hr />

        <div className="profile-details-grid">
          <div className="detail-item">
            <label>NIP / Nomor Induk</label>
            {/* Sekarang mengambil data terbaru dari database */}
            <p style={{fontWeight: '700'}}>{userData.nip || 'Belum diatur'}</p>
          </div>
          
          <div className="detail-item">
            <label>ID Pengguna</label>
            <p style={{fontWeight: '700', color: '#444'}}>#{userData.id}</p>
          </div>

          <div className="detail-item">
            <label>Email Terkait</label>
            {/* Sekarang mengambil data terbaru dari database */}
            <p style={{fontWeight: '700'}}>{userData.email || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
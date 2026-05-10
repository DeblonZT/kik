'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import './profile.css';

export default function ProfilePage() {
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
      fetchLatestUserData(parsedUser);
    }
  }, [router]);

  const fetchLatestUserData = async (sessionData: any) => {
    try {
      const role = sessionData.role?.toLowerCase();
      const isWalas = role === 'walas';
      
      const tableTarget = isWalas ? 'walas' : 'guru';
      // Menggunakan penamaan kolom sesuai database kamu
      const idColumn = isWalas ? 'walasId' : 'guruId';

      const { data, error } = await supabase
        .from(tableTarget)
        .select('*')
        .eq(idColumn, sessionData.id)
        .single();

      if (error) {
        console.error("Supabase Query Error:", error.message);
        throw error;
      }

      if (data) {
        const updatedData = {
          ...sessionData,
          nama: data.nama,
          nip: data.nip,
          email: data.email,
          foto_url: data.foto_url
        };
        setUserData(updatedData);
        localStorage.setItem('userSession', JSON.stringify(updatedData));
      }
    } catch (err: any) {
      console.error("Gagal sinkronisasi data:", err.message || err);
      setUserData(sessionData);
    }
  };

  const handleUploadFoto = async (file: File) => {
    if (!file) return;
    setLoading(true);
    
    try {
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${userData.id}-${timestamp}.${fileExt}`;
      const folderRole = userData.role?.toLowerCase() === 'walas' ? 'walas' : 'guru';
      const filePath = `${folderRole}/${userData.id}/${fileName}`;

      // Upload ke storage guru-photos
      const { error: uploadError } = await supabase.storage
        .from('guru-photos')
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('guru-photos')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl;

      const role = userData.role?.toLowerCase();
      const tableTarget = role === 'walas' ? 'walas' : 'guru';
      const idColumn = role === 'walas' ? 'walasId' : 'guruId';

      // Update kolom foto_url berdasarkan guruId/walasId
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
      alert("Error: " + (error.message || "Gagal mengunggah foto"));
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !userData) return <div className="profile-page-container"><p>Memuat...</p></div>;

  return (
    <div className="profile-page-container">
      <button onClick={() => router.back()} className="btn-back">← Kembali</button>
      
      <div className="profile-card-large">
        <div className="profile-header-section">
          <div className="avatar-upload-group">
            {userData.foto_url && userData.foto_url !== "EMPTY" ? (
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
            <label>NIP</label>
            <p className="detail-value">{userData.nip || 'Belum diatur'}</p>
          </div>
          
          <div className="detail-item">
            <label>ID Pengguna</label>
            <p className="detail-value" style={{ color: '#64748b' }}>#{userData.id}</p>
          </div>

          <div className="detail-item">
            <label>Email</label>
            <p className="detail-value">{userData.email || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
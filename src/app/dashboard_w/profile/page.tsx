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

  // useEffect ini HANYA jalan di Client setelah render pertama
  useEffect(() => {
    setMounted(true);
    
    const session = localStorage.getItem('userSession');
    if (!session) {
      router.push('/');
    } else {
      setUserData(JSON.parse(session));
    }
  }, []);

  // Perbaikan fungsi hapus foto lama
  const deleteOldPhoto = async (photoUrl: string) => {
    if (!photoUrl) return;

    // Cek apakah foto memang berasal dari storage Supabase kita
    if (!photoUrl.includes('guru-photos')) return; 

    try {
      // Ambil path setelah nama bucket
      // URL format: https://.../storage/v1/object/public/guru-photos/guru/ID/file.jpg
      const pathParts = photoUrl.split('/guru-photos/');
      const filePath = pathParts[1]; // Ini akan mengambil 'guru/ID/file.jpg'

      if (filePath) {
        await supabase.storage
          .from('guru-photos')
          .remove([filePath]);
        console.log("Foto lama dihapus:", filePath);
      }
    } catch (error) {
      console.error("Gagal hapus foto lama:", error);
    }
  };

  // Fungsi untuk upload foto baru
  const handleUploadFoto = async (file: File) => {
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      alert("Hanya file gambar yang diperbolehkan!");
      return;
    }

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file terlalu besar! Maksimal 5MB.");
      return;
    }

    setLoading(true);

    try {
      // Hapus foto lama terlebih dahulu
      if (userData.foto_url) {
        await deleteOldPhoto(userData.foto_url);
      }

      // Generate nama file unik dengan timestamp
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${userData.id}-${timestamp}.${fileExt}`;
      const filePath = `guru/${userData.id}/${fileName}`;

      // Upload file baru ke Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('guru-photos')
        .upload(filePath, file, { upsert: false });

      if (uploadError) {
        alert("Gagal upload foto: " + uploadError.message);
        setLoading(false);
        return;
      }

      // Dapatkan public URL dari file yang baru di-upload
      const { data: publicUrlData } = supabase.storage
        .from('guru-photos')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl;

      // Update database dengan URL foto baru
      const tableTarget = userData.role === 'Walas' ? 'walas' : 'guru';
      const idColumn = userData.role === 'Walas' ? 'walasId' : 'guruId';

      const { error: updateError } = await supabase
        .from(tableTarget)
        .update({ foto_url: publicUrl })
        .eq(idColumn, userData.id);

      if (updateError) {
        alert("Gagal menyimpan data: " + updateError.message);
      } else {
        const updated = { ...userData, foto_url: publicUrl };
        setUserData(updated);
        localStorage.setItem('userSession', JSON.stringify(updated));
        alert("Foto profil berhasil diperbarui!");
        
        // Refresh halaman setelah 1 detik
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!mounted || !userData) return <div className="profile-page-container"><p>Loading...</p></div>;

  return (
    <div className="profile-page-container">
      <button onClick={() => router.back()} className="btn-back">← Kembali</button>
      
      <div className="profile-card-large">
        <div className="profile-header-section">
          {/* Bagian Foto */}
          <div className="avatar-upload-group">
            {userData.foto_url ? (
              <img src={userData.foto_url} alt="Profile" className="large-avatar" />
            ) : (
              <div className="large-initial">{userData.nama.charAt(0)}</div>
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
            <p>{userData.nip || 'Belum diatur'}</p>
          </div>
          <div className="detail-item">
            <label>Status Akun</label>
            <p className="status-active">Aktif</p>
          </div>
          <div className="detail-item">
            <label>Email Terkait</label>
            <p>{userData.email || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
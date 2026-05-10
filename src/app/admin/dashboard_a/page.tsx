"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./dashboard_a.module.css";

export default function AdminDashboard() {
  const router = useRouter();
  
  // SEMUA HOOKS WAJIB DI ATAS (Urutan tidak boleh berubah)
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true); // Tambahkan state loading jika perlu

  useEffect(() => {
    const session = localStorage.getItem("adminSession");
    if (!session) {
      alert("Anda harus login terlebih dahulu!");
      router.push("/admin");
    } else {
      setAdmin(JSON.parse(session));
    }
    setLoading(false);
  }, [router]);

  // LOGIKA RENDER (Setelah semua hooks dipanggil)
  if (loading) {
    return <div className="loading-screen">Memproses sesi...</div>;
  }

  if (!admin) {
    return null; // Atau pesan error akses ditolak
  }

  return (
    <div className="dashboard-container">
      <header className="header-admin">
        <h1>Selamat Datang, {admin.nama}</h1>
        <p>Role: {admin.role}</p>
      </header>
      
      <main className="content">
        {/* Konten Dashboard Admin Kamu */}
        <div className="card">
          <h3>Statistik Sistem</h3>
          <p>Kelola data guru, siswa, dan kelas di sini.</p>
        </div>
      </main>
    </div>
  );
}
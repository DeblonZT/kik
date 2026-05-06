'use client';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, ClipboardList, Users, BarChart3 } from 'lucide-react';

export default function WalasHome() {
  const router = useRouter();

  const menuItems = [
    {
      title: 'Daftar Siswa',
      desc: 'Lihat dan kelola data kelas Anda',
      icon: <Users className="text-blue-500" size={28} />, // Ikon sedikit lebih besar
      bgColor: '#eff6ff',
      path: '/dashboard_w/daftarSiswa'
    },
    {
      title: 'Rekap Absensi',
      desc: 'Lihat rekapitulasi murid kelas binaan',
      icon: <ClipboardList className="text-emerald-500" size={28} />,
      bgColor: '#ecfdf5',
      path: '/dashboard_w/rekapAbsensi'
    },
    
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh]">
      {/* Sapaan Tengah */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-slate-800 mb-4 tracking-tight">
          Selamat Datang, Bapak/Ibu!
        </h1>
        <p className="text-slate-500 text-xl font-medium">
          Silakan pilih menu di bawah untuk memulai aktivitas.
        </p>
      </div>

      {/* Grid Menu yang Lebih Lebar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl"> {/* Max-w dinaikkan ke 5xl */}
        {menuItems.map((item, idx) => (
          <div
            key={idx}
            onClick={() => router.push(item.path)}
            className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex items-center gap-8" // Padding & Gap diperbesar
          >
            {/* Box Icon yang Lebih Besar */}
            <div 
              className="w-20 h-20 rounded-3xl flex items-center justify-center flex-shrink-0" // W & H naik ke 20
              style={{ backgroundColor: item.bgColor }}
            >
              {item.icon}
            </div>
            
            {/* Text Content */}
            <div className="text-left">
              <h3 className="text-2xl font-bold text-slate-800">{item.title}</h3> {/* Ukuran teks naik */}
              <p className="text-slate-400 text-base mt-2 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ListChecks, Users, BookOpen, BarChart3, BookOpenText, School } from 'lucide-react';

export default function DashboardGuru() {
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (!session) {
      router.push('/');
    }
  }, [router]);

  const menuItems = [
    {
      title: 'Mata Pelajaran',
      desc: 'Kelola mata pelajaran Anda',
      icon: <BookOpenText className="text-blue-500" size={28} />,
      bgColor: '#eff6ff',
      path: '/dashboard_g/mapel'
    },
    {
      title: 'Daftar Sesi',
      desc: 'Lihat dan kelola data kelas Anda',
      icon: <School className="text-indigo-500" size={28} />,
      bgColor: '#eef2ff',
      path: '/dashboard_g/daftarKelas'
    },


    {
      title: 'Presentasi',
      desc: 'Lihat presentasi dan statistik',
      icon: <BarChart3 className="text-slate-500" size={28} />,
      bgColor: '#f8fafc',
      path: '/dashboard_g/presentasi'
    },
    {
      title: 'Absensi Murid',
      desc: 'Mulai mengabsensi murid hari ini',
      icon: <ListChecks className="text-emerald-500" size={28} />,
      bgColor: '#ecfdf5',
      path: '/dashboard_g/absensi'
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh]">
      {/* Sapaan Tengah - Sesuai SS */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-slate-800 mb-4 tracking-tight">
          Selamat Datang, Bapak/Ibu Guru!
        </h1>
        <p className="text-slate-500 text-xl font-medium">
          Silakan pilih menu di bawah untuk memulai aktivitas.
        </p>
      </div>

      {/* Grid Shortcut - Ukuran Besar Identik Walas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {menuItems.map((item, idx) => (
          <div
            key={idx}
            onClick={() => router.push(item.path)}
            className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex items-center gap-8"
          >
            {/* Box Icon Soft Color */}
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: item.bgColor }}
            >
              {item.icon}
            </div>

            {/* Text Content */}
            <div className="text-left">
              <h3 className="text-2xl font-bold text-slate-800">{item.title}</h3>
              <p className="text-slate-400 text-base mt-2 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
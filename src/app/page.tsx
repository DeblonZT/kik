import Link from 'next/link';
import { Clock, CheckCircle, ShieldCheck } from 'lucide-react'; // Opsional: jika kamu pakai lucide-react

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-800 font-sans">
      {/* Navigation Simple */}
      <nav className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <img src="/images/logo_tkp.png" alt="Logo" className="w-10 h-10" />
          <span className="text-2xl font-bold text-blue-700 tracking-tight">E-Monitoring</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-500">
          <span>Panduan</span>
          <span>Bantuan</span>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif font-semibold text-slate-900 leading-tight">
              Selamat Datang di Portal <br />
              <span className="text-blue-600 underline decoration-blue-100 underline-offset-8">Absensi Terpadu</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Silakan masuk untuk mencatat kehadiran harian Anda. Pastikan jam perangkat Anda sudah sesuai untuk keakuratan data.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Link 
              href="/login" 
              className="w-full md:w-64 py-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-bold text-lg rounded-md shadow-md transition-all active:scale-95"
            >
              Masuk ke Sistem
            </Link>
            <p className="text-xs text-slate-400 italic">
              *Gunakan akun yang telah didaftarkan oleh admin.
            </p>
          </div>
        </div>

        {/* Feature Cards (Mudah dipahami kalangan tua) */}
        <div className="grid gap-4">
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
              <CheckCircle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Cepat & Mudah</h3>
              <p className="text-sm text-slate-500 text-pretty">Hanya perlu sekali klik untuk mencatat kehadiran Anda setiap hari.</p>
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-lg text-green-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Data Aman</h3>
              <p className="text-sm text-slate-500">Seluruh data presensi tersimpan dengan aman di server instansi.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Simple Footer */}
      <footer className="text-center py-10 border-t border-slate-50 text-slate-400 text-sm">
        &copy; 2026 Sistem Informasi Absensi. All rights reserved.
      </footer>
    </main>
  );
}
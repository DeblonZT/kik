import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const { data: user, error } = await supabase
      .from('admin')
      .select('nama, pw')
      .eq('nama', username)
      .single();

    if (error || !user) {
      return NextResponse.json({ message: 'Username tidak ditemukan' }, { status: 401 });
    }

    // Perbandingan plain text (pw di DB vs password dari input)
    if (String(user.pw) !== String(password)) {
      return NextResponse.json({ message: 'Password salah' }, { status: 401 });
    }

    // Kirim data user ke client untuk disimpan di LocalStorage
    return NextResponse.json({
      message: 'Login Berhasil',
      user: {
        nama: user.nama,
        role: 'Admin'
      }
    }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ message: 'Error Server' }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { createConnection } from "@/lib/db.js";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const kelasId = searchParams.get('kelasId') || '';
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    const db = await createConnection();

    let where = 'WHERE 1=1';
    const params = [];

    if (search) {
      where += ' AND k.namaKelas LIKE ?';
      params.push(`%${search}%`);
    }
    if (kelasId) {
      where += ' AND a.kelasId = ?';
      params.push(kelasId);
    }

    // JOIN ke tabel kelas untuk ambil namaKelas
    const [rows] = await db.execute(
      `SELECT a.tableId, a.kelasId, k.namaKelas, a.tanggal, a.keterangan
       FROM absensi a
       JOIN kelas k ON a.kelasId = k.kelasId
       ${where}
       ORDER BY a.tableId DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    const [total] = await db.execute(
      `SELECT COUNT(*) as count
       FROM absensi a
       JOIN kelas k ON a.kelasId = k.kelasId
       ${where}`,
      params
    );

    return NextResponse.json({
      success: true,
      data: rows,
      totalPages: Math.ceil(total[0].count / limit) || 1,
      currentPage: page,
    });

  } catch (error) {
    console.error("❌ GET Error:", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { kelasId, tanggal, keterangan } = await request.json();

    if (!kelasId || !tanggal) {
      return NextResponse.json(
        { success: false, message: 'Kelas dan tanggal wajib diisi' },
        { status: 400 }
      );
    }

    const db = await createConnection();

    // Simpan sesi absensi
    await db.execute(
      "INSERT INTO absensi (kelasId, tanggal, keterangan) VALUES (?, ?, ?)",
      [kelasId, tanggal, keterangan || null]
    );

    return NextResponse.json({ success: true, message: 'Sesi absensi berhasil dibuat' });

  } catch (error) {
    console.error("❌ POST Error:", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json(
      { success: false, message: 'ID tidak ditemukan' },
      { status: 400 }
    );

    const db = await createConnection();
    await db.execute("DELETE FROM absensi WHERE tableId = ?", [id]);

    return NextResponse.json({ success: true, message: 'Sesi berhasil dihapus' });

  } catch (error) {
    console.error("❌ DELETE Error:", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
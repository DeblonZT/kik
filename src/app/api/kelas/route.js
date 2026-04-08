import { NextResponse } from "next/server";
import { createConnection } from "@/lib/db.js";

export async function GET() {
  try {
    const db = await createConnection();
    const [rows] = await db.execute(
      "SELECT kelasId, namaKelas FROM kelas ORDER BY namaKelas ASC"
    );
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("❌ GET Kelas Error:", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
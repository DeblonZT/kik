import { createConnection } from "@/lib/db.js";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { username, password } = await request.json();
        const db = await createConnection();
        
        // Cari admin berdasarkan username
        const sql = "SELECT * FROM admin WHERE nama = ? AND pw = ?";
        const [rows] = await db.execute(sql, [username, password]);

        if (rows.length > 0) {
            return NextResponse.json({ success: true, user: rows[0] }, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Username atau Password salah" }, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
import { createConnection } from "@/lib/db.js";
import { NextResponse } from "next/server";

export async function GET(request) {
    // Ambil parameter 'role' dari URL
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // nilainya bisa 'produktif' atau 'walas'

    try {
        const db = await createConnection();
        
        // Tentukan tabel berdasarkan parameter
        let tableName = "guru"; // default
        if (role === "walas") {
            tableName = "walas";
        }

        // Jalankan query (Gunakan query mentah hanya jika variabel tableName sudah divalidasi)
        const sql = `SELECT * FROM ${tableName}`;
        const [posts] = await db.execute(sql);

        return NextResponse.json({ posts: posts }, { status: 200 });
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
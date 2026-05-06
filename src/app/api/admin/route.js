import { supabase } from "@/lib/supabase.ts";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { username, password } = await request.json();
        
        // Cari admin berdasarkan username dan password
        const { data, error } = await supabase
            .from('admin')
            .select('*')
            .eq('nama', username)
            .eq('pw', password)
            .single();

        if (error || !data) {
            return NextResponse.json({ success: false, message: "Username atau Password salah" }, { status: 401 });
        }

        return NextResponse.json({ success: true, user: data }, { status: 200 });
    } catch (error) {
        console.error('❌ Admin API Error:', error.message);
        return NextResponse.json({ success: false, error: error.message, message: "Error saat login" }, { status: 500 });
    }
}
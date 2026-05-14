import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { createClient } from '@supabase/supabase-js';
import { sessionOptions } from '@/lib/session';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  const { username, password } = await req.json();

  try {
    const { data, error } = await supabase
      .from('admin')
      .select('*')
      .eq('nama', username)
      .eq('pw', password)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const res = NextResponse.json({ success: true });
    const session = await getIronSession(req, res, sessionOptions);
    session.isAdmin = true;
    session.username = username;
    await session.save();

    return res;

  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const res = NextResponse.json({ success: true });
  const session = await getIronSession(req, res, sessionOptions);
  session.destroy();
  return res;
}
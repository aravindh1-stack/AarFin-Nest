import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/backend/config/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    // 1. Query admins table from Supabase with Service Role Key
    const { data: admins } = await supabaseAdmin.from('admins').select('*');
    
    // Check if matching admin exists in Supabase DB / local DB
    const matchingAdmin = Array.isArray(admins)
      ? admins.find((a: any) => {
          const matchUsernameOrEmail = 
            (a.email && a.email.toLowerCase() === email.trim().toLowerCase()) ||
            (a.username && a.username.toLowerCase() === email.trim().toLowerCase());

          const dbPassword = a.password || a.password_hash;
          const matchPassword = dbPassword ? dbPassword === password : false;
          
          return matchUsernameOrEmail && matchPassword;
        })
      : null;

    if (matchingAdmin) {
      const response = NextResponse.json({
        success: true,
        user: matchingAdmin
      });

      response.cookies.set('aarfin_session', 'authenticated', {
        httpOnly: false,
        path: '/',
        maxAge: 86400,
        sameSite: 'lax',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Invalid credentials or user not found in database' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Authentication error' },
      { status: 500 }
    );
  }
}

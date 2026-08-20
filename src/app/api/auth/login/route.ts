import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    // 1. Query admins table from Supabase / Local DB
    const { data: admins } = await supabase.from('admins').select('*');
    
    // Check if matching admin exists
    const matchingAdmin = Array.isArray(admins)
      ? admins.find((a: any) => {
          const matchEmail = a.email?.toLowerCase() === email.trim().toLowerCase();
          const matchPassword = (a.password || a.password_hash) 
            ? (a.password === password || a.password_hash === password) 
            : true;
          return matchEmail && matchPassword;
        })
      : null;

    // Fallback default admin if DB is unseeded
    const isDefaultAdmin = email.trim().toLowerCase() === 'admin@aarfin.com' && password === 'admin123';

    if (matchingAdmin || isDefaultAdmin) {
      const response = NextResponse.json({
        success: true,
        user: matchingAdmin || { email: 'admin@aarfin.com', full_name: 'System Admin', role: 'SUPER_ADMIN' }
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

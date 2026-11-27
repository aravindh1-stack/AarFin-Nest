import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/backend/config/supabaseAdmin';
import { normalizeRole, SessionUser } from '@/lib/auth/rbac';
import { isEmailVerified, storeAuthToken } from '@/lib/auth/tokens';
import { sendTransactionalEmail, buildVerificationEmailHtml } from '@/lib/auth/email';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Query admins table from Supabase with Service Role Key
    const { data: admins } = await supabaseAdmin.from('admins').select('*');
    
    // Check if matching admin exists in Supabase DB
    const matchingAdmin = Array.isArray(admins)
      ? admins.find((a: any) => {
          const matchUsernameOrEmail = 
            (a.email && a.email.toLowerCase() === normalizedEmail) ||
            (a.username && a.username.toLowerCase() === normalizedEmail);

          const dbPassword = a.password || a.password_hash;
          const matchPassword = dbPassword ? dbPassword === password : false;
          
          return matchUsernameOrEmail && matchPassword;
        })
      : null;

    if (!matchingAdmin) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials or user not enrolled in organization allowlist' },
        { status: 401 }
      );
    }

    // 2. Check Email Verification Status
    const verified = await isEmailVerified(matchingAdmin.email || normalizedEmail);
    if (!verified) {
      // Generate verification token and dispatch email in background
      try {
        const token = await storeAuthToken(matchingAdmin.email || normalizedEmail, 'EMAIL_VERIFICATION', 60);
        const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
        const proto = request.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
        const origin = `${proto}://${host}`;
        const verifyUrl = `${origin}/api/auth/verify-email?token=${token}`;

        await sendTransactionalEmail({
          to: matchingAdmin.email || normalizedEmail,
          subject: 'Activate and verify your account - NexFix Financial OS',
          html: buildVerificationEmailHtml(matchingAdmin.full_name || 'Staff Member', verifyUrl),
          text: `Verify your NexFix account: ${verifyUrl}`,
        });
      } catch (emailErr) {
        console.error('Failed to auto-dispatch verification email on unverified login:', emailErr);
      }

      return NextResponse.json(
        {
          success: false,
          errorCode: 'UNVERIFIED_EMAIL',
          email: matchingAdmin.email || normalizedEmail,
          message: 'Your email address has not been verified yet. An activation link has been sent to your inbox.',
        },
        { status: 403 }
      );
    }

    // 3. User is valid and verified! Set session
    const role = normalizeRole(matchingAdmin.role);
    const sessionPayload: SessionUser = {
      id: matchingAdmin.id,
      email: matchingAdmin.email || normalizedEmail,
      name: matchingAdmin.full_name || 'Staff Member',
      role,
      provider: 'credentials',
    };

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
    });

    response.cookies.set('aarfin_session', 'authenticated', {
      httpOnly: false,
      path: '/',
      maxAge: 86400 * 7,
      sameSite: 'lax',
    });

    response.cookies.set('nexfix_session', JSON.stringify(sessionPayload), {
      httpOnly: false,
      path: '/',
      maxAge: 86400 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Authentication error' },
      { status: 500 }
    );
  }
}

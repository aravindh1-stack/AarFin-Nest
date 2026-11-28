import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/backend/config/supabaseAdmin";
import { normalizeRole, SessionUser, PRIMARY_OWNER_EMAIL, UserRole } from "@/lib/auth/rbac";
import { storeAuthToken } from "@/lib/auth/tokens";
import { sendTransactionalEmail, buildVerificationEmailHtml } from "@/lib/auth/email";
import { requirePermission } from "@/lib/auth/api-guard";

// Helper to extract session from request
function getCallerUser(request: NextRequest): SessionUser | null {
  const sessionCookie = request.cookies.get("nexfix_session")?.value;
  if (!sessionCookie) return null;
  try {
    const user = JSON.parse(sessionCookie);
    return {
      ...user,
      role: normalizeRole(user.role, user.email),
    };
  } catch {
    return null;
  }
}

/**
 * GET /api/team - List all staff roster members
 * Accessible to SUPER_ADMIN and ADMIN
 */
export async function GET(request: NextRequest) {
  try {
    const caller = getCallerUser(request);
    if (!caller || (caller.role !== "SUPER_ADMIN" && caller.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized access to team roster" }, { status: 403 });
    }

    const { data: admins, error } = await supabaseAdmin.from("admins").select("*");
    if (error) throw error;

    const roster = (Array.isArray(admins) ? admins : []).map((admin: any) => {
      const email = admin.email || "";
      const normalizedRole = normalizeRole(admin.role, email);

      return {
        id: admin.id,
        name: admin.full_name || email.split("@")[0] || "Staff Member",
        email: email,
        role: normalizedRole,
        isPrimaryOwner: email.toLowerCase().trim() === PRIMARY_OWNER_EMAIL,
        createdAt: admin.created_at,
        status: "ACTIVE",
      };
    });

    return NextResponse.json({
      success: true,
      currentUserRole: caller.role,
      isSuperAdmin: caller.role === "SUPER_ADMIN",
      members: roster,
    });
  } catch (err: any) {
    console.error("Failed to fetch team members:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch team roster" }, { status: 500 });
  }
}

/**
 * POST /api/team - Invite a new staff member and send verification email
 * Exclusive to SUPER_ADMIN
 */
export async function POST(request: NextRequest) {
  const forbidden = requirePermission(request, "canManageTeam");
  if (forbidden) return forbidden;

  try {
    const caller = getCallerUser(request);
    if (!caller || caller.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Exclusive rights to invite members belong to the Owner / Root Admin" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, role = "EDITOR" } = body;

    if (!email || !name) {
      return NextResponse.json({ error: "Full name and email address are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const targetRole: UserRole = role === "SUPER_ADMIN" ? "ADMIN" : (role as UserRole);

    // Check if user already exists
    const { data: existing } = await supabaseAdmin.from("admins").select("*");
    const alreadyExists = Array.isArray(existing) && existing.some((a: any) => a.email && a.email.toLowerCase().trim() === normalizedEmail);

    if (alreadyExists) {
      return NextResponse.json({ error: "A team member with this email address is already enrolled" }, { status: 409 });
    }

    // Insert user into allowlist
    const tempPassword = `temp-${Math.random().toString(36).slice(2, 10)}`;
    const { data: inserted, error: insertError } = await supabaseAdmin.from("admins").insert({
      email: normalizedEmail,
      full_name: name,
      role: targetRole,
      password_hash: tempPassword,
      password: tempPassword,
    });

    if (insertError) {
      console.error("Error creating team member:", insertError);
      throw insertError;
    }

    // Generate security verification token
    const token = await storeAuthToken(normalizedEmail, "EMAIL_VERIFICATION", 60);

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    const proto = request.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
    const origin = `${proto}://${host}`;
    const verifyUrl = `${origin}/api/auth/verify-email?token=${token}`;

    // Dispatch invitation email
    await sendTransactionalEmail({
      to: normalizedEmail,
      subject: "Welcome to NexFix Financial OS - Activate your Staff Account",
      html: buildVerificationEmailHtml(name, verifyUrl),
      text: `Hello ${name}, you have been invited to join NexFix Financial OS as ${targetRole}. Activate your account here: ${verifyUrl}`,
    });

    return NextResponse.json({
      success: true,
      message: `Invitation successfully sent to ${normalizedEmail}`,
      member: inserted,
    }, { status: 201 });
  } catch (err: any) {
    console.error("Failed to invite team member:", err);
    return NextResponse.json({ error: err.message || "Failed to invite team member" }, { status: 500 });
  }
}

/**
 * PATCH /api/team - Update staff role
 * Exclusive to SUPER_ADMIN
 */
export async function PATCH(request: NextRequest) {
  const forbidden = requirePermission(request, "canManageTeam");
  if (forbidden) return forbidden;

  try {
    const caller = getCallerUser(request);
    if (!caller || caller.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Exclusive rights to modify roles belong to the Owner / Root Admin" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, email, role } = body;

    if (!id && !email) {
      return NextResponse.json({ error: "Member ID or email is required" }, { status: 400 });
    }

    // Prevent modifying primary owner
    if (email && email.toLowerCase().trim() === PRIMARY_OWNER_EMAIL) {
      return NextResponse.json({ error: "The Primary Root Owner's role cannot be modified" }, { status: 400 });
    }

    const targetRole = role as UserRole;
    const { error: updateError } = await supabaseAdmin
      .from("admins")
      .update({ role: targetRole })
      .eq(id ? "id" : "email", id || email);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: "Role updated successfully",
    });
  } catch (err: any) {
    console.error("Failed to update role:", err);
    return NextResponse.json({ error: err.message || "Failed to update role" }, { status: 500 });
  }
}

/**
 * DELETE /api/team - Revoke member access
 * Exclusive to SUPER_ADMIN
 */
export async function DELETE(request: NextRequest) {
  const forbidden = requirePermission(request, "canManageTeam");
  if (forbidden) return forbidden;

  try {
    const caller = getCallerUser(request);
    if (!caller || caller.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Exclusive rights to revoke access belong to the Owner / Root Admin" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");

    if (!id && !email) {
      return NextResponse.json({ error: "Member ID or email is required" }, { status: 400 });
    }

    if (email && email.toLowerCase().trim() === PRIMARY_OWNER_EMAIL) {
      return NextResponse.json({ error: "Cannot revoke the Primary Root Owner" }, { status: 400 });
    }

    const { error: deleteError } = await supabaseAdmin
      .from("admins")
      .delete()
      .eq(id ? "id" : "email", id || email);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: "Access revoked successfully",
    });
  } catch (err: any) {
    console.error("Failed to revoke member access:", err);
    return NextResponse.json({ error: err.message || "Failed to revoke member access" }, { status: 500 });
  }
}

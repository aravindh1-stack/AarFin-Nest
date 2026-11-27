import crypto from "crypto";
import { supabaseAdmin } from "@/backend/config/supabaseAdmin";

export interface AuthTokenRecord {
  token: string;
  type: "EMAIL_VERIFICATION" | "PASSWORD_RESET";
  email: string;
  expiresAt: string; // ISO string
  createdAt: string;
  used: boolean;
}

// In-memory fallback cache across API executions in the same Node process
const memoryTokenStore = new Map<string, AuthTokenRecord>();

// Verified emails cache (for non-Google accounts)
const memoryVerifiedEmails = new Set<string>([
  "aravindh@aarga.org",
  "nexfix@power",
]);

/**
 * Persists an auth token (in Supabase admin_audit_logs for cross-instance permanence + memory cache)
 */
export async function storeAuthToken(
  email: string,
  type: "EMAIL_VERIFICATION" | "PASSWORD_RESET",
  ttlMinutes = 60
): Promise<string> {
  const normalizedEmail = email.toLowerCase().trim();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();

  const record: AuthTokenRecord = {
    token,
    type,
    email: normalizedEmail,
    expiresAt,
    createdAt: new Date().toISOString(),
    used: false,
  };

  // 1. Store in memory cache
  memoryTokenStore.set(token, record);

  // 2. Persist in Supabase audit logs
  try {
    const { error: insertError } = await supabaseAdmin.from("admin_audit_logs").insert({
      action: `AUTH_TOKEN_${type}`,
      details: record,
    });
    if (insertError) {
      console.error(`❌ [TOKENS DB ERROR]: Failed to persist ${type} token in admin_audit_logs:`, insertError);
    } else {
      console.log(`[TOKENS]: Successfully recorded ${type} token for ${normalizedEmail} in audit logs.`);
    }
  } catch (err) {
    console.error("❌ [TOKENS EXCEPTION]: Exception while persisting auth token in audit logs:", err);
  }

  return token;
}

/**
 * Validates and retrieves an auth token
 */
export async function verifyAuthToken(
  token: string,
  type: "EMAIL_VERIFICATION" | "PASSWORD_RESET"
): Promise<{ valid: boolean; email?: string; error?: string }> {
  if (!token) {
    return { valid: false, error: "Token is required." };
  }

  let record = memoryTokenStore.get(token);

  // If not found in memory, look up from Supabase audit logs
  if (!record) {
    try {
      const { data, error: selectError } = await supabaseAdmin.from("admin_audit_logs").select("*");

      if (selectError) {
        console.error("❌ [TOKENS DB ERROR]: Failed to query audit logs:", selectError);
      }

      if (data && Array.isArray(data)) {
        for (const row of data) {
          if (row.action === `AUTH_TOKEN_${type}`) {
            const detail = typeof row.details === "string" ? JSON.parse(row.details) : row.details;
            if (detail && detail.token === token && detail.type === type) {
              record = detail;
              if (record) {
                memoryTokenStore.set(token, record);
              }
              break;
            }
          }
        }
      }
    } catch (err) {
      console.error("❌ [TOKENS EXCEPTION]: Exception querying token from audit logs:", err);
    }
  }

  if (!record) {
    return { valid: false, error: "Invalid or expired token link." };
  }

  if (record.used) {
    return { valid: false, error: "This security link has already been used." };
  }

  const now = new Date();
  const expires = new Date(record.expiresAt);
  if (now > expires) {
    return { valid: false, error: "This security link has expired. Please request a new one." };
  }

  return { valid: true, email: record.email };
}

/**
 * Marks an auth token as used
 */
export async function consumeAuthToken(token: string, type: "EMAIL_VERIFICATION" | "PASSWORD_RESET"): Promise<void> {
  const record = memoryTokenStore.get(token);
  if (record) {
    record.used = true;
    memoryTokenStore.set(token, record);
  }

  try {
    const { error: insertError } = await supabaseAdmin.from("admin_audit_logs").insert({
      action: `AUTH_TOKEN_CONSUMED_${type}`,
      details: { token, consumedAt: new Date().toISOString() },
    });
    if (insertError) {
      console.error(`❌ [TOKENS DB ERROR]: Failed to mark ${type} token as consumed:`, insertError);
    }
  } catch (err) {
    console.error("❌ [TOKENS EXCEPTION]: Exception recording consumed token in audit logs:", err);
  }
}

/**
 * Checks if an email is verified
 */
export async function isEmailVerified(email: string): Promise<boolean> {
  const normalized = email.toLowerCase().trim();
  if (memoryVerifiedEmails.has(normalized)) {
    return true;
  }

  try {
    const { data, error: selectError } = await supabaseAdmin.from("admin_audit_logs").select("*");

    if (selectError) {
      console.error("❌ [TOKENS DB ERROR]: Failed to query email verification status:", selectError);
    }

    if (data && Array.isArray(data)) {
      for (const row of data) {
        if (row.action === "EMAIL_VERIFIED") {
          const detail = typeof row.details === "string" ? JSON.parse(row.details) : row.details;
          if (detail && detail.email && detail.email.toLowerCase().trim() === normalized) {
            memoryVerifiedEmails.add(normalized);
            return true;
          }
        }
      }
    }
  } catch (err) {
    console.error("❌ [TOKENS EXCEPTION]: Exception querying verification status:", err);
  }

  return false;
}

/**
 * Marks an email as verified
 */
export async function markEmailAsVerified(email: string): Promise<void> {
  const normalized = email.toLowerCase().trim();
  memoryVerifiedEmails.add(normalized);

  try {
    const { error: insertError } = await supabaseAdmin.from("admin_audit_logs").insert({
      action: "EMAIL_VERIFIED",
      details: { email: normalized, verifiedAt: new Date().toISOString() },
    });
    if (insertError) {
      console.error("❌ [TOKENS DB ERROR]: Failed to mark email as verified:", insertError);
    }
  } catch (err) {
    console.error("❌ [TOKENS EXCEPTION]: Exception persisting email verification:", err);
  }
}

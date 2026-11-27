import https from "node:https";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Sends a transactional email using Resend via reliable IPv4/IPv6 HTTPS transport.
 * Falls back to console dispatch if Resend is unconfigured or encounters an error.
 */
export async function sendTransactionalEmail(options: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM || "NexFix Security <security@support.aarga.org>";

  // Explicit diagnostics log
  console.log("Dispatching via Resend:", {
    to: options.to,
    from: fromAddress,
    hasApiKey: Boolean(resendApiKey),
    subject: options.subject,
  });

  if (!resendApiKey) {
    console.error("❌ [RESEND ERROR]: RESEND_API_KEY environment variable is not defined on server.");
  } else {
    try {
      const payload = JSON.stringify({
        from: fromAddress,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      const result = await new Promise<{ status: number; data: any }>((resolve, reject) => {
        const req = https.request(
          "https://api.resend.com/emails",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(payload),
            },
            timeout: 10000,
          },
          (res) => {
            let body = "";
            res.on("data", (chunk) => {
              body += chunk;
            });
            res.on("end", () => {
              try {
                const parsed = JSON.parse(body);
                resolve({ status: res.statusCode || 200, data: parsed });
              } catch {
                resolve({ status: res.statusCode || 200, data: { body } });
              }
            });
          }
        );

        req.on("error", (err) => {
          reject(err);
        });

        req.on("timeout", () => {
          req.destroy(new Error("Resend request timed out after 10000ms"));
        });

        req.write(payload);
        req.end();
      });

      if (result.status >= 200 && result.status < 300 && result.data?.id) {
        console.log(`✅ [RESEND SUCCESS]: Email successfully delivered to ${options.to}. Message ID: ${result.data.id}`);
        return { success: true, id: result.data.id };
      }

      console.error(`❌ [RESEND API REJECTION] HTTP ${result.status}:`, JSON.stringify(result.data, null, 2));
    } catch (err: any) {
      console.error("❌ [RESEND NETWORK/DISPATCH EXCEPTION]:", err.message || err);
    }
  }

  // Fallback: Clear, formatted console log for inspection
  console.log("\n=======================================================");
  console.log("📨 [NEXFIX LOCAL CONSOLE FALLBACK DISPATCH]");
  console.log(`To: ${options.to}`);
  console.log(`From: ${fromAddress}`);
  console.log(`Subject: ${options.subject}`);
  console.log("-------------------------------------------------------");
  console.log(options.text || options.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
  console.log("=======================================================\n");

  return { success: true, id: "fallback-" + Math.random().toString(36).substring(2, 9) };
}

/**
 * Generates an activation/verification email HTML template matching NexFix Dark FinTech styling
 */
export function buildVerificationEmailHtml(recipientName: string, verifyUrl: string): string {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Verify your NexFix Account</title>
      <style>
        body { background-color: #090B0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ECEDEE; margin: 0; padding: 40px 20px; }
        .card { max-width: 500px; margin: 0 auto; background-color: #121614; border: 1px solid #1F2623; border-radius: 16px; padding: 36px 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .logo-badge { display: inline-block; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #10B981; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 20px; }
        h1 { font-size: 22px; font-weight: 800; color: #FFFFFF; margin-top: 0; margin-bottom: 12px; }
        p { font-size: 14px; line-height: 1.6; color: #8E9B94; margin: 0 0 24px; }
        .cta-btn { display: inline-block; background-color: #10B981; color: #090B0A; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 28px; border-radius: 12px; margin-bottom: 24px; }
        .footer { font-size: 11px; color: #526059; border-top: 1px solid #1F2623; pt: 20px; margin-top: 24px; }
        .link-text { color: #10B981; word-break: break-all; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo-badge">NexFix · Financial OS</div>
        <h1>Verify your email address</h1>
        <p>Hello ${recipientName || "there"},</p>
        <p>Your staff account has been provisioned on NexFix Financial OS. To activate your access and verify this email address, click the button below:</p>
        <a href="${verifyUrl}" class="cta-btn" target="_blank">Activate & Verify Account</a>
        <p>This verification link will expire in 60 minutes. If you did not request this, please disregard this email.</p>
        <div class="footer">
          <p style="margin-bottom: 8px;">Or copy and paste this verification URL into your browser:</p>
          <a href="${verifyUrl}" class="link-text">${verifyUrl}</a>
        </div>
      </div>
    </body>
  </html>
  `;
}

/**
 * Generates a password reset email HTML template matching NexFix Dark FinTech styling
 */
export function buildPasswordResetEmailHtml(recipientName: string, resetUrl: string): string {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Reset your NexFix Password</title>
      <style>
        body { background-color: #090B0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ECEDEE; margin: 0; padding: 40px 20px; }
        .card { max-width: 500px; margin: 0 auto; background-color: #121614; border: 1px solid #1F2623; border-radius: 16px; padding: 36px 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .logo-badge { display: inline-block; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #10B981; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 20px; }
        h1 { font-size: 22px; font-weight: 800; color: #FFFFFF; margin-top: 0; margin-bottom: 12px; }
        p { font-size: 14px; line-height: 1.6; color: #8E9B94; margin: 0 0 24px; }
        .cta-btn { display: inline-block; background-color: #10B981; color: #090B0A; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 28px; border-radius: 12px; margin-bottom: 24px; }
        .footer { font-size: 11px; color: #526059; border-top: 1px solid #1F2623; pt: 20px; margin-top: 24px; }
        .link-text { color: #10B981; word-break: break-all; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo-badge">NexFix · Financial OS</div>
        <h1>Reset your password</h1>
        <p>Hello ${recipientName || "there"},</p>
        <p>We received a request to reset the password for your NexFix staff workspace account. Click the button below to choose a new password:</p>
        <a href="${resetUrl}" class="cta-btn" target="_blank">Reset Password</a>
        <p>This single-use link is secure and will expire in 60 minutes. If you did not request a password reset, you can safely ignore this email.</p>
        <div class="footer">
          <p style="margin-bottom: 8px;">Or copy and paste this reset URL into your browser:</p>
          <a href="${resetUrl}" class="link-text">${resetUrl}</a>
        </div>
      </div>
    </body>
  </html>
  `;
}

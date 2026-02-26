// @system — Email service
// Sends transactional emails via SMTP (nodemailer) when SMTP_HOST is configured,
// or falls back to console logging for local development.
//
// Environment variables:
//   SMTP_HOST          — SMTP hostname (e.g. smtp.resend.com, smtp.sendgrid.net)
//   SMTP_PORT          — SMTP port (default: 587)
//   SMTP_USER          — SMTP username
//   SMTP_PASS          — SMTP password / API key
//   EMAIL_FROM         — Sender address (e.g. "App <noreply@example.com>")
//   APP_URL            — Used to build links in emails
//
// To use with Resend:  SMTP_HOST=smtp.resend.com  SMTP_PORT=587  SMTP_USER=resend  SMTP_PASS=<api-key>
// To use with SES:     configure AWS SDK separately in the AWS lib and call SES.sendEmail
// To use with SendGrid: SMTP_HOST=smtp.sendgrid.net  SMTP_PORT=587  SMTP_USER=apikey  SMTP_PASS=<api-key>

'use strict'

const logger = require('../Logger')

// ── Transport factory ────────────────────────────────────────────────────────

let _transporter = null

function getTransporter() {
  if (_transporter) return _transporter

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env

  if (!SMTP_HOST) {
    // No SMTP configured — use console logger as transport
    return null
  }

  try {
    const nodemailer = require('nodemailer')
    _transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT ?? 587),
      secure: Number(SMTP_PORT ?? 587) === 465,
      auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    })
    logger.info({ host: SMTP_HOST }, '[Email] SMTP transport initialized')
    return _transporter
  } catch (err) {
    logger.warn({ err }, '[Email] nodemailer not available — falling back to console logger')
    return null
  }
}

// ── Core send ────────────────────────────────────────────────────────────────

/**
 * Send an email.
 * @param {object} opts
 * @param {string}   opts.to      Recipient address
 * @param {string}   opts.subject Subject line
 * @param {string}   opts.html    HTML body
 * @param {string}  [opts.text]   Plain-text fallback (auto-stripped from html if omitted)
 */
async function send({ to, subject, html, text }) {
  const from = process.env.EMAIL_FROM ?? process.env.SES_FROM_EMAIL ?? 'noreply@example.com'
  const transporter = getTransporter()

  if (!transporter) {
    // Dev fallback — log the email to console so devs can act on it
    logger.info(
      { to, subject, html },
      '[Email] No SMTP configured — email not sent (dev mode). Set SMTP_HOST to enable sending.'
    )
    // Also print the plain URL so it's easy to copy from terminal logs
    const urlMatch = html.match(/href="([^"]+)"/)
    if (urlMatch) logger.info({ url: urlMatch[1] }, '[Email] Action URL')
    return { messageId: 'dev-console', devMode: true }
  }

  const info = await transporter.sendMail({ from, to, subject, html, text })
  logger.info({ to, subject, messageId: info.messageId }, '[Email] sent')
  return info
}

// ── Template helpers ─────────────────────────────────────────────────────────

/**
 * Send an email verification link to the given address.
 * @param {object} opts
 * @param {string} opts.to    Recipient email
 * @param {string} opts.name  Recipient name (optional)
 * @param {string} opts.token Raw verification token
 */
async function sendVerificationEmail({ to, name, token }) {
  const appUrl = process.env.APP_URL ?? 'http://localhost:5173'
  const verifyUrl = `${appUrl}/verify-email?token=${token}`
  const displayName = name ?? 'there'

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:8px;padding:40px;border:1px solid #e5e7eb">
          <tr>
            <td>
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827">
                Verify your email address
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#6b7280">
                Hi ${displayName}, thanks for signing up. Please confirm your email address by clicking the button below.
              </p>
              <a href="${verifyUrl}"
                 style="display:inline-block;padding:12px 24px;background:#111827;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:6px">
                Verify Email
              </a>
              <p style="margin:24px 0 0;font-size:13px;color:#9ca3af">
                This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
              </p>
              <p style="margin:16px 0 0;font-size:13px;color:#9ca3af">
                Or copy this link: <a href="${verifyUrl}" style="color:#6b7280">${verifyUrl}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return send({
    to,
    subject: 'Verify your email address',
    html,
    text: `Verify your email: ${verifyUrl}`,
  })
}

module.exports = { send, sendVerificationEmail }

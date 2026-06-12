import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendOtpEmail(to: string, otp: string, restaurantName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#0B1120;font-family:'Helvetica Neue',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
        <tr><td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background:#131F35;border-radius:16px;border:1px solid #1E2D47;overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(135deg,#1a2a4a 0%,#0B1120 100%);padding:32px;text-align:center;border-bottom:1px solid #1E2D47;">
                <div style="display:inline-flex;align-items:center;gap:10px;">
                  <span style="font-size:28px;">🍽️</span>
                  <span style="color:#F59E0B;font-size:22px;font-weight:800;letter-spacing:-0.5px;">${restaurantName}</span>
                </div>
                <p style="color:#64748B;font-size:13px;margin:8px 0 0;">POS Management System</p>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 32px;text-align:center;">
                <p style="color:#94A3B8;font-size:14px;margin:0 0 24px;">Your one-time login code</p>
                <div style="background:#0B1120;border:2px solid #F59E0B;border-radius:12px;padding:24px;display:inline-block;margin:0 auto;">
                  <span style="color:#F59E0B;font-size:40px;font-weight:800;letter-spacing:12px;">${otp}</span>
                </div>
                <p style="color:#64748B;font-size:13px;margin:24px 0 0;">Valid for <strong style="color:#F1F5F9;">10 minutes</strong>. Do not share this code.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 28px;text-align:center;border-top:1px solid #1E2D47;">
                <p style="color:#475569;font-size:11px;margin:0;">© ${new Date().getFullYear()} ${restaurantName} · Powered by Khaddorosik POS</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: `"${restaurantName} POS" <${process.env.SMTP_USER}>`,
    to,
    subject: `${otp} — Your Khaddorosik Login OTP`,
    html,
  })
}

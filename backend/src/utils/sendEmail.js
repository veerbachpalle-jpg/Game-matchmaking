import nodemailer from 'nodemailer';

const sendVerificationEmail = async (email, otp) => {
  try {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      const transporter = nodemailer.createTransport({
        host,
        port: Number(port) || 587,
        secure: Number(port) === 465,
        auth: {
          user,
          pass
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"Nexus Arena" <${user}>`,
        to: email,
        subject: "Nexus Arena — Email Verification OTP",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0f172a; color: #ffffff; border-radius: 8px;">
            <h2 style="color: #38bdf8;">Nexus Arena Operative Verification</h2>
            <p>Your email verification OTP code is:</p>
            <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #a855f7; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #94a3b8; font-size: 12px;">This code will expire in 1 hour.</p>
          </div>
        `
      });
      return true;
    }

    console.log(`[EMAIL OTP SENDER] Verification OTP for ${email}: ${otp}`);
    return true;
  } catch (error) {
    console.log("Email dispatch failed:", error);
    console.log(`[EMAIL OTP FALLBACK] Verification OTP for ${email}: ${otp}`);
    return false;
  }
};

export { sendVerificationEmail };

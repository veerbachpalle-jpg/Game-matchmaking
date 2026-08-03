import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const sendVerificationEmail = async (email, otp) => {
  try {
    // 1. Try Resend API (HTTPS - bypasses SMTP port blocks on Render/AWS)
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        let fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';
        if (fromAddress.includes('@gmail.com') || fromAddress.includes('@yahoo.com') || fromAddress.includes('@outlook.com')) {
          fromAddress = 'onboarding@resend.dev';
        }

        const resendResult = await resend.emails.send({
          from: fromAddress,
          to: email,
          subject: 'Nexus Arena — Email Verification OTP',
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

        if (resendResult.error) {
          console.log("[Resend API Error]:", resendResult.error);
        } else {
          console.log(`[RESEND API] Email successfully sent to ${email}`);
          return true;
        }
      } catch (resendError) {
        console.log("Resend API failed, trying SMTP fallback...", resendError.message || resendError);
      }
    }

    // 2. Try Nodemailer SMTP
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      const targetPort = Number(port) || 587;
      const transporter = nodemailer.createTransport({
        host,
        port: targetPort,
        secure: targetPort === 465,
        auth: {
          user,
          pass
        },
        connectionTimeout: 4000,
        greetingTimeout: 4000,
        socketTimeout: 4000
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
      console.log(`[SMTP] Email successfully sent to ${email}`);
      return true;
    }

    console.log(`[EMAIL OTP SENDER] Verification OTP for ${email}: ${otp}`);
    return true;
  } catch (error) {
    console.log("Email dispatch failed:", error.message || error);
    console.log(`[EMAIL OTP FALLBACK] Verification OTP for ${email}: ${otp}`);
    return false;
  }
};

export { sendVerificationEmail };


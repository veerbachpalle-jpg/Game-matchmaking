import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const sendVerificationEmail = async (email, otp) => {
  try {
    // 1. Try Brevo API or Brevo SMTP Key
    const brevoApiKey = process.env.BREVO_API_KEY || process.env.BREVO_KEY;
    if (brevoApiKey) {
      const trimmedKey = brevoApiKey.trim();
      const rawFrom = process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@nexusarena.com';
      const senderEmail = rawFrom.includes('<') ? rawFrom.match(/<([^>]+)>/)?.[1] || rawFrom : rawFrom;

      if (trimmedKey.startsWith('xsmtpsib-')) {
        // Automatically route Brevo SMTP key via Nodemailer to smtp-relay.brevo.com
        try {
          const smtpUsers = [
            process.env.SMTP_USER,
            senderEmail.trim(),
            'b41ca0001@smtp-brevo.com'
          ].filter(Boolean);

          for (const user of smtpUsers) {
            try {
              const transporter = nodemailer.createTransport({
                host: 'smtp-relay.brevo.com',
                port: 587,
                secure: false,
                auth: { user, pass: trimmedKey },
                connectionTimeout: 10000,
                greetingTimeout: 10000,
                socketTimeout: 10000
              });

              await transporter.sendMail({
                from: process.env.EMAIL_FROM || `"Nexus Arena" <${senderEmail.trim()}>`,
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
              console.log(`[BREVO SMTP] Email successfully sent to ${email} (Auth user: ${user})`);
              return true;
            } catch (smtpErr) {
              console.log(`[Brevo SMTP Login Attempt Failed for ${user}]:`, smtpErr.message || smtpErr);
            }
          }
        } catch (err) {
          console.error("[Brevo SMTP Error]:", err.message || err);
        }
      } else {
        // Route v3 API Key via Brevo HTTPS API
        try {
          const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'api-key': trimmedKey,
              'content-type': 'application/json'
            },
            body: JSON.stringify({
              sender: {
                name: 'Nexus Arena',
                email: senderEmail.trim()
              },
              to: [{ email }],
              subject: 'Nexus Arena — Email Verification OTP',
              htmlContent: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0f172a; color: #ffffff; border-radius: 8px;">
                  <h2 style="color: #38bdf8;">Nexus Arena Operative Verification</h2>
                  <p>Your email verification OTP code is:</p>
                  <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #a855f7; margin: 20px 0;">
                    ${otp}
                  </div>
                  <p style="color: #94a3b8; font-size: 12px;">This code will expire in 1 hour.</p>
                </div>
              `
            })
          });

          if (response.ok) {
            console.log(`[BREVO API] Email successfully sent to ${email}`);
            return true;
          } else {
            const errData = await response.json().catch(() => ({}));
            console.error(`[BREVO API ERROR] Status ${response.status}:`, errData.message || JSON.stringify(errData));
          }
        } catch (brevoError) {
          console.error("[BREVO API EXCEPTION]:", brevoError.message || brevoError);
        }
      }
    }

    // 2. Try Resend API (HTTPS)
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
          console.error("[Resend API Error]:", resendResult.error);
        } else {
          console.log(`[RESEND API] Email successfully sent to ${email}`);
          return true;
        }
      } catch (resendError) {
        console.error("Resend API failed, trying SMTP fallback...", resendError.message || resendError);
      }
    }

    // 3. Try Nodemailer SMTP (Works with Brevo SMTP: host=smtp-relay.brevo.com, port=587 or 465)
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
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000
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
    console.error("[EMAIL DISPATCH FAILED]:", error.message || error);
    console.log(`[EMAIL OTP FALLBACK LOG] Verification OTP for ${email}: ${otp}`);
    return false;
  }
};

export { sendVerificationEmail };


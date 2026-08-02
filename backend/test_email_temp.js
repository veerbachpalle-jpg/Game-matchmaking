import 'dotenv/config';
import { sendVerificationEmail } from './src/utils/sendEmail.js';

console.log("Testing Brevo email sending...");
console.log("SMTP Host:", process.env.SMTP_HOST);
console.log("SMTP User:", process.env.SMTP_USER);

async function test() {
  const result = await sendVerificationEmail("veerbachpalle@gmail.com", "771122");
  console.log("Test result:", result);
}

test();

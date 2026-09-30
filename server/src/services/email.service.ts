import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

let transporter: nodemailer.Transporter | null = null;

if (ENV.SMTP_HOST && ENV.SMTP_USER && ENV.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT,
    secure: ENV.SMTP_PORT === 465,
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASS,
    },
  });
}

export async function sendOtpEmail(to: string, otp: string, userName?: string): Promise<boolean> {
  const subject = `Your Foodle Verification Code: ${otp}`;
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; background-color: #FDFBF7; border-radius: 12px; border: 1px solid #F0E8D9;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #E23744; margin: 0; font-size: 28px; font-weight: 800;">Foodle 🍛</h1>
        <p style="color: #666; font-size: 14px; margin-top: 4px;">Delivering Happiness at Your Doorstep</p>
      </div>
      <div style="background-color: #FFFFFF; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <h2 style="color: #191924; margin-top: 0; font-size: 18px;">Hello ${userName || 'Foodie'},</h2>
        <p style="color: #555; line-height: 1.5; font-size: 15px;">Thank you for joining Foodle. Please use the following 6-digit verification code to complete your signup or verification process:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; background-color: #FFF0F1; color: #E23744; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 12px 28px; border-radius: 8px; border: 1px dashed #E23744;">
            ${otp}
          </span>
        </div>
        <p style="color: #888; font-size: 13px; line-height: 1.4;">This code is valid for 10 minutes. Please do not share this code with anyone for your account security.</p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        © ${new Date().getFullYear()} Foodle Technologies Inc. All rights reserved.
      </div>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: ENV.SMTP_FROM,
        to,
        subject,
        html,
      });
      console.log(`📧 OTP Email successfully sent to ${to}`);
      return true;
    } catch (err) {
      console.error('❌ Failed to send email via SMTP transporter:', err);
      // Fallback to console
    }
  }

  // Development Fallback: Clear Console Box
  console.log('\n' + '='.repeat(60));
  console.log(`📬 [DEV EMAIL FALLBACK] To: ${to}`);
  console.log(`🔑 Verification Code: >> ${otp} <<`);
  console.log(`⏱️ Valid for: 10 minutes`);
  console.log('='.repeat(60) + '\n');
  return true;
}

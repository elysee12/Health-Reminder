import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendPasswordResetOtp(email: string, otp: string) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'mHealth Reminder Password Reset OTP',
      text: `Your password reset code is ${otp}. It expires in 15 minutes. If you did not request this, please ignore this email.`,
      html: `<p>Your password reset code is <strong>${otp}</strong>.</p><p>This code expires in 15 minutes.</p><p>If you did not request this change, ignore this email.</p>`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      this.logger.error('Failed to send password reset email', error);
      throw new InternalServerErrorException('Unable to send password reset email');
    }
  }
}

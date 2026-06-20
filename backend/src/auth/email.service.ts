import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly brevoApiKey = process.env.BREVO_API_KEY;
  private readonly senderEmail = process.env.BREVO_SENDER_EMAIL || 'healthreminder0@gmail.com';
  private readonly senderName = process.env.BREVO_SENDER_NAME || 'Health Reminder';

  async sendPasswordResetOtp(email: string, otp: string) {
    if (!this.brevoApiKey) {
      this.logger.error('BREVO_API_KEY is not configured');
      throw new InternalServerErrorException('Email service is not configured');
    }

    const url = 'https://api.brevo.com/v3/smtp/email';
    
    const body = {
      sender: {
        name: this.senderName,
        email: this.senderEmail,
      },
      to: [
        {
          email: email,
        },
      ],
      subject: 'mHealth Reminder Password Reset OTP',
      htmlContent: `<p>Your password reset code is <strong>${otp}</strong>.</p><p>This code expires in 15 minutes.</p><p>If you did not request this change, ignore this email.</p>`,
      textContent: `Your password reset code is ${otp}. It expires in 15 minutes. If you did not request this, please ignore this email.`,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': this.brevoApiKey,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error('Brevo API error', errorData);
        throw new Error(`Brevo API responded with status ${response.status}`);
      }

      this.logger.log(`Password reset email sent to ${email} via Brevo`);
    } catch (error) {
      this.logger.error('Failed to send password reset email', error);
      throw new InternalServerErrorException('Unable to send password reset email');
    }
  }
}

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

  async sendAccountActivationEmail(email: string, name: string) {
    if (!this.brevoApiKey) {
      this.logger.error('BREVO_API_KEY is not configured');
      return; // Non-critical, just log it
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
          name: name,
        },
      ],
      subject: 'Account Activated - mHealth Reminder Rwanda',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2c3e50;">Hello ${name},</h2>
          <p>We are pleased to inform you that your account on the <strong>mHealth Reminder Rwanda</strong> system has been approved and activated.</p>
          <p>You can now log in to the system using your email address and the password you created during registration.</p>
          <p style="margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL}/login" style="background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Your Account</a>
          </p>
          <p style="margin-top: 30px;">If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>The mHealth Reminder Team</p>
        </div>
      `,
      textContent: `Hello ${name},\n\nYour account on the mHealth Reminder Rwanda system has been approved and activated. You can now log in using your email address and password.\n\nLogin here: ${process.env.FRONTEND_URL}/login\n\nBest regards,\nThe mHealth Reminder Team`,
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
      } else {
        this.logger.log(`Account activation email sent to ${email} via Brevo`);
      }
    } catch (error) {
      this.logger.error('Failed to send account activation email', error);
    }
  }
}

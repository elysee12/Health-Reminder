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

      const responseData = await response.json();

      if (!response.ok) {
        this.logger.error('Brevo API error', {
          status: response.status,
          statusText: response.statusText,
          error: responseData
        });
        
        // Check for common issues
        if (responseData.code === 'unauthorized') {
          this.logger.error('Brevo API key is invalid or expired');
        } else if (responseData.code === 'invalid_parameter' && responseData.message?.includes('sender')) {
          this.logger.error('Sender email is not verified in Brevo. Please verify the sender email in your Brevo dashboard.');
        }
        
        throw new Error(`Brevo API responded with status ${response.status}: ${JSON.stringify(responseData)}`);
      }

      this.logger.log(`Password reset email sent to ${email} via Brevo. Message ID: ${responseData.messageId || 'N/A'}`);
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

      const responseData = await response.json();

      if (!response.ok) {
        this.logger.error('Brevo API error when sending account activation email', {
          status: response.status,
          statusText: response.statusText,
          error: responseData
        });
        
        // Check for common issues
        if (responseData.code === 'unauthorized') {
          this.logger.error('Brevo API key is invalid or expired');
        } else if (responseData.code === 'invalid_parameter' && responseData.message?.includes('sender')) {
          this.logger.error('⚠️ CRITICAL: Sender email is not verified in Brevo. Emails are not being sent. Please verify healthreminder0@gmail.com in your Brevo dashboard at https://app.brevo.com/settings/senders');
        }
      } else {
        this.logger.log(`✅ Account activation email sent to ${email} via Brevo. Message ID: ${responseData.messageId || 'N/A'}`);
      }
    } catch (error) {
      this.logger.error('Failed to send account activation email', error);
    }
  }

  async sendAccessRequestConfirmation(email: string, name: string) {
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
      subject: 'Access Request Received - mHealth Reminder Rwanda',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2c3e50;">Hello ${name},</h2>
          <p>Thank you for your interest in the <strong>mHealth Reminder Rwanda</strong> system!</p>
          <p>We have received your access request, and our team will review it shortly.</p>
          <p>You will receive a confirmation email once your account has been approved.</p>
          <p style="margin-top: 30px;">If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>The mHealth Reminder Team</p>
        </div>
      `,
      textContent: `Hello ${name},\n\nThank you for your interest in mHealth Reminder Rwanda! We've received your access request and will review it shortly.\n\nYou'll get a confirmation email once approved.\n\nBest regards,\nThe mHealth Reminder Team`,
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

      const responseData = await response.json();

      if (!response.ok) {
        this.logger.error('Brevo API error when sending access request confirmation', {
          status: response.status,
          statusText: response.statusText,
          error: responseData
        });
        
        // Check for common issues
        if (responseData.code === 'unauthorized') {
          this.logger.error('Brevo API key is invalid or expired');
        } else if (responseData.code === 'invalid_parameter' && responseData.message?.includes('sender')) {
          this.logger.error('⚠️ CRITICAL: Sender email is not verified in Brevo. Emails are not being sent. Please verify healthreminder0@gmail.com in your Brevo dashboard at https://app.brevo.com/settings/senders');
        }
      } else {
        this.logger.log(`✅ Access request confirmation email sent to ${email} via Brevo. Message ID: ${responseData.messageId || 'N/A'}`);
      }
    } catch (error) {
      this.logger.error('Failed to send access request confirmation email', error);
    }
  }

  async sendUserCredentials(email: string, name: string, password: string, role: string) {
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
      subject: 'Welcome to mHealth Reminder Rwanda - Your Login Credentials',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2c3e50;">Welcome ${name}!</h2>
          <p>Your account has been successfully created on the <strong>mHealth Reminder Rwanda</strong> system.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">Your Login Credentials:</h3>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
            <p style="margin: 5px 0;"><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
          </div>
          <p style="margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL}/login" style="background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Your Account</a>
          </p>
          <p style="margin-top: 30px; color: #e74c3c;">
            <strong>Important:</strong> For security reasons, please change your password after your first login.
          </p>
          <p style="margin-top: 20px;">If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>The mHealth Reminder Team</p>
        </div>
      `,
      textContent: `Welcome ${name}!\n\nYour account has been created on mHealth Reminder Rwanda.\n\nLogin Credentials:\nEmail: ${email}\nPassword: ${password}\nRole: ${role.charAt(0).toUpperCase() + role.slice(1)}\n\nLogin here: ${process.env.FRONTEND_URL}/login\n\nIMPORTANT: Please change your password after your first login.\n\nBest regards,\nThe mHealth Reminder Team`,
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

      const responseData = await response.json();

      if (!response.ok) {
        this.logger.error('Brevo API error when sending user credentials', {
          status: response.status,
          statusText: response.statusText,
          error: responseData
        });
        
        // Check for common issues
        if (responseData.code === 'unauthorized') {
          this.logger.error('Brevo API key is invalid or expired');
        } else if (responseData.code === 'invalid_parameter' && responseData.message?.includes('sender')) {
          this.logger.error('⚠️ CRITICAL: Sender email is not verified in Brevo. Emails are not being sent. Please verify healthreminder0@gmail.com in your Brevo dashboard at https://app.brevo.com/settings/senders');
        }
      } else {
        this.logger.log(`✅ User credentials email sent to ${email} via Brevo. Message ID: ${responseData.messageId || 'N/A'}`);
      }
    } catch (error) {
      this.logger.error('Failed to send user credentials email', error);
    }
  }

  async sendAppointmentConfirmation(
    email: string,
    patientName: string,
    hospitalName: string,
    dateStr: string,
    timeStr: string,
    appointmentType: string,
    reason: string
  ) {
    if (!this.brevoApiKey) {
      this.logger.error('BREVO_API_KEY is not configured');
      return;
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
          name: patientName,
        },
      ],
      subject: 'Appointment Confirmed - mHealth Reminder Rwanda',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✓ Appointment Confirmed</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #10B981; margin-top: 0;">Hello ${patientName},</h2>
            
            <p style="font-size: 16px;">Your appointment has been successfully confirmed. Please find the details below:</p>
            
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; font-weight: bold; color: #374151;">📍 Hospital:</td>
                  <td style="padding: 10px 0; color: #1F2937;">${hospitalName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: bold; color: #374151;">📅 Date:</td>
                  <td style="padding: 10px 0; color: #1F2937;">${dateStr}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: bold; color: #374151;">🕐 Time:</td>
                  <td style="padding: 10px 0; color: #1F2937;">${timeStr}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: bold; color: #374151;">🏥 Type:</td>
                  <td style="padding: 10px 0; color: #1F2937;">${appointmentType}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: bold; color: #374151;">📋 Reason:</td>
                  <td style="padding: 10px 0; color: #1F2937;">${reason}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: #92400E;">
                <strong>⚠️ Important:</strong> Please arrive 15 minutes before your scheduled time.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6B7280; margin-top: 30px;">
              If you need to reschedule or cancel this appointment, please contact your healthcare provider as soon as possible.
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
              <p style="color: #9CA3AF; font-size: 12px; margin: 5px 0;">mHealth Reminder Rwanda</p>
              <p style="color: #9CA3AF; font-size: 12px; margin: 5px 0;">Improving Healthcare Through Technology</p>
            </div>
          </div>
        </div>
      `,
      textContent: `APPOINTMENT CONFIRMED\n\nHello ${patientName},\n\nYour appointment has been confirmed.\n\nHospital: ${hospitalName}\nDate: ${dateStr}\nTime: ${timeStr}\nType: ${appointmentType}\nReason: ${reason}\n\nPlease arrive 15 minutes before your scheduled time.\n\nBest regards,\nmHealth Reminder Team`,
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

      const responseData = await response.json();

      if (!response.ok) {
        this.logger.error('Brevo API error when sending appointment confirmation', {
          status: response.status,
          statusText: response.statusText,
          error: responseData
        });
      } else {
        this.logger.log(`✅ Appointment confirmation email sent to ${email}. Message ID: ${responseData.messageId || 'N/A'}`);
      }
    } catch (error) {
      this.logger.error('Failed to send appointment confirmation email', error);
    }
  }
}

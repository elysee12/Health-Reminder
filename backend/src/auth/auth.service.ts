import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { LoginDto } from './dto/login.dto';
import { PasswordResetRequestDto } from './dto/password-reset-request.dto';
import { PasswordResetConfirmDto } from './dto/password-reset-confirm.dto';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private emailService: EmailService) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Try to login as User first
    const user = await this.prisma.user.findFirst({
      where: { email },
      include: { hospital: true },
    });

    if (user) {
      if (user.status === 'pending') {
        throw new UnauthorizedException('Your access request is still pending approval');
      }

      if (user.status === 'inactive') {
        throw new UnauthorizedException('Your account is inactive. Please contact admin.');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const { password: _, ...result } = user;
      return { ...result, type: 'user' };
    }

    // Fall back to patient login
    const patient = await this.prisma.patient.findFirst({
      where: { email },
      include: { hospital: true },
    });

    if (patient && patient.password) {
      let isPasswordValid = false;
      try {
        isPasswordValid = await bcrypt.compare(password, patient.password);
      } catch (error) {
        isPasswordValid = false;
      }

      if (!isPasswordValid && password === patient.password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await this.prisma.patient.update({
          where: { id: patient.id },
          data: { password: hashedPassword },
        });
        isPasswordValid = true;
      }

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return { ...patient, role: 'patient', type: 'patient' };
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  async requestPasswordReset(passwordResetRequestDto: PasswordResetRequestDto) {
    const { email } = passwordResetRequestDto;
    const account = await this.findAccountByEmail(email);

    if (!account) {
      return { message: 'If this email exists, you will receive an OTP shortly.' };
    }

    const otp = String(randomInt(100000, 999999)).padStart(6, '0');
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.passwordReset.create({
      data: {
        email,
        otpHash,
        expiresAt,
      },
    });

    await this.emailService.sendPasswordResetOtp(email, otp);

    return { message: 'If this email exists, you will receive an OTP shortly.' };
  }

  async confirmPasswordReset(passwordResetConfirmDto: PasswordResetConfirmDto) {
    const { email, otp, newPassword } = passwordResetConfirmDto;

    const passwordReset = await this.prisma.passwordReset.findFirst({
      where: {
        email,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!passwordReset) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const isOtpValid = await bcrypt.compare(otp, passwordReset.otpHash);
    if (!isOtpValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const account = await this.findAccountByEmail(email);
    if (!account) {
      throw new BadRequestException('No account found for this email');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (account.type === 'user') {
      await this.prisma.user.update({
        where: { id: account.account.id },
        data: { password: hashedPassword },
      });
    } else {
      await this.prisma.patient.update({
        where: { id: account.account.id },
        data: { password: hashedPassword },
      });
    }

    await this.prisma.passwordReset.update({
      where: { id: passwordReset.id },
      data: { used: true },
    });

    return { message: 'Your password has been updated successfully.' };
  }

  private async findAccountByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      return { type: 'user' as const, account: user };
    }

    const patient = await this.prisma.patient.findUnique({ where: { email } });
    if (patient) {
      return { type: 'patient' as const, account: patient };
    }

    return null;
  }
}

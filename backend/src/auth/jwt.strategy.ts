import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.access_token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
    });
  }

  async validate(payload: any) {
    if (payload.type === 'user') {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { hospital: true },
      });
      if (user) {
        const { password, ...result } = user;
        return { ...result, type: 'user' };
      }
    } else {
      const patient = await this.prisma.patient.findUnique({
        where: { id: payload.sub },
        include: { hospital: true },
      });
      if (patient) {
        return { ...patient, role: 'patient', type: 'patient' };
      }
    }
    return null;
  }
}

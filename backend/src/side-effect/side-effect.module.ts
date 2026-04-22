import { Module } from '@nestjs/common';
import { SideEffectService } from './side-effect.service';
import { SideEffectController } from './side-effect.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SideEffectController],
  providers: [SideEffectService],
  exports: [SideEffectService],
})
export class SideEffectModule {}

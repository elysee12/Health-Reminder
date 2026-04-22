import { Module } from '@nestjs/common';
import { ExternalSystemService } from './external-system.service';
import { ExternalSystemController } from './external-system.controller';

@Module({
  controllers: [ExternalSystemController],
  providers: [ExternalSystemService],
})
export class ExternalSystemModule {}

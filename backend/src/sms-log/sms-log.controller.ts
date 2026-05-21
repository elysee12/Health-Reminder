import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SmsLogService } from './sms-log.service';
import { CreateSmsLogDto } from './create-sms-log.dto';
import { UpdateSmsLogDto } from './update-sms-log.dto';

@Controller('sms-log')
export class SmsLogController {
  constructor(private readonly smsLogService: SmsLogService) {}

  @Post('broadcast')
  broadcast(@Body() body: { message: string; patientId?: number; phone?: string }) {
    return this.smsLogService.broadcast(body.message, body.patientId, body.phone);
  }

  @Post()
  create(@Body() createSmsLogDto: CreateSmsLogDto) {
    return this.smsLogService.create(createSmsLogDto);
  }

  @Get()
  findAll(@Query('providerId') providerId?: string) {
    return this.smsLogService.findAll(providerId ? +providerId : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.smsLogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSmsLogDto: UpdateSmsLogDto) {
    return this.smsLogService.update(+id, updateSmsLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.smsLogService.remove(+id);
  }
}

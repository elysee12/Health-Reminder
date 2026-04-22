import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AdherenceRecordService } from './adherence-record.service';
import { CreateAdherenceRecordDto } from './dto/create-adherence-record.dto';
import { UpdateAdherenceRecordDto } from './dto/update-adherence-record.dto';

@Controller('adherence-record')
export class AdherenceRecordController {
  constructor(private readonly adherenceRecordService: AdherenceRecordService) {}

  @Post()
  create(@Body() createAdherenceRecordDto: CreateAdherenceRecordDto) {
    return this.adherenceRecordService.create(createAdherenceRecordDto);
  }

  @Get()
  findAll(@Query('providerId') providerId?: string) {
    return this.adherenceRecordService.findAll(providerId ? +providerId : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adherenceRecordService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdherenceRecordDto: UpdateAdherenceRecordDto) {
    return this.adherenceRecordService.update(+id, updateAdherenceRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adherenceRecordService.remove(+id);
  }
}

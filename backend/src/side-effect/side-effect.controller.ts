import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SideEffectService } from './side-effect.service';
import { CreateSideEffectDto } from './dto/create-side-effect.dto';
import { UpdateSideEffectDto } from './dto/update-side-effect.dto';

@Controller('side-effect')
export class SideEffectController {
  constructor(private readonly sideEffectService: SideEffectService) {}

  @Post()
  create(@Body() createSideEffectDto: CreateSideEffectDto) {
    return this.sideEffectService.create(createSideEffectDto);
  }

  @Get()
  findAll(
    @Query('patientId') patientId?: string,
    @Query('providerId') providerId?: string,
  ) {
    if (patientId) {
      return this.sideEffectService.findByPatient(+patientId);
    }
    return this.sideEffectService.findAll(providerId ? +providerId : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sideEffectService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSideEffectDto: UpdateSideEffectDto) {
    return this.sideEffectService.update(+id, updateSideEffectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sideEffectService.remove(+id);
  }
}

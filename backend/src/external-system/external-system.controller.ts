import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExternalSystemService } from './external-system.service';
import { CreateExternalSystemDto } from './dto/create-external-system.dto';
import { UpdateExternalSystemDto } from './dto/update-external-system.dto';

@Controller('external-system')
export class ExternalSystemController {
  constructor(private readonly externalSystemService: ExternalSystemService) {}

  @Post()
  create(@Body() createExternalSystemDto: CreateExternalSystemDto) {
    return this.externalSystemService.create(createExternalSystemDto);
  }

  @Get()
  findAll() {
    return this.externalSystemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.externalSystemService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExternalSystemDto: UpdateExternalSystemDto) {
    return this.externalSystemService.update(+id, updateExternalSystemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.externalSystemService.remove(+id);
  }
}

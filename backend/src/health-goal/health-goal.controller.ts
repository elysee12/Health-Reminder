import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { HealthGoalService } from './health-goal.service';
import { CreateHealthGoalDto } from './dto/create-health-goal.dto';
import { UpdateHealthGoalDto } from './dto/update-health-goal.dto';

@Controller('health-goal')
export class HealthGoalController {
  constructor(private readonly healthGoalService: HealthGoalService) {}

  @Post()
  create(@Body() createHealthGoalDto: CreateHealthGoalDto) {
    return this.healthGoalService.create(createHealthGoalDto);
  }

  @Get()
  findAll(
    @Query('patientId') patientId?: string,
    @Query('providerId') providerId?: string,
  ) {
    if (patientId) {
      return this.healthGoalService.findByPatient(+patientId);
    }
    return this.healthGoalService.findAll(providerId ? +providerId : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.healthGoalService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHealthGoalDto: UpdateHealthGoalDto) {
    return this.healthGoalService.update(+id, updateHealthGoalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.healthGoalService.remove(+id);
  }
}

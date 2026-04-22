import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';

@Injectable()
export class ApiKeyService {
  constructor(private prisma: PrismaService) {}

  async create(createApiKeyDto: CreateApiKeyDto) {
    return this.prisma.apiKey.create({
      data: createApiKeyDto,
    });
  }

  async findAll() {
    return this.prisma.apiKey.findMany();
  }

  async findOne(id: number) {
    return this.prisma.apiKey.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateApiKeyDto: UpdateApiKeyDto) {
    return this.prisma.apiKey.update({
      where: { id },
      data: updateApiKeyDto,
    });
  }

  async remove(id: number) {
    return this.prisma.apiKey.delete({
      where: { id },
    });
  }
}

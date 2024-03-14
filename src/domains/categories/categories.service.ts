import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllCategories() {
    const allCategories = await this.prismaService.category.findMany();

    return allCategories;
  }
}

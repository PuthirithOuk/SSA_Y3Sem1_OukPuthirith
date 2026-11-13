import {
  Body, Controller, Get, Headers, HttpCode, Param, Patch, Post, Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ArrayNotEmpty, IsInt, IsString, IsIn } from 'class-validator';
import { OrdersService } from './order.service.js';

export class CreateOrderDto {
  @IsInt() restaurantId: number;
  @ArrayNotEmpty() @IsString({ each: true }) items: string[];
}

export class UpdateStatusDto {
  @IsIn(['PLACED', 'COOKING', 'DELIVERING', 'DELIVERED', 'CANCELLED'])
  status: string;
}

@Controller('v1/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Body() dto: CreateOrderDto,
    @Headers('idempotency-key') key: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (key && this.ordersService['idempotency'].has(key)) {
      res.status(200);
    }
    return this.ordersService.place(dto.restaurantId, dto.items, key);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.ordersService.get(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.ordersService.changeStatus(id, dto.status);
  }
}
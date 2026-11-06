import {
  Body, ConflictException, Controller, Get, Headers, HttpCode,
  NotFoundException, Param, Patch, Post, Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ArrayNotEmpty, IsInt, IsString, IsIn } from 'class-validator';
import { randomUUID } from 'node:crypto';
import { IDEMPOTENCY, ORDERS, RESTAURANTS } from './data.js';

export class CreateOrderDto {
  @IsInt() restaurantId: number;
  @ArrayNotEmpty() @IsString({ each: true }) items: string[];
}

// --- NEW FOR PART B ---
export class UpdateStatusDto {
  @IsIn(['PLACED', 'COOKING', 'DELIVERING', 'DELIVERED', 'CANCELLED'])
  status: string;
}

const TRANSITIONS: Record<string, string[]> = {
  PLACED:     ['COOKING', 'CANCELLED'],
  COOKING:    ['DELIVERING'],
  DELIVERING: ['DELIVERED'],
  DELIVERED:  [],
  CANCELLED:  [],
};
// ----------------------

@Controller('v1/orders')
export class OrdersController {
  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateOrderDto,
         @Headers('idempotency-key') key: string | undefined,
         @Res({ passthrough: true }) res: Response) {
    if (key && IDEMPOTENCY.has(key)) {
      res.status(200);                         // same request again: return the first result
      return ORDERS.get(IDEMPOTENCY.get(key)!);
    }
    if (!RESTAURANTS.some(r => r.id === dto.restaurantId)) {
      throw new NotFoundException('restaurant not found');
    }
    const order = { id: randomUUID(), status: 'PLACED', ...dto };
    ORDERS.set(order.id, order);
    if (key) IDEMPOTENCY.set(key, order.id);
    return order;
  }

  // --- NEW FOR PART B ---
  @Get(':id')
  get(@Param('id') id: string) {
    const order = ORDERS.get(id);
    if (!order) throw new NotFoundException('order not found');
    return order;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    const order = ORDERS.get(id);
    if (!order) throw new NotFoundException('order not found');

    const allowed = TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(dto.status)) {
      throw new ConflictException(
        `cannot go from ${order.status} to ${dto.status}`,
      );
    }
    order.status = dto.status;
    return order;
  }
  // ----------------------
}
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CatalogService } from '../catalog/catalog.service.js';
import { ORDER_REPOSITORY } from './order.repository.js';
import type { Order, OrderRepository } from './order.repository.js';

const ALLOWED: Record<string, string[]> = {
  PLACED: ['COOKING', 'CANCELLED'],
  COOKING: ['DELIVERING'],
  DELIVERING: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

@Injectable()
export class OrdersService {
  private readonly idempotency = new Map<string, string>();

  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepository,
    private readonly catalog: CatalogService,
  ) {}

  async place(restaurantId: number, items: string[], key?: string) {
    if (key && this.idempotency.has(key)) {
      const existingOrderId = this.idempotency.get(key)!;
      return this.orders.get(existingOrderId);
    }

    if (!this.catalog.restaurantExists(restaurantId)) {
      throw new NotFoundException('restaurant not found');
    }

    const order: Order = { id: randomUUID(), status: 'PLACED', restaurantId, items };
    await this.orders.save(order);
    
    if (key) {
      this.idempotency.set(key, order.id);
    }
    return order;
  }

  async get(id: string): Promise<Order> {
    const order = await this.orders.get(id);
    if (!order) throw new NotFoundException('order not found');
    return order;
  }

  async changeStatus(id: string, status: string): Promise<Order> {
    const order = await this.get(id);
    if (!(ALLOWED[order.status] ?? []).includes(status)) {
      throw new ConflictException(`cannot go from ${order.status} to ${status}`);
    }
    order.status = status;
    await this.orders.save(order);
    return order;
  }
}
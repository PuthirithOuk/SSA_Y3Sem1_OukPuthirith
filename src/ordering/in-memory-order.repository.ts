// src/ordering/in-memory-order.repository.ts
// An ADAPTER: one way to implement the port. Week 10 adds a PostgreSQL adapter.
import { Injectable } from '@nestjs/common';
import type { Order, OrderRepository } from './order.repository.js';
 
@Injectable()
export class InMemoryOrderRepository implements OrderRepository {
  private readonly orders = new Map<string, Order>();
  async save(order: Order) { this.orders.set(order.id, order); }
  async get(id: string) { return this.orders.get(id); }
}
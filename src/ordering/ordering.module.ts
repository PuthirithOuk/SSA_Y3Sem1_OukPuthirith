import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module.js';
import { InMemoryOrderRepository } from './in-memory-order.repository.js';
import { ORDER_REPOSITORY } from './order.repository.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './order.service.js';

@Module({
  imports: [CatalogModule],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    { provide: ORDER_REPOSITORY, useClass: InMemoryOrderRepository },
  ],
})
export class OrderingModule {}
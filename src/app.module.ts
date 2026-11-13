import { Module } from '@nestjs/common';
import { CatalogModule } from './catalog/catalog.module.js';
import { OrderingModule } from './ordering/ordering.module.js';
import { AuthController } from './auth.controller.js';

@Module({
  imports: [CatalogModule, OrderingModule],
  controllers: [AuthController],
})
export class AppModule {}
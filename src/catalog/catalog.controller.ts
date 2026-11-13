import { Controller, Get, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service.js';

@Controller('v1/restaurants')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  list(@Query('limit') limit = '20', @Query('offset') offset = '0') {
    const l = Number(limit), o = Number(offset);
    const result = this.catalogService.getRestaurants(l, o);
    return { ...result, limit: l, offset: o };
  }
}
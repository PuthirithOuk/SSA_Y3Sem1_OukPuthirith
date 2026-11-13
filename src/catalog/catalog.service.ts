import { Injectable } from '@nestjs/common';
import { CatalogRepository } from './catalog.repository.js';

@Injectable()
export class CatalogService {
  constructor(private readonly repo: CatalogRepository) {}

  getRestaurants(limit: number, offset: number) {
    return this.repo.findAll(limit, offset);
  }

  // As requested in the handout!
  restaurantExists(id: number): boolean {
    return this.repo.exists(id);
  }
}
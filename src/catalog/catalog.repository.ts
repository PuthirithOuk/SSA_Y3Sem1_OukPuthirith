import { Injectable } from '@nestjs/common';

export interface Restaurant { id: number; name: string; area: string }

@Injectable()
export class CatalogRepository {
  private readonly restaurants: Restaurant[] = [
    { id: 1, name: 'Num Banh Chok Corner', area: 'Daun Penh' },
    { id: 2, name: 'Lok Lak House', area: 'BKK1' },
    { id: 3, name: 'Amok Garden', area: 'Toul Kork' },
  ];

  findAll(limit: number, offset: number) {
    return {
      data: this.restaurants.slice(offset, offset + limit),
      total: this.restaurants.length,
    };
  }

  exists(id: number): boolean {
    return this.restaurants.some(r => r.id === id);
  }
}  
// src/ordering/order.repository.ts
// The PORT: what the ordering logic needs from storage, with no technology in it.
export interface Order { id: string; restaurantId: number; items: string[]; status: string }
 
export interface OrderRepository {
  save(order: Order): Promise<void>;
  get(id: string): Promise<Order | undefined>;
}
 
export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');
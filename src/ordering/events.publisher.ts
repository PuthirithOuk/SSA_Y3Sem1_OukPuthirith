import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import amqp from 'amqplib';
import type { Channel, ChannelModel } from 'amqplib';
import { randomUUID } from 'node:crypto';
 
@Injectable()
export class EventsPublisher implements OnModuleInit, OnModuleDestroy {
  private conn: ChannelModel;
  private channel: Channel;
 
  async onModuleInit() {
    this.conn = await amqp.connect(process.env.RABBIT_URL ?? 'amqp://localhost');
    this.channel = await this.conn.createChannel();
    await this.channel.assertExchange('orders', 'fanout', { durable: true });
  }
 
  publish(type: string, data: object) {
    const event = { eventId: randomUUID(), type, occurredAt: new Date().toISOString(), ...data };
    this.channel.publish('orders', '', Buffer.from(JSON.stringify(event)),
      { persistent: true, contentType: 'application/json' });
    return event;
  }
 
  async onModuleDestroy() { await this.conn?.close(); }
}
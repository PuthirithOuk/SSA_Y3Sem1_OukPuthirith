// Publish one test event: npx tsx scripts/publish.ts [eventId] [--bad]
import amqp from 'amqplib';
import { randomUUID } from 'node:crypto';
 
const eventId = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : randomUUID();
const bad = process.argv.includes('--bad');
const conn = await amqp.connect('amqp://localhost');
const ch = await conn.createChannel();
await ch.assertExchange('orders', 'fanout', { durable: true });
const event = { eventId, type: 'OrderPlaced', orderId: randomUUID(), items: bad ? [] : ['amok'] };
ch.publish('orders', '', Buffer.from(JSON.stringify(event)), { persistent: true });
console.log('published', event);
await ch.close();
await conn.close();
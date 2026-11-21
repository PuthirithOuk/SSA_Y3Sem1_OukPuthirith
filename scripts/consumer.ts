// Run one consumer: npx tsx scripts/consumer.ts kitchen   (or: notification)
import amqp from 'amqplib';

const queue = process.argv[2] ?? 'kitchen';
const conn = await amqp.connect('amqp://localhost');
const ch = await conn.createChannel();
await ch.assertExchange('orders', 'fanout', { durable: true });
await ch.assertExchange('orders.dlx', 'fanout', { durable: true });
await ch.assertQueue(`${queue}.dlq`, { durable: true });
await ch.bindQueue(`${queue}.dlq`, 'orders.dlx', '');
await ch.assertQueue(queue, { durable: true, deadLetterExchange: 'orders.dlx' });
await ch.bindQueue(queue, 'orders', '');
await ch.prefetch(1);

const processed = new Set<string>();  // TODO Part C: skip events already processed

await ch.consume(queue, (msg) => {
  if (!msg) return;

  // 1. Parse (guarded — a malformed message should go to the DLQ, not crash the consumer)
  let event: { type: string; eventId: string; items?: unknown[]; [k: string]: unknown };
  try {
    event = JSON.parse(msg.content.toString());
  } catch (err) {
    console.error(`[${queue}] bad JSON, nacking to DLQ:`, err);
    ch.nack(msg, false, false); // don't requeue → routes to DLX → DLQ
    return;
  }

  const { eventId, type } = event;

  // --- NEW: POISON MESSAGE CHECK (Part D) ---
  // If the order has no items, it will never succeed. Reject it to the DLQ.
  if (!event.items || event.items.length === 0) {
    console.warn(`[${queue}] rejecting bad event (empty items): ${eventId}`);
    ch.nack(msg, false, false); // don't requeue → routes to DLX → DLQ
    return;
  }
  // ------------------------------------------

  // 2. Idempotency check — before doing any work
  if (processed.has(eventId)) {
    console.log(`[${queue}] skip duplicate ${eventId}`);
    ch.ack(msg);
    return;
  }

  // 3. Do the work
  try {
    console.log(`[${queue}] got ${type} ${eventId}`);
    // ... real work (cook the order, send notification, write to DB) ...

    // 4. Mark processed only AFTER work succeeds, then ack
    processed.add(eventId);
    ch.ack(msg);
  } catch (err) {
    console.error(`[${queue}] failed processing ${eventId}, requeueing:`, err);
    // requeue=true → retry; beware infinite loops without a retry/DLQ policy
    ch.nack(msg, false, true);
  }
});

console.log(`[${queue}] waiting for events...`);
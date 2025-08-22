import { Hono } from 'hono';
import { Webhook } from 'svix';
import type { WebhookEvent } from '@clerk/backend';
import { createDatabaseClient } from '@repo/database';
import { users } from '@repo/database';
import { eq } from 'drizzle-orm';
import type { Env } from '../types/env';

const app = new Hono<{ Bindings: Env }>();

// Clerk webhook endpoint for user sync
app.post('/clerk', async (c) => {
  const WEBHOOK_SECRET = c.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET');
    return c.json({ error: 'Server configuration error' }, 500);
  }

  // Get headers
  const svixId = c.req.header('svix-id');
  const svixTimestamp = c.req.header('svix-timestamp');
  const svixSignature = c.req.header('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return c.json({ error: 'Missing svix headers' }, 400);
  }

  // Get body
  const body = await c.req.text();

  // Verify webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return c.json({ error: 'Invalid signature' }, 400);
  }

  const db = createDatabaseClient(c.env.DATABASE_URL);

  // Handle different event types
  const eventType = evt.type;
  
  switch (eventType) {
    case 'user.created':
    case 'user.updated': {
      const { 
        id, 
        email_addresses, 
        first_name, 
        last_name, 
        image_url 
      } = evt.data;
      
      const primaryEmail = email_addresses.find(e => e.id === evt.data.primary_email_address_id);
      
      if (!primaryEmail) {
        console.error('No primary email found for user:', id);
        return c.json({ error: 'No primary email' }, 400);
      }

      const name = [first_name, last_name].filter(Boolean).join(' ') || null;

      // Upsert user
      await db
        .insert(users)
        .values({
          id,
          email: primaryEmail.email_address,
          name,
          imageUrl: image_url,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            email: primaryEmail.email_address,
            name,
            imageUrl: image_url,
            updatedAt: new Date(),
          },
        });
      
      console.log(`User ${eventType}: ${id}`);
      break;
    }
    
    case 'user.deleted': {
      const { id } = evt.data;
      
      // We don't actually delete users, just mark as deleted
      // This preserves message history
      await db
        .update(users)
        .set({ 
          updatedAt: new Date(),
          // You might want to add a deletedAt field to your schema
        })
        .where(eq(users.id, id || ''));
      
      console.log(`User deleted: ${id}`);
      break;
    }
    
    case 'session.created': {
      // Could track active sessions if needed
      console.log('Session created:', evt.data.id);
      break;
    }
    
    case 'session.ended':
    case 'session.removed':
    case 'session.revoked': {
      // Could track session ends if needed
      console.log(`Session ${eventType}:`, evt.data.id);
      break;
    }
    
    default: {
      console.log(`Unhandled webhook event: ${eventType}`);
    }
  }

  return c.json({ success: true });
});

export default app;
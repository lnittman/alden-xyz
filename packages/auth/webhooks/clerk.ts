import type { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { generateUsername } from '../utils';

// Note: This webhook handler needs to be updated to use Convex
// Currently, Convex handles user creation/updates through its auth integration
// This file is kept for reference but will need to call Convex HTTP actions

export async function handleClerkWebhook(request: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      'Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env'
    );
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  const payload = await request.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  const eventType = evt.type;

  console.info('Webhook received', { type: eventType });

  try {
    // TODO: Update to use Convex HTTP actions
    // For now, Convex handles user sync through its auth integration
    // This webhook can be used for additional custom logic if needed
    
    switch (eventType) {
      case 'user.created':
      case 'user.updated':
      case 'user.deleted':
      case 'organizationMembership.created':
      case 'organizationMembership.updated':
      case 'organizationMembership.deleted':
        // Convex handles these through its auth integration
        console.info('Clerk event received (handled by Convex)', { type: eventType });
        break;

      default:
        console.warn('Unhandled webhook event', { type: eventType });
    }

    return new Response('Webhook processed', { status: 200 });
  } catch (error) {
    console.error('Webhook processing failed', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}
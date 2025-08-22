import type { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@repo/database';
import { apiLogger } from '@repo/logger';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { generateUsername } from '../utils';

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
    apiLogger.error('Webhook verification failed', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  const eventType = evt.type;

  apiLogger.info('Webhook received', { type: eventType });

  try {
    switch (eventType) {
      case 'user.created': {
        const {
          id,
          email_addresses,
          first_name,
          last_name,
          username,
          image_url,
        } = evt.data;
        const primaryEmail = email_addresses.find(
          (email) => email.primary
        )?.email_address;

        if (!primaryEmail) {
          throw new Error('No primary email found');
        }

        await db.user.create({
          data: {
            clerkId: id,
            email: primaryEmail,
            username: username || generateUsername(primaryEmail),
            displayName:
              [first_name, last_name].filter(Boolean).join(' ') || null,
            avatarUrl: image_url || null,
          },
        });

        apiLogger.info('User created', { clerkId: id, email: primaryEmail });
        break;
      }

      case 'user.updated': {
        const {
          id,
          email_addresses,
          first_name,
          last_name,
          username,
          image_url,
        } = evt.data;
        const primaryEmail = email_addresses.find(
          (email) => email.primary
        )?.email_address;

        if (!primaryEmail) {
          throw new Error('No primary email found');
        }

        await db.user.update({
          where: { clerkId: id },
          data: {
            email: primaryEmail,
            username: username || undefined,
            displayName:
              [first_name, last_name].filter(Boolean).join(' ') || null,
            avatarUrl: image_url || null,
          },
        });

        apiLogger.info('User updated', { clerkId: id });
        break;
      }

      case 'user.deleted': {
        const { id } = evt.data;

        await db.user.delete({
          where: { clerkId: id },
        });

        apiLogger.info('User deleted', { clerkId: id });
        break;
      }

      case 'organizationMembership.created':
      case 'organizationMembership.updated': {
        const { organization, public_user_data } = evt.data;
        const userId = public_user_data.user_id;

        const user = await db.user.findUnique({
          where: { clerkId: userId },
        });

        if (user) {
          await db.user.update({
            where: { id: user.id },
            data: {
              organizationId: organization.id,
              organizationName: organization.name,
            },
          });

          apiLogger.info('Organization membership updated', {
            userId: user.id,
            orgId: organization.id,
          });
        }
        break;
      }

      case 'organizationMembership.deleted': {
        const { public_user_data } = evt.data;
        const userId = public_user_data.user_id;

        const user = await db.user.findUnique({
          where: { clerkId: userId },
        });

        if (user) {
          await db.user.update({
            where: { id: user.id },
            data: {
              organizationId: null,
              organizationName: null,
            },
          });

          apiLogger.info('Organization membership removed', {
            userId: user.id,
          });
        }
        break;
      }

      default:
        apiLogger.warn('Unhandled webhook event', { type: eventType });
    }

    return new Response('Webhook processed', { status: 200 });
  } catch (error) {
    apiLogger.error('Webhook processing failed', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}

import Pusher from 'pusher';
import { keys } from './keys';

type AuthenticateOptions = {
  userId: string;
  orgId: string;
  userInfo: {
    name?: string;
    email?: string;
    avatar?: string;
    [key: string]: any;
  };
  socketId: string;
  channel: string;
};

const env = keys();

export const authenticate = async ({
  userId,
  orgId,
  userInfo,
  socketId,
  channel,
}: AuthenticateOptions) => {
  if (!env.PUSHER_SECRET) {
    throw new Error('PUSHER_SECRET is not set');
  }

  const pusher = new Pusher({
    appId: env.PUSHER_APP_ID,
    key: env.PUSHER_KEY,
    secret: env.PUSHER_SECRET,
    cluster: env.PUSHER_CLUSTER,
    useTLS: true,
  });

  // Validate channel access based on org pattern
  const channelPattern = new RegExp(`^${orgId}:`);
  if (!channelPattern.test(channel)) {
    return new Response('Forbidden', { status: 403 });
  }

  // For presence channels, include user data
  if (channel.startsWith('presence-')) {
    const authResponse = pusher.authorizeChannel(socketId, channel, {
      user_id: userId,
      user_info: userInfo,
    });

    return new Response(JSON.stringify(authResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // For private channels
  const authResponse = pusher.authorizeChannel(socketId, channel);

  return new Response(JSON.stringify(authResponse), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

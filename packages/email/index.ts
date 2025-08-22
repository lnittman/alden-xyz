import { Resend } from 'resend';
import { keys } from './keys';

export const resend = new Resend(keys().RESEND_TOKEN);

// Export email templates
export { InviteTemplate } from './templates/invite';
export { ContactTemplate } from './templates/contact';

import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

type InviteTemplateProps = {
  readonly inviterUsername: string;
  readonly message?: string;
};

export const InviteTemplate = ({
  inviterUsername,
  message,
}: InviteTemplateProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>{inviterUsername} invited you to join Squish!</Preview>
      <Body className="bg-white font-sans">
        <Container className="mx-auto py-20">
          <Section className="text-center">
            {/* Logo */}
            <span className="text-[96px]">🐙</span>

            {/* Title */}
            <Text className="mb-7 font-semibold text-2xl text-slate-900">
              @{inviterUsername} invited you to join Squish!
            </Text>

            {/* Optional Message */}
            {message && (
              <Text className="text-slate-500 italic">"{message}"</Text>
            )}

            {/* Join Button */}
            <Section className="mt-7">
              <a
                href="https://squish.app/join"
                className="inline-block rounded-lg bg-slate-100 px-6 py-3 font-medium text-slate-600 no-underline"
              >
                Join now!
              </a>
            </Section>

            {/* Terms and Privacy */}
            <Text className="mt-8 text-center text-slate-500 text-xs">
              By joining, you agree to our{' '}
              <a href="https://squish.app/terms" className="text-[#3291FF]">
                Terms
              </a>{' '}
              and have read our{' '}
              <a href="https://squish.app/privacy" className="text-[#3291FF]">
                Privacy Policy
              </a>
              .
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

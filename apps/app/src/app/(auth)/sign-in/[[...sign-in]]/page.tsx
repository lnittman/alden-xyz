'use client'

import * as Clerk from '@clerk/elements/common'
import * as SignIn from '@clerk/elements/sign-in'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <SignIn.Root>
        <SignIn.Step name="start" className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-3 mb-1">
              <Logo size="sm" />
              <h1 className="text-2xl tracking-tight">
                <span className="font-extralight tracking-[-0.05em] text-white/70">welcome</span>
                <span className="font-light text-white/90"> back</span>
              </h1>
            </div>
            <p className="text-sm text-white/40 font-extralight">continue your journey</p>
          </div>

          <Clerk.GlobalError className="block text-sm text-red-400" />

          <div className="space-y-6">
            <Clerk.Field name="identifier" className="space-y-1">
              <Clerk.Label className="text-xs text-white/40 tracking-wider font-light">
                email
              </Clerk.Label>
              <div className="relative group">
                <div className="absolute -inset-0.5 rounded-lg opacity-0 group-focus-within:opacity-100 bg-[#178bf1]/20 blur transition duration-500" />
                <Clerk.Input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="relative w-full px-4 py-3 bg-zinc-900/50 border border-white/5 rounded-lg text-white/80 text-sm 
                           focus:outline-none focus:ring-0 transition duration-500
                           placeholder:text-white/20 font-light"
                />
              </div>
              <Clerk.FieldError className="mt-2 block text-xs text-red-400" />
            </Clerk.Field>

            <SignIn.Action
              submit
              className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white text-sm font-light transition-all duration-300"
            >
              Continue
            </SignIn.Action>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-black text-white/30 font-light">or continue with</span>
              </div>
            </div>

            <Clerk.Connection
              name="google"
              className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm font-light transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Clerk.Connection>
          </div>

          <div className="text-center">
            <Link
              href="/sign-up"
              className="text-sm text-white/40 hover:text-white/60 transition-colors font-light"
            >
              don't have an account? sign up
            </Link>
          </div>
        </SignIn.Step>

        <SignIn.Step name="verifications" className="w-full max-w-sm space-y-8">
          <SignIn.Strategy name="email_code">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-3 mb-1">
                <Logo size="sm" />
                <h1 className="text-2xl tracking-tight">
                  <span className="font-extralight tracking-[-0.05em] text-white/70">check your</span>
                  <span className="font-light text-white/90"> email</span>
                </h1>
              </div>
              <p className="text-sm text-white/40 font-extralight">
                we sent a code to <SignIn.SafeIdentifier />
              </p>
            </div>

            <Clerk.Field name="code" className="space-y-1">
              <Clerk.Label className="text-xs text-white/40 tracking-wider font-light">
                verification code
              </Clerk.Label>
              <div className="relative group">
                <div className="absolute -inset-0.5 rounded-lg opacity-0 group-focus-within:opacity-100 bg-[#178bf1]/20 blur transition duration-500" />
                <Clerk.Input
                  type="text"
                  required
                  placeholder="Enter code"
                  className="relative w-full px-4 py-3 bg-zinc-900/50 border border-white/5 rounded-lg text-white/80 text-sm 
                           focus:outline-none focus:ring-0 transition duration-500
                           placeholder:text-white/20 font-light text-center tracking-widest"
                />
              </div>
              <Clerk.FieldError className="mt-2 block text-xs text-red-400" />
            </Clerk.Field>

            <SignIn.Action
              submit
              className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white text-sm font-light transition-all duration-300"
            >
              Verify
            </SignIn.Action>
          </SignIn.Strategy>

          <SignIn.Strategy name="password">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-3 mb-1">
                <Logo size="sm" />
                <h1 className="text-2xl tracking-tight">
                  <span className="font-extralight tracking-[-0.05em] text-white/70">enter your</span>
                  <span className="font-light text-white/90"> password</span>
                </h1>
              </div>
            </div>

            <Clerk.Field name="password" className="space-y-1">
              <Clerk.Label className="text-xs text-white/40 tracking-wider font-light">
                password
              </Clerk.Label>
              <div className="relative group">
                <div className="absolute -inset-0.5 rounded-lg opacity-0 group-focus-within:opacity-100 bg-[#178bf1]/20 blur transition duration-500" />
                <Clerk.Input
                  type="password"
                  required
                  className="relative w-full px-4 py-3 bg-zinc-900/50 border border-white/5 rounded-lg text-white/80 text-sm 
                           focus:outline-none focus:ring-0 transition duration-500
                           placeholder:text-white/20 font-light"
                />
              </div>
              <Clerk.FieldError className="mt-2 block text-xs text-red-400" />
            </Clerk.Field>

            <SignIn.Action
              submit
              className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white text-sm font-light transition-all duration-300"
            >
              Continue
            </SignIn.Action>

            <SignIn.Action
              navigate="forgot-password"
              className="w-full text-center text-sm text-white/40 hover:text-white/60 transition-colors font-light"
            >
              Forgot password?
            </SignIn.Action>
          </SignIn.Strategy>
        </SignIn.Step>

        <SignIn.Step name="forgot-password" className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl tracking-tight">
              <span className="font-extralight tracking-[-0.05em] text-white/70">reset your</span>
              <span className="font-light text-white/90"> password</span>
            </h1>
          </div>

          <SignIn.SupportedStrategy
            name="reset_password_email_code"
            className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white text-sm font-light transition-all duration-300"
          >
            Send reset code
          </SignIn.SupportedStrategy>

          <SignIn.Action
            navigate="previous"
            className="w-full text-center text-sm text-white/40 hover:text-white/60 transition-colors font-light"
          >
            Go back
          </SignIn.Action>
        </SignIn.Step>

        <SignIn.Step name="reset-password" className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl tracking-tight">
              <span className="font-extralight tracking-[-0.05em] text-white/70">reset your</span>
              <span className="font-light text-white/90"> password</span>
            </h1>
          </div>

          <div className="space-y-4">
            <Clerk.Field name="password" className="space-y-1">
              <Clerk.Label className="text-xs text-white/40 tracking-wider font-light">
                new password
              </Clerk.Label>
              <div className="relative group">
                <div className="absolute -inset-0.5 rounded-lg opacity-0 group-focus-within:opacity-100 bg-[#178bf1]/20 blur transition duration-500" />
                <Clerk.Input
                  type="password"
                  required
                  className="relative w-full px-4 py-3 bg-zinc-900/50 border border-white/5 rounded-lg text-white/80 text-sm 
                           focus:outline-none focus:ring-0 transition duration-500
                           placeholder:text-white/20 font-light"
                />
              </div>
              <Clerk.FieldError className="mt-2 block text-xs text-red-400" />
            </Clerk.Field>

            <Clerk.Field name="confirmPassword" className="space-y-1">
              <Clerk.Label className="text-xs text-white/40 tracking-wider font-light">
                confirm password
              </Clerk.Label>
              <div className="relative group">
                <div className="absolute -inset-0.5 rounded-lg opacity-0 group-focus-within:opacity-100 bg-[#178bf1]/20 blur transition duration-500" />
                <Clerk.Input
                  type="password"
                  required
                  className="relative w-full px-4 py-3 bg-zinc-900/50 border border-white/5 rounded-lg text-white text-sm 
                           focus:outline-none focus:ring-0 transition duration-500
                           placeholder:text-white/20 font-light"
                />
              </div>
              <Clerk.FieldError className="mt-2 block text-xs text-red-400" />
            </Clerk.Field>
          </div>

          <SignIn.Action
            submit
            className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white text-sm font-light transition-all duration-300"
          >
            Reset password
          </SignIn.Action>
        </SignIn.Step>
      </SignIn.Root>
    </div>
  )
}
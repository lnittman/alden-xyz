'use client'

import * as Clerk from '@clerk/elements/common'
import * as SignUp from '@clerk/elements/sign-up'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

export function SignUpForm() {
  return (
    <SignUp.Root>
      <SignUp.Step name="start">
        <Clerk.GlobalError className="text-sm text-red-500 mb-4" />
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Clerk.Field name="firstName">
              <Clerk.Label className="text-sm font-medium text-foreground/60">
                First name
              </Clerk.Label>
              <Clerk.Input
                type="text"
                className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="John"
              />
              <Clerk.FieldError className="mt-1 text-xs text-red-500" />
            </Clerk.Field>

            <Clerk.Field name="lastName">
              <Clerk.Label className="text-sm font-medium text-foreground/60">
                Last name
              </Clerk.Label>
              <Clerk.Input
                type="text"
                className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="Doe"
              />
              <Clerk.FieldError className="mt-1 text-xs text-red-500" />
            </Clerk.Field>
          </div>

          <Clerk.Field name="emailAddress">
            <Clerk.Label className="text-sm font-medium text-foreground/60">
              Email address
            </Clerk.Label>
            <Clerk.Input
              type="email"
              className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              placeholder="you@example.com"
            />
            <Clerk.FieldError className="mt-1 text-xs text-red-500" />
          </Clerk.Field>

          <Clerk.Field name="password">
            <Clerk.Label className="text-sm font-medium text-foreground/60">
              Password
            </Clerk.Label>
            <Clerk.Input
              type="password"
              className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            <Clerk.FieldError className="mt-1 text-xs text-red-500" />
          </Clerk.Field>
        </div>

        <SignUp.Action
          submit
          className="mt-6 w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Clerk.Loading>
            {(isLoading) => (
              <>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Creating account...' : 'Sign up'}
              </>
            )}
          </Clerk.Loading>
        </SignUp.Action>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link
            href="/sign-in"
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </div>
      </SignUp.Step>

      <SignUp.Step name="verifications">
        <SignUp.Strategy name="email_code">
          <Clerk.GlobalError className="text-sm text-red-500 mb-4" />
          
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold">Verify your email</h3>
            <p className="text-sm text-muted-foreground mt-1">
              We sent a verification code to your email
            </p>
          </div>

          <Clerk.Field name="code">
            <Clerk.Label className="text-sm font-medium text-foreground/60">
              Verification code
            </Clerk.Label>
            <Clerk.Input
              type="otp"
              className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-center font-mono"
              placeholder="Enter code"
            />
            <Clerk.FieldError className="mt-1 text-xs text-red-500" />
          </Clerk.Field>

          <SignUp.Action
            submit
            className="mt-6 w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Clerk.Loading>
              {(isLoading) => (
                <>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Verifying...' : 'Verify email'}
                </>
              )}
            </Clerk.Loading>
          </SignUp.Action>

          <SignUp.Action
            resend
            className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Clerk.Loading>
              {(isLoading) => (
                isLoading ? 'Resending...' : "Didn't receive a code? Resend"
              )}
            </Clerk.Loading>
          </SignUp.Action>
        </SignUp.Strategy>
      </SignUp.Step>

      <SignUp.Step name="continue">
        <Clerk.GlobalError className="text-sm text-red-500 mb-4" />
        
        <div className="space-y-4">
          <Clerk.Field name="username">
            <Clerk.Label className="text-sm font-medium text-foreground/60">
              Username
            </Clerk.Label>
            <Clerk.Input
              type="text"
              className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              placeholder="johndoe"
            />
            <Clerk.FieldError className="mt-1 text-xs text-red-500" />
          </Clerk.Field>
        </div>

        <SignUp.Action
          submit
          className="mt-6 w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Clerk.Loading>
            {(isLoading) => (
              <>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Completing...' : 'Complete sign up'}
              </>
            )}
          </Clerk.Loading>
        </SignUp.Action>
      </SignUp.Step>
    </SignUp.Root>
  )
}
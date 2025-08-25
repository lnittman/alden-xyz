'use client'

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Authenticated, Unauthenticated } from 'convex/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ReactNode, Suspense } from 'react'

export function RootLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up')
  
  return (
    <>
      {!isAuthPage && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
                <span className="text-lg font-light tracking-tight text-white">alden</span>
              </Link>
              
              <nav className="flex items-center gap-4">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors font-light">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white transition-all duration-300 font-light">
                      Get started
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link 
                    href="/chat" 
                    className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors font-light"
                  >
                    Chat
                  </Link>
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8",
                        userButtonPopoverCard: "bg-zinc-900 border border-white/10",
                        userButtonPopoverActionButton: "hover:bg-white/10",
                      },
                    }}
                  />
                </SignedIn>
              </nav>
            </div>
          </div>
        </header>
      )}
      
      <main className={!isAuthPage ? "pt-16" : ""}>
        {children}
      </main>
    </>
  )
}
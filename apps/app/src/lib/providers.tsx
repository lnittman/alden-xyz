"use client"

import { Toaster } from "sonner"
import { ConvexClientProvider } from "@/components/common/convex-provider"
import { RootLayoutContent } from "@/app/root-layout-content"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexClientProvider>
      <RootLayoutContent>
        {children}
      </RootLayoutContent>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(0, 0, 0, 0.8)",
            color: "rgba(255, 255, 255, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(8px)",
          },
        }}
      />
    </ConvexClientProvider>
  )
} 
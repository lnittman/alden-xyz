"use client"

import React from "react"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/ui/logo"
import { Header } from "@/components/ui/header"
import { MessageInput } from "@/components/chat/messages/MessageInput"
import { MessageBubble } from "@/components/chat/messages/MessageBubble"
import { ReferencePreview } from "@/components/chat/references/ReferencePreview"
import { motion } from "framer-motion"
import { ChatHeader } from "@/components/chat/ChatHeader"
import { SharedFooter } from "@/components/ui/shared-footer"
import { CONTEXT_TYPES, CONTEXT_PREVIEWS } from "@/lib/constants/demo-content"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RootPage() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useAuth()

  // Redirect if logged in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/chat")
    }
  }, [isLoaded, isSignedIn, router])

  // Handle loading state
  if (!isLoaded) return null

  // Update the demo messages to show a more relatable group chat
  const demoMessages = [{
    id: "1",
    chat_id: "demo",
    sender_id: "user_1",
    content: "Hey team, just finished the design mockups for the new feature 🎨",
    created_at: new Date().toISOString(),
    sender: { email: "sarah@alden.chat" }
  }, {
    id: "2",
    chat_id: "demo",
    sender_id: "user_2",
    content: "Looks amazing! I'll start implementing the backend API endpoints today 🚀",
    created_at: new Date().toISOString(),
    sender: { email: "alex@alden.chat" }
  }, {
    id: "3",
    chat_id: "demo",
    sender_id: "user_3",
    content: "Perfect timing! I can help with the frontend integration tomorrow",
    created_at: new Date().toISOString(),
    sender: { email: "jordan@alden.chat" }
  }]

  const activeContext = CONTEXT_TYPES[0]  // 'user'

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 flex flex-col items-center px-4 pb-16">
        {/* Hero Section */}
        <div className="w-full max-w-6xl mx-auto text-center space-y-8 pt-32 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Logo className="w-20 h-20 mx-auto mb-8" />
            <h1 className="text-5xl font-bold tracking-tight">
              AI-Native Messaging
            </h1>
            <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
              Experience the future of team communication with contextual intelligence
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex gap-4 justify-center"
          >
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
            >
              Sign In
            </Link>
          </motion.div>
        </div>

        {/* Demo Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="w-full max-w-4xl mx-auto"
        >
          <div className="border border-border rounded-2xl overflow-hidden bg-background shadow-xl">
            <ChatHeader 
              chatId="demo-chat"
              type="group"
              title="Product Team"
            />
            
            <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-muted/20">
              {demoMessages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                />
              ))}
              
              {/* Show context preview */}
              <div className="mt-4">
                <ReferencePreview
                  reference={{
                    id: 'demo-ref',
                    type: 'user',
                    title: 'Team Context',
                    content: 'Smart references and contextual information',
                    metadata: {},
                    similarity: 0.95
                  }}
                />
              </div>
            </div>

            <div className="p-4 border-t border-border">
              <MessageInput
                chatId="demo-chat"
                demo={true}
              />
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <div className="w-full max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-lg font-semibold">AI-Powered</h3>
            <p className="text-sm text-muted-foreground">
              Smart suggestions and context-aware responses
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <span className="text-2xl">🔗</span>
            </div>
            <h3 className="text-lg font-semibold">Rich Context</h3>
            <p className="text-sm text-muted-foreground">
              Share files, links, and references seamlessly
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold">Real-time</h3>
            <p className="text-sm text-muted-foreground">
              Instant messaging with live collaboration
            </p>
          </motion.div>
        </div>
      </main>

      <SharedFooter />
    </div>
  )
}
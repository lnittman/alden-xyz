"use client"

import { redirect } from "next/navigation"

// Legacy route - redirect to new Clerk Elements sign-up page
export default function SignupPage() {
  redirect("/sign-up")
}
"use client"

import { redirect } from "next/navigation"

// Legacy route - redirect to new Clerk Elements sign-in page
export default function LoginPage() {
  redirect("/sign-in")
}
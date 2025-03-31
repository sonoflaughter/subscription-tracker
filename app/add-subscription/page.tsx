import { SubscriptionForm } from "@/components/subscription-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function AddSubscriptionPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" aria-label="Back to dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Add Subscription</h1>
        </div>
        <SubscriptionForm />
      </div>
    </main>
  )
}


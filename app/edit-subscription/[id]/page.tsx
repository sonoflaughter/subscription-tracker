import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SubscriptionForm } from "@/components/subscription-form"
import { getSubscriptionById } from "@/lib/subscription-service"

export default function EditSubscriptionPage({ params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id, 10)

  // This will be replaced with actual data in the client component
  // We're just checking if the subscription exists at the server level
  const subscription = getSubscriptionById(id)

  if (!subscription) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" aria-label="Back to dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Edit Subscription</h1>
        </div>
        <SubscriptionForm subscriptionId={id} />
      </div>
    </main>
  )
}


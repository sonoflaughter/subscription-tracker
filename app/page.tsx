import Link from "next/link"
import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SubscriptionDashboard } from "@/components/subscription-dashboard"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 overflow-hidden">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subscription Tracker</h1>
            <p className="text-muted-foreground">Monitor your recurring payments and spending</p>
          </div>
          <Link href="/add-subscription">
            <Button className="flex items-center gap-2 w-full sm:w-auto">
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              Add Subscription
            </Button>
          </Link>
        </div>
        <SubscriptionDashboard />
      </div>
    </main>
  )
}


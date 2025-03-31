"use client"

import { useState } from "react"
import Link from "next/link"
import { BarChart3, Calendar, CreditCard, Edit, MoreVertical, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import {
  getAllSubscriptions,
  getSubscriptionsByCategory,
  getUpcomingPayments,
  getPaymentMethods,
  deleteSubscription,
  undoDelete,
  formatDate,
  formatRelativeTime,
} from "@/lib/subscription-service"
import { sanitizeUrl } from "@/lib/security"

export function SubscriptionDashboard() {
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()
  const [subscriptions, setSubscriptions] = useState(getAllSubscriptions())
  const [refreshKey, setRefreshKey] = useState(0)

  // Get data from service
  const subscriptionsByCategory = getSubscriptionsByCategory()
  const upcomingPayments = getUpcomingPayments()
  const paymentMethods = getPaymentMethods()

  // Function to refresh data
  const refreshData = () => {
    setSubscriptions(getAllSubscriptions())
    setRefreshKey((prev) => prev + 1)
  }

  const handleDelete = (id: number) => {
    try {
      const success = deleteSubscription(id)
      if (success) {
        toast({
          title: "Subscription deleted",
          description: "The subscription has been removed.",
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (undoDelete(id)) {
                  refreshData()
                  toast({
                    title: "Restored",
                    description: "The subscription has been restored.",
                  })
                }
              }}
            >
              Undo
            </Button>
          ),
        })
        refreshData()
      } else {
        toast({
          title: "Error",
          description: "Could not delete the subscription. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6 w-full overflow-hidden">
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Your Subscriptions</CardTitle>
              {/* Replaced Filter button with View Analytics button */}
              <Link href="/analytics">
                <Button variant="outline" size="sm" className="h-8 gap-1" aria-label="View analytics">
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">View Analytics</span>
                </Button>
              </Link>
            </div>
            <CardDescription>You have {subscriptions.length} active subscriptions</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
              <div className="px-4 sm:px-6 overflow-x-auto">
                <TabsList className="w-full justify-start border-b pb-0 h-auto overflow-x-auto flex-nowrap">
                  <TabsTrigger
                    value="all"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                  >
                    All
                  </TabsTrigger>
                  {Object.keys(subscriptionsByCategory).map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category.toLowerCase()}
                      className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none whitespace-nowrap"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value="all" className="m-0">
                <div className="divide-y">
                  {subscriptions.map((subscription) => (
                    <div
                      key={subscription.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-4 mb-2 sm:mb-0">
                        <Avatar
                          className="h-10 w-10 rounded-md flex-shrink-0"
                          style={{ backgroundColor: subscription.color }}
                        >
                          <img
                            src={sanitizeUrl(subscription.logo) || "/placeholder.svg"}
                            alt=""
                            aria-hidden="true"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = "/placeholder.svg"
                            }}
                          />
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{subscription.name}</div>
                          <div className="text-sm text-muted-foreground">{subscription.billingCycle}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 ml-14 sm:ml-0">
                        <div className="text-left sm:text-right">
                          <div className="font-medium">${(subscription.price || 0).toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-1">
                            <span>Next: {formatDate(subscription.nextBillingDate)}</span>
                            {formatRelativeTime(subscription.nextBillingDate) && (
                              <Badge variant="outline" className="text-xs font-normal py-0 h-5">
                                {formatRelativeTime(subscription.nextBillingDate)}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Options for ${subscription.name}`}
                              className="flex-shrink-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/edit-subscription/${subscription.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(subscription.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {Object.entries(subscriptionsByCategory).map(([category, subs]) => (
                <TabsContent key={category} value={category.toLowerCase()} className="m-0">
                  <div className="divide-y">
                    {subs.map((subscription) => (
                      <div
                        key={subscription.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-4 mb-2 sm:mb-0">
                          <Avatar
                            className="h-10 w-10 rounded-md flex-shrink-0"
                            style={{ backgroundColor: subscription.color }}
                          >
                            <img
                              src={sanitizeUrl(subscription.logo) || "/placeholder.svg"}
                              alt=""
                              aria-hidden="true"
                              onError={(e) => {
                                ;(e.target as HTMLImageElement).src = "/placeholder.svg"
                              }}
                            />
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{subscription.name}</div>
                            <div className="text-sm text-muted-foreground">{subscription.billingCycle}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 ml-14 sm:ml-0">
                          <div className="text-left sm:text-right">
                            <div className="font-medium">${(subscription.price || 0).toFixed(2)}</div>
                            <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-1">
                              <span>Next: {formatDate(subscription.nextBillingDate)}</span>
                              {formatRelativeTime(subscription.nextBillingDate) && (
                                <Badge variant="outline" className="text-xs font-normal py-0 h-5">
                                  {formatRelativeTime(subscription.nextBillingDate)}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Options for ${subscription.name}`}
                                className="flex-shrink-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/edit-subscription/${subscription.id}`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(subscription.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
          <CardFooter className="border-t p-4 flex flex-col sm:flex-row justify-between gap-2">
            <div className="text-sm text-muted-foreground">Showing {subscriptions.length} subscriptions</div>
            <Link href="/analytics">
              <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                <BarChart3 className="h-4 w-4" />
                View Analytics
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Payments</CardTitle>
            <CardDescription>Due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingPayments.length > 0 ? (
              <div className="space-y-4">
                {upcomingPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar
                        className="h-8 w-8 rounded-md flex-shrink-0"
                        style={{ backgroundColor: payment.color || "#cccccc" }}
                      >
                        <img
                          src={sanitizeUrl(payment.logo) || "/placeholder.svg"}
                          alt=""
                          aria-hidden="true"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = "/placeholder.svg"
                          }}
                        />
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{payment.name || "Unnamed Subscription"}</div>
                        <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                          <span>{formatDate(payment.nextBillingDate)}</span>
                          {formatRelativeTime(payment.nextBillingDate) && (
                            <Badge variant="outline" className="text-xs font-normal py-0 h-5">
                              {formatRelativeTime(payment.nextBillingDate)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="font-medium">${(payment.price || 0).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Calendar className="h-10 w-10 text-muted-foreground mb-2" aria-hidden="true" />
                <h3 className="font-medium">No upcoming payments</h3>
                <p className="text-sm text-muted-foreground">You don't have any payments due in the next 7 days.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />
                    <div>
                      <div className="font-medium">
                        {method.type} ending in {method.last4}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Expires {method.expiryMonth.toString().padStart(2, "0")}/{method.expiryYear}
                      </div>
                    </div>
                  </div>
                  {method.isDefault && <Badge>Default</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" aria-label="Add a new payment method">
              Add Payment Method
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}


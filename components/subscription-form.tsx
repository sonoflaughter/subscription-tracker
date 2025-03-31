"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, CreditCard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format, parseISO, addMonths } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { addSubscription, getPaymentMethods, getSubscriptionById, updateSubscription } from "@/lib/subscription-service"
import { isValidName, safeParseNumber } from "@/lib/security"

interface SubscriptionFormProps {
  subscriptionId?: number
}

export function SubscriptionForm({ subscriptionId }: SubscriptionFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [date, setDate] = useState<Date>(new Date()) // Default to today
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    billingCycle: "Monthly" as "Monthly" | "Quarterly" | "Biannually" | "Annually",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const paymentMethods = getPaymentMethods()

  // Load subscription data if in edit mode
  useEffect(() => {
    if (subscriptionId) {
      setIsEditMode(true)
      const subscription = getSubscriptionById(subscriptionId)

      if (subscription) {
        setFormData({
          name: subscription.name,
          price: subscription.price.toString(),
          category: subscription.category,
          billingCycle: subscription.billingCycle,
        })

        try {
          // Parse the date string to a Date object
          const billingDate = parseISO(subscription.nextBillingDate)
          setDate(billingDate)
        } catch (error) {
          console.error("Invalid date format:", subscription.nextBillingDate)
        }
      }
    }
  }, [subscriptionId])

  // Calculate next billing date based on billing cycle when it changes
  useEffect(() => {
    if (!isEditMode && date) {
      const today = new Date()
      let nextDate = new Date(date)

      // If the selected date is in the past, calculate the next occurrence
      if (nextDate < today) {
        switch (formData.billingCycle) {
          case "Monthly":
            // Add months until we reach a future date
            while (nextDate < today) {
              nextDate = addMonths(nextDate, 1)
            }
            break
          case "Quarterly":
            while (nextDate < today) {
              nextDate = addMonths(nextDate, 3)
            }
            break
          case "Biannually":
            while (nextDate < today) {
              nextDate = addMonths(nextDate, 6)
            }
            break
          case "Annually":
            while (nextDate < today) {
              nextDate = addMonths(nextDate, 12)
            }
            break
        }
        setDate(nextDate)
      }
    }
  }, [formData.billingCycle, date, isEditMode])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target

    // For name field, validate as user types
    if (id === "name" && value && !isValidName(value)) {
      toast({
        title: "Invalid input",
        description: "Name can only contain letters, numbers, spaces, and basic punctuation",
        variant: "destructive",
      })
      return
    }

    // For price field, validate it's a number
    if (id === "price" && value && isNaN(Number.parseFloat(value))) {
      toast({
        title: "Invalid input",
        description: "Price must be a valid number",
        variant: "destructive",
      })
      return
    }

    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // If billing cycle changes, update the next billing date
    if (field === "billingCycle" && date) {
      const today = new Date()
      let nextDate = new Date(date)

      // If the selected date is in the past, calculate the next occurrence
      if (nextDate < today) {
        switch (value) {
          case "Monthly":
            // Add months until we reach a future date
            while (nextDate < today) {
              nextDate = addMonths(nextDate, 1)
            }
            break
          case "Quarterly":
            while (nextDate < today) {
              nextDate = addMonths(nextDate, 3)
            }
            break
          case "Biannually":
            while (nextDate < today) {
              nextDate = addMonths(nextDate, 6)
            }
            break
          case "Annually":
            while (nextDate < today) {
              nextDate = addMonths(nextDate, 12)
            }
            break
        }
        setDate(nextDate)
      }
    }
  }

  // Handle form submission for both add and edit modes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!date) {
        toast({
          title: "Missing information",
          description: "Please select a billing date",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (!formData.name.trim()) {
        toast({
          title: "Missing information",
          description: "Please enter a subscription name",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (!isValidName(formData.name)) {
        toast({
          title: "Invalid input",
          description: "Name contains invalid characters",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const price = safeParseNumber(formData.price)
      if (price <= 0 || price > 10000) {
        toast({
          title: "Invalid price",
          description: "Please enter a valid price between $0.01 and $10,000",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (!formData.category) {
        toast({
          title: "Missing information",
          description: "Please select a category",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Ensure the date is not in the past for new subscriptions
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      let nextBillingDate = new Date(date)

      // For new subscriptions, if the date is in the past, calculate the next occurrence
      if (!isEditMode && nextBillingDate < today) {
        switch (formData.billingCycle) {
          case "Monthly":
            // Add months until we reach a future date
            while (nextBillingDate < today) {
              nextBillingDate = addMonths(nextBillingDate, 1)
            }
            break
          case "Quarterly":
            while (nextBillingDate < today) {
              nextBillingDate = addMonths(nextBillingDate, 3)
            }
            break
          case "Biannually":
            while (nextBillingDate < today) {
              nextBillingDate = addMonths(nextBillingDate, 6)
            }
            break
          case "Annually":
            while (nextBillingDate < today) {
              nextBillingDate = addMonths(nextBillingDate, 12)
            }
            break
        }
      }

      const subscriptionData = {
        name: formData.name.trim(),
        price: price,
        category: formData.category,
        billingCycle: formData.billingCycle,
        nextBillingDate: nextBillingDate.toISOString().split("T")[0],
        logo: "/placeholder.svg?height=40&width=40",
        color:
          isEditMode && subscriptionId
            ? getSubscriptionById(subscriptionId)?.color ||
              `#${Math.floor(Math.random() * 16777215)
                .toString(16)
                .padStart(6, "0")}`
            : `#${Math.floor(Math.random() * 16777215)
                .toString(16)
                .padStart(6, "0")}`,
      }

      if (isEditMode && subscriptionId) {
        // Update existing subscription
        updateSubscription({
          id: subscriptionId,
          ...subscriptionData,
        })

        toast({
          title: "Subscription updated",
          description: "Your subscription has been updated successfully.",
        })
      } else {
        // Add new subscription
        addSubscription(subscriptionData)

        toast({
          title: "Subscription added",
          description: "Your new subscription has been added successfully.",
        })
      }

      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Subscription Name</Label>
            <Input
              id="name"
              placeholder="Netflix, Spotify, etc."
              required
              value={formData.name}
              onChange={handleChange}
              maxLength={50} // Limit input length
              pattern="[a-zA-Z0-9\s.,&+\-_()]+" // HTML5 validation pattern
              title="Name can only contain letters, numbers, spaces, and basic punctuation"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="10000"
                  placeholder="0.00"
                  className="pl-7"
                  required
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                required
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Music">Music</SelectItem>
                  <SelectItem value="Productivity">Productivity</SelectItem>
                  <SelectItem value="Shopping">Shopping</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Billing Cycle</Label>
            <RadioGroup
              defaultValue="Monthly"
              className="grid grid-cols-2 sm:grid-cols-4 gap-2"
              value={formData.billingCycle}
              onValueChange={(value) => handleSelectChange("billingCycle", value as any)}
            >
              <Label
                htmlFor="monthly"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="Monthly" id="monthly" className="sr-only" />
                <span className="text-sm font-medium">Monthly</span>
              </Label>
              <Label
                htmlFor="quarterly"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="Quarterly" id="quarterly" className="sr-only" />
                <span className="text-sm font-medium">Quarterly</span>
              </Label>
              <Label
                htmlFor="biannually"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="Biannually" id="biannually" className="sr-only" />
                <span className="text-sm font-medium">Biannually</span>
              </Label>
              <Label
                htmlFor="annually"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="Annually" id="annually" className="sr-only" />
                <span className="text-sm font-medium">Annually</span>
              </Label>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Next Billing Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center space-x-2 rounded-md border p-4">
                <CreditCard className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">
                    {method.type} ending in {method.last4}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Expires {method.expiryMonth.toString().padStart(2, "0")}/{method.expiryYear}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={() => router.push("/")} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : isEditMode ? "Update Subscription" : "Add Subscription"}
          </Button>
        </div>
      </Card>
    </form>
  )
}


"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Treemap } from "recharts"
import {
  getCategoryMonthlyData,
  getSubscriptionSpendingData,
  hasEnoughDataForCharts,
  getCategoryColors,
  getCategorySpendingData,
  getMonthlySpendingDifference,
  getMonthlySpendingData,
} from "@/lib/analytics-service"
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react"
import { getTotalMonthlyCost, getSubscriptionsByCategory } from "@/lib/subscription-service"

// Define default chart colors
const chartColors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

export function SubscriptionAnalytics() {
  // Get data from analytics service
  const monthlyData = getCategoryMonthlyData()
  const subscriptionData = getSubscriptionSpendingData()
  const categoryData = getCategorySpendingData()
  const hasData = hasEnoughDataForCharts()
  const categoryColorData = getCategoryColors()
  const monthlySpendingData = getMonthlySpendingData()

  // Get data for monthly spending card
  const totalMonthlyCost = getTotalMonthlyCost()
  const subscriptionsByCategory = getSubscriptionsByCategory()

  // Get monthly spending comparison data
  const { current, previous, difference, isIncrease, newSubscriptions } = getMonthlySpendingDifference()

  // Transform data for Treemap with consistent colors
  const treeMapData = subscriptionData.map((item) => ({
    name: item.name,
    size: item.value,
    color: item.color,
    category: item.category,
  }))

  // Custom legend renderer for Recharts
  const renderLegend = (props: any) => {
    const { payload } = props

    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4 px-2">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-6">
          {/* Monthly Spending Card (improved with comparison) */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending</CardTitle>
              <CardDescription>Your subscription costs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" aria-hidden="true" />
                    <span className="text-2xl font-bold">${(totalMonthlyCost || 0).toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Monthly</Badge>

                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${isIncrease ? "text-red-500" : "text-green-500"}`}
                    >
                      {isIncrease ? (
                        <>
                          <TrendingUp className="h-4 w-4" />
                          <span>+${difference.toFixed(2)}</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-4 w-4" />
                          <span>-${difference.toFixed(2)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm border-t border-b py-2">
                  <div>
                    <div className="text-muted-foreground">Previous Month</div>
                    <div className="font-medium">${previous.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-muted-foreground">Current Month</div>
                    <div className="font-medium">${current.toFixed(2)}</div>
                  </div>
                </div>

                {isIncrease && newSubscriptions > 0 && (
                  <div className="text-sm p-2 bg-muted/50 rounded-md">
                    <span className="font-medium">Note:</span> You added {newSubscriptions} new subscription
                    {newSubscriptions > 1 ? "s" : ""} this month, increasing your monthly spending by $
                    {difference.toFixed(2)}.
                  </div>
                )}

                <div className="text-xs text-muted-foreground mt-1">
                  <span className="text-red-500 font-medium">Red</span> indicates increased spending,{" "}
                  <span className="text-green-500 font-medium">green</span> indicates savings.
                </div>

                <div className="space-y-4">
                  {Object.entries(subscriptionsByCategory).map(([category, subs]) => {
                    const categoryTotal = subs.reduce((total, sub) => total + (sub.price || 0), 0)
                    const percentage = totalMonthlyCost > 0 ? (categoryTotal / totalMonthlyCost) * 100 : 0

                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{category || "Uncategorized"}</span>
                          <span className="font-medium">${categoryTotal.toFixed(2)}</span>
                        </div>
                        <Progress
                          value={percentage || 0}
                          className="h-2"
                          aria-label={`${category} spending: ${percentage.toFixed(0)}% of total`}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Spending Over Time Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending Over Time</CardTitle>
              <CardDescription>Your total subscription costs over the past year</CardDescription>
            </CardHeader>
            <CardContent>
              {hasData ? (
                <div className="h-[300px] w-full rounded-md border bg-background">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlySpendingData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <XAxis
                        dataKey="month"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        formatter={(value) => [`$${Number(value).toFixed(2)}`, "Total"]}
                        cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                      />
                      <Bar dataKey="amount" fill={chartColors[0]} name="Monthly Spending" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <NoDataPlaceholder message="No monthly spending data available. Add more subscriptions to see your spending trends." />
              )}
            </CardContent>
          </Card>

          {/* Category Spending Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending by Category</CardTitle>
              <CardDescription>Your subscription costs by category over the past year</CardDescription>
            </CardHeader>
            <CardContent>
              {hasData ? (
                <div className="h-[400px] w-full rounded-md border bg-background">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <XAxis
                        dataKey="month"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip content={<CategoryTooltip />} cursor={{ fill: "rgba(0, 0, 0, 0.1)" }} />
                      <Legend content={renderLegend} verticalAlign="bottom" height={50} />
                      {categoryColorData.map(({ category, color }, index) => (
                        <Bar
                          key={category}
                          dataKey={category}
                          stackId="a"
                          fill={color}
                          name={category}
                          radius={[0, 0, 0, 0]}
                          barSize={30}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <NoDataPlaceholder message="No monthly spending data available. Add more subscriptions to see your spending trends." />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Subscriptions</CardTitle>
              <CardDescription>Your most expensive subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full rounded-md border bg-background">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={subscriptionData.sort((a, b) => b.value - a.value).slice(0, 5)}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <XAxis
                      type="number"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={100}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {subscriptionData
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 5)
                        .map((entry) => (
                          <Cell key={`cell-${entry.name}`} fill={entry.color} />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Subscriptions</CardTitle>
              <CardDescription>Subscription costs visualized by size</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[450px] w-full rounded-md border bg-background">
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap data={treeMapData} dataKey="size" nameKey="name" stroke="#fff">
                    <Tooltip
                      formatter={(value) => `$${Number(value).toFixed(2)}`}
                      labelFormatter={(name) => `${name}`}
                    />
                    {treeMapData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Treemap>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Custom tooltip component for category stacked bars
function CategoryTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    // Calculate total
    const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0)

    return (
      <div className="bg-popover text-popover-foreground rounded-md border p-2 shadow-md">
        <div className="text-sm">
          <div className="font-medium mb-1">{label}</div>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} aria-hidden="true" />
                <span>{entry.name}:</span>
              </div>
              <span className="font-medium">${entry.value.toFixed(2)}</span>
            </div>
          ))}
          <div className="mt-1 pt-1 border-t border-border flex justify-between text-sm font-medium">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    )
  }

  return null
}

// Custom tooltip component for charts
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length && payload[0].value != null) {
    return (
      <div className="bg-popover text-popover-foreground rounded-md border p-2 shadow-md">
        <div className="text-sm">
          <div className="font-medium">{label || "Unknown"}</div>
          <div className="text-sm text-muted-foreground">${(payload[0].value || 0).toFixed(2)}</div>
        </div>
      </div>
    )
  }

  return null
}

// Add a NoDataPlaceholder component at the end of the file
function NoDataPlaceholder({ message = "No data available" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[300px] text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12 text-muted-foreground mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <h3 className="font-medium text-lg">No Chart Data</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-md">{message}</p>
    </div>
  )
}


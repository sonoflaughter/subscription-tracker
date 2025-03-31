"use client"

import type React from "react"

import { cn } from "@/lib/utils"

const Chart = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("relative", className)} {...props} />
}
Chart.displayName = "Chart"

const ChartContainer = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("rounded-md border bg-background", className)} {...props} />
}
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("bg-popover text-popover-foreground rounded-md border p-2 shadow-md", className)} {...props} />
  )
}
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("text-sm", className)} {...props} />
}
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("flex items-center gap-4 flex-wrap", className)} {...props} />
}
ChartLegend.displayName = "ChartLegend"

const ChartLegendItem = ({
  name,
  color,
  className,
  ...props
}: { name: string; color: string } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("flex items-center space-x-2", className)} {...props}>
      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-sm">{name}</span>
    </div>
  )
}
ChartLegendItem.displayName = "ChartLegendItem"

export { Chart, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendItem }


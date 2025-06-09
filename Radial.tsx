import { TrendingUp } from "lucide-react"
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { useState, useEffect } from "react"
import axios from "axios"

export function RadialComponent() {
  const [totalEnrollments, setTotalEnrollments] = useState<number | null>(null)

  useEffect(() => {
    const fetchTotalEnrollments = async () => {
      try {
        const response = await axios.get("http://localhost:9092/auth/instructor/course-sales", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        const total = response.data.reduce(
          (sum: number, item: { totalSales: number }) => sum + item.totalSales,
          0
        )

        setTotalEnrollments(total)
      } catch (error) {
        console.error("Error fetching total enrollments:", error)
      }
    }

    fetchTotalEnrollments()
  }, [])

  const chartData = [
    { browser: "Total Enrollments", visitors: totalEnrollments || 0, fill: "var(--chart-1)" },
  ]

  const chartConfig = {
    visitors: {
      label: "Enrollments",
    },
    totalEnrollments: {
      label: "Total Enrollments",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Total Enrollments</CardTitle>
        <CardDescription>This Month</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={250}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="visitors" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {totalEnrollments?.toLocaleString() || 0}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Enrollments
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Great job! You're making good progress.<TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total enrollments for this instructor
        </div>
      </CardFooter>
    </Card>
  )
}

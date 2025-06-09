import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type CourseSales = {
  courseTitle: string
  totalSales: number
  fill?: string
}

export function BarComponent() {
  const [salesData, setSalesData] = useState<CourseSales[]>([])

  useEffect(() => {
    const token = localStorage.getItem("token")

    const chartColors = [
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
    ]

    fetch("http://localhost:9092/auth/instructor/course-sales", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const contentType = res.headers.get("content-type")
        if (!res.ok || !contentType?.includes("application/json")) {
          const errorText = await res.text()
          throw new Error(errorText)
        }
        return res.json()
      })
      .then((data) => {
        setSalesData(
          data.map((item: CourseSales, index: number) => ({
            courseTitle: item.courseTitle,
            totalSales: item.totalSales,
            fill: chartColors[index % chartColors.length],
          }))
        )
      })
      .catch((err) => console.error("Failed to fetch course sales:", err))
  }, [])

  const chartConfig: ChartConfig = {
    totalSales: {
      label: "Total Sales",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Number of Courses Sold</CardTitle>
        <CardDescription>
          {salesData.length === 1
            ? `Sales data for the course: ${salesData[0].courseTitle}, Total Sales: ${salesData[0].totalSales}`
            : `Instructor's course sales data. Showing sales for ${salesData.length} courses.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            data={salesData}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="courseTitle"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <XAxis dataKey="totalSales" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="totalSales" layout="vertical" radius={5}>
              {salesData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {salesData.length > 0 && (() => {
          const topCourse = salesData.reduce((top, current) =>
            current.totalSales > top.totalSales ? current : top
          )
          return (
            <div className="flex items-center gap-2 font-medium leading-none">
              Top Performing Course:{" "}
              <span>
                {topCourse.courseTitle}
              </span>
              <span className="text-muted-foreground">
                ({topCourse.totalSales} sales)
              </span>
            </div>
          )
        })()}
        <div className="leading-none text-muted-foreground">
          Showing total course sales for this instructor
        </div>
      </CardFooter>

    </Card>
  )
}

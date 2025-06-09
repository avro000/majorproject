import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { LineChart, Line, XAxis, CartesianGrid } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { AlertCircle } from "lucide-react"

type Transaction = {
  paymentGatewayId: string
  amount: number
  paidAt: string
}

type SalesData = {
  date: string
  total: number
}

export default function SalesChart() {
  const [data, setData] = useState<SalesData[] | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get<Transaction[]>(
          "http://localhost:9092/auth/instructor/transactions",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )

        const grouped = res.data.reduce<Record<string, number>>((acc, curr) => {
          const date = new Date(curr.paidAt).toISOString().split("T")[0]
          acc[date] = (acc[date] || 0) + curr.amount
          return acc
        }, {})

        const salesData = Object.entries(grouped).map(([date, total]) => ({
          date,
          total,
        }))
        salesData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        setData(salesData)
      } catch (err) {
        console.error("Failed to load sales data", err)
      }
    }

    fetchData()
  }, [])

  const totalSales = useMemo(() => {
    if (!data) return 0
    return data.reduce((acc, curr) => acc + curr.total, 0)
  }, [data])

  if (!data) return <Card className=" text-destructive-foreground flex flex-row items-center p-6"><AlertCircle /> No sales data available</Card>

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Revenue Chart</CardTitle>
          <CardDescription>Daily total revenue in the last 3 months</CardDescription>
        </div>
        <div className="flex">
          <div className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-xs text-muted-foreground">Last 3 months sales</span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              ₹{totalSales.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={{
            total: {
              label: "Total",
              color: "var(--chart-1)",
            },
          }}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            data={data}
            margin={{ top: 20, right: 24, left: 24, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              interval={0}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={{
                strokeDasharray: "5 5",
              }}
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="total"
                  indicator="dashed"
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                />
              }
            />
            <Line
              type="linear"
              dataKey="total"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={true}
              isAnimationActive={true}
              animationDuration={1500}
              animationBegin={0}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

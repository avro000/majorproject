import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardHeader, CardTitle } from "./components/ui/card"
import { useEffect, useState } from "react"
import axios from "axios"

export function TableDemo() {
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get("http://localhost:9092/auth/instructor/transactions", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        setTransactions(response.data)
      } catch (error) {
        console.error("Error fetching transactions:", error)
      }
    }

    fetchTransactions()
  }, [])

  return (
    <Card>
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-2">
          <CardTitle>Recent Transactions</CardTitle>
        </div>
      </CardHeader>
      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] text-left">Invoice</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Method</TableHead>
            <TableHead className="text-center">Paid At</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.paymentGatewayId}>
              <TableCell className="font-medium text-left" >{transaction.paymentGatewayId}</TableCell>
              <TableCell className="text-center">{transaction.paymentStatus}</TableCell>
              <TableCell className="text-center">{transaction.paymentMethod}</TableCell>
              <TableCell className="text-center">{new Date(transaction.paidAt).toLocaleString()}</TableCell>
              <TableCell className="text-right">₹{transaction.amount.toLocaleString("en-IN")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>Total</TableCell>
            <TableCell className="text-right">
              ₹{transactions.reduce((total, transaction) => total + transaction.amount, 0).toLocaleString("en-IN")}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </Card>
  )
}

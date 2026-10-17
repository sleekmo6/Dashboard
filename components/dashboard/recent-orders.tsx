"use client"

import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface Order {
  id: string
  order_number: string
  customer_name: string
  total_amount: number
  status: string
  created_at: string
}

export default function RecentOrders({ orders }: { orders: Order[] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
      case "processing":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
      case "shipped":
        return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
      case "delivered":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "cancelled":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
      default:
        return ""
    }
  }

  if (orders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No orders yet
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="space-y-1">
            <p className="text-sm font-medium">{order.order_number}</p>
            <p className="text-xs text-muted-foreground">{order.customer_name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold">${parseFloat(order.total_amount.toString()).toFixed(2)}</p>
            </div>
            <Badge className={getStatusColor(order.status)}>
              {order.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}

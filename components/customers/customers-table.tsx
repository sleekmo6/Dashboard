"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Customer {
  id: string
  full_name: string
  email: string
  phone: string | null
  total_orders: number
  total_spent: number
  last_order_at: string | null
  created_at: string
}

export default function CustomersTable({ customers }: { customers: Customer[] }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCustomers = customers.filter((customer) =>
    customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Customer</th>
                <th className="text-left p-4 font-medium">Phone</th>
                <th className="text-left p-4 font-medium">Total Orders</th>
                <th className="text-left p-4 font-medium">Total Spent</th>
                <th className="text-left p-4 font-medium">Last Order</th>
                <th className="text-left p-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{customer.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {customer.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {customer.phone || "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium">{customer.total_orders}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium">
                        ${parseFloat(customer.total_spent.toString()).toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {customer.last_order_at
                          ? formatDistanceToNow(new Date(customer.last_order_at), {
                              addSuffix: true,
                            })
                          : "Never"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(customer.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

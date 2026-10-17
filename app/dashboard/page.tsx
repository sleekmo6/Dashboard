import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, Package, Users } from "lucide-react"
import RecentOrders from "@/components/dashboard/recent-orders"
import SalesChart from "@/components/dashboard/sales-chart"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch dashboard stats
  const [ordersResult, productsResult, customersResult] = await Promise.all([
    supabase.from("orders").select("total_amount, status"),
    supabase.from("products").select("id"),
    supabase.from("customers").select("id, total_spent"),
  ])

  const orders = ordersResult.data || []
  const products = productsResult.data || []
  const customers = customersResult.data || []

  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0)
  const totalOrders = orders.length
  const totalProducts = products.length
  const totalCustomers = customers.length
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Get recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  // Get top selling products
  const { data: topProducts } = await supabase
    .from("order_items")
    .select("product_name, quantity")
    .limit(10)

  const productSales = topProducts?.reduce((acc: Record<string, number>, item) => {
    acc[item.product_name] = (acc[item.product_name] || 0) + item.quantity
    return acc
  }, {})

  const topSellingProducts = Object.entries(productSales || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([name, quantity]) => ({ name, quantity }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your store performance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {totalOrders} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: ${averageOrderValue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In your catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total registered
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesChart />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSellingProducts.length > 0 ? (
                topSellingProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.quantity} sold
                      </p>
                    </div>
                    <div className="text-sm font-semibold">{product.quantity}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No sales data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentOrders orders={recentOrders || []} />
        </CardContent>
      </Card>
    </div>
  )
}

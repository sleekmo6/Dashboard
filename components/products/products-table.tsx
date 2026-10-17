"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Edit, Trash2, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/sonner"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  stock_quantity: number
  status: string
  sku: string | null
  category: { name: string } | null
  images: { image_url: string; is_primary: boolean }[]
}

export default function ProductsTable({ products }: { products: Product[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    setIsDeleting(id)
    try {
      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) {
        toast.error("Failed to delete product", {
          description: error.message,
        })
        return
      }

      toast.success("Product deleted successfully")
      router.refresh()
    } catch {
      toast.error("An error occurred")
    } finally {
      setIsDeleting(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500/10 text-green-500"
      case "draft":
        return "bg-yellow-500/10 text-yellow-500"
      case "archived":
        return "bg-gray-500/10 text-gray-500"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
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
                <th className="text-left p-4 font-medium">Product</th>
                <th className="text-left p-4 font-medium">SKU</th>
                <th className="text-left p-4 font-medium">Category</th>
                <th className="text-left p-4 font-medium">Price</th>
                <th className="text-left p-4 font-medium">Stock</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const primaryImage = product.images?.find((img) => img.is_primary)
                  const imageUrl = primaryImage?.image_url || product.images?.[0]?.image_url

                  return (
                    <tr key={product.id} className="hover:bg-muted/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded border bg-muted flex items-center justify-center overflow-hidden">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="object-cover"
                              />
                            ) : (
                              <span className="text-xs text-muted-foreground">No image</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {product.sku || "—"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">
                          {product.category?.name || "—"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium">
                          ${parseFloat(product.price.toString()).toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={product.stock_quantity < 10 ? "text-red-500" : ""}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(product.status)}>
                          {product.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/products/${product.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                            disabled={isDeleting === product.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

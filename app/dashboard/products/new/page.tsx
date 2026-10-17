import { createClient } from "@/lib/supabase/server"
import ProductForm from "@/components/products/product-form"

export default async function NewProductPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="text-muted-foreground mt-1">
          Create a new product in your catalog
        </p>
      </div>

      <ProductForm categories={categories || []} />
    </div>
  )
}

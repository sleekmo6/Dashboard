import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import ProductForm from "@/components/products/product-form"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [categoriesResult, productResult] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase
      .from("products")
      .select(
        `
        *,
        images:product_images(*)
      `
      )
      .eq("id", id)
      .single(),
  ])

  if (!productResult.data) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground mt-1">
          Update product information
        </p>
      </div>

      <ProductForm
        product={productResult.data}
        categories={categoriesResult.data || []}
      />
    </div>
  )
}

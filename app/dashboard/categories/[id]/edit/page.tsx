import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import CategoryForm from "@/components/categories/category-form"

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single()

  if (!category) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Category</h1>
        <p className="text-muted-foreground mt-1">
          Update category information
        </p>
      </div>

      <CategoryForm category={category} />
    </div>
  )
}

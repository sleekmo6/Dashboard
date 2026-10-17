"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/sonner"
import { Loader2, Upload } from "lucide-react"
import Image from "next/image"

const settingsSchema = z.object({
  store_name: z.string().min(1, "Store name is required"),
  store_description: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
  payment_provider: z.enum(["stripe", "paystack"]).optional().or(z.literal("")),
  stripe_public_key: z.string().optional(),
  stripe_secret_key: z.string().optional(),
  paystack_public_key: z.string().optional(),
  paystack_secret_key: z.string().optional(),
  shipping_enabled: z.boolean(),
  store_status: z.enum(["open", "closed"]),
  standard_shipping_rate: z.string().optional(),
  free_shipping_threshold: z.string().optional(),
  express_shipping_rate: z.string().optional(),
})

type SettingsFormData = z.infer<typeof settingsSchema>

interface StoreSettings {
  id?: string
  store_name?: string
  store_logo?: string | null
  store_description?: string | null
  currency?: string
  payment_provider?: string | null
  stripe_public_key?: string | null
  stripe_secret_key?: string | null
  paystack_public_key?: string | null
  paystack_secret_key?: string | null
  shipping_enabled?: boolean
  shipping_rates?: {
    standard?: { rate?: number; free_threshold?: number }
    express?: { rate?: number }
  } | null
  store_status?: string
}

export default function SettingsForm({ settings }: { settings: StoreSettings | null }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logo, setLogo] = useState<string | null>(settings?.store_logo || null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const rates = settings?.shipping_rates

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      store_name: settings?.store_name || "My Store",
      store_description: settings?.store_description || "",
      currency: settings?.currency || "USD",
      payment_provider: (settings?.payment_provider as "stripe" | "paystack") || "",
      stripe_public_key: settings?.stripe_public_key || "",
      stripe_secret_key: settings?.stripe_secret_key || "",
      paystack_public_key: settings?.paystack_public_key || "",
      paystack_secret_key: settings?.paystack_secret_key || "",
      shipping_enabled: settings?.shipping_enabled ?? true,
      store_status: (settings?.store_status as "open" | "closed") || "open",
      standard_shipping_rate: rates?.standard?.rate?.toString() || "5.99",
      free_shipping_threshold: rates?.standard?.free_threshold?.toString() || "50",
      express_shipping_rate: rates?.express?.rate?.toString() || "12.99",
    },
  })

  const paymentProvider = watch("payment_provider")
  const shippingEnabled = watch("shipping_enabled")

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `logo-${Date.now()}.${fileExt}`
      const filePath = `store/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        toast.error("Failed to upload logo", {
          description: uploadError.message,
        })
        return
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(filePath)

      setLogo(publicUrl)
      toast.success("Logo uploaded successfully")
    } catch {
      toast.error("An error occurred")
    } finally {
      setUploadingLogo(false)
    }
  }

  const onSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true)

    try {
      const settingsData = {
        store_name: data.store_name,
        store_logo: logo,
        store_description: data.store_description || null,
        currency: data.currency,
        payment_provider: data.payment_provider || null,
        stripe_public_key: data.stripe_public_key || null,
        stripe_secret_key: data.stripe_secret_key || null,
        paystack_public_key: data.paystack_public_key || null,
        paystack_secret_key: data.paystack_secret_key || null,
        shipping_enabled: data.shipping_enabled,
        store_status: data.store_status,
        shipping_rates: {
          standard: {
            rate: parseFloat(data.standard_shipping_rate || "0"),
            free_threshold: parseFloat(data.free_shipping_threshold || "0"),
          },
          express: {
            rate: parseFloat(data.express_shipping_rate || "0"),
          },
        },
      }

      if (settings?.id) {
        const { error } = await supabase
          .from("store_settings")
          .update(settingsData)
          .eq("id", settings.id)

        if (error) {
          toast.error("Failed to update settings", {
            description: error.message,
          })
          return
        }
      } else {
        const { error } = await supabase.from("store_settings").insert(settingsData)

        if (error) {
          toast.error("Failed to save settings", {
            description: error.message,
          })
          return
        }
      }

      toast.success("Settings saved successfully")
      router.refresh()
    } catch {
      toast.error("An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
          <CardDescription>Basic details about your store</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="store_name">Store Name *</Label>
            <Input id="store_name" {...register("store_name")} />
            {errors.store_name && (
              <p className="text-sm text-red-500">{errors.store_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="store_description">Description</Label>
            <Textarea id="store_description" {...register("store_description")} rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Store Logo</Label>
            <div className="flex items-center gap-4">
              {logo && (
                <div className="h-16 w-16 rounded border overflow-hidden bg-muted relative">
                  <Image src={logo} alt="Store logo" fill className="object-cover" />
                </div>
              )}
              <label className="inline-flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent text-sm">
                <Upload className="h-4 w-4" />
                {uploadingLogo ? "Uploading..." : "Upload Logo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <select
                id="currency"
                {...register("currency")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="NGN">NGN (₦)</option>
                <option value="GHS">GHS (₵)</option>
                <option value="KES">KES (KSh)</option>
                <option value="ZAR">ZAR (R)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="store_status">Store Status</Label>
              <select
                id="store_status"
                {...register("store_status")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Providers</CardTitle>
          <CardDescription>Configure Stripe or Paystack keys</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment_provider">Payment Provider</Label>
            <select
              id="payment_provider"
              {...register("payment_provider")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">None</option>
              <option value="stripe">Stripe</option>
              <option value="paystack">Paystack</option>
            </select>
          </div>

          {paymentProvider === "stripe" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="stripe_public_key">Stripe Public Key</Label>
                <Input id="stripe_public_key" {...register("stripe_public_key")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripe_secret_key">Stripe Secret Key</Label>
                <Input
                  id="stripe_secret_key"
                  type="password"
                  {...register("stripe_secret_key")}
                />
              </div>
            </div>
          )}

          {paymentProvider === "paystack" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="paystack_public_key">Paystack Public Key</Label>
                <Input id="paystack_public_key" {...register("paystack_public_key")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paystack_secret_key">Paystack Secret Key</Label>
                <Input
                  id="paystack_secret_key"
                  type="password"
                  {...register("paystack_secret_key")}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipping</CardTitle>
          <CardDescription>Configure shipping options and rates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              id="shipping_enabled"
              type="checkbox"
              {...register("shipping_enabled")}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="shipping_enabled">Enable shipping</Label>
          </div>

          {shippingEnabled && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="standard_shipping_rate">Standard Rate</Label>
                <Input
                  id="standard_shipping_rate"
                  type="number"
                  step="0.01"
                  {...register("standard_shipping_rate")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="free_shipping_threshold">Free Shipping Over</Label>
                <Input
                  id="free_shipping_threshold"
                  type="number"
                  step="0.01"
                  {...register("free_shipping_threshold")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="express_shipping_rate">Express Rate</Label>
                <Input
                  id="express_shipping_rate"
                  type="number"
                  step="0.01"
                  {...register("express_shipping_rate")}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </form>
  )
}

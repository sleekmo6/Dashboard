import { createClient } from "@/lib/supabase/server"
import SettingsForm from "@/components/settings/settings-form"

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: settings } = await supabase
    .from("store_settings")
    .select("*")
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Store Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your store information and preferences
        </p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  )
}

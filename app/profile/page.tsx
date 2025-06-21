import { requireAuth } from "@/lib/auth"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ProfileForm } from "@/components/profile/profile-form"
import { getUserProfile } from "@/app/actions/profile-actions"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ProfilePage() {
  const user = await requireAuth()
  const profile = await getUserProfile()

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
        <DashboardSidebar user={user} />
        <main className="flex-1 p-6 pt-16 md:pt-6">
          <div className="mx-auto max-w-4xl space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
              <p className="text-muted-foreground">Manage your account settings and profile information.</p>
            </div>

            <ProfileForm user={user} profile={profile} />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

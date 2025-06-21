import { requireAuth } from "@/lib/auth"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { CodeEditor } from "@/components/code-editor/code-editor"
import { getUserProjects } from "@/app/actions/project-actions"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function IDEPage() {
  const user = await requireAuth()
  const projects = await getUserProjects()

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
        <DashboardSidebar user={user} />
        <main className="flex-1 overflow-hidden">
          <CodeEditor initialProjects={projects} />
        </main>
      </div>
    </SidebarProvider>
  )
}

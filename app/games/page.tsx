import { requireAuth } from "@/lib/auth"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { GamesHub } from "@/components/games/games-hub"
import { getGames, getUserGameStats } from "@/app/actions/game-actions"

export default async function GamesPage() {
  const user = await requireAuth()
  const games = await getGames()
  const stats = await getUserGameStats()

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
        <DashboardSidebar user={user} />
        <main className="flex-1 p-6 pt-16 md:pt-6">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Coding Games</h1>
                <p className="text-muted-foreground">
                  Sharpen your coding skills with fun, interactive challenges and games.
                </p>
              </div>
            </div>
            <GamesHub games={games} stats={stats} />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

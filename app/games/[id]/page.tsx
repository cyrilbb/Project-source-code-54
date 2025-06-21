import { notFound } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { GameInterface } from "@/components/games/game-interface"
import { getGameById, getGameChallenges, getGameLeaderboard } from "@/app/actions/game-actions"

export default async function GamePage({ params }) {
  const user = await requireAuth()
  const gameId = Number.parseInt(params.id)

  if (isNaN(gameId)) {
    notFound()
  }

  const game = await getGameById(gameId)

  if (!game) {
    notFound()
  }

  const challenges = await getGameChallenges(gameId)
  const leaderboard = await getGameLeaderboard(gameId)

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
        <DashboardSidebar user={user} />
        <main className="flex-1 overflow-auto">
          <GameInterface game={game} challenges={challenges} leaderboard={leaderboard} />
        </main>
      </div>
    </SidebarProvider>
  )
}

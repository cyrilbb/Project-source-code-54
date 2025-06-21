import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { RecentGames } from "@/components/recent-games"
import { SavedProjects } from "@/components/saved-projects"
import { AchievementsList } from "@/components/achievements-list"
import { LearningProgress } from "@/components/learning-progress"
import { getDashboardStats } from "@/app/actions/dashboard-actions"
import { requireAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Code, Gamepad2, Trophy } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DashboardPage() {
  const user = await requireAuth()
  const stats = await getDashboardStats()

  const isNewUser = stats.progressPercentage === 0 && stats.achievementCount === 0 && stats.xpPoints === 0

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
        <DashboardSidebar user={user} />
        <main className="flex-1 p-6 pt-16 md:pt-6">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                  {isNewUser
                    ? "Welcome to CodEd! Let's get started with your coding journey."
                    : `Welcome back, ${user.displayName || user.username}! Here's your progress.`}
                </p>
              </div>
            </div>

            {isNewUser ? (
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl">Welcome to CodEd!</CardTitle>
                  <CardDescription>Your interactive coding platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p>Get started with your coding journey by exploring these features:</p>

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <Card className="bg-background border-2 border-primary/20">
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Code className="h-6 w-6 text-primary" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">Code in the IDE</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Write and test code in our interactive development environment
                          </p>
                          <Button asChild>
                            <Link href="/ide">Open IDE</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-background border-2 border-primary/20">
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Gamepad2 className="h-6 w-6 text-primary" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">Play Coding Games</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Sharpen your skills with fun interactive challenges
                          </p>
                          <Button asChild>
                            <Link href="/games">Play Games</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-background border-2 border-primary/20 sm:col-span-2 lg:col-span-1">
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Trophy className="h-6 w-6 text-primary" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">Complete Achievements</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Earn badges and track your progress as you learn
                          </p>
                          <Button asChild>
                            <Link href="/profile">View Profile</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Learning Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.progressPercentage}%</div>
                      <Progress value={stats.progressPercentage} className="mt-2" />
                      <p className="mt-2 text-xs text-muted-foreground">
                        {stats.progressPercentage > 0 ? "+2.5% from last week" : "Start learning today!"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.achievementCount || 0}</div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {stats?.newAchievements > 0
                          ? `${stats.newAchievements} new badges this month`
                          : "Complete activities to earn badges"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">XP Points</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.xpPoints?.toLocaleString() || 0}</div>
                      <Progress value={stats.xpPoints > 0 ? 65 : 0} className="mt-2" />
                      <p className="mt-2 text-xs text-muted-foreground">
                        {stats.xpPoints > 0 ? "760 XP until next level" : "Earn XP by completing activities"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Login Streak</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.loginStreak || 0} days</div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {stats.loginStreak > 0 ? "3 days until bonus reward" : "Log in daily to build your streak"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="games">Games</TabsTrigger>
                    <TabsTrigger value="achievements">Achievements</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                      <Card className="lg:col-span-4">
                        <CardHeader>
                          <CardTitle>Learning Progress</CardTitle>
                          <CardDescription>Your progress across all activities</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <LearningProgress />
                        </CardContent>
                      </Card>
                      <Card className="lg:col-span-3">
                        <CardHeader>
                          <CardTitle>Achievements</CardTitle>
                          <CardDescription>Badges and trophies you've earned</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <AchievementsList />
                        </CardContent>
                      </Card>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                      <Card className="lg:col-span-3">
                        <CardHeader>
                          <CardTitle>Recently Played Games</CardTitle>
                          <CardDescription>Your recent gaming activity</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <RecentGames />
                        </CardContent>
                      </Card>
                      <Card className="lg:col-span-4">
                        <CardHeader>
                          <CardTitle>Saved Projects</CardTitle>
                          <CardDescription>Your recent code projects and snippets</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <SavedProjects />
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  <TabsContent value="projects" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>All Projects</CardTitle>
                        <CardDescription>View and manage all your saved projects</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <SavedProjects showEmpty={true} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="games" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Coding Games</CardTitle>
                        <CardDescription>Play games to reinforce your coding skills</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {stats.gamesPlayed > 0 ? (
                          <RecentGames showAll={true} />
                        ) : (
                          <div className="text-center py-8">
                            <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Games Played Yet</h3>
                            <p className="text-muted-foreground mb-4">Play your first game to track your progress</p>
                            <Button asChild>
                              <Link href="/games">Play Now</Link>
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="achievements" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Your Achievements</CardTitle>
                        <CardDescription>Badges and rewards you've earned</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <AchievementsList showAll={true} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

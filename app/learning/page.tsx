import { requireAuth } from "@/lib/auth"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { getLearningModules, getAllUserProgress } from "@/app/actions/learning-actions"
import { ModuleCard } from "@/components/learning/module-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Code, FileCode } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function LearningPage() {
  const user = await requireAuth()
  const modules = await getLearningModules()
  const userProgress = await getAllUserProgress()

  // Group modules by category
  const htmlCssModules = modules.filter((module) => module.language === "HTML" || module.language === "CSS")

  const javascriptModules = modules.filter((module) => module.language === "JavaScript")

  const reactModules = modules.filter((module) => module.language === "React")

  const otherModules = modules.filter(
    (module) =>
      module.language !== "HTML" &&
      module.language !== "CSS" &&
      module.language !== "JavaScript" &&
      module.language !== "React",
  )

  // Calculate overall progress
  const totalModules = modules.length
  const completedModules = userProgress.filter((p) => p.completed).length
  const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
        <DashboardSidebar user={user} />
        <main className="flex-1 p-6 pt-16 md:pt-6">
          <div className="mx-auto max-w-6xl space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Learning Modules</h1>
              <p className="text-muted-foreground">Explore our interactive coding tutorials and track your progress.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overallProgress}%</div>
                  <div className="mt-2 h-2 w-full rounded-full bg-primary/20">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${overallProgress}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {completedModules} of {totalModules} modules completed
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Modules In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userProgress.filter((p) => p.progressPercentage > 0 && p.progressPercentage < 100).length}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Continue where you left off</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">XP Earned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.xpPoints || 0}</div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Level {Math.floor((user.xpPoints || 0) / 1000) + 1}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All Modules</TabsTrigger>
                <TabsTrigger value="html-css">HTML & CSS</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="react">React</TabsTrigger>
                {otherModules.length > 0 && <TabsTrigger value="other">Other</TabsTrigger>}
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {modules.map((module) => {
                    const progress = userProgress.find((p) => p.moduleId === module.id)
                    return (
                      <ModuleCard
                        key={module.id}
                        module={module}
                        progress={progress?.progressPercentage || 0}
                        completed={progress?.completed || false}
                      />
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="html-css" className="space-y-4">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {htmlCssModules.map((module) => {
                    const progress = userProgress.find((p) => p.moduleId === module.id)
                    return (
                      <ModuleCard
                        key={module.id}
                        module={module}
                        progress={progress?.progressPercentage || 0}
                        completed={progress?.completed || false}
                      />
                    )
                  })}
                  {htmlCssModules.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                      <FileCode className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No HTML & CSS Modules</h3>
                      <p className="text-muted-foreground max-w-md">
                        We're working on adding HTML and CSS modules. Check back soon!
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="javascript" className="space-y-4">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {javascriptModules.map((module) => {
                    const progress = userProgress.find((p) => p.moduleId === module.id)
                    return (
                      <ModuleCard
                        key={module.id}
                        module={module}
                        progress={progress?.progressPercentage || 0}
                        completed={progress?.completed || false}
                      />
                    )
                  })}
                  {javascriptModules.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                      <Code className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No JavaScript Modules</h3>
                      <p className="text-muted-foreground max-w-md">
                        We're working on adding JavaScript modules. Check back soon!
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="react" className="space-y-4">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {reactModules.map((module) => {
                    const progress = userProgress.find((p) => p.moduleId === module.id)
                    return (
                      <ModuleCard
                        key={module.id}
                        module={module}
                        progress={progress?.progressPercentage || 0}
                        completed={progress?.completed || false}
                      />
                    )
                  })}
                  {reactModules.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No React Modules</h3>
                      <p className="text-muted-foreground max-w-md">
                        We're working on adding React modules. Check back soon!
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {otherModules.length > 0 && (
                <TabsContent value="other" className="space-y-4">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {otherModules.map((module) => {
                      const progress = userProgress.find((p) => p.moduleId === module.id)
                      return (
                        <ModuleCard
                          key={module.id}
                          module={module}
                          progress={progress?.progressPercentage || 0}
                          completed={progress?.completed || false}
                        />
                      )
                    })}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

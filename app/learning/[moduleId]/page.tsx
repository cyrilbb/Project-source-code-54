import { notFound } from "next/navigation"
import Link from "next/link"
import { requireAuth } from "@/lib/auth"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { getModuleWithLessons, getUserModuleProgress } from "@/app/actions/learning-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, Check, Clock, LockIcon } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ModulePage({ params }) {
  const user = await requireAuth()
  const moduleId = Number(params.moduleId)

  if (isNaN(moduleId)) {
    notFound()
  }

  const module = await getModuleWithLessons(moduleId)

  if (!module) {
    notFound()
  }

  const progress = await getUserModuleProgress(moduleId)

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
        <DashboardSidebar user={user} />
        <main className="flex-1 p-6 pt-16 md:pt-6">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" asChild>
                  <Link href="/learning">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">{module.title}</h1>
                <Badge variant={module.difficulty === "Beginner" ? "default" : "outline"}>{module.difficulty}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/5">
                  {module.language}
                </Badge>
              </div>
            </div>

            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle>Module Progress</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {progress?.completedLessons || 0} of {progress?.totalLessons || 0} lessons completed
                    </span>
                    <span className="text-sm font-medium">{progress?.progressPercentage || 0}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-primary/20">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${progress?.progressPercentage || 0}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Lessons</h2>
              <div className="grid gap-4">
                {module.lessons.map((lesson, index) => {
                  const lessonProgress = progress?.lessonProgress?.find((p) => p.lessonId === lesson.id)
                  const isCompleted = lessonProgress?.isCompleted || false
                  const isLocked =
                    index > 0 &&
                    !progress?.lessonProgress?.find((p) => p.lessonId === module.lessons[index - 1].id && p.isCompleted)

                  return (
                    <Card
                      key={lesson.id}
                      className={`
                      ${isCompleted ? "bg-green-500/5 border-green-500/20" : ""}
                      ${isLocked ? "bg-muted/30 opacity-70" : ""}
                    `}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`
                            flex h-10 w-10 items-center justify-center rounded-full 
                            ${isCompleted ? "bg-green-500/10" : "bg-primary/10"}
                            ${isLocked ? "bg-muted" : ""}
                          `}
                          >
                            {isCompleted ? (
                              <Check className="h-5 w-5 text-green-500" />
                            ) : isLocked ? (
                              <LockIcon className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <BookOpen className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{lesson.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {isCompleted ? "Completed" : isLocked ? "Locked" : "Not started"}
                            </p>
                          </div>
                        </div>
                        <div>
                          {isLocked ? (
                            <Button variant="outline" disabled>
                              <LockIcon className="h-4 w-4 mr-2" />
                              Locked
                            </Button>
                          ) : (
                            <Button asChild variant={isCompleted ? "outline" : "default"}>
                              <Link href={`/learning/${moduleId}/${lesson.id}`}>
                                {isCompleted ? (
                                  <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Review
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-4 w-4 mr-2" />
                                    Start
                                  </>
                                )}
                              </Link>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

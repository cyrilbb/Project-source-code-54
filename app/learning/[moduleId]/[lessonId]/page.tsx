import { notFound } from "next/navigation"
import Link from "next/link"
import { requireAuth } from "@/lib/auth"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { getLessonWithContent, getUserLessonProgress } from "@/app/actions/learning-actions"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { LessonContent } from "@/components/learning/lesson-content"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function LessonPage({ params }) {
  const user = await requireAuth()
  const moduleId = Number(params.moduleId)
  const lessonId = Number(params.lessonId)

  if (isNaN(moduleId) || isNaN(lessonId)) {
    notFound()
  }

  const lesson = await getLessonWithContent(lessonId)

  if (!lesson || lesson.moduleId !== moduleId) {
    notFound()
  }

  const progress = await getUserLessonProgress(lessonId)

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
        <DashboardSidebar user={user} />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-4xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" asChild>
                  <Link href={`/learning/${moduleId}`}>
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">{lesson.title}</h1>
                  <p className="text-sm text-muted-foreground">{lesson.module.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {progress?.isCompleted ? (
                  <div className="flex items-center text-green-500">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">Completed</span>
                  </div>
                ) : null}
              </div>
            </div>

            <LessonContent lesson={lesson} moduleId={moduleId} progress={progress} />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getLearningModules() {
  const modules = await prisma.learningModule.findMany({
    orderBy: {
      orderIndex: "asc",
    },
  })

  return modules
}

export async function getModuleWithLessons(moduleId: number) {
  const module = await prisma.learningModule.findUnique({
    where: {
      id: moduleId,
    },
    include: {
      lessons: {
        orderBy: {
          orderIndex: "asc",
        },
      },
    },
  })

  return module
}

export async function getLessonWithContent(lessonId: number) {
  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
    },
    include: {
      module: true,
    },
  })

  if (!lesson) return null

  const content = await prisma.learningContent.findMany({
    where: {
      lessonId,
    },
    orderBy: {
      contentOrder: "asc",
    },
  })

  return {
    ...lesson,
    content,
  }
}

export async function getUserModuleProgress(moduleId: number) {
  const user = await getCurrentUser()
  if (!user) return null

  // Get all lessons for this module
  const lessons = await prisma.lesson.findMany({
    where: {
      moduleId,
    },
    select: {
      id: true,
    },
  })

  const lessonIds = lessons.map((lesson) => lesson.id)

  // Get user progress for these lessons
  const progress = await prisma.userLessonProgress.findMany({
    where: {
      userId: user.id,
      lessonId: {
        in: lessonIds,
      },
    },
  })

  // Calculate overall progress
  const totalLessons = lessonIds.length
  const completedLessons = progress.filter((p) => p.isCompleted).length
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return {
    totalLessons,
    completedLessons,
    progressPercentage,
    lessonProgress: progress,
  }
}

export async function getUserLessonProgress(lessonId: number) {
  const user = await getCurrentUser()
  if (!user) return null

  const progress = await prisma.userLessonProgress.findUnique({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId,
      },
    },
  })

  return progress
}

export async function markLessonAsCompleted(lessonId: number) {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not authenticated")

  // Get the lesson to find its module
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { moduleId: true },
  })

  if (!lesson) throw new Error("Lesson not found")

  // Update or create the lesson progress
  const progress = await prisma.userLessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId,
      },
    },
    update: {
      isCompleted: true,
      completedAt: new Date(),
      updatedAt: new Date(),
    },
    create: {
      userId: user.id,
      lessonId,
      isCompleted: true,
      completedAt: new Date(),
    },
  })

  // Update the module progress
  await updateModuleProgress(user.id, lesson.moduleId)

  // Award XP for completing a lesson
  await prisma.user.update({
    where: { id: user.id },
    data: {
      xpPoints: {
        increment: 50, // Award 50 XP for completing a lesson
      },
    },
  })

  // Check for achievements
  await checkForAchievements(user.id)

  revalidatePath(`/learning/${lesson.moduleId}/${lessonId}`)
  revalidatePath(`/learning/${lesson.moduleId}`)
  revalidatePath(`/learning`)
  revalidatePath(`/dashboard`)

  return progress
}

export async function updateLessonProgress(lessonId: number, position: number) {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not authenticated")

  // Update or create the lesson progress
  const progress = await prisma.userLessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId,
      },
    },
    update: {
      lastPosition: position,
      updatedAt: new Date(),
    },
    create: {
      userId: user.id,
      lessonId,
      lastPosition: position,
    },
  })

  return progress
}

async function updateModuleProgress(userId: number, moduleId: number) {
  // Get all lessons for this module
  const lessons = await prisma.lesson.findMany({
    where: {
      moduleId,
    },
    select: {
      id: true,
    },
  })

  const lessonIds = lessons.map((lesson) => lesson.id)

  // Get user progress for these lessons
  const progress = await prisma.userLessonProgress.findMany({
    where: {
      userId,
      lessonId: {
        in: lessonIds,
      },
      isCompleted: true,
    },
  })

  // Calculate progress percentage
  const totalLessons = lessonIds.length
  const completedLessons = progress.length
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  // Update or create the module progress
  await prisma.userProgress.upsert({
    where: {
      userId_moduleId: {
        userId,
        moduleId,
      },
    },
    update: {
      progressPercentage,
      completed: progressPercentage === 100,
      lastAccessed: new Date(),
      updatedAt: new Date(),
    },
    create: {
      userId,
      moduleId,
      progressPercentage,
      completed: progressPercentage === 100,
      lastAccessed: new Date(),
    },
  })

  // If module is completed, award additional XP
  if (progressPercentage === 100) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        xpPoints: {
          increment: 200, // Award 200 XP for completing a module
        },
      },
    })
  }
}

async function checkForAchievements(userId: number) {
  // Count completed lessons
  const completedLessonsCount = await prisma.userLessonProgress.count({
    where: {
      userId,
      isCompleted: true,
    },
  })

  // Count completed modules
  const completedModulesCount = await prisma.userProgress.count({
    where: {
      userId,
      completed: true,
    },
  })

  // Achievement: First Lesson
  if (completedLessonsCount === 1) {
    await awardAchievement(userId, "FIRST_LESSON")
  }

  // Achievement: 5 Lessons
  if (completedLessonsCount === 5) {
    await awardAchievement(userId, "FIVE_LESSONS")
  }

  // Achievement: First Module
  if (completedModulesCount === 1) {
    await awardAchievement(userId, "FIRST_MODULE")
  }
}

async function awardAchievement(userId: number, achievementCode: string) {
  // Find the achievement
  const achievement = await prisma.achievement.findFirst({
    where: {
      name: {
        contains: achievementCode,
      },
    },
  })

  if (!achievement) return

  // Check if user already has this achievement
  const existingAchievement = await prisma.userAchievement.findFirst({
    where: {
      userId,
      achievementId: achievement.id,
    },
  })

  if (existingAchievement) return

  // Award the achievement
  await prisma.userAchievement.create({
    data: {
      userId,
      achievementId: achievement.id,
      earnedAt: new Date(),
    },
  })

  // Award XP for the achievement
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      xpPoints: {
        increment: achievement.xpReward,
      },
    },
  })
}

export async function getAllUserProgress() {
  const user = await getCurrentUser()
  if (!user) return []

  const progress = await prisma.userProgress.findMany({
    where: {
      userId: user.id,
    },
    include: {
      module: true,
    },
  })

  return progress
}

"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

// For demo purposes, we'll use the current user's ID
export async function getDashboardStats() {
  const user = await getCurrentUser()
  if (!user) {
    return {
      progressPercentage: 0,
      xpPoints: 0,
      level: 1,
      loginStreak: 0,
      achievementCount: 0,
      newAchievements: 0,
    }
  }

  // Get all modules
  const moduleCount = await prisma.learningModule.count()

  // Get completed modules for this user
  const completedModules = await prisma.userProgress.count({
    where: {
      userId: user.id,
      completed: true,
    },
  })

  // Calculate progress percentage
  const progressPercentage = moduleCount > 0 ? Math.round((completedModules / moduleCount) * 100) : 0

  // Get achievement count
  const achievementCount = await prisma.userAchievement.count({
    where: {
      userId: user.id,
    },
  })

  // Get new achievements in the last 30 days
  const newAchievements = await prisma.userAchievement.count({
    where: {
      userId: user.id,
      earnedAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  })

  // Calculate level based on XP (1000 XP per level)
  const level = user.xpPoints ? Math.floor(user.xpPoints / 1000) + 1 : 1

  return {
    progressPercentage,
    xpPoints: user.xpPoints || 0,
    level,
    loginStreak: user.loginStreak || 0,
    achievementCount,
    newAchievements,
  }
}

export async function getLearningProgress() {
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

  // If no progress, return empty array
  if (progress.length === 0) return []

  return progress.map((item) => ({
    name: item.module.language,
    progress: item.progressPercentage,
  }))
}

export async function getAchievements() {
  const user = await getCurrentUser()
  if (!user) return []

  const achievements = await prisma.userAchievement.findMany({
    where: {
      userId: user.id,
    },
    include: {
      achievement: true,
    },
    orderBy: {
      earnedAt: "desc",
    },
    take: 4,
  })

  // If no achievements, return empty array
  if (achievements.length === 0) return []

  return achievements.map((item) => ({
    id: item.achievement.id,
    name: item.achievement.name,
    description: item.achievement.description || "",
    icon: item.achievement.iconName || "Award",
    date: formatTimeAgo(item.earnedAt),
  }))
}

export async function getRecentGames() {
  const user = await getCurrentUser()
  if (!user) return []

  const games = await prisma.gameScore.findMany({
    where: {
      userId: user.id,
    },
    include: {
      game: true,
    },
    orderBy: {
      playedAt: "desc",
    },
    take: 4,
  })

  // If no games, return empty array
  if (games.length === 0) return []

  return games.map((item) => ({
    id: item.game.id,
    name: item.game.name,
    score: item.score,
    date: formatTimeAgo(item.playedAt),
    icon: item.game.iconName || "Gamepad",
  }))
}

export async function getSavedProjects() {
  const user = await getCurrentUser()
  if (!user) return []

  const projects = await prisma.project.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 4,
  })

  // If no projects, return empty array
  if (projects.length === 0) return []

  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    language: project.language,
    lastEdited: formatTimeAgo(project.updatedAt),
    status: project.status,
  }))
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 172800) return "Yesterday"
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`

  return `${Math.floor(diffInSeconds / 2592000)} months ago`
}

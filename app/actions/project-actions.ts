"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getUserProjects() {
  const user = await getCurrentUser()
  if (!user) return []

  const projects = await prisma.project.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  return projects
}

export async function getProjectById(id: number) {
  const user = await getCurrentUser()
  if (!user) return null

  const project = await prisma.project.findUnique({
    where: {
      id,
      userId: user.id,
    },
  })

  return project
}

export async function createProject(data: {
  name: string
  language: string
  description?: string
  codeContent: string
}) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  const project = await prisma.project.create({
    data: {
      ...data,
      userId: user.id,
    },
  })

  revalidatePath("/ide")
  return project
}

export async function updateProject(
  id: number,
  data: {
    name?: string
    description?: string
    codeContent?: string
    language?: string
    status?: string
  },
) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  const project = await prisma.project.update({
    where: {
      id,
      userId: user.id,
    },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  })

  revalidatePath("/ide")
  return project
}

export async function deleteProject(id: number) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  await prisma.project.delete({
    where: {
      id,
      userId: user.id,
    },
  })

  revalidatePath("/ide")
  return { success: true }
}

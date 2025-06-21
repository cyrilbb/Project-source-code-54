"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function getUserProfile() {
  const user = await getCurrentUser()
  if (!user) return null

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName || user.username,
    avatarUrl: user.avatarUrl,
  }
}

const profileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters").max(50),
  avatarUrl: z.string().optional(),
})

export async function updateProfile(prevState, formData) {
  const user = await getCurrentUser()
  if (!user) {
    return {
      success: false,
      message: "You must be logged in to update your profile",
    }
  }

  try {
    const validatedFields = profileSchema.safeParse({
      displayName: formData.get("displayName"),
      avatarUrl: formData.get("avatarUrl") || user.avatarUrl,
    })

    if (!validatedFields.success) {
      return {
        success: false,
        message: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { displayName, avatarUrl } = validatedFields.data

    await prisma.user.update({
      where: { id: user.id },
      data: {
        displayName,
        avatarUrl,
      },
    })

    revalidatePath("/profile")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Profile updated successfully",
    }
  } catch (error) {
    console.error("Error updating profile:", error)
    return {
      success: false,
      message: "An error occurred while updating your profile",
    }
  }
}

"use server"

import { prisma } from "@/lib/prisma"
import { hashPassword, comparePasswords, createSession, updateLoginStreak } from "@/lib/auth"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

// Validation schemas
const registerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

export async function register(prevState, formData) {
  try {
    // Validate form data
    const validatedFields = registerSchema.safeParse({
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    })

    if (!validatedFields.success) {
      return {
        success: false,
        message: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { username, email, password } = validatedFields.data

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    })

    if (existingUser) {
      return {
        success: false,
        message: {
          email: existingUser.email === email ? ["Email already in use"] : [],
          username: existingUser.username === username ? ["Username already taken"] : [],
        },
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
        displayName: username,
      },
    })

    // Create session
    await createSession(user.id)

    // Update login streak
    await updateLoginStreak(user.id)

    // Return success
    return {
      success: true,
      message: "Registration successful!",
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      message: { _form: ["An unexpected error occurred. Please try again."] },
    }
  }
}

export async function login(prevState, formData) {
  try {
    // Validate form data
    const validatedFields = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    })

    if (!validatedFields.success) {
      return {
        success: false,
        message: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { email, password } = validatedFields.data

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return {
        success: false,
        message: { _form: ["Invalid email or password"] },
      }
    }

    // Verify password
    const passwordMatch = await comparePasswords(password, user.passwordHash)

    if (!passwordMatch) {
      return {
        success: false,
        message: { _form: ["Invalid email or password"] },
      }
    }

    // Create session
    await createSession(user.id)

    // Update login streak
    await updateLoginStreak(user.id)

    // Return success
    return {
      success: true,
      message: "Login successful!",
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      message: { _form: ["An unexpected error occurred. Please try again."] },
    }
  }
}

export async function logout() {
  "use server"

  const sessionToken = cookies().get("session_token")?.value

  if (sessionToken) {
    // Delete the session from the database
    await prisma.session
      .delete({
        where: {
          sessionToken,
        },
      })
      .catch(() => {
        // Ignore errors if session doesn't exist
      })

    // Delete the session cookie
    cookies().delete("session_token")
  }

  redirect("/login")
}

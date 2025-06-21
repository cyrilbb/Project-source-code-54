"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useFormState, useFormStatus } from "react-dom"
import { register } from "@/app/actions/auth-actions"
import { Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

function RegisterButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating account..." : "Create account"}
    </Button>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [state, formAction] = useFormState(register, null)

  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard")
      router.refresh()
    }
  }, [state, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
              <Code className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">CodEd</span>
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>Enter your information to create an account</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              {state?.message?._form && (
                <Alert variant="destructive">
                  <AlertDescription>{state.message._form}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" placeholder="johndoe" required autoComplete="username" />
                {state?.message?.username && <p className="text-sm text-destructive">{state.message.username[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  required
                  autoComplete="email"
                />
                {state?.message?.email && <p className="text-sm text-destructive">{state.message.email[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required autoComplete="new-password" />
                {state?.message?.password && <p className="text-sm text-destructive">{state.message.password[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                />
                {state?.message?.confirmPassword && (
                  <p className="text-sm text-destructive">{state.message.confirmPassword[0]}</p>
                )}
              </div>

              <RegisterButton />
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

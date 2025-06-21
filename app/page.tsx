import Link from "next/link"
import { Code, Gamepad2, Laptop, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Code className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">CodEd</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm font-medium hover:text-primary">
                Features
              </Link>
              <Link href="#about" className="text-sm font-medium hover:text-primary">
                About
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Learn to code interactively
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            Master programming through hands-on practice, interactive games, and a built-in code editor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Log in to your account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Laptop className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Interactive IDE</h3>
              <p className="text-muted-foreground">
                Write, test, and debug your code in our built-in development environment with support for multiple
                programming languages.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Gamepad2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Coding Games</h3>
              <p className="text-muted-foreground">
                Reinforce your skills through fun, interactive coding games designed to challenge and engage.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Achievement System</h3>
              <p className="text-muted-foreground">
                Track your progress, earn badges, and build your coding portfolio as you complete challenges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="about" className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose CodEd?</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold">Learn by Doing</h3>
                <p className="text-muted-foreground">
                  Our platform emphasizes practical, hands-on coding experience rather than passive learning.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold">Gamified Experience</h3>
                <p className="text-muted-foreground">
                  Earn points, unlock achievements, and track your progress to stay motivated.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold">Comprehensive Tools</h3>
                <p className="text-muted-foreground">
                  Everything you need to learn coding in one place - no need to switch between different platforms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to start your coding journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of learners who are building their coding skills with CodEd.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register">Create your free account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <Code className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">CodEd</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CodEd. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

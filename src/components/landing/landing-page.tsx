import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  ChevronDown,
  Download,
  GitBranch,
  Globe,
  Heart,
  MessageCircle,
  Play,
  Settings,
  Star,
  Wand2,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/assets/img/clio.png";
import { GithubLoginButton } from "@/components/auth/github-login-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <nav className="border-slate-800/50 border-b bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image src={Logo} alt="Clio Logo" width={32} height={32} className="h-8 w-8" />
              <span className="font-bold text-slate-50 text-xl">Clio</span>
            </div>
            <div className="hidden items-center space-x-8 md:flex">
              <Link href="#home" className="text-slate-400 transition-colors hover:text-slate-50">
                Home
              </Link>
              <div className="group relative">
                <button
                  type="button"
                  className="flex items-center space-x-1 text-slate-400 transition-colors hover:text-slate-50"
                >
                  <span>Features</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              <Link href="#pricing" className="text-slate-400 transition-colors hover:text-slate-50">
                Pricing
              </Link>
              <Link href="#blog" className="text-slate-400 transition-colors hover:text-slate-50">
                Blog
              </Link>
              <Link href="#contact" className="text-slate-400 transition-colors hover:text-slate-50">
                Contact
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <GithubLoginButton className="bg-slate-50 text-slate-950 shadow-lg shadow-slate-50/20 hover:bg-slate-200">
                Get Started
              </GithubLoginButton>
            </div>
          </div>
        </div>
      </nav>

      <section id="home" className="relative overflow-hidden py-20 sm:py-32">
        <div className="-z-10 absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-center bg-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center space-x-2">
              <Badge
                variant="secondary"
                className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground"
              >
                New
              </Badge>
              <span className="text-slate-400 text-sm">Introducing AI-Powered README Generation</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </div>

            <h1 className="mb-6 font-bold text-4xl text-slate-50 tracking-tight sm:text-6xl lg:text-7xl">
              Stop Writing&nbsp;
              <span className="bg-gradient-to-r from-primary-foreground to-accent bg-clip-text text-transparent">
                READMEs
              </span>
              &nbsp; Like It's 2010
            </h1>

            <p className="mx-auto mb-10 max-w-3xl text-lg text-slate-400 leading-8">
              Let AI do the heavy lifting while you focus on what matters: building amazing software. Generate
              professional READMEs that actually make sense to humans.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <GithubLoginButton className="bg-primary-foreground px-8 py-4 text-lg text-slate-950 shadow-lg shadow-primary-foreground/25 transition-all duration-300 hover:bg-primary-foreground/90 hover:shadow-primary-foreground/40">
                Generate My First README
                <ArrowRight className="ml-2 h-5 w-5" />
              </GithubLoginButton>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-600 px-8 py-4 text-lg text-slate-300 transition-all duration-300 hover:border-slate-500 hover:bg-slate-800 hover:text-slate-50"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-slate-800/50 border-b py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="mb-8 text-lg text-slate-400">Trusted by 10,000+ developers who actually ship code</p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
              {["GitHub", "Vercel", "Figma", "Webflow", "Stripe", "Linear", "Notion"].map((company) => (
                <div key={company} className="font-semibold text-2xl text-slate-500">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-3xl text-slate-50 tracking-tight sm:text-4xl">
              Why Developers Love Clio
            </h2>
            <p className="text-lg text-slate-400">Because your time is worth more than writing documentation</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="group relative overflow-hidden border-slate-700/50 bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:border-primary-foreground/30">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-foreground/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardContent className="relative z-10 p-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/10 transition-colors duration-300 group-hover:bg-primary-foreground/20">
                  <BarChart3 className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="mb-4 font-semibold text-slate-50 text-xl">AI That Actually Gets It</h3>
                <p className="mb-6 text-slate-400 leading-relaxed">
                  Our AI doesn't just copy-paste templates. It reads your code, understands your architecture, and
                  writes documentation that makes sense to other developers.
                </p>

                <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-slate-300 text-sm">Code Analysis</span>
                    <span className="text-primary-foreground text-xs">98% Accurate</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-700">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-primary-foreground to-primary-foreground/80"
                      style={{ width: "98%" }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-slate-700/50 bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/30">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardContent className="relative z-10 p-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10 transition-colors duration-300 group-hover:bg-cyan-500/20">
                  <Zap className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="mb-4 font-semibold text-slate-50 text-xl">Faster Than Your Coffee Break</h3>
                <p className="mb-6 text-slate-400 leading-relaxed">
                  Generate comprehensive READMEs in under 30 seconds. That's faster than most developers can write a
                  single paragraph.
                </p>

                <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                      <span className="text-slate-300 text-sm">Analyzing codebase...</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className="h-2 w-2 animate-pulse rounded-full bg-cyan-400"
                        style={{ animationDelay: "0.5s" }}
                      />
                      <span className="text-slate-300 text-sm">Generating content...</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className="h-2 w-2 animate-pulse rounded-full bg-cyan-400"
                        style={{ animationDelay: "1s" }}
                      />
                      <span className="text-slate-300 text-sm">Finalizing README...</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-slate-700/50 bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/30">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardContent className="relative z-10 p-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 transition-colors duration-300 group-hover:bg-purple-500/20">
                  <Heart className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="mb-4 font-semibold text-slate-50 text-xl">Built by Developers, For Developers</h3>
                <p className="mb-6 text-slate-400 leading-relaxed">
                  We're developers too. We know the pain of writing documentation. That's why we built something that
                  actually works.
                </p>

                <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl">⭐</div>
                      <div className="text-slate-400 text-xs">4.9/5</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl">❤️</div>
                      <div className="text-slate-400 text-xs">10k+</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl">🚀</div>
                      <div className="text-slate-400 text-xs">Fast</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-slate-800/50 border-y bg-slate-900/30 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-3xl text-slate-50 tracking-tight sm:text-4xl">How It Works</h2>
            <p className="text-lg text-slate-400">Four simple steps to documentation nirvana</p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="flex items-start space-x-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-primary-foreground to-primary-foreground/90 font-bold text-lg text-slate-950 shadow-lg shadow-primary-foreground/25">
                1
              </div>
              <div className="flex-1">
                <h3 className="mb-2 font-semibold text-slate-50 text-xl">Connect Your GitHub</h3>
                <p className="mb-4 text-slate-400 leading-relaxed">
                  Sign in with GitHub (we promise we're not sketchy). Install our app and we'll securely access your
                  repositories.
                </p>
                <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
                  <div className="flex items-center space-x-2">
                    <GitBranch className="h-5 w-5 text-primary-foreground" />
                    <span className="font-medium text-slate-300 text-sm">Secure GitHub Integration</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 font-bold text-lg text-slate-950 shadow-cyan-500/25 shadow-lg">
                2
              </div>
              <div className="flex-1">
                <h3 className="mb-2 font-semibold text-slate-50 text-xl">Pick Your Poison</h3>
                <p className="mb-4 text-slate-400 leading-relaxed">
                  Choose any repository from your GitHub account. Customize generation options to match your style (or
                  lack thereof).
                </p>
                <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-cyan-400" />
                    <span className="font-medium text-slate-300 text-sm">Customizable Settings</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-purple-400 font-bold text-lg text-slate-950 shadow-lg shadow-purple-500/25">
                3
              </div>
              <div className="flex-1">
                <h3 className="mb-2 font-semibold text-slate-50 text-xl">AI Does Its Magic</h3>
                <p className="mb-4 text-slate-400 leading-relaxed">
                  Our AI analyzes your code and creates a comprehensive, professional README that doesn't suck.
                </p>
                <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
                  <div className="flex items-center space-x-2">
                    <Wand2 className="h-5 w-5 text-purple-400" />
                    <span className="font-medium text-slate-300 text-sm">AI-Powered Generation</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-400 font-bold text-lg text-slate-950 shadow-lg shadow-orange-500/25">
                4
              </div>
              <div className="flex-1">
                <h3 className="mb-2 font-semibold text-slate-50 text-xl">Deploy & Impress</h3>
                <p className="mb-4 text-slate-400 leading-relaxed">
                  Download your README or copy it directly to your repository. Watch your GitHub stars multiply.
                </p>
                <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
                  <div className="flex items-center space-x-2">
                    <Download className="h-5 w-5 text-orange-400" />
                    <span className="font-medium text-slate-300 text-sm">Instant Download</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-3xl text-slate-50 tracking-tight sm:text-4xl">
              Simple Pricing That Doesn't Suck
            </h2>
            <p className="text-lg text-slate-400">
              Pay only for what you use. No subscriptions, no hidden fees, no BS.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="relative border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="mb-2 font-semibold text-2xl text-slate-50">Starter</h3>
                  <div className="mb-6">
                    <span className="font-bold text-4xl text-slate-50">$0</span>
                    <span className="text-slate-400">/generation</span>
                  </div>
                  <ul className="space-y-4 text-left">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary-foreground" />
                      <span className="text-slate-400">1 free README generation</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary-foreground" />
                      <span className="text-slate-400">Basic AI analysis</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary-foreground" />
                      <span className="text-slate-400">Standard templates</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary-foreground" />
                      <span className="text-slate-400">Email support</span>
                    </li>
                  </ul>
                  <Button
                    className="mt-8 w-full border-slate-600 text-slate-300 transition-all duration-300 hover:border-slate-500 hover:bg-slate-800 hover:text-slate-50"
                    variant="outline"
                  >
                    Try It Free
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="relative border-primary-foreground/50 bg-slate-900/50 ring-1 ring-primary-foreground/20 backdrop-blur-sm">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute top-0 left-1/2">
                <Badge className="bg-primary-foreground text-slate-950">Most Popular</Badge>
              </div>
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="mb-2 font-semibold text-2xl text-slate-50">Pro</h3>
                  <div className="mb-6">
                    <span className="font-bold text-4xl text-slate-50">$5</span>
                    <span className="text-slate-400">/generation</span>
                  </div>
                  <ul className="space-y-4 text-left">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary-foreground" />
                      <span className="text-slate-400">Unlimited generations</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary-foreground" />
                      <span className="text-slate-400">Advanced AI analysis</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary-foreground" />
                      <span className="text-slate-400">Custom templates</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary-foreground" />
                      <span className="text-slate-400">Priority support</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary-foreground" />
                      <span className="text-slate-400">Bulk generation</span>
                    </li>
                  </ul>
                  <Button className="mt-8 w-full bg-primary-foreground text-slate-950 shadow-lg shadow-primary-foreground/25 transition-all duration-300 hover:bg-primary-foreground/90 hover:shadow-primary-foreground/40">
                    Start Generating
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="relative border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="mb-2 font-semibold text-2xl text-slate-50">Enterprise</h3>
                  <div className="mb-6">
                    <span className="font-bold text-4xl text-slate-50">Custom</span>
                  </div>
                  <ul className="space-y-4 text-left">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary-foreground" />
                      <span className="text-slate-400">Everything in Pro</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary-foreground" />
                      <span className="text-slate-400">Custom integrations</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary-foreground" />
                      <span className="text-slate-400">Dedicated support</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary-foreground" />
                      <span className="text-slate-400">SLA guarantee</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary-foreground" />
                      <span className="text-slate-400">Volume discounts</span>
                    </li>
                  </ul>
                  <Button
                    className="mt-8 w-full border-slate-600 text-slate-300 transition-all duration-300 hover:border-slate-500 hover:bg-slate-800 hover:text-slate-50"
                    variant="outline"
                  >
                    Contact Sales
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-slate-800/50 border-y bg-slate-900/30 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-3xl text-slate-50 tracking-tight sm:text-4xl">
              What Developers Are Saying
            </h2>
            <p className="text-lg text-slate-400">Real feedback from real developers (not fake testimonials)</p>
          </div>

          <Card className="mx-auto max-w-4xl border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="mb-6 flex justify-center">
                <Star className="h-6 w-6 fill-current text-yellow-400" />
                <Star className="h-6 w-6 fill-current text-yellow-400" />
                <Star className="h-6 w-6 fill-current text-yellow-400" />
                <Star className="h-6 w-6 fill-current text-yellow-400" />
                <Star className="h-6 w-6 fill-current text-yellow-400" />
              </div>
              <blockquote className="mb-6 text-lg text-slate-400 leading-relaxed">
                "Finally, a tool that doesn't make me want to throw my laptop out the window. Clio actually understands
                my code and writes documentation that makes sense. My READMEs went from 'placeholder text' to 'holy
                shit, this is actually helpful'."
              </blockquote>
              <div className="flex items-center justify-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-primary-foreground to-primary-foreground/90">
                  <span className="font-semibold text-slate-950">SJ</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-50">Sarah Johnson</div>
                  <div className="text-slate-400 text-sm">Senior Developer at TechCorp</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-3xl text-slate-50 tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-slate-400">Everything you need to know about Clio (and some things you don't)</p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "What is Clio?",
                answer:
                  "Clio is an AI-powered README generator that actually understands your code. Unlike other tools that just copy-paste templates, Clio analyzes your repository structure, dependencies, and code patterns to create documentation that makes sense to other developers.",
              },
              {
                question: "How does Clio work?",
                answer:
                  "We connect to your GitHub account through a secure GitHub App, analyze your repository structure and code, then use advanced AI to generate a tailored README that matches your project's needs. No code is stored on our servers - everything happens in real-time.",
              },
              {
                question: "Is my code secure?",
                answer:
                  "Absolutely. We use GitHub's secure OAuth integration and never store your source code. All analysis happens in real-time, and we only generate documentation based on your repository's public information. Your code stays where it belongs - on GitHub.",
              },
              {
                question: "What types of projects work best?",
                answer:
                  "Clio works great with any programming language and project type - from simple scripts to complex applications. It analyzes package.json, requirements.txt, Cargo.toml, and other dependency files to understand your project structure and generate appropriate documentation.",
              },
              {
                question: "Can I customize the generated README?",
                answer:
                  "Yes! You can choose from multiple styles (professional, casual, minimal, detailed), add custom prompts, include or exclude specific sections, and even add your own branding elements. The AI will adapt to your preferences.",
              },
            ].map((faq) => (
              <Card key={faq.question} className="border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="mb-3 font-semibold text-lg text-slate-50">{faq.question}</h3>
                  <p className="text-slate-400 leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary-foreground to-accent py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="mb-4 font-bold text-3xl text-slate-950 tracking-tight sm:text-4xl">
              Ready to Stop Writing Terrible READMEs?
            </h2>
            <p className="mb-10 text-lg text-slate-900/90">
              Join thousands of developers who have already improved their documentation with Clio.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <GithubLoginButton className="bg-slate-950 px-8 py-4 text-lg text-slate-50 shadow-lg shadow-slate-950/25 transition-all duration-300 hover:bg-slate-800 hover:shadow-slate-950/40">
                Generate My First README
                <ArrowRight className="ml-2 h-5 w-5" />
              </GithubLoginButton>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-950 px-8 py-4 text-lg text-slate-950 transition-all duration-300 hover:bg-slate-950/10 hover:text-slate-950"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-slate-800/50 border-t bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <div className="mb-4 flex items-center space-x-2">
                <Image src={Logo} alt="Clio Logo" width={32} height={32} className="h-8 w-8" />
                <span className="font-bold text-slate-50 text-xl">Clio</span>
              </div>
              <p className="mb-6 max-w-md text-slate-400">
                The AI-powered README generator that transforms your GitHub repositories with professional
                documentation. Built for developers, by developers.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-50">
                  <Globe className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-50">
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-50">
                  <GitBranch className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-50">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-lg text-slate-50">Product</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="#features" className="transition-colors hover:text-slate-50">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="transition-colors hover:text-slate-50">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#docs" className="transition-colors hover:text-slate-50">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#api" className="transition-colors hover:text-slate-50">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-lg text-slate-50">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="#about" className="transition-colors hover:text-slate-50">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#blog" className="transition-colors hover:text-slate-50">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#careers" className="transition-colors hover:text-slate-50">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="transition-colors hover:text-slate-50">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between border-slate-800/50 border-t pt-8 sm:flex-row">
            <p className="text-slate-400 text-sm">© 2024 Clio. All rights reserved.</p>
            <div className="mt-4 flex space-x-6 sm:mt-0">
              <Link href="#privacy" className="text-slate-400 text-sm transition-colors hover:text-slate-50">
                Privacy Policy
              </Link>
              <Link href="#terms" className="text-slate-400 text-sm transition-colors hover:text-slate-50">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

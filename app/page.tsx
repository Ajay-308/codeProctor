"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  Code,
  Monitor,
  Play,
  Users,
  Video,
  X,
  Menu,
  ExternalLink,
} from "lucide-react";
import { FaLinkedinIn, FaTwitter } from "react-icons/fa";
import { IoIosMail } from "react-icons/io";

import { SignInButton } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import homePhoto from "@/app/assest/home.png";
import FAQSection from "@/components/FaqSection";
import toast from "react-hot-toast";

export default function LandingPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const syncUser = useMutation(api.users.syncUser);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubscribe = async () => {
    if (!email) {
      toast.error("enter your email to subscribe");
      return;
    }
    toast.success("subscribed successfully");
    setEmail("");
  };

  useEffect(() => {
    if (!isLoaded || !userId || !user) return;
    if (isLoaded && userId) {
      const checkUser = async () => {
        const res = await syncUser({
          name: user.fullName!,
          email: user.emailAddresses[0].emailAddress,
          image: user.imageUrl,
          clerkId: user.id,
        });

        if (!res.exists) {
          router.push("/selectRole");
        } else if (!res.hasRole) {
          router.push("/selectRole");
        } else {
          router.push("/home");
        }
      };

      checkUser();
    }
  }, [isLoaded, userId, user, syncUser, router]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-2">
            <Code className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">CodeProctor</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 lg:gap-20">
            <Link
              href="/docs"
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              Docs
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>

          <div className="hidden md:flex items-center -mr-20">
            <SignInButton mode="modal">
              <Button className="cursor-pointer" variant="outline">
                Log In
              </Button>
            </SignInButton>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 px-4 bg-background animate-in slide-in-from-top">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/docs"
                className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
              >
                Docs
              </Link>
              <div className="pt-2 border-t">
                <SignInButton mode="modal">
                  <Button className="cursor-pointer w-full" variant="outline">
                    Log In
                  </Button>
                </SignInButton>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 ">
        {/* Hero Section */}
        <section className="py-12 md:py-20 lg:py-28 xl:ml-14 sm:ml-0 md:ml-0 lg:ml-0 ">
          <div className="container px-4 sm:px-6 md:px-8">
            <div className="grid gap-8 md:gap-12 lg:grid-cols-[1fr_600px] xl:grid-cols-[1fr_700px]">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-6xl/none">
                    Revolutionize Your Technical Interviews
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground text-lg md:text-xl">
                    The all-in-one platform that combines live video proctoring
                    with a powerful coding environment for seamless technical
                    assessments.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <SignInButton mode="modal">
                    <Button
                      size="lg"
                      className="px-8 cursor-pointer w-full sm:w-auto"
                    >
                      Get Started Free
                    </Button>
                  </SignInButton>
                  <Link
                    href="https://youtu.be/-_9ug7Vl2jg"
                    className="w-full sm:w-auto"
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-8 cursor-pointer w-full"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Watch Demo
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground">
                  No credit card required. Start interviewing in minutes.
                </p>
              </div>
              <div className="relative flex items-center justify-center mt-8 lg:mt-0 ml-6">
                <div className="relative w-full overflow-hidden rounded-lg border bg-background shadow-xl">
                  <div className="absolute right-2 top-2 z-10 flex gap-1">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                  <Image
                    src={homePhoto || "/placeholder.svg"}
                    width={800}
                    height={600}
                    alt="CodeProctor platform screenshot showing split-screen with video and code editor"
                    className="aspect-[4/3] object-cover"
                    priority
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 h-16 w-16 sm:h-24 sm:w-24 rounded-lg border bg-background p-2 shadow-lg hidden sm:block">
                  <div className="h-full w-full rounded bg-muted flex items-center justify-center">
                    <Video className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 h-16 w-16 sm:h-24 sm:w-24 rounded-lg border bg-background p-2 shadow-lg hidden sm:block">
                  <div className="h-full w-full rounded bg-muted flex items-center justify-center">
                    <Code className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-20 ">
          <div className="container px-12 sm:px-6 md:px-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Everything you need for technical interviews
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                  Our platform combines powerful features to make your technical
                  interviews more efficient, secure, and insightful.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-20  py-12 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <Monitor className="h-10 w-10 text-primary" />,
                  title: "Split-Screen Interface",
                  description:
                    "Seamlessly view code and video side by side for a complete interview experience.",
                },
                {
                  icon: <Video className="h-10 w-10 text-primary" />,
                  title: "Live Video Proctoring",
                  description:
                    "Ensure interview integrity with real-time video monitoring and recording.",
                },
                {
                  icon: <Code className="h-10 w-10 text-primary" />,
                  title: "Advanced Code Editor",
                  description:
                    "Full-featured code editor with syntax highlighting and multiple language support.",
                },
                {
                  icon: <CheckCircle className="h-10 w-10 text-primary" />,
                  title: "Automated Assessment",
                  description:
                    "Instantly evaluate code submissions with our powerful testing engine.",
                },
                {
                  icon: <Users className="h-10 w-10 text-primary" />,
                  title: "Collaborative Interviews",
                  description:
                    "Multiple interviewers can join sessions and provide feedback in real-time.",
                },
                {
                  icon: <Play className="h-10 w-10 text-primary" />,
                  title: "Playback & Analysis",
                  description:
                    "Review interviews with synchronized code and video playback for deeper insights.",
                },
              ].map((feature, i) => (
                <Card key={i} className="overflow-hidden border-none shadow-lg">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      {feature.icon}
                    </div>
                    <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="border-t py-16 md:py-20 bg-muted/30"
        >
          <div className="container px-4 sm:px-6 md:px-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  Simple Process
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  How CodeProctor Works
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                  Our platform makes technical interviews easy for both
                  interviewers and candidates.
                </p>
              </div>
            </div>

            <div className="mt-12 md:mt-16 grid gap-8 md:gap-12 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Create Assessment",
                  description:
                    "Build custom coding challenges or choose from our library of pre-made questions across multiple programming languages.",
                },
                {
                  step: "02",
                  title: "Invite Candidates",
                  description:
                    "Send automated invitations to candidates with all the details they need to join the interview session.",
                },
                {
                  step: "03",
                  title: "Evaluate Performance",
                  description:
                    "Review code submissions, watch interview recordings, and make data-driven hiring decisions.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="absolute -top-10 text-5xl sm:text-6xl font-bold text-primary/10">
                    {item.step}
                  </div>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {i + 1}
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                  {i < 2 && (
                    <div className="absolute right-0 top-8 hidden h-0.5 w-full translate-x-1/2 bg-primary/20 md:block"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Screenshot Section */}
        <section
          id="demo"
          className="py-16 md:py-20 xl:ml-14 sm:ml-0 md:ml-0 lg:ml-0 "
        >
          <div className="container px-4 sm:px-6 md:px-8">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                    Platform Preview
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                    See the platform in action
                  </h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                    Our intuitive interface makes it easy to conduct technical
                    interviews with confidence. The split-screen design allows
                    you to focus on both the candidate and their code
                    simultaneously.
                  </p>
                </div>
                <ul className="grid gap-2">
                  {[
                    "Real-time code execution and testing",
                    "Multiple programming language support",
                    "Secure and reliable video streaming",
                    "Customizable interview templates",
                    "Detailed performance analytics",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div>
                  <SignInButton mode="modal">
                    <Button
                      size="lg"
                      className="mt-4 cursor-pointer w-full sm:w-auto"
                    >
                      Try It Free
                    </Button>
                  </SignInButton>
                </div>
              </div>
              <div className="relative flex items-center justify-center rounded-lg border bg-background p-2 shadow-xl mt-8 lg:mt-0">
                <Image
                  src={homePhoto || "/placeholder.svg"}
                  width={800}
                  height={600}
                  alt="CodeProctor interface showing code editor and video"
                  className="rounded aspect-video object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-primary/90 p-3 sm:p-4 shadow-lg">
                    <Play
                      className="h-6 w-6 sm:h-8 sm:w-8 text-white"
                      fill="white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t  py-16 md:py-20 bg-primary text-primary-foreground">
          <div className="container px-4 sm:px-6 md:px-8">
            <div className="flex flex-col items-center xl:ml-18 justify-center space-y-6 text-center">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Ready to transform your technical interviews?
                </h2>
                <p className="mx-auto max-w-[700px] md:text-xl/relaxed opacity-90">
                  Join thousands of companies that trust CodeProctor for their
                  technical hiring needs.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <SignInButton mode="modal">
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 cursor-pointer w-full sm:w-auto"
                  >
                    Get Started Free
                  </Button>
                </SignInButton>

                <Link href="tel:+91-9891724379" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-primary hover:bg-white/10 cursor-pointer w-full"
                  >
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-20">
          <FAQSection />
        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t bg-gradient-to-br from-slate-50 via-white to-slate-50/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950/80">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid gap-8 sm:gap-10 lg:gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-12">
            {/* Logo and description - Takes more space on larger screens */}
            <div className="space-y-4 sm:space-y-6 lg:col-span-5 xl:col-span-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
                  <Code className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
                    CodeProctor
                  </span>
                  <span className="text-xs text-muted-foreground/80 font-medium tracking-wide">
                    TECHNICAL INTERVIEWS
                  </span>
                </div>
              </div>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md">
                The all-in-one platform for technical interviews combining live
                video proctoring with a powerful coding environment.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground/80">
                  Follow us:
                </span>
                <div className="flex gap-2">
                  <a
                    href="https://x.com/ajSingh308"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 hover:scale-105"
                    aria-label="Follow us on Twitter"
                  >
                    <FaTwitter className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  </a>

                  <a
                    href="https://www.linkedin.com/in/ajay308"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 hover:scale-105"
                    aria-label="Connect on LinkedIn"
                  >
                    <FaLinkedinIn className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  </a>

                  <a
                    href="mailto:codeproctor.team@gmail.com"
                    className="group flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 hover:scale-105"
                    aria-label="Send us an email"
                  >
                    <IoIosMail className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  </a>
                </div>
              </div>
            </div>

            {/* Product Links */}
            <div className="space-y-4 sm:space-y-6 lg:col-span-2 xl:col-span-2">
              <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-wide uppercase relative">
                Product
                <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-full" />
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#features"
                    className="group flex items-center text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      Features
                    </span>
                    <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                  </a>
                </li>
                <li>
                  <a
                    href="/docs"
                    className="group flex items-center text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      Documentation
                    </span>
                    <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                  </a>
                </li>
                <li>
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base text-muted-foreground/60">
                      API
                    </span>
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded-full border border-amber-200 dark:border-amber-800/50">
                      Coming Soon
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div className="space-y-4 sm:space-y-6 lg:col-span-2 xl:col-span-2">
              <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-wide uppercase relative">
                Support
                <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-full" />
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#faq"
                    className="group flex items-center text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      FAQ
                    </span>
                    <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                  </a>
                </li>
                <li>
                  <a
                    href="/report-issue"
                    className="group flex items-center text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      Report Bug
                    </span>
                    <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div className="space-y-4 sm:space-y-6 lg:col-span-3 xl:col-span-2">
              <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-wide uppercase relative">
                Company
                <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-full" />
              </h3>
              <ul className="space-y-3">
                <li>
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base text-muted-foreground/60">
                      Blog
                    </span>
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded-full border border-amber-200 dark:border-amber-800/50">
                      Coming Soon
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Newsletter Signup - Only on larger screens */}
            <div className="space-y-4 sm:space-y-6 lg:col-span-12 xl:col-span-2 lg:border-t lg:pt-8 xl:border-t-0 xl:pt-0">
              <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-wide uppercase relative">
                Stay Updated
                <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-full" />
              </h3>
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Get the latest updates and features delivered to your inbox.
                </p>
                <div className="flex flex-col sm:flex-row xl:flex-col gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                  />
                  <Button
                    onClick={handleSubscribe}
                    className="px-4 py-2 text-sm cursor-pointer font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors duration-200 whitespace-nowrap"
                  >
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom section */}
          <div className="border-t border-border/30 mt-8 sm:mt-12 lg:mt-16 pt-6 sm:pt-8 bg-gradient-to-r from-transparent via-muted/20 to-transparent">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-8">
              {/* Left side - Logo and links */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8">
                {/* Mini logo */}
                <div className="flex items-center gap-2 group">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg border border-primary/20 group-hover:border-primary/40 transition-all duration-300">
                    <Code className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="text-sm font-semibold text-foreground/90 group-hover:text-foreground transition-colors duration-300">
                    CodeProctor
                  </span>
                </div>

                {/* Quick links */}
                <div className="flex items-center gap-4 sm:gap-6">
                  <a
                    href="/docs"
                    className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all duration-200"
                  >
                    <div className="flex items-center justify-center w-5 h-5 rounded border border-border/50 bg-background/50 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all duration-200">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      Documentation
                    </span>
                  </a>
                </div>
              </div>

              {/* Right side - Copyright and made with love */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8">
                {/* Copyright */}
                <div className="text-xs sm:text-sm text-muted-foreground/80 text-center sm:text-left">
                  © {new Date().getFullYear()} CodeProctor. All rights
                  reserved.
                </div>

                {/* Made with love */}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground/70">
                  <span>Made with</span>
                  <span className="text-red-500 animate-pulse text-sm">❤️</span>
                  <span>by</span>
                  <a
                    href="https://github.com/ajay308"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground/80 hover:text-primary transition-colors duration-200 underline decoration-dotted underline-offset-2 hover:decoration-solid"
                  >
                    ajay308
                  </a>
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground/60 bg-background/50 px-3 py-1.5 rounded-full border border-border/30">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/50" />
                  <span className="font-medium">All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

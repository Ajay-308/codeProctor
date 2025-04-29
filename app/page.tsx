"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Code, Monitor, Play, Users, Video } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import homePhoto from "@/app/assest/home.png";

export default function LandingPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const syncUser = useMutation(api.users.syncUser);

  useEffect(() => {
    if (!isLoaded || !userId || !user) return;
    if (isLoaded && userId) {
      // Check if the user exists and has a role or not
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
          <div className="flex items-center ml-4 gap-2">
            <Code className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold ">CodeProctor</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm font-medium hover:text-primary"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium hover:text-primary"
            >
              How It Works
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium hover:text-primary"
            >
              Pricing
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium hover:text-primary"
            >
              Testimonials
            </Link>
          </nav>
          <div className="md:hidden">
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
          <div className="flex items-center mt-2 gap-4 cursor-grab">
            <SignInButton mode="modal">
              <Button className="cursor-pointer" variant="outline">
                Log In
              </Button>
            </SignInButton>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28">
          <div className="container px-4 sm:px-6 md:px-8">
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-[1fr_600px] lg:gap-12 xl:grid-cols-[1fr_700px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Revolutionize Your Technical Interviews
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    The all-in-one platform that combines live video proctoring
                    with a powerful coding environment for seamless technical
                    assessments.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <SignInButton mode="modal">
                    <Button size="lg" className="px-8 cursor-pointer">
                      Get Started Free
                    </Button>
                  </SignInButton>
                  <Link href="#demo">
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-8 cursor-pointer"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Watch Demo
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex -space-x-2">
                    <div className="inline-block h-8 w-8 rounded-full bg-gray-100 ring-2 ring-background"></div>
                    <div className="inline-block h-8 w-8 rounded-full bg-gray-200 ring-2 ring-background"></div>
                    <div className="inline-block h-8 w-8 rounded-full bg-gray-300 ring-2 ring-background"></div>
                  </div>
                  <div className="text-muted-foreground">
                    Trusted by{" "}
                    <span className="font-medium text-foreground">2,000+</span>{" "}
                    companies
                  </div>
                </div>
              </div>
              <div className="relative flex items-center justify-center">
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
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-lg border bg-background p-2 shadow-lg">
                  <div className="h-full w-full rounded bg-muted flex items-center justify-center">
                    <Video className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 h-24 w-24 rounded-lg border bg-background p-2 shadow-lg">
                  <div className="h-full w-full rounded bg-muted flex items-center justify-center">
                    <Code className="h-10 w-10 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container px-4 sm:px-6 md:px-8">
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
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
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
        <section id="how-it-works" className="border-t py-20 bg-muted/30">
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

            <div className="mt-16 grid gap-12 md:grid-cols-3">
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
                  <div className="absolute -top-10 text-6xl font-bold text-primary/10">
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
        <section id="demo" className="py-20">
          <div className="container px-4 sm:px-6 md:px-8">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
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
                    <Button size="lg" className="mt-4 cursor-pointer">
                      Try It Free
                    </Button>
                  </SignInButton>
                </div>
              </div>
              <div className="relative flex items-center justify-center rounded-lg border bg-background p-2 shadow-xl">
                <Image
                  src={homePhoto || "/placeholder.svg"}
                  width={800}
                  height={600}
                  alt="CodeProctor interface showing code editor and video"
                  className="rounded aspect-video object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-primary/90 p-4 shadow-lg">
                    <Play className="h-8 w-8 text-white" fill="white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="border-t py-20 bg-muted/30">
          <div className="container px-4 sm:px-6 md:px-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  Testimonials
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Trusted by leading companies
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                  See what our customers have to say about how CodeProctor has
                  transformed their technical interview process.
                </p>
              </div>
            </div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  quote:
                    "CodeProctor has completely transformed our hiring process. We've reduced our time-to-hire by 40% while improving candidate quality.",
                  author: "Sarah Johnson",
                  role: "CTO, TechGrowth",
                },
                {
                  quote:
                    "The combination of video proctoring and code assessment in one platform gives us confidence in our technical evaluations.",
                  author: "Michael Chen",
                  role: "Engineering Manager, DataFlow",
                },
                {
                  quote:
                    "Our candidates love the intuitive interface, and our hiring managers appreciate the comprehensive insights we get from each interview.",
                  author: "Jessica Williams",
                  role: "HR Director, CloudScale",
                },
              ].map((testimonial, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-5 w-5 text-yellow-500"
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-muted-foreground">
                        &quot;{testimonial.quote}&quot;
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-muted"></div>
                        <div>
                          <p className="font-medium">{testimonial.author}</p>
                          <p className="text-sm text-muted-foreground">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20">
          <div className="container px-4 sm:px-6 md:px-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  Pricing
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Simple, transparent pricing
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                  Choose the plan that&#39;s right for your team. All plans
                  include a 14-day free trial.
                </p>
              </div>
            </div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: "Starter",
                  price: "$49",
                  description: "Perfect for small teams and startups",
                  features: [
                    "Up to 5 team members",
                    "20 interviews per month",
                    "Basic video proctoring",
                    "10 pre-built coding challenges",
                    "7-day interview history",
                  ],
                  cta: "Start Free Trial",
                  popular: false,
                },
                {
                  name: "Professional",
                  price: "$99",
                  description: "Ideal for growing engineering teams",
                  features: [
                    "Up to 15 team members",
                    "100 interviews per month",
                    "Advanced video proctoring",
                    "50 pre-built coding challenges",
                    "30-day interview history",
                    "Custom branding",
                    "API access",
                  ],
                  cta: "Start Free Trial",
                  popular: true,
                },
                {
                  name: "Enterprise",
                  price: "Custom",
                  description: "For large organizations with custom needs",
                  features: [
                    "Unlimited team members",
                    "Unlimited interviews",
                    "Premium video proctoring",
                    "Unlimited coding challenges",
                    "90-day interview history",
                    "Custom branding",
                    "API access",
                    "Dedicated support",
                    "SSO integration",
                  ],
                  cta: "Contact Sales",
                  popular: false,
                },
              ].map((plan, i) => (
                <Card
                  key={i}
                  className={`overflow-hidden ${plan.popular ? "border-primary shadow-lg ring-2 ring-primary" : ""}`}
                >
                  <CardContent className="p-6">
                    {plan.popular && (
                      <div className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        Most Popular
                      </div>
                    )}
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.price !== "Custom" && (
                        <span className="text-muted-foreground">/month</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`mt-8 w-full cursor-pointer ${plan.popular ? "" : "variant-outline"}`}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t py-20 bg-primary text-primary-foreground">
          <div className="container px-4 sm:px-6 md:px-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Ready to transform your technical interviews?
                </h2>
                <p className="mx-auto max-w-[700px] md:text-xl/relaxed opacity-90">
                  Join thousands of companies that trust CodeProctor for their
                  technical hiring needs.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/signin">
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 cursor-pointer"
                  >
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 cursor-pointer"
                  >
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container px-4 sm:px-6 md:px-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  FAQ
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Frequently Asked Questions
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                  Find answers to common questions about CodeProctor.
                </p>
              </div>
            </div>

            <div className="mx-auto mt-12 max-w-3xl space-y-4">
              {[
                {
                  question: "How does the video proctoring work?",
                  answer:
                    "Our platform uses secure WebRTC technology to enable real-time video streaming during interviews. Candidates will be prompted to enable their camera when they join the interview session. The video feed is encrypted and can be recorded for later review if needed.",
                },
                {
                  question: "What programming languages are supported?",
                  answer:
                    "CodeProctor supports all major programming languages including JavaScript, Python, Java, C++, Ruby, Go, and many more. Our code execution environment is fully configurable to match your specific requirements.",
                },
                {
                  question: "Can I customize the coding challenges?",
                  answer:
                    "Yes! You can create your own custom coding challenges or choose from our library of pre-built questions. Each challenge can be customized with specific requirements, test cases, and time limits.",
                },
                {
                  question:
                    "Is there a limit to the number of interviews I can conduct?",
                  answer:
                    "The number of interviews depends on your subscription plan. Our Starter plan includes 20 interviews per month, Professional includes 100, and Enterprise offers unlimited interviews. You can always upgrade your plan as your needs grow.",
                },
                {
                  question: "How secure is the platform?",
                  answer:
                    "Security is our top priority. All data is encrypted in transit and at rest. We use industry-standard security practices and regularly undergo security audits. We are SOC 2 compliant and GDPR ready.",
                },
              ].map((faq, i) => (
                <div key={i} className="rounded-lg border p-6">
                  <h3 className="text-lg font-medium">{faq.question}</h3>
                  <p className="mt-2 text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 md:py-16">
        <div className="container px-4 sm:px-6 md:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Code className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">CodeProctor</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The all-in-one platform for technical interviews combining live
                video proctoring with a powerful coding environment.
              </p>
              <div className="flex gap-4">
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1.5-5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0zm1.5-7a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#features"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Changelog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Press
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Data Processing
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} CodeProctor. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Code,
  Users,
  Video,
  Zap,
  CheckCircle,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="mb-20 text-center">
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-black sm:text-6xl">
          Revolutionizing Technical Interviews
        </h1>
        <p className="mx-auto mb-10 max-w-3xl text-xl text-gray-600">
          We&apos;re on a mission to transform how companies assess technical
          talent, making the process more efficient, fair, and insightful for
          everyone involved.
        </p>
        <div className="relative mx-auto h-[400px] max-w-4xl overflow-hidden rounded-xl shadow-2xl">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-C1igdKSc4fMRCP1A1SVdysHeQ7KF6g.png"
            alt="CodeProctor Platform Interface"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Our Story Section */}
      <div className="mb-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-black sm:text-4xl">
            Our Story
          </h2>
          <div className="mx-auto h-1 w-20 bg-black"></div>
        </div>

        <div className="grid gap-12 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <p className="mb-6 text-lg text-gray-600">
              CodeProctor was born out of frustration with the traditional
              technical interview process. Our founders, experienced tech
              recruiters and engineers, witnessed firsthand how inefficient,
              stressful, and often inaccurate technical assessments could be.
            </p>
            <p className="mb-6 text-lg text-gray-600">
              In 2019, we set out to build a platform that would address these
              challenges head-on. We envisioned a solution that would combine
              the security of proctoring with the flexibility of a professional
              coding environment—all while providing meaningful insights into
              candidates&apos; problem-solving abilities.
            </p>
            <p className="text-lg text-gray-600">
              Today, CodeProctor is trusted by over 2,000 companies worldwide,
              from startups to Fortune 500 enterprises, to streamline their
              technical hiring process and identify the best talent efficiently
              and fairly.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-100 p-6">
              <div className="mb-4 inline-flex rounded-full bg-gray-200 p-3 text-black">
                <Code size={24} />
              </div>
              <h3 className="mb-2 text-xl font-semibold">2019</h3>
              <p className="text-gray-600">
                Founded with a vision to transform technical interviews
              </p>
            </div>
            <div className="rounded-lg bg-gray-100 p-6">
              <div className="mb-4 inline-flex rounded-full bg-gray-200 p-3 text-black">
                <Users size={24} />
              </div>
              <h3 className="mb-2 text-xl font-semibold">2020</h3>
              <p className="text-gray-600">
                Reached our first 100 enterprise customers
              </p>
            </div>
            <div className="rounded-lg bg-gray-100 p-6">
              <div className="mb-4 inline-flex rounded-full bg-gray-200 p-3 text-black">
                <Zap size={24} />
              </div>
              <h3 className="mb-2 text-xl font-semibold">2022</h3>
              <p className="text-gray-600">
                Expanded to support 30+ programming languages
              </p>
            </div>
            <div className="rounded-lg bg-gray-100 p-6">
              <div className="mb-4 inline-flex rounded-full bg-gray-200 p-3 text-black">
                <Award size={24} />
              </div>
              <h3 className="mb-2 text-xl font-semibold">2023</h3>
              <p className="text-gray-600">
                Recognized as a leader in HR Tech innovation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What Makes Us Different */}
      <div className="mb-20 rounded-2xl bg-gray-50 p-12">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-black sm:text-4xl">
            What Makes Us Different
          </h2>
          <div className="mx-auto h-1 w-20 bg-black"></div>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600">
            We&apos;ve reimagined every aspect of the technical assessment
            process to create an experience that works better for everyone.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-xl bg-white p-8 shadow-md">
            <div className="mb-5 inline-flex rounded-full bg-gray-200 p-3 text-black">
              <Code size={24} />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Professional IDE</h3>
            <p className="text-gray-600">
              Our full-featured coding environment supports 30+ languages with
              syntax highlighting, auto-completion, and debugging tools that
              mimic real-world development.
            </p>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-md">
            <div className="mb-5 inline-flex rounded-full bg-gray-200 p-3 text-black">
              <Video size={24} />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Secure Proctoring</h3>
            <p className="text-gray-600">
              Our AI-powered proctoring system ensures interview integrity while
              respecting candidate privacy, creating a secure but comfortable
              assessment environment.
            </p>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-md">
            <div className="mb-5 inline-flex rounded-full bg-gray-200 p-3 text-black">
              <CheckCircle size={24} />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Insightful Analytics</h3>
            <p className="text-gray-600">
              Go beyond pass/fail with detailed performance metrics that reveal
              problem-solving approaches, coding style, and technical strengths
              of each candidate.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-black sm:text-4xl">
            Meet Our Team
          </h2>
          <div className="mx-auto h-1 w-20 bg-black"></div>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600">
            We&apos;re a diverse team of engineers, designers, and hiring
            experts passionate about improving the technical interview
            experience.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              name: "Alex Chen",
              role: "Co-Founder & CEO",
              image: "/placeholder.svg?height=300&width=300",
              bio: "Former tech recruiter with 10+ years of experience at top tech companies.",
            },
            {
              name: "Sarah Johnson",
              role: "Co-Founder & CTO",
              image: "/placeholder.svg?height=300&width=300",
              bio: "Software engineer who's passionate about creating fair assessment tools.",
            },
            {
              name: "Michael Rodriguez",
              role: "Head of Product",
              image: "/placeholder.svg?height=300&width=300",
              bio: "Product leader focused on creating intuitive, powerful user experiences.",
            },
            {
              name: "Priya Patel",
              role: "Lead Engineer",
              image: "/placeholder.svg?height=300&width=300",
              bio: "Full-stack developer specializing in real-time collaboration tools.",
            },
          ].map((member, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-lg bg-white shadow"
            >
              <div className="aspect-square relative">
                <Image
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="mb-1 text-xl font-semibold">{member.name}</h3>
                <p className="mb-3 text-sm font-medium text-gray-700">
                  {member.role}
                </p>
                <p className="text-gray-600">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="mb-20 rounded-2xl bg-black p-12 text-white">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Our Impact</h2>
          <div className="mx-auto h-1 w-20 bg-white"></div>
        </div>

        <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="mb-2 text-5xl font-bold">2,000+</p>
            <p className="text-lg text-gray-300">Companies Trust Us</p>
          </div>
          <div>
            <p className="mb-2 text-5xl font-bold">500K+</p>
            <p className="text-lg text-gray-300">Interviews Conducted</p>
          </div>
          <div>
            <p className="mb-2 text-5xl font-bold">30+</p>
            <p className="text-lg text-gray-300">Programming Languages</p>
          </div>
          <div>
            <p className="mb-2 text-5xl font-bold">98%</p>
            <p className="text-lg text-gray-300">Customer Satisfaction</p>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="mb-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-black sm:text-4xl">
            What Our Customers Say
          </h2>
          <div className="mx-auto h-1 w-20 bg-black"></div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              quote:
                "CodeProctor has transformed our technical hiring process. We've reduced time-to-hire by 40% while improving the quality of our engineering team.",
              author: "Jennifer Lee",
              title: "CTO, TechStart Inc.",
              image: "/placeholder.svg?height=100&width=100",
            },
            {
              quote:
                "The platform provides incredible insights into how candidates approach problems. It's like being able to see their thought process in real-time.",
              author: "David Wilson",
              title: "VP of Engineering, DataFlow",
              image: "/placeholder.svg?height=100&width=100",
            },
            {
              quote:
                "Our candidates love the experience too. The professional coding environment makes them feel comfortable and allows them to showcase their true abilities.",
              author: "Maria Garcia",
              title: "Technical Recruiter, Enterprise Solutions",
              image: "/placeholder.svg?height=100&width=100",
            },
          ].map((testimonial, index) => (
            <div key={index} className="rounded-xl bg-white p-8 shadow-lg">
              <div className="mb-6 text-black">
                <svg width="45" height="36" className="fill-current">
                  <path d="M13.415.43c-2.523 0-4.75 1.173-6.682 3.52C4.8 6.298 3.756 9.38 3.756 12.89c0 6.498 3.442 11.46 10.325 14.887-1.841 2.318-3.165 4.574-3.165 7.233 0 5.99 4.404 10.868 10.4 10.868 5.608 0 9.764-4.325 9.764-10.023 0-5.13-3.315-8.787-8.433-8.787-1.841 0-3.558.642-4.75 1.64 0-2.633.642-4.99 2.028-7.494 1.841-3.33 4.62-5.583 7.805-6.8V.43c-2.523 0-4.62 1.173-6.682 3.52-2.028 2.347-3.073 5.43-3.073 8.94 0 6.498 3.442 11.46 10.325 14.887-1.841 2.318-3.165 4.574-3.165 7.233 0 5.99 4.404 10.868 10.4 10.868 5.608 0 9.764-4.325 9.764-10.023 0-5.13-3.315-8.787-8.433-8.787-1.841 0-3.558.642-4.75 1.64 0-2.633.642-4.99 2.028-7.494 1.841-3.33 4.62-5.583 7.805-6.8V.43c-2.523 0-4.62 1.173-6.682 3.52C20.543 6.298 19.5 9.38 19.5 12.89c0 6.498 3.442 11.46 10.325 14.887-1.841 2.318-3.165 4.574-3.165 7.233 0 5.99 4.404 10.868 10.4 10.868 5.608 0 9.764-4.325 9.764-10.023 0-5.13-3.315-8.787-8.433-8.787-1.841 0-3.558.642-4.75 1.64 0-2.633.642-4.99 2.028-7.494 1.841-3.33 4.62-5.583 7.805-6.8V.43c-2.523 0-4.62 1.173-6.682 3.52-2.028 2.347-3.073 5.43-3.073 8.94 0 6.498 3.442 11.46 10.325 14.887-1.841 2.318-3.165 4.574-3.165 7.233 0 5.99 4.404 10.868 10.4 10.868 5.608 0 9.764-4.325 9.764-10.023 0-5.13-3.315-8.787-8.433-8.787-1.841 0-3.558.642-4.75 1.64 0-2.633.642-4.99 2.028-7.494 1.841-3.33 4.62-5.583 7.805-6.8V.43H13.415z"></path>
                </svg>
              </div>
              <p className="mb-6 text-lg text-gray-600">{testimonial.quote}</p>
              <div className="flex items-center">
                <div className="mr-4 h-12 w-12 overflow-hidden rounded-full">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.author}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="rounded-2xl bg-gradient-to-r from-black to-gray-800 p-12 text-center text-white">
        <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
          Ready to Transform Your Technical Interviews?
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-300">
          Join thousands of companies that are hiring better engineers faster
          with CodeProctor.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/demo"
            className="inline-flex items-center rounded-lg bg-white px-6 py-3 font-medium text-black transition hover:bg-gray-100"
          >
            Request a Demo <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center rounded-lg border border-white bg-transparent px-6 py-3 font-medium text-white transition hover:bg-white/10"
          >
            View Pricing
          </Link>
        </div>
      </div>

      {/* Values Section */}
      <div className="my-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-black sm:text-4xl">
            Our Core Values
          </h2>
          <div className="mx-auto h-1 w-20 bg-black"></div>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600">
            These principles guide everything we do at CodeProctor.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Fairness",
              description:
                "We believe technical assessments should evaluate real skills, not test-taking abilities.",
              icon: <Award className="h-6 w-6" />,
            },
            {
              title: "Innovation",
              description:
                "We continuously push the boundaries of what's possible in technical assessment.",
              icon: <Zap className="h-6 w-6" />,
            },
            {
              title: "Transparency",
              description:
                "We provide clear insights into the assessment process for both candidates and companies.",
              icon: <CheckCircle className="h-6 w-6" />,
            },
            {
              title: "Inclusivity",
              description:
                "We design our platform to be accessible and comfortable for engineers of all backgrounds.",
              icon: <Users className="h-6 w-6" />,
            },
          ].map((value, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 p-6 text-center"
            >
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-black">
                {value.icon}
              </div>
              <h3 className="mb-3 text-xl font-semibold">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

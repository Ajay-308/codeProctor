"use client";
import { TracingBeam } from "@/components/ui/tracingBeam";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy, ExternalLink, Play } from "lucide-react";
import Image from "next/image";
import homePage from "@/app/assest/home.png";

export function TracingBeamDocs() {
  return (
    <TracingBeam className="px-6">
      <div className="max-w-4xl mx-auto antialiased pt-4 relative">
        {docsContent.map((item, index) => (
          <div key={`content-${index}`} id={item.id} className="mb-16">
            <Badge variant="secondary" className="mb-4">
              {item.badge}
            </Badge>

            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {item.title}
            </h2>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {item?.image && (
                <Image
                  width={600}
                  height={300}
                  src={homePage || "/placeholder.svg"}
                  alt={item.title}
                  className="rounded-lg mb-8 object-cover w-full h-64"
                />
              )}
              {item.description}
            </div>

            {item.codeExample && (
              <Card className="mt-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Code Example</CardTitle>
                    <CardDescription>
                      Copy and paste this code to get started
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </CardHeader>
                <CardContent>
                  <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto">
                    <code>{item.codeExample}</code>
                  </pre>
                </CardContent>
              </Card>
            )}

            {item.actions && (
              <div className="flex gap-3 mt-6">
                {item.actions.map((action, actionIndex) => (
                  <Button
                    key={actionIndex}
                    variant={
                      (action.variant as
                        | "default"
                        | "outline"
                        | "link"
                        | "secondary"
                        | "destructive"
                        | "ghost") || "default"
                    }
                  >
                    {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </TracingBeam>
  );
}

const docsContent = [
  {
    id: "getting-started",
    title: "Getting Started with CodeProctor",
    description: (
      <>
        <p>
          CodeProctor is a comprehensive coding interview platform that combines
          advanced proctoring capabilities with powerful development tools. Our
          platform enables organizations to conduct secure, efficient, and
          insightful technical interviews while maintaining the highest
          standards of integrity.
        </p>
        <p>
          With features like split-screen interface, live video proctoring, and
          automated assessment, CodeProctor transforms the way technical
          interviews are conducted, making them more efficient, secure, and
          insightful.
        </p>
        <p>
          Whether you&#39;re a recruiter, technical interviewer, or HR
          professional, this documentation will guide you through all the
          features and capabilities that CodeProctor offers.
        </p>
      </>
    ),
    badge: "Introduction",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-djENvYw3u2V4tuEnPQEWd9w4u0Tx9H.png",
    actions: [
      { label: "Start Free Trial", icon: Play, variant: "default" },
      { label: "Schedule Demo", icon: ExternalLink, variant: "outline" },
    ],
  },
  {
    id: "split-screen-interface",
    title: "Split-Screen Interface",
    description: (
      <>
        <p>
          Experience seamless interview management with our intuitive
          split-screen interface. View code and video side by side for a
          complete interview experience that doesn&#39;t compromise on either
          technical assessment or candidate interaction.
        </p>
        <p>Key benefits of the split-screen interface:</p>
        <ul>
          <li>Simultaneous code and video monitoring</li>
          <li>Customizable layout options</li>
          <li>Real-time synchronization</li>
          <li>Responsive design for all screen sizes</li>
          <li>Picture-in-picture mode support</li>
        </ul>
        <p>
          The interface is designed to minimize cognitive load on interviewers
          while maximizing visibility into candidate performance and behavior.
        </p>
      </>
    ),
    badge: "Interface",
    image: "/placeholder.svg?height=300&width=600",
    actions: [
      { label: "View Interface Demo", icon: ExternalLink, variant: "default" },
    ],
  },
  {
    id: "live-video-proctoring",
    title: "Live Video Proctoring",
    description: (
      <>
        <p>
          Ensure interview integrity with real-time video monitoring and
          recording capabilities. Our advanced proctoring system maintains the
          security and authenticity of your technical interviews while providing
          a smooth experience for both interviewers and candidates.
        </p>
        <p>Proctoring features include:</p>
        <ul>
          <li>HD video recording with cloud storage</li>
          <li>Real-time monitoring alerts</li>
          <li>Automated suspicious activity detection</li>
          <li>Screen sharing prevention</li>
          <li>Browser lockdown capabilities</li>
          <li>Multi-camera support</li>
        </ul>
        <p>
          All video data is encrypted and stored securely, with configurable
          retention policies to meet your organization&#39;s compliance
          requirements.
        </p>
      </>
    ),
    badge: "Proctoring",
    image: "/placeholder.svg?height=300&width=600",
    actions: [
      { label: "Security Features", icon: ExternalLink, variant: "outline" },
    ],
  },
  {
    id: "advanced-code-editor",
    title: "Advanced Code Editor",
    description: (
      <>
        <p>
          Provide candidates with a full-featured code editor that supports
          syntax highlighting and multiple programming languages. Our editor is
          designed to feel familiar while providing powerful features for
          technical assessment.
        </p>
        <p>Editor capabilities:</p>
        <ul>
          <li>Support for 50+ programming languages</li>
          <li>Intelligent syntax highlighting</li>
          <li>Auto-completion and IntelliSense</li>
          <li>Code formatting and linting</li>
          <li>Customizable themes and layouts</li>
          <li>Real-time collaboration features</li>
        </ul>
        <p>
          The editor integrates seamlessly with our testing engine, allowing for
          immediate code execution and validation during interviews.
        </p>
      </>
    ),
    badge: "Editor",
    codeExample: `// Example: JavaScript function with syntax highlighting
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Test the function
console.log(fibonacci(10)); // Output: 55

// The editor supports multiple languages:
// Python, Java, C++, Go, Rust, and many more!`,
    actions: [{ label: "Try Code Editor", icon: Play, variant: "default" }],
  },
  {
    id: "automated-assessment",
    title: "Automated Assessment",
    description: (
      <>
        <p>
          Instantly evaluate code submissions with our powerful testing engine.
          Automated assessment reduces manual review time while providing
          consistent, objective evaluation criteria for all candidates.
        </p>
        <p>Assessment features:</p>
        <ul>
          <li>Custom test case creation</li>
          <li>Performance benchmarking</li>
          <li>Code quality analysis</li>
          <li>Plagiarism detection</li>
          <li>Automated scoring algorithms</li>
          <li>Detailed feedback generation</li>
        </ul>
        <p>
          Create comprehensive test suites that evaluate not just correctness,
          but also code efficiency, style, and best practices adherence.
        </p>
      </>
    ),
    badge: "Assessment",
    codeExample: `// Example test configuration
{
  "testCases": [
    {
      "input": [5, 3],
      "expectedOutput": 8,
      "description": "Basic addition test"
    },
    {
      "input": [0, 0],
      "expectedOutput": 0,
      "description": "Edge case: zero values"
    }
  ],
  "timeLimit": 1000,
  "memoryLimit": "128MB",
  "scoring": {
    "correctness": 70,
    "efficiency": 20,
    "codeQuality": 10
  }
}`,
    actions: [
      { label: "Assessment Guide", icon: ExternalLink, variant: "outline" },
    ],
  },
  {
    id: "collaborative-interviews",
    title: "Collaborative Interviews",
    description: (
      <>
        <p>
          Enable multiple interviewers to join sessions and provide feedback in
          real-time. Our collaborative features ensure that technical interviews
          can involve the right stakeholders while maintaining organization and
          clarity.
        </p>
        <p>Collaboration features:</p>
        <ul>
          <li>Multi-interviewer support (up to 10 participants)</li>
          <li>Role-based permissions</li>
          <li>Real-time note sharing</li>
          <li>Private interviewer chat</li>
          <li>Synchronized evaluation forms</li>
          <li>Post-interview discussion tools</li>
        </ul>
        <p>
          Streamline your interview process with tools designed for team-based
          technical evaluation and decision making.
        </p>
      </>
    ),
    badge: "Collaboration",
    image: "/placeholder.svg?height=300&width=600",
    actions: [
      { label: "Team Features", icon: ExternalLink, variant: "outline" },
    ],
  },
  {
    id: "playback-analysis",
    title: "Playback & Analysis",
    description: (
      <>
        <p>
          Review interviews with synchronized code and video playback for deeper
          insights. Our analysis tools help you understand not just what
          candidates coded, but how they approached problems and worked through
          challenges.
        </p>
        <p>Analysis capabilities:</p>
        <ul>
          <li>Synchronized video and code playback</li>
          <li>Keystroke analysis and timing</li>
          <li>Problem-solving pattern recognition</li>
          <li>Collaboration effectiveness metrics</li>
          <li>Performance trend analysis</li>
          <li>Exportable interview reports</li>
        </ul>
        <p>
          Generate comprehensive reports that provide actionable insights for
          hiring decisions and candidate feedback.
        </p>
      </>
    ),
    badge: "Analysis",
    image: "/placeholder.svg?height=300&width=600",
    actions: [
      { label: "View Sample Report", icon: ExternalLink, variant: "default" },
      { label: "Analytics Dashboard", icon: ExternalLink, variant: "outline" },
    ],
  },
  {
    id: "getting-started-guide",
    title: "Quick Start Guide",
    description: (
      <>
        <p>
          Get started with CodeProctor in just a few simple steps. Our platform
          is designed to be intuitive and easy to set up, so you can start
          conducting secure technical interviews immediately.
        </p>
        <h4>Step 1: Create Your Account</h4>
        <p>Sign up for a CodeProctor account and verify your email address.</p>

        <h4>Step 2: Set Up Your Organization</h4>
        <p>
          Configure your organization settings, add team members, and set up
          user roles.
        </p>

        <h4>Step 3: Create Your First Interview</h4>
        <p>
          Use our interview builder to create questions, test cases, and
          evaluation criteria.
        </p>

        <h4>Step 4: Invite Candidates</h4>
        <p>
          Send interview invitations with automated scheduling and reminder
          features.
        </p>
      </>
    ),
    badge: "Quick Start",
    actions: [
      { label: "Create Account", icon: ExternalLink, variant: "default" },
      { label: "Watch Tutorial", icon: Play, variant: "outline" },
    ],
  },
  {
    id: "integration-api",
    title: "Integration & API",
    description: (
      <>
        <p>
          Integrate CodeProctor with your existing hiring workflow using our
          comprehensive API and pre-built integrations with popular ATS and HR
          platforms.
        </p>
        <p>Integration options:</p>
        <ul>
          <li>REST API with comprehensive documentation</li>
          <li>Webhook support for real-time updates</li>
          <li>ATS integrations (Greenhouse, Lever, BambooHR)</li>
          <li>Calendar integrations (Google, Outlook)</li>
          <li>SSO support (SAML, OAuth)</li>
          <li>Custom branding and white-label options</li>
        </ul>
        <p>
          Our API allows you to programmatically manage interviews, retrieve
          results, and sync data with your existing systems.
        </p>
      </>
    ),
    badge: "Integration",
    codeExample: `// Example API usage
const codeproctor = require('@codeproctor/api');

// Initialize client
const client = new codeproctor.Client({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Create an interview
const interview = await client.interviews.create({
  title: 'Senior Frontend Developer',
  duration: 60,
  questions: ['react-hooks', 'algorithm-optimization'],
  candidateEmail: 'candidate@example.com'
});

// Get interview results
const results = await client.interviews.getResults(interview.id);`,
    actions: [
      { label: "API Documentation", icon: ExternalLink, variant: "default" },
    ],
  },
];

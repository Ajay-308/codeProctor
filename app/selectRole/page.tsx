"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Briefcase, Loader2, UserCircle } from "lucide-react";
import Image from "next/image";
import interviwerImage from "@/app/assest/interviewer.png";
import candidateImage from "@/app/assest/candidate.png";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export default function SelectRole() {
  const { user } = useUser();
  const router = useRouter();
  const createUserWithRole = useMutation(api.users.createUserWithRole);
  const [selectedRole, setSelectedRole] = useState<
    "candidate" | "interviewer" | null
  >(null);
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = async (role: "candidate" | "interviewer") => {
    if (!user) return;

    setSelectedRole(role);
    setIsLoading(true);

    try {
      const response = await createUserWithRole({
        name: user.fullName || "",
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
        clerkId: user.id,
        userName,
        role,
      });

      if (!response.success) {
        if (response.error === "Username already taken") {
          setUserName("");
          toast.error("Username already taken");
        } else if (response.error === "User already exists") {
          toast.error("User already exists");
        } else {
          toast.error("Something went wrong");
        }

        setIsLoading(false);
        setSelectedRole(null);

        return;
      }
      router.push("/home");
    } catch (error) {
      console.error("Unexpected error setting role:", error);
      toast.error("Something went wrong");
      setIsLoading(false);
      setSelectedRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center text-center mb-12">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight mb-3"
          >
            Welcome to codeProctor
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground max-w-md"
          >
            Please select your role to personalize your experience on our
            platform.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Candidate Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -5 }}
          >
            <Card
              className={`overflow-hidden h-full transition-all hover:shadow-md ${
                selectedRole === "candidate"
                  ? "ring-2 ring-primary ring-offset-2"
                  : ""
              }`}
            >
              <div className="relative h-48 bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                <Image
                  src={candidateImage || "/placeholder.svg"}
                  alt="Candidate"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white dark:bg-slate-800 rounded-full p-4 shadow-lg">
                    <UserCircle className="h-12 w-12 text-blue-500" />
                  </div>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-center text-2xl">
                  I&apos;m a Candidate
                </CardTitle>
                <CardDescription className="text-center">
                  Looking for opportunities and ready to showcase my skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-center text-muted-foreground mb-4">
                  <li className="flex items-center justify-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Schedule and attend interviews
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Receive feedback on your performance
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Track your application progress
                  </li>
                </ul>

                <Input
                  type="text"
                  placeholder="Enter your username"
                  className="px-4 rounded-md"
                  autoFocus
                  required
                  minLength={4}
                  maxLength={15}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
                {userName.trim().length < 4 && userName.trim().length > 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Username must be at least 4 characters
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => handleRoleSelect("candidate")}
                  disabled={isLoading || userName.trim().length < 4}
                >
                  {isLoading && selectedRole === "candidate" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    "Continue as Candidate"
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => setUserName("")}
                  disabled={isLoading || userName.trim().length === 0}
                >
                  Clear
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Interviewer Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card
              className={`overflow-hidden h-full transition-all hover:shadow-md ${
                selectedRole === "interviewer"
                  ? "ring-2 ring-primary ring-offset-2"
                  : ""
              }`}
            >
              <div className="relative h-48 bg-gradient-to-r from-emerald-500/20 to-teal-500/20">
                <Image
                  src={interviwerImage || "/placeholder.svg"}
                  alt="Interviewer"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white dark:bg-slate-800 rounded-full p-4 shadow-lg">
                    <Briefcase className="h-12 w-12 text-emerald-500" />
                  </div>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-center text-2xl">
                  I&apos;m an Interviewer
                </CardTitle>
                <CardDescription className="text-center">
                  Evaluating candidates and providing valuable feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-center text-muted-foreground mb-4">
                  <li className="flex items-center justify-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Conduct and manage interviews
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Evaluate candidate performance
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Collaborate with hiring teams
                  </li>
                </ul>

                <Input
                  type="text"
                  placeholder="Enter your username"
                  className="px-4 rounded-md"
                  autoFocus
                  required
                  minLength={4}
                  maxLength={15}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
                {userName.trim().length < 4 && userName.trim().length > 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Username must be at least 4 characters
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button
                  size="lg"
                  className="w-full"
                  variant="outline"
                  onClick={() => handleRoleSelect("interviewer")}
                  disabled={isLoading || userName.trim().length < 4}
                >
                  {isLoading && selectedRole === "interviewer" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    "Continue as Interviewer"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full"
                  onClick={() => setUserName("")}
                  disabled={isLoading || userName.trim().length === 0}
                >
                  Clear
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            By continuing, you agree to our{" "}
            <a
              href="#"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

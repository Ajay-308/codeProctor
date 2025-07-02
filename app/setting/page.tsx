"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [clerkId, setClerkId] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [userNameError, setUserNameError] = useState("");

  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  // Redirect to home if user is not authenticated
  useEffect(() => {
    if (isLoaded && !userId) {
      toast.error("You must be logged in to access this page");
      router.push("/");
    }
  }, [isLoaded, userId, router]);

  const getUserDetails = useQuery(api.users.getUserByClerkId, {
    clerkId: userId || "",
  });

  const updateUserDetails = useMutation(api.users.updateUser);

  const getUserByUserName = useQuery(api.users.getUserByUserName, {
    userName: userName,
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!getUserDetails) return;
      setLoading(true);
      try {
        const user = getUserDetails;
        if (user) {
          setUserName(user.userName || "");
          setEmail(user.email || "");
          setImage(user.image || "");
          setRole(user.role || "candidate");
          setName(user.name || "");
          setClerkId(user.clerkId || "");
          setSkills(user.skills || []);
        }
      } catch (error) {
        console.error("Error fetching user details", error);
        toast.error("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [getUserDetails]);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (userName.length < 3) {
        setUserNameError("Username must be at least 3 characters long");
        setLoading(false);
        return;
      }

      if (userName.length > 15) {
        setUserNameError("Username must be at most 15 characters long");
        setLoading(false);
        return;
      }

      if (getUserByUserName && getUserByUserName.clerkId !== userId) {
        setUserNameError("Username already taken");
        setLoading(false);
        return;
      }

      setUserNameError("");

      await updateUserDetails({
        name,
        email,
        image,
        clerkId,
        userName,
        skills,
        role:
          role === "candidate" || role === "interviewer" ? role : "candidate",
      });

      toast.success("User updated successfully");
      router.push("/home");
    } catch (error) {
      console.error("Error updating user details", error);
      toast.error("Error updating user details");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-10 px-4 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">User Settings</CardTitle>
            <CardDescription>
              Update your profile information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && !userId ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="flex flex-col items-center space-y-4 mb-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={image || "/placeholder.svg"} alt={name} />
                    <AvatarFallback>
                      {getInitials(name || userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="w-full">
                    <Label htmlFor="image">Profile Image URL</Label>
                    <Input
                      id="image"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      disabled
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userName">Username</Label>
                    <Input
                      id="userName"
                      value={userName}
                      onChange={(e) => {
                        setUserName(e.target.value);
                        setUserNameError("");
                      }}
                      placeholder="johndoe"
                      className={userNameError ? "border-red-500" : ""}
                    />
                    {userNameError && (
                      <p className="text-sm text-red-500">{userNameError}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john.doe@example.com"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <RadioGroup
                      value={role}
                      onValueChange={setRole}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="candidate" id="candidate" />
                        <Label htmlFor="candidate" className="cursor-pointer">
                          Candidate
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="interviewer" id="interviewer" />
                        <Label htmlFor="interviewer" className="cursor-pointer">
                          Interviewer
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Skills Section */}
                <div className="space-y-4">
                  <Label>Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={handleSkillKeyPress}
                      placeholder="Add a skill (e.g., React, Python, etc.)"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddSkill}
                      disabled={
                        !newSkill.trim() || skills.includes(newSkill.trim())
                      }
                      size="icon"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1 px-3 py-1"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {skills.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No skills added yet. Add your first skill above.
                    </p>
                  )}
                </div>

                {/* Buttons inside form */}
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => router.push("/home")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

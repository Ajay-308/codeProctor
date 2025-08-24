"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";

import { ArrowLeft, Bug, AlertTriangle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ReportIssuePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    description: "",
    email: "",
    browser: "",
    steps: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Issue Reported Successfully!");
        setFormData({
          type: "",
          title: "",
          description: "",
          email: "",
          browser: "",
          steps: "",
        });
      } else {
        toast.error("Something went wrong. Please try again later.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to send feedback.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-4">Report an Issue</h1>
          <p className="text-muted-foreground">
            Help us improve CodeProctor by reporting bugs, issues, or suggesting
            improvements.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="text-center">
              <Bug className="h-8 w-8 mx-auto mb-2 text-red-500" />
              <CardTitle className="text-lg">Bug Report</CardTitle>
              <CardDescription>
                Something isn&#39;t working as expected
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <CardTitle className="text-lg">Technical Issue</CardTitle>
              <CardDescription>
                Performance or connectivity problems
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Lightbulb className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <CardTitle className="text-lg">Feature Request</CardTitle>
              <CardDescription>
                Suggest new features or improvements
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Issue Details</CardTitle>
            <CardDescription>
              Please provide as much detail as possible to help us resolve the
              issue quickly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Issue Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="performance">
                        Performance Issue
                      </SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="ui">UI/UX Issue</SelectItem>
                      <SelectItem value="security">Security Concern</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Your Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Issue Title</Label>
                <Input
                  id="title"
                  placeholder="Brief description of the issue"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea
                  id="description"
                  placeholder="What happened? What did you expect to happen?"
                  className="min-h-[120px]"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="steps">
                  Steps to Reproduce (if applicable)
                </Label>
                <Textarea
                  id="steps"
                  placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                  className="min-h-[100px]"
                  value={formData.steps}
                  onChange={(e) => handleInputChange("steps", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="browser">Browser & System Info</Label>
                <Input
                  id="browser"
                  placeholder="e.g., Chrome 120.0, Windows 11, MacOS Sonoma"
                  value={formData.browser}
                  onChange={(e) => handleInputChange("browser", e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Submitting..." : "Submit Issue Report"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setFormData({
                      type: "",
                      title: "",
                      description: "",
                      email: "",
                      browser: "",
                      steps: "",
                    })
                  }
                >
                  Clear Form
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Alternative Contact Methods</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              <strong>Email:</strong> bugs@codeproctor.com
            </p>
            <p>
              <strong>Response Time:</strong> We typically respond within 24
              hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Calendar from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  CalendarIcon,
  Clock,
  Users,
  Send,
  Mail,
  CheckCircle,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ScheduleAssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params?.id as string;

  const assignment = useQuery(api.assignments.getAssignment, {
    id: assignmentId,
  });

  const scheduleAssignment = useMutation(api.assignments.createAssignment);

  const [candidateEmails, setCandidateEmails] = useState("");
  const [dueDate, setDueDate] = useState<Date>();
  const [instructions, setInstructions] = useState("");
  const [sendImmediately, setSendImmediately] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);

  const handleSchedule = async () => {
    if (!dueDate || !assignment) {
      toast.error("Please select a due date");
      return;
    }

    const emails = candidateEmails
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (emails.length === 0) {
      toast.error("Please add at least one candidate email");
      return;
    }

    setIsScheduling(true);

    try {
      await scheduleAssignment({
        // From the existing assignment (already fetched using Convex)
        title: assignment.title,
        description: assignment.description || "",
        dueDate: dueDate.getTime(),
        createdBy: assignment.createdBy,
        passingScore: assignment.passingScore,
        type: assignment.type || "quiz",
        timeLimit: assignment.timeLimit || 30,
        status: "scheduled",
        questions: assignment.questions,

        // From this form
        candidateEmails: emails,
        instructions,
        sendImmediately,
        reminderEnabled,
      });

      toast.success("Assignment scheduled successfully!");
      router.push(`/assignments/${assignmentId}`);
    } catch (error) {
      console.error("Error scheduling assignment:", error);
      toast.error("Failed to schedule assignment. Please try again.");
    } finally {
      setIsScheduling(false);
    }
  };

  const emailList = candidateEmails
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email.length > 0);

  if (!assignment) {
    return (
      <div className="container max-w-4xl mx-auto p-6 flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading assignment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/assignments/${assignmentId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Schedule Assignment</h1>
          <p className="text-muted-foreground">
            Send &quot;{assignment.title}&quot; to candidates
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assignment Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Assignment Ready
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">{assignment.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {assignment.description}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{assignment.timeLimit} minutes</span>
                  </div>
                  <Badge variant="outline">{assignment.type}</Badge>
                  <span className="text-muted-foreground">
                    {assignment.questions?.length || 0} questions
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Candidate Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Candidates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="candidates">Candidate Emails</Label>
                <Textarea
                  id="candidates"
                  placeholder="Enter candidate emails separated by commas&#10;example@company.com, candidate2@company.com"
                  value={candidateEmails}
                  onChange={(e) => setCandidateEmails(e.target.value)}
                  rows={4}
                />
              </div>

              {emailList.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Candidates ({emailList.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {emailList.map((email, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        {email}
                        <button
                          onClick={() => {
                            const newEmails = emailList.filter(
                              (_, i) => i !== index
                            );
                            setCandidateEmails(newEmails.join(", "));
                          }}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "Select due date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Additional Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Add any specific instructions for candidates..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Send Timing</Label>
                  <Select
                    value={sendImmediately ? "immediate" : "scheduled"}
                    onValueChange={(value) =>
                      setSendImmediately(value === "immediate")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">
                        Send Immediately
                      </SelectItem>
                      <SelectItem value="scheduled">
                        Schedule for Later
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Reminders</Label>
                  <Select
                    value={reminderEnabled ? "enabled" : "disabled"}
                    onValueChange={(value) =>
                      setReminderEnabled(value === "enabled")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Enable Reminders</SelectItem>
                      <SelectItem value="disabled">
                        Disable Reminders
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{emailList.length} candidate(s) selected</span>
                </div>
                {dueDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Due: {format(dueDate, "PPP")}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {sendImmediately
                      ? "Send immediately"
                      : "Schedule for later"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Reminders: {reminderEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button
                  onClick={handleSchedule}
                  disabled={!dueDate || emailList.length === 0 || isScheduling}
                  className="w-full"
                  size="lg"
                >
                  {isScheduling ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Schedule Assignment
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  asChild
                >
                  <Link href={`/assignments/${assignmentId}`}>
                    Save as Draft
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

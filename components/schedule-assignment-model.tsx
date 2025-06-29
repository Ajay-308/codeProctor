"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Calendar from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Users, Send, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface ScheduleAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentTitle: string;
  onSchedule: (scheduleData: ScheduleData) => Promise<void>;
  isScheduling?: boolean;
}

export interface ScheduleData {
  candidateEmails: string[];
  dueDate: Date;
  instructions: string;
  sendImmediately: boolean;
  reminderEnabled: boolean;
}

export default function ScheduleAssignmentModal({
  open,
  onOpenChange,
  assignmentTitle,
  onSchedule,
  isScheduling = false,
}: ScheduleAssignmentModalProps) {
  const [candidateEmails, setCandidateEmails] = useState("");
  const [dueDate, setDueDate] = useState<Date>();
  const [instructions, setInstructions] = useState("");
  const [sendImmediately, setSendImmediately] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const emailList = candidateEmails
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email.length > 0);

  const handleSchedule = async () => {
    if (!dueDate || emailList.length === 0) return;

    try {
      const emailResults = await Promise.all(
        emailList.map(async (email) => {
          const res = await fetch("/api/send_email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: email.split("@")[0], // fallback name
              email,
              interviewDate: dueDate,
              link: "https://code-proctor.vercel.app/home",
            }),
          });

          if (!res.ok) {
            toast.error(`❌ Failed to send to ${email}`);
            return false;
          }
          return true;
        })
      );

      const successCount = emailResults.filter(Boolean).length;

      await onSchedule({
        candidateEmails: emailList,
        dueDate,
        instructions,
        sendImmediately,
        reminderEnabled,
      });

      // Reset form fields
      setCandidateEmails("");
      setDueDate(undefined);
      setInstructions("");
      setSendImmediately(true);
      setReminderEnabled(true);

      toast.success(`✅ Assignment sent to ${successCount} candidate(s)!`);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while scheduling.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Schedule Assignment
          </DialogTitle>
          <DialogDescription>
            Send &quot;{assignmentTitle}&quot; to candidates and set up
            scheduling details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Candidate Emails */}
          <div className="space-y-2">
            <Label htmlFor="candidates">Candidate Emails</Label>
            <Textarea
              id="candidates"
              placeholder="Enter candidate emails separated by commas"
              value={candidateEmails}
              onChange={(e) => setCandidateEmails(e.target.value)}
              rows={3}
            />
            {emailList.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {emailList.map((email, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
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
            )}
          </div>

          {/* Due Date */}
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
                  disabled={(date: Date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Instructions */}
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

          {/* Scheduling Options */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Scheduling Options</Label>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">
                    Send Immediately
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Send assignment invitations right away
                  </p>
                </div>
                <Select
                  value={sendImmediately ? "immediate" : "scheduled"}
                  onValueChange={(value) =>
                    setSendImmediately(value === "immediate")
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Reminders</Label>
                  <p className="text-xs text-muted-foreground">
                    Send reminder emails before due date
                  </p>
                </div>
                <Select
                  value={reminderEnabled ? "enabled" : "disabled"}
                  onValueChange={(value) =>
                    setReminderEnabled(value === "enabled")
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={!dueDate || emailList.length === 0 || isScheduling}
          >
            {isScheduling ? "Scheduling..." : "Schedule Assignment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

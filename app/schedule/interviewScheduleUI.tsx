"use client";

import { useUser } from "@clerk/nextjs";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useMutation, useQuery } from "convex/react";
import { useState, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UserInfo from "@/components/UserInfo";
import {
  CalendarIcon,
  ClockIcon,
  Loader2Icon,
  PlusCircleIcon,
  SearchIcon,
  UserIcon,
  UsersIcon,
  VideoIcon,
  XIcon,
} from "lucide-react";
import Calendar from "@/components/ui/calendar";
import { timeSlots } from "@/constants";
import MeetingCard from "@/components/MeetingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Interview {
  _id: string;
  _creationTime: number;
  title: string;
  description?: string;
  startTime: number;
  endTime?: number;
  status: string;
  streamCallId: string;
  candidateId: string;
  interviewerIds: string[]; // ✅ Correct spelling
}

type Id<T> = string & { __tableName: T };

function InterviewScheduleUI() {
  const client = useStreamVideoClient();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const interviews = useQuery(api.interviews.getInterviewByInterviewerId, {
    interviewerId: user?.id ?? "",
  });
  console.log("Interviews:", interviews);
  const users = useQuery(api.users.getUser) ?? [];
  const createInterview = useMutation(api.interviews.createInterview);
  const updateInterview = useMutation(api.interviews.updateInterview);

  const candidates = users?.filter((u) => u.role === "candidate");
  const interviewers = users?.filter((u) => u.role === "interviewer");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date(),
    time: "09:00",
    candidateId: "",
    interviewerIds: user?.id ? [user.id] : [],
  });

  // stream api key
  // const streamApiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
  // const streamSecretKey = process.env.NEXT_PUBLIC_STREAM_SECRET_KEY;

  // Group interviews by status
  const upcomingInterviews = (interviews ?? []).filter(
    (interview) => interview.status === "upcoming"
  );
  const completedInterviews = (interviews ?? []).filter(
    (interview) => interview.status === "completed"
  );
  const pastInterviews = (interviews ?? []).filter(
    (interview) =>
      interview.status === "completed" ||
      interview.status === "failed" ||
      interview.status === "Completed"
  );

  // Filter interviews based on search query
  const filteredInterviews = (interviews ?? []).filter((interview) => {
    if (!searchQuery) return true;

    const matchesTitle = interview.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesDescription = interview.description
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    const candidate = users.find((u) => u.clerkId === interview.candidateId);
    const matchesCandidate = candidate?.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesTitle || matchesDescription || matchesCandidate;
  });

  useEffect(() => {
    const now = Date.now();

    (interviews ?? []).forEach(async (interview) => {
      const start = interview.startTime;
      const end = interview.endTime ?? start + 30 * 60 * 1000;

      if (now > end && interview.status !== "completed") {
        await updateInterview({
          id: interview._id,
          status: "completed",
        });
      }
    });
  }, [interviews, updateInterview]);

  const scheduleMeeting = async () => {
    // console.log("this is stream api key:", streamApiKey);
    // console.log("this is stream secret key:", streamSecretKey);
    // console.log("scheduleMeeting function called");

    if (!client) {
      console.error("Stream video client is not initialized");
      toast.error(
        "Video service not connected. Please refresh the page or check your connection."
      );
      return;
    }

    if (!user) {
      console.error("User not authenticated");
      toast.error("Authentication error. Please sign in again.");
      return;
    }

    // Validate form data
    if (!formData.candidateId) {
      console.error("No candidate selected");
      toast.error("Please select a candidate");
      return;
    }

    if (formData.interviewerIds.length === 0) {
      console.error("No interviewers selected");
      toast.error("Please select at least one interviewer");
      return;
    }

    if (!formData.title.trim()) {
      console.error("Title is empty");
      toast.error("Please enter an interview title");
      return;
    }

    console.log("Form validation passed:", formData);
    setIsCreating(true);

    try {
      const { title, description, date, time, candidateId, interviewerIds } =
        formData;
      console.log("Creating meeting with:", {
        title,
        description,
        date,
        time,
        candidateId,
        interviewerIds,
      });

      // Create date object for meeting
      const [hours, minutes] = time.split(":");
      const meetingDate = new Date(date);
      meetingDate.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0);

      if (meetingDate < new Date()) {
        //console.error("Meeting date is in the past:", meetingDate);
        toast.error(
          "Meeting date cannot be in the past. Please select a future date."
        );
        setIsCreating(false);
        return;
      }
      console.log("Meeting date:", meetingDate.toISOString());

      // Generate UUID
      const id = crypto.randomUUID();
      console.log("Generated UUID:", id);

      // Create Stream call
      console.log("Attempting to create Stream call");
      try {
        const call = client.call("default", id);
        console.log("Call object created:", call);

        const callResponse = await call.getOrCreate({
          data: {
            starts_at: meetingDate.toISOString(),
            custom: {
              description: title,
              additionalDetails: description,
            },
          },
        });
        console.log("Stream call created successfully:", callResponse);
      } catch (streamError) {
        console.error("Error creating Stream call:", streamError);
        toast.error("Failed to create video call. Please try again.");
        setIsCreating(false);
        return;
      }

      // Save interview to Convex
      console.log("Saving interview to database");
      try {
        const interviewResponse = await createInterview({
          title,
          description,
          startTime: meetingDate.getTime(),
          status: "upcoming",
          streamCallId: `default:${id}`,
          candidateId,
          interviewerIds,
        });
        console.log("Interview saved successfully:", interviewResponse);
      } catch (convexError) {
        console.error("Error saving interview to database:", convexError);
        toast.error("Failed to save interview. Please try again.");
        setIsCreating(false);
        return;
      }

      setOpen(false);
      toast.success("Meeting scheduled successfully!");

      // Reset form
      setFormData({
        title: "",
        description: "",
        date: new Date(),
        time: "09:00",
        candidateId: "",
        interviewerIds: user?.id ? [user.id] : [],
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Failed to schedule meeting. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };
  const handleScheduleMeeting = async () => {
    const [hours, minutes] = formData.time.split(":");
    const meetingDate = new Date(formData.date);
    meetingDate.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0);

    if (meetingDate < new Date()) {
      //console.error("Meeting date is in the past:", meetingDate);
      toast.error(
        "Meeting date cannot be in the past. Please select a future date."
      );
      setIsCreating(false);
      return;
    }
    try {
      await scheduleMeeting();
      console.log("Meeting scheduled successfully");
    } catch (error) {
      console.error("Error in handleScheduleMeeting:", error);
    }
  };
  useEffect(() => {
    if (!client) {
      console.log(
        "Stream video client is not initialized. Attempting to initialize..."
      );
      // You might want to add code here to initialize the client if possible
    } else {
      console.log("Stream video client successfully initialized:", client);
    }
  }, [client]);

  // Also check the createInterview mutation
  useEffect(() => {
    console.log(
      "createInterview mutation:",
      typeof createInterview === "function" ? "Available" : "Not available"
    );
    if (!createInterview) {
      console.warn(
        "createInterview mutation is not available. Check your Convex setup."
      );
    }
  }, [createInterview]);

  const addInterviewer = (interviewerId: string) => {
    if (!formData.interviewerIds.includes(interviewerId)) {
      setFormData((prev) => ({
        ...prev,
        interviewerIds: [...prev.interviewerIds, interviewerId],
      }));
    }
  };

  const removeInterviewer = (interviewerId: string) => {
    if (interviewerId === user?.id) return;
    setFormData((prev) => ({
      ...prev,
      interviewerIds: prev.interviewerIds.filter((id) => id !== interviewerId),
    }));
  };

  const selectedInterviewers = interviewers.filter((i) =>
    formData.interviewerIds.includes(i.clerkId)
  );

  const availableInterviewers = interviewers.filter(
    (i) => !formData.interviewerIds.includes(i.clerkId)
  );

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Interview Schedule
          </h1>
          <p className="text-muted-foreground mt-1">
            Schedule and manage candidate interviews
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search interviews..."
              className="pl-9 w-full sm:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="default" className="gap-2 cursor-pointer">
                <PlusCircleIcon className="h-4 w-4" />
                Schedule Interview
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Schedule New Interview</DialogTitle>
                <DialogDescription>
                  Fill in the details below to schedule a new interview session.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-4">
                {/* INTERVIEW DETAILS SECTION */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                    <VideoIcon className="h-4 w-4" />
                    INTERVIEW DETAILS
                  </h3>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        placeholder="Frontend Developer Interview"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        placeholder="Technical interview for the Frontend Developer position..."
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* PARTICIPANTS SECTION */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                    <UsersIcon className="h-4 w-4" />
                    PARTICIPANTS
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Candidate</label>
                      <Select
                        value={formData.candidateId}
                        onValueChange={(candidateId) =>
                          setFormData({ ...formData, candidateId })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select candidate" />
                        </SelectTrigger>
                        <SelectContent>
                          {candidates.length > 0 ? (
                            candidates.map((candidate) => (
                              <SelectItem
                                key={candidate.clerkId}
                                value={candidate.clerkId}
                              >
                                <UserInfo user={candidate} />
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-muted-foreground">
                              No candidates available
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Interviewers
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2 min-h-10">
                        {selectedInterviewers.map((interviewer) => (
                          <div
                            key={interviewer.clerkId}
                            className="inline-flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-md text-sm"
                          >
                            <UserInfo user={interviewer} />
                            {interviewer.clerkId !== user?.id && (
                              <Button
                                onClick={() =>
                                  removeInterviewer(interviewer.clerkId)
                                }
                                className="hover:text-destructive transition-colors ml-1"
                                aria-label="Remove interviewer"
                              >
                                <XIcon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      {availableInterviewers.length > 0 && (
                        <Select onValueChange={addInterviewer}>
                          <SelectTrigger>
                            <SelectValue placeholder="Add interviewer" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableInterviewers.map((interviewer) => (
                              <SelectItem
                                key={interviewer.clerkId}
                                value={interviewer.clerkId}
                              >
                                <UserInfo user={interviewer} />
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </div>

                {/* SCHEDULING SECTION */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                    <ClockIcon className="h-4 w-4" />
                    SCHEDULING
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.date
                              ? format(formData.date, "PPP")
                              : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.date}
                            onSelect={(date) =>
                              date && setFormData({ ...formData, date })
                            }
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Time</label>
                      <Select
                        value={formData.time}
                        onValueChange={(time) =>
                          setFormData({ ...formData, time })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleScheduleMeeting}
                  disabled={isCreating}
                  className="gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="h-4 w-4" />
                      Schedule Interview
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {upcomingInterviews.length}
              </div>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 hover:bg-blue-50"
              >
                Scheduled
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {completedInterviews.length}
              </div>
              <Badge
                variant="outline"
                className="bg-amber-50 text-amber-700 hover:bg-amber-50"
              >
                Awaiting Decision
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{pastInterviews.length}</div>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 hover:bg-green-50"
              >
                Finalized
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABS AND INTERVIEW CARDS */}
      {!interviews ? (
        <div className="flex justify-center py-12">
          <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : interviews.length > 0 ? (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              All
              <Badge variant="secondary" className="ml-1 rounded-full px-2.5">
                {filteredInterviews.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-2">
              Upcoming
              <Badge variant="secondary" className="ml-1 rounded-full px-2.5">
                {
                  upcomingInterviews.filter((i) =>
                    filteredInterviews.includes(i)
                  ).length
                }
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              In Progress
              <Badge variant="secondary" className="ml-1 rounded-full px-2.5">
                {
                  completedInterviews.filter((i) =>
                    filteredInterviews.includes(i)
                  ).length
                }
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-2">
              Completed
              <Badge variant="secondary" className="ml-1 rounded-full px-2.5">
                {
                  pastInterviews.filter((i) => filteredInterviews.includes(i))
                    .length
                }
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredInterviews.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredInterviews.map((interview) => (
                  <MeetingCard
                    key={interview._id}
                    interview={{
                      ...interview,
                      _id: interview._id as Id<"interviews">,
                      status: interview.status as
                        | "upcoming"
                        | "ongoing"
                        | "completed"
                        | "cancelled",
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No interviews match your search
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingInterviews.filter((i) => filteredInterviews.includes(i))
              .length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingInterviews
                  .filter((i) => filteredInterviews.includes(i))
                  .map((interview) => (
                    <MeetingCard
                      key={interview._id}
                      interview={{
                        ...interview,
                        _id: interview._id as Id<"interviews">,
                        status: interview.status as
                          | "upcoming"
                          | "ongoing"
                          | "completed"
                          | "cancelled",
                      }}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No upcoming interviews
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedInterviews.filter((i) => filteredInterviews.includes(i))
              .length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {completedInterviews
                  .filter((i: Interview) =>
                    filteredInterviews.some(
                      (interview) => interview._id === i._id
                    )
                  )
                  .map((interview: Interview) => (
                    <MeetingCard
                      key={interview._id}
                      interview={{
                        ...interview,
                        _id: interview._id as Id<"interviews">,
                        status: interview.status as
                          | "upcoming"
                          | "ongoing"
                          | "completed"
                          | "cancelled",
                      }}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No interviews in progress
              </div>
            )}
          </TabsContent>
          <TabsContent value="past" className="space-y-4">
            {pastInterviews.filter((i: Interview) =>
              filteredInterviews.some((f) => f._id === i._id)
            ).length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pastInterviews
                  .filter((i: Interview) =>
                    filteredInterviews.some((f) => f._id === i._id)
                  )
                  .map((interview: Interview) => (
                    <MeetingCard
                      key={interview._id}
                      interview={{
                        ...interview,
                        _id: interview._id as Id<"interviews">,
                        status: interview.status as
                          | "upcoming"
                          | "ongoing"
                          | "completed"
                          | "cancelled",
                      }}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No completed interviews
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-16 border rounded-lg bg-muted/10">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <UserIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No interviews scheduled</h3>
          <p className="text-muted-foreground mt-1 mb-6 max-w-md mx-auto">
            Get started by scheduling your first interview with a candidate
          </p>
          <Button onClick={() => setOpen(true)} className="gap-2">
            <PlusCircleIcon className="h-4 w-4" />
            Schedule Interview
          </Button>
        </div>
      )}
    </div>
  );
}

export default InterviewScheduleUI;

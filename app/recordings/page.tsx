"use client";

import LoaderUI from "@/components/LoaderUI";
import RecordingCard from "@/components/RecordingCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useGetCalls from "@/hooks/useGetCall";
import type { CallRecording } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { FileVideo2, Search, SlidersHorizontal, VideoOff } from "lucide-react";

function RecordingsPage() {
  const { calls, isCallLoading: isLoading } = useGetCalls();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    const fetchRecordings = async () => {
      if (!calls) return;

      try {
        // Get recordings for each call
        const callData = await Promise.all(
          calls.map((call) => call.queryRecordings())
        );
        const allRecordings = callData.flatMap((call) => call.recordings);

        setRecordings(allRecordings);
      } catch (error) {
        console.log("Error fetching recordings:", error);
      }
    };

    fetchRecordings();
  }, [calls]);

  // Filter recordings based on search query
  const filteredRecordings = recordings.filter((recording) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    const recordingName = (recording.filename || "").toLowerCase();
    const recordingDate = new Date(recording.end_time)
      .toLocaleDateString()
      .toLowerCase();

    return (
      recordingName.includes(searchLower) || recordingDate.includes(searchLower)
    );
  });
  // Sort recordings based on selected order
  const sortedRecordings = [...filteredRecordings].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.end_time).getTime() - new Date(a.end_time).getTime();
    } else {
      return new Date(a.end_time).getTime() - new Date(b.end_time).getTime();
    }
  });

  if (isLoading) return <LoaderUI />;

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileVideo2 className="h-8 w-8 text-primary" />
            Recordings
          </h1>
          <p className="text-muted-foreground mt-1">
            {recordings.length}{" "}
            {recordings.length === 1 ? "recording" : "recordings"} available
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recordings..."
              className="pl-9 w-full sm:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* RECORDINGS GRID */}
      <ScrollArea className="h-[calc(100vh-14rem)] rounded-md border bg-card p-1">
        {recordings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-4">
            {sortedRecordings.map((r) => (
              <RecordingCard key={r.end_time} recording={r} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] gap-4 p-6 text-center">
            <div className="bg-muted rounded-full p-6">
              <VideoOff className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No recordings available</h3>
            <p className="text-muted-foreground max-w-md">
              When you record your calls, they will appear here. Start a call
              and use the record button to create your first recording.
            </p>
            <Button className="mt-2">Start a new call</Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

export default RecordingsPage;

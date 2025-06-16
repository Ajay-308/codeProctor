"use client";

import React, { useState, useEffect } from "react";
import { Filter, Mail, Calendar, Code, MoreVertical, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CandidateCard from "./candidateCard";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Navbar from "@/components/Navbar";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  status:
    | "applied"
    | "screening"
    | "interview"
    | "technical"
    | "offer"
    | "rejected";
  lastActivity: string;
  avatarUrl?: string;
  score: number;
  tags: string[];
}

const statusLabels: Record<
  Candidate["status"],
  { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }
> = {
  applied: { label: "Applied", variant: "default" },
  screening: { label: "Screening", variant: "secondary" },
  interview: { label: "Interview", variant: "secondary" },
  technical: { label: "Technical", variant: "outline" },
  offer: { label: "Offer", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export default function Page() {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  // Redirect to home if user is not authenticated
  // or if userId is not available
  useEffect(() => {
    if (isLoaded && !userId) {
      toast.error("You must be logged in to access this page");
      router.push("/");
    }
  }, [isLoaded, userId, router]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchTerm, setSearchTerm] = useState("");

  const users = useQuery(api.users.getUser) || [];
  const scores = useQuery(api.users.successfulInterviews) || [];

  const candidateUsers = users.filter((user) => user.role === "candidate");

  const candidates: Candidate[] = candidateUsers.map((user) => {
    const scoreData = scores.find((s) => s.candidateId === user.clerkId);

    const roundScore = Math.round((scoreData?.score ?? 0) * 100);
    return {
      id: user.clerkId,
      name: user.name,
      email: user.email,
      position: "Candidate",
      status: "applied",
      lastActivity: new Date(user._creationTime).toISOString().split("T")[0],
      avatarUrl: user.image,
      score: roundScore || 0,
      tags: ["React", "TypeScript", "JavaScript"],
    };
  });

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />

      <div className="space-y-6 mt-8 mx-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
            <p className="text-sm text-gray-500">
              Manage and track all your candidates
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm">
              <Filter className="mr-1.5 h-4 w-4" />
              Filter
            </Button>
            <Button variant="default" size="sm">
              Add Candidate
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Input
            className="w-full sm:w-80 mt-4"
            placeholder="Search candidates..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              List
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              Grid
            </Button>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-gray-500">
            Loading candidates...
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-gray-500">
            No candidates found matching your search.
          </div>
        ) : viewMode === "list" ? (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Candidate",
                    "Position",
                    "Status",
                    "Score",
                    "Last Activity",
                    "",
                  ].map((head, idx) => (
                    <th
                      key={idx}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredCandidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar>
                          <AvatarImage
                            src={candidate.avatarUrl}
                            alt={candidate.name}
                          />
                          <AvatarFallback>
                            {candidate.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">
                            {candidate.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {candidate.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {candidate.position}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Badge variant={statusLabels[candidate.status].variant}>
                        {statusLabels[candidate.status].label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {candidate.score ? (
                        <div className="flex items-center">
                          <div className="h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                candidate.score >= 90
                                  ? "bg-green-500"
                                  : candidate.score >= 70
                                    ? "bg-blue-500"
                                    : "bg-yellow-500"
                              }`}
                              style={{ width: `${candidate.score}%` }}
                            />
                          </div>
                          <span className="ml-2">{candidate.score}%</span>
                        </div>
                      ) : (
                        <span>Not Given Interviews</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(candidate.lastActivity).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="flex justify-end gap-2 text-gray-400">
                        <Mail className="h-4 w-4" />
                        <Calendar className="h-4 w-4" />
                        <Code className="h-4 w-4" />
                        <MoreVertical className="h-4 w-4" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onClick={() => setSelectedCandidate(candidate)}
              />
            ))}
          </div>
        )}

        {selectedCandidate && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">Candidate Details</h2>
                <button onClick={() => setSelectedCandidate(null)}>
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row">
                  <div className="mb-6 md:mb-0 md:mr-8">
                    <Avatar>
                      <AvatarImage
                        src={selectedCandidate.avatarUrl}
                        alt={selectedCandidate.name}
                      />
                      <AvatarFallback>
                        {selectedCandidate.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold">
                      {selectedCandidate.name}
                    </h3>
                    <p className="text-gray-600">
                      {selectedCandidate.position}
                    </p>
                    <div className="mt-2 flex items-center">
                      <Badge
                        variant={statusLabels[selectedCandidate.status].variant}
                      >
                        {statusLabels[selectedCandidate.status].label}
                      </Badge>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm text-gray-500">
                        Applied on{" "}
                        {new Date(
                          selectedCandidate.lastActivity
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Email
                        </h4>
                        <p>{selectedCandidate.email}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Score
                        </h4>
                        <p>{selectedCandidate.score || "Not scored"}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Skills
                      </h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedCandidate.tags.map((tag, idx) => (
                          <Badge key={idx} variant="default">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2">
                      <Button>
                        <Mail className="mr-1.5 h-4 w-4" /> Send Email
                      </Button>
                      <Button>
                        <Calendar className="mr-1.5 h-4 w-4" /> Schedule
                        Interview
                      </Button>
                      <Button variant="default">
                        <Code className="mr-1.5 h-4 w-4" /> Send Challenge
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

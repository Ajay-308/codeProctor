import React from "react";
import { Mail, Calendar, Code } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  score?: number;
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

interface CandidateCardProps {
  candidate: Candidate;
  onClick?: () => void;
}

const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onClick,
}) => {
  return (
    <Card className="hover:shadow-lg cursor-pointer" onClick={onClick}>
      <CardContent>
        <div className="flex items-center">
          <Avatar>
            <AvatarImage src={candidate.avatarUrl} alt={candidate.name} />
            <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-gray-900">{candidate.name}</h3>
            <p className="text-sm text-gray-500">{candidate.position}</p>
          </div>
        </div>

        <div className="mt-4">
          <Badge variant={statusLabels[candidate.status].variant}>
            {statusLabels[candidate.status].label}
          </Badge>
          <div className="mt-2 text-sm text-gray-500">
            <span>
              Last activity:{" "}
              {new Date(candidate.lastActivity).toLocaleDateString()}
            </span>
          </div>
        </div>

        {candidate.score !== undefined && (
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-700">Score</div>
            <div className="mt-1 flex items-center">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full ${
                    candidate.score >= 90
                      ? "bg-green-500"
                      : candidate.score >= 70
                        ? "bg-blue-500"
                        : candidate.score >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                  }`}
                  style={{ width: `${candidate.score}%` }}
                />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">
                {candidate.score}%
              </span>
            </div>
          </div>
        )}

        <div className="mt-4">
          <div className="text-sm font-medium text-gray-700">Skills</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {candidate.tags.map((tag, index) => (
              <Badge key={index} variant="default" className="mt-1">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <Button variant="outline" size="sm">
          <Mail className="h-4 w-4 mr-1" />
          Email
        </Button>
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-1" />
          Schedule
        </Button>
        <Button variant="default" size="sm">
          <Code className="h-4 w-4 mr-1" />
          Test
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CandidateCard;

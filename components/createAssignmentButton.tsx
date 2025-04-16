"use client";

import { Button } from "@/components/ui/button";
import { BookOpenIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateAssignmentButton() {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push("/assignments/create")}
      variant="default"
      className="gap-2"
    >
      <BookOpenIcon className="h-4 w-4" />
      Create Assignment
    </Button>
  );
}

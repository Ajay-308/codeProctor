"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import React, { useState } from "react";
import { Trash2, AlertCircle } from "lucide-react";

export default function ConfirmDelete({
  id,
  setId,
  deleteFn,
  templateName,
}: {
  id: Id<"templetes"> | null;
  setId: (val: Id<"templetes"> | null) => void;
  // Use a union type instead of any
  deleteFn: (payload: {
    id: Id<"templetes">;
  }) => Promise<void | null | undefined>;
  templateName?: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!id) return;

    setIsDeleting(true);
    setError(null);

    try {
      await deleteFn({ id });
      setId(null); // Reset the id state after successful deletion
    } catch (err) {
      console.error("Failed to delete template:", err);
      setError("Failed to delete template. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={!!id}
      onOpenChange={(open) => {
        if (!open && !isDeleting) setId(null);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <Trash2 className="h-5 w-5 mr-2" />
            Confirm Delete
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            template
            {templateName ? ` "${templateName}"` : ""} from the database.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 p-3 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <DialogFooter className="sm:justify-between sm:space-x-0">
          <Button
            variant="outline"
            onClick={() => setId(null)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

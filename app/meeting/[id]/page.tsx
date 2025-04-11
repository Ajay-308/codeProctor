"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import useGetCallById from "@/hooks/useGetCallById";

export default function MeetingPage() {
  const { id } = useParams();
  const { isLoaded, user } = useUser();

  const { call, isCallLoading } = useGetCallById(id ?? "");
}

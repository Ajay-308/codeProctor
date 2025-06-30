"use client";

import { useState, useEffect, ReactNode } from "react";
import { StreamVideoClient, StreamVideo } from "@stream-io/video-react-sdk";
import { streamProvider } from "@/actions/stream.actions";
import { useUser } from "@clerk/nextjs";
import LoaderUI from "@/components/LoaderUI";

export default function StreamClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [streamVideoClient, setStreamVideoClient] =
    useState<StreamVideoClient | null>(null);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    // Wait until auth state is loaded
    if (!isLoaded) return;

    // If no user is logged in, just return without initializing
    // Don't throw an error here
    if (!user) {
      return;
    }

    // Initialize client only if user is logged in
    const initStreamVideoClient = new StreamVideoClient({
      apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
      user: {
        id: user.id,
        name:
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.id,
        image: user?.imageUrl,
      },
      tokenProvider: streamProvider,
    });

    setStreamVideoClient(initStreamVideoClient);

    // Cleanup on unmount
    return () => {
      initStreamVideoClient.disconnectUser();
    };
  }, [user, isLoaded]);

  // If auth is still loading, show loader
  if (!isLoaded) return <LoaderUI />;

  // If no user is logged in, just render children without Stream wrapper
  if (!user) return <>{children}</>;

  // If user is logged in but client is still initializing, show loader
  if (!streamVideoClient) return <LoaderUI />;

  // User is logged in and client is initialized
  return <StreamVideo client={streamVideoClient}>{children}</StreamVideo>;
}

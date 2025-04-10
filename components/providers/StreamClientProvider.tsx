"use client";

// isse phele koi join kare video call or start kare ye code ensure karega ki dono parties ke bich mai proper connection hue hai ki nhi

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
    if (!isLoaded || !user) {
      throw new Error("User is not logged in stream client provider");
      return;
    }

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
  }, [user, isLoaded]);
  if (!streamVideoClient) return <LoaderUI />;

  return <StreamVideo client={streamVideoClient}>{children}</StreamVideo>;
}

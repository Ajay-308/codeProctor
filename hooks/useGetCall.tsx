import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useStreamVideoClient, Call } from "@stream-io/video-react-sdk";

export default function useGetCallById() {
  const { user } = useUser();
  const client = useStreamVideoClient();
  const [calls, setCalls] = useState<Call[]>();
  const [isCallLoading, setIsCallLoading] = useState(true);

  useEffect(() => {
    const fetchCall = async () => {
      if (!client || !user) return;
      try {
        const { calls } = await client.queryCalls({
          sort: [{ field: "starts_at", direction: -1 }],
          filter_conditions: {
            starts_at: {
              $exits: true,
            },
            $or: [
              { created_by_user_id: user.id },
              { members: { $in: [user.id] } },
            ],
          },
        });
        setCalls(calls);
      } catch (err) {
        console.error("Error fetching calls", err);
      } finally {
        setIsCallLoading(false);
      }
    };
    fetchCall();
  }, [client, user?.id]);

  const now = new Date();
  const endedCalls = calls?.filter(({ state: { startsAt, endedAt } }: Call) => {
    return startsAt && endedAt
      ? new Date(startsAt) <= now && new Date(endedAt) >= now
      : false;
  });

  const upComingCalls = calls?.filter(({ state: { startsAt } }: Call) => {
    return startsAt && new Date(startsAt) > now;
  });

  const liveCalls = calls?.filter(({ state: { startsAt, endedAt } }: Call) => {
    return (
      startsAt &&
      new Date(startsAt) < now &&
      (!endedAt || new Date(endedAt) > now)
    );
  });

  return { calls, endedCalls, upComingCalls, liveCalls, isCallLoading };
}

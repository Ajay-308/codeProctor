import { useEffect, useState } from "react";
import { useStreamVideoClient, Call } from "@stream-io/video-react-sdk";
import toast from "react-hot-toast";

const useGetCallsByUserId = (userId: string) => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const streamClient = useStreamVideoClient();

  useEffect(() => {
    if (!streamClient) {
      toast.error("Stream client not initialized");
      return;
    }

    if (!userId) return;

    const fetchCalls = async () => {
      try {
        const { calls } = await streamClient.queryCalls({
          filter_conditions: {
            created_by_user_id: userId,
          },
          sort: [{ field: "starts_at", direction: -1 }],
        });

        setCalls(calls);
      } catch (error) {
        toast.error("Failed to fetch user's calls");
        console.error("Error fetching user calls:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalls();
  }, [streamClient, userId]);

  return { calls, isLoading };
};

export default useGetCallsByUserId;

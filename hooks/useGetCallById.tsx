import { useEffect, useState } from "react";

import { useStreamVideoClient, Call } from "@stream-io/video-react-sdk";
import toast from "react-hot-toast";

const useGetCallById = (id: string | string[]) => {
  const [call, setCall] = useState<Call>();
  const [isCallLoading, setIsCallLoading] = useState(true);

  const streamClient = useStreamVideoClient();

  useEffect(() => {
    if (!streamClient) {
      toast.error("stream client not found in useGetCallById");
      return;
    }

    const getCall = async () => {
      try {
        const { calls } = await streamClient.queryCalls({
          filter_conditions: { id },
        });
        if (calls.length > 0) {
          setCall(calls[0]);
        }
      } catch (err) {
        toast.error("Error fetching call");
        console.error(err);
        setCall(undefined);
      } finally {
        setIsCallLoading(false);
      }
    };
    getCall();
  }, [id, streamClient]);

  return { call, isCallLoading };
};

export default useGetCallById;

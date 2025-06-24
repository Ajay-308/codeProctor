import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { recording_id } = req.body;

  if (!recording_id) {
    return res.status(400).json({ message: "Missing recording_id" });
  }

  try {
    const response = await fetch(
      `https://video.stream-io-api.com/api/v1.0/recordings/${recording_id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer YOUR_BACKEND_TOKEN_HERE", // use server-side token
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete recording");
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ message: "Internal server error" });
    console.log(e);
  }
}

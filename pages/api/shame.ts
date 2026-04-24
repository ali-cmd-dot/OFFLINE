import type { NextApiRequest, NextApiResponse } from "next";
import { getShameData, ShameData } from "@/lib/shame";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ShameData | { error: string; details?: string }>
) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    const data = await getShameData();
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    return res.status(200).json(data);
  } catch (err: unknown) {
    console.error("Shame API error:", err);
    return res.status(500).json({
      error: "Failed to fetch data",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
}

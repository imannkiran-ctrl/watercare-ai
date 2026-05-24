import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(4000),
});

export const chatWithWaterBot = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      messages: z.array(messageSchema).min(1).max(30),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI service is not configured.");

    const systemPrompt = `You are WaterCare AI, an expert assistant for SDG 6 (Clean Water and Sanitation).
Help users with: water safety, conservation tips, identifying contamination, sanitation best practices,
guidance on reporting water issues, and general clean-water knowledge.
Be concise, friendly, and actionable. Use bullet points where helpful.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...data.messages],
      }),
    });

    if (res.status === 429) throw new Error("Too many requests. Please wait a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please top up in Settings.");
    if (!res.ok) {
      const txt = await res.text();
      console.error("AI error:", res.status, txt);
      throw new Error("AI service failed.");
    }

    const json = await res.json();
    const reply = json.choices?.[0]?.message?.content ?? "";
    return { reply };
  });

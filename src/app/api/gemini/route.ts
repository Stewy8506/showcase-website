import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { symptoms } = await req.json();
    console.log("Gemini key exists:", !!process.env.GEMINI_API_KEY);

    if (!symptoms) {
      return NextResponse.json({ error: "No symptoms provided" }, { status: 400 });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY!,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Based on these symptoms: "${symptoms}", suggest the most appropriate type of doctor to visit.

                    1. First line: Doctor type
                    2. 2-3 sentence explanation
                    3. Medical disclaimer

                    Be concise and professional.`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text)
        .join("") || "No response";

    return NextResponse.json({ result: text });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to analyze symptoms" },
      { status: 500 }
    );
  }
}

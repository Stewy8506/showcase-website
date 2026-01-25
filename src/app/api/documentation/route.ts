import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("Documentation API key exists:", !!process.env.GEMINI_API_KEY);
    console.log("File received:", file.name, file.type, file.size);

    // Read file as array buffer and convert to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

    // Determine MIME type
    let mimeType = file.type;
    if (!mimeType) {
      const extension = file.name.split(".").pop()?.toLowerCase();
      const mimeTypeMap: Record<string, string> = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
        heic: "image/heic",
        heif: "image/heif",
        pdf: "application/pdf",
      };
      mimeType = mimeTypeMap[extension || ""] || "application/octet-stream";
    }

    // Check if file size is within limits (20MB for inline data)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (buffer.length > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 20MB limit for inline upload" },
        { status: 400 }
      );
    }

    // Prepare the prompt for medicine information extraction
    const prompt = `Analyze this document/image and extract the following medicine information:

Document Name: ${file.name}
Document Type: ${mimeType}

Please provide:
1. Medicine name
2. Medicine dosage
3. Medicine frequency
4. Medicine duration
5. Medicine instructions


Be concise but thorough. If any information is not available in the document, clearly state "Not specified" for that item.`;

    // Call Gemini API with inline image/document data
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
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API error:", errorData);
      return NextResponse.json(
        { error: "Failed to analyze document with AI" },
        { status: response.status }
      );
    }

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text)
        .join("") || "No analysis available";

    return NextResponse.json({ result: text });
  } catch (err) {
    console.error("Documentation API error:", err);
    return NextResponse.json(
      { error: "Failed to analyze document" },
      { status: 500 }
    );
  }
}

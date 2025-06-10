import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "Invalid prompt provided" }, { status: 400 })
    }

    const { text } = await generateText({
      model: openai("gpt-4.1-nano-2025-04-14"),
      system: `You are a prompt optimization expert. Your task is to reduce token count without changing the core meaning or functionality of the input.

First, detect content type:
- If it contains code (e.g. programming, markup, config), follow CODE rules.
- Otherwise, treat as plain text and follow TEXT rules.

---

CODE:

Do NOT change:
- Variable names, keywords, syntax, or strings

ONLY:
- Remove excess whitespace
- Normalize indentation
- Strip blank lines

Code must remain valid and unaltered in logic or behavior.

---

TEXT:

Apply these token-reduction strategies:

1. Remove filler and unnecessary words ("please", "can you", etc.)
2. Use numerals ("eight" → "8")
3. Use symbols ("times" → "*", "equals" → "=")
4. Normalize repeated characters ("soooo" → "so", "Hiiii" → "hi")
5. Remove extra punctuation ("???" → "", "...", "!!!")
6. Lowercase everything
7. Use concise phrasing where possible
8. Abbreviate frequent terms ("approximately" → "~", "function" → "fn")
9. Remove redundancy and repetition
10. Compress extra spacing and newlines

Maintain meaning and clarity. Be aggressive but not destructive.

Return ONLY the optimized prompt, no explanation.`,
      prompt: `Optimize this prompt for fewer tokens:\n\n${prompt}`,
      maxTokens: 1000,
    })

    return Response.json({ optimizedPrompt: text.trim() })
  } catch (error) {
    console.error("Error optimizing prompt:", error)
    return Response.json({ error: "Failed to optimize prompt" }, { status: 500 })
  }
}

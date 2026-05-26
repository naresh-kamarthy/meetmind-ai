import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Define interfaces for return types
interface MeetingSummary {
  overview: string;
  keyHighlights: string[];
  actionItems: string[];
  productivityInsights: string;
}

interface TaskItem {
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
}

// Define Zod schemas for AI JSON responses
const MeetingSummarySchema = z.object({
  overview: z.string().default("No overview generated."),
  keyHighlights: z.array(z.string()).default([]),
  actionItems: z.array(z.string()).default([]),
  productivityInsights: z.string().default("No productivity insights available.")
});

const TaskItemSchema = z.object({
  title: z.string().default("Untitled Task"),
  description: z.string().default(""),
  priority: z.enum(["Low", "Medium", "High"]).default("Medium")
});

const TaskListSchema = z.array(TaskItemSchema);

// Reusable robust function to safely extract and parse JSON with Zod validation
function extractAndParseJSON(text: string, schema: z.ZodSchema, fallback: any): any {
  let cleanText = text.trim();

  // Try parsing directly first
  try {
    const parsed = JSON.parse(cleanText);
    const result = schema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }
  } catch (e) { }

  // 1. Try stripping markdown JSON code blocks
  if (cleanText.includes("```")) {
    const match = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      cleanText = match[1].trim();
    }
  }

  // Try parsing after code block cleaning
  try {
    const parsed = JSON.parse(cleanText);
    const result = schema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }
  } catch (e) { }

  // 2. Find the boundaries of the first JSON object or array to ignore natural language wrappers
  const firstBrace = cleanText.indexOf("{");
  const lastBrace = cleanText.lastIndexOf("}");
  const firstBracket = cleanText.indexOf("[");
  const lastBracket = cleanText.lastIndexOf("]");

  let jsonSubstring = "";
  if (firstBrace !== -1 && lastBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    jsonSubstring = cleanText.substring(firstBrace, lastBrace + 1);
  } else if (firstBracket !== -1 && lastBracket !== -1) {
    jsonSubstring = cleanText.substring(firstBracket, lastBracket + 1);
  }

  if (jsonSubstring) {
    try {
      const parsed = JSON.parse(jsonSubstring);
      const result = schema.safeParse(parsed);
      if (result.success) {
        return result.data;
      }
    } catch (e) { }
  }

  // 3. Fallback logic: If parsing failed completely, return a structural fallback or parse raw text
  if (schema === MeetingSummarySchema) {
    return {
      overview: text.length > 800 ? text.substring(0, 800) + "..." : (text || "No overview generated."),
      keyHighlights: [],
      actionItems: [],
      productivityInsights: "AI generated a malformed response, but the raw text was captured."
    };
  }

  return fallback;
}

export class AIService {
  private static getModel() {
    if (!genAI) {
      throw new Error("GEMINI_API_KEY is not configured on the server. Please check your .env configuration.");
    }
    return genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
  }

  static async generateSummary(rawNotes: string): Promise<MeetingSummary> {
    try {
      const model = this.getModel();
      const prompt = `
You are an expert AI productivity assistant. Analyze the following raw meeting notes and extract structured information.

Meeting Notes:
"""
${rawNotes}
"""

Provide your analysis in EXACTLY the following JSON format:
{
  "overview": "A concise paragraph summary of the meeting context, general alignment, and goals.",
  "keyHighlights": ["Highlight 1", "Highlight 2"],
  "actionItems": ["Action item 1", "Action item 2"],
  "productivityInsights": "A short synthesis of the meeting's efficiency, engagement levels, or advice to improve future discussions."
}

Do not include any markdown wrappers (like \`\`\`json) in your final output, just return the raw JSON object. If you must use wrappers, ensure they can be easily parsed.
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      return extractAndParseJSON(text, MeetingSummarySchema, {
        overview: "No overview generated.",
        keyHighlights: [],
        actionItems: [],
        productivityInsights: "No productivity insights available."
      }) as MeetingSummary;
    } catch (error: any) {
      console.error("Gemini Generate Summary Error:", error);
      throw new Error(`AI generation failed: ${error.message || error}`);
    }
  }

  static async generateFollowUpEmail(rawNotes: string, overview: string, actionItems: string[]): Promise<string> {
    try {
      const model = this.getModel();
      const prompt = `
You are an executive assistant. Generate a highly professional, polite, and polished follow-up email based on the following meeting summary and action items.

Meeting Overview:
${overview}

Action Items:
${actionItems.map(item => `- ${item}`).join("\n")}

Raw Notes (for reference context):
"""
${rawNotes}
"""

The email should be clear, professional, and well-structured, including a Subject line, professional greeting, executive summary, next steps, and sign-off.
`;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error: any) {
      console.error("Gemini Generate Email Error:", error);
      throw new Error(`AI email generation failed: ${error.message || error}`);
    }
  }

  static async generateTasks(rawNotes: string): Promise<TaskItem[]> {
    try {
      const model = this.getModel();
      const prompt = `
Analyze the following meeting notes and extract a list of structured actionable tasks to be added to a Kanban task board.

Meeting Notes:
"""
${rawNotes}
"""

Provide your tasks in EXACTLY the following JSON array format:
[
  {
    "title": "Clear task title",
    "description": "Short description of what needs to be done and by whom.",
    "priority": "Low"
  }
]

Do not include any markdown wrappers (like \`\`\`json) in your final output, just return the raw JSON array.
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      return extractAndParseJSON(text, TaskListSchema, []) as TaskItem[];
    } catch (error: any) {
      console.error("Gemini Generate Tasks Error:", error);
      throw new Error(`AI task generation failed: ${error.message || error}`);
    }
  }
}

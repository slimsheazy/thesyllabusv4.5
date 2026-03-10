/**
 * Robustly extracts and parses JSON from a string that may contain markdown formatting.
 * Handles cases where the JSON is wrapped in ```json ... ``` or ``` ... ``` blocks,
 * or contains leading/trailing text.
 */
export function extractJSON<T>(text: string): T {
  try {
    // 1. Try direct parsing first
    return JSON.parse(text.trim());
  } catch (e) {
    // 2. Try to extract from markdown code blocks
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
    const match = text.match(codeBlockRegex);
    
    if (match && match[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch (e2) {
        // Fall through to more aggressive extraction
      }
    }

    // 3. Last resort: find the first '{' or '[' and the last '}' or ']'
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');

    let start = -1;
    let end = -1;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      start = firstBrace;
      end = lastBrace;
    } else if (firstBracket !== -1) {
      start = firstBracket;
      end = lastBracket;
    }

    if (start !== -1 && end !== -1 && end > start) {
      const jsonCandidate = text.substring(start, end + 1);
      try {
        return JSON.parse(jsonCandidate.trim());
      } catch (e3) {
        throw new Error(`Failed to parse extracted JSON: ${e3 instanceof Error ? e3.message : String(e3)}`);
      }
    }

    throw new Error("No valid JSON structure found in response.");
  }
}

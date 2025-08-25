// Utility to parse problem descriptions and extract inputs/outputs
export interface ParsedExample {
  input: string;
  output: string;
  explanation?: string;
}

export function parseExamplesFromDescription(
  description: string
): ParsedExample[] {
  const examples: ParsedExample[] = [];

  try {
    // Pattern 1: Example X: Input: ... Output: ... (Explanation: ...)
    const pattern1 =
      /Example\s+\d+:\s*Input:\s*([^\n]+)\s*Output:\s*([^\n]+)(?:\s*Explanation:\s*([^\n]+))?/gi;
    let match1;
    while ((match1 = pattern1.exec(description)) !== null) {
      examples.push({
        input: match1[1].trim(),
        output: match1[2].trim(),
        explanation: match1[3]?.trim(),
      });
    }

    // Pattern 2: Input: ... Output: ... (without Example prefix)
    if (examples.length === 0) {
      const pattern2 =
        /Input:\s*([^\n]+)\s*Output:\s*([^\n]+)(?:\s*Explanation:\s*([^\n]+))?/gi;
      let match2;
      while ((match2 = pattern2.exec(description)) !== null) {
        examples.push({
          input: match2[1].trim(),
          output: match2[2].trim(),
          explanation: match2[3]?.trim(),
        });
      }
    }

    // Pattern 3: More flexible parsing for different formats
    if (examples.length === 0) {
      const lines = description.split("\n");
      let currentExample: Partial<ParsedExample> = {};

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.toLowerCase().includes("input:")) {
          currentExample.input = line.replace(/input:\s*/i, "").trim();
        } else if (line.toLowerCase().includes("output:")) {
          currentExample.output = line.replace(/output:\s*/i, "").trim();
        } else if (line.toLowerCase().includes("explanation:")) {
          currentExample.explanation = line
            .replace(/explanation:\s*/i, "")
            .trim();
        }

        // If we have both input and output, save the example
        if (currentExample.input && currentExample.output) {
          examples.push({
            input: currentExample.input,
            output: currentExample.output,
            explanation: currentExample.explanation,
          });
          currentExample = {};
        }
      }
    }

    return examples.slice(0, 5);
  } catch (error) {
    console.error("Error parsing examples:", error);
    return [];
  }
}

export function parseConstraints(description: string): string[] {
  const constraints: string[] = [];

  try {
    const constraintsMatch = description.match(
      /Constraints?:\s*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i
    );
    if (constraintsMatch) {
      const constraintsText = constraintsMatch[1];
      const lines = constraintsText.split("\n");

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.toLowerCase().includes("constraints")) {
          // Remove bullet points and clean up
          const cleaned = trimmed.replace(/^[-•*]\s*/, "").trim();
          if (cleaned) {
            constraints.push(cleaned);
          }
        }
      }
    }

    return constraints;
  } catch (error) {
    console.error("Error parsing constraints:", error);
    return [];
  }
}

// Clean and format problem description
export function cleanDescription(description: string): string {
  try {
    // Remove examples and constraints sections for cleaner main description
    let cleaned = description
      .replace(/Example\s+\d+:[\s\S]*?(?=Example\s+\d+:|Constraints?:|$)/gi, "")
      .replace(/Input:[\s\S]*?Output:[\s\S]*?(?=Example|Constraints?|$)/gi, "")
      .replace(/Constraints?:[\s\S]*$/i, "")
      .trim();

    // Clean up extra whitespace
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, "\n\n").trim();
    // Fallback to original if cleaning removes everything
    return cleaned || description;
  } catch (error) {
    console.error("Error cleaning description:", error);
    return description;
  }
}

// Batch process multiple problems
export function batchProcessProblems(
  problems: { id: string; description: string; [key: string]: unknown }[]
): {
  id: string;
  description: string;
  [key: string]: unknown;
  parsedExamples: ParsedExample[];
  parsedConstraints: string[];
  cleanedDescription: string;
  processed: boolean;
}[] {
  return problems.map((problem) => {
    try {
      const examples = parseExamplesFromDescription(problem.description);
      const constraints = parseConstraints(problem.description);
      const cleanedDescription = cleanDescription(problem.description);

      return {
        ...problem,
        parsedExamples: examples,
        parsedConstraints: constraints,
        cleanedDescription: cleanedDescription,
        processed: true,
      };
    } catch (error) {
      console.error(`Error processing problem ${problem.id}:`, error);
      return {
        ...problem,
        parsedExamples: [],
        parsedConstraints: [],
        cleanedDescription: problem.description,
        processed: false,
      };
    }
  });
}

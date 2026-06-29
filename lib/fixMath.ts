export function fixMathDelimiters(content: string): string {
  if (!content) return content;

  // Step 1: Single line [ \text{...} ] → $$...$$ 
  // e.g. [ \text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d}}\right)V ]
  const result = content.replace(
    /\[\s*(\\[a-zA-Z][^\[\]\n]+)\s*\]/g,
    (_, inner) => `\n$$\n${inner.trim()}\n$$\n`
  );

  // Step 2: Multiline [ \text...\n] → $$...$$
  // Split into segments and process
  const lines = result.split('\n');
  const output: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Opening bracket with backslash command, no closing bracket on same line
    if (/^\[\s*\\[a-zA-Z]/.test(trimmed) && !trimmed.endsWith(']')) {
      let math = trimmed.slice(1).trim(); // remove leading [
      i++;
      while (i < lines.length) {
        const inner = lines[i].trim();
        if (inner === ']' || inner.endsWith(']')) {
          const cleaned = inner.replace(/\]$/, '').trim();
          if (cleaned) math += '\n' + cleaned;
          i++;
          break;
        }
        math += '\n' + inner;
        i++;
      }
      output.push(`\n$$\n${math.trim()}\n$$\n`);
      continue;
    }

    output.push(line);
    i++;
  }

  return output.join('\n');
}
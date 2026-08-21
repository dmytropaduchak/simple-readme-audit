export type Severity = "high" | "medium" | "low";
export type Finding = {
  ruleId: string;
  severity: Severity;
  title: string;
  detail: string;
  file: string;
  line?: number;
};

export function parseDiffHunks(diff: string): Array<{ file: string; line: number; text: string }> {
  const out: Array<{ file: string; line: number; text: string }> = [];
  let file = "unknown";
  let newLine = 0;
  for (const raw of diff.split(/\r?\n/)) {
    if (raw.startsWith("+++ b/")) {
      file = raw.slice(6).trim() || "unknown";
      continue;
    }
    if (raw.startsWith("@@")) {
      const m = raw.match(/\+(\d+)/);
      newLine = m ? Number(m[1]) : 0;
      continue;
    }
    if (raw.startsWith("+") && !raw.startsWith("+++")) {
      out.push({ file, line: newLine, text: raw.slice(1) });
      newLine += 1;
      continue;
    }
    if (raw.startsWith("-") && !raw.startsWith("---")) continue;
    if (!raw.startsWith("\\") && !raw.startsWith("diff ") && !raw.startsWith("index ")) {
      newLine += 1;
    }
  }
  return out;
}

export function changedFiles(diff: string): string[] {
  const files = new Set<string>();
  for (const line of diff.split(/\r?\n/)) {
    if (!line.startsWith("+++ b/")) continue;
    const file = line.slice(6).trim();
    if (file && file !== "/dev/null") files.add(file);
  }
  return [...files];
}

const CODE = /\.(ts|tsx|js|jsx|mjs|cjs|py|go|rs|java|kt|rb|php|cs|swift)$/i;
const VERSION = /(^|\/)(package\.json|Cargo\.toml|pyproject\.toml|composer\.json|go\.mod)$/i;
const README = /(^|\/)README(\.[^/]+)?$/i;

export function scan(diff: string): Finding[] {
  const files = changedFiles(diff);
  const codeOrVersion = files.filter((f) => CODE.test(f) || VERSION.test(f));
  const readmeChanged = files.some((f) => README.test(f));
  if (!codeOrVersion.length || readmeChanged) return [];
  return [{
    ruleId: "readme-stale",
    severity: "low",
    title: "Code/version files changed without README update",
    detail: `Changed: ${codeOrVersion.slice(0, 8).join(", ")}${codeOrVersion.length > 8 ? "…" : ""}`,
    file: "README.md",
  }];
}

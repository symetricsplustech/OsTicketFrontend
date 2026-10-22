export type ClassValue =
  string | number | false | null | undefined | ClassValue[];

export function cn(...values: ClassValue[]): string {
  const parts: string[] = [];
  for (const value of values) {
    if (!value) continue;
    if (Array.isArray(value)) {
      parts.push(cn(...value));
    } else {
      parts.push(String(value));
    }
  }
  return parts.join(" ").trim();
}

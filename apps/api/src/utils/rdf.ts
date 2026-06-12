export function turtleLiteral(value: string): string {
  return `"${value
    .replaceAll("\\", "\\\\")
    .replaceAll("\"", "\\\"")
    .replaceAll("\r", "\\r")
    .replaceAll("\n", "\\n")}"`;
}

export function resourceLocalName(...parts: string[]): string {
  return parts
    .join("-")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function splitMultiValue(value: string): string[] {
  return [...new Set(
    value
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean)
  )];
}

export function typedLiteral(value: string, datatype: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return `${turtleLiteral(trimmed)}^^${datatype}`;
}

export default function isArrayOfStrings(value: unknown): value is string[] {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((item) => typeof item === "string");
}

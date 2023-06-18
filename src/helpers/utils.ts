export function isArrayOfStrings(value: unknown): value is string[] {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((item) => typeof item === "string");
}

export interface JwtToken {
  user: {
    userId: string;
    email: string;
    fullname: string;
  };
  usage: string;
}

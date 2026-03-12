export const parsePlatformQuery = (platform: unknown): string[] => {
  if (platform === undefined || platform === null) {
    return ["youtube"];
  }
  const arr = Array.isArray(platform) ? platform : [platform];
  return arr.flatMap((p) =>
    typeof p === "string"
      ? p.split(",").map((s) => s.trim().toLowerCase())
      : [],
  );
};

const getFirstAlphanumericCharacter = (word: string): string =>
  word.match(/[\p{L}\p{N}]/u)?.[0] ?? "";

export const getProfileInitials = (name: string): string | undefined => {
  const words: string[] = name.trim().split(/\s+/u).slice(0, 2);
  const initials: string = words
    .map((word: string): string => getFirstAlphanumericCharacter(word))
    .join("")
    .toUpperCase();

  return initials || undefined;
};

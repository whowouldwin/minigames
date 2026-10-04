export const getInitials = (name: string): string => {
  const parts = name.split(/[\s_-]+/).filter(Boolean);

  if (parts.length > 1) {
    const firstLetter = parts[0][0];
    const secondLetter = parts[1][0];

    return (firstLetter + secondLetter).toUpperCase();
  }

  const firstPart = parts[0] ?? "?";
  return firstPart.slice(0, 2).toUpperCase();
};

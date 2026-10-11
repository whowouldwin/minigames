const compactCountFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const formatCompactCount = (count: number): string =>
  compactCountFormatter.format(count);

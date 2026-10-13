export const PROJECT_PALETTES = [
  {
    label: "Deep Ocean (Indigo)",
    value: "linear-gradient(135deg, #0d1b2a 0%, #1b263b 40%, #415a77 100%)",
    accent: "#38bdf8",
  },
  {
    label: "Emerald Forest (Green)",
    value: "linear-gradient(135deg, #062419 0%, #0d402b 40%, #15803d 100%)",
    accent: "#34d399",
  },
  {
    label: "Midnight Obsidian (Dark Violet)",
    value: "linear-gradient(135deg, #182848 0%, #293859 50%, #4b6cb7 100%)",
    accent: "#6366f1",
  },
  {
    label: "Crimson Nebula (Ruby)",
    value: "linear-gradient(135deg, #2b0b14 0%, #4c1122 50%, #9f1239 100%)",
    accent: "#f43f5e",
  },
  {
    label: "Sunset Amber (Warm Gold)",
    value: "linear-gradient(135deg, #2e1605 0%, #4a2800 50%, #b45309 100%)",
    accent: "#f59e0b",
  },
] as const;

export function getProjectPalette(index: number) {
  return PROJECT_PALETTES[index % PROJECT_PALETTES.length];
}

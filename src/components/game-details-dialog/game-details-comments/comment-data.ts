export type CommentAvatarTone = "blue" | "neutral";

export interface GameComment {
  author: string;
  initial: string;
  avatarTone?: CommentAvatarTone;
  date: string;
  text: string;
  compactText?: string;
  likes: number;
  initiallyLiked?: boolean;
}

export const gameDetailsComments: readonly GameComment[] = [
  {
    author: "ForestDweller",
    initial: "F",
    avatarTone: "blue",
    date: "3 hours ago",
    text: "The hand-drawn art is absolutely magical 🍄 Every location feels like a page from a children's storybook. The mushroom village made me cry happy tears!",
    likes: 12,
  },
  {
    author: "HerbalTeaLover",
    initial: "H",
    date: "1 day ago",
    text: "Perfect cozy evening game — brew a cup of chamomile, wrap in a blanket and help the little Tukoni prepare for winter. The puzzles are gentle but satisfying.",
    compactText:
      "Great for relaxing after work. Would love to see more tile themes added!",
    likes: 5,
  },
  {
    author: "CottageCoreMia",
    initial: "C",
    avatarTone: "neutral",
    date: "3 days ago",
    text: "I want to live inside this game forever 🌿 The NPCs are so charming, the tea recipes are real, and the atmosphere is pure warmth and calm.",
    likes: 8,
    initiallyLiked: true,
  },
];

import catMailCoImage from "../../assets/images/games/library/cat-mail-co.jpg";
import heartopiaImage from "../../assets/images/games/library/heartopia.jpg";
import paliaImage from "../../assets/images/games/library/palia.jpg";
import shelveThePotionsImage from "../../assets/images/games/library/shelve-the-potions.jpg";
import vacationCafeImage from "../../assets/images/games/library/vacation-cafe.jpg";
import winterBurrowImage from "../../assets/images/games/library/winter-burrow.jpg";

import type { LibraryGame } from "../library-game-card";

export const libraryGames: readonly LibraryGame[] = [
  {
    title: "Vacation Cafe Simulator",
    category: "Strategy",
    price: "Free",
    description:
      "Cozy Italian Vacation Cafe 🏖️ No timers, No stress 😌 cook traditional dishes 🍝 upgrade and customize 🏠 just drink Prosecco 🥂 relax and grow your dream cafe ✨",
    rating: "4.8",
    likes: "28.7K",
    image: vacationCafeImage,
  },
  {
    title: "Winter Burrow",
    category: "Farm",
    price: "Free",
    description:
      "A cozy woodland survival game about a mouse restoring their childhood burrow. Explore, gather resources, craft, knit warm sweaters, bake pies and meet the locals.",
    rating: "4.9",
    likes: "32.4K",
    image: winterBurrowImage,
  },
  {
    title: "Shelve the Potions!",
    category: "Puzzle",
    price: "Free",
    description:
      "Organize 2000+ potions on shelves after the witch's cats have knocked them over, using clues around an enchanted cellar. Learn strange symbols and decipher cryptic notes.",
    rating: "4.7",
    likes: "21.3K",
    image: shelveThePotionsImage,
  },
  {
    title: "Heartopia",
    category: "Strategy",
    price: "$1.99",
    description:
      "A multiplayer life simulation game crafted for creativity, freedom, and peace. Build your dream home, explore hobbies, and forge warm connections with friends in a cozy town.",
    rating: "4.6",
    likes: "46.8K",
    image: heartopiaImage,
  },
  {
    title: "Palia",
    category: "Strategy",
    price: "Free",
    description:
      "A free-to-play fantasy life sim adventure where you can craft, explore, and create the life and home of your dreams in a vibrant, heartwarming world.",
    rating: "4.8",
    likes: "89.5K",
    image: paliaImage,
  },
  {
    title: "Cat Mail Co.",
    category: "Puzzle",
    price: "Free",
    description:
      "Run a cozy cat post office. Sort and deliver parcels from the daily boat. At night, the moon reveals hidden truths about packages. Clear a strange backlog and unlock new destinations.",
    rating: "4.9",
    likes: "38.2K",
    image: catMailCoImage,
  },
];

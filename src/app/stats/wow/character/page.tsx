import type { Metadata } from "next";

import CharacterSearch from "./CharacterSearch";

export const metadata: Metadata = {
  title: "Personnage WoW",
  description: "Recherchez un personnage World of Warcraft par royaume et nom.",
};

export default function CharacterPage() {
  return <CharacterSearch />;
}

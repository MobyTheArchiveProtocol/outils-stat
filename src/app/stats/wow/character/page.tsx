import type { Metadata } from "next";

import CharacterSearch from "./CharacterSearch";

export const metadata: Metadata = {
  title: "Personnage WoW",
  description: "Recherchez un personnage World of Warcraft par royaume et nom.",
};

export default function CharacterPage() {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <CharacterSearch />
    </div>
  );
}

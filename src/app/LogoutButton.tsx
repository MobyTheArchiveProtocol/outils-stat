"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/auth/callback", { method: "DELETE" });
        router.refresh();
      }}
      className="text-[var(--text-soft)] transition-colors hover:text-[var(--gold-bright)]"
    >
      Déconnexion
    </button>
  );
}

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
      className="transition-colors hover:text-[var(--foreground)] text-[var(--muted)]"
    >
      Déconnexion
    </button>
  );
}

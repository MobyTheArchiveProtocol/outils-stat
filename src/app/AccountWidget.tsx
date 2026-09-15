import { cookies } from "next/headers";
import Link from "next/link";

import {
  decodeSessionCookie,
  isUserOAuthConfigured,
  SESSION_COOKIE,
} from "@/lib/blizzard/oauth";
import LogoutButton from "./LogoutButton";

export default async function AccountWidget() {
  const configured = isUserOAuthConfigured();
  const jar = await cookies();
  const session = decodeSessionCookie(jar.get(SESSION_COOKIE)?.value);

  if (!configured) return null;

  if (session) {
    return (
      <span className="flex items-center gap-3 text-xs">
        <span className="text-[var(--muted)]">
          Battle.net · {session.region.toUpperCase()}
        </span>
        <LogoutButton />
      </span>
    );
  }

  return (
    <Link
      href="/api/auth/login"
      className="text-xs transition-colors hover:text-[var(--gold-bright)] text-[var(--muted)]"
    >
      Se connecter (Battle.net)
    </Link>
  );
}

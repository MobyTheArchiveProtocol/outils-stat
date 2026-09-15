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
      <span className="wax">
        <span className="text-[var(--gold-leaf)]/70">Battle.net · {session.region.toUpperCase()}</span>
        <LogoutButton />
      </span>
    );
  }

  return (
    <Link href="/api/auth/login" className="wax-link">
      Sceau Battle.net
    </Link>
  );
}

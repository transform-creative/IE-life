import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { PillNav } from "./PillNav";

export interface AppShellProps {
  children: ReactNode;
  session: Session | null;
}

/******************************
 * AppShell
 * The frame every screen sits in. Base styles are the phone layout; `.app-shell`
 * only becomes a centred column once there is room for one (see app.css).
 *
 * A screen that wants two columns on a wide monitor renders a `.split` and the
 * shell widens to fit it — so there is no prop to keep in sync here.
 *
 * The nav is hidden when signed out so the authentication screen renders clean.
 */
export function AppShell({
  children,
  session,
}: AppShellProps) {
  return (
    <>
      <main className="app-shell">
        {children}
      </main>
      {session && <PillNav session={session} />}
    </>
  );
}

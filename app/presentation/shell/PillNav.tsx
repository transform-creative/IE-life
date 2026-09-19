import { Link, useLocation } from "react-router";
import IonIcon from "@reacticons/ionicons";
import type { Session } from "@supabase/supabase-js";

export interface PillNavProps {
  session: Session | null;
}

/******************************
 * PillNav
 * The floating black pill at the bottom of every signed-in screen: home, meals,
 * and an avatar linking to the account page. Fixed rather than sticky so it
 * survives a long scrolling meal list, and `.safe-bottom` keeps it clear of the
 * iOS home indicator.
 */
export function PillNav({
  session,
}: PillNavProps) {
  const { pathname } = useLocation();

  /** Initials for the avatar — "Isaac Drury" style from the email local part. */
  const initials = (session?.user?.email ?? "?")
    .split("@")[0]
    .split(/[._-]/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <nav
      className="fixed safe-bottom"
      style={{
        bottom: 12,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9,
        width: "min(92vw, 420px)",
      }}
    >
      <div
        className="row middle between"
        style={{
          background: "var(--txt)",
          borderRadius: "var(--border-pill)",
          padding: "10px 16px",
          boxShadow: "0 6px 24px #00000026",
        }}
      >
        <div className="row middle gap-10">
          <NavPillLink
            to="/"
            icon="home-outline"
            label="Home"
            active={pathname === "/"}
          />
          <NavPillLink
            to="/shopping"
            icon="restaurant-outline"
            label="Meals"
            active={pathname.startsWith(
              "/shopping",
            )}
          />
        </div>

        <Link
          to="/account"
          aria-label="Account"
          className="center middle"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "var(--secondary)",
            textDecoration: "none",
            display: "flex",
          }}
        >
          <h3 style={{ fontWeight: 800 }}>
            {initials}
          </h3>
        </Link>
      </div>
    </nav>
  );
}

interface NavPillLinkProps {
  to: string;
  icon: "home-outline" | "restaurant-outline";
  label: string;
  active: boolean;
}

/******************************
 * NavPillLink
 * One icon in the pill. The label is present for screen readers only — the
 * design is icon-only, but an unlabelled link is unusable without sight.
 */
function NavPillLink({
  to,
  icon,
  label,
  active,
}: NavPillLinkProps) {
  return (
    <Link
      to={to}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className="center middle tap"
      style={{
        display: "flex",
        width: 44,
        height: 44,
        borderRadius: "50%",
        textDecoration: "none",
        background: active
          ? "#ffffff24"
          : "transparent",
      }}
    >
      <IonIcon
        name={icon}
        style={{
          color: "var(--bkg)",
          fontSize: 24,
        }}
      />
    </Link>
  );
}

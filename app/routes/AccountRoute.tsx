import { useOutletContext } from "react-router";
import type { SharedContextProps } from "~/data/CommonTypes";
import { RequireAuth } from "~/presentation/shell/RequireAuth";
import { supabaseSignOut } from "~/database/Auth";

export function meta() {
  return [{ title: "Account · IE Life" }];
}

export default function AccountRoute() {
  const context: SharedContextProps =
    useOutletContext();

  return (
    <RequireAuth context={context}>
      <div className="col gap-20">
        <h2>Account</h2>
        <div
          className="card-lavender"
          style={{ padding: "var(--space-20)" }}
        >
          <p
            style={{ color: "var(--accent-lg)" }}
          >
            Signed in as
          </p>
          <h4 className="mt-5">
            {context.session?.user?.email}
          </h4>
        </div>

        <button
          type="button"
          className="outline tap"
          style={{ background: "none" }}
          onClick={async () => {
            await supabaseSignOut();
            context.navigate("/authentication");
          }}
        >
          Sign out
        </button>
      </div>
    </RequireAuth>
  );
}

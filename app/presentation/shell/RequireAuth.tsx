import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { Loading } from "~/presentation/elements/Loading";
import type { SharedContextProps } from "~/data/CommonTypes";

export interface RequireAuthProps {
  context: SharedContextProps;
  children: ReactNode;
}

/******************************
 * RequireAuth
 * Gate a screen behind a signed-in session.
 *
 * The session arrives asynchronously from `onAuthStateChange`, so `session`
 * is null for a moment on every load. Redirecting on that null would bounce a
 * signed-in user to the login screen on every refresh — hence `sessionReady`,
 * which root.tsx sets once the first auth event has landed.
 */
export function RequireAuth({
  context,
  children,
}: RequireAuthProps) {
  if (!context.sessionReady)
    return <Loading loadingText="" />;

  if (!context.session)
    return (
      <Navigate to="/authentication" replace />
    );

  return <>{children}</>;
}

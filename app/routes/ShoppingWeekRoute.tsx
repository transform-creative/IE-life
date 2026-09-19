import { useOutletContext } from "react-router";
import type { SharedContextProps } from "~/data/CommonTypes";
import { RequireAuth } from "~/presentation/shell/RequireAuth";
import { WeekSelectorScreen } from "~/presentation/shopping/WeekSelectorScreen";

export function meta() {
  return [{ title: "Select meals · IE Life" }];
}

export default function ShoppingWeekRoute() {
  const context: SharedContextProps =
    useOutletContext();

  return (
    <RequireAuth context={context}>
      <WeekSelectorScreen />
    </RequireAuth>
  );
}

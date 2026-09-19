import { useOutletContext } from "react-router";
import type { SharedContextProps } from "~/data/CommonTypes";
import { RequireAuth } from "~/presentation/shell/RequireAuth";
import { MealListScreen } from "~/presentation/shopping/MealListScreen";

export function meta() {
  return [{ title: "Meals · IE Life" }];
}

export default function ShoppingRoute() {
  const context: SharedContextProps =
    useOutletContext();

  return (
    <RequireAuth context={context}>
      <MealListScreen />
    </RequireAuth>
  );
}

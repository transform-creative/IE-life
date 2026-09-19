import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Link,
  useOutletContext,
} from "react-router";
import IonIcon from "@reacticons/ionicons";
import type { SharedContextProps } from "~/data/CommonTypes";
import type { Meal } from "~/data/CustomTypes";
import { fetchMeals } from "~/database/shopping/Fetch";
import { formatPrepTime } from "./ShoppingBL";
import { pickImage } from "./ShoppingImages";
import {
  MealEditModal,
  type MealEditMode,
} from "./MealEditModal";

export interface MealListScreenProps {}

/******************************
 * MealListScreen
 * Every meal, with an edit pencil on each. Editing here changes the meal
 * itself — the week page has its own week-only edit.
 *
 * The list is filtered in the browser: the ceiling is ~200 meals, so a round
 * trip per keystroke would be slower and more complex for no benefit.
 */
export function MealListScreen({}: MealListScreenProps) {
  const context: SharedContextProps =
    useOutletContext();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{
    mode: MealEditMode;
    mealId: string | null;
  } | null>(null);

  async function load() {
    try {
      setMeals(await fetchMeals());
    } catch {
      context.popAlert(
        "Could not load meals",
        "Please try again.",
        true,
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // `load` only sets state after awaiting the fetch, so there is no cascading
    // render here — the rule just can't see through the async boundary.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return meals;
    return meals.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.cuisine ?? "")
          .toLowerCase()
          .includes(q),
    );
  }, [meals, filter]);

  return (
    <div className="col gap-10">
      <div
        className="hero-card"
        style={{ minHeight: 200 }}
      >
        {pickImage("meal-list") && (
          <img
            src={pickImage("meal-list")!}
            alt=""
          />
        )}

        <div
          className="row gap-10 between"
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            zIndex: 2,
          }}
        >
          <Link
            to="/shopping/week"
            className="row middle center gap-5 tap"
            style={{
              background: "var(--accent)",
              color: "var(--bkg)",
              borderRadius: "var(--border-pill)",
              padding: "10px 18px",
              textDecoration: "none",
              fontWeight: 700,
              flex: 1,
            }}
          >
            Meal selector
            <IonIcon name="arrow-forward-circle" />
          </Link>

          <button
            type="button"
            className="tap"
            style={{
              background: "var(--bkg)",
              borderRadius: "var(--border-pill)",
              padding: "10px 18px",
              fontWeight: 700,
            }}
            onClick={() =>
              setEditing({
                mode: "create",
                mealId: null,
              })
            }
          >
            + Meal
          </button>
        </div>

        <h5 className="hero-title">Meal list</h5>
      </div>

      <input
        aria-label="Filter meals"
        placeholder="Search meals…"
        className="outline"
        value={filter}
        onChange={(e) =>
          setFilter(e.target.value)
        }
      />

      {loading ? (
        <div className="col gap-10">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{
                height: 52,
                borderRadius:
                  "var(--border-pill)",
              }}
            />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <p className="mt-20 center">
          No meals match “{filter}”.
        </p>
      ) : (
        <div className="grid-250">
          {visible.map((meal) => (
            <div
              key={meal.id}
              className="pill-row"
            >
              <div className="col">
                <h4>{meal.name}</h4>
                {formatPrepTime(
                  meal.prep_minutes,
                ) && (
                  <p
                    style={{
                      color: "var(--accent-lg)",
                    }}
                  >
                    {formatPrepTime(
                      meal.prep_minutes,
                    )}
                  </p>
                )}
              </div>

              <div
                role="button"
                tabIndex={0}
                aria-label={`Edit ${meal.name}`}
                className="clickable center middle tap"
                style={{ display: "flex" }}
                onClick={() =>
                  setEditing({
                    mode: "edit",
                    mealId: meal.id,
                  })
                }
              >
                <IonIcon name="pencil-outline" />
              </div>
            </div>
          ))}
        </div>
      )}

      <MealEditModal
        active={editing !== null}
        onClose={() => setEditing(null)}
        mode={editing?.mode ?? "create"}
        mealId={editing?.mealId}
        onSaved={load}
      />
    </div>
  );
}

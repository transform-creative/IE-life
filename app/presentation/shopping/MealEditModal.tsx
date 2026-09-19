import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import IonIcon from "@reacticons/ionicons";
import { PopUpModal } from "~/presentation/elements/PopUpModal";
import { LabelInput } from "~/presentation/elements/LabelInput/LabelInput";
import { CreatableTypeInput } from "~/presentation/elements/TypeInput";
import type {
  ActivatableElement,
  SharedContextProps,
} from "~/data/CommonTypes";
import type {
  Ingredient,
  RecipeLine,
} from "~/data/CustomTypes";
import {
  fetchIngredients,
  fetchMealWithLines,
} from "~/database/shopping/Fetch";
import {
  ensureIngredient,
  insertMeal,
} from "~/database/shopping/Insert";
import {
  replaceMealLines,
  replaceWeekDayOverrides,
  updateMeal,
  type EditableLine,
} from "~/database/shopping/Update";

/**
 * `create`         — a brand new meal.
 * `edit`           — change the meal itself, everywhere it is ever planned.
 * `week-override`  — change the ingredients for ONE planned day, leaving the
 *                    meal untouched.
 */
export type MealEditMode =
  | "create"
  | "edit"
  | "week-override";

export interface MealEditModalProps extends ActivatableElement {
  mode: MealEditMode;
  mealId?: string | null;
  /** Required in `week-override` — the day row the override attaches to. */
  weekPlanDayId?: string | null;
  /** In `week-override`, the lines currently in effect for that day. */
  initialLines?: RecipeLine[];
  onSaved: () => void;
}

interface EditRow {
  key: string;
  ingredientId: string | null;
  quantity: string;
  unit: string;
}

let rowSeq = 0;
function blankRow(): EditRow {
  return {
    key: `row-${rowSeq++}`,
    ingredientId: null,
    quantity: "",
    unit: "",
  };
}

/******************************
 * MealEditModal
 * Create a meal, edit a meal, or override one planned day's ingredients —
 * the same form in three modes, because they only differ in what Save writes.
 */
export function MealEditModal({
  active,
  onClose,
  mode,
  mealId,
  weekPlanDayId,
  initialLines,
  onSaved,
}: MealEditModalProps) {
  const context: SharedContextProps =
    useOutletContext();

  const [name, setName] = useState("");
  const [prepMinutes, setPrepMinutes] =
    useState("");
  const [cuisine, setCuisine] = useState("");
  const [recipeUrl, setRecipeUrl] = useState("");
  const [recipeNote, setRecipeNote] =
    useState("");
  const [rows, setRows] = useState<EditRow[]>([]);
  const [ingredients, setIngredients] = useState<
    Ingredient[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<
    string | null
  >(null);

  const isOverride = mode === "week-override";

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const list = await fetchIngredients();
        if (cancelled) return;
        setIngredients(list);

        if (mode === "create" || !mealId) {
          setName("");
          setPrepMinutes("");
          setCuisine("");
          setRecipeUrl("");
          setRecipeNote("");
          setRows([blankRow()]);
          return;
        }

        const meal =
          await fetchMealWithLines(mealId);
        if (cancelled || !meal) return;

        setName(meal.name);
        setPrepMinutes(
          meal.prep_minutes
            ? String(meal.prep_minutes)
            : "",
        );
        setCuisine(meal.cuisine ?? "");
        setRecipeUrl(meal.recipe_url ?? "");
        setRecipeNote(meal.recipe_note ?? "");

        // In override mode the day's effective lines win — they may already be
        // an override rather than the meal's own recipe.
        const source =
          isOverride && initialLines
            ? initialLines
            : meal.lines;

        setRows(
          source.length > 0
            ? source.map((l) => ({
                key: `row-${rowSeq++}`,
                ingredientId: l.ingredient_id,
                quantity: String(l.quantity),
                unit: l.unit ?? "",
              }))
            : [blankRow()],
        );
      } catch {
        if (!cancelled)
          setError("Could not load this meal.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, mode, mealId]);

  const ingredientOptions = ingredients.map(
    (i) => ({ value: i.id, label: i.name }),
  );

  function updateRow(
    key: string,
    patch: Partial<EditRow>,
  ) {
    setRows((prev) =>
      prev.map((r) =>
        r.key === key ? { ...r, ...patch } : r,
      ),
    );
  }

  /** Create the ingredient immediately so the row has a real id to hold. */
  async function handleCreateIngredient(
    key: string,
    rawName: string,
  ) {
    try {
      const created =
        await ensureIngredient(rawName);
      setIngredients((prev) =>
        prev.some((i) => i.id === created.id)
          ? prev
          : [...prev, created].sort((a, b) =>
              a.name.localeCompare(b.name),
            ),
      );
      updateRow(key, {
        ingredientId: created.id,
        unit: created.default_unit ?? "",
      });
    } catch {
      setError(
        `Could not add "${rawName}" as an ingredient.`,
      );
    }
  }

  /** Rows that are actually fillable — an ingredient and a positive quantity. */
  function collectLines(): EditableLine[] {
    return rows
      .filter(
        (r) =>
          r.ingredientId &&
          Number(r.quantity) > 0,
      )
      .map((r) => ({
        ingredient_id: r.ingredientId!,
        quantity: Number(r.quantity),
        unit: r.unit.trim() || null,
      }));
  }

  async function handleSave() {
    if (!isOverride && !name.trim()) {
      setError("Give the meal a name.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const lines = collectLines();

      if (isOverride) {
        if (!weekPlanDayId)
          throw new Error(
            "missing week plan day",
          );
        await replaceWeekDayOverrides(
          weekPlanDayId,
          lines,
        );
        context.popAlert(
          "Updated for this week",
          `${name} keeps its usual recipe everywhere else.`,
        );
      } else {
        const details = {
          name: name.trim(),
          prep_minutes: prepMinutes
            ? Number(prepMinutes)
            : null,
          cuisine: cuisine.trim() || null,
          recipe_url: recipeUrl.trim() || null,
          recipe_note: recipeNote.trim() || null,
        };

        const id =
          mode === "create"
            ? (await insertMeal(details)).id
            : (await updateMeal(mealId!, details))
                .id;

        await replaceMealLines(id, lines);
        context.popAlert(
          mode === "create"
            ? "Meal added"
            : "Meal updated",
        );
      }

      onSaved();
      onClose();
    } catch (e: any) {
      setError(
        e?.code === "23505"
          ? "There is already a meal with that name."
          : "Could not save. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <PopUpModal
      active={active}
      onClose={onClose}
      width={context?.inShrink ? "94%" : "560px"}
    >
      <div
        style={{
          maxHeight: "70dvh",
          overflowY: "auto",
        }}
      >
        <h2 className="mb-10">
          {mode === "create"
            ? "New meal"
            : isOverride
              ? name || "Edit for this week"
              : "Edit meal"}
        </h2>

        {isOverride && (
          <div className="card-cream p-10 mb-20">
            <p>
              Changes here apply to this week
              only. The meal keeps its usual
              ingredients everywhere else.
            </p>
          </div>
        )}

        {loading ? (
          <p>Loading…</p>
        ) : (
          <>
            {!isOverride && (
              <div className="col gap-10 mb-20">
                <LabelInput
                  name="Name"
                  value={name}
                  outline
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                />
                <div className="md-row gap-10">
                  <LabelInput
                    name="Minutes"
                    type="number"
                    value={prepMinutes}
                    outline
                    onChange={(e) =>
                      setPrepMinutes(
                        e.target.value,
                      )
                    }
                  />
                  <LabelInput
                    name="Cuisine"
                    value={cuisine}
                    outline
                    onChange={(e) =>
                      setCuisine(e.target.value)
                    }
                  />
                </div>
                <LabelInput
                  name="Recipe link"
                  value={recipeUrl}
                  outline
                  placeholder="https://…"
                  onChange={(e) =>
                    setRecipeUrl(e.target.value)
                  }
                />
                <LabelInput
                  name="Recipe note"
                  value={recipeNote}
                  outline
                  placeholder="pg. 190"
                  onChange={(e) =>
                    setRecipeNote(e.target.value)
                  }
                />
              </div>
            )}

            <h3 className="mb-10">Ingredients</h3>

            <div className="col gap-10">
              {rows.map((row) => (
                <div
                  key={row.key}
                  className="row gap-5 middle"
                >
                  <CreatableTypeInput
                    className="w-100"
                    options={ingredientOptions}
                    value={row.ingredientId}
                    placeholder="Ingredient"
                    onChange={(e) => {
                      const picked =
                        ingredients.find(
                          (i) =>
                            i.id ===
                            e.target.value,
                        );
                      updateRow(row.key, {
                        ingredientId:
                          e.target.value,
                        unit:
                          row.unit ||
                          picked?.default_unit ||
                          "",
                      });
                    }}
                    onInputChange={() => {}}
                    onCreate={(val) =>
                      handleCreateIngredient(
                        row.key,
                        val,
                      )
                    }
                  />
                  <input
                    aria-label="Quantity"
                    type="number"
                    step="0.25"
                    min="0"
                    value={row.quantity}
                    className="outline"
                    style={{ width: 80 }}
                    onChange={(e) =>
                      updateRow(row.key, {
                        quantity: e.target.value,
                      })
                    }
                  />
                  <input
                    aria-label="Unit"
                    value={row.unit}
                    className="outline"
                    placeholder="unit"
                    style={{ width: 80 }}
                    onChange={(e) =>
                      updateRow(row.key, {
                        unit: e.target.value,
                      })
                    }
                  />
                  <div
                    role="button"
                    aria-label="Remove ingredient"
                    tabIndex={0}
                    className="clickable center middle tap"
                    style={{ display: "flex" }}
                    onClick={() =>
                      setRows((prev) =>
                        prev.filter(
                          (r) =>
                            r.key !== row.key,
                        ),
                      )
                    }
                  >
                    <IonIcon name="close" />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="outline mt-10"
              style={{ background: "none" }}
              onClick={() =>
                setRows((prev) => [
                  ...prev,
                  blankRow(),
                ])
              }
            >
              + Add ingredient
            </button>

            {error && (
              <p
                className="mt-10"
                style={{
                  color: "var(--danger)",
                }}
              >
                {error}
              </p>
            )}

            <div className="row gap-10 mt-20">
              <button
                type="button"
                className="accent w-100 tap"
                disabled={saving}
                onClick={handleSave}
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                className="outline w-100 tap"
                style={{ background: "none" }}
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </PopUpModal>
  );
}

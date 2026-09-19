import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useOutletContext } from "react-router";
import { DateTime } from "luxon";
import IonIcon from "@reacticons/ionicons";
import type { SharedContextProps } from "~/data/CommonTypes";
import type {
  Meal,
  SlotType,
  WeekDay,
  WeekTemplate,
} from "~/data/CustomTypes";
import { TypeInput } from "~/presentation/elements/TypeInput";
import { Checkbox } from "~/presentation/elements/Checkbox";
import {
  fetchCheckedIngredientIds,
  fetchMeals,
  fetchWeekPlan,
  fetchWeekTemplates,
} from "~/database/shopping/Fetch";
import {
  applyWeekTemplate,
  ensureWeekPlan,
} from "~/database/shopping/Insert";
import {
  setIngredientChecked,
  setWeekDay,
} from "~/database/shopping/Update";
import { clearWeekDay } from "~/database/shopping/Delete";
import {
  aggregateWeekIngredients,
  DAY_LETTERS,
  DAY_NAMES,
  emptyWeekDays,
  formatQuantity,
  getWeekStart,
  mergeDays,
} from "./ShoppingBL";
import { pickImage } from "./ShoppingImages";
import { MealEditModal } from "./MealEditModal";

export interface WeekSelectorScreenProps {}

/** Non-meal options are encoded with a prefix so one picker can serve both. */
const SLOT_PREFIX = "slot:";

/******************************
 * WeekSelectorScreen
 * Pick the week's dinners and work through the ingredients they add up to.
 *
 * The week plan row is created lazily — browsing an empty future week writes
 * nothing until something is actually chosen.
 */
export function WeekSelectorScreen({}: WeekSelectorScreenProps) {
  const context: SharedContextProps =
    useOutletContext();

  const [weekStart, setWeekStart] = useState(
    getWeekStart(),
  );
  const [planId, setPlanId] = useState<
    string | null
  >(null);
  const [days, setDays] = useState<WeekDay[]>(
    emptyWeekDays(),
  );
  const [meals, setMeals] = useState<Meal[]>([]);
  const [templates, setTemplates] = useState<
    WeekTemplate[]
  >([]);
  const [checked, setChecked] = useState<
    Set<string>
  >(new Set());
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingDay, setEditingDay] =
    useState<WeekDay | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const plan = await fetchWeekPlan(weekStart);
      setPlanId(plan?.id ?? null);
      setDays(
        plan
          ? mergeDays(plan.days)
          : emptyWeekDays(),
      );
      setChecked(
        plan
          ? new Set(
              await fetchCheckedIngredientIds(
                plan.id,
              ),
            )
          : new Set(),
      );
    } catch {
      context.popAlert(
        "Could not load this week",
        "Please try again.",
        true,
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  useEffect(() => {
    // Loading the week when `weekStart` changes is what an effect is for. This
    // does set `loading` synchronously, which the rule objects to — but that is
    // one extra render on a deliberate navigation, and the alternative (a
    // loader keyed off the route) is a bigger change than it earns here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    Promise.all([
      fetchMeals(),
      fetchWeekTemplates(),
    ])
      .then(([m, t]) => {
        setMeals(m);
        setTemplates(t);
      })
      .catch(() =>
        context.popAlert(
          "Could not load meals",
          "Please try again.",
          true,
        ),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mealOptions = useMemo(
    () => [
      {
        value: `${SLOT_PREFIX}none`,
        label: "— nothing —",
      },
      {
        value: `${SLOT_PREFIX}takeaway`,
        label: "Takeaway",
      },
      {
        value: `${SLOT_PREFIX}leftovers`,
        label: "Leftovers",
      },
      ...meals.map((m) => ({
        value: m.id,
        label: m.name,
      })),
    ],
    [meals],
  );

  const ingredients = useMemo(
    () => aggregateWeekIngredients(days),
    [days],
  );

  const weekDates = useMemo(() => {
    const start = DateTime.fromISO(weekStart);
    return Array.from({ length: 7 }, (_, i) =>
      start.plus({ days: i }),
    );
  }, [weekStart]);

  /** The picker's current value for a day: a meal id or a slot marker. */
  function valueForDay(day: WeekDay): string {
    if (day.slot_type === "meal")
      return day.meal?.id ?? "";
    return `${SLOT_PREFIX}${day.slot_type}`;
  }

  async function handleDayChange(
    dayIndex: number,
    raw: string,
  ) {
    try {
      const id = await ensureWeekPlan(weekStart);
      setPlanId(id);

      if (raw.startsWith(SLOT_PREFIX)) {
        const slot = raw.slice(
          SLOT_PREFIX.length,
        ) as SlotType;
        if (slot === "none") {
          await clearWeekDay(id, dayIndex);
        } else {
          await setWeekDay(
            id,
            dayIndex,
            slot,
            null,
          );
        }
      } else {
        await setWeekDay(
          id,
          dayIndex,
          "meal",
          raw,
        );
      }

      await load();
    } catch {
      context.popAlert(
        "Could not save that",
        "Please try again.",
        true,
      );
    }
  }

  async function handleApplyTemplate(
    templateId: string,
  ) {
    const template = templates.find(
      (t) => t.id === templateId,
    );
    if (!template) return;

    try {
      const id = await ensureWeekPlan(weekStart);
      await applyWeekTemplate(id, template);
      await load();
      context.popAlert(
        `Loaded ${template.name}`,
        "Change any day you like.",
      );
    } catch {
      context.popAlert(
        "Could not load that template",
        "Please try again.",
        true,
      );
    }
  }

  async function handleToggle(
    ingredientId: string,
    next: boolean,
  ) {
    if (!planId) return;

    // Optimistic: ticking things off in an aisle should never feel laggy.
    setChecked((prev) => {
      const copy = new Set(prev);
      if (next) copy.add(ingredientId);
      else copy.delete(ingredientId);
      return copy;
    });

    try {
      await setIngredientChecked(
        planId,
        ingredientId,
        next,
      );
    } catch {
      setChecked((prev) => {
        const copy = new Set(prev);
        if (next) copy.delete(ingredientId);
        else copy.add(ingredientId);
        return copy;
      });
      context.popAlert(
        "Could not save that tick",
        "Please try again.",
        true,
      );
    }
  }

  function shiftWeek(weeks: number) {
    setWeekStart(
      DateTime.fromISO(weekStart)
        .plus({ weeks })
        .toISODate()!,
    );
  }

  const isThisWeek = weekStart === getWeekStart();

  return (
    <div className="col gap-10">
      <div
        className="hero-card"
        style={{ minHeight: 190 }}
      >
        {pickImage(weekStart) && (
          <img
            src={pickImage(weekStart)!}
            alt=""
          />
        )}
        <h5 className="hero-title">
          Select meals
        </h5>
      </div>

      {/* Week stepper — the designs only show the current week, but planning
          almost always happens for the week ahead. */}
      <div className="row between middle">
        <button
          type="button"
          aria-label="Previous week"
          className="outline tap"
          style={{ background: "none" }}
          onClick={() => shiftWeek(-1)}
        >
          <IonIcon name="chevron-back" />
        </button>

        <h3>
          {isThisWeek
            ? "This week"
            : `${weekDates[0].toFormat("d LLL")} – ${weekDates[6].toFormat("d LLL")}`}
        </h3>

        <button
          type="button"
          aria-label="Next week"
          className="outline tap"
          style={{ background: "none" }}
          onClick={() => shiftWeek(1)}
        >
          <IonIcon name="chevron-forward" />
        </button>
      </div>

      {templates.length > 0 && (
        <TypeInput
          options={templates.map((t) => ({
            value: t.id,
            label: t.name,
          }))}
          value={null}
          placeholder="Load a week template…"
          onChange={(e) =>
            handleApplyTemplate(e.target.value)
          }
          onInputChange={() => {}}
        />
      )}

      <div className="split">
        {/* The seven days */}
        <div className="col gap-10">
          {days.map((day, i) => {
            const filled =
              day.slot_type !== "none";
            return (
              <div
                key={i}
                className="row middle gap-10"
              >
                <h4
                  aria-hidden="true"
                  style={{
                    fontWeight: 800,
                    fontSize: "var(--text-h2)",
                    width: 28,
                    textAlign: "center",
                  }}
                >
                  {DAY_LETTERS[i]}
                </h4>

                <div
                  className="w-100"
                  style={{
                    borderRadius:
                      "var(--border-pill)",
                    background: filled
                      ? "var(--lavender-gradient)"
                      : "var(--surface-muted)",
                    padding: 4,
                  }}
                >
                  <TypeInput
                    id={`day-${i}`}
                    options={mealOptions}
                    value={valueForDay(day)}
                    placeholder={DAY_NAMES[i]}
                    onChange={(e) =>
                      handleDayChange(
                        i,
                        e.target.value,
                      )
                    }
                    onInputChange={() => {}}
                  />
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  aria-label={`Edit ${DAY_NAMES[i]}'s ingredients`}
                  className="clickable center middle tap"
                  style={{
                    display: "flex",
                    // Only a planned meal has ingredients to override.
                    visibility:
                      day.slot_type === "meal"
                        ? "visible"
                        : "hidden",
                  }}
                  onClick={() =>
                    setEditingDay(day)
                  }
                >
                  <IonIcon name="pencil-outline" />
                </div>
              </div>
            );
          })}
        </div>

        {/* The week's shopping list */}
        <div
          className="card-cream mt-10"
          style={{ padding: "var(--space-20)" }}
        >
          <button
            type="button"
            aria-expanded={expanded}
            className="tap"
            style={{
              background: "var(--accent-lg)",
              color: "var(--bkg)",
              borderRadius: "50%",
              width: 34,
              height: 34,
              padding: 0,
            }}
            onClick={() => setExpanded((v) => !v)}
          >
            <IonIcon
              name={
                expanded
                  ? "arrow-down"
                  : "arrow-up"
              }
              style={{ color: "var(--bkg)" }}
            />
          </button>

          <h2 className="mt-10">
            <b>
              {ingredients.length} ingredient
              {ingredients.length === 1
                ? ""
                : "s"}
            </b>{" "}
            needed this week
          </h2>

          {expanded && (
            <div
              className="bkg mt-20"
              style={{
                borderRadius: "var(--border-lg)",
                padding: "var(--space-20)",
              }}
            >
              {loading ? (
                <p>Loading…</p>
              ) : ingredients.length === 0 ? (
                <p>
                  Pick some meals and the
                  ingredients will appear here.
                </p>
              ) : (
                <div className="col gap-10">
                  {ingredients.map((row) => {
                    const isChecked = checked.has(
                      row.ingredient_id,
                    );
                    return (
                      <Checkbox
                        key={row.key}
                        checked={isChecked}
                        onChange={(next) =>
                          handleToggle(
                            row.ingredient_id,
                            next,
                          )
                        }
                        label={
                          <p
                            className={
                              isChecked
                                ? "strike"
                                : undefined
                            }
                          >
                            <b>
                              {formatQuantity(
                                row.quantity,
                                row.unit,
                              )}
                            </b>{" "}
                            {row.ingredient_name}
                          </p>
                        }
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <MealEditModal
        active={editingDay !== null}
        onClose={() => setEditingDay(null)}
        mode="week-override"
        mealId={editingDay?.meal?.id ?? null}
        weekPlanDayId={editingDay?.id ?? null}
        initialLines={
          editingDay
            ? editingDay.overrides.length > 0
              ? editingDay.overrides
              : (editingDay.meal?.lines ?? [])
            : []
        }
        onSaved={load}
      />
    </div>
  );
}

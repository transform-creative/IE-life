import { useEffect, useState } from "react";
import {
  Link,
  useOutletContext,
} from "react-router";
import type { SharedContextProps } from "~/data/CommonTypes";
import type { WeekDay } from "~/data/CustomTypes";
import { fetchWeekPlan } from "~/database/shopping/Fetch";
import {
  DAY_LETTERS,
  DAY_NAMES,
  dayIndexOf,
  describeDay,
  emptyWeekDays,
  formatPrepTime,
  getWeekDays,
  getWeekStart,
  mergeDays,
} from "./ShoppingBL";
import { pickImage } from "./ShoppingImages";

export interface HomeScreenProps {}

/******************************
 * HomeScreen
 * Today at a glance: the week strip, a photo for the selected day, and what is
 * for dinner. Selecting a day is local state — there is nothing to navigate to,
 * the whole week is already loaded.
 */
export function HomeScreen({}: HomeScreenProps) {
  const context: SharedContextProps =
    useOutletContext();

  const weekStart = getWeekStart();
  const weekDates = getWeekDays(weekStart);
  const todayIndex = dayIndexOf();

  const [selected, setSelected] =
    useState(todayIndex);
  const [days, setDays] = useState<WeekDay[]>(
    emptyWeekDays(),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchWeekPlan(weekStart)
      .then((plan) => {
        if (cancelled) return;
        setDays(
          plan
            ? mergeDays(plan.days)
            : emptyWeekDays(),
        );
      })
      .catch(() => {
        if (!cancelled)
          context.popAlert(
            "Could not load this week",
            "Please try again.",
            true,
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  const day = days[selected];
  const date = weekDates[selected];
  const mealName = describeDay(day);
  const prep = formatPrepTime(
    day?.meal?.prep_minutes ?? null,
  );
  const image = pickImage(
    date.toISODate() ?? weekStart,
  );

  const dinnerLabel =
    selected === todayIndex
      ? "Tonight's dinner"
      : `${DAY_NAMES[selected]}'s dinner`;

  return (
    <div className="col gap-10">
      {/* Cream panel: the week strip, with the photo tucked inside it. */}
      <div
        className="card-cream"
        style={{ padding: 8, paddingTop: 16 }}
      >
        <div
          className="row between"
          style={{ padding: "0 6px" }}
        >
          {DAY_LETTERS.map((letter, i) => {
            const isSelected = i === selected;
            const isToday = i === todayIndex;
            return (
              <button
                key={i}
                type="button"
                aria-label={`${DAY_NAMES[i]} ${weekDates[i].toFormat("d LLLL")}`}
                aria-current={
                  isSelected ? "date" : undefined
                }
                className="col center tap"
                style={{
                  background: "none",
                  border: "none",
                  padding: "0 4px",
                  color: isSelected
                    ? "var(--accent)"
                    : "var(--txt)",
                }}
                onClick={() => setSelected(i)}
              >
                <h4
                  style={{
                    fontWeight: 800,
                    fontSize: "var(--text-h3)",
                    color: "inherit",
                  }}
                >
                  {letter}
                </h4>
                <p
                  style={{
                    fontWeight: isToday
                      ? 800
                      : 400,
                    color: isSelected
                      ? "var(--accent)"
                      : "var(--accent-lg)",
                  }}
                >
                  {weekDates[i].day}
                </p>
              </button>
            );
          })}
        </div>

        <div
          className="hero-card mt-10"
          style={{ minHeight: 260 }}
        >
          {image && <img src={image} alt="" />}
          <h5 className="hero-title">
            {DAY_NAMES[selected]}
          </h5>
          <p
            style={{
              color: "#ffffff",
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          >
            {date
              .toFormat("LLLL d")
              .toUpperCase()}
          </p>
        </div>
      </div>

      {/* What's for dinner */}
      {loading ? (
        <div
          className="skeleton"
          style={{
            height: 120,
            borderRadius: "var(--border-lg)",
          }}
        />
      ) : mealName ? (
        <div
          className="card-lavender"
          style={{ padding: "var(--space-20)" }}
        >
          <p
            style={{
              color: "var(--accent-lg)",
            }}
          >
            {dinnerLabel}
          </p>
          <h2 className="mt-5">{mealName}</h2>
          {prep && (
            <p
              className="mt-10"
              style={{
                color: "var(--accent-lg)",
              }}
            >
              {prep}
            </p>
          )}
          {day?.meal?.recipe_url && (
            <a
              href={day.meal.recipe_url}
              target="_blank"
              rel="noreferrer"
              className="mt-10"
              style={{
                fontSize: "var(--text-sm)",
              }}
            >
              View the recipe
            </a>
          )}
          {day?.meal?.recipe_note && (
            <p className="mt-10">
              Recipe: {day.meal.recipe_note}
            </p>
          )}
        </div>
      ) : (
        <Link
          to="/shopping/week"
          className="card-lavender clickable"
          style={{
            padding: "var(--space-20)",
            textDecoration: "none",
            display: "block",
          }}
        >
          <p
            style={{ color: "var(--accent-lg)" }}
          >
            {dinnerLabel}
          </p>
          <h2 className="mt-5">
            Nothing planned
          </h2>
          <p className="mt-10">
            Tap to pick this week's meals →
          </p>
        </Link>
      )}
    </div>
  );
}

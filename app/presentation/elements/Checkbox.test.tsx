import { describe, it, expect, vi } from "vitest";
import {
  render,
  screen,
} from "@testing-library/react";
import { Checkbox } from "./Checkbox";

/******************************
 * Checkbox tests
 * Doubles as the baseline smoke test for the React Testing Library setup —
 * if jsdom, the jest-dom matchers or the `~/*` alias break, this fails first.
 */
describe("Checkbox", () => {
  it("renders its label", () => {
    render(
      <Checkbox
        checked={false}
        onChange={() => {}}
        label="Beef mince"
      />,
    );
    expect(
      screen.getByText("Beef mince"),
    ).toBeInTheDocument();
  });

  it("reports the toggled value on click", () => {
    const onChange = vi.fn();
    render(
      <Checkbox
        checked={false}
        onChange={onChange}
        label="Tuna"
      />,
    );

    screen.getByText("Tuna").click();

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("toggles back off when already checked", () => {
    const onChange = vi.fn();
    render(
      <Checkbox
        checked={true}
        onChange={onChange}
        label="Tuna"
      />,
    );

    screen.getByText("Tuna").click();

    expect(onChange).toHaveBeenCalledWith(false);
  });
});

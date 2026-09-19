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

  it("exposes its state to assistive tech", () => {
    const { rerender } = render(
      <Checkbox
        checked={false}
        onChange={() => {}}
        label="Leek"
      />,
    );
    expect(
      screen.getByRole("checkbox"),
    ).toHaveAttribute("aria-checked", "false");

    rerender(
      <Checkbox
        checked={true}
        onChange={() => {}}
        label="Leek"
      />,
    );
    expect(
      screen.getByRole("checkbox"),
    ).toHaveAttribute("aria-checked", "true");
  });

  it("accepts a node label, not just a string", () => {
    render(
      <Checkbox
        checked={false}
        onChange={() => {}}
        label={
          <p>
            <b>500 g</b> beef mince
          </p>
        }
      />,
    );
    expect(
      screen.getByText("500 g"),
    ).toBeInTheDocument();
  });
});

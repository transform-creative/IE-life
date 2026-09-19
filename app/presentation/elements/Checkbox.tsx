import type { ReactNode } from "react";

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  className?: string;
}

/******************************
 * Checkbox component
 * Generic toggle checkbox — an outlined square that fills with `--secondary`
 * when checked. `label` takes a node, not just a string, so callers can mix
 * weights (e.g. a bold quantity beside a plain ingredient name).
 */
export function Checkbox({
  checked,
  onChange,
  label,
  className,
}: CheckboxProps) {
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      className={`row gap-10 middle clickable tap${className ? ` ${className}` : ""}`}
      onClick={() => onChange(!checked)}
      onKeyDown={(e) => {
        if (e.key !== " " && e.key !== "Enter")
          return;
        e.preventDefault();
        onChange(!checked);
      }}
    >
      <div
        style={{
          flex: "0 0 auto",
          width: 26,
          height: 26,
          border: "2px solid var(--txt)",
          borderRadius: 8,
          background: checked
            ? "var(--secondary)"
            : "transparent",
          transition: "0.2s",
        }}
      />
      {label}
    </div>
  );
}

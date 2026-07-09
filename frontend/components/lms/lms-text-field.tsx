import type { InputHTMLAttributes } from "react";

type LmsTextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">;

export function LmsTextField({ label, value, onChange, className, ...props }: LmsTextFieldProps) {
  return (
    <label className="grid gap-1 text-sm">
      {label}
      <input
        {...props}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={[
          "rounded border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
    </label>
  );
}

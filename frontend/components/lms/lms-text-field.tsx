import { TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material";

type LmsTextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  type?: TextFieldProps["type"];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  name?: string;
};

export function LmsTextField({ label, value, onChange, className, ...props }: LmsTextFieldProps) {
  return (
    <TextField
      {...props}
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      fullWidth
      size="small"
      className={className}
    />
  );
}

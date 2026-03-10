interface InputFieldProps {
  label: string;
  unit: string;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export function InputField({ label, unit, value, onChange, disabled }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-heading text-foreground uppercase tracking-wider">
        {label} <span className="text-muted-foreground normal-case">({unit})</span>
      </label>
      <input
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="border border-foreground bg-background px-3 py-2 text-sm font-heading text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40 disabled:cursor-not-allowed"
      />
    </div>
  );
}

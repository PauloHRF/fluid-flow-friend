import { useState } from "react";
import { unitGroups, getDefaultUnit, getConversionFactor } from "@/lib/units";

interface InputFieldProps {
  label: string;
  unit: string;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  error?: string;
  unitGroup?: string;
  onUnitFactorChange?: (factor: number) => void;
}

export function InputField({ label, unit, value, onChange, disabled, error, unitGroup, onUnitFactorChange }: InputFieldProps) {
  const group = unitGroup ? unitGroups[unitGroup] : null;
  const [selectedUnit, setSelectedUnit] = useState(() => unitGroup ? getDefaultUnit(unitGroup) : "");

  const displayUnit = group ? selectedUnit : unit;

  const handleUnitChange = (newUnit: string) => {
    setSelectedUnit(newUnit);
    const factor = getConversionFactor(unitGroup!, newUnit);
    onUnitFactorChange?.(factor);
  };

  const hasMultipleUnits = group && group.options.length > 1;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-heading text-foreground uppercase tracking-wider">
        {label} <span className="text-muted-foreground normal-case">({displayUnit})</span>
      </label>
      <div className={`flex ${hasMultipleUnits ? "" : ""}`}>
        <input
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`flex-1 min-w-0 border bg-background px-3 py-2 text-sm font-heading text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40 disabled:cursor-not-allowed ${
            hasMultipleUnits ? "border-r-0" : ""
          } ${error ? "border-destructive ring-1 ring-destructive" : "border-input"}`}
        />
        {hasMultipleUnits && (
          <select
            value={selectedUnit}
            onChange={(e) => handleUnitChange(e.target.value)}
            disabled={disabled}
            className="border border-input bg-muted px-2 py-2 text-xs font-heading text-foreground focus:border-primary focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {group.options.map((opt) => (
              <option key={opt.label} value={opt.label}>{opt.label}</option>
            ))}
          </select>
        )}
      </div>
      {error && (
        <span className="text-xs text-destructive font-body">{error}</span>
      )}
    </div>
  );
}

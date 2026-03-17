export interface UnitOption {
  label: string;
  factor: number;
}

export interface UnitGroup {
  baseUnit: string;
  options: UnitOption[];
}

export const unitGroups: Record<string, UnitGroup> = {
  length: {
    baseUnit: "m",
    options: [
      { label: "mm", factor: 0.001 },
      { label: "cm", factor: 0.01 },
      { label: "m", factor: 1 },
      { label: "pol", factor: 0.0254 },
    ],
  },
  area: {
    baseUnit: "m²",
    options: [
      { label: "mm²", factor: 1e-6 },
      { label: "cm²", factor: 1e-4 },
      { label: "m²", factor: 1 },
    ],
  },
  volume: {
    baseUnit: "m³",
    options: [
      { label: "cm³", factor: 1e-6 },
      { label: "L", factor: 0.001 },
      { label: "m³", factor: 1 },
    ],
  },
  velocity: {
    baseUnit: "m/s",
    options: [
      { label: "cm/s", factor: 0.01 },
      { label: "m/s", factor: 1 },
      { label: "km/h", factor: 1 / 3.6 },
    ],
  },
  pressure: {
    baseUnit: "Pa",
    options: [
      { label: "Pa", factor: 1 },
      { label: "kPa", factor: 1000 },
      { label: "bar", factor: 1e5 },
      { label: "atm", factor: 101325 },
      { label: "psi", factor: 6894.76 },
      { label: "mmHg", factor: 133.322 },
    ],
  },
  density: {
    baseUnit: "kg/m³",
    options: [
      { label: "kg/m³", factor: 1 },
    ],
  },
  viscosity: {
    baseUnit: "Pa·s",
    options: [
      { label: "Pa·s", factor: 1 },
      { label: "cP", factor: 0.001 },
    ],
  },
  mass: {
    baseUnit: "kg",
    options: [
      { label: "g", factor: 0.001 },
      { label: "kg", factor: 1 },
    ],
  },
};

export function getDefaultUnit(group: string): string {
  const g = unitGroups[group];
  if (!g) return "";
  const base = g.options.find((o) => o.factor === 1);
  return base ? base.label : g.options[0].label;
}

export function getConversionFactor(group: string, unitLabel: string): number {
  const g = unitGroups[group];
  if (!g) return 1;
  const opt = g.options.find((o) => o.label === unitLabel);
  return opt ? opt.factor : 1;
}

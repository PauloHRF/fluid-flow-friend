import { useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { InputField } from "@/components/InputField";
import { ResultBox } from "@/components/ResultBox";
import { StepByStep } from "@/components/StepByStep";

type Field = "P1" | "v1" | "z1" | "P2" | "v2" | "z2" | "hL";

const fieldLabels: Record<Field, { label: string; unit: string }> = {
  P1: { label: "Pressão P₁", unit: "Pa" },
  v1: { label: "Velocidade v₁", unit: "m/s" },
  z1: { label: "Cota z₁", unit: "m" },
  P2: { label: "Pressão P₂", unit: "Pa" },
  v2: { label: "Velocidade v₂", unit: "m/s" },
  z2: { label: "Cota z₂", unit: "m" },
  hL: { label: "Perda de Carga hL", unit: "m" },
};

const allFields: Field[] = ["P1", "v1", "z1", "P2", "v2", "z2", "hL"];

export default function BernoulliPage() {
  const [values, setValues] = useState<Record<Field, string>>({
    P1: "", v1: "", z1: "", P2: "", v2: "", z2: "", hL: "0",
  });
  const [incognita, setIncognita] = useState<Field>("P2");
  const [result, setResult] = useState<{ value: number; label: string; steps: any[] } | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  const g = 9.81;
  const rho = 1000;

  const update = (field: Field, val: string) => setValues((prev) => ({ ...prev, [field]: val }));

  const calculate = () => {
    const nums: Partial<Record<Field, number>> = {};
    for (const f of allFields) {
      if (f === incognita) continue;
      const n = parseFloat(values[f]);
      if (isNaN(n)) return;
      nums[f] = n;
    }

    const P1 = nums.P1!, v1 = nums.v1!, z1 = nums.z1!;
    const P2 = nums.P2!, v2 = nums.v2!, z2 = nums.z2!;
    const hL = nums.hL ?? 0;

    let solved: number;
    const formula = "P₁/(ρg) + v₁²/(2g) + z₁ = P₂/(ρg) + v₂²/(2g) + z₂ + hL";

    const computeLHS = (p1: number, vel1: number, zz1: number) => p1 / (rho * g) + (vel1 ** 2) / (2 * g) + zz1;
    const computeRHS = (p2: number, vel2: number, zz2: number, hl: number) => p2 / (rho * g) + (vel2 ** 2) / (2 * g) + zz2 + hl;

    switch (incognita) {
      case "P1": { const rhs = computeRHS(P2, v2, z2, hL); solved = (rhs - ((v1 ** 2) / (2 * g) + z1)) * rho * g; break; }
      case "v1": { const rhs = computeRHS(P2, v2, z2, hL); const diff = rhs - (P1 / (rho * g) + z1); if (diff < 0) return; solved = Math.sqrt(diff * 2 * g); break; }
      case "z1": { const rhs = computeRHS(P2, v2, z2, hL); solved = rhs - (P1 / (rho * g) + (v1 ** 2) / (2 * g)); break; }
      case "P2": { const lhs = computeLHS(P1, v1, z1); solved = (lhs - ((v2 ** 2) / (2 * g) + z2 + hL)) * rho * g; break; }
      case "v2": { const lhs = computeLHS(P1, v1, z1); const diff = lhs - (P2 / (rho * g) + z2 + hL); if (diff < 0) return; solved = Math.sqrt(diff * 2 * g); break; }
      case "z2": { const lhs = computeLHS(P1, v1, z1); solved = lhs - (P2 / (rho * g) + (v2 ** 2) / (2 * g) + hL); break; }
      case "hL": { const lhs = computeLHS(P1, v1, z1); solved = lhs - (P2 / (rho * g) + (v2 ** 2) / (2 * g) + z2); break; }
      default: return;
    }

    const steps = [
      { label: "Equação de Bernoulli", formula, result: "Com ρ = 1000 kg/m³ e g = 9.81 m/s²" },
      { label: "Valores Conhecidos", result: allFields.filter((f) => f !== incognita).map((f) => `${f} = ${values[f]} ${fieldLabels[f].unit}`).join(" | ") },
      { label: "Incógnita", result: `${incognita} = ?` },
      { label: "Isolando a incógnita", result: `Reorganizando a equação para resolver ${incognita}...` },
      { label: "Resultado", result: `${incognita} = ${solved.toFixed(4)} ${fieldLabels[incognita].unit}` },
    ];

    setResult({ value: solved, label: fieldLabels[incognita].label, steps });
    setShowSteps(false);
  };

  return (
    <CalculatorLayout title="Equação de Bernoulli">
      <div className="mb-4">
        <label className="text-xs font-heading text-foreground uppercase tracking-wider block mb-1">Incógnita (variável a calcular)</label>
        <select value={incognita} onChange={(e) => { setIncognita(e.target.value as Field); setResult(null); }} className="border border-foreground bg-background px-3 py-2 text-sm font-heading text-foreground focus:border-primary focus:outline-none">
          {allFields.map((f) => <option key={f} value={f}>{fieldLabels[f].label}</option>)}
        </select>
      </div>

      <p className="text-xs font-body text-muted-foreground mb-4">ρ = 1000 kg/m³ (água) · g = 9.81 m/s²</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {allFields.map((f) => (
          <InputField key={f} label={fieldLabels[f].label} unit={fieldLabels[f].unit} value={f === incognita ? "" : values[f]} onChange={(val) => update(f, val)} disabled={f === incognita} />
        ))}
      </div>

      <button onClick={calculate} className="bg-primary text-primary-foreground font-heading text-sm uppercase tracking-wider px-8 py-3 border-none cursor-pointer mb-8">Calcular</button>

      {result && (
        <div key={result.value}>
          <ResultBox label={result.label} value={`${result.value.toFixed(4)} ${fieldLabels[incognita].unit}`} />
          <button onClick={() => setShowSteps(!showSteps)} className="border border-foreground bg-background text-foreground font-heading text-sm uppercase tracking-wider px-6 py-2 cursor-pointer mb-4">
            {showSteps ? "Ocultar" : "Mostrar"} Memorial de Cálculo
          </button>
          {showSteps && <StepByStep steps={result.steps} />}
        </div>
      )}
    </CalculatorLayout>
  );
}

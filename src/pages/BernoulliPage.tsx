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
  const [rhoInput, setRhoInput] = useState("1000");
  const [incognita, setIncognita] = useState<Field>("P2");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: number; label: string; steps: any[] } | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  const g = 9.81;

  const update = (field: Field, val: string) => {
    setValues((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const calculate = () => {
    const rho = parseFloat(rhoInput);
    const e: Record<string, string> = {};
    if (isNaN(rho) || rho <= 0) e.rho = "Deve ser > 0";

    const nums: Partial<Record<Field, number>> = {};
    for (const f of allFields) {
      if (f === incognita) continue;
      const n = parseFloat(values[f]);
      if (isNaN(n)) { e[f] = "Campo obrigatório"; continue; }
      nums[f] = n;
    }

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const P1 = nums.P1!, v1 = nums.v1!, z1 = nums.z1!;
    const P2 = nums.P2!, v2 = nums.v2!, z2 = nums.z2!;
    const hL = nums.hL ?? 0;

    let solved: number;

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

    const knownFields = allFields.filter((f) => f !== incognita);

    const fieldLatex: Record<Field, string> = { P1: "P_1", v1: "v_1", z1: "z_1", P2: "P_2", v2: "v_2", z2: "z_2", hL: "h_L" };

    const steps = [
      { label: "Dados de Entrada", type: "info" as const, result: knownFields.map((f) => `${f} = ${values[f]} ${fieldLabels[f].unit}`).join(" | ") },
      { label: "Equação de Bernoulli Generalizada", type: "formula" as const, formula: `\\frac{P_1}{\\rho g} + \\frac{v_1^2}{2g} + z_1 = \\frac{P_2}{\\rho g} + \\frac{v_2^2}{2g} + z_2 + h_L`, result: `Conservação de energia ao longo de uma linha de corrente, com ρ = ${rho} kg/m³ e g = ${g} m/s²` },
      { label: "Identificação da Incógnita", type: "info" as const, result: `Variável a determinar: ${incognita} (${fieldLabels[incognita].label})` },
      { label: "Substituição — Lado Esquerdo (Ponto 1)", type: "substitution" as const, formula: `H_1 = \\frac{P_1}{\\rho g} + \\frac{v_1^2}{2g} + z_1`, substitution: incognita.endsWith("1") ? `\\text{Contém a incógnita } ${fieldLatex[incognita]}` : `\\frac{${values.P1 || "?"}}{${rho} \\times ${g}} + \\frac{${values.v1 || "?"}^2}{2 \\times ${g}} + ${values.z1 || "?"}`, result: incognita.endsWith("1") ? `Contém a incógnita ${incognita}` : `Lado esquerdo com valores conhecidos` },
      { label: "Substituição — Lado Direito (Ponto 2)", type: "substitution" as const, formula: `H_2 = \\frac{P_2}{\\rho g} + \\frac{v_2^2}{2g} + z_2 + h_L`, substitution: incognita.endsWith("2") || incognita === "hL" ? `\\text{Contém a incógnita } ${fieldLatex[incognita]}` : `\\frac{${values.P2 || "?"}}{${rho} \\times ${g}} + \\frac{${values.v2 || "?"}^2}{2 \\times ${g}} + ${values.z2 || "?"} + ${values.hL || "0"}`, result: incognita.endsWith("2") || incognita === "hL" ? `Contém a incógnita ${incognita}` : `Lado direito com valores conhecidos` },
      { label: "Isolamento e Resolução", type: "calculation" as const, formula: `${fieldLatex[incognita]} = \\text{?}`, result: `${incognita} = ${solved.toFixed(4)} ${fieldLabels[incognita].unit}` },
      { label: "Resultado Final", type: "result" as const, result: `${fieldLabels[incognita].label} = ${solved.toFixed(4)} ${fieldLabels[incognita].unit}` },
    ];

    setResult({ value: solved, label: fieldLabels[incognita].label, steps });
    setShowSteps(false);
  };

  return (
    <CalculatorLayout title="Equação de Bernoulli" metaDescription="Resolva a Equação de Bernoulli para qualquer variável: pressão, velocidade, cota ou perda de carga. Memorial de cálculo completo.">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-heading text-foreground uppercase tracking-wider block mb-1">Incógnita (variável a calcular)</label>
          <select value={incognita} onChange={(e) => { setIncognita(e.target.value as Field); setResult(null); }} className="border border-input bg-background px-3 py-2 text-sm font-heading text-foreground focus:border-primary focus:outline-none w-full">
            {allFields.map((f) => <option key={f} value={f}>{fieldLabels[f].label}</option>)}
          </select>
        </div>
        <InputField label="Densidade (ρ)" unit="kg/m³" value={rhoInput} onChange={(v) => { setRhoInput(v); setErrors((e) => ({ ...e, rho: "" })); }} error={errors.rho} />
      </div>

      <p className="text-xs font-body text-muted-foreground mb-4">g = 9.81 m/s²</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {allFields.map((f) => (
          <InputField key={f} label={fieldLabels[f].label} unit={fieldLabels[f].unit} value={f === incognita ? "" : values[f]} onChange={(val) => update(f, val)} disabled={f === incognita} error={errors[f]} />
        ))}
      </div>

      <button onClick={calculate} className="bg-primary text-primary-foreground font-heading text-sm uppercase tracking-wider px-8 py-3 border-none cursor-pointer mb-8">Calcular</button>

      {result && (
        <div key={result.value}>
          <ResultBox label={result.label} value={`${result.value.toFixed(4)} ${fieldLabels[incognita].unit}`} />
          <button onClick={() => setShowSteps(!showSteps)} className="border border-input bg-background text-foreground font-heading text-sm uppercase tracking-wider px-6 py-2 cursor-pointer mb-4">
            {showSteps ? "Ocultar" : "Mostrar"} Memorial de Cálculo
          </button>
          {showSteps && <StepByStep steps={result.steps} />}
        </div>
      )}

      <div className="mt-12 border-t border-border pt-8 space-y-4">
        <h2 className="text-xl font-heading font-bold text-foreground tracking-tight">
          A Equação de Bernoulli e a Conservação de Energia nos Fluidos
        </h2>
        <p className="text-sm font-body text-muted-foreground leading-relaxed">
          A Equação de Bernoulli é uma das formulações mais vitais na engenharia para descrever o comportamento dinâmico de fluidos. Ela é a expressão matemática direta do princípio da conservação da energia mecânica aplicada aos fluidos ideais.
        </p>
        <p className="text-sm font-body text-muted-foreground leading-relaxed">
          Na prática de projeto, o Teorema de Bernoulli explica fenómenos críticos, como a queda de pressão em um estreitamento de tubo (Efeito Venturi) ou o funcionamento de tubos de Pitot para medição de velocidade aerodinâmica.
        </p>
      </div>
    </CalculatorLayout>
  );
}

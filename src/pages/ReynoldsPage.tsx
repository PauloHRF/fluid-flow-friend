import { useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { InputField } from "@/components/InputField";
import { ResultBox } from "@/components/ResultBox";
import { StepByStep } from "@/components/StepByStep";

function classifyReynolds(re: number): string {
  if (re < 2300) return "Escoamento Laminar";
  if (re < 4000) return "Transição";
  return "Escoamento Turbulento";
}

export default function ReynoldsPage() {
  const [rho, setRho] = useState("");
  const [v, setV] = useState("");
  const [d, setD] = useState("");
  const [mu, setMu] = useState("");
  const [result, setResult] = useState<{ re: number; classification: string; steps: any[] } | null>(null);

  const calculate = () => {
    const density = parseFloat(rho);
    const velocity = parseFloat(v);
    const diameter = parseFloat(d);
    const viscosity = parseFloat(mu);

    if ([density, velocity, diameter, viscosity].some(isNaN) || viscosity === 0) return;

    const re = (density * velocity * diameter) / viscosity;
    const classification = classifyReynolds(re);

    setResult({
      re,
      classification,
      steps: [
        {
          label: "Fórmula",
          formula: "Re = (ρ × v × D) / μ",
          result: "Número de Reynolds é a razão entre forças inerciais e viscosas.",
        },
        {
          label: "Substituição",
          formula: `Re = (${density} × ${velocity} × ${diameter}) / ${viscosity}`,
          result: `Re = ${(density * velocity * diameter).toFixed(4)} / ${viscosity}`,
        },
        {
          label: "Resultado",
          result: `Re = ${re.toFixed(2)}`,
        },
        {
          label: "Classificação",
          result: `Re < 2300 → Laminar | 2300 ≤ Re < 4000 → Transição | Re ≥ 4000 → Turbulento`,
        },
        {
          label: "Laudo",
          result: `Com Re = ${re.toFixed(2)}, o escoamento é classificado como: ${classification}`,
        },
      ],
    });
  };

  return (
    <CalculatorLayout title="Calculadora de Reynolds">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <InputField label="Densidade (ρ)" unit="kg/m³" value={rho} onChange={setRho} />
        <InputField label="Velocidade (v)" unit="m/s" value={v} onChange={setV} />
        <InputField label="Diâmetro (D)" unit="m" value={d} onChange={setD} />
        <InputField label="Viscosidade (μ)" unit="Pa·s" value={mu} onChange={setMu} />
      </div>

      <button
        onClick={calculate}
        className="bg-primary text-primary-foreground font-heading text-sm uppercase tracking-wider px-8 py-3 border-none cursor-pointer mb-8"
      >
        Calcular
      </button>

      {result && (
        <div key={result.re}>
          <ResultBox
            label="Número de Reynolds"
            value={result.re.toFixed(2)}
            classification={result.classification}
          />
          <StepByStep steps={result.steps} />
        </div>
      )}
    </CalculatorLayout>
  );
}

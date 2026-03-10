import { useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { InputField } from "@/components/InputField";
import { ResultBox } from "@/components/ResultBox";
import { StepByStep } from "@/components/StepByStep";

export default function DarcyWeisbachPage() {
  const [f, setF] = useState("");
  const [L, setL] = useState("");
  const [D, setD] = useState("");
  const [v, setV] = useState("");
  const [epsilon, setEpsilon] = useState("");
  const [rho, setRho] = useState("1000");
  const [mu, setMu] = useState("0.001");

  const [result, setResult] = useState<{ hf: number; friction: number; re: number; steps: any[] } | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  const g = 9.81;

  const calculate = () => {
    const fVal = parseFloat(f);
    const length = parseFloat(L);
    const diameter = parseFloat(D);
    const velocity = parseFloat(v);
    const roughness = parseFloat(epsilon);
    const density = parseFloat(rho);
    const viscosity = parseFloat(mu);

    if ([length, diameter, velocity, roughness, density, viscosity].some(isNaN) || diameter === 0 || viscosity === 0) return;

    const re = (density * velocity * diameter) / viscosity;
    const relRoughness = roughness / diameter;

    let friction: number;
    if (!isNaN(fVal) && fVal > 0) {
      friction = fVal;
    } else {
      if (re < 2300) {
        friction = 64 / re;
      } else {
        const A = relRoughness / 3.7;
        const B = 5.74 / Math.pow(re, 0.9);
        friction = 0.25 / Math.pow(Math.log10(A + B), 2);
      }
    }

    const hf = friction * (length / diameter) * (velocity ** 2) / (2 * g);

    const steps = [
      { label: "Número de Reynolds", formula: "Re = (ρ × v × D) / μ", result: `Re = (${density} × ${velocity} × ${diameter}) / ${viscosity} = ${re.toFixed(2)}` },
      { label: "Rugosidade Relativa", formula: "ε/D", result: `ε/D = ${roughness} / ${diameter} = ${relRoughness.toFixed(6)}` },
      { label: "Fator de Atrito (f)", formula: re < 2300 ? "f = 64 / Re (laminar)" : "Aprox. Swamee-Jain", result: !isNaN(fVal) && fVal > 0 ? `f = ${friction.toFixed(6)} (fornecido)` : `f = ${friction.toFixed(6)} (calculado)` },
      { label: "Equação de Darcy-Weisbach", formula: "hf = f × (L/D) × (v²/2g)", result: `hf = ${friction.toFixed(6)} × (${length}/${diameter}) × (${velocity}²/(2×${g}))` },
      { label: "Resultado Final", result: `hf = ${hf.toFixed(4)} m` },
    ];

    setResult({ hf, friction, re, steps });
    setShowSteps(false);
  };

  return (
    <CalculatorLayout title="Perda de Carga — Darcy-Weisbach">
      <p className="text-xs font-body text-muted-foreground mb-4">Deixe o fator de atrito (f) em branco para cálculo automático via Swamee-Jain.</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <InputField label="Fator de Atrito (f)" unit="adimensional" value={f} onChange={setF} />
        <InputField label="Comprimento (L)" unit="m" value={L} onChange={setL} />
        <InputField label="Diâmetro (D)" unit="m" value={D} onChange={setD} />
        <InputField label="Velocidade (v)" unit="m/s" value={v} onChange={setV} />
        <InputField label="Rugosidade (ε)" unit="m" value={epsilon} onChange={setEpsilon} />
        <InputField label="Densidade (ρ)" unit="kg/m³" value={rho} onChange={setRho} />
        <InputField label="Viscosidade (μ)" unit="Pa·s" value={mu} onChange={setMu} />
      </div>

      <button onClick={calculate} className="bg-primary text-primary-foreground font-heading text-sm uppercase tracking-wider px-8 py-3 border-none cursor-pointer mb-8">Calcular</button>

      {result && (
        <div key={result.hf}>
          <ResultBox label="Perda de Carga (hf)" value={`${result.hf.toFixed(4)} m`} />
          <ResultBox label="Fator de Atrito (f)" value={result.friction.toFixed(6)} />
          <button onClick={() => setShowSteps(!showSteps)} className="border border-foreground bg-background text-foreground font-heading text-sm uppercase tracking-wider px-6 py-2 cursor-pointer mb-4">
            {showSteps ? "Ocultar" : "Mostrar"} Memorial de Cálculo
          </button>
          {showSteps && <StepByStep steps={result.steps} />}
        </div>
      )}
    </CalculatorLayout>
  );
}

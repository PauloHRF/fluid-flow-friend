import { useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { InputField } from "@/components/InputField";
import { ResultBox } from "@/components/ResultBox";
import { StepByStep } from "@/components/StepByStep";
import { FluidPresets } from "@/components/FluidPresets";

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ re: number; classification: string; steps: any[] } | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!rho || isNaN(parseFloat(rho))) e.rho = "Campo obrigatório";
    if (!v || isNaN(parseFloat(v))) e.v = "Campo obrigatório";
    if (!d || isNaN(parseFloat(d))) e.d = "Campo obrigatório";
    if (!mu || isNaN(parseFloat(mu)) || parseFloat(mu) === 0) e.mu = "Deve ser > 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const calculate = () => {
    if (!validate()) return;
    const density = parseFloat(rho);
    const velocity = parseFloat(v);
    const diameter = parseFloat(d);
    const viscosity = parseFloat(mu);

    const re = (density * velocity * diameter) / viscosity;
    const classification = classifyReynolds(re);

    setResult({
      re,
      classification,
      steps: [
        { label: "Fórmula", formula: "Re = (ρ × v × D) / μ", result: "Número de Reynolds é a razão entre forças inerciais e viscosas." },
        { label: "Substituição", formula: `Re = (${density} × ${velocity} × ${diameter}) / ${viscosity}`, result: `Re = ${(density * velocity * diameter).toFixed(4)} / ${viscosity}` },
        { label: "Resultado", result: `Re = ${re.toFixed(2)}` },
        { label: "Classificação", result: `Re < 2300 → Laminar | 2300 ≤ Re < 4000 → Transição | Re ≥ 4000 → Turbulento` },
        { label: "Laudo", result: `Com Re = ${re.toFixed(2)}, o escoamento é classificado como: ${classification}` },
      ],
    });
    setShowSteps(false);
  };

  return (
    <CalculatorLayout title="Calculadora de Reynolds" metaDescription="Calcule o Número de Reynolds e identifique o regime de escoamento (laminar, transição ou turbulento) com memorial de cálculo passo a passo.">
      <FluidPresets onSelect={(r, m) => { setRho(r); setMu(m); }} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <InputField label="Densidade (ρ)" unit="kg/m³" value={rho} onChange={(v) => { setRho(v); setErrors((e) => ({ ...e, rho: "" })); }} error={errors.rho} />
        <InputField label="Velocidade (v)" unit="m/s" value={v} onChange={(v2) => { setV(v2); setErrors((e) => ({ ...e, v: "" })); }} error={errors.v} />
        <InputField label="Diâmetro (D)" unit="m" value={d} onChange={(v3) => { setD(v3); setErrors((e) => ({ ...e, d: "" })); }} error={errors.d} />
        <InputField label="Viscosidade (μ)" unit="Pa·s" value={mu} onChange={(v4) => { setMu(v4); setErrors((e) => ({ ...e, mu: "" })); }} error={errors.mu} />
      </div>

      <button onClick={calculate} className="bg-primary text-primary-foreground font-heading text-sm uppercase tracking-wider px-8 py-3 border-none cursor-pointer mb-8">
        Calcular
      </button>

      {result && (
        <div key={result.re}>
          <ResultBox label="Número de Reynolds" value={result.re.toFixed(2)} classification={result.classification} />
          <button onClick={() => setShowSteps(!showSteps)} className="border border-input bg-background text-foreground font-heading text-sm uppercase tracking-wider px-6 py-2 cursor-pointer mb-4">
            {showSteps ? "Ocultar" : "Mostrar"} Memorial de Cálculo
          </button>
          {showSteps && <StepByStep steps={result.steps} />}
        </div>
      )}

      <div className="mt-12 border-t border-border pt-8 space-y-4">
        <h2 className="text-xl font-heading font-bold text-foreground tracking-tight">
          Entendendo o Número de Reynolds e os Regimes de Escoamento
        </h2>
        <p className="text-sm font-body text-muted-foreground leading-relaxed">
          O Número de Reynolds (Re) é um parâmetro adimensional fundamental na mecânica dos fluidos, utilizado para prever o padrão de escoamento de um fluido dentro de uma tubulação. Ele relaciona as forças inerciais com as forças viscosas do sistema. Quando as forças viscosas dominam (baixo Reynolds, geralmente Re &lt; 2000), o escoamento é classificado como <strong className="text-foreground">Laminar</strong>, caracterizado por um movimento suave e em camadas. Quando as forças inerciais predominam (alto Reynolds, Re &gt; 4000), o escoamento torna-se <strong className="text-foreground">Turbulento</strong>, marcado por flutuações caóticas e mistura intensa.
        </p>
        <p className="text-sm font-body text-muted-foreground leading-relaxed">
          A zona entre esses dois estados é conhecida como regime de transição. Na engenharia prática, calcular o Número de Reynolds é o passo obrigatório antes de dimensionar qualquer rede de tubulações, pois o fator de atrito e a perda de energia do sistema dependem inteiramente do regime de escoamento em que o fluido se encontra.
        </p>
      </div>
    </CalculatorLayout>
  );
}
